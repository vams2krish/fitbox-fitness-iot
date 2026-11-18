import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {getRequestListener} from '@hono/node-server';
import {app} from '../server/app.mjs';
const root=path.resolve('web');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.wasm':'application/wasm','.task':'application/octet-stream','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.apk':'application/vnd.android.package-archive','.json':'application/json'};
const api=getRequestListener(app.fetch);
http.createServer((req,res)=>{if(req.url.startsWith('/api/')){api(req,res);return;}let p;try{p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');fs.readFile(p,(err,b)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});res.end(b);});}).listen(4173,'127.0.0.1',()=>console.log('FitBox: http://127.0.0.1:4173'));
