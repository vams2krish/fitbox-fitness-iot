import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const cache=path.join(process.env.LOCALAPPDATA,'npm-cache','_npx');let cli;
for(const entry of fs.readdirSync(cache)){const p=path.join(cache,entry,'node_modules','vercel','package.json');if(fs.existsSync(p)){const pkg=JSON.parse(fs.readFileSync(p));if(pkg.version==='65.17.0'){cli=path.resolve(path.dirname(p),pkg.bin.vercel);break;}}}
if(!cli)throw Error('Vercel CLI unavailable');
const child=spawnSync(process.execPath,[cli,'env','ls','--json'],{encoding:'utf8',env:{...process.env,VERCEL_CLI_USE_NATIVE_BINARY:'0'}});if(child.status!==0){console.log('Remote environment inspection unavailable');process.exit(1);}let data;try{data=JSON.parse(child.stdout);}catch{console.log('Remote environment inspection returned non-JSON');process.exit(1);}
const names=new Set();function walk(x){if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){for(const key of ['key','name'])if(typeof x[key]==='string'&&/^[A-Z_][A-Z0-9_]+$/.test(x[key]))names.add(x[key]);for(const [k,v]of Object.entries(x))if(k!=='value'&&typeof v==='object')walk(v);}}
walk(data);for(const name of ['DATABASE_URL','BETTER_AUTH_SECRET','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','RESEND_API_KEY','RESEND_FROM'])console.log(name+': '+(names.has(name)?'configured':'not configured'));
