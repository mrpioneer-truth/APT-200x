// ─── The transparent elevator ────────────────────────────────────────────────
// One car for everyone. Its position is shared; the floor it chooses is not always the one you pressed.
const FLOORS=[
  {id:'B3',y:-40,label:'B3',say:'지하 삼층',name:'지하 초원'},{id:'B2',y:-24,label:'B2',say:'지하 이층',name:'미개장 수영장'},{id:'B1',y:-12,label:'B1',say:'지하 일층',name:'주차장'},
  {id:'1',y:P0,label:'1',say:'일층',name:'로비'},{id:'47',y:BRIDGE_Y,label:'47',say:'사십칠층',name:'스카이브릿지'},{id:'142',y:DECK_Y,label:'142',say:'백사십이층',name:'하늘 전망대'},
  {id:'inf',y:330,label:'∞',say:'무한층',name:'분양되지 않은 하늘',hidden:true}];
const INF=6,LOBBY=3,CAR_H=3.5,DOOR_SPEED=1.5;let ridesTaken=0;
// The meadow under the lobby is not a floor: the shaft goes straight down. A dark pit covers the grass inside it.
holes.push({minX:SHAFT.minX,maxX:SHAFT.maxX,minZ:SHAFT.minZ,maxZ:SHAFT.maxZ});
{const pit=mesh(new THREE.PlaneGeometry(SHAFT.maxX-SHAFT.minX,SHAFT.maxZ-SHAFT.minZ),new THREE.MeshBasicMaterial({color:0x0c1212}),SHAFT.x,P0-.55,SHAFT.z);pit.rotation.x=-Math.PI/2;}
const shaftGroup=new THREE.Group();shaftGroup.name="shaft";scene.add(shaftGroup);
const shaftGlass=phong(0xbfeee0,{transparent:true,opacity:.18,shininess:150,depthWrite:false,side:THREE.DoubleSide});
{const top=213,bot=-1,h=top-bot,cy=(top+bot)/2;
  box(SHAFT.x,cy,SHAFT.minZ-.05,3.6,h,.1,shaftGlass,shaftGroup);box(SHAFT.minX-.05,cy,SHAFT.z,.1,h,3.6,shaftGlass,shaftGroup);box(SHAFT.maxX+.05,cy,SHAFT.z,.1,h,3.6,shaftGlass,shaftGroup);
  addSolid(SHAFT.minX-.3,SHAFT.maxX+.3,bot,top,SHAFT.minZ-.3,SHAFT.minZ,'shaft');addSolid(SHAFT.minX-.3,SHAFT.minX,bot,top,SHAFT.minZ,SHAFT.maxZ,'shaft');addSolid(SHAFT.maxX,SHAFT.maxX+.3,bot,top,SHAFT.minZ,SHAFT.maxZ,'shaft');
  for(const [a,b] of [[P0+3.6,BRIDGE_Y],[BRIDGE_Y+3.6,DECK_Y],[DECK_Y+3.6,top]]){box(SHAFT.x,(a+b)/2,SHAFT.front+.05,3.6,b-a,.1,shaftGlass,shaftGroup);addSolid(SHAFT.minX,SHAFT.maxX,a,b,SHAFT.front,SHAFT.front+.3,'shaft');}
  for(const [x,z] of [[SHAFT.minX-.1,SHAFT.minZ-.1],[SHAFT.maxX+.1,SHAFT.minZ-.1],[SHAFT.minX-.1,SHAFT.maxZ+.1],[SHAFT.maxX+.1,SHAFT.maxZ+.1]])box(x,cy,z,.28,h,.28,silver,shaftGroup);
  for(let y=bot+6;y<top;y+=6)for(const [x,z,w,d] of [[SHAFT.x,SHAFT.minZ-.1,3.8,.16],[SHAFT.x,SHAFT.maxZ+.1,3.8,.16],[SHAFT.minX-.1,SHAFT.z,.16,3.8],[SHAFT.maxX+.1,SHAFT.z,.16,3.8]])box(x,y,z,w,.16,d,silver,shaftGroup);
  box(SHAFT.x,top+.2,SHAFT.z,4.2,.4,.4,silver,shaftGroup);box(SHAFT.x,top+.2,SHAFT.z,.4,.4,4.2,silver,shaftGroup);
  instanceBoxes(shaftGroup);}

