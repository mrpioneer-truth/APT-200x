// ─── Skyline: Pureun Sky Tower 142, its twin, the skybridge, and the landmarks of the 30 memories ──
const vertical=new THREE.Group();vertical.name="vertical";scene.add(vertical);
const SKY={x:60,z:-200},P0=.6,DECK_Y=196,BRIDGE_Y=64;
const SHAFT={minX:58.25,maxX:61.75,minZ:-186.25,maxZ:-182.75,x:60,z:-184.5,front:-182.75};
const concreteTex=texCanvas(128,128,(g)=>{g.fillStyle='#c4c8c0';g.fillRect(0,0,128,128);for(let i=0;i<2600;i++){g.fillStyle=rand2()>.5?'rgba(255,255,255,.12)':'rgba(60,70,64,.10)';g.fillRect(rand2()*128,rand2()*128,1+rand2()*2,1+rand2()*2);}g.strokeStyle='rgba(90,100,94,.25)';g.strokeRect(0,0,128,128);});concreteTex.wrapS=concreteTex.wrapT=THREE.RepeatWrapping;concreteTex.repeat.set(4,4);
const concrete=phong(0xffffff,{map:concreteTex,shininess:30,specular:0x333333});
const glassRail=phong(0xc8eee4,{transparent:true,opacity:.32,shininess:140,depthWrite:false,side:THREE.DoubleSide});
function glassSkin(rx,ry){const t=glassTex.clone();t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.needsUpdate=true;return phong(0xffffff,{map:t,shininess:115});}
function labelTex(w,h,lines,bg='#f2f2e6',fg='#396c63'){return texCanvas(w,h,(g)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;for(const [text,size,x,y,color] of lines){g.font=size;g.fillStyle=color||fg;g.fillText(text,x,y);}});}
function quad(a,b,c,d,mat,parent=scene,uv=[0,0,1,0,0,1,1,1]){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...d],3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);parent.add(m);return m;}
function slab(minX,maxX,minY,maxY,minZ,maxZ,mat,parent=vertical,tag='slab'){box((minX+maxX)/2,(minY+maxY)/2,(minZ+maxZ)/2,maxX-minX,maxY-minY,maxZ-minZ,mat,parent);return addSolid(minX,maxX,minY,maxY,minZ,maxZ,tag);}
function railing(x0,z0,x1,z1,y,parent=vertical,h=1.15){const len=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,alongX=Math.abs(x1-x0)>Math.abs(z1-z0);box(cx,y+h/2,cz,alongX?len:.06,h,alongX?.06:len,glassRail,parent);box(cx,y+h,cz,alongX?len:.12,.1,alongX?.12:len,silver,parent);addSolid(Math.min(x0,x1)-.08,Math.max(x0,x1)+.08,y,y+h,Math.min(z0,z1)-.08,Math.max(z0,z1)+.08,'rail');}

// Plaza: a raised white stone square with a soft step, the shaft hole cut out of it.
slab(32,88,-1,P0,-228,SHAFT.minZ,white);slab(32,88,-1,P0,SHAFT.maxZ,-172,white);slab(32,SHAFT.minX,-1,P0,SHAFT.minZ,SHAFT.maxZ,white);slab(SHAFT.maxX,88,-1,P0,SHAFT.minZ,SHAFT.maxZ,white);
for(const [a,b,c,d] of [[30.5,89.5,-172,-170.5],[30.5,89.5,-229.5,-228],[30.5,32,-228,-172],[88,89.5,-228,-172]])slab(a,b,-1,.3,c,d,cream);

