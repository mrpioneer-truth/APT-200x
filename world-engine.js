/* Shared deterministic rules; used by both the server and the standalone preview. */
(() => {
'use strict';
const FLOOR_Y=[-40,-24,-12,.6,64,196,330];
const TYPES=['planter','path','lamp','arch','bench','platform'];
const TOUCH_IDS=new Set(['elevator','greenhouse','sculpture','stairway','tilewall','b3door','gate','sign','skytower','telescope','twindoor','dish','pool','cars','mycelium','diorama',...Array.from({length:7},(_,i)=>'tower:'+(101+i)),...Array.from({length:4},(_,i)=>'bench:'+i),...Array.from({length:30},(_,i)=>'egg:EE_'+String(i+1).padStart(3,'0'))]);
const NAMES=['여울','모아','윤슬','다온','해솔','나래','이든','소담','가람','보늬'];
const ROLES=['정원사','길잡이','조명사','건축가','수리공','기록원','생태관리','수영장지기','야간순찰','조경가'];
const finite=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
const terrain=(x,z)=>Math.sin(x*.023)*1.25+Math.cos(z*.024)*.95+Math.sin(x*.013+z*.014)*1.1;
const clean=s=>String(s??'').replace(/[<>\x00-\x1f]/g,'').slice(0,180);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0)/4294967296;};
const ease=t=>t<.5?2*t*t:1-(-2*t+2)**2/2;
function createWorld(room='main',now=Date.now()){
 const creatures=[['dog','보리',8,17],['cat','구름',-10,10],['hedgehog','밤송이',20,29],['dog','두부',-18,35],['watcher','창문을 세는 것',-30,-95],['bell','목 없는 종지기',80,-43],['crawler','벤치 밑의 손님',-75,45],['moth','흰 나방의 대리인',46,-65],['stilt','길어진 이웃',-100,-34],['echo','돌아오지 않는 개',110,40]].map(([kind,name,x,z],i)=>({id:'c'+i,kind,name,friendly:i<4,x,z,y:terrain(x,z),homeX:x,homeZ:z,trust:{},follow:null,lastAttack:0}));
 const world={version:4,room,created:now,rev:0,clock:now,anomalies:{},spawned:[],nextEcho:now+60000,elevator:{cur:3,y:FLOOR_Y[3],door:1,openUntil:now+7000,trip:null,queue:[]},objects:{},touches:{},residents:NAMES.map((name,i)=>({id:'r'+i,name,role:ROLES[i],x:(i%5-2)*6,z:31+Math.floor(i/5)*7,y:0,target:null,plan:null,say:'오늘도 내일을 가꿔요.',until:now+15000,task:'둘러보기',next:now+2000+i*1300})),creatures,log:[],shriek:null,ai:{mode:'rules',calls:0,lastError:null},nextAI:now+90000};
 globalThis.VillageSystems?.init(world);return world;
}
function log(w,by,text,now){w.log.push({by,text:clean(text),at:now});w.log=w.log.slice(-160);}
function elevatorAt(e,now){if(!e.trip)return e.y;const t=e.trip;return t.from+(FLOOR_Y[t.to]-t.from)*ease(clamp((now-t.start)/t.duration,0,1));}
function queueFloor(w,to,now){const e=w.elevator;if(!Number.isInteger(to)||to<0||to>6)return false;
 if(!e.trip&&e.cur===to){e.door=1;e.openUntil=now+9000;return true;}
 if(!e.queue.includes(to)&&e.trip?.to!==to){e.queue.push(to);if(!e.trip)e.openUntil=Math.min(e.openUntil,now+1200);}return true;}
