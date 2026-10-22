// ─── Things you can touch. Every touch leaves a grey handprint that everyone sees. ─
const handTex=texCanvas(64,80,(g)=>{g.fillStyle='rgba(60,60,66,.95)';g.shadowColor='rgba(60,60,66,.8)';g.shadowBlur=4;g.beginPath();g.ellipse(32,52,15,18,0,0,TAU);g.fill();for(const [x,y,l,a] of [[19,36,22,-.32],[27,30,27,-.1],[36,30,26,.08],[44,36,20,.3],[49,54,15,1.05]]){g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,-l/2,4.2,l/2,0,0,TAU);g.fill();g.restore();}});
const PRINT_GEO=new THREE.PlaneGeometry(.46,.58),PRINT_MAX=24;
const printMat=new THREE.MeshBasicMaterial({map:handTex,color:0x8e8e93,transparent:true,opacity:.78,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:THREE.DoubleSide});
const INTERACT=new Map();const _po=new THREE.Object3D();
function hashStr(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0)/4294967296;}
function defineThing(def){const it={reach:7,printParent:def.root,apply:null,touch:null,...def,rec:null};it.layer=new THREE.InstancedMesh(PRINT_GEO,printMat,PRINT_MAX);it.layer.count=0;it.layer.visible=false;it.layer.frustumCulled=false;it.printParent.add(it.layer);
  for(const r of [it.root,...(it.extraRoots||[])])r.traverse(o=>{if(o.isMesh&&o!==it.layer)o.userData.thing=it;});INTERACT.set(it.id,it);return it;}
function drawPrints(it){const pr=it.rec?.pr||[],list=pr.slice(-PRINT_MAX);it.layer.count=list.length;it.layer.visible=list.length>0;list.forEach((p,i)=>{_po.position.set(p[3]+p[6]*.03,p[4]+p[7]*.03,p[5]+p[8]*.03);_po.up.set(0,1,0);if(Math.abs(p[7])>.95)_po.up.set(0,0,1);_po.lookAt(p[3]+p[6],p[4]+p[7],p[5]+p[8]);_po.rotateZ((hashStr(p[0])-.5)*1.2);_po.scale.setScalar(.85+hashStr(p[1])*.3);_po.updateMatrix();it.layer.setMatrixAt(i,_po.matrix);});it.layer.instanceMatrix.needsUpdate=true;}
function proxy(x,y,z,w,h,d,parent=scene){const m=new THREE.Mesh(unitBox,new THREE.MeshBasicMaterial({visible:false}));m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;}
function agoText(ms){const s=Math.max(0,(Date.now()-ms)/1000);return s<60?'방금':s<3600?`${Math.floor(s/60)}분 전`:s<86400?`${Math.floor(s/3600)}시간 전`:`${Math.floor(s/86400)}일 전`;}

// The elevator: call it from a landing, or tap the glass.
defineThing({id:'elevator',name:'투명 엘리베이터',root:carGroup,extraRoots:landings.filter(Boolean).map(l=>l.group),anchor:()=>new THREE.Vector3(SHAFT.x,car.y+1.6,SHAFT.front),reach:8,
  touch(){const l=nearLanding(player.position);if(inCar(player.position)){toast('패널에서 층을 고르세요.');return {k:'유리를 두드림'};}if(l&&!(car.cur===l.floor&&!car.trip)){requestTrip(l.floor);sfx('close');toast(`엘리베이터를 불렀습니다. 지금 ${nearestFloorLabel(car.y)}층에 있습니다.`);return null;}if(l)Village.action({type:'door'});return {k:'유리를 두드림'};},
  apply(rec,source){/* The central elevator state is applied by Village. */}});