// Pureun Sky Tower: three setbacks, glass skins, white fins, a roof deck at 142F.
const skyTower=new THREE.Group();skyTower.name='skytower';skyTower.position.set(SKY.x,P0,SKY.z);vertical.add(skyTower);
const TOWER_SECTIONS=[{w:26,y0:0,y1:82,rep:[3,2]},{w:22,y0:82,y1:150,rep:[2.5,1.7]},{w:18,y0:150,y1:DECK_Y-P0,rep:[2,1.2]}];
for(const s of TOWER_SECTIONS){const h=s.y1-s.y0,cy=(s.y0+s.y1)/2,gm=glassSkin(...s.rep);if(s.y0===0)openBuildingCore(skyTower,SKY.x,SKY.z,P0,s.w,s.w,s.y1,-6,'skytower');else box(0,cy,0,s.w,h,s.w,white,skyTower);for(const [x,z,w,d] of [[0,s.w/2+.03,s.w*.86,.08],[0,-s.w/2-.03,s.w*.86,.08],[s.w/2+.03,0,.08,s.w*.86],[-s.w/2-.03,0,.08,s.w*.86]])box(x,s.y0===0&&z>0?(4.6+s.y1)/2:cy,z,w,s.y0===0&&z>0?(s.y1-4.6)*.96:h*.96,d,gm,skyTower);for(const sx of [-1,1])for(const sz of [-1,1])box(sx*s.w*.47,cy,sz*s.w*.47,.9,h,.9,white,skyTower);for(let y=s.y0+12;y<s.y1-2;y+=12)box(0,y,0,s.w+.5,.35,s.w+.5,silver,skyTower);box(0,s.y1,0,s.w+1.6,.8,s.w+1.6,white,skyTower);if(s.y0!==0)addSolid(SKY.x-s.w/2-.4,SKY.x+s.w/2+.4,P0+s.y0-1,P0+s.y1+.4,SKY.z-s.w/2-.4,SKY.z+s.w/2+.4,'skytower');}
const lobbySign=labelTex(512,128,[['PUREUN SKY TOWER 142','30px Arial',22,56],['푸른마을 스카이타워 · 하늘과 가장 가까운 분양','18px Arial',24,98,'#84998a']]);
mesh(new THREE.PlaneGeometry(9,2.25),phong(0xffffff,{map:lobbySign}),49,P0+7,SKY.z+13.1,vertical);
const lobbyGlass=box(49,P0+2.4,SKY.z+13.15,7,4.8,.15,phong(0x6aa3ad,{shininess:140,emissive:0x0c2228}),vertical);lobbyGlass.userData.keep=true;
// Light band that climbs the façade when someone touches the lobby.
const lightBand=box(SKY.x,P0,SKY.z,27.2,1.2,27.2,phong(0xffffff,{emissive:0xf4fff8,transparent:true,opacity:0,depthWrite:false}),vertical);lightBand.userData.keep=true;lightBand.visible=false;

// Roof deck with a missing piece of railing on the east side.
slab(44,76,DECK_Y-1.2,DECK_Y,-216,SHAFT.minZ,white);slab(44,76,DECK_Y-1.2,DECK_Y,SHAFT.maxZ,-176,white);slab(44,SHAFT.minX,DECK_Y-1.2,DECK_Y,SHAFT.minZ,SHAFT.maxZ,white);slab(SHAFT.maxX,76,DECK_Y-1.2,DECK_Y,SHAFT.minZ,SHAFT.maxZ,white);
railing(44,-216,76,-216,DECK_Y);railing(44,-176,76,-176,DECK_Y);railing(44,-216,44,-176,DECK_Y);railing(76,-216,76,-200,DECK_Y);railing(76,-196.5,76,-176,DECK_Y);
const halo=mesh(new THREE.TorusGeometry(15.5,.45,8,64),phong(0xffffff,{emissive:0x8fd8e8,shininess:150}),SKY.x,DECK_Y+9,SKY.z,vertical);halo.rotation.x=Math.PI/2;
const crownParts=new THREE.Group();crownParts.userData.bake=true;vertical.add(crownParts);for(const [dx,dz] of [[-11,-11],[11,-11],[-11,11],[11,11]])mesh(new THREE.CylinderGeometry(.12,.12,9,6),silver,SKY.x+dx,DECK_Y+4.5,SKY.z+dz,crownParts);
mesh(new THREE.CylinderGeometry(.18,.6,56,8),silver,SKY.x,DECK_Y+28,SKY.z,crownParts);
const beacon=mesh(new THREE.SphereGeometry(1.1,12,8),phong(0xff6a6a,{emissive:0xff2020}),SKY.x,DECK_Y+57,SKY.z,vertical);
const pavilion=mesh(new THREE.SphereGeometry(4.5,20,10,0,TAU,0,Math.PI/2),xmat(0x9fe0e2,{shininess:150,opacity:.4,side:true}),52,DECK_Y,-206,vertical);
const helipad=mesh(new THREE.CircleGeometry(5,32),phong(0xffffff,{map:labelTex(128,128,[['H','90px Arial',36,96,'#6b8f86']],'#e8efe8'),transparent:false}),67,DECK_Y+.03,-207,vertical);helipad.rotation.x=-Math.PI/2;

