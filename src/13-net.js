// ─── Everyone in the same afternoon ──────────────────────────────────────────
// Presence and touch records travel over public MQTT-over-WebSocket relays. Touch records are
// retained on two relays and gossiped from every visitor's browser, so the village keeps them.
// Swap RELAYS for your own broker before a production launch: these relays are public test servers.
const RELAYS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
const ROOM=((new URLSearchParams(location.search).get('room')||'main').replace(/[^a-z0-9-]/gi,'').slice(0,24))||'main';
const TOPIC=`apt200x/pureun-v2/${ROOM}`,MAX_PEERS=32,PRINT_KEEP=40,PEER_TIMEOUT=9000;
const NET={id:'',status:'connecting',link:null,archive:null,visits:0,flags:{a:0,h:0},sentAt:0,lastPos:new THREE.Vector3(1e9,0,0),connectedAt:0,healed:false};
// One visitor number per tab: two tabs on the same phone are two grey figures in the village.
try{NET.id=sessionStorage.getItem('apt200x-visitor')||'';}catch(e){}
if(!/^[0-9A-F]{4}$/.test(NET.id)){NET.id=Math.floor(Math.random()*65536).toString(16).toUpperCase().padStart(4,'0');try{sessionStorage.setItem('apt200x-visitor',NET.id);}catch(e){}}
const enc=new TextEncoder(),dec=new TextDecoder();
function mqttStr(s){const b=enc.encode(s);return [b.length>>8,b.length&255,...b];}
function mqttLen(n){const out=[];do{let b=n%128;n=Math.floor(n/128);if(n>0)b|=128;out.push(b);}while(n>0);return out;}
function mqttPacket(type,flags,body){return new Uint8Array([(type<<4)|flags,...mqttLen(body.length),...body]);}
// A minimal MQTT 3.1.1 client: CONNECT with last will, QoS 0 publish/subscribe, keep-alive.
class MqttLink{constructor(url,{clientId,will=null,onOpen,onMessage,onFail,onClose}){Object.assign(this,{url,clientId,will,onOpen,onMessage,onFail,onClose,ready:false,dead:false,buf:new Uint8Array(0),pid:1});}
  open(){try{this.ws=new WebSocket(this.url,['mqtt']);}catch(e){this.onFail?.();return;}this.ws.binaryType='arraybuffer';this.fail=setTimeout(()=>{if(!this.ready&&!this.dead){this.dead=true;try{this.ws.close();}catch(e){}this.onFail?.();}},7000);
    this.ws.onopen=()=>{const flags=2|(this.will?4:0),body=[...mqttStr('MQTT'),4,flags,0,40,...mqttStr(this.clientId)];if(this.will){body.push(...mqttStr(this.will.topic));const p=enc.encode(this.will.payload);body.push(p.length>>8,p.length&255,...p);}this.ws.send(mqttPacket(1,0,body));};
    this.ws.onmessage=ev=>{if(typeof ev.data==='string')return;const chunk=new Uint8Array(ev.data),b=new Uint8Array(this.buf.length+chunk.length);b.set(this.buf);b.set(chunk,this.buf.length);this.buf=b;this.drain();};
    this.ws.onerror=()=>{};this.ws.onclose=()=>{clearTimeout(this.fail);clearInterval(this.pinger);const was=this.ready;this.ready=false;if(!was&&!this.dead){this.dead=true;this.onFail?.();}else if(was)this.onClose?.();};}
  drain(){let i=0;const b=this.buf;while(i+2<=b.length){let mul=1,len=0,j=i+1,byte;do{if(j>=b.length){this.buf=b.slice(i);return;}byte=b[j++];len+=(byte&127)*mul;mul*=128;}while(byte&128);if(j+len>b.length)break;const type=b[i]>>4,flags=b[i]&15,body=b.subarray(j,j+len);i=j+len;
      if(type===2){clearTimeout(this.fail);if(body[1]===0){this.ready=true;this.pinger=setInterval(()=>this.send(mqttPacket(12,0,[])),20000);this.onOpen?.();}else{this.dead=true;this.ws.close();this.onFail?.();}}
      else if(type===3&&len<=262144){const tl=(body[0]<<8)|body[1];let off=2+tl;if(flags&6)off+=2;try{this.onMessage?.(dec.decode(body.subarray(2,2+tl)),dec.decode(body.subarray(off)),!!(flags&1));}catch(e){console.error('[APT200X] message',e);}}}
    this.buf=b.slice(i);}
  send(p){if(this.ws&&this.ws.readyState===1)try{this.ws.send(p);}catch(e){}}
  publish(topic,payload,retain=false){if(this.ready)this.send(mqttPacket(3,retain?1:0,[...mqttStr(topic),...enc.encode(payload)]));}
  subscribe(topics){if(!this.ready)return;const body=[this.pid>>8,this.pid&255];this.pid=(this.pid%65000)+1;for(const t of topics)body.push(...mqttStr(t),0);this.send(mqttPacket(8,2,body));}
  close(){this.dead=true;this.ready=false;clearInterval(this.pinger);clearTimeout(this.fail);try{this.send(mqttPacket(14,0,[]));this.ws.close();}catch(e){}}}

