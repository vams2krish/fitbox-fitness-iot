import fs from 'node:fs';
const target='web/vendor/three';fs.mkdirSync(target,{recursive:true});
for(const name of ['three.module.js','three.core.js'])fs.copyFileSync('node_modules/three/build/'+name,target+'/'+name);
fs.copyFileSync('node_modules/three/LICENSE',target+'/LICENSE');
const pkg=JSON.parse(fs.readFileSync('node_modules/three/package.json'));fs.writeFileSync(target+'/manifest.json',JSON.stringify({package:'three',version:pkg.version,license:'MIT',source:'https://www.npmjs.com/package/three',use:'Locally bundled WebGL renderer for the procedural 3D reference avatar'},null,2)+'\n');
console.log('Bundled Three.js '+pkg.version+' and MIT license');
