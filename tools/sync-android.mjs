import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('android/app/src/main/assets',{recursive:true});
cpSync('web','android/app/src/main/assets',{recursive:true,filter:p=>!p.includes('downloads')});
console.log('Copied offline web app into Android assets');