function canPlace(w,x,z,kind,y=terrain(x,z),ignore=null){
 if(!TYPES.includes(kind)||!finite(x,-245,245)||!finite(z,-245,245)||!finite(y,-41,210))return false;
 // Keep the entire elevator apron and underground ramps clear, including high landings.
 if(x>50&&x<68&&z< -171&&z> -194)return false;
 if(x>67&&x<90&&z> -119&&z< -76)return false;
 if(Math.abs(y-terrain(x,z))<2){
  if(w.obstacles?.some(b=>x>b[0]-1.3&&x<b[1]+1.3&&z>b[2]-1.3&&z<b[3]+1.3))return false;
 }else if(!((y===-12&&x>30&&x<112&&z> -174&&z< -123)||(y===-24&&x>33&&x<112&&z> -174&&z< -123)||(y===-40&&x>27&&x<110&&z> -173&&z< -120)||(Math.abs(y-196)<1&&x>45&&x<74&&z> -211&&z< -187)||(Math.abs(y-64)<1&&x>70&&x<130&&z> -181&&z< -177)))return false;
 return !Object.values(w.objects).some(o=>o.id!==ignore&&Math.abs(o.y-y)<2&&Math.hypot(o.x-x,o.z-z)<(kind==='path'&&o.kind==='path'?1.9:2.8));
}
function place(w,{x,z,y,kind,rotation=0},by,now){x=Math.round(x/2)*2;z=Math.round(z/2)*2;y=Math.abs((y??terrain(x,z))-terrain(x,z))<2?terrain(x,z):y;
 if(Object.keys(w.objects).length>=240||!canPlace(w,x,z,kind,y))return null;
 const id=by+'-'+now.toString(36)+'-'+(w.rev++).toString(36),o={id,kind,x,y,z,rotation:Math.round(rotation)%4,by,at:now,water:0};w.objects[id]=o;log(w,by,({planter:'화단을 심었습니다',path:'길을 이었습니다',lamp:'가로등을 세웠습니다',arch:'아치를 세웠습니다',bench:'벤치를 놓았습니다',platform:'디딤대를 쌓았습니다'})[kind],now);return o;}
