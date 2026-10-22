// ─── Procedural model library ────────────────────────────────────────────────
// Shared Phong "console plastic" materials, a jointed grey mannequin, frosted hands,
// and the 200X props from proceduralModels.js, tuned to the meadow's palette.
const matCache=new Map();
function xmat(color,o={}){const key=[color,o.shininess??90,o.opacity??1,o.wireframe?1:0,o.flat?1:0,o.side?1:0,o.emissive??0].join('|');if(matCache.has(key))return matCache.get(key);const m=phong(color,{shininess:o.shininess??90,transparent:(o.opacity??1)<1,opacity:o.opacity??1,wireframe:!!o.wireframe,flatShading:!!o.flat,side:o.side?THREE.DoubleSide:THREE.FrontSide,emissive:o.emissive??0,depthWrite:(o.opacity??1)>=.6});matCache.set(key,m);return m;}
const _m4=new THREE.Matrix4(),_n3=new THREE.Matrix3(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_pv=new THREE.Vector3(),_sv=new THREE.Vector3(),_tv=new THREE.Vector3();
// Bake several primitives into one geometry (optionally vertex-coloured) to keep draw calls low on iPhone 13.
function mergeParts(parts){const P=[],N=[],C=[],I=[];let offset=0;for(const p of parts){const g=p.geo,sc=p.scl===undefined?1:p.scl;_e.set(...(p.rot||[0,0,0]));_q.setFromEuler(_e);_sv.set(...(typeof sc==='number'?[sc,sc,sc]:sc));_m4.compose(_pv.set(...(p.pos||[0,0,0])),_q,_sv);_n3.getNormalMatrix(_m4);const pa=g.attributes.position,na=g.attributes.normal;for(let i=0;i<pa.count;i++){_tv.fromBufferAttribute(pa,i).applyMatrix4(_m4);P.push(_tv.x,_tv.y,_tv.z);_tv.fromBufferAttribute(na,i).applyMatrix3(_n3).normalize();N.push(_tv.x,_tv.y,_tv.z);if(p.color)C.push(p.color.r,p.color.g,p.color.b);}const ia=g.index;if(ia)for(let i=0;i<ia.count;i++)I.push(ia.getX(i)+offset);else for(let i=0;i<pa.count;i++)I.push(i+offset);offset+=pa.count;}const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(P,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));if(C.length)out.setAttribute('color',new THREE.Float32BufferAttribute(C,3));out.setIndex(I);out.computeBoundingSphere();return out;}
const G_SPHERE=new THREE.SphereGeometry(1,16,12),G_SPHERE_LO=new THREE.SphereGeometry(1,9,7),G_CYL=new THREE.CylinderGeometry(1,1,1,14);
const capsuleCache=new Map();function capsule(r,len,radial=10){const k=r+'|'+len+'|'+radial;if(!capsuleCache.has(k))capsuleCache.set(k,new THREE.CapsuleGeometry(r,len,3,radial));return capsuleCache.get(k);}