// The greenhouse grows a hand for every visitor who touches it.
const greenhouseHands=new THREE.InstancedMesh(HAND_GEO,frostedHand,48);greenhouseHands.count=0;greenhouseHands.frustumCulled=false;greenHouse.add(greenhouseHands);
// Hands grow out of the shrubs, pointing away from each bush.
const GH_UP=new THREE.Vector3(0,1,0);
const ghSlots=[...Array(48)].map((_,i)=>{const p=planters[i%6],a=hashStr('gha'+i)*TAU,el=.25+hashStr('ghe'+i)*1.05,dir=new THREE.Vector3(Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el));return {x:p.x+dir.x*1.02,y:1.7+dir.y*1.02,z:p.z+dir.z*1.02,dir,phase:hashStr('gh'+i)*TAU,grow:0};});
const _gq=new THREE.Quaternion(),_gd=new THREE.Vector3();
const ghState={target:0,turn:0,fog:0,open:0};
{const gm=greenHouse.children.find(c=>c.isInstancedMesh&&c.material===clearGlass);if(gm){gm.setMatrixAt(0,new THREE.Matrix4().makeScale(0,0,0));gm.instanceMatrix.needsUpdate=true;}
  const panes=new THREE.Group();panes.userData.bake=true;greenHouse.add(panes);const pane=(x,y,z,w,h,d)=>box(x,y,z,w,h,d,clearGlass,panes);
  pane(-6,3.5,0,.04,7,16);pane(6,3.5,0,.04,7,16);pane(0,3.5,-8,12,7,.04);pane(-3.75,3.5,8,4.5,7,.04);pane(3.75,3.5,8,4.5,7,.04);pane(0,5.25,8,3,3.5,.04);bakeStatic(greenHouse);
  ghState.doors=[-1,1].map(s=>{const d=box(s*.75,1.75,8.05,1.5,3.5,.05,clearGlass,greenHouse);d.userData.keep=true;return d;});
  const gx=greenHouse.position.x,gz=greenHouse.position.z,gy=greenHouse.position.y;
  addSolid(gx-6.1,gx-5.9,gy,gy+7,gz-8,gz+8,'gh');addSolid(gx+5.9,gx+6.1,gy,gy+7,gz-8,gz+8,'gh');addSolid(gx-6,gx+6,gy,gy+7,gz-8.1,gz-7.9,'gh');addSolid(gx-6,gx-1.5,gy,gy+7,gz+7.9,gz+8.1,'gh');addSolid(gx+1.5,gx+6,gy,gy+7,gz+7.9,gz+8.1,'gh');
  ghState.doorSolid=addSolid(gx-1.5,gx+1.5,gy,gy+3.5,gz+7.9,gz+8.1,'ghdoor');}
defineThing({id:'greenhouse',name:'아무도 없는 온실',root:greenHouse,anchor:()=>greenHouse.position.clone().setY(greenHouse.position.y+2),reach:10,
  touch(){ghState.turn=4;sfx('grow');if(Math.random()<.22){ghState.fog=6;later(.4,()=>hallucinate({text:'여기 안이에요. 유리 안쪽이요.',preset:'whisper'},{force:true}));}else if(Math.random()<.35)voiceSay('물 주셔서 고마워요.','whisper');return {k:'손을 심음'};},
  apply(rec){ghState.target=Math.min(48,rec.n);}});
function updateGreenhouse(dt){const p=player.position,gp=greenHouse.position;const near=Math.hypot(p.x-gp.x,p.z-(gp.z+8))<4.2&&Math.abs(p.y-gp.y)<3;ghState.open+=((near?1:0)-ghState.open)*Math.min(1,dt*5);ghState.doors.forEach((d,i)=>d.position.x=(i?1:-1)*(.75+ghState.open*1.45));ghState.doorSolid.on=ghState.open<.7;
  ghState.turn=Math.max(0,ghState.turn-dt);ghState.fog=Math.max(0,ghState.fog-dt);clearGlass.opacity=.26+Math.min(1,ghState.fog)*.45;
  greenhouseHands.count=ghState.target;if(!ghState.target)return;const lp=greenHouse.worldToLocal(p.clone());
  for(let i=0;i<ghState.target;i++){const s=ghSlots[i];s.grow=Math.min(1,s.grow+dt*.5);_gd.copy(s.dir);if(ghState.turn>0)_gd.lerp(_tv.set(lp.x-s.x,lp.y+1.6-s.y,lp.z-s.z).normalize(),.7).normalize();_gd.x+=Math.sin(worldTime*.8+s.phase)*.12;_gd.z+=Math.cos(worldTime*.7+s.phase)*.12;_gq.setFromUnitVectors(GH_UP,_gd.normalize());_po.position.set(s.x,s.y,s.z);_po.quaternion.copy(_gq);_po.rotateY(s.phase);_po.scale.setScalar(5.6*ease(s.grow));_po.updateMatrix();greenhouseHands.setMatrixAt(i,_po.matrix);}
  greenhouseHands.instanceMatrix.needsUpdate=true;}

// Every apartment block keeps a window lit for each visitor who rang.
const towerLights=new Map();
for(const b of buildings){const c=document.createElement('canvas');c.width=64;c.height=128;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;
  const lightPlane=mesh(new THREE.PlaneGeometry(b.w*.83,b.h*.94),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}),0,b.h/2,b.d/2+.09,b.group);lightPlane.visible=false;
  const ghost=createMannequin();ghost.root.scale.setScalar(.75);ghost.root.visible=false;b.group.add(ghost.root);
  towerLights.set(b.id,{b,c,tex,lit:-1,ghost,ghostT:0,cells:[],plane:lightPlane});
  const tp=proxy(0,1.8,b.d/2+1,b.w+1.4,3.6,1.6,b.group);
  defineThing({id:'tower:'+b.id,name:`${b.id}동 현관`,root:tp,printParent:b.group,anchor:()=>b.group.position.clone().add(new THREE.Vector3(0,1.6,b.d/2+.8)),reach:6,
    touch(){sfx('ding');const tl=towerLights.get(b.id);if(Math.random()<.3){tl.ghostT=6;later(1.2,()=>voiceSay('누구세요?','deep',{loud:true}));}else voiceSay(`${b.id}동입니다. 문을 열어 드릴 수 없습니다.`,'announcer',{soft:true});return {k:'초인종'};},
    apply(rec){drawTowerLights(b.id,rec.n);}});}
