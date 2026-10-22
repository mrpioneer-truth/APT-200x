// ─── Memories: 30 placed from the data, more growing every minute ───────────
const glowGeo=new THREE.SphereGeometry(.43,12,8),ringGeo=new THREE.TorusGeometry(1.15,.035,5,32);
let dynSerial=0;
function validSpot(x,z){return Math.hypot(x,z)<WORLD_RADIUS-30&&spotClear(x,z,2);}
function spawnEgg(def,x,z,{level=null,target=null}={}){if(eggs.filter(e=>!e.done).length>=96){const stale=eggs.filter(e=>!e.done&&!e.active&&e.group.position.distanceTo(player.position)>70).sort((a,b)=>a.id-b.id)[0];if(stale){disposeEgg(stale);stale.done=true;}else return null;}
  const type=TYPE_INDEX[def.type]??0,id=eggSerial++,g=new THREE.Group();g.name='egg';const floor=level??surfaceHeight(x,z,terrainY(x,z)+2.2);g.position.set(x,floor+1.2,z);scene.add(g);
  const color=[0xe7edc9,0xc1d7f3,0xf5dcda][type];const m=phong(color,{emissive:color,emissiveIntensity:.16,transparent:true,opacity:.55});const orb=mesh(glowGeo,m,0,.3,0,g);const ring=mesh(ringGeo,phong(color,{emissive:color,emissiveIntensity:.12,transparent:true,opacity:.35}),0,-.4,0,g);ring.rotation.x=Math.PI/2;
  const egg={id,key:def.id,def,extra:EGG_EXTRA[def.echoOf||def.id]||null,type,variant:id%10,group:g,orb,ring,active:false,done:false,windows:[],fx:null,clicks:0,required:type===2?(def.popups||[]).length+(EGG_EXTRA[def.echoOf||def.id]?.extraPopup?1:0):Math.max(1,def.requiredClicks||1),target,level,popups:(def.popups||[]).map(p=>({title:p.title,body:p.body})),recipe:def.recipe||null};
  orb.userData.egg=egg;ring.userData.egg=egg;if(target)target.traverse(o=>{if(o.isMesh)o.userData.eggTarget=egg;});eggs.push(egg);updateCounts();return egg;}
for(const def of INITIAL_EASTER_EGGS){const s=EGG_SPOTS[def.id];spawnEgg(def,s.x,s.z,{target:EGG_TARGETS[def.id]||null});}
// New memories copy the data, the growth templates, or the very first prototype.
function makeDynamicDef(){const r=Math.random();let def;
  if(r<.35)def=JSON.parse(JSON.stringify(DYNAMIC_SPAWN_TEMPLATES[Math.floor(Math.random()*DYNAMIC_SPAWN_TEMPLATES.length)]));
  else if(r<.55){const type=['AUDIO','SPATIAL','INFO_POPUP'][Math.floor(Math.random()*3)];def={type,triggerRadius:8,requiredClicks:1,floatingLabel:'[되살아난 기억: 200X.06.21 14:00]',visualTarget:'',recipe:type==='AUDIO'?'classic'+(dynSerial%2):null,spatialEffect:type==='SPATIAL'?{mutationType:'CLASSIC_DRIFT'}:null,popups:type==='INFO_POPUP'?memoryTexts.slice().sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*3)).map(([title,body])=>({title,body})):null};}
  else{const base=INITIAL_EASTER_EGGS[Math.floor(Math.random()*INITIAL_EASTER_EGGS.length)];def=JSON.parse(JSON.stringify(base));def.echoOf=base.id;def.floatingLabel='[증식] '+base.floatingLabel;}
  def.id='DYN_'+String(++dynSerial).padStart(3,'0');if(def.type==='AUDIO'&&!def.recipe&&!def.echoOf)def.recipe='pianoEtude';
  if(def.type==='INFO_POPUP'&&def.popups&&def.popups.length<3&&Math.random()<.6){const [title,body]=memoryTexts[Math.floor(Math.random()*memoryTexts.length)];def.popups.push({title,body});}
  return def;}
