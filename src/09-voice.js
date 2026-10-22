// ─── Voices from nowhere ─────────────────────────────────────────────────────
// Korean speech synthesis when the device has it, a formant "voice" when it doesn't, subtitles always.
const timers=[];function later(sec,fn){timers.push({t:worldTime+sec,fn});}
function runTimers(){for(let i=timers.length-1;i>=0;i--)if(worldTime>=timers[i].t){const f=timers[i].fn;timers.splice(i,1);try{f();}catch(e){console.error('[APT200X] timer',e);}}}
const Voice={ko:null,primed:false};
function primeSpeech(){}
function voiceCancel(){}
function fillTokens(text){return String(text).replace(/\{(\w+)\}/g,(m,k)=>{switch(k){case 'visitor':return '#'+NET.id;case 'time':return new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});case 'online':return `지금 이 단지에 ${peers.size+1}명이 있습니다.`;case 'place':return $('location').textContent;case 'others':return othersSentence();}return m;});}
function othersSentence(){let best=null,bd=Infinity;for(const p of peers.values()){const d=p.pos.distanceTo(player.position);if(d<bd){bd=d;best=p;}}
  if(best&&bd<70){const to=best.pos.clone().sub(player.position);camera.getWorldDirection(projected);const ang=Math.atan2(to.x,to.z)-Math.atan2(projected.x,projected.z),a=Math.atan2(Math.sin(ang),Math.cos(ang));const dir=Math.abs(a)<.8?'앞쪽':Math.abs(a)>2.3?'바로 뒤쪽':a>0?'왼쪽':'오른쪽';return `${dir} ${Math.round(bd)}m에 방문자 #${best.id}가 서 있습니다.`;}
  if(peers.size)return `다른 ${peers.size}명은 당신을 보지 못합니다.`;return '이 단지에는 당신뿐입니다. 그런데 발소리는 두 사람분입니다.';}
// Subtitles and screen hits.
let subtitleTimer=0;
function subtitle(text,preset){const el=$('voice');el.className='voice show '+preset;el.textContent=text;el.style.animation='none';void el.offsetWidth;el.style.animation='';subtitleTimer=Math.max(2.4,text.length*.13+1.4);}
function flash(kind='white'){if(voices!=='full')return;const el=$('flash');el.className='';void el.offsetWidth;el.className='on '+kind;}
// A formant buzz that sounds like speech when the device has no Korean voice.
function voiceSay(raw,preset='announcer'){if(started)subtitle(fillTokens(raw),preset);}
// The silence before the voice is the scary part.
let nextHallucination=40+Math.random()*25;
function hallucinate(line,{force=false}={}){if(!started||paused)return;if(voices==='off'&&!force){subtitle(fillTokens(line.text),line.preset);return;}
  duck(1.1+String(line.text).length*.08,.015);NET.flags.h=1;later(4,()=>{NET.flags.h=0;});
  later(.5,()=>{voiceSay(line.text,line.preset,{loud:true});if(voices==='full'){flash(line.preset==='giant'?'invert':'white');shake(line.preset==='whisper'?.3:.9,.5);}});}
function updateHallucinations(dt){subtitleTimer-=dt;if(subtitleTimer<=0)$('voice').classList.remove('show');
  nextHallucination-=dt;if(nextHallucination>0)return;nextHallucination=120+Math.random()*120;
  if(camOverride||document.querySelector('.memory'))return;
  hallucinate(HALLUCINATIONS[Math.floor(Math.random()*HALLUCINATIONS.length)]);}
function hudGlitch(text,seconds=3){const el=$('sector');el.textContent=fillTokens(text);el.classList.add('glitch');later(seconds,()=>{el.classList.remove('glitch');locationKey='';});}
function cctv(on,label=''){document.body.classList.toggle('cctv',on);$('cctv').textContent=label;}