function windowCell(id,i){return Math.floor(hashStr(id+':'+i)*96);}
function drawTowerLights(id,n){const tl=towerLights.get(id);if(!tl||tl.lit===n)return;tl.lit=n;const g=tl.c.getContext('2d');g.clearRect(0,0,64,128);const lit=new Set();for(let i=0;i<Math.min(n,96);i++){let c=windowCell(id,i),k=0;while(lit.has(c)&&k++<96)c=(c+1)%96;lit.add(c);}
  for(const c of lit){const col=c%6,row=Math.floor(c/6);g.fillStyle='rgba(255,226,150,.78)';g.fillRect(col*64/6+1.5,row*8+1.5,64/6-3,5);}tl.tex.needsUpdate=true;tl.cells=[...lit];tl.plane.visible=lit.size>0;}
function updateTowers(dt){for(const tl of towerLights.values()){if(tl.ghostT>0){tl.ghostT-=dt;if(!tl.ghost.root.visible){const cells=tl.cells.length?tl.cells:[windowCell(tl.b.id,0)],c=cells[Math.floor(Math.random()*cells.length)],col=c%6,row=Math.floor(c/6),w=tl.b.w*.83,h=tl.b.h*.94;tl.ghost.root.position.set(-w/2+(col+.5)*w/6,tl.b.h/2+h/2-(row+1)*h/16,tl.b.d/2-.6);tl.ghost.root.visible=true;}poseMannequin(tl.ghost,{speed:0,t:worldTime,wave:true},dt);}else tl.ghost.root.visible=false;}}

// The mirror sculpture remembers how fast it has been spun, and briefly forgets you.
const sculptState={spin:.11,lift:0,reflectUntil:0,rt:null,cam:null};
defineThing({id:'sculpture',name:'미래를 비추는 구체',root:sculpture,anchor:()=>sculpture.position.clone().setY(sculpture.position.y+3),reach:9,
  touch(){sculptState.lift=1;sfx('whoosh');reflectWithoutYou();return {k:'돌림'};},apply(rec){sculptState.spin=.11+Math.min(rec.n,60)*.015;}});
function reflectWithoutYou(){try{if(!sculptState.rt){sculptState.rt=new THREE.WebGLCubeRenderTarget(128);sculptState.cam=new THREE.CubeCamera(1,500,sculptState.rt);scene.add(sculptState.cam);}chromeBall.getWorldPosition(sculptState.cam.position);player.visible=false;chromeBall.visible=false;sculptState.cam.update(renderer,scene);player.visible=true;chromeBall.visible=true;
  if(chromeBall.material===chrome)chromeBall.material=phong(0xcbdad5,{envMap:sculptState.rt.texture,combine:THREE.MixOperation,reflectivity:.95,shininess:120});sculptState.reflectUntil=worldTime+14;later(1.6,()=>voiceSay('구체에 당신이 비치지 않습니다.','whisper'));}catch(e){console.error('[APT200X] reflection',e);}}
function updateSculpture(dt){orbit.rotation.z+=dt*(timeFrozen?0:sculptState.spin);sculptState.lift=Math.max(0,sculptState.lift-dt*.12);chromeBall.position.y=5.1+Math.sin(Math.min(1,sculptState.lift)*Math.PI)*5;chromeBall.rotation.y+=dt*sculptState.lift*6;if(sculptState.reflectUntil&&worldTime>sculptState.reflectUntil){chromeBall.material.dispose();chromeBall.material=chrome;sculptState.reflectUntil=0;}}

// The stairway grows one step for every visitor who reaches the top. Stay too long and the bottom goes away.
const stairInst=scene.children.find(c=>c.isInstancedMesh&&c.material===stairMat);const stairExtra={count:0,topTime:0,vanished:0,visit:false,away:0,tick:0};
const stairTopY=()=>stair.base+stair.steps*stair.height;
defineThing({id:'stairway',name:'끝나지 않는 계단',root:proxy(stair.x,stair.base+5,stair.z-12,stair.w,10,26),printParent:scene,anchor:()=>new THREE.Vector3(stair.x,player.position.y+1.5,clamp(player.position.z,stair.z-24,stair.z)),reach:6,
  touch(){return {k:'난간을 짚음'};},apply(rec){buildStairExtra(Math.min(40,Number(rec.st?.steps)||0));}});