// ─── The grey mannequin ──────────────────────────────────────────────────────
// Articulated like a wooden drawing doll: darker ball joints read clearly even at 0.35× resolution.
const SKIN_C=new THREE.Color(0x8e8e93),JOINT_C=new THREE.Color(0x67676d),BODY_Y=1.21;
const RIG={
  torso:mergeParts([
    {geo:G_SPHERE,pos:[0,-.1,0],scl:[.27,.17,.2],color:SKIN_C},{geo:G_CYL,pos:[0,.06,0],scl:[.17,.18,.15],color:JOINT_C},
    {geo:G_SPHERE,pos:[0,.39,0],scl:[.34,.34,.235],color:SKIN_C},{geo:G_SPHERE,pos:[0,.31,.15],scl:[.22,.12,.1],color:SKIN_C},
    {geo:G_SPHERE,pos:[-.37,.58,0],scl:.128,color:JOINT_C},{geo:G_SPHERE,pos:[.37,.58,0],scl:.128,color:JOINT_C},
    {geo:G_CYL,pos:[0,.77,0],scl:[.085,.22,.085],color:JOINT_C},
    {geo:G_SPHERE,pos:[-.16,-.2,0],scl:.12,color:JOINT_C},{geo:G_SPHERE,pos:[.16,-.2,0],scl:.12,color:JOINT_C}]),
  head:mergeParts([
    {geo:G_SPHERE,pos:[0,.3,0],scl:[.37,.395,.365],color:SKIN_C},{geo:G_SPHERE,pos:[0,.16,.17],scl:[.17,.12,.14],color:SKIN_C},
    {geo:G_CYL,pos:[-.355,.3,0],rot:[0,0,Math.PI/2],scl:[.072,.05,.072],color:JOINT_C},{geo:G_CYL,pos:[.355,.3,0],rot:[0,0,Math.PI/2],scl:[.072,.05,.072],color:JOINT_C}]),
  upperArm:mergeParts([{geo:capsule(.095,.24),pos:[0,-.2,0],color:SKIN_C},{geo:G_SPHERE,pos:[0,-.42,0],scl:.085,color:JOINT_C}]),
  forearm:[-1,1].map(side=>mergeParts([{geo:capsule(.083,.22),pos:[0,-.17,0],color:SKIN_C},{geo:G_SPHERE_LO,pos:[0,-.34,0],scl:.058,color:JOINT_C},{geo:G_SPHERE,pos:[0,-.46,.01],scl:[.092,.12,.06],color:SKIN_C},{geo:capsule(.03,.07,6),pos:[-side*.078,-.41,.035],rot:[.3,0,side*.55],color:SKIN_C}])),
  thigh:mergeParts([{geo:capsule(.12,.24),pos:[0,-.22,0],color:SKIN_C},{geo:G_SPHERE,pos:[0,-.46,0],scl:.105,color:JOINT_C}]),
  shin:mergeParts([{geo:capsule(.1,.26),pos:[0,-.2,0],color:SKIN_C},{geo:G_SPHERE_LO,pos:[0,-.4,0],scl:.07,color:JOINT_C},{geo:G_SPHERE,pos:[0,-.47,.075],scl:[.12,.075,.215],color:SKIN_C}]),
};
const mannequinMat=phong(0xffffff,{vertexColors:true,shininess:110});
function createMannequin(material=mannequinMat){
  const root=new THREE.Group(),heading=new THREE.Group(),body=new THREE.Group();root.add(heading);heading.add(body);body.position.y=BODY_Y;
  const add=(geo,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m;};
  add(RIG.torso,body);const neck=new THREE.Group();neck.position.y=.8;body.add(neck);add(RIG.head,neck,0,-.02,0);
  const limbs={};
  for(const side of [-1,1]){const shoulder=new THREE.Group();shoulder.position.set(side*.37,.58,0);body.add(shoulder);add(RIG.upperArm,shoulder);const elbow=new THREE.Group();elbow.position.y=-.42;shoulder.add(elbow);add(RIG.forearm[side<0?0:1],elbow);
    const hip=new THREE.Group();hip.position.set(side*.16,-.2,0);body.add(hip);add(RIG.thigh,hip);const knee=new THREE.Group();knee.position.y=-.46;hip.add(knee);add(RIG.shin,knee);limbs[side]={side,shoulder,elbow,hip,knee};}
  return {root,heading,body,neck,limbs,pose:{squash:0}};
}
// Pose targets are blended so walking, jumping, gliding and sitting flow into each other.
function poseMannequin(r,s,dt){
  const k=1-Math.exp(-(s.snap?40:13)*dt),sw=clamp(s.speed||0,0,1.4),phi=s.phase||0,t=s.t||0,idle=1-clamp(sw*2,0,1);
  const T={bodyY:BODY_Y,bodyX:.07*sw,bodyY_rot:Math.sin(phi)*.1*sw,neckX:0,neckY:0};
  const L={};
  for(const side of [-1,1]){const a=side<0?Math.sin(phi):-Math.sin(phi),swingFwd=side<0?-Math.cos(phi):Math.cos(phi);
    L[side]={hip:a*.62*sw,knee:sw*(.12+.95*Math.max(0,swingFwd)),sx:-a*.55*sw,sz:side*(.07+.02*Math.sin(t*1.7))*(1+idle),el:-(sw*(.22+.4*Math.max(0,-a))+.12)};}
  T.bodyY+=-.03*sw+.055*sw*Math.abs(Math.cos(phi))+idle*.012*Math.sin(t*1.9);
  T.neckY=-T.bodyY_rot+idle*(.38*Math.sin(t*.37)+.12*Math.sin(t*1.13))+(s.lookY||0);T.neckX=idle*.06*Math.sin(t*.53)+(s.lookX||0);
  if(s.airborne&&!s.glide&&!(s.roll>0)){if(s.vy>0)for(const side of [-1,1])Object.assign(L[side],{hip:-.55+side*.08,knee:.95,sx:-2.45,sz:side*.28,el:-.35});else for(const side of [-1,1])Object.assign(L[side],{hip:side<0?-.35:.22,knee:.65,sx:-.35,sz:side*1.2,el:-.45});T.bodyX=.05;}
  if(s.glide){T.bodyX=1.12;T.neckX=-.95;for(const side of [-1,1])Object.assign(L[side],{hip:.16,knee:.12+.05*Math.sin(t*3+side),sx:.05,sz:side*1.45,el:-.12});}
  if(s.sit){T.bodyY=BODY_Y-.43;T.bodyX=-.05;for(const side of [-1,1])Object.assign(L[side],{hip:-1.5,knee:1.48,sx:-.28,sz:side*.12,el:-.7});}
  if(s.roll>0){for(const side of [-1,1])Object.assign(L[side],{hip:-1.75,knee:2.25,sx:-1.3,sz:side*.15,el:-1.8});T.neckX=.45;}
  if(s.wave){L[1].sx=-.2;L[1].sz=2.6+Math.sin(t*9)*.35;L[1].el=-.5;}
  const lerp=(o,key,v)=>{o[key]+=(v-o[key])*k;};
  if(s.roll>0){r.body.rotation.x=s.roll*TAU;r.body.position.y=.9;}else{lerp(r.body.rotation,'x',T.bodyX);lerp(r.body.position,'y',T.bodyY);}
  lerp(r.body.rotation,'y',T.bodyY_rot);lerp(r.neck.rotation,'x',T.neckX);lerp(r.neck.rotation,'y',T.neckY);
  for(const side of [-1,1]){const l=r.limbs[side],p=L[side];lerp(l.hip.rotation,'x',p.hip);lerp(l.knee.rotation,'x',p.knee);lerp(l.shoulder.rotation,'x',p.sx);lerp(l.shoulder.rotation,'z',p.sz);lerp(l.elbow.rotation,'x',p.el);}
  r.pose.squash=Math.max(0,r.pose.squash-dt*5);const q=Math.sin(r.pose.squash*Math.PI)*.5*(r.pose.squash>0?1:0);r.body.scale.set(1+.07*q,1-.13*q,1+.07*q);
}