// 47F balcony and a glass-floored skybridge to the twin.
slab(47,73,BRIDGE_Y-1,BRIDGE_Y,SHAFT.front,-174,white);
railing(47,-174,73,-174,BRIDGE_Y);railing(47,SHAFT.front,47,-174,BRIDGE_Y);railing(47,SHAFT.front,SHAFT.minX,SHAFT.front,BRIDGE_Y);railing(SHAFT.maxX,SHAFT.front,73,SHAFT.front,BRIDGE_Y);railing(73,SHAFT.front,73,-182,BRIDGE_Y);railing(73,-177,73,-174,BRIDGE_Y);
const bridgeGlass=phong(0xbfeee6,{transparent:true,opacity:.22,shininess:150,depthWrite:false,side:THREE.DoubleSide});
const bridgePanels=[];for(let x=73;x<103;x+=5){const p=box(x+2.5,BRIDGE_Y-.1,-179.5,4.9,.2,5,bridgeGlass,vertical);bridgePanels.push({mesh:p,solid:addSolid(x,x+5,BRIDGE_Y-.6,BRIDGE_Y,-182,-177,'bridge'),x0:x});}
for(const z of [-182,-177]){box(88,BRIDGE_Y-.25,z,30,.3,.3,silver,vertical);railing(73,z,103,z,BRIDGE_Y);}
// The twin: same family, shorter, with a door at 47F that opens onto nothing.
const TWIN={x:114,z:-188};
const twin=new THREE.Group();twin.name='twin';twin.position.set(TWIN.x,P0,TWIN.z);vertical.add(twin);
for(const s of [{w:22,y0:0,y1:92,rep:[2.6,2.2]},{w:18,y0:92,y1:130,rep:[2,1]}]){const h=s.y1-s.y0,cy=(s.y0+s.y1)/2,gm=glassSkin(...s.rep);if(s.y0===0)openBuildingCore(twin,TWIN.x,TWIN.z,P0,s.w,s.w,s.y1,0,'twin');else box(0,cy,0,s.w,h,s.w,white,twin);for(const [x,z,w,d] of [[0,s.w/2+.03,s.w*.86,.08],[0,-s.w/2-.03,s.w*.86,.08],[s.w/2+.03,0,.08,s.w*.86],[-s.w/2-.03,0,.08,s.w*.86]])box(x,s.y0===0&&z>0?(4.6+s.y1)/2:cy,z,w,s.y0===0&&z>0?(s.y1-4.6)*.96:h*.96,d,gm,twin);for(const sx of [-1,1])for(const sz of [-1,1])box(sx*s.w*.47,cy,sz*s.w*.47,.8,h,.8,white,twin);box(0,s.y1,0,s.w+1.4,.7,s.w+1.4,white,twin);if(s.y0!==0)addSolid(TWIN.x-s.w/2-.4,TWIN.x+s.w/2+.4,P0+s.y0-1,P0+s.y1+.4,TWIN.z-s.w/2-.4,TWIN.z+s.w/2+.4,'twin');}
const twinCrown=mesh(new THREE.ConeGeometry(9,10,4),xmat(0x7fc8bc,{shininess:130,opacity:.82}),0,135,0,twin);twinCrown.rotation.y=Math.PI/4;
slab(101,127,-1.5,P0,-201,-175,cream);
const twinDoor=box(102.9,BRIDGE_Y+1.6,-179.5,.25,3.2,2.6,phong(0x7fc8bc,{shininess:140,emissive:0x0b2420}),vertical);twinDoor.userData.keep=true;box(102.85,BRIDGE_Y+1.6,-179.5,.2,3.6,3.2,white,vertical);

