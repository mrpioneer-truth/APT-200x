// The original meadow, ported line for line. Only collision bookkeeping and the parking-ramp opening are new.
const RAMP={minX:gridLine(83),maxX:gridLine(84),minZ:gridLine(62),maxZ:gridLine(66)};holes.push(RAMP);
const skyTexture=texCanvas(1024,512,(g,w,h)=>{const gradient=g.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#227ed4');gradient.addColorStop(.37,'#6cb4e3');gradient.addColorStop(.53,'#c1dfe3');gradient.addColorStop(1,'#d2e9d5');g.fillStyle=gradient;g.fillRect(0,0,w,h);for(let i=0;i<39;i++){let x=rand()*w,y=115+rand()*95,s=20+rand()*45;for(let j=0;j<9;j++){const cx=x+(rand()-.5)*s*2,cy=y+(rand()-.5)*s*.32,r=s*(.2+rand()*.4);let grad=g.createRadialGradient(cx,cy,0,cx,cy,r);grad.addColorStop(0,'rgba(255,255,247,.64)');grad.addColorStop(.6,'rgba(255,255,247,.35)');grad.addColorStop(1,'rgba(255,255,255,0)');g.save();g.translate(cx,cy);g.scale(1,.43);g.fillStyle=grad;g.translate(-cx,-cy);g.fillRect(cx-r,cy-r,r*2,r*2);g.restore();}}});
const sky=new THREE.Mesh(new THREE.SphereGeometry(700,32,16),phong(0x000000,{emissive:0xffffff,emissiveMap:skyTexture,side:THREE.BackSide,fog:false,depthWrite:false}));scene.add(sky);
const grassTex=texCanvas(128,128,(g,w,h)=>{g.fillStyle='#94b854';g.fillRect(0,0,w,h);for(let i=0;i<7800;i++){let v=rand();g.fillStyle=v>.5?'rgba(197,208,89,.20)':'rgba(37,80,29,.17)';g.fillRect(rand()*w,rand()*h,1+rand()*2,1+rand()*3);}});grassTex.wrapS=grassTex.wrapT=THREE.RepeatWrapping;grassTex.repeat.set(150,150);grassTex.magFilter=THREE.NearestFilter;
const terrainGeo=new THREE.PlaneGeometry(1400,1400,150,150);terrainGeo.rotateX(-Math.PI/2);const pos=terrainGeo.attributes.position;for(let i=0;i<pos.count;i++)pos.setY(i,terrainY(pos.getX(i),pos.getZ(i)));terrainGeo.computeVertexNormals();
{const idx=terrainGeo.index.array,keep=[];for(let i=0;i<idx.length;i+=3){const cx=(pos.getX(idx[i])+pos.getX(idx[i+1])+pos.getX(idx[i+2]))/3,cz=(pos.getZ(idx[i])+pos.getZ(idx[i+1])+pos.getZ(idx[i+2]))/3;if(!inHole(cx,cz))keep.push(idx[i],idx[i+1],idx[i+2]);}terrainGeo.setIndex(keep);}
const terrain=new THREE.Mesh(terrainGeo,phong(0xffffff,{map:grassTex,shininess:80,specular:0x263c17}));scene.add(terrain);
function mesh(geo,mat,x=0,y=0,z=0,parent=scene){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
function box(x,y,z,w,h,d,mat=white,parent=scene){const m=mesh(unitBox,mat,x,y,z,parent);m.scale.set(w,h,d);return m;}
function sphere(x,y,z,r,mat=white,parent=scene){const m=mesh(unitSphere,mat,x,y,z,parent);m.scale.setScalar(r);return m;}
const tileTex=texCanvas(128,128,(g,w,h)=>{g.fillStyle='#d9dfd6';g.fillRect(0,0,w,h);g.strokeStyle='#a7b9ae';g.lineWidth=1;for(let n=0;n<=4;n++){g.beginPath();g.moveTo(n*32,0);g.lineTo(n*32,h);g.moveTo(0,n*32);g.lineTo(w,n*32);g.stroke();}});tileTex.wrapS=tileTex.wrapT=THREE.RepeatWrapping;tileTex.repeat.set(1,38);
const pathMaterial=phong(0xffffff,{map:tileTex,shininess:90});
const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(5,0,85),new THREE.Vector3(0,0,25),new THREE.Vector3(1,0,0),new THREE.Vector3(11,0,-23),new THREE.Vector3(4,0,-47),new THREE.Vector3(0,0,-80),new THREE.Vector3(-6,0,-115)]);
function ribbon(curve,width,mat){const verts=[],uv=[],ids=[],steps=110;for(let i=0;i<=steps;i++){const p=curve.getPoint(i/steps),t=curve.getTangent(i/steps),side=new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(width/2);for(const sign of [-1,1]){let x=p.x+side.x*sign,z=p.z+side.z*sign;verts.push(x,terrainY(x,z)+.045,z);uv.push(sign===-1?0:1,i/steps);}}for(let i=0;i<steps;i++){let n=i*2;ids.push(n,n+1,n+2,n+1,n+3,n+2);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return mesh(g,mat);}
ribbon(curve,4.3,pathMaterial);
const sideCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-53,0,-30),new THREE.Vector3(-24,0,-16),new THREE.Vector3(6,0,-8),new THREE.Vector3(40,0,-20),new THREE.Vector3(58,0,-60)]);ribbon(sideCurve,2.2,phong(0xd8e2d1));
const glassTex=texCanvas(128,256,(g,w,h)=>{let grad=g.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#82b9c4');grad.addColorStop(.3,'#aecfd2');grad.addColorStop(.5,'#5e929f');grad.addColorStop(.8,'#a5c9cd');grad.addColorStop(1,'#769fa9');g.fillStyle=grad;g.fillRect(0,0,w,h);for(let r=0;r<16;r++)for(let c=0;c<6;c++){g.fillStyle=rand()>.7?'rgba(236,247,230,.25)':'rgba(35,88,107,.12)';g.fillRect(c*w/6,r*h/16,w/6,h/16);}g.strokeStyle='#e5ede3';g.lineWidth=2;for(let i=0;i<=16;i++){g.beginPath();g.moveTo(0,i*16);g.lineTo(w,i*16);g.stroke();}g.lineWidth=1.5;for(let i=0;i<=6;i++){g.beginPath();g.moveTo(i*w/6,0);g.lineTo(i*w/6,h);g.stroke();}});
const glass=phong(0xffffff,{map:glassTex,shininess:115,specular:0xffffff});
function openBuildingCore(g,x,z,base,w,d,h,doorX=0,tag='tower'){
 const L=4.6,th=.55,doorW=3.2;
 box(0,L+(h-L)/2,0,w,h-L,d,white,g);addSolid(x-w/2-.1,x+w/2+.1,base+L,base+h+.5,z-d/2-.1,z+d/2+.1,tag);
 const wall=(cx,cz,ww,dd)=>{box(cx,L/2,cz,ww,L,dd,white,g);solidAt(x+cx,base+L/2,z+cz,ww,L,dd,tag+'wall');};
 wall(-w/2+th/2,0,th,d);wall(w/2-th/2,0,th,d);wall(0,-d/2+th/2,w,th);
 const a=-w/2,b=doorX-doorW/2,c=doorX+doorW/2,e=w/2;
 if(b>a)wall((a+b)/2,d/2-th/2,b-a,th);if(e>c)wall((c+e)/2,d/2-th/2,e-c,th);
 box(doorX,4.1,d/2-th/2,doorW,1,th,white,g);solidAt(x+doorX,base+4.1,z+d/2-th/2,doorW,1,th,tag+'wall');
}
function tower(x,z,h,w,d,id){const g=new THREE.Group();g.name='tower';g.position.set(x,terrainY(x,z),z);scene.add(g);const base=g.position.y;
 openBuildingCore(g,x,z,base,w,d,h,0);
 box(0,4.6+(h-4.6)/2,d/2+.025,w*.83,(h-4.6)*.94,.08,glass,g);box(0,h/2,-d/2-.025,w*.83,h*.94,.08,glass,g);box(w/2+.025,h/2,0,.08,h*.94,d*.82,glass,g);box(-w/2-.025,h/2,0,.08,h*.94,d*.82,glass,g);
 for(let side of [-1,1]){box(side*w*.46,h/2,d/2+.13,.38,h,.4,white,g);box(side*w*.46,h/2,-d/2-.13,.38,h,.4,white,g);}
 const cap=sphere(0,h+.2,0,1,white,g);cap.scale.set(w*.7,.9,d*.72);cap.rotation.z=-.08;box(0,h+1.1,0,.26,3,.26,silver,g);
 const tex=texCanvas(128,64,(ctx)=>{ctx.fillStyle='#688b88';ctx.font='28px Arial';ctx.textAlign='center';ctx.fillText(id,64,43);});mesh(new THREE.PlaneGeometry(3.5,1.75),phong(0xffffff,{map:tex,transparent:true}),0,h*.68,d/2+.15,g);
 buildings.push({id,group:g,baseY:base,halfW:w/2,halfD:d/2,w,d,h,lift:0,flip:0});return g;}

tower(7,-61,47,9,9,'101');tower(-8,-71,39,8,9,'102');tower(24,-76,35,8,9,'103');tower(-23,-90,32,8,8,'104');tower(14,-100,43,9,9,'105');tower(43,-121,27,7,8,'106');tower(-43,-131,25,7,8,'107');
box(-1,24,-65,11,2.3,3.4,glass);box(-1,25.3,-65,12,.35,4,white);box(15,20,-72,12,1.8,3,glass);box(15,21,-72,13,.3,3.6,white);
// A soft oval plaza and the silver sculpture of an almost-familiar future.
let plaza=mesh(new THREE.CircleGeometry(17,64),phong(0xd6dfcf),-19,terrainY(-19,-13)+.06,-13);plaza.rotation.x=-Math.PI/2;plaza.scale.set(1, .72,1);
let pond=mesh(new THREE.CircleGeometry(11.5,64),phong(0x65b9b1,{shininess:120,specular:0xffffff,transparent:true,opacity:.9}),-23,terrainY(-23,-13)+.13,-13);pond.rotation.x=-Math.PI/2;pond.scale.set(1,.62,1);
let pondRim=mesh(new THREE.TorusGeometry(11.6,.3,8,64),white,-23,pond.position.y+.07,-13);pondRim.rotation.x=Math.PI/2;pondRim.scale.y=.62;
const chromeTex=texCanvas(256,128,(g,w,h)=>{let gr=g.createLinearGradient(0,0,0,h);[[0,'#b8e4f1'],[.38,'#f6f9f1'],[.47,'#91b9c1'],[.5,'#3f7771'],[.59,'#879c60'],[.83,'#d8e5b7'],[1,'#678d69']].forEach(([n,c])=>gr.addColorStop(n,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});chromeTex.mapping=THREE.EquirectangularReflectionMapping;
const chrome=phong(0xcbdad5,{envMap:chromeTex,combine:THREE.MixOperation,reflectivity:.86,shininess:120});
const sculpture=new THREE.Group();sculpture.position.set(-23,terrainY(-23,-13),-13);scene.add(sculpture);mesh(new THREE.CylinderGeometry(2.5,3.4,1.5,32),white,0,.75,0,sculpture);const chromeBall=sphere(0,5.1,0,3.1,chrome,sculpture);const orbit=mesh(new THREE.TorusGeometry(4.3,.12,8,64),chrome,0,5.1,0,sculpture);orbit.rotation.x=.45;orbit.rotation.y=.4;
// The staircase has actual walkable treads; it ends in the sky.
const stair={x:-46,z:-44,w:7,steps:23,depth:1.05,height:.46,base:terrainY(-46,-44)};
const stairSteps=[],stairMat=white.clone();
for(let i=0;i<stair.steps;i++){let h=(i+1)*stair.height;box(stair.x,stair.base+h/2,stair.z-i*stair.depth,stair.w,h,stair.depth+.03,stairMat);stairSteps.push(addSolid(stair.x-stair.w/2,stair.x+stair.w/2,stair.base-2,stair.base+h,stair.z-i*stair.depth-stair.depth/2,stair.z-i*stair.depth+stair.depth/2,'stair'));}
box(stair.x,stair.base+stair.steps*stair.height-.2,stair.z-stair.steps*stair.depth-1,stair.w,.4,3,stairMat);
const stairLanding=addSolid(stair.x-stair.w/2,stair.x+stair.w/2,stair.base+stair.steps*stair.height-.4,stair.base+stair.steps*stair.height,stair.z-stair.steps*stair.depth-2.5,stair.z-stair.steps*stair.depth+.5,'landing');
// Tiled wall, a door without a room, and an empty greenhouse.
const wallTex=tileTex.clone();wallTex.repeat.set(4,2);wallTex.needsUpdate=true;const tileWall=box(-38,terrainY(-38,10)+3,10,13,6,.7,phong(0xf2f0e5,{map:wallTex}));addSolid(-44.8,-31.2,terrainY(-38,10)-1,terrainY(-38,10)+6,9.3,10.7,'wall');
const greenHouse=new THREE.Group();greenHouse.position.set(39,terrainY(39,-23),-23);scene.add(greenHouse);
const clearGlass=phong(0xb9e1d2,{transparent:true,opacity:.26,shininess:120,depthWrite:false,side:THREE.DoubleSide});
box(0,.12,0,13,.24,17,white,greenHouse);box(0,3.5,0,12,7,16,clearGlass,greenHouse);for(let x of [-6,0,6])for(let z of [-8,-4,0,4,8])box(x,3.5,z,.13,7,.13,white,greenHouse);for(let y of [0,3.5,7]){for(let x of [-6,6])box(x,y,0,.15,.15,16,white,greenHouse);for(let z of [-8,8])box(0,y,z,12,.15,.15,white,greenHouse);}for(let side of [-1,1]){for(let z of [-8,-4,0,4,8]){const roof=box(side*3,8.4,z,6.6,.13,.13,white,greenHouse);roof.rotation.z=-side*.43;}const glazing=box(side*3,8.32,0,6.6,.08,16,clearGlass,greenHouse);glazing.rotation.z=-side*.43;}box(0,9.8,0,.15,.15,16,white,greenHouse);
const planters=[];for(let x of [-4,4])for(let z of [-5,0,5]){box(x,.55,z,1.6,.7,1.6,cream,greenHouse);planters.push({x,z,shrub:sphere(x,1.7,z,1.1,mint,greenHouse)});}
for(let x of [65,77])box(x,terrainY(x,-79)+9,-79,2,18,3,white);box(71,terrainY(71,-79)+18,-79,14,2,3,white);
// Distant ornamental trees and benches reinforce the model-house advertising scene.
const treeSpots=[[-14,-40],[21,-43],[-34,-73],[42,-66],[32,6],[-53,24],[67,12],[-13,-108],[31,-108]];
for(const [x,z] of treeSpots){let y=terrainY(x,z);mesh(new THREE.CylinderGeometry(.22,.32,3.4,7),phong(0x8a9472),x,y+1.7,z);const crown=sphere(x,y+4.3,z,2.7,phong(0x698b55));crown.scale.y=1.2;}
const benchSpots=[[-8,2],[19,-7],[-12,-34],[29,-38]];
for(const [x,z] of benchSpots){let y=terrainY(x,z);box(x,y+.8,z,3,.18,.7,cream);box(x,y+1.25,z-.3,3,.75,.15,cream);for(let dx of [-1,1])box(x+dx,y+.35,z,.12,.7,.5,silver);}
const signTex=texCanvas(512,256,(g)=>{g.fillStyle='#f2f2e6';g.fillRect(0,0,512,256);g.fillStyle='#396c63';g.font='20px Arial';g.fillText('PUREUN VILLAGE',32,50);g.font='50px Arial';g.fillText('푸른마을',30,115);g.font='19px Arial';g.fillStyle='#84998a';g.fillText('당신이 꿈꾸던 내일의 주거공간',33,165);g.fillRect(32,195,445,1);g.font='12px monospace';g.fillText('CYBER MODEL HOUSE  /  OPEN FOREVER',33,225);});const signMat=phong(0xffffff,{map:signTex});const signBoard=box(8,terrainY(8,12)+1.5,12,5,2.5,.25,signMat);addSolid(5.3,10.7,terrainY(8,12)-1,terrainY(8,12)+2.8,11.5,12.5,'sign');
const grassBlade=texCanvas(64,64,(g)=>{for(let i=0;i<14;i++){const x=rand()*64;g.fillStyle=['#6f9843','#8aa745','#a5b45d'][i%3];g.beginPath();g.moveTo(x-4,64);g.quadraticCurveTo(x-4,30,x+(rand()-.5)*14,rand()*20);g.quadraticCurveTo(x+4,34,x+4,64);g.fill();}});
const grassGeo=new THREE.PlaneGeometry(1.8,2.1);grassGeo.translate(0,1.05,0);const grassMat=phong(0xffffff,{map:grassBlade,transparent:false,alphaTest:.4,side:THREE.DoubleSide,shininess:80,specular:0x51672b});
const grassCount=2600,grass=new THREE.InstancedMesh(grassGeo,grassMat,grassCount);const dummy=new THREE.Object3D();const patches=[[-15,20,18],[-34,-33,20],[25,-1,17],[49,-50,19],[-62,-8,22],[7,-113,25]];
for(let i=0;i<grassCount;i++){const p=patches[i%patches.length],ang=rand()*TAU,r=Math.sqrt(rand())*p[2],x=p[0]+Math.cos(ang)*r,z=p[1]+Math.sin(ang)*r;const nearPath=curve.getPoints(85).some(p=>Math.hypot(x-p.x,z-p.z)<3.6)||Math.hypot(x,z-22)<4;dummy.position.set(x,terrainY(x,z)-(nearPath?8:0),z);dummy.rotation.y=rand()*TAU;dummy.scale.setScalar(.6+rand()*.65);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}scene.add(grass);
// Consolidate repeated boxes without changing the transforms of floating buildings.
function instanceBoxes(root){const groups=new Map();for(const child of [...root.children]){if(child.isMesh&&!child.isInstancedMesh&&child.geometry===unitBox&&!child.userData.keep){const key=child.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(child);}}for(const items of groups.values()){if(items.length<2)continue;const batch=new THREE.InstancedMesh(unitBox,items[0].material,items.length);items.forEach((child,i)=>{child.updateMatrix();batch.setMatrixAt(i,child.matrix);root.remove(child);});root.add(batch);}}
tileWall.userData.keep=true;signBoard.userData.keep=true;
[scene,greenHouse,...buildings.map(b=>b.group)].forEach(instanceBoxes);

