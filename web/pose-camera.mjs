import {FilesetResolver,PoseLandmarker} from './vendor/mediapipe/vision_bundle.mjs';
const connections=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],[27,29],[29,31],[28,30],[30,32]];
let pendingModel;
async function loadModel(){
  if(!pendingModel)pendingModel=(async()=>{
    const vision=await FilesetResolver.forVisionTasks(new URL('./vendor/mediapipe/wasm',import.meta.url).href);
    const base={modelAssetPath:new URL('./models/pose_landmarker_lite.task',import.meta.url).href};
    const options={runningMode:'VIDEO',numPoses:2,minPoseDetectionConfidence:.65,minPosePresenceConfidence:.65,minTrackingConfidence:.65,outputSegmentationMasks:false};
    // Android WebView GPU drivers vary; use the bundled CPU WASM path there.
    if(/Android/i.test(navigator.userAgent))return PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{...base,delegate:'CPU'}});
    try{return await PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{...base,delegate:'GPU'}});}
    catch{return PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{...base,delegate:'CPU'}});}
  })().catch(e=>{pendingModel=null;throw e;});
  return pendingModel;
}
export class PoseCamera {
  constructor({video,canvas,exercise,onResult,onError,onStatus}){Object.assign(this,{video,canvas,onResult,onError,onStatus});this.tracker=new FitBoxPose.Tracker(exercise);this.disposed=false;this.running=false;this.stream=null;this.raf=null;this.lastFrame=-1;this.lastInfer=-Infinity;this.activeMs=0;this.started=0;this.facing='user';this.epoch=0;this.devices=[];}
  async start({facing=this.facing,deviceId=null}={}){
    const epoch=++this.epoch;this.disposed=false;this.facing=facing;this.onStatus?.('Preparing on-device model…');
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access needs HTTPS or localhost and a supported browser.');
    try{
      this.model=await loadModel();if(epoch!==this.epoch||this.disposed)return;
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:deviceId?{deviceId:{exact:deviceId},width:{ideal:640},height:{ideal:480}}:{facingMode:{ideal:facing},width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:20}}});
      if(epoch!==this.epoch||this.disposed){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;this.video.srcObject=stream;this.video.muted=true;this.video.playsInline=true;await this.video.play();this.video.classList.add('camera-live');
      if(epoch!==this.epoch||this.disposed){stream.getTracks().forEach(t=>t.stop());return;}
      this.devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
      const settings=stream.getVideoTracks()[0].getSettings();this.mirror=settings.facingMode==='user'||(!settings.facingMode&&facing==='user'&&!deviceId);this.video.classList.toggle('mirrored',this.mirror);this.canvas.classList.toggle('mirrored',this.mirror);
      this.lastFrame=-1;this.resume();this.onStatus?.('Camera ready · inference stays on this device');
      stream.getVideoTracks()[0].addEventListener('ended',()=>{if(!this.disposed){this.pause();this.onError?.(new Error('Camera disconnected. Choose a camera and try again.'));}});
    }catch(error){this.stopStream();this.onError?.(error);throw error;}
  }
  resume(){if(this.disposed||!this.stream||this.running)return;this.tracker.resetMotion();this.tracker.lastTs=null;this.running=true;this.started=performance.now();this.loop();}
  pause(){if(this.running)this.activeMs+=performance.now()-this.started;this.running=false;if(this.raf)cancelAnimationFrame(this.raf);this.tracker.resetMotion();this.tracker.lastTs=null;}
  stopStream(){this.pause();this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;if(this.video){this.video.srcObject=null;this.video.classList.remove('camera-live');}}
  async switchCamera(options){this.stopStream();await this.start(options);}
  loop(){if(!this.running||this.disposed)return;const now=performance.now();if(this.video.readyState>=2&&this.video.currentTime!==this.lastFrame&&now-this.lastInfer>=(window.FitBoxStudio?.currentSettings.batterySaver===false?65:100)){this.lastFrame=this.video.currentTime;this.lastInfer=now;try{const result=this.model.detectForVideo(this.video,now);const output=this.tracker.update(result.landmarks,now,this.video.videoWidth/this.video.videoHeight);this.draw(result.landmarks,output.tracked);this.onResult?.({...output,activeSeconds:Math.floor((this.activeMs+now-this.started)/1000)});}catch(e){this.pause();this.onError?.(e);return;}}this.raf=requestAnimationFrame(()=>this.loop());}
  draw(poses,tracked){const c=this.canvas,v=this.video;if(c.width!==v.videoWidth||c.height!==v.videoHeight){c.width=v.videoWidth;c.height=v.videoHeight;}const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(poses.length!==1)return;const p=poses[0];ctx.strokeStyle=tracked?'#4fa6ff':'#fb8832';ctx.fillStyle='#ffffff';ctx.lineWidth=3;for(const [a,b] of connections)if((p[a].visibility??0)>.5&&(p[b].visibility??0)>.5){ctx.beginPath();ctx.moveTo(p[a].x*c.width,p[a].y*c.height);ctx.lineTo(p[b].x*c.width,p[b].y*c.height);ctx.stroke();}for(const [i,x] of p.entries())if(i>=11&&(x.visibility??0)>.5){ctx.beginPath();ctx.arc(x.x*c.width,x.y*c.height,3.5,0,Math.PI*2);ctx.fill();}}
  summary(){return {...this.tracker.summary(),seconds:Math.floor((this.activeMs+(this.running?performance.now()-this.started:0))/1000)};}
  dispose(){this.disposed=true;this.epoch++;this.stopStream();if(this.canvas){const ctx=this.canvas.getContext('2d');ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}}
}
export {loadModel};
