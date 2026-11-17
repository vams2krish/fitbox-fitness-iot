// Creates a server authentication secret without printing it; sends it via stdin.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
if(fs.existsSync('.env.local'))process.loadEnvFile('.env.local');
const secret=process.env.BETTER_AUTH_SECRET||crypto.randomBytes(48).toString('base64url');
let text=fs.existsSync('.env.local')?fs.readFileSync('.env.local','utf8'):'';
if(!process.env.BETTER_AUTH_SECRET){text+='\nBETTER_AUTH_SECRET='+secret+'\n';fs.writeFileSync('.env.local',text);}
const cache=path.join(process.env.LOCALAPPDATA,'npm-cache','_npx');let cli;
for(const entry of fs.readdirSync(cache)){const pkg=path.join(cache,entry,'node_modules','vercel','package.json');if(fs.existsSync(pkg)){const data=JSON.parse(fs.readFileSync(pkg));if(data.version==='65.17.0'){cli=path.resolve(path.dirname(pkg),data.bin.vercel);break;}}}
if(!cli)throw Error('Run npx vercel@latest --version first to install the CLI');
function run(args,input){return new Promise((resolve,reject)=>{const childEnv={...process.env};delete childEnv.VERCEL_OIDC_TOKEN;const child=spawn(process.execPath,[cli,...args],{env:childEnv,stdio:['pipe','ignore','pipe']});let error='';child.stderr.on('data',chunk=>{error+=chunk;});child.on('close',code=>code===0?resolve():reject(new Error(error.replaceAll(secret,'[REDACTED]'))));child.stdin.end(input);});}
for(const target of ['production','preview','development']){await run(['env','add','BETTER_AUTH_SECRET','--environment',target,'--force','--yes','--type',target==='development'?'config':'secret'],secret+'\n');console.log('Configured server authentication secret for '+target);}
