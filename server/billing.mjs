import {stripe,PLANS,billingReady,planForPrice} from './stripe.mjs';
import {pool} from './db.mjs';
import {baseURL} from './env.mjs';
const id=x=>typeof x==='string'?x:x?.id;
export async function reconcileSubscription(subscriptionId,client=pool){
  // Retrieve current provider state so delayed/out-of-order events cannot restore stale access.
  const sub=await stripe.subscriptions.retrieve(subscriptionId,{expand:['latest_invoice']});
  if(sub.livemode||sub.metadata.app!=='fitbox')return;
  const userId=sub.metadata.fitbox_user_id,customer=id(sub.customer);
  if(!userId||!customer)return;
  const owner=await client.query('SELECT customer_id,subscription_id FROM fitbox_subscriptions WHERE user_id=$1 FOR UPDATE',[userId]);
  if(owner.rows[0]?.customer_id!==customer)return;
  if(owner.rows[0].subscription_id&&owner.rows[0].subscription_id!==sub.id)return;
  const item=sub.items.data[0],plan=planForPrice(item?.price.id);
  const end=item?.current_period_end||0;
  const paid=sub.latest_invoice?.status==='paid';
  const status=sub.status==='active'&&!paid?'payment_pending':sub.status;
  const entitled=!!plan&&status==='active'&&end*1000>Date.now();
  await client.query('UPDATE fitbox_subscriptions SET subscription_id=$2,tier=$3,status=$4,period_end=$5,cancel_at_period_end=$6,updated_at=now() WHERE user_id=$1',[userId,sub.id,entitled?plan.id:'free',status,end?new Date(end*1000):null,!!sub.cancel_at_period_end]);
}
export function publicBilling(app){
  app.get('/api/billing/plans',c=>c.json({sandbox:true,configured:billingReady(),plans:PLANS.map(({env,...p})=>({...p,currency:'usd'}))}));
  app.post('/api/billing/webhook',async c=>{
    if(!billingReady()||!pool)return c.json({error:'Sandbox billing is unavailable'},503);
    const raw=await c.req.text();if(Buffer.byteLength(raw)>131072)return c.json({error:'Payload too large'},413);
    let event;try{event=stripe.webhooks.constructEvent(raw,c.req.header('stripe-signature')||'',process.env.STRIPE_WEBHOOK_SECRET);}catch{return c.json({error:'Invalid webhook signature'},400);}
    if(event.livemode)return c.json({error:'Live events are unsupported'},400);
    const client=await pool.connect();
    try{await client.query('BEGIN');const inserted=await client.query('INSERT INTO fitbox_webhook_events(event_id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',[event.id,event.type]);
      if(inserted.rowCount){const object=event.data.object;let subscription;
        if(event.type.startsWith('customer.subscription.'))subscription=object.id;
        else if(event.type==='checkout.session.completed')subscription=id(object.subscription);
        else if(event.type.startsWith('invoice.'))subscription=id(object.parent?.subscription_details?.subscription)||id(object.subscription);
        if(subscription)await reconcileSubscription(subscription,client);
      }
      await client.query('COMMIT');return c.json({received:true});
    }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
  });
}
export function privateBilling(app,limit){
  app.get('/api/billing/status',async c=>{
    await limit(c,'billing-read',30);const userId=c.get('user').id;
    const saved=await pool.query('SELECT subscription_id FROM fitbox_subscriptions WHERE user_id=$1',[userId]);
    if(billingReady()&&saved.rows[0]?.subscription_id){const client=await pool.connect();try{await client.query('BEGIN');await reconcileSubscription(saved.rows[0].subscription_id,client);await client.query('COMMIT');}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}}
    const result=await pool.query('SELECT tier,status,period_end,cancel_at_period_end FROM fitbox_subscriptions WHERE user_id=$1',[userId]);
    const state=result.rows[0]||{tier:'free',status:'inactive',cancel_at_period_end:false};
    return c.json({...state,entitled:PLANS.some(p=>p.id===state.tier)&&state.status==='active'&&new Date(state.period_end)>new Date(),sandbox:true,configured:billingReady()});
  });
  app.post('/api/billing/checkout',async c=>{
    if(!billingReady())return c.json({error:'Stripe sandbox is not ready. No payment was taken.'},503);
    await limit(c,'checkout',6,3600);const body=await c.req.json();
    if(Object.keys(body).some(k=>k!=='planId'))return c.json({error:'Only a plan ID is accepted'},400);
    const plan=PLANS.find(p=>p.id===body.planId);if(!plan)return c.json({error:'Unknown plan'},400);
    const user=c.get('user'),client=await pool.connect();let customer,session;
    try{await client.query('BEGIN');await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['billing:'+user.id]);
      let saved=(await client.query('SELECT * FROM fitbox_subscriptions WHERE user_id=$1 FOR UPDATE',[user.id])).rows[0];
      if(saved?.checkout_id&&new Date(saved.checkout_expires)>new Date()){
        const pending=await stripe.checkout.sessions.retrieve(saved.checkout_id);
        if(pending.status==='open'&&saved.checkout_plan===plan.id){await client.query('COMMIT');return c.json({url:pending.url,sandbox:true});}
        if(pending.status==='open')await stripe.checkout.sessions.expire(pending.id);
        if(pending.status==='complete'&&id(pending.subscription)){await client.query('UPDATE fitbox_subscriptions SET subscription_id=$2 WHERE user_id=$1',[user.id,id(pending.subscription)]);await client.query('COMMIT');return c.json({error:'A checkout just completed. Refresh membership status before starting another.'},409);}
      }
      if(saved?.subscription_id){const active=await stripe.subscriptions.retrieve(saved.subscription_id);if(!['canceled','incomplete_expired'].includes(active.status))return await (async()=>{await client.query('ROLLBACK');return c.json({error:'Manage or cancel the existing subscription before choosing another plan.'},409);})();}
      customer=saved?.customer_id;
      if(!customer){const created=await stripe.customers.create({email:user.email,name:user.name,metadata:{app:'fitbox',fitbox_user_id:user.id}},{idempotencyKey:'fitbox-customer-'+user.id});customer=created.id;await client.query('INSERT INTO fitbox_subscriptions(user_id,customer_id) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET customer_id=$2',[user.id,customer]);}
      await client.query('UPDATE fitbox_subscriptions SET subscription_id=NULL WHERE user_id=$1',[user.id]);
      session=await stripe.checkout.sessions.create({mode:'subscription',customer,client_reference_id:user.id,line_items:[{price:process.env[plan.env],quantity:1}],subscription_data:{metadata:{app:'fitbox',fitbox_user_id:user.id,tier:plan.id}},metadata:{app:'fitbox',fitbox_user_id:user.id,tier:plan.id},success_url:baseURL+'/?billing=return',cancel_url:baseURL+'/?billing=cancelled',expires_at:Math.floor(Date.now()/1000)+1800});
      await client.query('UPDATE fitbox_subscriptions SET checkout_id=$2,checkout_expires=$3,checkout_plan=$4 WHERE user_id=$1',[user.id,session.id,new Date(session.expires_at*1000),plan.id]);await client.query('COMMIT');
    }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
    return c.json({url:session.url,sandbox:true});
  });
  app.post('/api/billing/portal',async c=>{
    if(!billingReady()||!process.env.STRIPE_PORTAL_CONFIG)return c.json({error:'Billing management is unavailable'},503);
    await limit(c,'portal',10,3600);const saved=await pool.query('SELECT customer_id FROM fitbox_subscriptions WHERE user_id=$1',[c.get('user').id]);
    if(!saved.rows[0]?.customer_id)return c.json({error:'Start a sandbox plan first'},400);
    const portal=await stripe.billingPortal.sessions.create({customer:saved.rows[0].customer_id,configuration:process.env.STRIPE_PORTAL_CONFIG,return_url:baseURL+'/?billing=return'});
    return c.json({url:portal.url,sandbox:true});
  });
}