function buildStairExtra(n){while(stairExtra.count<n){const i=stairExtra.count++,top=stairTopY()+(i+1)*stair.height,z=stair.z-stair.steps*stair.depth-2.5-(i+.5)*stair.depth;box(stair.x,top-.2,z,stair.w,.4,stair.depth+.03,stairMat);addSolid(stair.x-stair.w/2,stair.x+stair.w/2,top-.4,top,z-stair.depth/2,z+stair.depth/2,'stair+');}}
function updateStair(dt){const p=player.position,onTop=Math.abs(p.x-stair.x)<stair.w/2&&p.z<stair.z-stair.steps*stair.depth+.5&&p.y>stairTopY()-.2&&grounded;
  if(onTop){stairExtra.topTime+=dt;stairExtra.away=0;if(!stairExtra.visit&&stairExtra.topTime>1){stairExtra.visit=true;const it=INTERACT.get('stairway');World.touch('stairway',{k:'꼭대기 도달',st:{steps:Math.min(40,(Number(it.rec?.st?.steps)||0)+1)},pt:new THREE.Vector3(stair.x+stair.w/2,stairTopY()+1,p.z),n:new THREE.Vector3(-1,0,0)});toast('계단이 한 칸 더 자랐습니다. 다음 사람은 한 칸 더 올라갑니다.');}
    if(stairExtra.topTime>4&&stairExtra.vanished<stair.steps&&stairInst){stairExtra.tick+=dt;if(stairExtra.tick>.35){stairExtra.tick=0;const i=stairExtra.vanished++;stairInst.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0));stairInst.instanceMatrix.needsUpdate=true;stairSteps[i].on=false;sfx('tick');if(i===2)hallucinate({text:'내려가는 길은 분양되지 않았습니다.',preset:'deep'},{force:true});}}}
  else{stairExtra.topTime=0;if(p.z>stair.z-stair.steps*stair.depth+2||p.y<stairTopY()-3){stairExtra.away+=dt;if(stairExtra.away>2)stairExtra.visit=false;}
    if(stairExtra.vanished>0&&stairExtra.away>3&&stairInst){for(let i=0;i<stairExtra.vanished;i++){const h=(i+1)*stair.height;_po.position.set(stair.x,stair.base+h/2,stair.z-i*stair.depth);_po.rotation.set(0,0,0);_po.scale.set(stair.w,h,stair.depth+.03);_po.updateMatrix();stairInst.setMatrixAt(i,_po.matrix);stairSteps[i].on=true;}stairInst.instanceMatrix.needsUpdate=true;stairExtra.vanished=0;}}}

// A door appears in the tiled wall once anyone has touched it. It opens onto the meadow under the ground.
const wallDoor=new THREE.Group();wallDoor.position.set(-38,terrainY(-38,10),10);scene.add(wallDoor);wallDoor.visible=false;
for(const s of [-1,1]){box(0,1.75,s*.38,1.6,3.5,.06,phong(0xf4f2ea,{shininess:90}),wallDoor).userData.keep=true;box(0,1.8,s*.37,1.9,3.8,.04,white,wallDoor).userData.keep=true;sphere(.55,1.7,s*.42,.07,silver,wallDoor);}
defineThing({id:'tilewall',name:'흰 타일 벽',root:tileWall,extraRoots:[wallDoor],printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,-44,-32),terrainY(-38,10)+1.8,player.position.z>10?10.5:9.5),reach:5,
  touch(hit){const nearDoor=hit?Math.abs(hit.point.x+38)<1.2:Math.abs(player.position.x+38)<2.2;if(wallDoor.visible&&nearDoor){enterB3();return {k:'문을 열고 내려감'};}return {k:'벽을 짚음',st:{door:1}};},
  apply(rec){wallDoor.visible=!!rec.st?.door||rec.n>0;}});
function enterB3(){flash('white');sfx('whoosh');teleport(97.4,-39.9,-140,-Math.PI/2);heading.rotation.y=-Math.PI/2;later(.8,()=>hallucinate({text:'어서 오세요. 여기도 오후 두 시예요.',preset:'deep'},{force:true}));}
defineThing({id:'b3door',name:'칠해지지 않은 문',root:B3.door,printParent:scene,anchor:()=>new THREE.Vector3(99,-38.2,-140),reach:5,
  touch(){flash('white');sfx('whoosh');teleport(-38,terrainY(-38,12)+.3,12.4,Math.PI);later(.6,()=>voiceSay('다시 위입니다. 아마도요.','whisper'));return {k:'위로 나감'};}});

