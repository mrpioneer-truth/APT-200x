// ─── Underground: B1 parking, B2 unopened pool, B3 a meadow under a painted sky ──
// Everything built so far is "the surface"; it is hidden while the camera is inside a room below.
const SURFACE=[...scene.children].filter(o=>!o.isLight);
const under=new THREE.Group();under.name="under";scene.add(under);
const ROOMS=[];
function wallSegs(a0,a1,openings){const segs=[];let cur=a0;for(const o of [...openings].sort((p,q)=>p.a-q.a)){if(o.a>cur)segs.push({a:cur,b:o.a,top:null});segs.push(o);cur=o.b;}if(cur<a1)segs.push({a:cur,b:a1,top:null});return segs;}
function buildRoom(def){
  const g=new THREE.Group();under.add(g);def.group=g;ROOMS.push(def);
  const {minX,maxX,minZ,maxZ,floor,ceil}=def,T=1,N=.5,h=ceil-floor;
  if(!def.customFloor)slab(minX-T,maxX+T,floor-1,floor,minZ-N,maxZ+T,def.floorMat,g,'floor');
  slab(minX-T,maxX+T,ceil,ceil+1,minZ-N,maxZ+T,def.ceilMat,g,'ceil');
  const run=(segs,fn)=>{for(const s of segs){if(s.top===null)fn(s.a,s.b,floor,ceil);else if(s.top<h)fn(s.a,s.b,floor+s.top,ceil);}};
  run(wallSegs(minX-T,maxX+T,def.openN||[]),(a,b,y0,y1)=>slab(a,b,y0,y1,minZ-N,minZ,def.wallMat,g,'wall'));
  run(wallSegs(minX-T,maxX+T,def.openS||[]),(a,b,y0,y1)=>slab(a,b,y0,y1,maxZ,maxZ+T,def.wallMat,g,'wall'));
  run(wallSegs(minZ,maxZ,def.openW||[]),(a,b,y0,y1)=>slab(minX-T,minX,y0,y1,a,b,def.wallMat,g,'wall'));
  run(wallSegs(minZ,maxZ,def.openE||[]),(a,b,y0,y1)=>slab(maxX,maxX+T,y0,y1,a,b,def.wallMat,g,'wall'));
  return def;
}
const shaftOpening={a:SHAFT.minX,b:SHAFT.maxX,top:3.6};
function bandWallTex(band,label){const t=texCanvas(256,128,(g)=>{g.fillStyle='#d9ddd5';g.fillRect(0,0,256,128);for(let i=0;i<700;i++){g.fillStyle=rand2()>.5?'rgba(255,255,255,.12)':'rgba(70,80,70,.08)';g.fillRect(rand2()*256,rand2()*128,2,2);}g.fillStyle=band;g.fillRect(0,92,256,36);g.fillStyle='#f4f4ee';g.fillRect(0,88,256,3);if(label){g.fillStyle='#2f4f49';g.font='bold 34px Arial';g.fillText(label,18,60);}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
function emissiveMat(color,emissive){return phong(color,{emissive,shininess:20});}

// B1 — parking. The ramp enters from the south; the glass elevator waits in the north wall.
const B1=buildRoom({id:'B1',minX:30,maxX:90,minZ:-182.25,maxZ:RAMP.minZ,floor:-12,ceil:-6.5,
  floorMat:phong(0xffffff,{map:(()=>{const t=texCanvas(256,256,(g)=>{g.fillStyle='#7d8582';g.fillRect(0,0,256,256);for(let i=0;i<1600;i++){g.fillStyle=rand2()>.5?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)';g.fillRect(rand2()*256,rand2()*256,2,2);}g.fillStyle='#e9ece6';for(let x=0;x<=256;x+=64){g.fillRect(x,0,3,90);g.fillRect(x,166,3,90);}g.fillStyle='#e8c84a';for(let x=0;x<256;x+=24)g.fillRect(x,126,14,3);});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(6,6);return t;})(),shininess:25,specular:0x222222}),
  ceilMat:concrete,wallMat:phong(0xffffff,{map:(()=>{const t=bandWallTex('#4f8f6c','B1');t.repeat.set(8,1);return t;})(),shininess:30}),
  openN:[shaftOpening],openS:[{a:RAMP.minX,b:RAMP.maxX,top:5.5}]});
{const g=B1.group,tubeMat=emissiveMat(0xffffff,0xeefff4),pillarMat=phong(0xffffff,{map:texCanvas(32,128,(c)=>{c.fillStyle='#d4d8d0';c.fillRect(0,0,32,128);for(let y=104;y<128;y+=8){c.fillStyle='#e8c84a';c.fillRect(0,y,32,4);c.fillStyle='#2b2b2b';c.fillRect(0,y+4,32,4);}}),shininess:30});
  for(let x=36;x<=84;x+=12)for(let z=-172;z<=-130;z+=14){if(Math.abs(x-60)<6&&z<-165)continue;if(Math.abs(x-79.3)<6&&z>-136)continue;box(x,-9.25,z,.9,5.5,.9,pillarMat,g);addSolid(x-.45,x+.45,-12,-6.5,z-.45,z+.45,'pillar');}
  for(let x=38;x<=86;x+=8)for(let z=-176;z<=-128;z+=12)box(x,-6.62,z,.18,.1,3.6,tubeMat,g);
  // Parked cars: one instanced mesh, tinted per car.
  const W=new THREE.Color(1,1,1),TIRE=new THREE.Color(.12,.12,.13),GL=new THREE.Color(.28,.36,.42),HL=new THREE.Color(1,1,.92);
  const carGeo=mergeParts([{geo:G_SPHERE_LO,pos:[0,.62,0],scl:[2.1,.42,.95],color:W},{geo:unitBox,pos:[0,.55,0],scl:[4.1,.55,1.85],color:W},{geo:G_SPHERE_LO,pos:[-.2,1.05,0],scl:[1.25,.42,.82],color:GL},
    ...[[-1.3,-.82],[1.3,-.82],[-1.3,.82],[1.3,.82]].map(([x,z])=>({geo:G_CYL,pos:[x,.36,z],rot:[Math.PI/2,0,0],scl:[.36,.24,.36],color:TIRE})),{geo:G_SPHERE_LO,pos:[2.05,.66,-.55],scl:.12,color:HL},{geo:G_SPHERE_LO,pos:[2.05,.66,.55],scl:.12,color:HL}]);
  const carSlots=[[36,-176,1],[44,-176,1],[68,-176,1],[76,-176,1],[84,-176,1],[38,-126,-1],[46,-126,-1],[54,-126,-1],[62,-126,-1],[70,-126,-1],[40,-152,1],[80,-152,-1]];
  const cars=new THREE.InstancedMesh(carGeo,phong(0xffffff,{vertexColors:true,shininess:120}),carSlots.length),o=new THREE.Object3D(),tints=[0xf2f2ee,0xb8c0c4,0x34465e,0x7b3434,0xe8e2d0,0x2f4f49];
  carSlots.forEach(([x,z,f],i)=>{o.position.set(x,-12,z);o.rotation.set(0,f>0?Math.PI/2:-Math.PI/2,0);o.updateMatrix();cars.setMatrixAt(i,o.matrix);cars.setColorAt(i,new THREE.Color(tints[i%tints.length]));addSolid(x-1,x+1,-12,-10.6,z-2.2,z+2.2,'car');});
  g.add(cars);B1.cars=cars;B1.carSlots=carSlots;
  for(const [x,z,ry] of [[31,-150,Math.PI/2],[89,-135,-Math.PI/2],[60,-122,Math.PI]]){const s=box(x,-8,z,1.6,.5,.12,emissiveMat(0x3fbf6a,0x1f8a46),g);s.rotation.y=ry;s.userData.keep=true;}
  const mirror=mesh(new THREE.SphereGeometry(.8,16,10,0,TAU,0,Math.PI/2),chrome,86,-8,-125,g);mirror.rotation.x=Math.PI/2;
  B1.alarm=mesh(new THREE.SphereGeometry(.35,10,8),emissiveMat(0xffa040,0x803000),82,-7.2,-122,g);
  instanceBoxes(g);
}

// B2 — an indoor pool that never opened. Everything echoes.
const POOL={minX:48,maxX:72,minZ:-172,maxZ:-150,bottom:-25.4,water:-24.28};
const B2=buildRoom({id:'B2',minX:40,maxX:80,minZ:-182.25,maxZ:-142.25,floor:-24,ceil:-17.5,customFloor:true,
  ceilMat:phong(0xf4f8f6,{shininess:40}),wallMat:phong(0xffffff,{map:(()=>{const t=poolTileTex().clone();t.repeat.set(14,3);t.needsUpdate=true;return t;})(),shininess:140}),openN:[shaftOpening]});
{const g=B2.group,tile=phong(0xffffff,{map:(()=>{const t=poolTileTex().clone();t.repeat.set(16,16);t.needsUpdate=true;return t;})(),shininess:140}),deep=phong(0x9fd8e0,{map:(()=>{const t=poolTileTex().clone();t.repeat.set(8,8);t.needsUpdate=true;return t;})(),shininess:140});
  slab(39,81,-25,-24,-182.75,POOL.minZ,tile,g,'floor');slab(39,81,-25,-24,POOL.maxZ,-141.25,tile,g,'floor');slab(39,POOL.minX,-25,-24,POOL.minZ,POOL.maxZ,tile,g,'floor');slab(POOL.maxX,81,-25,-24,POOL.minZ,POOL.maxZ,tile,g,'floor');
  slab(POOL.minX,POOL.maxX,POOL.bottom-1,POOL.bottom,POOL.minZ,POOL.maxZ,deep,g,'floor');
  for(let i=0;i<3;i++)slab(POOL.minX,POOL.minX+4,POOL.bottom,POOL.bottom+.35*(i+1),POOL.maxZ-1.2*(i+1),POOL.maxZ-1.2*i,tile,g,'steps');
  const caustic=texCanvas(128,128,(c)=>{c.fillStyle='#5ccad6';c.fillRect(0,0,128,128);c.strokeStyle='rgba(235,255,255,.45)';c.lineWidth=2;for(let i=0;i<34;i++){c.beginPath();const x=rand2()*128,y=rand2()*128;c.ellipse(x,y,6+rand2()*12,3+rand2()*6,rand2()*3,0,TAU);c.stroke();}});caustic.wrapS=caustic.wrapT=THREE.RepeatWrapping;caustic.repeat.set(4,4);
  const water=mesh(new THREE.PlaneGeometry(POOL.maxX-POOL.minX,POOL.maxZ-POOL.minZ),phong(0xffffff,{map:caustic,transparent:true,opacity:.62,emissive:0x0d3d44,shininess:160,depthWrite:false}),(POOL.minX+POOL.maxX)/2,POOL.water,(POOL.minZ+POOL.maxZ)/2,g);water.rotation.x=-Math.PI/2;POOL.water3d=water;POOL.caustic=caustic;
  const col=new THREE.CylinderGeometry(.55,.55,6.5,14);for(let z=-176;z<=-148;z+=7)for(const x of [44,76]){mesh(col,tile,x,-20.75,z,g);addSolid(x-.5,x+.5,-24,-17.5,z-.5,z+.5,'column');}
  const skylight=emissiveMat(0xffffff,0xf2fffc);for(let x=46;x<=74;x+=7)for(let z=-176;z<=-148;z+=7)box(x,-17.56,z,4,.08,4,skylight,g);
  const lounger=mergeParts([{geo:unitBox,pos:[0,.38,0],scl:[.7,.08,1.9]},{geo:unitBox,pos:[0,.7,-.85],rot:[-.9,0,0],scl:[.7,.08,.8]},...[[-.3,-.8],[.3,-.8],[-.3,.8],[.3,.8]].map(([x,z])=>({geo:unitBox,pos:[x,.18,z],scl:[.06,.36,.06]}))]),loungerMat=phong(0xffffff,{shininess:140});
  for(const [x,z] of [[43,-160],[43,-155],[77,-165],[77,-160],[77,-155]])mesh(lounger,loungerMat,x,-24,z,g);
  const notice=labelTex(256,160,[['수영장 미개장','30px Arial',22,52],['OPEN SOON · 200X','14px monospace',24,84,'#84998a'],['물에 들어가지 마십시오','16px Arial',22,124,'#a0524b']]);
  box(63,-22.7,-147,2.2,1.4,.1,phong(0xffffff,{map:notice}),g).userData.keep=true;
  instanceBoxes(g);
}

// B3 — a meadow under a painted sky, with a petri dish of arms in the middle.
const muralTex=texCanvas(1024,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#5aa6dc');gr.addColorStop(.55,'#c3e0e6');gr.addColorStop(.62,'#a9c77a');gr.addColorStop(1,'#7f9f4a');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<16;i++){const x=rand2()*w,y=40+rand2()*70,s=30+rand2()*50;g.fillStyle='rgba(255,255,250,.55)';g.beginPath();g.ellipse(x,y,s,s*.3,0,0,TAU);g.fill();}g.fillStyle='rgba(70,90,80,.35)';for(let i=0;i<9;i++){const x=rand2()*w,hh=20+rand2()*40;g.fillRect(x,158-hh,10+rand2()*12,hh);}});muralTex.wrapS=THREE.RepeatWrapping;muralTex.repeat.set(3,1);
const paintedSky=texCanvas(512,512,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,40,w/2,h/2,w*.7);gr.addColorStop(0,'#b9e0f2');gr.addColorStop(1,'#5aa6dc');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<22;i++){const x=rand2()*w,y=rand2()*h,s=24+rand2()*40;const r=g.createRadialGradient(x,y,0,x,y,s);r.addColorStop(0,'rgba(255,255,248,.7)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(x-s,y-s,s*2,s*2);}g.strokeStyle='rgba(40,70,90,.28)';g.lineWidth=2;for(let n=0;n<=4;n++){g.beginPath();g.moveTo(n*128,0);g.lineTo(n*128,h);g.moveTo(0,n*128);g.lineTo(w,n*128);g.stroke();}});paintedSky.wrapS=paintedSky.wrapT=THREE.RepeatWrapping;paintedSky.repeat.set(3,3);
const B3grass=grassTex.clone();B3grass.repeat.set(26,26);B3grass.needsUpdate=true;
const B3=buildRoom({id:'B3',minX:20,maxX:100,minZ:-182.25,maxZ:-102.25,floor:-40,ceil:-28,floorMat:phong(0xffffff,{map:B3grass,shininess:70,specular:0x263c17}),
  ceilMat:phong(0x000000,{emissive:0xffffff,emissiveMap:paintedSky}),wallMat:phong(0x000000,{emissive:0xffffff,emissiveMap:muralTex}),openN:[shaftOpening]});
const DISH={x:60,z:-140,r:6.2,arms:null,max:40,base:14};
const statues=[];
{const g=B3.group,o=new THREE.Object3D();
  const tufts=new THREE.InstancedMesh(grassGeo,grassMat,420);for(let i=0;i<420;i++){let x,z;do{x=22+rand2()*76;z=-180+rand2()*76;}while(Math.hypot(x-DISH.x,z-DISH.z)<9||(Math.abs(x-60)<4&&z<-160));o.position.set(x,-40,z);o.rotation.set(0,rand2()*TAU,0);o.scale.setScalar(.5+rand2()*.6);o.updateMatrix();tufts.setMatrixAt(i,o.matrix);}g.add(tufts);
  // The dish: a glass rim, a pale gel, and arms that reach for whoever comes near.
  mesh(new THREE.CylinderGeometry(DISH.r,DISH.r+.15,.7,48,1,true),phong(0xd8f2ee,{transparent:true,opacity:.35,shininess:160,side:THREE.DoubleSide,depthWrite:false}),DISH.x,-39.65,DISH.z,g);
  mesh(new THREE.TorusGeometry(DISH.r,.08,6,48),phong(0xeafaf6,{shininess:160}),DISH.x,-39.3,DISH.z,g).rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(DISH.r-.05,DISH.r-.05,.25,48),phong(0x3a5560,{shininess:150,transparent:true,opacity:.85,emissive:0x0a1a1e}),DISH.x,-39.85,DISH.z,g);
  addSolid(DISH.x-DISH.r*.72,DISH.x+DISH.r*.72,-40,-39.3,DISH.z-DISH.r*.72,DISH.z+DISH.r*.72,'dish');
  DISH.arms=new THREE.InstancedMesh(ARM_GEO,frostedHand,DISH.max);DISH.arms.count=0;DISH.arms.frustumCulled=false;g.add(DISH.arms);
  DISH.slots=[];for(let i=0;i<DISH.max;i++){const a=i*2.39996,d=Math.sqrt((i+.5)/DISH.max)*(DISH.r-.9);DISH.slots.push({x:Math.cos(a)*d,z:Math.sin(a)*d,lean:.15+rand2()*.35,phase:rand2()*TAU,s:5.2+rand2()*2.2});}
  placeModel(MODELS.StoneParkBench(),60,-152,Math.PI,g,-40,true);placeModel(MODELS.StreetLamp200X(),52,-150,0,g,-40,true);
  // Three grey statues face the walls. They only move when you are not looking.
  for(const [x,z,ry] of [[24,-106,Math.PI*.75],[96,-178,-Math.PI*.25],[96,-106,Math.PI*1.25]]){const m=createMannequin();m.root.position.set(x,-40,z);m.heading.rotation.y=ry;g.add(m.root);statues.push({rig:m,x,z,baseYaw:ry,look:0});addSolid(x-.5,x+.5,-40,-37.3,z-.5,z+.5,'statue');}
  // A door painted on the east wall. It is not painted.
  const door=new THREE.Group();door.position.set(99.45,-40,-140);g.add(door);box(0,1.8,0,.12,3.6,2.4,phong(0xf4f2ea,{shininess:90}),door).userData.keep=true;box(.06,1.8,0,.08,3.9,2.8,white,door);sphere(-.12,1.7,.85,.09,silver,door);B3.door=door;
  instanceBoxes(g);bakeStatic(g);
}

// The shaft below ground is concrete, with landings cut into each room's north wall.
{const g=new THREE.Group();under.add(g);const y0=-41.5,y1=-1;
  slab(SHAFT.minX-1,SHAFT.maxX+1,y0,y1,SHAFT.minZ-1,SHAFT.minZ,concrete,g,'shaft');slab(SHAFT.minX-1,SHAFT.minX,y0,y1,SHAFT.minZ,SHAFT.maxZ,concrete,g,'shaft');slab(SHAFT.maxX,SHAFT.maxX+1,y0,y1,SHAFT.minZ,SHAFT.maxZ,concrete,g,'shaft');slab(SHAFT.minX,SHAFT.maxX,y0-1,y0,SHAFT.minZ,SHAFT.maxZ,concrete,g,'pit');
  for(const [a,b] of [[-28,-24],[-17.5,-12],[-6.5,y1]])slab(SHAFT.minX,SHAFT.maxX,a,b,SHAFT.front,SHAFT.front+.5,concrete,g,'shaft');
  instanceBoxes(g);}