function validPlayer(p){return p&&finite(p.x,-420,420)&&finite(p.y,-65,420)&&finite(p.z,-420,420);}
function near(p,x,y,z,d=15){return p&&Math.abs(p.y-y)<8&&Math.hypot(p.x-x,p.z-z)<d;}
function apply(w,a,by,players={},now=Date.now()){
 if(!a||typeof a!=='object')return {ok:false,error:'잘못된 요청'};globalThis.VillageSystems?.init(w);const special=globalThis.VillageSystems?.command(w,a,by,players,now);if(special)return special;const p=players[by];let changed=true,result=null;
 switch(a.type){
 case 'activate': {const key=clean(a.key);const spot=w.eggSpots?.[key]||w.spawned.find(e=>e.key===key);if(!spot)return {ok:false,error:'없는 기억'};if(!near(p,spot.x,(spot.level??terrain(spot.x,spot.z))+1.2,spot.z,16))return {ok:false,error:'기억에 더 가까이 다가가세요'};if(Object.values(w.anomalies).some(e=>e.status==='active'))return {ok:true};if(w.anomalies[key]?.status==='done')return {ok:true};w.anomalies[key]={key,status:'active',at:now,clicks:0,required:spot.required||2,closed:[]};log(w,by,'같은 기억이 단지 전체에 번졌습니다.',now);break;}
 case 'click': case 'closeMemory': {const e=w.anomalies[a.key],spot=w.eggSpots?.[a.key]||w.spawned.find(e=>e.key===a.key);if(!e||e.status!=='active'||!spot)return {ok:false,error:'이미 복구된 기억'};if(!near(p,spot.x,(spot.level??terrain(spot.x,spot.z))+1.2,spot.z,28)&&a.type!=='closeMemory')return {ok:false,error:'빛의 중심에 가까이 가세요'};
 if(a.type==='closeMemory'){if(!Number.isInteger(a.index)||a.index<0||a.index>=e.required)return {ok:false,error:'없는 기록'};if(!e.closed.includes(a.index))e.closed.push(a.index);e.clicks=e.closed.length;}else e.clicks++;
 if(e.clicks>=e.required){e.status='done';e.doneAt=now;log(w,by,'기억을 함께 복구했습니다.',now);w.nextEcho=Math.min(w.nextEcho,now+6000);}break;}
 case 'elevator': {const to=a.floor;if(!Number.isInteger(to)||to<0||to>6)return {ok:false,error:'없는 층'};const e=w.elevator,y=elevatorAt(e,now),inside=near(p,60,y,-184.5,4.5),landing=FLOOR_Y.some(f=>near(p,60,f,-180.5,7));if(!inside&&!landing)return {ok:false,error:'호출 버튼에 가까이 가세요'};queueFloor(w,to,now);break;}
 case 'door': {const e=w.elevator;if(!near(p,60,elevatorAt(e,now),-183.5,7)||e.trip)return {ok:false,error:'움직이는 중입니다'};e.door=1;e.openUntil=now+12000;break;}
 case 'touch': {if(!TOUCH_IDS.has(a.id)||!a.rec||JSON.stringify(a.rec).length>20000)return {ok:false,error:'잘못된 기록'};const prev=w.touches[a.id];const m=new Map([...(prev?.pr||[]),...(Array.isArray(a.rec.pr)?a.rec.pr:[])].filter(q=>Array.isArray(q)&&q.length===10&&Number.isFinite(q[2])).map(q=>[q[0],q]));const pr=[...m.values()].sort((a,b)=>a[2]-b[2]).slice(-40);const st=(prev?.st?._t||0)>(a.rec.st?._t||0)?prev.st:a.rec.st;w.touches[a.id]={n:Math.max(prev?.n||0,a.rec.n||0,pr.length),st:st||{},pr};break;}
 case 'build': {if(!near(p,a.x,a.y??terrain(a.x,a.z),a.z,13))return {ok:false,error:'13m 안쪽에 놓을 수 있습니다'};result=place(w,a,by,now);if(!result)return {ok:false,error:'통로나 다른 물건을 피해 놓아 주세요'};break;}
 case 'remove': {const o=w.objects[a.id];if(!o||o.by!==by||!near(p,o.x,o.y,o.z,15))return {ok:false,error:'내가 놓은 물건만 회수할 수 있습니다'};delete w.objects[a.id];log(w,by,'내가 놓은 물건을 회수했습니다.',now);break;}
 case 'water': {const o=w.objects[a.id];if(!o||o.kind!=='planter'||!near(p,o.x,o.y,o.z,12))return {ok:false,error:'화단에 가까이 가세요'};o.water=Math.min(8,o.water+1);log(w,by,'화단에 물을 주었습니다.',now);break;}
 case 'pet': {const c=w.creatures.find(c=>c.id===a.id);if(!c||!near(p,c.x,c.y,c.z,5))return {ok:false,error:'동물에 가까이 가세요'};if(c.friendly){c.trust[by]=Math.min(10,(c.trust[by]||0)+1);c.follow=c.trust[by]>=2?by:null;log(w,by,c.name+'에게 인사했습니다.',now);}else {w.shriek={at:now,id:c.id,text:c.name+'이 당신을 기억합니다.'};}break;}
 case 'residentMessage': {const r=w.residents.find(r=>r.id===a.id);if(!r||!near(p,r.x,r.y,r.z,9))return {ok:false,error:'주민에게 가까이 가세요'};const text=clean(a.text).slice(0,100);if(!text)return {ok:false,error:'메시지를 입력해 주세요'};log(w,by,r.name+'에게: '+text,now);r.inbox={from:by,text};r.next=now;break;}
 default:return {ok:false,error:'지원하지 않는 행동'};
 }
 if(changed)w.rev++;w.clock=now;return {ok:true,result};
}
function scheduleResident(w,r,plan,now){
 if(r.body&&!r.body.alive||r.escort||r.squad||r.enemy)return;
 const kinds=TYPES;let kind=kinds.includes(plan.kind)?plan.kind:'planter';let x=Number(plan.x),z=Number(plan.z);if(!finite(x,-180,180)||!finite(z,-180,180)||Math.hypot(x,z)>180){const t=now/25000+Number(r.id.slice(1))*2.1;const radius=45+hash(r.id+Math.floor(now/30000))*130;x=Math.round((Math.cos(t)*radius)/2)*2;z=Math.round((Math.sin(t)*radius)/2)*2;}
 if(!canPlace(w,x,z,kind)){for(let k=0;k<24;k++){const a=k*2.4;const xx=Math.round((x+Math.cos(a)*Math.sqrt(k+1)*4)/2)*2,zz=Math.round((z+Math.sin(a)*Math.sqrt(k+1)*4)/2)*2;if(Math.hypot(xx,zz)<=180&&canPlace(w,xx,zz,kind)){x=xx;z=zz;break;}}}
 const say=clean(plan.say||'이곳에 작은 정원을 더해 볼까요?');r.say=say;r.until=now+19000;r.task=plan.action==='water'?'화단 돌보기':plan.action==='talk'?'이웃과 대화':'함께 가꾸기';
 r.plan={action:['build','water','talk'].includes(plan.action)?plan.action:'build',kind,x,z,to:clean(plan.to)};r.target={x,z};r.next=now+24000;
 log(w,r.id,(r.inbox?'이웃에게: ':plan.to?plan.to+'에게: ':'')+say,now);r.inbox=null;const recipient=w.residents.find(other=>other.name===plan.to||other.id===plan.to);if(recipient&&recipient.id!==r.id)recipient.inbox={from:r.id,text:say};w.rev++;
}
function step(w,players={},now=Date.now(),dt=.1,{rules=true}={}){
 const e=w.elevator;e.y=elevatorAt(e,now);
 if(e.trip&&now>=e.trip.start+e.trip.duration){e.cur=e.trip.to;e.y=FLOOR_Y[e.cur];e.trip=null;e.door=1;e.openUntil=now+10000;w.rev++;}
 if(!e.trip){const doorway=Object.values(players).some(p=>Math.abs(p.y-e.y)<1.7&&Math.abs(p.x-60)<2.1&&p.z> -183.5&&p.z< -181.4);if(doorway)e.openUntil=Math.max(e.openUntil,now+1500);
 if(now>=e.openUntil){e.door=0;if(e.queue.length){const to=e.queue.shift();if(to!==e.cur){e.trip={from:e.y,to,start:now+800,duration:1800+Math.abs(FLOOR_Y[to]-e.y)/22*1000};w.rev++;}else{e.door=1;e.openUntil=now+8000;}}}}
 globalThis.VillageSystems.step(w,players,now,dt,{rules,place,log,scheduleResident});
 if(now>w.nextEcho&&w.spawned.length<30&&Object.values(players).length){const keys=Object.keys(w.eggSpots||{});if(keys.length){const i=w.spawned.length,base=keys[i%keys.length],x=Math.round(Math.sin(i*2.4)*70),z=Math.round(30+Math.cos(i*2.4)*65),key='SHARED_'+String(i).padStart(3,'0');w.spawned.push({key,echoOf:base,x,z,level:null,required:w.eggSpots[base].required});w.rev++;}w.nextEcho=now+60000;}
 // A floor-erasure episode completes for everyone on the same world clock.
 for(const a of Object.values(w.anomalies))if(a.status==='active'&&a.key==='EE_018'&&now-a.at>14000){a.status='done';a.doneAt=now;w.rev++;}
 if(Object.keys(players).length&&(!w.nextHallucination||now>w.nextHallucination)){w.hallucination={at:now,index:Math.floor(hash(w.room+Math.floor(now/90000))*20)};w.nextHallucination=now+90000;w.rev++;}
 w.clock=now;return w;
}
function publicState(w,players={},now=Date.now()){const S=globalThis.VillageSystems;const {commandResults,...visible}=w;return {...visible,clock:now,players,residents:w.residents.map(S.projectEntity),creatures:w.creatures.map(S.projectEntity)};}
globalThis.VillageEngine={createWorld,apply,step,publicState,queueFloor,elevatorAt,FLOOR_Y,TYPES,terrain,hash,canPlace,scheduleResident};
})();
