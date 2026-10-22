// ─── Sound: the original radio, plus synthesized memories, stingers and room acoustics ─
let listener=null,ctx=null,ambient=null,melodyClock=0,noteIndex=0,birdClock=0;let audioReady=false;
const bus={};
function note(freq,at,duration,gain=.025,type='sine',destination){if(!ctx)return;const o=ctx.createOscillator(),a=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);a.gain.setValueAtTime(.0001,at);a.gain.exponentialRampToValueAtTime(gain,at+.025);a.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(a);a.connect(destination||ambient);o.start(at);o.stop(at+duration+.05);o.onended=()=>{o.disconnect();a.disconnect();};}
function impulse(seconds,decay){const len=Math.floor(ctx.sampleRate*seconds),buf=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}return buf;}
async function unlockAudio(){if(!ctx){listener=new THREE.AudioListener();camera.add(listener);ctx=listener.context;listener.setMasterVolume(muted?0:volume);
    // Master chain: listener → duck → (dry + reverb) → speakers. Ducking empties the world before a voice speaks.
    bus.duck=ctx.createGain();listener.gain.disconnect();listener.gain.connect(bus.duck);bus.duck.connect(ctx.destination);
    bus.reverb=ctx.createConvolver();bus.reverb.buffer=impulse(3.2,2.6);bus.wet=ctx.createGain();bus.wet.gain.value=.04;bus.duck.connect(bus.reverb);bus.reverb.connect(bus.wet);bus.wet.connect(ctx.destination);
    bus.filter=ctx.createBiquadFilter();bus.filter.type='lowpass';bus.filter.frequency.value=18000;bus.filter.connect(listener.getInput());
    ambient=ctx.createGain();ambient.gain.value=.7;ambient.connect(bus.filter);
    bus.sting=ctx.createDynamicsCompressor();bus.sting.threshold.value=-10;bus.sting.ratio.value=4;bus.stingGain=ctx.createGain();bus.stingGain.gain.value=1.4;bus.sting.connect(bus.stingGain);bus.stingGain.connect(listener.getInput());
    bus.sfx=ctx.createGain();bus.sfx.gain.value=.9;bus.sfx.connect(listener.getInput());
    const wind=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),data=wind.getChannelData(0);let prev=0;for(let i=0;i<data.length;i++){prev=(prev+(.5-Math.random())*.025)/1.025;data[i]=prev;}const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),windGain=ctx.createGain();src.buffer=wind;src.loop=true;filter.type='lowpass';filter.frequency.value=500;windGain.gain.value=.45;src.connect(filter);filter.connect(windGain);windGain.connect(ambient);src.start();
    // Altitude wind and the fluorescent hum of rooms that were never opened.
    const hw=ctx.createBufferSource(),hwf=ctx.createBiquadFilter();hw.buffer=wind;hw.loop=true;hw.playbackRate.value=2.3;hwf.type='bandpass';hwf.frequency.value=700;hwf.Q.value=.6;bus.highWind=ctx.createGain();bus.highWind.gain.value=0;hw.connect(hwf);hwf.connect(bus.highWind);bus.highWind.connect(listener.getInput());hw.start();
    bus.hum=ctx.createGain();bus.hum.gain.value=0;bus.hum.connect(listener.getInput());for(const [f,g] of [[60,.05],[120,.035],[180,.012],[1020,.003]]){const o=ctx.createOscillator(),a=ctx.createGain();o.frequency.value=f;a.gain.value=g;o.connect(a);a.connect(bus.hum);o.start();}
    melodyClock=ctx.currentTime+.3;birdClock=ctx.currentTime+4;audioReady=true;}await ctx.resume();updateSound();Village.startMusic();}
