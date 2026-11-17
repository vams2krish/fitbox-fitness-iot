import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root='node_modules/@mediapipe/tasks-vision';const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
fs.mkdirSync('web/vendor/mediapipe/wasm',{recursive:true});
fs.copyFileSync(path.join(root,'vision_bundle.mjs'),'web/vendor/mediapipe/vision_bundle.mjs');
for(const name of fs.readdirSync(path.join(root,'wasm')))if(/\.(js|wasm)$/.test(name))fs.copyFileSync(path.join(root,'wasm',name),path.join('web/vendor/mediapipe/wasm',name));
const model=fs.readFileSync('web/models/pose_landmarker_lite.task');const digest=crypto.createHash('sha256').update(model).digest('hex');
if(digest!=='59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a')throw Error('Model checksum mismatch');
fs.writeFileSync('web/models/manifest.json',JSON.stringify({name:'MediaPipe Pose Landmarker Lite',format:'TFLite task bundle',source:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',version:'float16/1',runtime:pkg.version,sha256:digest,inference:'on-device',videoUpload:false},null,2)+'\n');
console.log('Verified model and vendored MediaPipe runtime '+pkg.version);
