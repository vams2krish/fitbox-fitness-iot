import './env.mjs';
import Stripe from 'stripe';
const key=process.env.STRIPE_SECRET_KEY||'';
// Live credentials are deliberately unsupported in this testing app.
export const stripe=/^(sk|rk)_test_/.test(key)?new Stripe(key,{maxNetworkRetries:2,timeout:20000}):null;
export const PLANS=[
  {id:'starter',name:'Starter',months:3,amount:2099,env:'STRIPE_PRICE_STARTER',tag:'Start your routine'},
  {id:'plus',name:'Plus',months:6,amount:3699,env:'STRIPE_PRICE_PLUS',tag:'Keep the momentum'},
  {id:'pro',name:'Pro',months:12,amount:6099,env:'STRIPE_PRICE_PRO',tag:'Commit to your pace'}
];
export const billingReady=()=>!!(stripe&&process.env.STRIPE_WEBHOOK_SECRET&&PLANS.every(p=>process.env[p.env]));
export const planForPrice=id=>PLANS.find(p=>process.env[p.env]===id);
