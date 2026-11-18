import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const sdk=process.env.ANDROID_HOME||path.join(process.env.LOCALAPPDATA,'Android','Sdk');
const adb=path.join(sdk,'platform-tools','adb.exe');
const run=(...args)=>execFileSync(adb,['-s','emulator-5554',...args],{encoding:'utf8',timeout:30000}).trim();
assert.equal(run('shell','getprop','ro.kernel.qemu'),'1','Run only on the camera-emulated test device');
if(!process.env.FITBOX_ANDROID_REUSE){run('install','-r','android/app/build/outputs/apk/debug/app-debug.apk');run('shell','am','force-stop','com.fitbox.app');}
run('shell','pm','grant','com.fitbox.app','android.permission.CAMERA');
run('shell','am','start','-n','com.fitbox.app/.MainActivity');
const until=Date.now()+30000;let pid;
while(Date.now()<until&&!pid){try{pid=run('shell','pidof','com.fitbox.app');}catch{}if(!pid)await new Promise(r=>setTimeout(r,500));}
assert.ok(pid,'FitBox process did not start');
run('forward','tcp:9223','localabstract:webview_devtools_remote_'+pid);
let browser;
try {
  const readyBy=Date.now()+90000;let lastError;
  while(Date.now()<readyBy&&!browser){try{browser=await chromium.connectOverCDP('http://127.0.0.1:9223',{timeout:5000});}catch(error){lastError=error;await new Promise(r=>setTimeout(r,500));}}
  if(!browser)throw lastError;
  console.log('Connected to FitBox Android WebView');
  const page=browser.contexts()[0].pages()[0];page.setDefaultTimeout(30000);
  await page.waitForURL('https://fitbox-fitness-iot.vercel.app/app-assets/index.html');
  console.log('Secure asset origin loaded');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(await page.locator('[data-action="demo"]').count())await page.locator('[data-action="demo"]').click();
  await page.locator('[data-feature="open:camera-catalog"]').first().click();
  await page.locator('[data-feature="pose:squats"]').click();
  assert.equal(await page.evaluate(()=>window.isSecureContext),true);
  await page.locator('[data-feature="camera-start"]').click();
  console.log('Initializing bundled Android CPU model and emulated camera');
  await page.waitForFunction(()=>document.querySelector('#camera-start')?.textContent==='Camera enabled',null,{timeout:120000});
  await page.waitForFunction(()=>document.querySelector('#pose-confidence')?.textContent!=='—',null,{timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#pose-count')?.textContent==='0');
  assert.equal(await page.evaluate(()=>document.querySelector('#pose-video').srcObject.getVideoTracks()[0].readyState),'live');
  await page.locator('[data-feature="camera-pause"]').click();
  assert.equal(await page.locator('#pose-status').innerText(),'Paused');
  fs.writeFileSync('docs/screenshots/26-android-v2.png',execFileSync(adb,['-s','emulator-5554','exec-out','screencap','-p']));
  await page.locator('[data-feature="home"]').click();
  await page.locator('[data-feature="discard-camera"]').click();
  assert.equal(await page.locator('#pose-video').count(),0);
  await page.locator('[data-feature="home"]').click();await page.screenshot({path:'docs/screenshots/40-android-task-center.png',fullPage:true});
  await page.locator('[data-journey="open:checkup"]').first().click();await page.locator('[data-journey="open:checkup-3d"]').click();await page.waitForFunction(()=>document.querySelector('#body-stage')?.dataset.renderer==='webgl',null,{timeout:90000});await page.locator('[data-journey="body:back"]').click();assert.equal(await page.locator('#body-stage').getAttribute('data-yaw'),'3.142');await page.screenshot({path:'docs/screenshots/41-android-3d-checkup.png',fullPage:true});await page.locator('[data-journey="home"]').first().click();
  assert.deepEqual(errors,[]);
  const historyCount=await page.evaluate(()=>FitBoxApp.state.sessions.length);await page.locator('[data-action="nav:profile"]').first().click();await page.locator('[data-journey="replay"]').click();await page.locator('[data-ftue="trainer:Tina"]').click();await page.locator('[data-ftue="next:ftue-activities"]').click();if(await page.locator('[data-ftue="activity:Muscle Exercise"]').getAttribute('aria-pressed')!=='true')await page.locator('[data-ftue="activity:Muscle Exercise"]').click();await page.locator('[data-ftue="next:ftue-account"]').click();await page.locator('[name="name"]').fill('Android Demo');await page.locator('[name="email"]').fill('android-demo@example.com');await page.screenshot({path:'docs/screenshots/45-android-ftue-account-email.png',fullPage:true});await page.locator('#ftue-account-form button').click();await page.locator('[data-ftue="skip"]').click();await page.locator('[data-ftue="body:Lean"]').click();await page.locator('[data-ftue="next:ftue-goal"]').click();await page.locator('[data-ftue="desired:Fit"]').click();await page.locator('[data-ftue="finish"]').click();await page.locator('[data-journey="tour-skip"]').click();assert.equal(await page.evaluate(()=>FitBoxApp.state.profile.reportEmail),'android-demo@example.com');assert.equal(await page.evaluate(()=>FitBoxApp.state.sessions.length),historyCount);
  console.log('PASS: installed APK, secure bundled origin, actual native camera/model, pause/disposal, real 3D front/back interaction, replayed FTUE and report-email capture without history loss. No physical exercise accuracy claim.');
}finally{await browser?.close().catch(()=>{});try{run('forward','--remove','tcp:9223');}catch{}}