function updateSound(){if(listener)listener.setMasterVolume(muted?0:volume);const on=audioReady&&!muted&&volume>0;$('sound').querySelector('use').setAttribute('href',on?'#i-sound':'#i-mute');$('sound').setAttribute('aria-pressed',String(on));$('sound').setAttribute('aria-label',on?'사운드 끄기':'사운드 켜기');$('sound').title=on?'사운드 끄기':'사운드 켜기';if(!on)voiceCancel();}
const adNotes=[523.25,659.25,783.99,987.77,880,783.99,659.25,587.33,493.88,587.33,739.99,880,783.99,659.25,587.33,523.25];
function scheduleAudio(){if(!ctx||ctx.state!=='running'||paused)return;if(Village.musicReady)return;if(melodyClock<ctx.currentTime-.5)melodyClock=ctx.currentTime+.05;while(melodyClock<ctx.currentTime+.2){let f=adNotes[noteIndex%adNotes.length];note(f,melodyClock,2.4,.018,'sine');note(f/2,melodyClock,3,.009,'triangle');if(noteIndex%4===0){[1,1.25,1.5].forEach(r=>note(f/4*r,melodyClock,4.2,.012,'sine'));}noteIndex++;melodyClock+=.82;}if(ctx.currentTime>birdClock&&atmos.birds>.5){birdClock=ctx.currentTime+8+Math.random()*12;for(let i=0;i<3;i++){let o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime+i*.14;o.frequency.setValueAtTime(1750+i*90,t);o.frequency.exponentialRampToValueAtTime(2700,t+.08);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+.015);g.gain.linearRampToValueAtTime(0,t+.11);o.connect(g);g.connect(ambient);o.start(t);o.stop(t+.12);o.onended=()=>{o.disconnect();g.disconnect();};}}}
function chime(){if(!ctx)return;[659.25,783.99,1046.5].forEach((f,i)=>note(f,ctx.currentTime+i*.1,1.1,.06,'sine'));}
const abnormalBuffers=new Map();
function abnormalBuffer(variant){if(abnormalBuffers.has(variant))return abnormalBuffers.get(variant);let rate=22050,buf=ctx.createBuffer(1,rate*8,rate),a=buf.getChannelData(0);for(let i=0;i<a.length;i++){let t=i/rate,n=Math.floor(t*2)%16,f=adNotes[(n+variant*3)%16]*(variant===1?.714:.5),phase=t*f*TAU+Math.sin(t*3)*.8,env=Math.exp(-(t*2%1)*3);a[i]=Math.sin(phase)*env*.16+Math.sin(phase*1.013)*.08+Math.sin(t*TAU*60)*.022+(Math.random()-.5)*.028;}abnormalBuffers.set(variant,buf);return buf;}
// Room acoustics follow the player: echo in the pool, hum in the garage, wind at 142F.
function setAudioZone(a,altitude){if(!audioReady)return;const t=ctx.currentTime;bus.wet.gain.setTargetAtTime(a.wet,t,.4);bus.hum.gain.setTargetAtTime(a.hum,t,.5);ambient.gain.setTargetAtTime(a.ambient,t,.6);bus.filter.frequency.setTargetAtTime(a.lowpass,t,.5);bus.highWind.gain.setTargetAtTime(clamp((altitude-25)/170,0,1)*.55,t,.6);}
function duck(seconds=1.6,depth=.03){if(!audioReady)return;const t=ctx.currentTime,g=bus.duck.gain;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(depth,t+.06);g.setValueAtTime(depth,t+seconds);g.linearRampToValueAtTime(1,t+seconds+1.2);}

