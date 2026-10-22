// A static-host transport: one elected browser runs the same rules as the optional Node server.
// Retained relay snapshots and a same-origin channel keep late joiners and separate tabs in one world.
function createStaticVillageTransport({meta,onState,onStatus,isStarted,getPresence}){
 const E=globalThis.VillageEngine,cfg=window.APT_CONFIG||{},links=[],members=new Map(),waiting=new Map(),seen=new Set();
 const site=(cfg.worldId||'pureun-v4')+':'+location.origin+location.pathname.replace(/index\.html$/,'').replace(/\/$/,'');
 const scope=Math.floor(hashStr(site)*4294967295).toString(16),topic=`apt200x/pureun-v4/${scope}/${ROOM}`,key='apt4-shared:'+scope+':'+ROOM;
 let fromCache=false,restored=false,userCommands=false;let world=null,leader=null,readyAt=performance.now()+2800,lastStep=performance.now(),lastSave=0,lastBroadcast=0,lastPresence=0,closed=false,counter=0,bc=null;
 const clock=()=>Date.now();
 try{world=JSON.parse(localStorage.getItem(key)||'null');}catch{}fromCache=!!world&&world.version===4;if(!fromCache)world=E.createWorld(ROOM);Object.assign(world,meta);globalThis.VillageSystems.init(world);
 try{bc=new BroadcastChannel(topic);bc.onmessage=e=>message(e.data);}catch{}
 function emit(m,retain=false){try{bc?.postMessage(m);}catch{}const payload=JSON.stringify(m);const suffix=m.type==='snapshot'?'world':m.type==='presence'?'p/'+m.id:m.type==='command'?'cmd/'+m.id:'ack/'+m.request;for(const l of links)if(l.ready)l.publish(topic+'/'+suffix,payload,retain);}
 function publicPlayers(){const out={};for(const [id,m]of members)if(clock()-m.at<6000&&m.player)out[id]=m.player;if(isStarted())out[NET.id]=getPresence();return out;}
 function elect(){const recent=[...members.values()].filter(m=>clock()-m.at<4500);let active=recent.filter(m=>m.eligible).map(m=>m.id);if(!document.hidden)active.push(NET.id);if(!active.length)active=[...recent.map(m=>m.id),NET.id];active.sort();return active[0]||NET.id;}
 function persist(){try{localStorage.setItem(key,JSON.stringify(world));}catch{}}
 function deliver(){onState(E.publicState(world,publicPlayers(),clock()));}
 function publish(){const m={type:'snapshot',owner:NET.id,at:clock(),world};emit(m,true);lastBroadcast=performance.now();persist();}
 function execute(m){world.commandResults??={};if(world.commandResults[m.request]){const ack={type:'ack',request:m.request,result:world.commandResults[m.request]};emit(ack);if(waiting.has(m.request)){waiting.get(m.request).resolve(ack.result);waiting.delete(m.request);}return;}if(seen.has(m.request))return;userCommands=true;seen.add(m.request);if(seen.size>800)seen.delete(seen.values().next().value);const ps=publicPlayers();if(m.player)ps[m.id]=m.player;const result=E.apply(world,m.action,m.id,ps,clock());world.commandResults[m.request]=result;const resultKeys=Object.keys(world.commandResults);if(resultKeys.length>200)delete world.commandResults[resultKeys[0]];const ack={type:'ack',request:m.request,result};emit(ack);if(waiting.has(m.request)){waiting.get(m.request).resolve(result);waiting.delete(m.request);}if(result.ok){publish();deliver();}}
 function message(m){if(!m||typeof m!=='object')return;
  if(m.type==='presence'&&/^[0-9A-F]{4}$/.test(m.id)&&m.id!==NET.id){if(!Number.isFinite(m.at)||Math.abs(m.at-clock())>30000)return;members.set(m.id,m);return;}
  if(m.type==='snapshot'&&m.world?.version===4&&Number.isFinite(m.at)&&m.owner!==NET.id){if(m.at<clock()-30*864e5)return;const selected=elect();const known=members.has(m.owner);if(performance.now()>readyAt&&known&&selected!==m.owner)return;if(!world||!restored&&!fromCache&&!userCommands||m.at>=(world.clock||0)){restored=true;world=m.world;Object.assign(world,meta);globalThis.VillageSystems.init(world);world.clock=m.at;persist();deliver();}return;}
  if(m.type==='command'&&leader===NET.id&&/^[0-9A-F]{4}$/.test(m.id)&&typeof m.request==='string'&&m.request.length<100){execute(m);return;}
  if(m.type==='ack'&&waiting.has(m.request)){const q=waiting.get(m.request);waiting.delete(m.request);q.resolve(m.result);}
 }
 function connectRelay(url,index){const link=new MqttLink(url,{clientId:'apt4_'+NET.id+'_'+Math.random().toString(36).slice(2,8),will:{topic:topic+'/p/'+NET.id,payload:''},onOpen:()=>{link.subscribe([topic+'/world',topic+'/p/+',topic+'/cmd/+',topic+'/ack/+']);onStatus('relay');},onMessage:(_t,p)=>{if(!p)return;try{message(JSON.parse(p));}catch{}},onFail:()=>{if(!closed)setTimeout(()=>connectRelay(url,index),14000);},onClose:()=>{if(!closed)setTimeout(()=>connectRelay(url,index),4000);}});links[index]?.close();links[index]=link;link.open();}
 for(const [i,url]of (cfg.relays||RELAYS).slice(0,2).entries())connectRelay(url,i);
 const loop=setInterval(()=>{if(closed)return;const now=performance.now();if(now-lastPresence>700){lastPresence=now;emit({type:'presence',id:NET.id,at:clock(),eligible:!document.hidden,player:isStarted()?getPresence():null});}
  leader=elect();if(now>readyAt&&leader===NET.id){let elapsed=Math.min(.5,(now-lastStep)/1000);if(elapsed>0)E.step(world,publicPlayers(),clock(),elapsed);if(now-lastBroadcast>900)publish();deliver();}lastStep=now;
  if(now-lastSave>4000){lastSave=now;persist();}for(const [request,p]of waiting){if(now-p.at>10000){p.resolve({ok:false,error:'공동 세계의 응답을 기다리는 중입니다.'});waiting.delete(request);}else if(now>p.retryAt){p.retryAt=now+1500;leader=elect();if(leader===NET.id&&now>readyAt)execute(p.message);else emit(p.message);}}
  onStatus(links.some(l=>l?.ready)?'relay':members.size?'tabs':'local');
 },100);
 deliver();
 return {action(a){const request=NET.id+'-'+clock().toString(36)+'-'+(++counter).toString(36),m={type:'command',request,id:NET.id,player:isStarted()?getPresence():null,action:a};return new Promise(resolve=>{waiting.set(request,{resolve,at:performance.now(),retryAt:performance.now()+1500,message:m});leader=elect();if(leader===NET.id&&performance.now()>readyAt)execute(m);else{emit(m);setTimeout(()=>{if(waiting.has(request)){leader=elect();if(leader===NET.id)execute(m);else emit(m);}},3100);}});},presence(){lastPresence=0;},close(){closed=true;clearInterval(loop);for(const l of links)l?.close();bc?.close();persist();},inspect:()=>({leader,self:NET.id,relays:links.filter(l=>l?.ready).length,scope,topic,mode:'static'}),getFullState:()=>world};
}