// The freestanding gate: walk through it and the world is mirrored for a while.
const gateProbe={side:null};let mirrorUntil=0;
defineThing({id:'gate',name:'방이 없는 문',root:proxy(71,terrainY(71,-79)+9,-79,14,18,3),printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,64,78),terrainY(71,-79)+1.6,-79),reach:6,touch(){return {k:'문틀을 짚음'};}});
function updateGate(){if(mirrorUntil&&worldTime>mirrorUntil){mirrorUntil=0;document.body.classList.remove('mirror');}const p=player.position,inside=p.x>66&&p.x<76&&Math.abs(p.y-terrainY(p.x,p.z))<4&&Math.abs(p.z+79)<6;if(!inside){gateProbe.side=null;return;}const side=p.z>-79;
  if(gateProbe.side!==null&&side!==gateProbe.side){document.body.classList.add('mirror');mirrorUntil=worldTime+12;sfx('whoosh');voiceSay('거울 쪽으로 오셨습니다.','whisper');World.touch('gate',{k:'통과',pt:new THREE.Vector3(66.1,p.y+1.5,-79),n:new THREE.Vector3(1,0,0)});}gateProbe.side=side;}

// Benches: sit, and the afternoon finally moves.
let timeLapse=0;
benchSpots.forEach(([x,z],i)=>{const y=terrainY(x,z);addSolid(x-1.5,x+1.5,y,y+.89,z-.35,z+.35,'bench');defineThing({id:'bench:'+i,name:'단지 벤치',root:proxy(x,y+.9,z-.1,3,1.8,.9),printParent:scene,anchor:()=>new THREE.Vector3(x,y+1,z),reach:4,
  touch(){sitOn({x,y:y+.38,z:z+.02,yaw:0,onStand:()=>{timeLapse=0;}});later(4,()=>{if(motion.sitting){timeLapse=.0001;voiceSay('쉬어가세요. 해가 지는 걸 보여 드릴게요.','whisper');}});return {k:'앉음'};}});});

// The sales sign signs itself with the names of everyone who touched it.
const signOriginal=signTex.image.getContext('2d').getImageData(0,0,512,256);
defineThing({id:'sign',name:'분양 안내판',root:signBoard,printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,5.6,10.4),terrainY(8,12)+1.5,player.position.z>12?12.4:11.6),reach:5,touch(){return {k:'서명'};},
  apply(rec){const g=signTex.image.getContext('2d');if(!rec.n){g.putImageData(signOriginal,0,0);signTex.needsUpdate=true;return;}g.fillStyle='#f2f2e6';g.fillRect(0,0,512,256);g.fillStyle='#396c63';g.font='20px Arial';g.fillText('PUREUN VILLAGE · 입주 완료',32,44);g.font='30px Arial';const last=rec.pr[rec.pr.length-1];g.fillText(`방문자 #${last?last[1]:'????'}님, 환영합니다`,30,92);g.font='13px monospace';g.fillStyle='#84998a';rec.pr.slice(-5).reverse().forEach((p,i)=>g.fillText(`#${p[1]}  ${new Date(p[2]).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}  손자국`,32,132+i*20));g.fillRect(32,236,445,1);g.fillText(`누적 서명 ${rec.n} · 동·호수 미정`,33,252);signTex.needsUpdate=true;}});

// Sky tower lobby: a band of light climbs 142 floors.
let bandStart=-99;
defineThing({id:'skytower',name:'스카이타워 로비',root:lobbyGlass,printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,45.5,52.5),P0+1.8,SKY.z+13.4),reach:6,touch(){voiceSay('올라가실 층을 말씀해 주세요.','announcer');bandStart=worldTime;return {k:'불빛',st:{w:Date.now()}};},apply(rec,source){const w=Number(rec.st?.w)||0;if(source==='remote'&&Date.now()-w<15000)bandStart=worldTime;}});
function updateBand(){const t=worldTime-bandStart;lightBand.visible=t>=0&&t<7;if(!lightBand.visible)return;lightBand.position.y=P0+ease(t/7)*(DECK_Y-P0);const s=lightBand.position.y<82?27.2:lightBand.position.y<150?23.2:19.2;lightBand.scale.set(s,1.2,s);lightBand.material.opacity=Math.sin(Math.min(1,t/7)*Math.PI)*.85;}