// Needle and twin cylinders give the skyline its depth.
const needle=new THREE.Group();needle.userData.bake=true;needle.position.set(138,terrainY(138,-140),-140);vertical.add(needle);
mesh(new THREE.CylinderGeometry(2.6,3.4,150,16),white,0,75,0,needle);for(let y=20;y<150;y+=14)mesh(new THREE.CylinderGeometry(3.5,3.5,1.2,16),xmat(0x8fc7cf,{shininess:150,opacity:.85}),0,y,0,needle);
mesh(new THREE.SphereGeometry(7,20,14),xmat(0x7cb6d6,{shininess:160,opacity:.9}),0,112,0,needle);mesh(new THREE.TorusGeometry(8.5,.3,6,40),silver,0,112,0,needle).rotation.x=Math.PI/2;mesh(new THREE.CylinderGeometry(.12,.4,26,6),silver,0,163,0,needle);
addSolid(134.6,141.4,needle.position.y-1,needle.position.y+150,-143.4,-136.6,'needle');

// Parking ramp: an asphalt slope cut through the meadow, with retaining walls and a portal.
const asphaltTex=texCanvas(64,256,(g)=>{g.fillStyle='#5f6866';g.fillRect(0,0,64,256);for(let i=0;i<900;i++){g.fillStyle=rand2()>.5?'rgba(255,255,255,.06)':'rgba(0,0,0,.08)';g.fillRect(rand2()*64,rand2()*256,1,1);}g.fillStyle='#e8c84a';for(let y=0;y<256;y+=32)g.fillRect(31,y,2,18);g.fillStyle='#d7dcd8';g.fillRect(3,0,2,256);g.fillRect(59,0,2,256);});asphaltTex.wrapS=asphaltTex.wrapT=THREE.RepeatWrapping;asphaltTex.repeat.set(1,3);asphaltTex.magFilter=THREE.NearestFilter;
const asphalt=phong(0xffffff,{map:asphaltTex,shininess:20,specular:0x222222});
const RAMP_TOP=.62,RAMP_BOTTOM=-12;
ramps.push({minX:RAMP.minX,maxX:RAMP.maxX,minZ:RAMP.minZ,maxZ:RAMP.maxZ,z0:RAMP.maxZ,y0:RAMP_TOP,z1:RAMP.minZ,y1:RAMP_BOTTOM});
quad([RAMP.minX,RAMP_TOP+.02,RAMP.maxZ],[RAMP.maxX,RAMP_TOP+.02,RAMP.maxZ],[RAMP.minX,RAMP_BOTTOM+.02,RAMP.minZ],[RAMP.maxX,RAMP_BOTTOM+.02,RAMP.minZ],asphalt,vertical,[0,3,1,3,0,0,1,0]);
for(const [a,b] of [[RAMP.minX-.8,RAMP.minX],[RAMP.maxX,RAMP.maxX+.8]]){slab(a,b,-13,1.05,RAMP.minZ,RAMP.maxZ,concrete,vertical,'rampwall');box((a+b)/2,1.6,(RAMP.minZ+RAMP.maxZ)/2,.12,.1,RAMP.maxZ-RAMP.minZ,silver,vertical);box((a+b)/2,2.05,(RAMP.minZ+RAMP.maxZ)/2,.12,.1,RAMP.maxZ-RAMP.minZ,silver,vertical);addSolid(a,b,1.05,2.1,RAMP.minZ,RAMP.maxZ,'rail');}
slab(RAMP.minX,RAMP.maxX,-6.5,1.05,RAMP.minZ,RAMP.minZ+.7,concrete,vertical,'portal');
const portalSign=labelTex(512,128,[['B1  지하주차장','40px Arial',24,58,'#f2f2e6'],['출차 주의 · 높이 제한 2.3m · PARKING','18px Arial',26,100,'#e8c84a']],'#2f5b55');
mesh(new THREE.PlaneGeometry(8.6,2.15),phong(0xffffff,{map:portalSign,emissive:0x10201c}),(RAMP.minX+RAMP.maxX)/2,-4.3,RAMP.minZ+.72,vertical);
placeModel(MODELS.StreetLamp200X(),86.5,-82,Math.PI,vertical,null,true);