// ─── The shared record of touched things ─────────────────────────────────────
const WORLD_KEY='apt200x-world-v4:'+ROOM;
const r2=v=>Math.round(v*100)/100;
function cleanStr(s,max){return String(s).replace(/[\u0000-\u001f<>]/g,'').slice(0,max);}
function sanitizeRec(raw){if(!raw||typeof raw!=='object')return null;const n=Number.isInteger(raw.n)?clamp(raw.n,0,1e6):0;const st={};if(raw.st&&typeof raw.st==='object'&&!Array.isArray(raw.st)){let k=0;for(const [key,v] of Object.entries(raw.st)){if(++k>12||!/^[_a-z]{1,8}$/i.test(key))continue;if(typeof v==='number'&&Number.isFinite(v))st[key]=v;else if(typeof v==='string')st[key]=cleanStr(v,40);else if(typeof v==='boolean')st[key]=v;}}
  const pr=[];if(Array.isArray(raw.pr))for(const p of raw.pr.slice(-60)){if(!Array.isArray(p)||p.length!==10)continue;const [id,by,at,...rest]=p;if(typeof id!=='string'||!/^[a-z0-9]{3,10}$/i.test(id)||typeof by!=='string'||!/^[0-9A-F]{4,8}$/.test(by)||!Number.isFinite(at)||at<1.6e12||at>Date.now()+864e5)continue;const nums=rest.slice(0,6);if(!nums.every(Number.isFinite))continue;pr.push([id,by,at,...nums.map(v=>clamp(v,-600,600)),cleanStr(rest[6]??'',16)]);}
  pr.sort((a,b)=>a[2]-b[2]);return {n:Math.max(n,pr.length),st,pr:pr.slice(-PRINT_KEEP)};}
function mergeRec(a,b){if(!a)return b;if(!b)return a;const map=new Map();for(const p of [...a.pr,...b.pr])map.set(p[0],p);const pr=[...map.values()].sort((x,y)=>x[2]-y[2]).slice(-PRINT_KEEP);const st=(Number(b.st?._t)||0)>(Number(a.st?._t)||0)?b.st:a.st;return {n:Math.max(a.n,b.n,pr.length),st,pr};}
function sameRec(a,b){return !!a&&!!b&&a.n===b.n&&a.pr.length===b.pr.length&&a.pr.at(-1)?.[0]===b.pr.at(-1)?.[0]&&(a.st?._t||0)===(b.st?._t||0);}
let saveTimer=0;function saveWorldSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(WORLD_KEY,JSON.stringify(Object.fromEntries(World.recs)));}catch(e){}},800);}
const World={recs:new Map(),
  set(id,rec,source){this.recs.set(id,rec);const it=INTERACT.get(id);if(it){it.rec=rec;drawPrints(it);try{it.apply?.(rec,source);}catch(e){console.error('[APT200X] apply',id,e);}}saveWorldSoon();if($('modal').classList.contains('open'))renderWorldLog();},
  merge(id,raw,source){if(!INTERACT.has(id))return;const rec=sanitizeRec(raw);if(!rec)return;const cur=this.recs.get(id);const merged=mergeRec(cur,rec);if(sameRec(cur,merged))return;this.set(id,merged,source);},
  touch(id,{k='만짐',st=null,pt=null,n=null,silent=false}={}){const it=INTERACT.get(id);if(!it)return;
    if(!pt){pt=it.anchor();n=player.position.clone().setY(pt.y).sub(pt);n=n.lengthSq()>1e-6?n.normalize():new THREE.Vector3(0,0,1);}
    it.printParent.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(it.printParent.matrixWorld).invert(),lp=pt.clone().applyMatrix4(inv),ln=n.clone().transformDirection(inv);
    const print=[Math.random().toString(36).slice(2,9).padEnd(4,'0'),NET.id,Date.now(),r2(lp.x),r2(lp.y),r2(lp.z),r2(ln.x),r2(ln.y),r2(ln.z),cleanStr(k,16)];
    const prev=this.recs.get(id)||{n:0,st:{},pr:[]};const rec={n:prev.n+1,st:st?{...prev.st,...st,_t:Date.now()}:prev.st,pr:[...prev.pr,print].slice(-PRINT_KEEP)};
    this.set(id,rec,'local');publishObject(id,rec);if(!silent)toastPrint(it,rec);}};