// ─── Hands (frosted arms in a dish, wings of palms, a garden of fingers) ─────
function handGeometry(withArm=false){
  const parts=[{geo:G_SPHERE,pos:[0,.055,0],scl:[.046,.058,.019]}];
  [[-.031,.11,.044,.035,.12],[-.0105,.115,.05,.04,.05],[.0105,.114,.048,.038,-.02],[.03,.108,.04,.03,-.1]].forEach(([x,y,l1,l2,spread])=>{const cx=Math.sin(spread);parts.push({geo:capsule(.0092,l1,6),pos:[x+cx*l1*.5,y+l1*.5,0],rot:[0,0,-spread]},{geo:capsule(.0084,l2,6),pos:[x+cx*(l1+l2*.5),y+l1+l2*.5-.004,.006],rot:[.22,0,-spread]});});
  parts.push({geo:capsule(.011,.04,6),pos:[.05,.045,.008],rot:[0,0,-.95]},{geo:capsule(.0095,.032,6),pos:[.078,.075,.012],rot:[.2,0,-.6]});
  if(withArm)parts.push({geo:capsule(.024,.27,8),pos:[0,-.15,0]},{geo:G_SPHERE_LO,pos:[0,-.005,0],scl:[.03,.022,.022]});
  return mergeParts(parts);
}
const HAND_GEO=handGeometry(false),ARM_GEO=handGeometry(true);
const frostedHand=phong(0xe4ece2,{transparent:true,opacity:.86,shininess:140,emissive:0x1d2420,depthWrite:true});
const fleshHand=phong(0xe7c7b4,{shininess:40,specular:0x554433});
function createHandWings(){
  const group=new THREE.Group(),wings=[];
  for(const side of [-1,1]){const wing=new THREE.Group();wing.position.set(side*.16,.42,-.2);group.add(wing);const n=11,inst=new THREE.InstancedMesh(HAND_GEO,fleshHand,n);const o=new THREE.Object3D();
    for(let i=0;i<n;i++){const u=i/(n-1),span=.25+u*2.35;o.position.set(side*span,.3-u*.35+Math.sin(u*Math.PI)*.45,-.05*i);o.rotation.set(-.2,side*.25,side*(-1.85+u*1.05));o.scale.setScalar(4.6-u*1.1);o.updateMatrix();inst.setMatrixAt(i,o.matrix);}
    wing.add(inst);wings.push({wing,side});}
  group.scale.setScalar(.001);group.visible=false;return {group,wings,open:0};
}