function spawnAround(){const room=currentRoom();for(let n=0;n<35;n++){let x,z,level=null;
    if(room){x=room.minX+3+Math.random()*(room.maxX-room.minX-6);z=room.minZ+3+Math.random()*(room.maxZ-room.minZ-6);level=room.floor;if(blocked(x,z,level)||(room===B2&&inRect(POOL,x,z)))continue;}
    else{let a=Math.random()*TAU,d=30+Math.random()*70;x=player.position.x+Math.cos(a)*d;z=player.position.z+Math.sin(a)*d;if(!validSpot(x,z))continue;}
    if(!eggs.some(e=>!e.done&&Math.hypot(e.group.position.x-x,e.group.position.z-z)<9)){spawnEgg(makeDynamicDef(),x,z,{level});return;}}}
function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3900);}
function activateEggLocal(egg){if(egg.active||egg.done)return;egg.active=true;found++;egg.orb.material.opacity=.9;egg.orb.material.emissiveIntensity=.55;egg.orb.scale.setScalar(1.7);egg.ring.material.opacity=.75;
  try{egg.fx=startEffect(egg);}catch(e){console.error('[APT200X] effect',egg.key,e);}
  NET.flags.a=1;
  toast(`${egg.def.floatingLabel||typeNames[egg.type]}\n`+['어디선가 오래된 광고가 들립니다. 소리의 근원을 터치하세요.','기억과 공간이 어긋났습니다. 빛나는 중심을 터치해 되돌리세요.','누군가의 기록이 열렸습니다. 떠오른 창을 모두 닫아주세요.'][egg.type]+(egg.type!==2&&egg.required>1?` (${egg.required}번)`:''));updateCounts();}
function clickEggLocal(egg){if(!egg||egg.done||!egg.active)return;if(egg.type===2){toast('떠오른 기록 창을 모두 닫아주세요.');return;}
  egg.clicks++;if(egg.clicks>=egg.required){restoreEgg(egg);return;}
  try{egg.fx?.click?.(egg.clicks);}catch(e){console.error('[APT200X] click',e);}toast(`복구 진행 ${egg.clicks} / ${egg.required} — 무언가 더 크게 흔들립니다.`);}
function createMemoryWindow(egg,index,popup){if(Village.memoryClosed(egg.key,index))return;const extra=egg.extra||{};let el=document.createElement('div');el.className='memory';let title=document.createElement('div');title.className='memory-title';const filename=document.createElement('span');title.append(filename);let close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','기록 창 닫기');title.append(close);let body=document.createElement('div');body.className='memory-body';
  const fill=(t,b)=>{filename.textContent=fillTokens(t);body.replaceChildren();let strong=document.createElement('b');strong.textContent=fillTokens(t).replace(/\.(txt|memo|log|hwp|jpg|bmp|wav|xls|doc|dmp|msg)$/,'');body.append(strong,document.createElement('br'),document.createTextNode(fillTokens(b)));let small=document.createElement('small');small.textContent=`FICTIONAL ARCHIVE / MEMORY ${String(egg.id+1).padStart(3,'0')} / 200X.06.21 14:00`;body.append(small);};
  fill(popup.title,popup.body);let ok=document.createElement('button');ok.className='memory-dismiss';ok.textContent='기억 닫기';el.append(title,body,ok);$('memories').append(el);sfx('popup');
  let record={el,index,closed:false,reopened:false};egg.windows.push(record);
  const dismiss=ev=>{ev.preventDefault();ev.stopPropagation();if(record.closed||paused)return;
    if(extra.stubborn===index&&!record.reopened){record.reopened=true;const [t,b]=extra.stubbornText;fill(t,b);el.classList.add('shake');sfx('error');later(.6,()=>el.classList.remove('shake'));voiceSay(b,'whisper');return;}
    Village.action({type:'closeMemory',key:egg.key,index});};
  close.addEventListener('pointerdown',dismiss);ok.addEventListener('pointerdown',dismiss);el.addEventListener('pointerdown',ev=>{if(ev.target===close||ev.target===ok)return;dismiss(ev);});}
