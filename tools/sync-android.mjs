import {cpSync,mkdirSync} from 'node:fs';import path from 'node:path';
const target='android/app/build/fitbox-v4-assets';mkdirSync(target,{recursive:true});
cpSync('web',target,{recursive:true,filter:p=>{const r=path.relative('web',p).replaceAll('\\','/');if(r==='downloads'||r.startsWith('downloads/'))return false;if(r.startsWith('assets/'))return r==='assets/design'||r.startsWith('assets/design/');return true;}});
console.log('Bundled current app and design assets; legacy supplied artwork excluded.');