// ─── 200X props (from proceduralModels.js) ───────────────────────────────────
// Each factory returns a Group at ground origin. userData.solids lists local [cx,cy,cz,w,h,d] boxes.
const MODELS={
  FuturisticAptTowerA(){const g=new THREE.Group(),silverM=xmat(0xc6d0d6,{shininess:120});box(0,19,0,14,38,8,white,g);const gf=box(0,19,0,12,34,8.2,glass,g);for(let y=4;y<=36;y+=4)box(0,y,0,14.4,.4,8.4,silverM,g);const dome=mesh(new THREE.SphereGeometry(5,14,8,0,TAU,0,Math.PI/2),silverM,0,38,0,g);dome.scale.set(1.3,.6,.7);mesh(new THREE.CylinderGeometry(.15,.4,6,8),silverM,0,42,0,g);g.userData.solids=[[0,19,0,14.6,40,8.6]];g.userData.h=40;return g;},
  TwinSkybridgeApt(s=1){const g=new THREE.Group(),wall=xmat(0xf0f4f2,{shininess:80}),mintGlass=xmat(0x7fc8bc,{shininess:130,opacity:.82}),gold=xmat(0xd8b54a,{shininess:140});for(const x of [-10*s,10*s]){mesh(new THREE.CylinderGeometry(5*s,5*s,42*s,14),wall,x,21*s,0,g);mesh(new THREE.CylinderGeometry(5.1*s,5.1*s,36*s,14,1,true,0,Math.PI),mintGlass,x,21*s,0,g);mesh(new THREE.ConeGeometry(5.5*s,4*s,14),gold,x,44*s,0,g);}for(const y of [18,32])box(0,y*s,0,20*s,3*s,4*s,mintGlass,g);g.userData.solids=[[-10*s,21*s,0,10*s,46*s,10*s],[10*s,21*s,0,10*s,46*s,10*s]];return g;},
  GoldenEmblemGate(){const g=new THREE.Group(),stone=xmat(0xe8e4d9,{shininess:50}),gold=xmat(0xffcc33,{shininess:150,emissive:0x221800});for(const x of [-7,7])box(x,4.5,0,2.5,9,2.5,stone,g);const arch=mesh(new THREE.CylinderGeometry(9,9,2,20,1,false,0,Math.PI),stone,0,9,0,g);arch.rotation.set(0,Math.PI/2,Math.PI/2);arch.scale.set(1,1,.35);const emblem=mesh(new THREE.OctahedronGeometry(1.8,0),gold,0,9.5,1.2,g);g.userData.parts={emblem};g.userData.solids=[[-7,4.5,0,2.5,9,2.5],[7,4.5,0,2.5,9,2.5]];return g;},
  CyberModelHouseDome(){const g=new THREE.Group(),base=xmat(0xffffff,{shininess:90}),domeM=xmat(0x9fe0e2,{shininess:150,opacity:.38,side:true}),ring=xmat(0x6fb8de,{shininess:120});mesh(new THREE.CylinderGeometry(10,11,1.5,24),base,0,.75,0,g);const dome=mesh(new THREE.SphereGeometry(9.5,24,12,0,TAU,0,Math.PI/2),domeM,0,1.5,0,g);const halo=mesh(new THREE.TorusGeometry(10.5,.35,8,40),ring,0,5,0,g);halo.rotation.x=Math.PI/2;g.userData.parts={dome,halo};return g;},
  FloatingElevatorCore(){const g=new THREE.Group(),frame=xmat(0xb0b8c0,{shininess:110,wireframe:true}),gl=xmat(0xa8e6cf,{shininess:140,opacity:.4}),car=xmat(0xf2d16b,{shininess:100});box(0,13,0,3.2,26,3.2,gl,g);const f=mesh(new THREE.BoxGeometry(3.3,26,3.3,2,8,2),frame,0,13,0,g);const cabin=box(0,15,0,2.6,3.2,2.6,car,g);cabin.userData.keep=true;g.userData.parts={cabin};g.userData.solids=[[0,13,0,3.4,26,3.4]];return g;},
  StairwayToNowhere(){const g=new THREE.Group(),tile=xmat(0xf7f9f9,{shininess:120}),steps=18;for(let i=0;i<steps;i++)box(0,i*.5+.25,-i*.8,3.5,.5,1,tile,g);mesh(new THREE.CylinderGeometry(.25,.25,9,8),tile,0,4.5,-(steps-1)*.8,g);g.userData.steps=steps;return g;},
  TiledMazeWall(){const g=new THREE.Group(),pool=phong(0xffffff,{map:poolTileTex(),shininess:140}),trim=xmat(0x2aa8b8,{shininess:100});box(0,2.5,0,10,5,.6,pool,g);box(-3,2.5,4,.6,5,8,pool,g);box(2,1.75,5,6,3.5,.6,pool,g);box(0,5.05,0,10.2,.25,.7,trim,g);g.userData.solids=[[0,2.5,0,10,5,.6],[-3,2.5,4,.6,5,8],[2,1.75,5,6,3.5,.6]];return g;},
  RotatingChromeSphere(){const g=new THREE.Group(),blue=xmat(0x2f7fd8,{shininess:160});mesh(new THREE.CylinderGeometry(1.5,2.2,1.5,16),white,0,.75,0,g);const core=mesh(new THREE.SphereGeometry(1.6,18,14),blue,0,3.5,0,g);const r1=mesh(new THREE.TorusGeometry(2.4,.15,8,32),chrome,0,3.5,0,g);r1.rotation.set(.6,.4,0);const r2=mesh(new THREE.TorusGeometry(2.9,.12,8,32),chrome,0,3.5,0,g);r2.rotation.set(-.5,.2,.8);g.userData.parts={core,r1,r2};g.userData.solids=[[0,.75,0,3.6,1.5,3.6]];return g;},
  EndlessColonnade(){const g=new THREE.Group(),m=xmat(0xf2fff9,{shininess:70}),col=new THREE.CylinderGeometry(.5,.5,6,12),solids=[];for(let i=0;i<6;i++){const z=-i*4.5;mesh(col,m,-3,3,z,g);mesh(col,m,3,3,z,g);box(0,6.4,z,7.5,.8,1.2,m,g);solids.push([-3,3,z,1,6,1],[3,3,z,1,6,1]);}g.userData.solids=solids;return g;},
  GlassPhoneBooth2002(){const g=new THREE.Group(),silverM=xmat(0xbec5cb,{shininess:110}),teal=xmat(0x5fd0c0,{shininess:140,opacity:.5}),ph=xmat(0x333942,{shininess:90});const booth=box(0,1.15,0,1.4,2.3,1.4,teal,g);booth.userData.keep=true;mesh(new THREE.SphereGeometry(.95,12,8,0,TAU,0,Math.PI/2),silverM,0,2.3,0,g);const phone=box(0,1.35,-.5,.35,.55,.25,ph,g);phone.userData.keep=true;g.userData.parts={booth,phone};g.userData.solids=[[0,1.15,0,1.5,2.4,1.5]];return g;},
  PlasticPlaygroundSlide(){const g=new THREE.Group(),y=xmat(0xffd60a,{shininess:130}),r=xmat(0xf0466a,{shininess:130}),b=xmat(0x2f72e8,{shininess:130});box(0,1.2,0,2.5,2.4,2.5,y,g);const roof=mesh(new THREE.ConeGeometry(2.2,1.8,4),r,0,3.3,0,g);roof.rotation.y=Math.PI/4;const chute=box(0,1.1,2.6,1.1,.25,3.8,b,g);chute.rotation.x=.55;chute.userData.keep=true;g.userData.parts={roof,chute};g.userData.solids=[[0,1.2,0,2.6,2.4,2.6]];return g;},
  GeometricFountain(){const g=new THREE.Group(),marble=xmat(0xedf2f4,{shininess:85}),water=phong(0x46b8d0,{shininess:160,transparent:true,opacity:.75});mesh(new THREE.CylinderGeometry(4.5,4.2,.9,8),marble,0,.45,0,g);const surface=mesh(new THREE.CylinderGeometry(4.1,4.1,.75,8),water,0,.5,0,g);mesh(new THREE.CylinderGeometry(.6,.9,2.6,8),marble,0,1.3,0,g);const jet=mesh(new THREE.SphereGeometry(.75,12,10),water,0,2.9,0,g);g.userData.parts={surface,jet,water};g.userData.solids=[[0,.45,0,8.4,.9,8.4],[0,1.3,0,1.6,2.6,1.6]];return g;},
  LowPolyPineTree(){const g=new THREE.Group(),trunk=xmat(0x6f4e37,{shininess:40}),leaf=xmat(0x3f8a4e,{shininess:95,flat:true}),tiers=[];mesh(new THREE.CylinderGeometry(.3,.45,2,7),trunk,0,1,0,g);for(const t of [{r:1.9,h:2.4,y:2.6},{r:1.5,h:2.1,y:4},{r:1,h:1.8,y:5.2}])tiers.push(mesh(new THREE.ConeGeometry(t.r,t.h,8),leaf,0,t.y,0,g));g.userData.parts={tiers};g.userData.solids=[[0,1,0,.8,2,.8]];return g;},
  StreetLamp200X(){const g=new THREE.Group(),pole=xmat(0xc4cdd5,{shininess:120});mesh(new THREE.CylinderGeometry(.1,.16,4.8,8),pole,0,2.4,0,g);const arm=box(.6,4.8,0,1.6,.12,.3,pole,g);arm.rotation.z=.2;arm.userData.keep=true;const bulb=mesh(new THREE.SphereGeometry(.35,10,8),phong(0xe0ffff,{emissive:0x9ab8b8}),1.2,4.85,0,g);bulb.scale.set(1.5,.5,1);g.userData.parts={bulb};g.userData.solids=[[0,2.4,0,.35,4.8,.35]];return g;},
  StoneParkBench(){const g=new THREE.Group(),stone=xmat(0xdcdcdc,{shininess:60}),chromeM=xmat(0x9aa5b1,{shininess:140});box(0,.5,0,2.4,.18,.65,stone,g);for(const x of [-.9,.9])box(x,.25,0,.25,.5,.6,chromeM,g);const back=mesh(new THREE.CylinderGeometry(.08,.08,2.4,8),chromeM,0,.9,-.25,g);back.rotation.z=Math.PI/2;return g;},
  AudioAnomalyOrb(){const g=new THREE.Group(),core=mesh(new THREE.OctahedronGeometry(.65,1),phong(0xff2d8a,{shininess:160,transparent:true,opacity:.85,emissive:0x5a0030}),0,1.6,0,g),wave=mesh(new THREE.SphereGeometry(1.15,12,10),phong(0x38f0d0,{wireframe:true,transparent:true,opacity:.6,emissive:0x0d4a40}),0,1.6,0,g);g.userData.parts={core,wave};return g;},
  SpatialGlitchMonolith(){const g=new THREE.Group(),slab=box(0,2.1,0,1.2,4.2,.4,phong(0xffffff,{map:bsodPanelTex(),emissive:0x0a0a55,shininess:140}),g),cage=mesh(new THREE.BoxGeometry(1.5,4.5,.7),new THREE.MeshBasicMaterial({color:0xff00ff,wireframe:true}),0,2.1,0,g);slab.userData.keep=true;g.userData.parts={slab,cage};return g;},
  FloatingInfoTerminal(){const g=new THREE.Group(),caseM=xmat(0xd6d2c4,{shininess:80}),scr=crtTexture(),screenM=phong(0x000000,{emissive:0xffffff,emissiveMap:scr.texture,shininess:160});box(0,1.8,0,1.2,1,1,caseM,g).userData.keep=true;const back=mesh(new THREE.ConeGeometry(.6,.7,4),caseM,0,1.8,-.8,g);back.rotation.set(-Math.PI/2,0,Math.PI/4);const screen=mesh(new THREE.PlaneGeometry(.95,.75),screenM,0,1.8,.51,g);g.userData.parts={screen,crt:scr};return g;},
};
function poolTileTex(){if(poolTileTex.t)return poolTileTex.t;const t=texCanvas(128,128,(g)=>{g.fillStyle='#e9f6f6';g.fillRect(0,0,128,128);g.strokeStyle='#9ccfd4';for(let n=0;n<=8;n++){g.beginPath();g.moveTo(n*16,0);g.lineTo(n*16,128);g.moveTo(0,n*16);g.lineTo(128,n*16);g.stroke();}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,2);t.magFilter=THREE.NearestFilter;return poolTileTex.t=t;}
function bsodPanelTex(){if(bsodPanelTex.t)return bsodPanelTex.t;return bsodPanelTex.t=texCanvas(64,224,(g)=>{g.fillStyle='#1a2fb0';g.fillRect(0,0,64,224);g.fillStyle='#dfe6ff';g.font='6px monospace';for(let i=0;i<26;i++)g.fillText(['0E:0028','SKY.VXD','ERR 404','ANY KEY','C0011E36','MEMORY'][i%6],5,12+i*8);});}
// A tiny animated CRT: green text scrolls whenever the terminal is awake.
function crtTexture(){const c=document.createElement('canvas');c.width=96;c.height=72;const g=c.getContext('2d'),texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;let line=0;const lines=['C:\\PUREUN>dir','RESIDENT.DAT','MEMORY_200X','> OPEN 1504','ACCESS ...','WHO IS THERE'];
  function draw(text){g.fillStyle='#04140c';g.fillRect(0,0,96,72);g.fillStyle='#38ff9a';g.font='8px monospace';for(let i=0;i<7;i++)g.fillText(text?text[i]||'':lines[(line+i)%lines.length],4,10+i*9.5);g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<72;y+=2)g.fillRect(0,y,96,1);texture.needsUpdate=true;}
  draw();return {texture,tick(){line++;draw();},write(rows){draw(rows);}};}
