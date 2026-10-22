// ─── Atmosphere: the eternal afternoon, the rooms below, and whatever a memory has done to the sky ──
let forceUnder=false,envTime=0;
const BASE_ATMOS={fog:0xc4e1d3,near:110,far:370,sun:1.5,sunColor:0xfff6e2,amb:.8,ambColor:0xd8f0ff,clear:0x8dc6e1,skyColor:0x000000,skyEmissive:0xffffff,birds:1,audio:{wet:.04,hum:0,ambient:.7,lowpass:18000}};
const ZONE_ATMOS={
  B1:{fog:0x26302f,near:6,far:78,sun:.25,amb:.9,ambColor:0xd8efe2,clear:0x1d2524,birds:0,audio:{wet:.34,hum:.55,ambient:.12,lowpass:900}},
  B2:{fog:0xd2eaea,near:8,far:95,sun:.45,amb:1.1,ambColor:0xeaffff,clear:0xbfd9d9,birds:0,audio:{wet:.62,hum:.22,ambient:.1,lowpass:1400}},
  B3:{fog:0xcfe2d4,near:26,far:150,sun:1,amb:.95,ambColor:0xfff2dc,clear:0xb9d9e6,birds:.6,audio:{wet:.24,hum:0,ambient:.42,lowpass:2200}},
  shaft:{fog:0x2c3436,near:3,far:40,sun:.35,amb:.8,ambColor:0xdde8e4,clear:0x222a2a,birds:0,audio:{wet:.2,hum:.3,ambient:.08,lowpass:700}}};
const atmos={fog:new THREE.Color(BASE_ATMOS.fog),near:110,far:370,sun:1.5,sunColor:new THREE.Color(BASE_ATMOS.sunColor),amb:.8,ambColor:new THREE.Color(BASE_ATMOS.ambColor),clear:new THREE.Color(BASE_ATMOS.clear),skyColor:new THREE.Color(0),skyEmissive:new THREE.Color(0xffffff),birds:1};
const _tc=new THREE.Color(),DUSK=new THREE.Color(0xff9a6a);
function updateAtmosphere(dt){const p=player.position,cam=camera.position,room=currentRoom(cam)||currentRoom(p);
  let t={...BASE_ATMOS};if(room)t={...t,...(room.interior?{fog:0xe7eee4,near:4,far:48,sun:.8,amb:1.4,ambColor:0xe5f7ef,audio:{wet:.32,hum:.08,ambient:.5,lowpass:6500}}:ZONE_ATMOS[room.id])};else if(inCar(p)&&car.y<-1.5)t={...t,...ZONE_ATMOS.shaft};else if(p.y>40){t.far=370+(p.y-40)*1.7;t.near=110+(p.y-40)*.5;}
  const fx=room?null:eggs.filter(e=>e.active&&!e.done&&e.fx?.sky).sort((a,b)=>b.fx.sky.since-a.fx.sky.since)[0]?.fx;const o=fx?.sky;let map=skyTexture,snap=false;
  if(o){if(o.fog){if(o.fog.color!==undefined)t.fog=o.fog.color;if(o.fog.near)t.near=o.fog.near;if(o.fog.far)t.far=o.fog.far;}if(o.sun){t.sun=o.sun.intensity;t.sunColor=o.sun.color;}if(o.amb){t.amb=o.amb.intensity;t.ambColor=o.amb.color;}if(o.clear!==undefined)t.clear=o.clear;if(o.color!==undefined)t.skyColor=o.color;if(o.emissive!==undefined)t.skyEmissive=o.emissive;if(o.map)map=o.map;snap=!!o.snap&&worldTime-o.since<.5;}
  if(scopeView){t.far=1100;t.near=300;}
  const k=snap?1:1-Math.exp(-2.6*dt);
  atmos.fog.lerp(_tc.set(t.fog),k);atmos.near+=(t.near-atmos.near)*k;atmos.far+=(t.far-atmos.far)*k;atmos.sun+=(t.sun-atmos.sun)*k;atmos.sunColor.lerp(_tc.set(t.sunColor),k);atmos.amb+=(t.amb-atmos.amb)*k;atmos.ambColor.lerp(_tc.set(t.ambColor),k);atmos.clear.lerp(_tc.set(t.clear),k);atmos.skyColor.lerp(_tc.set(t.skyColor),k);atmos.skyEmissive.lerp(_tc.set(t.skyEmissive),k);atmos.birds=t.birds;
  // Sitting on a bench lets the afternoon finally move: a dusk that never fully arrives.
  if(timeLapse>0){timeLapse+=dt;const d=Math.sin(Math.min(1,timeLapse/18)*Math.PI)*.75;scene.fog.color.copy(atmos.fog).lerp(DUSK,d*.6);sky.material.emissive.copy(atmos.skyEmissive).lerp(DUSK,d);sun.intensity=atmos.sun*(1-d*.5);if(timeLapse>18)timeLapse=.0001;}
  else{scene.fog.color.copy(atmos.fog);sky.material.emissive.copy(atmos.skyEmissive);sun.intensity=atmos.sun;}
  scene.fog.near=atmos.near;scene.fog.far=atmos.far;sun.color.copy(atmos.sunColor);ambientLight.intensity=atmos.amb;ambientLight.color.copy(atmos.ambColor);renderer.setClearColor(atmos.clear);sky.material.color.copy(atmos.skyColor);if(sky.material.emissiveMap!==map)sky.material.emissiveMap=map;
  setAudioZone({...t.audio,...(fx?.audioZone||{})},p.y);}