// 142F binoculars: someone on a far hill is looking back.
const telescope=new THREE.Group();telescope.position.set(72,DECK_Y,-178.6);vertical.add(telescope);let scopeView=false;
mesh(new THREE.CylinderGeometry(.08,.12,1.2,8),silver,0,.6,0,telescope);const scopeHead=new THREE.Group();scopeHead.position.y=1.35;telescope.add(scopeHead);box(0,0,0,.6,.35,.5,phong(0x3f7d78,{shininess:120}),scopeHead).userData.keep=true;for(const s of [-1,1])mesh(new THREE.CylinderGeometry(.09,.11,.42,10),silver,s*.15,0,.38,scopeHead).rotation.x=Math.PI/2;
const watcher=createMannequin();watcher.root.scale.setScalar(1.6);watcher.root.visible=false;scene.add(watcher.root);const WATCH={x:-230,z:150};
defineThing({id:'telescope',name:'동전 망원경',root:telescope,anchor:()=>telescope.position.clone().setY(DECK_Y+1.3),reach:4,
  touch(){const wy=terrainY(WATCH.x,WATCH.z);watcher.root.position.set(WATCH.x,wy,WATCH.z);watcher.root.visible=true;watcher.heading.rotation.y=Math.atan2(telescope.position.x-WATCH.x,telescope.position.z-WATCH.z);
    const eye=telescope.position.clone().add(new THREE.Vector3(0,1.6,0)),look=new THREE.Vector3(WATCH.x,wy+3,WATCH.z);camera.fov=7;camera.updateProjectionMatrix();scopeView=true;
    camOverride={dur:6,rate:20,pos:()=>eye,look:()=>look,done:()=>{scopeView=false;resize();later(2,()=>{watcher.root.visible=false;});}};motion.lock=6;later(3.2,()=>voiceSay('거기서 뭐 하세요?','deep',{loud:true}));return {k:'관측'};}});

// The twin's 47F door: knock, and something knocks back.
defineThing({id:'twindoor',name:'트윈 47층 문',root:twinDoor,printParent:scene,anchor:()=>new THREE.Vector3(102.6,BRIDGE_Y+1.6,-179.5),reach:4,
  touch(){sfx('knock');later(1.4,()=>{sfx('knock');shake(.5,.4);voiceSay('아무도... 없어요.','deep',{loud:true});});return {k:'노크'};}});

// B3: the dish of arms. Each touch adds one more arm, for everyone.
const dishState={target:DISH.base,reach:0};
defineThing({id:'dish',name:'손이 자라는 접시',root:proxy(DISH.x,-39.4,DISH.z,DISH.r*2,1.4,DISH.r*2),printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,DISH.x-DISH.r,DISH.x+DISH.r),-38.5,clamp(player.position.z,DISH.z-DISH.r,DISH.z+DISH.r)),reach:3.5,
  touch(){dishState.reach=6;sfx('grow');hallucinate({text:'여기야. 여기. 여기.',preset:'whisper'},{force:true});return {k:'손을 잡음'};},apply(rec){dishState.target=Math.min(DISH.max,DISH.base+rec.n);}});
function updateDish(dt){if(!under.visible)return;const n=dishState.target;DISH.arms.count=n;dishState.reach=Math.max(0,dishState.reach-dt);const p=player.position,near=Math.hypot(p.x-DISH.x,p.z-DISH.z)<10&&Math.abs(p.y+40)<4;
  for(let i=0;i<n;i++){const s=DISH.slots[i],wx=DISH.x+s.x,wz=DISH.z+s.z,toward=Math.atan2(p.x-wx,p.z-wz),lean=near||dishState.reach>0?.55+.25*Math.sin(worldTime*2+s.phase):s.lean;_po.position.set(wx,-39.75,wz);_po.rotation.set(0,0,0);_po.rotateY(near?toward:s.phase*2);_po.rotateX(lean+Math.sin(worldTime*1.3+s.phase)*.08);_po.scale.setScalar(s.s);_po.updateMatrix();DISH.arms.setMatrixAt(i,_po.matrix);}DISH.arms.instanceMatrix.needsUpdate=true;
  camera.getWorldDirection(projected);for(const st of statues){const dx=st.x-camera.position.x,dz=st.z-camera.position.z,l=Math.hypot(dx,dz)||1;if((projected.x*dx+projected.z*dz)/l<.55)st.look=Math.atan2(p.x-st.x,p.z-st.z);st.rig.heading.rotation.y=st.look||st.baseYaw;}}

// B2: touch the water and the room answers twice.
defineThing({id:'pool',name:'미개장 수영장',root:POOL.water3d,printParent:scene,anchor:()=>new THREE.Vector3(clamp(player.position.x,POOL.minX,POOL.maxX),POOL.water,clamp(player.position.z,POOL.minZ,POOL.maxZ)),reach:4,
  touch(){sfx('splash');POOL.ripple=3;later(.8,()=>voiceSay('누구 있어요?','whisper'));later(2.6,()=>voiceSay('누구 있어요?','whisper'));return {k:'물결'};}});