function placeModel(group,x,z,rotY=0,parent=scene,y=null,bake=false){group.userData.bake=bake;group.position.set(x,y??terrainY(x,z),z);group.rotation.y=rotY;parent.add(group);const list=[];const c=Math.cos(rotY),s=Math.sin(rotY);for(const [cx,cy,cz,w,h,d] of group.userData.solids||[]){const wx=x+cx*c+cz*s,wz=z-cx*s+cz*c,hw=Math.abs(w*c)/2+Math.abs(d*s)/2,hd=Math.abs(w*s)/2+Math.abs(d*c)/2;list.push(addSolid(wx-hw,wx+hw,group.position.y+cy-h/2,group.position.y+cy+h/2,wz-hd,wz+hd,'model'));}group.userData.solidRefs=list;if(!bake)instanceBoxes(group);return group;}
// Static props flagged for baking are merged per material into the root: dozens of draw calls become a handful.
function bakeStatic(root){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),byMat=new Map(),victims=[];
  root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let p=o.parent;while(p&&p!==root&&!p.userData.bake)p=p.parent;if(p&&p!==root)victims.push(o);});
  for(const o of victims){const key=o.material.uuid;if(!byMat.has(key))byMat.set(key,{mat:o.material,parts:[]});byMat.get(key).parts.push({geo:o.geometry,m:new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)});o.parent.remove(o);}
  for(const {mat,parts} of byMat.values()){const P=[],N=[],U=[],I=[];let off=0;const nm=new THREE.Matrix3(),v=new THREE.Vector3();for(const {geo,m} of parts){nm.getNormalMatrix(m);const pa=geo.attributes.position,na=geo.attributes.normal,ua=geo.attributes.uv;for(let i=0;i<pa.count;i++){v.fromBufferAttribute(pa,i).applyMatrix4(m);P.push(v.x,v.y,v.z);v.fromBufferAttribute(na,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z);if(ua)U.push(ua.getX(i),ua.getY(i));else U.push(0,0);}if(geo.index)for(let i=0;i<geo.index.count;i++)I.push(geo.index.getX(i)+off);else for(let i=0;i<pa.count;i++)I.push(i+off);off+=pa.count;}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeBoundingSphere();root.add(new THREE.Mesh(g,mat));}}