// Rooms below are only drawn when you can see them; the meadow is hidden while you are inside them.
function updateVisibility(){const c=camera.position,p=player.position,camRoom=currentRoom(c),carBelow=inCar(p)&&car.y<-1.5;
  const nearOpening=(c.x>RAMP.minX-40&&c.x<RAMP.maxX+40&&c.z>RAMP.minZ-70&&c.z<RAMP.maxZ+30&&c.y<30)||(Math.hypot(c.x-SHAFT.x,c.z-SHAFT.z)<30&&c.y<12);
  under.visible=forceUnder||!!camRoom&&!camRoom.interior||carBelow||nearOpening||c.y<-1;
  const hideSurface=!forceUnder&&!camRoom?.interior&&((camRoom&&!(camRoom===B1&&c.z>-150))||carBelow);for(const o of SURFACE)o.visible=!hideSurface;shaftGroup.visible=!hideSurface||carBelow;}

// ─── The loop ────────────────────────────────────────────────────────────────
let last=performance.now(),frame=0;
function loop(now){requestAnimationFrame(loop);let dt=Math.min((now-last)/1000,.05);last=now;Village.tick(dt);Interiors.tick();if(document.hidden)return;
  if(!paused){worldTime+=dt;if(!timeFrozen)envTime+=dt;runTimers();
    if(started){elapsed+=dt;updatePlayer(dt);subtitleTimer-=dt;if(subtitleTimer<=0)$('voice').classList.remove('show');}
    else{camera.position.set(37+Math.sin(worldTime*.028)*1.4,15,58);camera.lookAt(1,12,-39);}
    updateElevator(dt);updateGreenhouse(dt);updateTowers(dt);updateSculpture(dt);updateStair(dt);updateGate();updateBand();updateDish(dt);updateGiantHand();updateProps(dt);
    for(const egg of eggs){if(egg.done)continue;egg.orb.position.y=.3+Math.sin(envTime*1.5+egg.id)*.18;egg.ring.rotation.z=envTime*.3;egg.ring.scale.setScalar(1+Math.sin(envTime*1.6+egg.id)*.08);if(started&&!egg.active&&egg.group.position.distanceTo(player.position)<(egg.def.triggerRadius||8))activateEgg(egg);if(egg.fx)try{const age=Village.episodeAge(egg.key);egg.fx.tick(age===null?dt:Math.max(0,age-egg.fx.t));}catch(e){console.error('[APT200X] fx',egg.key,e);egg.fx.updates.length=0;}}
    for(const b of buildings){const floating=(b.floaters||0)>0;b.group.position.y=b.baseY+(floating?5+Math.sin(worldTime*.8)*1.2:0)+(b.flip||0)*(b.h-2);b.group.rotation.z=Math.PI*(b.flip||0);}
    if(POOL.caustic){POOL.caustic.offset.x=envTime*.02;POOL.caustic.offset.y=envTime*.013*(1+(POOL.ripple||0));POOL.ripple=Math.max(0,(POOL.ripple||0)-dt);}
    beacon.material.emissiveIntensity=Math.sin(worldTime*2.4)>.6?1:.15;halo.rotation.z=envTime*.05;MYCELIUM.wingsArt.wings.forEach(w=>w.wing.rotation.z=w.side*Math.sin(envTime*.7)*.12);
    updateNet(dt);scheduleAudio();updateAtmosphere(dt);updateVisibility();}
  sky.position.copy(camera.position);renderer.render(scene,camera);
  if(frame++%5===0){if(started){updateMap();projectWindows();updateHud();updateElevatorPanel();updateEggLabels();}updatePeerLabels();$('landmarkLabel').style.display=!started?'block':'none';if(!started){projected.set(12,48,-62).project(camera);$('landmarkLabel').style.left=(projected.x*.5+.5)*innerWidth+'px';$('landmarkLabel').style.top=(-projected.y*.5+.5)*innerHeight+'px';}}}