function toastPrint(it,rec){const others=new Set(rec.pr.map(p=>p[1]));others.delete(NET.id);if(others.size&&Math.random()<.5)toast(`${it.name} · ${rec.n}번째 손자국. 방문자 ${[...others].slice(-2).map(x=>'#'+x).join(', ')}도 이곳을 만졌습니다.`);}
function publishObject(id,rec){Village.action({type:'touch',id,rec},{silent:true});}

try{const cache=JSON.parse(localStorage.getItem(WORLD_KEY)||'{}');for(const [id,raw] of Object.entries(cache))World.merge(id,raw,'initial');}catch(e){}

// ─── Presence ────────────────────────────────────────────────────────────────
const peers=new Map();
function createPeer(id){const rig=createMannequin();scene.add(rig.root);const ring=new THREE.Mesh(new THREE.TorusGeometry(.62,.04,6,28),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(hashStr('hue'+id),.55,.62),transparent:true,opacity:.75}));ring.rotation.x=Math.PI/2;ring.position.y=.06;rig.root.add(ring);
  const label=document.createElement('div');label.className='peer-label';label.textContent='#'+id;$('labels').append(label);
  const peer={id,rig,ring,label,pos:new THREE.Vector3(),target:new THREE.Vector3(),yaw:0,tyaw:0,speed:0,phase:0,a:0,r:0,g:0,d:0,f:0,c:0,last:performance.now(),fresh:true};peers.set(id,peer);
  if(started&&peers.size<6)toast(`방문자 #${id}가 단지에 들어왔습니다. 그쪽에서도 당신이 보입니다.`);renderNetStatus();return peer;}
function removePeer(id){const p=peers.get(id);if(!p)return;scene.remove(p.rig.root);p.ring.geometry.dispose();p.ring.material.dispose();p.label.remove();peers.delete(id);renderNetStatus();}
const num=(v,lo,hi)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,lo,hi):null;
function onPresence(id,payload){if(id===NET.id||!/^[0-9A-F]{4}$/.test(id))return;if(!payload){removePeer(id);return;}let m;try{m=JSON.parse(payload);}catch(e){return;}if(!m||m.i!==id)return;
  const x=num(m.x,-420,420),y=num(m.y,-60,420),z=num(m.z,-420,420);if(x===null||y===null||z===null)return;
  let p=peers.get(id);const now=performance.now();if(!p){if(peers.size>=MAX_PEERS)return;p=createPeer(id);}else if(now-p.last<40)return;
  p.target.set(x,y,z);if(p.fresh){p.pos.copy(p.target);p.fresh=false;}p.tyaw=num(m.h,-50,50)??p.tyaw;p.speed=num(m.s,0,2)??0;p.a=m.a===1||m.a===2?m.a:0;p.r=num(m.r,0,1)??0;p.g=m.g?1:0;p.d=m.d?1:0;p.f=Number.isInteger(m.f)?m.f&3:0;p.c=m.c?1:0;p.last=now;}
function sendPresence(force=false){Village.presence(force);}
function updatePeers(dt){const now=performance.now();for(const p of [...peers.values()]){if(now-p.last>PEER_TIMEOUT){removePeer(p.id);continue;}
    if(!timeFrozen){p.pos.lerp(p.target,1-Math.exp(-9*dt));const dy=Math.atan2(Math.sin(p.tyaw-p.yaw),Math.cos(p.tyaw-p.yaw));p.yaw+=dy*Math.min(1,dt*10);p.phase+=dt*10*p.speed;}
    const d=p.pos.distanceTo(player.position);p.rig.root.visible=d<160;if(!p.rig.root.visible)continue;p.rig.root.position.copy(p.pos);p.rig.heading.rotation.y=p.yaw;
    if(p.f&2){p.rig.root.position.x+=(Math.random()-.5)*.08;p.rig.root.position.z+=(Math.random()-.5)*.08;}p.ring.material.opacity=p.f?.35+Math.random()*.5:.75;
    if(!timeFrozen)poseMannequin(p.rig,{speed:p.speed,phase:p.phase,t:worldTime+hashStr(p.id)*9,airborne:p.a>0,vy:p.a===1?1:-1,roll:p.r,glide:!!p.g,sit:!!p.d},dt);}}