function disposeEgg(egg){if(egg.fx){try{egg.fx.dispose();}catch(e){console.error('[APT200X] dispose',e);}egg.fx=null;}egg.windows.forEach(w=>w.el.remove());egg.windows=[];egg.orb.material.dispose();egg.ring.material.dispose();scene.remove(egg.group);if(egg.target)egg.target.traverse(o=>{if(o.userData.eggTarget===egg)delete o.userData.eggTarget;});}
function restoreEggLocal(egg,{note=''}={}){if(!egg||egg.done||!egg.active)return;if(!note&&egg.type===2&&egg.windows.some(w=>!w.closed)){toast('떠오른 기록 창을 모두 닫아주세요.');return;}
  egg.done=true;egg.active=false;restored++;disposeEgg(egg);NET.flags.a=eggs.some(e=>e.active&&!e.done)?1:0;chime();
  const title=typeNames[egg.type];journal.push({title,time:new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}),id:egg.id+1});if(journal.length>80)journal.shift();try{localStorage.setItem('apt200x-journal',JSON.stringify(journal));}catch(e){}
  if(egg.target&&INTERACT.has('egg:'+egg.key))World.touch('egg:'+egg.key,{k:'기억 복구'});
  if(egg.key==='EE_029')flags.infinity=true;
  toast(`기억 ${String(egg.id+1).padStart(3,'0')} 공동 복구 완료. 모두가 같은 오후로 돌아왔습니다.`);updateCounts();renderJournal();}
function updateCounts(){$('found').textContent=String(found).padStart(2,'0');$('restored').textContent=String(restored).padStart(2,'0');$('remaining').textContent=String(eggs.filter(e=>!e.done).length).padStart(2,'0');$('anomalyIndicator').classList.toggle('on',eggs.some(e=>e.active&&!e.done));}
function nearestActive(){return eggs.filter(e=>e.active&&!e.done&&e.group.position.distanceTo(player.position)<17).sort((a,b)=>a.group.position.distanceToSquared(player.position)-b.group.position.distanceToSquared(player.position))[0];}
// Dormant memories announce themselves with their file name when you are close.
const eggLabels=[];
function updateEggLabels(){const p=player.position,list=started?eggs.filter(e=>!e.done&&!e.active&&Math.abs(e.group.position.y-p.y)<9&&e.group.position.distanceTo(p)<34).sort((a,b)=>a.group.position.distanceToSquared(p)-b.group.position.distanceToSquared(p)).slice(0,3):[];
  while(eggLabels.length<3){const el=document.createElement('div');el.className='egg-label';$('labels').append(el);eggLabels.push(el);}
  eggLabels.forEach((el,i)=>{const e=list[i];if(!e){el.style.display='none';return;}projected.copy(e.group.position);projected.y+=1.6;projected.project(camera);if(projected.z>1){el.style.display='none';return;}el.style.display='block';el.textContent=e.def.floatingLabel||'[알 수 없는 신호]';el.style.left=(projected.x*.5+.5)*innerWidth+'px';el.style.top=(-projected.y*.5+.5)*innerHeight+'px';el.style.opacity=String(clamp(1.3-e.group.position.distanceTo(p)/34,0,1));});}


function activateEgg(egg){if(egg&&!egg.active&&!egg.done)Village.requestActivation(egg);}
function clickEgg(egg){if(egg?.active&&!egg.done)Village.action({type:'click',key:egg.key});}
function restoreEgg(){/* Episode completion is decided by the world clock. */}
