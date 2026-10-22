// ─── The player: a jointed grey mannequin with a third-person spring-arm camera ─
const rig=createMannequin();const player=rig.root;player.name='player';scene.add(player);player.position.set(0,terrainY(0,22),22);
const heading=rig.heading,body=rig.body;
const wings=createHandWings();body.add(wings.group);
const shadowTex=texCanvas(64,64,(g)=>{let gr=g.createRadialGradient(32,32,1,32,32,31);gr.addColorStop(0,'rgba(17,45,25,.3)');gr.addColorStop(1,'rgba(17,45,25,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});const shadow=mesh(new THREE.PlaneGeometry(2,2),phong(0x222222,{map:shadowTex,transparent:true,depthWrite:false,shininess:0,specular:0x000000}));shadow.rotation.x=-Math.PI/2;
let yaw=0,pitch=.13,velocityY=0,grounded=true,rolling=0,rollCooldown=0,walkPhase=0;const rollDir=new THREE.Vector3(0,0,-1);const keys=new Set(),input={x:0,y:0};
camera.position.set(37,15,58);camera.lookAt(1,12,-39);
// New movement state: gliding on hand-wings, diving, sitting, shattering, cut-scene camera.
const motion={gliding:false,diving:false,blessed:false,flaps:0,air:0,fallFrom:0,sitting:null,lock:0,speed:0,trail:[],shake:0,shakeAmp:0,roll:0};
let camOverride=null,shatter=null,camCeiling=null;
function shake(amount=1,duration=.6){motion.shakeAmp=Math.max(motion.shakeAmp,amount);motion.shake=Math.max(motion.shake,duration);}
function jump(){if(!started||paused||shatter)return;if(motion.sitting){standUp();return;}
  if(!grounded&&motion.gliding&&motion.blessed&&motion.flaps>0){motion.flaps--;velocityY=7.5;motion.diving=false;sfx('flap');return;}
  if(!grounded||rolling>0)return;velocityY=8.7;grounded=false;motion.fallFrom=player.position.y;if(ctx)note(310,ctx.currentTime,.12,.018,'triangle');}
function roll(){if(!started||paused||shatter)return;if(motion.gliding){motion.diving=!motion.diving;sfx(motion.diving?'whoosh':'flap');return;}
  if(!grounded||rolling>0||rollCooldown>0||motion.sitting)return;rolling=.6;rollCooldown=1;rollDir.set(Math.sin(heading.rotation.y),0,Math.cos(heading.rotation.y));if(ctx)note(130,ctx.currentTime,.2,.025,'triangle');}
function sitOn(seat){motion.sitting=seat;player.position.set(seat.x,seat.y,seat.z);heading.rotation.y=seat.yaw;velocityY=0;grounded=true;}
function standUp(){if(!motion.sitting)return;const s=motion.sitting;motion.sitting=null;player.position.x+=Math.sin(s.yaw)*.9;player.position.z+=Math.cos(s.yaw)*.9;s.onStand?.();}
function teleport(x,y,z,yawTo=null){player.position.set(x,y,z);velocityY=0;grounded=false;motion.gliding=false;motion.diving=false;motion.fallFrom=y;if(yawTo!==null){yaw=yawTo;heading.rotation.y=yawTo+Math.PI;}camera.position.set(x+Math.sin(yaw)*10,y+4,z+Math.cos(yaw)*10);}
function respawn(){teleport(0,terrainY(0,22)+.5,22,0);toast('기억이 처음 자리로 되돌아왔습니다.');}

// When the body hits the ground too hard it comes apart, then quietly puts itself back together.
function startShatter(){if(shatter)return;const pieces=[];player.updateMatrixWorld(true);
  player.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const m=new THREE.Mesh(o.geometry,o.material);o.getWorldPosition(m.position);o.getWorldQuaternion(m.quaternion);scene.add(m);const dir=new THREE.Vector3(Math.random()-.5,.6+Math.random(),Math.random()-.5).normalize();pieces.push({mesh:m,src:o,v:dir.multiplyScalar(5+Math.random()*7),w:new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(10),home:null});});
  heading.visible=false;shatter={t:0,pieces,homed:false};sfx('shatter');shake(1.6,.7);velocityY=0;motion.gliding=false;motion.diving=false;}
function updateShatter(dt){const s=shatter;s.t+=dt;const back=s.t>1.6;
  if(back&&!s.homed){poseMannequin(rig,{speed:0,t:worldTime,snap:true},1);player.updateMatrixWorld(true);for(const p of s.pieces)p.home={pos:p.src.getWorldPosition(new THREE.Vector3()),q:p.src.getWorldQuaternion(new THREE.Quaternion()),from:p.mesh.position.clone(),fq:p.mesh.quaternion.clone()};s.homed=true;sfx('rewind');}
  for(const p of s.pieces){if(!back){p.v.y-=22*dt;p.mesh.position.addScaledVector(p.v,dt);const floor=surfaceHeight(p.mesh.position.x,p.mesh.position.z,p.mesh.position.y)+.15;if(p.mesh.position.y<floor){p.mesh.position.y=floor;p.v.y*=-.35;p.v.x*=.6;p.v.z*=.6;p.w.multiplyScalar(.6);}p.mesh.rotation.x+=p.w.x*dt;p.mesh.rotation.y+=p.w.y*dt;p.mesh.rotation.z+=p.w.z*dt;}
    else{const k=ease(clamp((s.t-1.6)/.9,0,1));p.mesh.position.lerpVectors(p.home.from,p.home.pos,k);p.mesh.quaternion.slerpQuaternions(p.home.fq,p.home.q,k);}}
  if(s.t>2.5){for(const p of s.pieces)scene.remove(p.mesh);heading.visible=true;shatter=null;toast('몸이 다시 맞춰졌습니다. 아무 일도 없었습니다.');}}
function onLand(impact){rig.pose.squash=1;const dived=motion.diving;motion.gliding=false;motion.diving=false;motion.flaps=motion.blessed?3:0;if(impact>(dived?19:27)){startShatter();return;}if(impact>13){sfx('thud');shake(.5,.3);}}

const cameraTarget=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),projected=new THREE.Vector3();let locationKey='';
function currentRoom(p=player.position){for(const r of ROOMS)if(p.x>r.minX-.5&&p.x<r.maxX+.5&&p.z>r.minZ-1.2&&p.z<r.maxZ+.5&&p.y>r.floor-2&&p.y<r.ceil)return r;return null;}
function updatePlayer(dt){
  if(shatter){updateShatter(dt);updateCamera(dt);return;}
  let ix=input.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),iy=input.y+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);let len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len;len=1;}
  if(motion.lock>0){motion.lock-=dt;ix=iy=len=0;}
  if(motion.sitting&&len>.25)standUp();
  if(motion.sitting){const s=motion.sitting;player.position.set(s.x,s.y,s.z);heading.rotation.y=s.yaw;velocityY=0;grounded=true;poseMannequin(rig,{speed:0,t:worldTime,sit:true},dt);shadow.position.set(s.x,s.y-.3,s.z);updateCamera(dt);updateLocation();return;}
  let mx=ix*Math.cos(yaw)+iy*Math.sin(yaw),mz=-ix*Math.sin(yaw)+iy*Math.cos(yaw),speed=6.1;rollCooldown=Math.max(0,rollCooldown-dt);
  if(rolling>0){rolling=Math.max(0,rolling-dt);mx=rollDir.x;mz=rollDir.z;speed*=1.5;}
  if(motion.gliding){const f=heading.rotation.y,want=Math.atan2(mx,mz),steer=Math.hypot(mx,mz)>.1?Math.atan2(Math.sin(want-f),Math.cos(want-f)):0;heading.rotation.y+=steer*dt*1.6;mx=Math.sin(heading.rotation.y);mz=Math.cos(heading.rotation.y);speed=motion.diving?15:10.5;}
  if(motion.sitting){mx=mz=0;}
  const p=player.position;
  // Ride whatever box we stand on (elevator car, rising stairs).
  if(grounded&&support&&support.dy)p.y+=support.dy;
  let x=p.x+mx*speed*dt,z=p.z+mz*speed*dt;if(Math.hypot(x,z)<WORLD_RADIUS||currentRoom()?.interior){if(!blocked(x,p.z,p.y))p.x=x;if(!blocked(p.x,z,p.y))p.z=z;}
  const moving=Math.hypot(mx,mz)>.05;
  if(moving&&rolling===0&&!motion.gliding){let target=Math.atan2(mx,mz),delta=Math.atan2(Math.sin(target-heading.rotation.y),Math.cos(target-heading.rotation.y));heading.rotation.y+=delta*(1-Math.exp(-12*dt));walkPhase+=dt*10*Math.min(1,len);}
  motion.speed=moving&&!motion.gliding?Math.min(1,len)*(rolling>0?1.5:1):0;
  let floor=surfaceHeight(p.x,p.z,p.y);
  if(grounded&&floor<p.y-.12){grounded=false;motion.fallFrom=p.y;motion.air=0;}
  if(!grounded){motion.air+=dt;
    if(!motion.gliding&&velocityY<-8&&p.y-floor>9&&motion.fallFrom-p.y>3){motion.gliding=true;motion.diving=false;motion.flaps=motion.blessed?3:0;sfx('wings');}
    if(motion.gliding&&!motion.diving)velocityY=Math.max(velocityY-22*dt,-4.2);else velocityY=Math.max(velocityY-22*dt,motion.diving?-38:-46);
    if(velocityY>0){const c=ceilingAbove(p.x,p.z,p.y+PLAYER_H);if(p.y+PLAYER_H+velocityY*dt>c){velocityY=0;p.y=c-PLAYER_H-.01;}}
    const before=p.y;p.y+=velocityY*dt;floor=surfaceHeight(p.x,p.z,before);
    if(p.y<=floor){const impact=-velocityY;p.y=floor;velocityY=0;grounded=true;onLand(impact);}}
  else p.y=floor;
  if(p.y<-90||!Number.isFinite(p.y))respawn();
  // Safety net: nobody slips under the meadow unless a memory opened the floor on purpose.
  else if(p.y<terrainY(p.x,p.z)-2.5&&!currentRoom()&&!inVoid(p.x,p.z)&&!inRect(RAMP,p.x,p.z)&&!(p.x>SHAFT.minX-1&&p.x<SHAFT.maxX+1&&p.z>SHAFT.minZ-1&&p.z<SHAFT.maxZ+1)&&!voids.length){p.y=terrainY(p.x,p.z)+.05;velocityY=0;grounded=true;}
  wings.open+=((motion.gliding&&!motion.diving?1:0)-wings.open)*Math.min(1,dt*(motion.gliding?5:8));wings.group.visible=wings.open>.02;wings.group.scale.setScalar(Math.max(.001,wings.open));for(const w of wings.wings)w.wing.rotation.z=w.side*(Math.sin(worldTime*(motion.diving?2:4.2))*.18*wings.open-.1);
  poseMannequin(rig,{speed:motion.speed,phase:walkPhase,t:worldTime,airborne:!grounded,vy:velocityY,roll:rolling>0?1-rolling/.6:0,glide:motion.gliding&&!motion.diving,sit:!!motion.sitting},dt);
  if(motion.diving)body.rotation.x=Math.PI*.55;
  const sf=surfaceHeight(p.x,p.z,p.y+.1);shadow.position.set(p.x,sf+.08,p.z);shadow.material.opacity=grounded?.85:clamp(.6-(p.y-sf)*.04,0,.5);
  motion.trail.push({x:p.x,y:p.y,z:p.z,t:worldTime});while(motion.trail.length&&worldTime-motion.trail[0].t>1.3)motion.trail.shift();
  updateCamera(dt);$('roll').classList.toggle('cooldown',rollCooldown>0);updateLocation();
}
// "CD skip": snap back to where you were a moment ago.
function skipBack(sec=.8){const p=player.position;const old=motion.trail.find(s=>worldTime-s.t<=sec+.05);if(!old||blocked(old.x,old.z,old.y))return;p.set(old.x,old.y,old.z);velocityY=0;sfx('skip');}
function updateCamera(dt){
  const p=player.position,room=currentRoom(),inside=inCar(p);
  if(camOverride){camOverride.t=(camOverride.t||0)+dt;if(camOverride.t>camOverride.dur){const done=camOverride.done;camOverride=null;done?.();}}
  if(camOverride){const c=camOverride;camera.position.lerp(c.pos(),1-Math.exp(-(c.rate||3)*dt));camera.lookAt(c.look());}
  else if(inside&&car.y<-1.5){desiredCamera.set(SHAFT.x+(p.x<SHAFT.x?1.3:-1.3),car.y+3.25,SHAFT.minZ+.35);camera.position.lerp(desiredCamera,1-Math.exp(-6*dt));cameraTarget.set(SHAFT.x+(p.x<SHAFT.x?-.6:.6),car.y+1.1,SHAFT.front+4.5);camera.lookAt(cameraTarget);}
  else{const dist=motion.gliding?14:inside?12.5:10.8,lift=motion.gliding?2.4:3.3;
    // In the glass car the tower is behind you: keep the camera on the open side.
    if(inside&&Math.cos(yaw)<.35){const want=Math.atan2(Math.sin(yaw)>=0?.94:-.94,.35);yaw+=Math.atan2(Math.sin(want-yaw),Math.cos(want-yaw))*Math.min(1,dt*4);}const cy=yaw;
    desiredCamera.set(p.x+Math.sin(cy)*dist,p.y+lift+Math.sin(pitch)*dist*.93,p.z+Math.cos(cy)*dist);
    if(room?.interior){desiredCamera.y=room.floor+3.25;const px=clamp(desiredCamera.x,room.minX+.5,room.maxX-.5),pz=clamp(desiredCamera.z,room.minZ+.5,room.maxZ-.5);if(Math.hypot(px-p.x,pz-p.z)<3.3){const choices=[[room.minX+.6,room.minZ+.6],[room.maxX-.6,room.minZ+.6],[room.minX+.6,room.maxZ-.6],[room.maxX-.6,room.maxZ-.6]];choices.sort((a,b)=>(Math.hypot(b[0]-p.x,b[1]-p.z)+((b[0]-p.x)*Math.sin(yaw)+(b[1]-p.z)*Math.cos(yaw))*.5)-(Math.hypot(a[0]-p.x,a[1]-p.z)+((a[0]-p.x)*Math.sin(yaw)+(a[1]-p.z)*Math.cos(yaw))*.5));desiredCamera.x=choices[0][0];desiredCamera.z=choices[0][1];}}
    if(room){desiredCamera.x=clamp(desiredCamera.x,room.minX+.5,room.maxX-.5);desiredCamera.z=clamp(desiredCamera.z,room.minZ+.4,room.maxZ-.5);desiredCamera.y=clamp(desiredCamera.y,room.floor+.6,room.ceil-.45);}
    else if(p.y>-3)desiredCamera.y=Math.max(desiredCamera.y,terrainY(desiredCamera.x,desiredCamera.z)+1.1);
    if(camCeiling!==null)desiredCamera.y=Math.min(desiredCamera.y,camCeiling-.35);
    camera.position.lerp(desiredCamera,1-Math.exp(-4.4*dt));
    if(room){camera.position.x=clamp(camera.position.x,room.minX+.3,room.maxX-.3);camera.position.z=clamp(camera.position.z,room.minZ+.25,room.maxZ-.3);camera.position.y=clamp(camera.position.y,room.floor+.4,room.ceil-.3);}
    cameraTarget.set(p.x,p.y+(room?.interior?1.7:room?Math.min(4.2,room.ceil-p.y-1.2):4.2),p.z);camera.lookAt(cameraTarget);}
  if(motion.shake>0){motion.shake-=dt;const a=motion.shakeAmp*clamp(motion.shake*2,0,1)*.35;camera.position.x+=(Math.random()-.5)*a;camera.position.y+=(Math.random()-.5)*a;}else motion.shakeAmp=0;
  camera.rotation.z=0;motion.roll=0;
}