// New paths: one to the sky tower, one to the ramp.
function pathMat(len){const t=tileTex.clone();t.repeat.set(1,len/5);t.needsUpdate=true;return phong(0xffffff,{map:t,shininess:90});}
const towerPath=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,-80),new THREE.Vector3(14,0,-116),new THREE.Vector3(34,0,-146),new THREE.Vector3(52,0,-163),new THREE.Vector3(57,0,-170)]);ribbon(towerPath,3.4,pathMat(105));
const rampPath=new THREE.CatmullRomCurve3([new THREE.Vector3(58,0,-60),new THREE.Vector3(70,0,-71),new THREE.Vector3(79.3,0,-83)]);ribbon(rampPath,2.4,pathMat(30));
for(const t of [.25,.5,.75]){const p=towerPath.getPoint(t);placeModel(MODELS.StreetLamp200X(),p.x+3,p.z,Math.PI/2,vertical,null,true);}
for(const [x,z,r] of [[40,-171,0],[80,-171,0],[34,-200,Math.PI/2]])placeModel(MODELS.StoneParkBench(),x,z,r,vertical,P0,true);

// ─── The mycelium: a porous bone-white tower you can climb shelf by shelf ────
const MYCELIUM={x:-165,z:35,shelves:[]};
{const g=new THREE.Group();g.name='mycelium';g.position.set(MYCELIUM.x,terrainY(MYCELIUM.x,MYCELIUM.z),MYCELIUM.z);vertical.add(g);MYCELIUM.group=g;MYCELIUM.base=g.position.y;
  const bone=phong(0xe7e9e1,{shininess:28,specular:0x555555}),shelfMat=phong(0xf3f0e6,{shininess:40,specular:0x666655});
  const fiberGeo=new THREE.CylinderGeometry(.6,1,1,6,1,true);fiberGeo.translate(0,.5,0);
  const fibers=new THREE.InstancedMesh(fiberGeo,bone,220),o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),A=new THREE.Vector3(),B=new THREE.Vector3(),D=new THREE.Vector3();
  const ringR=h=>10-h*.07;const pt=(h,a,j=1)=>A.set(Math.cos(a)*ringR(h)*j,h,Math.sin(a)*ringR(h)*j);
  for(let i=0;i<220;i++){const h0=rand2()*52,h1=Math.min(58,h0+4+rand2()*14),a0=rand2()*TAU,a1=a0+(rand2()-.5)*1.6;pt(h0,a0,.35+rand2()*.75);B.copy(A);pt(h1,a1,.35+rand2()*.75);D.subVectors(A,B);const len=D.length();o.position.copy(B);o.quaternion.setFromUnitVectors(up,D.normalize());const th=.08+rand2()*.26;o.scale.set(th,len,th);o.updateMatrix();fibers.setMatrixAt(i,o.matrix);}
  g.add(fibers);
  const shelfGeo=new THREE.CylinderGeometry(1,.82,.28,14);const count=46,shelves=new THREE.InstancedMesh(shelfGeo,shelfMat,count+1);
  for(let i=0;i<count;i++){const h=1.05+i*1.12,a=i*.43,r=8.6-i*.05,sr=1.5+rand2()*.35,x=Math.cos(a)*r,z=Math.sin(a)*r;o.position.set(x,h-.14,z);o.quaternion.identity();o.scale.set(sr,1,sr);o.updateMatrix();shelves.setMatrixAt(i,o.matrix);const half=sr*.78;MYCELIUM.shelves.push(addSolid(MYCELIUM.x+x-half,MYCELIUM.x+x+half,MYCELIUM.base+h-.3,MYCELIUM.base+h,MYCELIUM.z+z-half,MYCELIUM.z+z+half,'shelf'));}
  MYCELIUM.top=MYCELIUM.base+1.05+count*1.12+.3;o.position.set(0,MYCELIUM.top-MYCELIUM.base-.14,0);o.scale.set(5.2,1,5.2);o.updateMatrix();shelves.setMatrixAt(count,o.matrix);g.add(shelves);
  addSolid(MYCELIUM.x-4,MYCELIUM.x+4,MYCELIUM.top-.3,MYCELIUM.top,MYCELIUM.z-4,MYCELIUM.z+4,'shelf');
  // A stepping stone from the last spiral shelf to the crown platform.
  const lastA=(count-1)*.43,lr=8.6-(count-1)*.05,sx=Math.cos(lastA)*lr*.55,sz=Math.sin(lastA)*lr*.55;box(sx,MYCELIUM.top-MYCELIUM.base-.12,sz,1.6,.22,1.6,shelfMat,g);
  addSolid(MYCELIUM.x+sx-.9,MYCELIUM.x+sx+.9,MYCELIUM.top-.3,MYCELIUM.top,MYCELIUM.z+sz-.9,MYCELIUM.z+sz+.9,'shelf');
  // Wings of hands, hung from wires that go up into nothing.
  const wingsArt=createHandWings();wingsArt.group.visible=true;wingsArt.group.scale.setScalar(1.6);wingsArt.group.position.set(0,MYCELIUM.top-MYCELIUM.base+3.2,0);g.add(wingsArt.group);MYCELIUM.wingsArt=wingsArt;
  for(const wx of [-1.4,1.4])mesh(new THREE.CylinderGeometry(.015,.015,60,3),silver,wx,MYCELIUM.top-MYCELIUM.base+34,0,g);
}