// The car: glass on three sides, sliding glass doors, a ceiling light that remembers to flicker.
const carGroup=new THREE.Group();carGroup.name='car';scene.add(carGroup);
const carGlass=phong(0xd2f5ec,{transparent:true,opacity:.24,shininess:160,depthWrite:false,side:THREE.DoubleSide});
const carLight=phong(0xffffff,{emissive:0xf2fff6});
box(0,-.13,0,3.3,.26,3.3,white,carGroup).userData.keep=true;box(0,3.62,0,3.3,.22,3.3,white,carGroup).userData.keep=true;box(0,3.49,0,2.2,.04,2.2,carLight,carGroup).userData.keep=true;
for(const [x,z,w,d] of [[0,-1.6,3.2,.06],[-1.6,0,.06,3.2],[1.6,0,.06,3.2]])box(x,1.75,z,w,3.5,d,carGlass,carGroup).userData.keep=true;
for(const [x,z] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]])box(x,1.75,z,.12,3.7,.12,silver,carGroup).userData.keep=true;
box(0,1,-1.52,2.8,.08,.08,silver,carGroup).userData.keep=true;
const carPanelTex=texCanvas(64,128,(g)=>{g.fillStyle='#c9d2d4';g.fillRect(0,0,64,128);g.fillStyle='#1d2a2c';g.fillRect(10,8,44,16);g.font='9px monospace';['∞','142','47','1','B1','B2','B3'].forEach((t,i)=>{g.fillStyle='#e8eeee';g.beginPath();g.arc(22,36+i*13,5,0,TAU);g.fill();g.fillStyle='#2b3b3d';g.fillText(t,31,39+i*13);});});
const carPanel=mesh(new THREE.PlaneGeometry(.32,.64),phong(0xffffff,{map:carPanelTex,emissive:0x111111}),-1.54,1.45,1.05,carGroup);carPanel.rotation.y=Math.PI/2;
const carDoors=[-1,1].map(side=>{const d=box(side*.8,1.75,1.6,1.6,3.48,.07,carGlass,carGroup);d.userData.keep=true;return {mesh:d,side};});
const car={y:P0,cur:LOBBY,door:0,doorTarget:0,hold:0,trip:null,pending:null,queue:null,flicker:0,idleAtInf:0,showInf:false};
const carSolids={floor:addSolid(SHAFT.minX+.1,SHAFT.maxX-.1,P0-.4,P0,SHAFT.minZ+.1,SHAFT.maxZ-.1,'car'),ceil:addSolid(SHAFT.minX,SHAFT.maxX,P0+CAR_H,P0+CAR_H+.3,SHAFT.minZ,SHAFT.maxZ,'car'),door:addSolid(SHAFT.minX,SHAFT.maxX,P0,P0+CAR_H,SHAFT.maxZ-.2,SHAFT.maxZ,'cardoor')};

// Landings: outer doors, a call button, and a tiny display that always knows where the car is.
const landings=FLOORS.map((f,i)=>{if(f.hidden)return null;const g=new THREE.Group();g.name='landing';g.position.set(SHAFT.x,f.y,SHAFT.front+.25);scene.add(g);const below=f.y<0;const mat=below?phong(0xd7dcdc,{shininess:130}):carGlass;
  const panels=[-1,1].map(side=>{const m=box(side*.875,1.75,0,1.75,3.5,.12,mat,g);m.userData.keep=true;return {mesh:m,side};});
  if(!below)box(0,3.62,0,3.7,.24,.3,silver,g).userData.keep=true;
  const c=document.createElement('canvas');c.width=64;c.height=24;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;
  mesh(new THREE.PlaneGeometry(.9,.34),phong(0x000000,{emissive:0xffffff,emissiveMap:tex}),0,3.95,.2,g);
  const call=mesh(new THREE.CylinderGeometry(.09,.09,.05,12),phong(0xe8eee8,{emissive:0x222222}),2.15,1.25,.25,g);call.rotation.x=Math.PI/2;box(2.15,1.25,.2,.32,.5,.06,silver,g).userData.keep=true;
  return {floor:i,group:g,panels,canvas:c,tex,call,solid:addSolid(SHAFT.minX,SHAFT.maxX,f.y,f.y+CAR_H,SHAFT.front,SHAFT.front+.5,'landing'),open:0,label:''};});
function drawLanding(l,text){if(l.label===text)return;l.label=text;const g=l.canvas.getContext('2d');g.fillStyle='#0c1414';g.fillRect(0,0,64,24);g.fillStyle='#ff9b5a';g.font='bold 15px monospace';g.textAlign='center';g.fillText(text,32,18);l.tex.needsUpdate=true;}

const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function nearestFloorLabel(y){let best=FLOORS[0],d=Infinity;for(const f of FLOORS){const dd=Math.abs(f.y-y);if(dd<d){d=dd;best=f;}}return best.label;}
function inCar(p){return p.x>SHAFT.minX&&p.x<SHAFT.maxX&&p.z>SHAFT.minZ&&p.z<SHAFT.maxZ+.1&&p.y>car.y-.7&&p.y<car.y+CAR_H-.3;}
function inDoorway(p){return p.x>SHAFT.minX-.2&&p.x<SHAFT.maxX+.2&&p.z>SHAFT.maxZ-.9&&p.z<SHAFT.front+1.1&&Math.abs(p.y-car.y)<1.5;}
function sayFloor(i,glitched){const f=FLOORS[i];return i===INF?'무한층입니다.':glitched?`${f.say}입니다. 내리실 문은... 없습니다.`:`${f.say}입니다.`;}
// A trip is chosen once and shared, so everyone watching sees the same wrong floor.
function chooseTrip(to){const r=Math.random(),f=FLOORS[to];
  if(f.id==='142'&&r<.22)return {to:INF,announce:to,kind:'overshoot'};
  if(r<.12){const others=[0,1,2,3,4,5].filter(i=>i!==to&&i!==car.cur);return {to:others[Math.floor(Math.random()*others.length)],announce:to,kind:'wrong'};}
  if(r<.24&&Math.abs(FLOORS[to].y-car.y)>20)return {to,announce:to,kind:r<.18?'stall':'drop'};
  return {to,announce:to,kind:null};}