// B1: every car remembers being touched; their alarms still work.
defineThing({id:'cars',name:'출차하지 못한 차',root:B1.cars,printParent:scene,anchor:()=>{let best=B1.carSlots[0],d=Infinity;for(const s of B1.carSlots){const dd=Math.hypot(player.position.x-s[0],player.position.z-s[1]);if(dd<d){d=dd;best=s;}}return new THREE.Vector3(best[0],-11,best[1]);},reach:4,
  touch(hit){sfx('alarm');shake(.3,.3);const i=hit?.instanceId??0,c=new THREE.Color();B1.cars.getColorAt(i,c);B1.cars.setColorAt(i,new THREE.Color(0xfff2a0));B1.cars.instanceColor.needsUpdate=true;later(.8,()=>{B1.cars.setColorAt(i,c);B1.cars.instanceColor.needsUpdate=true;});later(1.4,()=>voiceSay('출차 주의. 출차 주의. 출구가 없습니다.','announcer'));return {k:'경보'};}});

// The wings of hands on top of the mycelium: touch them and falling becomes flying.
defineThing({id:'mycelium',name:'매달린 손의 날개',root:MYCELIUM.wingsArt.group,printParent:scene,anchor:()=>new THREE.Vector3(MYCELIUM.x,MYCELIUM.top+3,MYCELIUM.z),reach:6,
  touch(){if(!motion.blessed){motion.blessed=true;motion.flaps=3;toast('손으로 된 날개를 얻었습니다. 떨어지는 동안 점프를 누르면 날갯짓합니다.');hallucinate({text:'뛰어내리세요. 받아 줄게요.',preset:'giant'},{force:true});}return {k:'날개를 만짐'};}});

// The diorama: touch the model and a hand the size of a building touches the real village.
const giantHand=new THREE.Mesh(ARM_GEO,frostedHand);giantHand.scale.setScalar(120);giantHand.rotation.x=Math.PI;giantHand.visible=false;scene.add(giantHand);const handEvent={t:-99,x:0,z:0};
if(diorama)defineThing({id:'diorama',name:'푸른마을 전체 모형',root:diorama.group,printParent:scene,anchor:()=>diorama.dome.position.clone().setY(diorama.dome.position.y+2.2),reach:5,
  touch(hit){let wx=player.position.x,wz=player.position.z;if(hit){const lp=diorama.group.worldToLocal(hit.point.clone());wx=clamp(lp.x/diorama.scale,-260,260);wz=clamp(lp.z/diorama.scale,-260,260);}handEvent.t=worldTime;handEvent.x=wx;handEvent.z=wz;toast('모형을 만졌습니다. 진짜 단지 위로 손이 내려옵니다.');return {k:'모형을 만짐',st:{x:Math.round(wx),z:Math.round(wz),t:Date.now()}};},
  apply(rec,source){const st=rec.st||{};if(source==='remote'&&Date.now()-(Number(st.t)||0)<20000&&Number.isFinite(st.x)&&Number.isFinite(st.z)){handEvent.t=worldTime;handEvent.x=clamp(st.x,-300,300);handEvent.z=clamp(st.z,-300,300);if(Math.hypot(player.position.x-handEvent.x,player.position.z-handEvent.z)<160)later(2,()=>{sfx('rise');shake(.9,1.4);});}}});
function updateGiantHand(){const t=worldTime-handEvent.t;giantHand.visible=t>=0&&t<11;if(!giantHand.visible)return;const ground=terrainY(handEvent.x,handEvent.z),k=t<4?ease(t/4):t<6?1:1-ease((t-6)/5);giantHand.position.set(handEvent.x,ground+210-k*(210-24),handEvent.z);}