// ─── Buffer synthesis for the memories ───────────────────────────────────────
function makeBuffer(seconds,fn,rate=22050){const buf=ctx.createBuffer(1,Math.floor(rate*seconds),rate),a=buf.getChannelData(0);fn(a,rate);let peak=0;for(const v of a)peak=Math.max(peak,Math.abs(v));if(peak>0)for(let i=0;i<a.length;i++)a[i]=a[i]/peak*.82;return buf;}
function echoInto(a,rate,delay,fb){const d=Math.floor(delay*rate);for(let i=d;i<a.length;i++)a[i]+=a[i-d]*fb;}
function biquadBP(a,rate,f,q){const w=TAU*f/rate,al=Math.sin(w)/(2*q),b0=al,b2=-al,a0=1+al,a1=-2*Math.cos(w),a2=1-al;let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<a.length;i++){const x=a[i],y=(b0*x+b2*x2-a1*y1-a2*y2)/a0;x2=x1;x1=x;y2=y1;y1=y;a[i]=y;}}
const RECIPES={
  reversedCM(a,r){for(let i=0;i<a.length;i++){const t=i/r,n=Math.floor(t),f=adNotes[n%8]*.5,lt=t-n,env=Math.exp(-lt*2.4);a[i]=Math.sin(TAU*f*t)*env*.5+Math.sin(TAU*f*.5*t)*env*.3+Math.sin(TAU*f*1.5*t+Math.sin(t*3.5)*.8)*env*.12;}a.reverse();echoInto(a,r,.37,.45);},
  intercom(a,r){for(let i=0;i<a.length;i++){const t=i/r,c=t%2,f=c<.45?1318.5:c<1.15?1046.5:0;if(!f){a[i]=0;continue;}const lt=c<.45?c:c-.45,env=Math.exp(-lt*2.2)*(1-Math.exp(-lt*80)),trem=1-.4*(.5+.5*Math.sin(TAU*12*t));let s=0;for(const k of [1,3,5])s+=Math.sin(TAU*f*k*t)/k;a[i]=Math.tanh(s*env*trem*3)*.6;}},
  modem(a,r){const dig=[[697,1209],[770,1336],[852,1477],[941,1336],[697,1336],[770,1209],[852,1209],[941,1477]];for(let i=0;i<a.length;i++){const t=i/r;let s=0;
      if(t<.6)s=Math.sin(TAU*350*t)+Math.sin(TAU*440*t);
      else if(t<1.6){const k=Math.floor((t-.6)/.125),lt=(t-.6)%.125;if(lt<.09){const [f1,f2]=dig[k%8];s=Math.sin(TAU*f1*t)+Math.sin(TAU*f2*t);}}
      else if(t<2.6)s=Math.sin(TAU*2100*t+(Math.floor((t-1.6)/.45)%2)*Math.PI)*1.2;
      else if(t<3.6)s=Math.sin(TAU*(Math.floor(t*30)%2?1650:1850)*t);
      else if(t<6.4)s=(Math.random()*2-1)*.8+Math.sin(TAU*(900+600*Math.sin(t*7))*t)*.4;
      a[i]=s*.4;}
    const sigh=new Float32Array(Math.floor(1.6*r));for(let i=0;i<sigh.length;i++){const t=i/r;sigh[i]=(Math.random()*2-1)*Math.min(1,t/.35)*Math.exp(-Math.max(0,t-.35)*2.2);}biquadBP(sigh,r,620,1.4);const off=Math.floor(6.4*r);for(let i=0;i<sigh.length&&off+i<a.length;i++)a[off+i]+=sigh[i]*6;},
  elevatorHum(a,r){for(let i=0;i<a.length;i++){const t=i/r,c=t%6.5;let s=Math.sin(TAU*50*t)*.3+Math.sin(TAU*100*t)*.15+Math.sin(TAU*(600+40*Math.sin(t*.7))*t)*.04;if(c<1.6){const f=c<.5?1318.5:1046.5,lt=c<.5?c:c-.5;s+=Math.sin(TAU*f*t)*Math.exp(-lt*2.6)*.7;}a[i]=s;}},
  laughter(a,r){const groups=[[.25,5,360],[1.9,4,420],[3.5,6,330],[5.6,5,470]];for(const [start,count,f0] of groups)for(let k=0;k<count;k++){const st=start+k*.19,f=f0*(1-k*.04)*(1+(Math.random()-.5)*.06);for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+.17)*r));i++){const lt=i/r-st,env=Math.min(1,lt/.015)*Math.exp(-lt*14);let s=0;for(let h=1;h<=10;h++){const hf=h*f,amp=Math.exp(-(((hf-820)/260)**2))+.6*Math.exp(-(((hf-1240)/320)**2))+.08;s+=Math.sin(TAU*hf*(i/r))*amp;}a[i]+=s*env*.35;}}
    for(let c=0;c<3;c++){const st=1+c*2.6;for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+.7)*r));i++){const lt=i/r-st,f=40+40*lt;a[i]+=Math.sin(TAU*(420+160*lt)*(i/r))*(Math.sin(TAU*f*lt)>.6?1:0)*Math.exp(-lt*3)*.5;}}
    let hold=0;for(let i=0;i<a.length;i++){if(i%4===0)hold=Math.round(a[i]*7)/7;a[i]=hold;}},
  chimeDetuned(a,r){const seq=[1046.5,880,698.46,523.25];for(let rep=0;rep<3;rep++)seq.forEach((f0,n)=>{const st=rep*2.7+n*.55,f=f0*(1-rep*.045-(n===2?rep*.03:0));for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+1.8)*r));i++){const lt=i/r-st;a[i]+=(Math.sin(TAU*f*lt)*Math.exp(-lt*3)+.35*Math.sin(TAU*f*3.93*lt)*Math.exp(-lt*9)+.15*Math.sin(TAU*f*9*lt)*Math.exp(-lt*16))*.5;}});},
  fountainStatic(a,r){for(let i=0;i<a.length;i++){const t=i/r,mix=clamp((t-2)/5,0,1);a[i]=(Math.random()*2-1)*(.08*(1-mix)+.5*mix)+Math.sin(TAU*60*t)*.08*mix;}for(let b=0;b<160;b++){const st=Math.random()*7*(1-b/400),f0=400+Math.random()*1200,len=.02+Math.random()*.03;for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+len)*r));i++){const lt=i/r-st;a[i]+=Math.sin(TAU*f0*lt*(1+lt*20))*Math.exp(-lt*60)*.5*(1-st/7);}}},
  furElise(a,r){const E5=659.25,Ds5=622.25,B4=493.88,D5=587.33,C5=523.25,A4=440,C4=261.63,E4=329.63,Gs4=415.3,_=0;const seq=[E5,Ds5,E5,Ds5,E5,B4,D5,C5,A4,_,C4,E4,A4,B4,_,E4,Gs4,B4,C5,_];const step=.36;seq.forEach((f0,n)=>{if(!f0)return;const st=n*step,f=f0*.94*(1-n*.002);for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+step*.9)*r));i++){const lt=i/r-st;a[i]+=(Math.sin(TAU*f*lt)>0?.5:-.5)*Math.min(1,lt*60)*Math.exp(-lt*3);}});echoInto(a,r,.28,.4);},
  cicadaMetal(a,r){const noise=new Float32Array(a.length);for(let i=0;i<a.length;i++)noise[i]=Math.random()*2-1;biquadBP(noise,r,5200,3);for(let i=0;i<a.length;i++){const t=i/r,mix=clamp((t-3.5)/3,0,1),pulse=Math.sin(TAU*30*t)>0?1:.15,swell=.6+.4*Math.sin(t*1.3);const metal=Math.sin(TAU*980*t+(2+6*mix)*Math.sin(TAU*1386*t))*(.6+.4*Math.sin(TAU*7*t));a[i]=noise[i]*pulse*swell*3*(1-mix)+metal*mix*.7;}},
  narratorGlitch(a,r){const frag=[];for(let i=0;i<Math.floor(.12*r);i++){const t=i/r;frag.push((Math.sin(TAU*261.6*t)+Math.sin(TAU*329.6*t)+Math.sin(TAU*392*t))*.25);}for(let i=0;i<a.length;i++){const t=i/r,cyc=t%2.5;const fi=Math.floor((cyc-1.5)*r)%frag.length;a[i]=cyc<1.5?Math.sin(TAU*(130.8+Math.sin(t)*2)*t)*.15+Math.sin(TAU*196*t)*.1:frag[fi]*1.2+(fi<30?(Math.random()*2-1)*.8:0);}},
  pianoEtude(a,r){const scale=[523.25,587.33,659.25,698.46,783.99,880,987.77,1046.5];const step=.11;for(let n=0;n*step<a.length/r-.2;n++){const bar=Math.floor(n/16),pos=n%16,stuck=bar%2===1&&pos>9;const idx=stuck?4:pos<8?pos:15-pos;const f=scale[idx]*(1-bar*.012),st=n*step;for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+.5)*r));i++){const lt=i/r-st;a[i]+=(Math.sin(TAU*f*lt)+.3*Math.sin(TAU*f*2*lt))*Math.exp(-lt*6)*.35;}}},
  hum60(a,r){for(let i=0;i<a.length;i++){const t=i/r;a[i]=Math.sin(TAU*60*t)*.5+Math.sin(TAU*120*t)*.3+Math.sin(TAU*180*t)*.15+(Math.random()*2-1)*.04+(Math.sin(TAU*.7*t)>.96?(Math.random()*2-1)*.5:0);}},
  drips(a,r){for(let d=0;d<14;d++){const st=Math.random()*7.6,f=900+Math.random()*900;for(let i=Math.floor(st*r);i<Math.min(a.length,Math.floor((st+.25)*r));i++){const lt=i/r-st;a[i]+=Math.sin(TAU*f*lt*(1+lt*6))*Math.exp(-lt*22);}}echoInto(a,r,.21,.55);},
};
const recipeCache=new Map();
function eggBuffer(name){if(!ctx)return null;if(name==='classic0'||name==='classic1')return abnormalBuffer(name==='classic1'?1:0);if(!RECIPES[name])return null;if(!recipeCache.has(name))recipeCache.set(name,makeBuffer(name==='fountainStatic'?9:8,RECIPES[name]));return recipeCache.get(name);}
function positional(parent,buffer,{ref=3,max=45,rolloff=1.3,vol=.65,loop=true,rate=1}={}){if(!audioReady||!buffer)return null;const audio=new THREE.PositionalAudio(listener);audio.setBuffer(buffer);audio.setRefDistance(ref);audio.setMaxDistance(max);audio.setRolloffFactor(rolloff);audio.setLoop(loop);audio.setVolume(vol);audio.setPlaybackRate(rate);parent.add(audio);audio.play();return audio;}
function stopPositional(audio){if(!audio)return;if(audio.isPlaying)audio.stop();audio.disconnect();audio.parent?.remove(audio);}

