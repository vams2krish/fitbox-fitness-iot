import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const click=action=>page.locator(`[data-action="${action}"]`).first().click();
async function checkImages(){await page.waitForFunction(()=>[...document.images].every(i=>i.complete));const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.naturalWidth).map(i=>i.src));assert.deepEqual(broken,[]);}
async function shot(name){await page.waitForTimeout(180);await checkImages();await page.screenshot({path:`docs/screenshots/${name}.png`,fullPage:false});}
await page.goto('http://127.0.0.1:4173');await shot('01-welcome');
await click('get-started');await page.locator('#name').fill('Alex');await page.getByRole('button',{name:'Continue →',exact:true}).click();await shot('02-onboarding');
for(const value of ['Stay fit','Beginner','15–30 mins','3 times a week'])await click('answer:'+value);
await shot('03-activity-selection');await click('finish-onboarding');await shot('04-home-front');
await click('side:back');await shot('05-home-back');await click('side:front');
await click('nav:insights');assert.match(await page.locator('main').innerText(),/Your progress starts/);
await click('nav:home');await click('start:pushups');assert.ok(await page.locator('[data-action="add-rep"]').isDisabled());await click('toggle-timer');
for(let i=0;i<5;i++)await click('add-rep');
await click('undo-rep');assert.equal(await page.locator('#count').innerText(),'4');await click('add-rep');
await page.waitForTimeout(1150);await click('toggle-timer');const paused=await page.locator('#elapsed').innerText();await page.waitForTimeout(1100);assert.equal(await page.locator('#elapsed').innerText(),paused);await shot('06-workout');
await click('finish-session');await shot('07-session-saved');await click('claim-result:pushups');
assert.equal(await page.locator('[data-action="claimed"]').count(),1);await page.reload();assert.equal(await page.locator('[data-action="claimed"]').count(),1);
await click('nav:insights');await shot('08-insights');assert.match(await page.locator('main').innerText(),/Pushups/);
await click('nav:guides');await shot('09-exercise-guides');await click('guide:crunches');await shot('10-exercise-detail');
await click('back');await click('nav:profile');await shot('11-profile');
await click('device');await shot('12-device-status');await click('close-modal');
await click('rest');await click('rest-on');await shot('13-rest-day');await click('rest-off');
await click('nav:profile');const downloadPromise=page.waitForEvent('download');await click('export');const download=await downloadPromise;const exportPath=await download.path();const exported=JSON.parse(fs.readFileSync(exportPath,'utf8'));assert.equal(exported.sessions.length,1);assert.equal(exported.claims[0].xp,25);
await click('nav:guides');await click('guide:meditation');await click('start:meditation');await click('toggle-timer');await page.waitForTimeout(1250);await click('finish-session');assert.match(await page.locator('main').innerText(),/Every rep matters/);await click('nav:home');
for(const width of [320,375,480]){await page.setViewportSize({width,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);await checkImages();}
await page.setViewportSize({width:1440,height:1000});await shot('14-desktop-preview');
await page.setViewportSize({width:390,height:844});await click('nav:profile');await click('reset');await click('close-modal');assert.equal(await page.locator('.profile-head h1').innerText(),'Alex');
await click('reset');await click('confirm-reset');assert.equal(await page.locator('.welcome').count(),1);await page.reload();assert.equal(await page.locator('.welcome').count(),1);
assert.deepEqual(errors,[]);console.log('PASS: onboarding, layouts, all images, reps, undo, timer pause, sessions, rewards, persistence, insights, guides, rest, export, timed sessions, reset; 14 screenshots captured.');
await browser.close();