// ─── Landmarks that the 30 memories hide behind ──────────────────────────────
function spotClear(x,z,r){if(Math.hypot(x,z)>WORLD_RADIUS-25||inHole(x,z))return false;const y=terrainY(x,z);for(const s of solids){if(!s.on||s.maxY<y-.5||s.minY>y+4)continue;if(x>s.minX-r&&x<s.maxX+r&&z>s.minZ-r&&z<s.maxZ+r)return false;}if(Math.abs(x-stair.x)<6&&z<stair.z+3&&z>stair.z-30)return false;return true;}
function findFreeSpot(x,z,r){if(spotClear(x,z,r))return {x,z};for(let i=1;i<400;i++){const a=i*2.39996,d=2.2*Math.sqrt(i);const nx=x+Math.cos(a)*d,nz=z+Math.sin(a)*d;if(spotClear(nx,nz,r))return {x:nx,z:nz};}return {x,z};}
const TARGET_LAYOUT={FuturisticAptTowerA:{r:9,dz:-15},CyberModelHouseDome:{r:13},EndlessColonnade:{r:4.5,dz:-1},TiledMazeWall:{r:6,dz:-4},StairwayToNowhere:{r:3,dz:-1.5},GoldenEmblemGate:{r:9},FloatingElevatorCore:{r:2.6,dx:4,dz:-2},GlassPhoneBooth2002:{r:1.4,dx:2.4},PlasticPlaygroundSlide:{r:3,dx:3.6,dz:-2},GeometricFountain:{r:5},LowPolyPineTree:{r:1.2,dx:2.4,dz:-1.4},RotatingChromeSphere:{r:2.6,dx:3.6,dz:2.6}};
const EGG_SPOTS={},EGG_TARGETS={};let diorama=null;
for(const def of INITIAL_EASTER_EGGS){const lay=TARGET_LAYOUT[def.visualTarget];if(!lay){EGG_SPOTS[def.id]=findFreeSpot(def.position.x,def.position.z,2.5);continue;}
  const dx=lay.dx||0,dz=lay.dz||0;
  if(def.visualTarget==='CyberModelHouseDome'){const s=findFreeSpot(def.position.x,def.position.z,lay.r),ty=terrainY(s.x,s.z);for(const [half,top] of [[12.6,.55],[11.6,1.1],[10.6,1.65]])slab(s.x-half,s.x+half,ty-1.5,ty+top,s.z-half,s.z+half,white,vertical,'plinth');const g=placeModel(MODELS[def.visualTarget](),s.x,s.z,0,vertical,ty+.15);g.name='target:dome';addSolid(s.x-2.3,s.x+2.3,ty,ty+2.3,s.z-2.3,s.z+2.3,'diorama');EGG_TARGETS[def.id]=g;EGG_SPOTS[def.id]={x:s.x,z:s.z+4};continue;}
  const s=findFreeSpot(def.position.x+dx,def.position.z+dz,lay.r);const g=placeModel(MODELS[def.visualTarget](),s.x,s.z,0,vertical);g.name='target:'+def.visualTarget;EGG_TARGETS[def.id]=g;EGG_SPOTS[def.id]={x:s.x-dx,z:s.z-dz};
  if(def.visualTarget==='LowPolyPineTree')for(let i=0;i<5;i++){const a=i*1.3+.4,d=6+i*1.7,p=findFreeSpot(s.x+Math.cos(a)*d,s.z+Math.sin(a)*d,1.4);placeModel(MODELS.LowPolyPineTree(),p.x,p.z,a,vertical,null,true).scale.setScalar(.8+rand2()*.5);}}