// ─── One-shot effects ────────────────────────────────────────────────────────
function noiseBurst(at,dur,{type='bandpass',f=800,f2=null,q=1,gain=.3,dest=bus.sfx}={}){const len=Math.floor(ctx.sampleRate*dur),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=b;fl.type=type;fl.frequency.setValueAtTime(f,at);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,at+dur);fl.Q.value=q;g.gain.setValueAtTime(gain,at);g.gain.exponentialRampToValueAtTime(.0001,at+dur);s.connect(fl);fl.connect(g);g.connect(dest);s.start(at);s.onended=()=>{s.disconnect();fl.disconnect();g.disconnect();};}
function tone(at,f,dur,{type='sine',gain=.2,f2=null,dest=bus.sfx}={}){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,at+dur);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(gain,at+.01);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g);g.connect(dest);o.start(at);o.stop(at+dur+.05);o.onended=()=>{o.disconnect();g.disconnect();};}
function sfx(name){if(!audioReady||ctx.state!=='running')return;const t=ctx.currentTime,S=bus.sting;
  switch(name){
    case 'ding':tone(t,1318.5,.9,{gain:.16});tone(t+.45,1046.5,1.3,{gain:.16});break;
    case 'thud':tone(t,90,.4,{gain:.5,f2:40});noiseBurst(t,.18,{type:'lowpass',f:400,gain:.4});break;
    case 'shatter':noiseBurst(t,.5,{type:'highpass',f:2500,gain:.35});for(let i=0;i<9;i++)tone(t+Math.random()*.35,1800+Math.random()*2400,.06,{gain:.12,type:'square'});tone(t,70,.5,{gain:.45,f2:35});break;
    case 'rewind':noiseBurst(t,.9,{f:300,f2:5000,q:3,gain:.25});tone(t,200,.9,{type:'sawtooth',gain:.05,f2:1600});break;
    case 'flap':noiseBurst(t,.22,{f:380,q:.8,gain:.3});break;
    case 'wings':noiseBurst(t,.8,{f:600,f2:200,q:.7,gain:.25});for(let i=0;i<14;i++)tone(t+i*.03,2400+Math.random()*900,.02,{gain:.06,type:'square'});tone(t+.2,523.25,1.4,{gain:.05});tone(t+.2,659.25,1.4,{gain:.04});break;
    case 'whoosh':noiseBurst(t,.6,{f:2200,f2:300,q:1.2,gain:.28});break;
    case 'skip':tone(t,1200,.03,{type:'square',gain:.25});noiseBurst(t+.03,.08,{type:'highpass',f:3000,gain:.3});break;
    case 'bios':tone(t,880,.55,{type:'square',gain:.5,dest:S});tone(t+.62,880,.25,{type:'square',gain:.5,dest:S});break;
    case 'screech':{const o=ctx.createOscillator(),m=ctx.createOscillator(),mg=ctx.createGain(),g=ctx.createGain();o.frequency.value=1320;m.frequency.value=1867;mg.gain.setValueAtTime(3000,t);mg.gain.exponentialRampToValueAtTime(40,t+1.4);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+1.4);m.connect(mg);mg.connect(o.frequency);o.connect(g);g.connect(S);o.start(t);m.start(t);o.stop(t+1.5);m.stop(t+1.5);o.onended=()=>{o.disconnect();m.disconnect();mg.disconnect();g.disconnect();};break;}
    case 'popup':tone(t,523.25,.25,{gain:.18});tone(t+.09,783.99,.35,{gain:.15});break;
    case 'close':tone(t,1600,.04,{type:'square',gain:.08});break;
    case 'knock':for(let i=0;i<3;i++){tone(t+i*.22,110,.16,{gain:.5,f2:70});noiseBurst(t+i*.22,.06,{type:'lowpass',f:900,gain:.3});}break;
    case 'ring':for(let i=0;i<6;i++){tone(t+i*.12,1318.5,.1,{type:'square',gain:.07});tone(t+i*.12+.06,1046.5,.1,{type:'square',gain:.07});}break;
    case 'alarm':for(let i=0;i<4;i++)tone(t+i*.5,600,.48,{type:'sawtooth',gain:.12,f2:1300});break;
    case 'splash':noiseBurst(t,.5,{type:'lowpass',f:1800,gain:.4});for(let i=0;i<6;i++)tone(t+Math.random()*.3,700+Math.random()*900,.08,{gain:.08,f2:1600});break;
    case 'coin':tone(t,2093,.4,{gain:.12});tone(t+.08,2637,.6,{gain:.1});break;
    case 'grow':tone(t,220,1.2,{gain:.08,f2:660});noiseBurst(t,1,{f:1200,q:.5,gain:.06});break;
    case 'tick':tone(t,2600,.03,{type:'square',gain:.1});break;
    case 'glitch':for(let i=0;i<8;i++)tone(t+i*.025,200+Math.random()*3000,.025,{type:'square',gain:.14});break;
    case 'error':tone(t,110,.35,{type:'sawtooth',gain:.18});break;
    case 'step':noiseBurst(t,.07,{type:'lowpass',f:500,gain:.35});break;
    case 'rise':tone(t,55,2.2,{type:'sawtooth',gain:.1,f2:110});noiseBurst(t,2,{type:'lowpass',f:200,f2:800,gain:.2});break;
    case 'fall':noiseBurst(t,1.6,{f:1800,f2:200,q:.6,gain:.3});break;
  }}