// Props from the memories respond too, and remember.
const coinGeo=new THREE.CylinderGeometry(.12,.12,.03,10),coinMat=phong(0xd8c070,{shininess:160});
const PROP_NAMES={GlassPhoneBooth2002:'2002년 공중전화',PlasticPlaygroundSlide:'플라스틱 미끄럼틀',GeometricFountain:'팔각 분수대',LowPolyPineTree:'플라스틱 소나무',CyberModelHouseDome:'사이버 모델하우스',FloatingElevatorCore:'혼자 선 엘리베이터',FuturisticAptTowerA:'200X 시범 아파트',EndlessColonnade:'끝없는 회랑',TiledMazeWall:'타일 가벽',RotatingChromeSphere:'크롬 구체 조형물',StairwayToNowhere:'허공 계단',GoldenEmblemGate:'황금 문주'};
for(const [key,g] of Object.entries(EGG_TARGETS)){const def=INITIAL_EASTER_EGGS.find(d=>d.id===key),parts=g.userData.parts||{};
  let coins=null;if(def.visualTarget==='GeometricFountain'){coins=new THREE.InstancedMesh(coinGeo,coinMat,60);coins.count=0;g.add(coins);}
  const box3=new THREE.Box3().setFromObject(g);
  defineThing({id:'egg:'+key,name:PROP_NAMES[def.visualTarget]||def.visualTarget,root:g,anchor:()=>new THREE.Vector3(clamp(player.position.x,box3.min.x,box3.max.x),clamp(player.position.y+1.6,box3.min.y,box3.max.y),clamp(player.position.z,box3.min.z,box3.max.z)),reach:4.5,
    touch(){switch(def.visualTarget){case 'GlassPhoneBooth2002':sfx('ring');later(1.6,()=>voiceSay('지금 거신 번호는 아직 분양되지 않은 번호입니다.','announcer'));break;case 'GeometricFountain':sfx('coin');break;case 'PlasticPlaygroundSlide':sfx('popup');if(Math.random()<.4)later(.8,()=>voiceSay('한 번 더!','child'));break;case 'FloatingElevatorCore':if(parts.cabin){parts.cabin.position.y=3;sfx('ding');}break;case 'GoldenEmblemGate':if(parts.emblem)parts.emblem.userData.spin=3;sfx('coin');break;case 'RotatingChromeSphere':if(parts.r1)parts.r1.userData.spin=4;sfx('whoosh');break;default:sfx('tick');}return {k:def.visualTarget==='GeometricFountain'?'동전을 던짐':'만짐'};},
    apply(rec){if(!coins)return;coins.count=Math.min(60,rec.n);for(let i=0;i<coins.count;i++){const a=hashStr('coin'+i)*TAU,r=1.2+hashStr('r'+i)*2.6;_po.position.set(Math.cos(a)*r,.18,Math.sin(a)*r);_po.rotation.set(0,a,(hashStr('t'+i)-.5)*.3);_po.scale.setScalar(1);_po.updateMatrix();coins.setMatrixAt(i,_po.matrix);}coins.instanceMatrix.needsUpdate=true;}});}
function updateProps(dt){for(const g of Object.values(EGG_TARGETS)){const p=g.userData.parts;if(!p)continue;for(const m of [p.emblem,p.r1]){if(m&&m.userData.spin>0){m.userData.spin-=dt;m.rotation.y+=dt*8;}}if(p.cabin&&!eggs.some(e=>e.active&&e.target===g)&&p.cabin.position.y<15)p.cabin.position.y=Math.min(15,p.cabin.position.y+dt*2.5);}}

// ─── Finding what was touched ────────────────────────────────────────────────
function thingOf(o){while(o){if(o.userData.thing)return o.userData.thing;o=o.parent;}return null;}
const _eye=new THREE.Vector3();
function thingDistance(it){_eye.set(player.position.x,player.position.y+1.5,player.position.z);return it.anchor().distanceTo(_eye);}
function nearestThing(){let best=null,bd=Infinity;for(const it of INTERACT.values()){if(!it.root.visible&&!it.extraRoots)continue;const d=thingDistance(it);if(d<it.reach&&d<bd){bd=d;best=it;}}return best;}
const _ray=new THREE.Raycaster();
function touchThing(it,hit=null){if(!it||Date.now()-(it.lastTouch||0)<450)return;it.lastTouch=Date.now();let result=null;try{result=it.touch?it.touch(hit):{k:'만짐'};}catch(e){console.error('[APT200X] touch',it.id,e);}if(!result)return;
  let pt=hit?.point?.clone(),n=null;if(hit&&hit.face){n=hit.face.normal.clone();let mw=hit.object.matrixWorld;if(hit.object.isInstancedMesh&&hit.instanceId!==undefined){const im=new THREE.Matrix4();hit.object.getMatrixAt(hit.instanceId,im);mw=mw.clone().multiply(im);}n.transformDirection(mw);}
  if(!pt){const from=player.position.clone().setY(player.position.y+1.6),to=it.anchor();_ray.set(from,to.clone().sub(from).normalize());_ray.far=it.reach+3;const h=_ray.intersectObject(it.root,true).find(x=>x.object!==it.layer);if(h){pt=h.point.clone();if(h.face)n=h.face.normal.clone().transformDirection(h.object.matrixWorld);}else pt=to;}
  const toPlayer=player.position.clone().setY(pt.y).sub(pt);if(!n)n=toPlayer.lengthSq()>1e-6?toPlayer.normalize():new THREE.Vector3(0,0,1);else if(n.dot(toPlayer)<0)n.negate();
  World.touch(it.id,{k:result.k,st:result.st,pt,n});}