function updatePeerLabels(){for(const p of peers.values()){const d=p.pos.distanceTo(player.position);if(!started||!p.rig.root.visible||d>48||Math.abs(p.pos.y-player.position.y)>8){p.label.style.display='none';continue;}projected.copy(p.pos);projected.y+=3.3;projected.project(camera);if(projected.z>1){p.label.style.display='none';continue;}p.label.style.display='block';p.label.textContent=`#${p.id}${p.f&1?' · 무언가를 보는 중':''}${p.c?' · 엘리베이터':''}`;p.label.style.left=(projected.x*.5+.5)*innerWidth+'px';p.label.style.top=(-projected.y*.5+.5)*innerHeight+'px';}}

// ─── Connection ──────────────────────────────────────────────────────────────
function onNetMessage(topic,payload,retained,fromArchive){if(!topic.startsWith(TOPIC+'/'))return;const rest=topic.slice(TOPIC.length+1),slash=rest.indexOf('/');if(slash<0)return;const kind=rest.slice(0,slash),key=rest.slice(slash+1);
  if(kind==='p'&&!fromArchive){onPresence(key,payload);return;}
  if(kind==='o'){if(!payload)return;let raw;try{raw=JSON.parse(payload);}catch(e){return;}World.merge(key,raw,(retained||performance.now()-NET.connectedAt<4000)?'initial':'remote');return;}
  if(kind==='s'&&key==='visits'){try{const v=JSON.parse(payload);if(Number.isInteger(v?.n))NET.visits=Math.max(NET.visits,clamp(v.n,0,1e7));}catch(e){}renderNetStatus();}}
function setNetStatus(s){NET.status=s;renderNetStatus();}
function renderNetStatus(){const on=NET.status==='online',n=peers.size+1;$('online').textContent=String(n).padStart(2,'0');const el=$('netStatus');el.classList.toggle('on',on);el.textContent=on?`${NET.sharedMode==='relay'?'공동 산책':NET.sharedMode==='tabs'?'함께 걷는 오후':'공동 세계'} · 방문자 #${NET.id}${NET.visits?` · 누적 ${NET.visits}명`:''}`:NET.status==='connecting'?'푸른마을 중계소에 연결하는 중…':'이 단지에 남긴 기억을 기기에 보관하는 중';
  $('introPresence').textContent=on?`지금 ${n}명이 이 단지를 걷고 있습니다${NET.visits?` · 지금까지 ${NET.visits}명이 다녀감`:''}`:NET.status==='connecting'?'다른 방문자를 찾는 중…':'지금은 혼자 걷게 됩니다';}
function connectNet(){Village.connect();}
function openArchive(primary){const j=(primary+1)%RELAYS.length;const a=new MqttLink(RELAYS[j],{clientId:`apt200x_a_${NET.id}_${Math.random().toString(36).slice(2,6)}`,onOpen:()=>{NET.archive=a;a.subscribe([`${TOPIC}/o/+`,`${TOPIC}/s/+`]);},onMessage:(t,p,r)=>onNetMessage(t,p,r,true),onFail:()=>{},onClose:()=>{if(NET.archive===a)NET.archive=null;}});a.open();}
// Records this browser remembers but the relays forgot are published again.
function healWorld(){if(NET.healed)return;NET.healed=true;const list=[...World.recs.entries()];let i=0;const step=()=>{if(i>=list.length)return;const [id,rec]=list[i++];publishObject(id,rec);setTimeout(step,140);};step();}
function countVisit(){let counted=false;try{counted=!!localStorage.getItem('apt200x-counted:'+ROOM);}catch(e){}if(counted)return;NET.visits+=1;const v=JSON.stringify({n:NET.visits});for(const l of [NET.link,NET.archive])l?.publish(`${TOPIC}/s/visits`,v,true);try{localStorage.setItem('apt200x-counted:'+ROOM,'1');}catch(e){}renderNetStatus();}

function updateNet(dt){sendPresence();updatePeers(dt);if(frame%30===0)renderNetStatus();
  if(diorama&&frame%4===0){const m=diorama.markers,S=diorama.scale;let i=0;const put=(p,lift)=>{if(i>=40)return;_po.position.set(p.x*S,Math.max(0,p.y*S)+.03+lift,p.z*S);_po.rotation.set(0,0,0);_po.scale.setScalar(1);_po.updateMatrix();m.setMatrixAt(i++,_po.matrix);};put(player.position,Math.sin(worldTime*6)*.01);for(const p of peers.values())put(p.pos,0);m.count=i;m.instanceMatrix.needsUpdate=true;}}

