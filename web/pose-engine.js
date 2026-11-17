/* Pure pose logic. MediaPipe inference stays local; no images enter this module. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FitBoxPose=api;})(globalThis,function(){
  'use strict';
  const MODEL={name:'MediaPipe Pose Landmarker Lite (BlazePose GHUM)',version:'float16/1',runtime:'@mediapipe/tasks-vision@1.2.3',landmarks:33};
  const TASKS=[
    {id:'pushups',name:'Pushups',view:'Side',mode:'reps',metric:'elbow',low:95,high:155,joints:['shoulder','elbow','wrist','hip','ankle'],setup:'Place the camera low, side-on. Keep your shoulders, hips and ankles in frame.',cue:'Keep your trunk in a comfortable straight line.'},
    {id:'squats',name:'Squats',view:'Side',mode:'reps',metric:'knee',low:105,high:155,joints:['shoulder','hip','knee','ankle'],setup:'Place the camera around hip height, side-on, with your whole body visible.',cue:'Bend your knees within a comfortable range, then return to standing.'},
    {id:'lunges',name:'Stationary lunges',view:'Side',mode:'reps',metric:'knee',low:110,high:155,joints:['shoulder','hip','knee','ankle'],setup:'Stand side-on. Keep both feet and your full body visible. Track one set on each side.',cue:'Keep your torso upright and move with control.'},
    {id:'plank',name:'Plank',view:'Side',mode:'hold',metric:'plank',joints:['shoulder','hip','knee','ankle'],setup:'Place the camera low, side-on. Your shoulder, hip, knee and ankle must be visible.',cue:'Hold a comfortable straight body line. Tracking pauses when alignment is lost.'},
    {id:'situps',name:'Situps',view:'Side',mode:'reps',metric:'hip',low:80,high:140,joints:['shoulder','hip','knee','ankle'],setup:'Place the camera low, side-on. Keep your shoulders, hips, knees and feet in frame.',cue:'Move through a comfortable range without pulling on your neck.'},
    {id:'crunches',name:'Crunches',view:'Side',mode:'reps',metric:'hip',low:125,high:150,joints:['shoulder','hip','knee'],setup:'Use a low side view. Keep the camera fixed and shoulders, hips and knees visible.',cue:'Small movement may not cross the counting threshold; use manual tracking when it does not.'},
    {id:'pullups',name:'Pullups',view:'Front',mode:'reps',metric:'elbow',low:85,high:150,joints:['shoulder','elbow','wrist','hip'],setup:'Face the camera. Include the bar, both hands, elbows, shoulders and hips.',cue:'Use only a secure bar. Do not swing to create a counted rep.'},
    {id:'biceps',name:'Biceps curls',view:'Side',mode:'reps',metric:'elbow',low:65,high:150,joints:['shoulder','elbow','wrist','hip'],setup:'Stand side-on, camera near chest height, with the working arm fully visible.',cue:'Keep your upper arm steady. The camera does not measure load.'},
    {id:'bridges',name:'Glute bridges',view:'Side',mode:'reps',metric:'bridge',low:125,high:160,joints:['shoulder','hip','knee','ankle'],setup:'Use a low side view that includes shoulders, hips, knees and feet.',cue:'Lift with control, then lower comfortably.',reverse:true},
    {id:'jacks',name:'Jumping jacks',view:'Front',mode:'reps',metric:'arms',low:40,high:125,joints:['shoulder','elbow','wrist','hip','knee','ankle'],setup:'Face the camera. Allow room above your hands and to both sides of your feet.',cue:'Move both arms and legs together. Choose a low-impact variation if needed.',reverse:true},
    {id:'chair',name:'Chair pose',view:'Side',mode:'hold',metric:'chair',joints:['shoulder','hip','knee','ankle'],setup:'Use a full-body side view with feet visible.',cue:'Hold a comfortable knee bend and breathe naturally.'},
    {id:'yoga',name:'Mountain pose',view:'Front',mode:'hold',metric:'standing',joints:['shoulder','hip','knee','ankle'],setup:'Face the camera, keeping your whole body and feet visible.',cue:'Stand comfortably and breathe naturally.'},
    {id:'warrior',name:'Warrior II',view:'Front',mode:'hold',metric:'warrior',joints:['shoulder','elbow','wrist','hip','knee','ankle'],setup:'Face the camera with both arms and feet visible. Leave room to either side.',cue:'Keep your arms comfortably extended and one knee bent.'},
    {id:'tree',name:'Tree pose',view:'Front',mode:'hold',metric:'tree',joints:['shoulder','hip','knee','ankle'],setup:'Face the camera. Stand near a stable support if you need one.',cue:'Keep one supporting leg comfortably straight. Do not press your foot against your knee.'},
    {id:'downdog',name:'Downward-facing dog',view:'Side',mode:'hold',metric:'downdog',joints:['shoulder','hip','knee','ankle','wrist'],setup:'Place the camera low and side-on, with hands and feet visible.',cue:'Keep a comfortable inverted-V shape. Bend your knees if needed.'},
    ...[['burpees','Burpees'],['walking','Walking / treadmill'],['cycling','Stationary cycling'],['shadowboxing','Shadow boxing'],['handstand','Handstand'],['bench','Bench press'],['meditation','Mindful breathing']].map(([id,name])=>({id,name,view:'Not required',mode:'manual',metric:null,joints:[],setup:'Use the manual timer or repetition counter. Automatic counting has not been validated for this activity.',cue:'No automatic pose score is assigned.'}))
  ];
  const JOINT={left:{shoulder:11,elbow:13,wrist:15,hip:23,knee:25,ankle:27},right:{shoulder:12,elbow:14,wrist:16,hip:24,knee:26,ankle:28}};
  const task=id=>TASKS.find(t=>t.id===id);
  function angle(a,b,c,aspect=1){if(!a||!b||!c)return null;const u=[(a.x-b.x)*aspect,a.y-b.y],v=[(c.x-b.x)*aspect,c.y-b.y],d=Math.hypot(...u)*Math.hypot(...v);if(d<1e-8)return null;return Math.acos(Math.min(1,Math.max(-1,(u[0]*v[0]+u[1]*v[1])/d)))*180/Math.PI;}
  const visibility=p=>Math.min(p?.visibility??0,p?.presence??1);
  function pickSide(landmarks,t){return Object.values(JOINT).map(indices=>({indices,score:Math.min(...t.joints.map(j=>visibility(landmarks[indices[j]])))})).sort((a,b)=>b.score-a.score)[0];}
  function sideAngles(lm,indices,aspect){const p=Object.fromEntries(Object.entries(indices).map(([k,i])=>[k,lm[i]]));return {...p,elbow:angle(p.shoulder,p.elbow,p.wrist,aspect),knee:angle(p.hip,p.knee,p.ankle,aspect),hip:angle(p.shoulder,p.hip,p.knee,aspect),arm:angle(p.hip,p.shoulder,p.elbow,aspect),trunk:angle(p.shoulder,p.hip,p.ankle,aspect)};}
  class Tracker {
    constructor(id){this.task=task(id);if(!this.task||this.task.mode==='manual')throw new Error('This exercise uses manual tracking.');this.reps=0;this.holdMs=0;this.phase='calibrating';this.lastTs=null;this.phaseAt=0;this.readyAt=null;this.candidate=null;this.candidateAt=0;this.lastRep=-Infinity;this.samples=0;this.accepted=0;this.confidenceSum=0;this.lastCue='Step into view';this.metricValue=null;}
    resetMotion(){this.phase='calibrating';this.readyAt=null;this.candidate=null;this.candidateAt=0;}
    update(poses,timestamp,aspect=1){
      const dt=this.lastTs===null?0:Math.max(0,Math.min(timestamp-this.lastTs,200));const gap=this.lastTs!==null&&(timestamp-this.lastTs>750||timestamp<=this.lastTs);this.lastTs=timestamp;this.samples++;
      if(gap)this.resetMotion();
      if(!poses||poses.length!==1||poses[0].length<33){this.resetMotion();return this.result(false,poses?.length>1?'One person at a time':'Step back until your body is visible',0);}
      const lm=poses[0],selected=pickSide(lm,this.task),required=this.task.joints.map(j=>lm[selected.indices[j]]);
      let confidence=selected.score;
      if(this.task.view==='Front'){confidence=Math.min(confidence,...this.task.joints.flatMap(j=>[visibility(lm[JOINT.left[j]]),visibility(lm[JOINT.right[j]])]));}
      if(confidence<.65||required.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<.015||p.x>.985||p.y<.015||p.y>.985)){this.resetMotion();return this.result(false,'Move into frame · keep the working joints visible',confidence);}
      const a=sideAngles(lm,selected.indices,aspect),left=sideAngles(lm,JOINT.left,aspect),right=sideAngles(lm,JOINT.right,aspect);
      let value=a[this.task.metric],valid=true;
      switch(this.task.metric){
        case 'bridge':value=a.hip;break;
        case 'arms':value=Math.min(left.arm??0,right.arm??0);valid=visibility(lm[11])>=.65&&visibility(lm[12])>=.65&&visibility(lm[15])>=.65&&visibility(lm[16])>=.65;break;
        case 'plank':valid=a.trunk>155&&a.knee>150&&Math.abs(a.shoulder.y-a.ankle.y)<.35;break;
        case 'standing':valid=a.knee>155&&a.hip>150&&a.shoulder.y<lm[selected.indices.hip].y;break;
        case 'chair':valid=a.knee>70&&a.knee<145&&a.shoulder.y<lm[selected.indices.hip].y;break;
        case 'warrior':valid=Math.min(left.knee??180,right.knee??180)<140&&Math.max(left.knee??0,right.knee??0)>145&&left.arm>65&&right.arm>65;break;
        case 'tree':valid=Math.max(left.knee??0,right.knee??0)>155&&Math.min(left.knee??180,right.knee??180)<135;break;
        case 'downdog':valid=a.hip>40&&a.hip<115&&lm[selected.indices.hip].y<a.shoulder.y&&a.knee>125;break;
      }
      if(this.task.id==='pushups'&&a.trunk<145)valid=false;
      this.metricValue=Number.isFinite(value)?Math.round(value):null;
      if(!valid){this.resetMotion();return this.result(false,this.task.cue,confidence);}
      this.accepted++;this.confidenceSum+=confidence;
      if(this.task.mode==='hold'){
        if(this.readyAt===null)this.readyAt=timestamp;
        const calibrated=timestamp-this.readyAt>=650;
        if(calibrated&&!gap){this.holdMs+=dt;this.phase='holding';}else this.phase='calibrating';
        return this.result(calibrated,calibrated?'Position tracked · breathe naturally':'Hold still to calibrate',confidence);
      }
      if(!Number.isFinite(value)){this.resetMotion();return this.result(false,'Adjust the camera angle',confidence);}
      const neutral=this.task.reverse?value<this.task.low:value>this.task.high;
      const engaged=this.task.reverse?value>this.task.high:value<this.task.low;
      let target=null;
      if(this.phase==='calibrating'&&neutral)target='ready';
      if(this.phase==='ready'&&engaged)target='engaged';
      if(this.phase==='engaged'&&neutral)target='rep';
      if(target){if(this.candidate!==target){this.candidate=target;this.candidateAt=timestamp;}if(timestamp-this.candidateAt>=180){if(target==='rep'){if(timestamp-this.phaseAt>=280&&timestamp-this.lastRep>=650){this.reps++;this.lastRep=timestamp;}this.phase='ready';}else{this.phase=target;this.phaseAt=timestamp;}this.candidate=null;}}else this.candidate=null;
      return this.result(true,this.phase==='calibrating'?'Start in the resting position':this.phase==='engaged'?'Return with control':this.task.cue,confidence);
    }
    result(tracked,cue,confidence){this.lastCue=cue;return {tracked,cue,confidence:Math.round(Math.max(0,confidence)*100),phase:this.phase,reps:this.reps,holdSeconds:Math.floor(this.holdMs/1000),angle:this.metricValue};}
    summary(){return {exercise:this.task.id,reps:this.reps,holdSeconds:Math.floor(this.holdMs/1000),source:'pose',model:'pose_landmarker_lite.float16.v1',confidence:this.accepted?Number((this.confidenceSum/this.accepted).toFixed(3)):0,trackingRatio:this.samples?Number((this.accepted/this.samples).toFixed(3)):0,framesProcessed:this.samples};}
  }
  return {MODEL,TASKS,JOINT,task,angle,Tracker};
});