requestAnimationFrame(loop);
connectNet();renderNetStatus();
// Debug hooks for testing in a browser console.
window.APT={interiors:Interiors,cameraRoll:()=>camera.rotation.z,getTargets:()=>{scene.updateMatrixWorld(true);return eggs.filter(e=>e.active&&!e.done).map(e=>{const p=e.orb.getWorldPosition(new THREE.Vector3()).project(camera);return {id:e.id,key:e.key,type:e.type,x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight};});},
  getState:()=>({started,paused,found,restored,remaining:eggs.filter(e=>!e.done).length,active:eggs.filter(e=>e.active&&!e.done).map(e=>({id:e.id,key:e.key,type:e.type,clicks:e.clicks,required:e.required})),position:player.position.toArray().map(v=>Math.round(v*100)/100),grounded,rolling,rollCooldown,gliding:motion.gliding,audio:ctx?.state||'locked',voice:Voice.ko?.name||null,quality,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,elapsed,zone:locationKey,car:{y:Math.round(car.y*10)/10,cur:FLOORS[car.cur].label,door:car.door,trip:car.trip?{to:FLOORS[car.trip.to].label,kind:car.trip.kind}:null,pending:car.pending?FLOORS[car.pending.to].label:null,queue:car.queue?FLOORS[car.queue.to].label:null},net:{id:NET.id,status:NET.status,room:ROOM,peers:[...peers.keys()],visits:NET.visits,archive:!!NET.archive},touched:[...World.recs.entries()].map(([id,r])=>({id,n:r.n}))}),
  visit:key=>{let e=eggs.find(e=>(e.id===key||e.key===key)&&!e.done);if(!e)return false;const p=e.group.position;teleport(p.x,p.y-1.2+.2,p.z+3,0);activateEgg(e);return true;},
  village:Village,worldMeta:()=>({eggSpots:Object.fromEntries(eggs.filter(e=>e.key.startsWith('EE_')).map(e=>[e.key,{x:e.group.position.x,z:e.group.position.z,level:e.level,required:e.required,type:e.type}])),obstacles:solids.filter(s=>s.on&&s.maxY>terrainY((s.minX+s.maxX)/2,(s.minZ+s.maxZ)/2)+1&&['tower','towerwall','model','skytower','skytowerwall','twin','twinwall','wall','tilewall','needle'].includes(s.tag)).map(s=>[s.minX,s.maxX,s.minZ,s.maxZ])}),spawn:spawnAround,teleport:(x,y,z)=>{teleport(x,y??surfaceHeight(x,z,terrainY(x,z)+2)+.05,z);return true;},ride:i=>{teleport(SHAFT.x,car.y+.1,SHAFT.z,Math.PI);requestTrip(i,{rider:true});return FLOORS[i]?.label;},touch:id=>{const it=INTERACT.get(id);if(!it)return false;touchThing(it);return true;},things:()=>[...INTERACT.keys()],setAutoPause:v=>{autoPause=!!v;return autoPause;},look:(y,p=.13)=>{yaw=y;pitch=p;return true;},inspect:()=>({greenhouseHands:greenhouseHands.count,dishArms:DISH.arms.count,underVisible:under.visible,surfaceVisible:SURFACE[0].visible,peers:peers.size}),close:()=>{if($('modal').classList.contains('open'))closeModal();return true;},
  stats:()=>{const out={},fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));scene.updateMatrixWorld(true);const walk=(o,label)=>{if(!o.visible)return;const l=o.name||label;if((o.isMesh||o.isLine||o.isPoints)&&o.material?.visible!==false&&(!o.frustumCulled||fr.intersectsObject(o)))out[l]=(out[l]||0)+1;for(const c of o.children)walk(c,l);};for(const c of scene.children)walk(c,c.name||('scene:'+(c.material?.uuid?.slice(0,4)||c.type)));return Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,30);},click:key=>{const e=eggs.find(e=>e.key===key&&e.active&&!e.done);if(e)clickEgg(e);return !!e;}};