// Inside the model-house dome: the whole village in miniature, including everyone walking it right now.
{const dome=EGG_TARGETS.EE_010;if(dome){const g=new THREE.Group(),S=1/95,top=2.15;g.position.set(0,top,0);dome.add(g);mesh(new THREE.CylinderGeometry(2.9,2.6,top,28),white,0,top/2,0,dome);const base=mesh(new THREE.CircleGeometry(2.75,40),phong(0x9fbf6a,{shininess:60}),0,.01,0,g);base.rotation.x=-Math.PI/2;
  const mini=phong(0xf0f1e7,{shininess:90}),miniGlass=phong(0x9fc4c8,{shininess:120});
  for(const b of buildings)box(b.group.position.x*S,b.h*S/2,b.group.position.z*S,b.w*S,b.h*S,b.d*S,miniGlass,g);
  for(const s of TOWER_SECTIONS)box(SKY.x*S,(s.y0+s.y1)/2*S,SKY.z*S,s.w*S,(s.y1-s.y0)*S,s.w*S,mini,g);box(TWIN.x*S,65*S,TWIN.z*S,22*S,130*S,22*S,mini,g);box(138*S,75*S,-140*S,6*S,150*S,6*S,mini,g);
  for(const p of curve.getPoints(40))box(p.x*S,.004,p.z*S,.06,.008,.06,white,g);
  instanceBoxes(g);const markers=new THREE.InstancedMesh(new THREE.CapsuleGeometry(.018,.03,2,6),phong(0x8e8e93,{emissive:0x222226}),40);markers.count=0;g.add(markers);
  const hint=texCanvas(256,64,(c)=>{c.fillStyle='#f2f2e6';c.fillRect(0,0,256,64);c.fillStyle='#396c63';c.font='16px Arial';c.fillText('푸른마을 전체 모형 · 축척 1:95',14,26);c.font='11px monospace';c.fillStyle='#84998a';c.fillText('지금 걷고 있는 사람이 모두 표시됩니다',14,48);});
  const plate=mesh(new THREE.PlaneGeometry(1.6,.4),phong(0xffffff,{map:hint}),0,top-.35,2.75,dome);plate.rotation.x=-.25;
  diorama={group:g,dome,scale:S,markers,top};}}

[vertical,skyTower,twin].forEach(instanceBoxes);bakeStatic(vertical);

// Names for the HUD when the player wanders into the new places.
const VERTICAL_ZONES=[
  {key:'deck',test:p=>p.y>DECK_Y-3&&Math.hypot(p.x-SKY.x,p.z-SKY.z)<34,names:['SECTOR 08 / SKY DECK 142F','구름과 같은 높이의 전망대']},
  {key:'bridge',test:p=>Math.abs(p.y-BRIDGE_Y)<4&&p.x>46&&p.x<104&&p.z>-184&&p.z<-172,names:['SECTOR 07 / SKYBRIDGE 47F','허공에 놓인 유리 다리']},
  {key:'mycelium',test:p=>Math.hypot(p.x-MYCELIUM.x,p.z-MYCELIUM.z)<16,names:['SECTOR 09 / THE MYCELIUM','자라나는 흰 탑']},
  {key:'plaza142',test:p=>p.x>30&&p.x<128&&p.z>-230&&p.z<-168&&p.y<12,names:['SECTOR 06 / SKY TOWER PLAZA','하늘로 가는 입구']},
  {key:'ramp',test:p=>inRect(RAMP,p.x,p.z)&&p.y<RAMP_TOP-.5,names:['SECTOR B1 / RAMP','아래로 기울어진 길']},
];

