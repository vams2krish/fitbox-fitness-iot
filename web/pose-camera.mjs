import {PoseFraming} from './pose-framing.mjs';
import {workerDetector} from './pose-detector.mjs';
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
  constructor({video,canvas,exercise,onResult,onError,onStatus}){Object.assign(this,{video,canvas,onResult,onError,onStatus});this.tracker=new FitBoxPose.Tracker(exercise);this.disposed=false;this.running=false;this.stream=null;this.raf=null;this.lastFrame=-1;this.lastInfer=-Infinity;this.activeMs=0;this.started=0;this.facing='user';this.epoch=0;this.devices=[];this.framing=new PoseFraming();this.frameCallback=null;this.latency=0;this.busy=false;this.generation=0;}
  async start({facing=this.facing,deviceId=null}={}){
    const epoch=++this.epoch;this.disposed=false;this.facing=facing;this.onStatus?.('Preparing on-device model…');
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access needs HTTPS or localhost and a supported browser.');
    try{
      if(!this.detector){try{this.detector=await workerDetector();}catch(error){this.fallbackReason=error.message;const model=await loadModel();this.detector={backend:'local-main-fallback',detect:(v,t)=>model.detectForVideo(v,t),dispose(){}};}}if(epoch!==this.epoch||this.disposed){this.detector?.dispose();this.detector=null;return;}
      const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:deviceId?{deviceId:{exact:deviceId},width:{ideal:640},height:{ideal:480}}:{facingMode:{ideal:facing},width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:20}}});
      if(epoch!==this.epoch||this.disposed){stream.getTracks().forEach(t=>t.stop());return;}
      this.stream=stream;this.video.srcObject=stream;this.video.muted=true;this.video.playsInline=true;await this.video.play();this.video.classList.add('camera-live');this.video.dataset.detector=this.detector.backend;this.video.dataset.fallbackReason=this.fallbackReason||'';this.prepareFraming();
      if(epoch!==this.epoch||this.disposed){stream.getTracks().forEach(t=>t.stop());return;}
      this.devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');
      const settings=stream.getVideoTracks()[0].getSettings();this.mirror=settings.facingMode==='user'||(!settings.facingMode&&facing==='user'&&!deviceId);this.video.classList.toggle('mirrored',this.mirror);this.canvas.classList.toggle('mirrored',this.mirror);
      this.lastFrame=-1;this.resume();this.onStatus?.('Camera ready · inference stays on this device');
      stream.getVideoTracks()[0].addEventListener('ended',()=>{if(!this.disposed){this.pause();this.onError?.(new Error('Camera disconnected. Choose a camera and try again.'));}});
    }catch(error){this.stopStream();this.onError?.(error);throw error;}
  }
  resume(){if(this.disposed||!this.stream||this.running)return;this.tracker.resetMotion();this.tracker.lastTs=null;this.running=true;this.started=performance.now();this.loop();}
  pause(){this.generation++;if(this.running)this.activeMs+=performance.now()-this.started;this.running=false;if(this.raf)cancelAnimationFrame(this.raf);if(this.frameCallback!==null)this.video.cancelVideoFrameCallback?.(this.frameCallback);this.frameCallback=null;this.tracker.resetMotion();this.tracker.lastTs=null;}
  stopStream(){this.pause();this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;if(this.video){this.video.srcObject=null;this.video.classList.remove('camera-live');this.framing.reset();this.canvas.getContext('2d').clearRect(0,0,this.canvas.width,this.canvas.height);}}
  async switchCamera(options){this.stopStream();await this.start(options);}
  prepareFraming(){if(!this.layer?.isConnected){this.layer=document.createElement('div');this.layer.className='pose-frame-layer';this.video.before(this.layer);this.layer.append(this.video,this.canvas);}this.applyFraming({zoom:1,x:.5,y:.5});}
  applyFraming(frame){if(!this.layer)return;const p=this.layer.parentElement,ratio=this.video.videoWidth/this.video.videoHeight||4/3,w=Math.min(p.clientWidth,p.clientHeight*ratio),h=w/ratio,edge=.5/frame.zoom,x=Math.max(edge,Math.min(1-edge,this.mirror?1-frame.x:frame.x)),y=Math.max(edge,Math.min(1-edge,frame.y));Object.assign(this.layer.style,{width:w+'px',height:h+'px',transform:`translate(-50%,-50%) scale(${frame.zoom.toFixed(3)}) translate(${((.5-x)*w).toFixed(1)}px,${((.5-y)*h).toFixed(1)}px)`});this.layer.dataset.zoom=frame.zoom.toFixed(2);}
  schedule(){if(!this.running||this.disposed)return;if(this.video.requestVideoFrameCallback)this.frameCallback=this.video.requestVideoFrameCallback(()=>{this.frameCallback=null;this.loop();});else this.raf=requestAnimationFrame(()=>this.loop());}
  async loop(){if(!this.running||this.disposed||this.busy)return;const now=performance.now(),interval=Math.max(window.FitBoxStudio?.currentSettings.batterySaver===false?66:125,this.latency*1.2);if(this.video.readyState<2||this.video.currentTime===this.lastFrame||now-this.lastInfer<interval){this.schedule();return;}this.lastFrame=this.video.currentTime;this.lastInfer=now;this.busy=true;const epoch=this.epoch,generation=this.generation;try{const result=await this.detector.detect(this.video,now);this.latency=this.latency*.8+(performance.now()-now)*.2;if(!this.running||this.disposed||epoch!==this.epoch||generation!==this.generation)return;const framing=this.framing.update(result.landmarks,window.FitBoxStudio?.currentSettings.autoFraming!==false);this.applyFraming(framing);const output=this.tracker.update(framing.clipped?[]:result.landmarks,now,this.video.videoWidth/this.video.videoHeight);if(framing.clipped)output.cue='Step back or reposition the camera so your head, hands and feet are visible.';this.draw(result.landmarks,output.tracked);this.onResult?.({...output,framingZoom:framing.zoom,backend:this.detector.backend,activeSeconds:Math.floor((this.activeMs+now-this.started)/1000)});}catch(e){if(!this.disposed&&this.running){this.stopStream();this.onError?.(e);}}finally{this.busy=false;this.schedule();}}

  draw(poses,tracked){const c=this.canvas,v=this.video;if(c.width!==v.videoWidth||c.height!==v.videoHeight){c.width=v.videoWidth;c.height=v.videoHeight;}const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);if(poses.length!==1)return;const p=poses[0];ctx.strokeStyle=tracked?'#4fa6ff':'#fb8832';ctx.fillStyle='#ffffff';ctx.lineWidth=3;for(const [a,b] of connections)if((p[a].visibility??0)>.5&&(p[b].visibility??0)>.5){ctx.beginPath();ctx.moveTo(p[a].x*c.width,p[a].y*c.height);ctx.lineTo(p[b].x*c.width,p[b].y*c.height);ctx.stroke();}for(const [i,x] of p.entries())if(i>=11&&(x.visibility??0)>.5){ctx.beginPath();ctx.arc(x.x*c.width,x.y*c.height,3.5,0,Math.PI*2);ctx.fill();}}
  summary(){return {...this.tracker.summary(),seconds:Math.floor((this.activeMs+(this.running?performance.now()-this.started:0))/1000)};}
  dispose(){this.disposed=true;this.epoch++;this.stopStream();this.detector?.dispose();this.detector=null;if(this.canvas){const ctx=this.canvas.getContext('2d');ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}}
}
export {loadModel};