function requestTrip(to){if(Number.isInteger(to)&&to>=0&&to<FLOORS.length)Village.action({type:'elevator',floor:to});}
function beginTrip(plan){const from=car.y,to=FLOORS[plan.to].y,extra=plan.kind==='stall'?4:plan.kind==='drop'?3.5:0;car.trip={...plan,from,toY:to,t:0,base:3+Math.abs(to-from)/15,extra,beat:false};car.trip.dur=car.trip.base+extra;
  if(plan.to!==car.cur&&inCar(player.position))voiceSay(to>from?'올라갑니다.':'내려갑니다.','announcer',{soft:true});}
function tripY(tr){let t=tr.t,off=0;
  if(tr.kind==='stall'){const s=tr.base*.5;t=t<s?t:t<s+4?s:t-4;}
  if(tr.kind==='drop'){const s=tr.base*.55,u=tr.t-s;if(u>0&&u<3.5){t=s;off=u<.6?-11*(u/.6)**2:u<1?-11:-11*(1-ease((u-1)/2.5));}else if(u>=3.5)t=tr.t-3.5;}
  return tr.from+(tr.toY-tr.from)*ease(clamp(t/tr.base,0,1))+off;}
function arrive(tr){car.y=tr.toY;car.cur=tr.to;car.trip=null;car.doorTarget=1;car.hold=7;sfx('ding');
  const near=inCar(player.position)||(Math.abs(player.position.y-car.y)<6&&Math.hypot(player.position.x-SHAFT.x,player.position.z-SHAFT.z)<14);
  if(near){const glitched=tr.kind==='wrong'||tr.kind==='overshoot';voiceSay(sayFloor(glitched?tr.announce:tr.to,glitched&&tr.to!==INF),glitched?'deep':'announcer');if(tr.to===INF)later(2.8,()=>hallucinate({text:'여기서부터는, 분양되지 않았습니다.',preset:'giant'},{force:true}));}
  if(tr.to===INF)car.idleAtInf=24;}
function updateElevator(dt){
  const prev=car.y,p=player.position;
  Village.elevator(dt);
  carGroup.position.set(SHAFT.x,car.y,SHAFT.z);const cam=camera.position,camFlat=Math.hypot(cam.x-SHAFT.x,cam.z-SHAFT.z);carGroup.visible=camFlat<150||inCar(p);
  for(const d of carDoors)d.mesh.position.x=d.side*(.8+car.door*1.45);
  car.flicker=Math.max(0,car.flicker-dt);carLight.emissiveIntensity=car.flicker>0?(Math.sin(worldTime*19)>.3?1:.1):1;
  const dy=car.y-prev;Object.assign(carSolids.floor,{minY:car.y-.4,maxY:car.y,dy});Object.assign(carSolids.ceil,{minY:car.y+CAR_H,maxY:car.y+CAR_H+.3});Object.assign(carSolids.door,{minY:car.y,maxY:car.y+CAR_H,on:car.door<.85});
  const label=car.trip?(car.trip.toY>car.trip.from?'▲':'▼')+nearestFloorLabel(car.y):FLOORS[car.cur].label;
  for(const l of landings){if(!l)continue;l.group.visible=camFlat<70&&Math.abs(cam.y-FLOORS[l.floor].y)<45;const here=!car.trip&&!car.pending&&car.cur===l.floor;const target=here?car.door:0;l.open+=(target-l.open)*Math.min(1,dt*8);for(const pn of l.panels)pn.mesh.position.x=pn.side*(.875+l.open*1.7);l.solid.on=!(here&&car.door>.85);if(frame%6===0)drawLanding(l,label);}
}
// The landing whose call button the player can reach.
function nearLanding(p){for(const l of landings){if(!l)continue;const f=FLOORS[l.floor];if(Math.abs(p.y-f.y)<1.8&&p.z>SHAFT.front&&p.z<SHAFT.front+5&&Math.abs(p.x-SHAFT.x)<4.2)return l;}return null;}
function applyElevatorState(st,initial){
  if(!st||!Number.isInteger(st.t)||st.t<0||st.t>=FLOORS.length)return;
  const plan={to:st.t,announce:Number.isInteger(st.a)&&st.a>=0&&st.a<FLOORS.length?st.a:st.t,kind:['overshoot','wrong','stall','drop'].includes(st.k)?st.k:null};
  const age=Date.now()-(Number(st.s)||0);
  if(initial&&(age>45000||age<-60000)){if(plan.to===INF)return;car.cur=plan.to;car.y=FLOORS[plan.to].y;car.door=0;car.doorTarget=0;return;}
  if(car.trip&&car.trip.to===plan.to)return;
  requestTrip(plan.to,{remote:plan});
}

