// ─── What each memory does when it wakes ─────────────────────────────────────
// Every effect owns what it creates; dispose() returns the world exactly as it was.
let timeFrozen=false;
const flags={beacon:false,infinity:false};
function makeFx(egg){let effectSeed=Math.floor(hashStr(egg.key)*4294967295)>>>0;const fx={egg,t:0,anchor:new THREE.Vector3(egg.group.position.x,egg.group.position.y-1.2,egg.group.position.z+3),random:()=>{effectSeed=(Math.imul(effectSeed,1664525)+1013904223)>>>0;return effectSeed/4294967296;},objs:[],disposables:[],audios:[],solids:[],timers:[],cleanup:[],sky:null,audioZone:null,updates:[]};
  fx.add=(o,parent=scene)=>{parent.add(o);fx.objs.push(o);return o;};
  fx.track=(...items)=>{fx.disposables.push(...items);return items[0];};
  fx.sound=a=>{if(a)fx.audios.push(a);return a;};
  fx.solid=s=>{fx.solids.push(s);return s;};
  fx.at=(sec,fn)=>fx.timers.push({t:sec,fn});
  fx.every=fn=>fx.updates.push(fn);
  fx.dispose=()=>{for(const a of fx.audios)stopPositional(a);for(const s of fx.solids)removeSolid(s);for(const o of fx.objs)o.parent?.remove(o);for(const d of fx.disposables)d?.dispose?.();for(const f of fx.cleanup)try{f();}catch(e){console.error('[APT200X] cleanup',e);}fx.objs.length=0;fx.updates.length=0;fx.timers.length=0;};
  fx.tick=dt=>{fx.t+=dt;for(let i=fx.timers.length-1;i>=0;i--)if(fx.t>=fx.timers[i].t){const f=fx.timers[i].fn;fx.timers.splice(i,1);f();}for(const f of fx.updates)f(dt);};
  return fx;}
function terrainPatch(fx,cx,cz,size,segs,mat,lift=.08,baseY=null){const geo=fx.track(new THREE.PlaneGeometry(size,size,segs,segs));geo.rotateX(-Math.PI/2);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=cx+p.getX(i),z=cz+p.getZ(i);p.setY(i,(baseY??terrainY(x,z))+lift);}geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.position.set(cx,0,cz);return fx.add(m);}
function eggBase(egg){return egg.group.position.y-1.2;}
// Devices glitch into existence instead of fading in.
function materialize(fx,model,x,y,z){model.position.set(x,y,z);fx.add(model);model.scale.set(1,.01,1);let k=0;fx.every(dt=>{if(k>=1)return;k=Math.min(1,k+dt*1.6);model.scale.set(1+(fx.random()-.5)*.3*(1-k),Math.max(.01,ease(k)),1+(fx.random()-.5)*.3*(1-k));});model.traverse(o=>{if(o.isMesh)o.userData.egg=fx.egg;});return model;}
function runBeats(fx,extra){for(const b of extra.beats||[]){fx.at(b.at,()=>{if(fx.egg.done)return;if(b.cut){for(const a of fx.audios)a.setVolume(0);later(b.cut,()=>{for(const a of fx.audios)a.setVolume(.7);});}if(b.voice)hallucinate({text:b.voice,preset:b.preset||'deep'},{force:true});if(b.sting)sfx(b.sting);if(b.hud)hudGlitch(b.hud,3.5);});}}
function setSky(fx,o){fx.sky={...o,since:worldTime};}
const checkerTex=(()=>{const t=texCanvas(16,16,(g)=>{for(let x=0;x<2;x++)for(let y=0;y<2;y++){g.fillStyle=(x+y)%2?'#000000':'#ff00ff';g.fillRect(x*8,y*8,8,8);}});t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const checkerOf=(rx,ry)=>{const t=checkerTex.clone();t.repeat.set(rx,ry);t.needsUpdate=true;return t;};
const checkerBig=checkerOf(220,220),checkerSmall=checkerOf(3,3),checkerSky=checkerOf(24,12);

const SPATIAL={
  // The meadow becomes an office floor; the ceiling lowers with every touch.
  GROUND_SWAP_OFFICE_CARPET(fx,x,z,base){const carpet=fx.track(texCanvas(64,64,(g)=>{g.fillStyle='#4f5d72';g.fillRect(0,0,64,64);for(let i=0;i<900;i++){g.fillStyle=fx.random()>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.12)';g.fillRect(fx.random()*64,fx.random()*64,1,1);}g.strokeStyle='rgba(20,28,40,.5)';g.strokeRect(0,0,64,64);}));carpet.wrapS=carpet.wrapT=THREE.RepeatWrapping;carpet.repeat.set(11,11);carpet.magFilter=THREE.NearestFilter;
    terrainPatch(fx,x,z,44,18,fx.track(phong(0xffffff,{map:carpet,shininess:8,specular:0x111111})),.07,base);
    const tiles=fx.track(texCanvas(128,128,(g)=>{g.fillStyle='#e9ebe4';g.fillRect(0,0,128,128);g.strokeStyle='#b4b8b0';g.lineWidth=2;for(let n=0;n<=4;n++){g.beginPath();g.moveTo(n*32,0);g.lineTo(n*32,128);g.moveTo(0,n*32);g.lineTo(128,n*32);g.stroke();}}));tiles.wrapS=tiles.wrapT=THREE.RepeatWrapping;tiles.repeat.set(11,11);
    const glow=fx.track(texCanvas(128,128,(g)=>{g.fillStyle='#000';g.fillRect(0,0,128,128);g.fillStyle='#fff';g.fillRect(36,4,56,24);}));glow.wrapS=glow.wrapT=THREE.RepeatWrapping;glow.repeat.set(11,11);
    const ceilMat=fx.track(phong(0xffffff,{map:tiles,emissive:0xfffff4,emissiveMap:glow,side:THREE.DoubleSide}));const ceiling=fx.add(new THREE.Mesh(fx.track(new THREE.PlaneGeometry(44,44)),ceilMat));ceiling.rotation.x=Math.PI/2;ceiling.position.set(x,(base??terrainY(x,z))+5.4,z);
    fx.sound(positional(ceiling,eggBuffer('hum60'),{vol:.55,ref:6}));setSky(fx,{emissive:0xc9d3d6,fog:{color:0xcfd5d2,near:18,far:90}});
    let target=5.4;fx.every(()=>{ceiling.position.y+=((base??terrainY(x,z))+target-ceiling.position.y)*.06;ceilMat.emissiveIntensity=fx.random()<.04?.2:1;const p=player.position;camCeiling=Math.abs(p.x-x)<22&&Math.abs(p.z-z)<22&&p.y<ceiling.position.y?ceiling.position.y:null;});fx.cleanup.push(()=>{camCeiling=null;});
    fx.click=()=>{target-=.75;sfx('thud');shake(.4,.4);};},
  // The sky crashes.
  SKY_BSOD_BLUE(fx){const c=document.createElement('canvas');c.width=1024;c.height=512;const tex=fx.track(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;
    const draw=left=>{const g=c.getContext('2d');g.fillStyle='#0000aa';g.fillRect(0,0,1024,512);g.fillStyle='#aaaaaa';g.fillRect(430,150,164,22);g.fillStyle='#0000aa';g.font='bold 18px monospace';g.fillText(' 푸른마을 ',452,167);g.fillStyle='#ffffff';g.font='16px monospace';['치명적 예외 0E가 0028:C0011E36 지점의 SKY.VXD에서 발생했습니다.','하늘이 종료됩니다.','','* 아무 기억이나 눌러 계속하십시오.',`* 남은 입력: ${left}`,'','              계속하려면 아무 곳이나 누르십시오 _'].forEach((t,i)=>g.fillText(t,250,212+i*24));tex.needsUpdate=true;};
    draw(fx.egg.required);setSky(fx,{map:tex,emissive:0xffffff,fog:{color:0x0000aa,near:22,far:150},clear:0x0000aa,snap:true});document.body.classList.add('bsod');fx.cleanup.push(()=>document.body.classList.remove('bsod'));
    fx.click=n=>{sfx('bios');draw(fx.egg.required-n);flash('white');};},
  // Nearby apartments turn upside down and bury their roofs.
  INVERT_NEARBY_APARTMENTS(fx,x,z){
    setSky(fx,{color:0x28233c,emissive:0xc1b7ef,fog:{color:0xc6bcd8,near:70,far:320}});
    const veil=fx.add(new THREE.Mesh(fx.track(new THREE.CylinderGeometry(10,10,65,16,1,true)),fx.track(phong(0xe7efff,{wireframe:true,transparent:true,opacity:.25,emissive:0x7c7caf,depthWrite:false}))));veil.position.set(x,terrainY(x,z)+32,z);
    fx.every(()=>{veil.material.opacity=.13+Math.sin(fx.t*2)*.06;});fx.click=()=>sfx('glitch');},

  // The grass is replaced by a forest of concrete piles that are very much solid.
  GRASS_TO_CONCRETE_PILLARS(fx,x,z,base){const R=22,hidden=[],m4=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0),v=new THREE.Vector3();
    for(let i=0;i<grassCount;i++){grass.getMatrixAt(i,m4);v.setFromMatrixPosition(m4);if(Math.hypot(v.x-x,v.z-z)<R){hidden.push([i,m4.clone()]);grass.setMatrixAt(i,zero);}}grass.instanceMatrix.needsUpdate=true;
    fx.cleanup.push(()=>{for(const [i,m] of hidden)grass.setMatrixAt(i,m);grass.instanceMatrix.needsUpdate=true;});
    const n=95,inst=fx.add(new THREE.InstancedMesh(unitBox,concrete,n)),o=new THREE.Object3D(),items=[],p=fx.anchor;
    for(let i=0;i<n;i++){let px,pz,tries=0;do{const a=fx.random()*TAU,d=3+Math.sqrt(fx.random())*(R-3);px=x+Math.cos(a)*d;pz=z+Math.sin(a)*d;tries++;}while(Math.hypot(px-p.x,pz-p.z)<2.6&&tries<20);items.push({px,pz,h:2.5+fx.random()*6.5,y0:base??terrainY(px,pz),k:-fx.random()*.8,solid:null});}
    sfx('rise');shake(.5,1.2);let target=1;
    fx.every(dt=>{for(let i=0;i<n;i++){const it=items[i];it.k=clamp(it.k+dt*1.3*(target>it.k?1:-1),-1,1);const hh=it.h*clamp(ease(clamp(it.k,0,1)),0,1);o.position.set(it.px,it.y0-it.h/2+hh,it.pz);o.scale.set(.9,it.h,.9);o.updateMatrix();inst.setMatrixAt(i,o.matrix);
        if(hh>it.h*.5&&!it.solid&&Math.hypot(it.px-p.x,it.pz-p.z)>1)it.solid=fx.solid(addSolid(it.px-.45,it.px+.45,it.y0-1,it.y0+hh,it.pz-.45,it.pz+.45,'pile'));if(it.solid)it.solid.maxY=it.y0+hh;}inst.instanceMatrix.needsUpdate=true;});
    setSky(fx,{emissive:0xe6eeee,fog:{color:0xd6dad8,near:40,far:220}});fx.click=()=>{target=.45;sfx('thud');};},
  // The unopened pool leaks into the meadow.
  POOL_TILE_DIMENSION(fx,x,z,base){const tile=fx.track(poolTileTex().clone());tile.repeat.set(12,12);tile.needsUpdate=true;const y0=base??terrainY(x,z);
    terrainPatch(fx,x,z,32,14,fx.track(phong(0xffffff,{map:tile,shininess:140})),.07,base);
    const wallMat=phong(0xffffff,{map:poolTileTex(),shininess:140}),walls=[];for(let i=0;i<8;i++){const a=i/8*TAU+.2,cx=x+Math.cos(a)*15,cz=z+Math.sin(a)*15,w=fx.add(new THREE.Mesh(unitBox,wallMat));w.scale.set(7,4.6,.6);w.rotation.y=-a+Math.PI/2;w.position.set(cx,y0-2.3,cz);const hw=Math.abs(Math.cos(a))*.3+Math.abs(Math.sin(a))*3.5,hd=Math.abs(Math.sin(a))*.3+Math.abs(Math.cos(a))*3.5;walls.push({w,s:fx.solid(addSolid(cx-hw,cx+hw,y0-5,y0-5,cz-hd,cz+hd,'poolwall'))});}
    const water=fx.add(new THREE.Mesh(fx.track(new THREE.CircleGeometry(15,40)),fx.track(phong(0xffffff,{map:POOL.caustic,transparent:true,opacity:.55,emissive:0x0d3d44,depthWrite:false}))));water.rotation.x=-Math.PI/2;water.position.set(x,y0+.1,z);
    fx.sound(positional(water,eggBuffer('drips'),{vol:.6,ref:5}));fx.audioZone={wet:.62};setSky(fx,{emissive:0xf2ffff,fog:{color:0xe6f6f6,near:30,far:140}});
    let level=1;fx.every(dt=>{const r=Math.min(1,fx.t/1.4);for(const {w,s} of walls){w.position.y=y0-2.3+4.6*ease(r);s.maxY=y0+4.6*ease(r);}water.position.y+=(y0+.1+level*Math.min(1,fx.t/6)*.95-water.position.y)*dt;});
    fx.click=n=>{level=1-n/fx.egg.required;sfx('splash');};},
  // The world is a viewport again. Underground floors show through the meadow.
  WIREFRAME_WORLD(fx){const wire=fx.track(new THREE.MeshBasicMaterial({color:0x22ff77,wireframe:true}));scene.overrideMaterial=wire;forceUnder=true;$('viewport').classList.add('on');setSky(fx,{fog:{color:0x000000,near:30,far:260},clear:0x000000,snap:true});
    fx.click=n=>{if(n===1){wire.color.set(0xd8d8d8);$('viewport').textContent='Perspective · Wireframe (Edged Faces)';}else{scene.overrideMaterial=fx.track(new THREE.MeshLambertMaterial({color:0xb8b8b4}));$('viewport').textContent='Perspective · Smooth (Default Lights)';}sfx('close');};
    fx.cleanup.push(()=>{scene.overrideMaterial=null;forceUnder=false;$('viewport').classList.remove('on');$('viewport').textContent='Perspective · 3DS MAX R4 · Wireframe';});},
  // A mannequin the size of the sky floats over the horizon and copies everything you do.
  GIANT_DUMMY_SHADOW(fx){const giant=createMannequin(),S=46;giant.root.scale.setScalar(S);const dir=new THREE.Vector3(0,0,-1);const gx=fx.anchor.x+dir.x*200,gz=fx.anchor.z+dir.z*200;giant.root.position.set(gx,terrainY(gx,gz)-S*2.8,gz);fx.add(giant.root);
    const shade=fx.add(new THREE.Mesh(fx.track(new THREE.CircleGeometry(1,40)),fx.track(new THREE.MeshBasicMaterial({color:0x14241a,transparent:true,opacity:0,depthWrite:false}))));shade.rotation.x=-Math.PI/2;shade.scale.set(34,22,1);
    setSky(fx,{emissive:0xfff6cf,fog:{color:0xe8e7c8,near:200,far:900},sun:{color:0xfff0c0,intensity:.95}});let sink=0;sfx('rise');
    fx.every(dt=>{const r=giant.root,p=fx.anchor,tY=terrainY(gx,gz)+38-sink;r.position.y+=(tY-r.position.y)*Math.min(1,dt*.6);giant.heading.rotation.y=Math.atan2(p.x-r.position.x,p.z-r.position.z);giant.neck.rotation.x=.55;
      poseMannequin(giant,{speed:.08,phase:fx.t*.7,t:fx.t,wave:fx.t>5},dt);giant.body.rotation.x=.35;
      shade.position.set(p.x+Math.sin(fx.t*.13)*14,surfaceHeight(p.x,p.z,p.y+.1)+.12,p.z+8);shade.material.opacity=Math.min(.35,fx.t*.08);});
    fx.click=()=>{sink+=S*1.1;sfx('thud');shake(.8,.6);};},
  // Textures go missing. Then the floor does.
  MISSING_TEXTURE_CHECKER(fx,x,z,base){const saved=[],seen=new Set();scene.traverse(o=>{if(!o.isMesh||!o.material||o===shadow)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(seen.has(m)||!m.isMeshPhongMaterial||m===sky.material)continue;seen.add(m);saved.push({m,map:m.map,color:m.color.getHex()});m.map=o===terrain?checkerBig:checkerSmall;m.color.set(0xffffff);m.needsUpdate=true;}});
    fx.cleanup.push(()=>{for(const s of saved){s.m.map=s.map;s.m.color.setHex(s.color);s.m.needsUpdate=true;}});setSky(fx,{map:checkerSky,emissive:0xffffff,fog:{color:0xd040d0,near:70,far:320}});
    sfx('glitch');let opened=null;
    const openVoid=(vx,vz)=>{if(opened)return;opened={x:vx,z:vz,r:6.5};voids.push(opened);const hole=fx.add(new THREE.Mesh(fx.track(new THREE.CircleGeometry(6.5,32)),fx.track(new THREE.MeshBasicMaterial({color:0x000000,fog:false}))));hole.rotation.x=-Math.PI/2;hole.position.set(vx,terrainY(vx,vz)+.12,vz);sfx('fall');shake(.7,1);fx.cleanup.push(()=>{const i=voids.indexOf(opened);if(i>=0)voids.splice(i,1);});};
    fx.at(5.5,()=>{const p=player.position;openVoid(x,z);});
    fx.every(()=>{const p=player.position;if(opened&&!fx.fell&&p.y<terrainY(p.x,p.z)-5){fx.fell=true;teleport(DISH.x+8,-29.2,DISH.z+10);velocityY=-21;later(.1,()=>hallucinate({text:'바닥 파일을 찾았습니다. 여기 있었네요.',preset:'deep'},{force:true}));later(4.5,()=>{if(!fx.egg.done)restoreEgg(fx.egg,{note:'기억이 지하 초원으로 떨어졌습니다.'});});}});
    fx.click=n=>{if(n===1)openVoid(x,z);};},
  // Fire-escape stairs erupt everywhere; one of them grows under you.
  ENDLESS_STAIRS_RISE(fx,x,z,base){const runs=[],tile=xmat(0xf4f6f4,{shininess:120}),p=fx.anchor,y0=base??terrainY(x,z);
    for(let r=0;r<7;r++){const a=r/7*TAU+.3,cx=x+Math.cos(a)*13,cz=z+Math.sin(a)*13,steps=16,inst=fx.add(new THREE.InstancedMesh(unitBox,tile,steps)),run={inst,steps:[],lift:-9,o:new THREE.Object3D()};
      for(let i=0;i<steps;i++){const lx=cx+Math.cos(a)*i*.9,lz=cz+Math.sin(a)*i*.9;run.steps.push({lx,lz,top:i*.5+.5,s:fx.solid(addSolid(lx-1.2,lx+1.2,y0-10,y0-9,lz-1.2,lz+1.2,'riser'))});}
      runs.push(run);}
    const near=Math.hypot(p.x-x,p.z-z)<14,px=near?p.x:x,pz=near?p.z:z;const lift=fx.add(new THREE.Mesh(unitBox,tile));lift.scale.set(3,30,3);const col={y:y0-.6,s:fx.solid(addSolid(px-1.5,px+1.5,y0-30,y0-.6,pz-1.5,pz+1.5,'pillar'))};
    let speed=1.1;sfx('rise');shake(.6,1.5);
    fx.every(dt=>{const top=Math.min(y0+26,col.y+speed*dt);col.s.dy=top-col.y;col.y=top;col.s.maxY=top;col.s.minY=top-30;lift.position.set(px,top-15,pz);
      for(const run of runs){run.lift=Math.min(20,run.lift+speed*dt*(run.lift<0?4:.5));run.steps.forEach((st,i)=>{const yy=y0+run.lift+st.top;run.o.position.set(st.lx,yy-.25,st.lz);run.o.scale.set(2.4,.5,2.4);run.o.updateMatrix();run.inst.setMatrixAt(i,run.o.matrix);st.s.dy=yy-st.s.maxY;st.s.maxY=yy;st.s.minY=yy-.5;});run.inst.instanceMatrix.needsUpdate=true;}});
    fx.click=()=>{speed=0;sfx('thud');};},
  // Six-twelve in the evening, forever. Everyone else stops moving.
  SUNSET_FREEZE_GLITCH(fx){const c=document.createElement('canvas');c.width=1024;c.height=512;const tex=fx.track(new THREE.CanvasTexture(c));tex.colorSpace=THREE.SRGBColorSpace;let minute=12;
    const draw=()=>{const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#2a1458');gr.addColorStop(.35,'#7a2f7c');gr.addColorStop(.5,'#ff7a3c');gr.addColorStop(.56,'#ffcf7a');gr.addColorStop(1,'#5b2a4a');g.fillStyle=gr;g.fillRect(0,0,1024,512);g.fillStyle='rgba(255,236,190,.95)';g.beginPath();g.arc(512,262,26,0,TAU);g.fill();g.font='bold 54px monospace';g.fillStyle='rgba(255,90,60,.9)';g.fillText(`18:${String(minute).padStart(2,'0')}`,430,170);tex.needsUpdate=true;};draw();
    timeFrozen=true;setSky(fx,{map:tex,emissive:0xffffff,fog:{color:0xff9a5c,near:60,far:320},sun:{color:0xff8040,intensity:1.1},amb:{color:0x9a6aa0,intensity:.75}});shadow.scale.set(1,3.5,1);
    fx.cleanup.push(()=>{timeFrozen=false;shadow.scale.set(1,1,1);sfx('rewind');});
    fx.every(()=>{if(fx.random()<.02)sfx('tick');});fx.click=()=>{minute++;draw();sfx('tick');};},
  // From the growth pool: a neon sky over a dark grid.
  SKY_NEON_GREEN(fx,x,z,base){const grid=fx.track(texCanvas(64,64,(g)=>{g.fillStyle='#0b0f0b';g.fillRect(0,0,64,64);g.strokeStyle='#39ff14';g.lineWidth=2;g.strokeRect(0,0,64,64);}));grid.wrapS=grid.wrapT=THREE.RepeatWrapping;grid.repeat.set(14,14);grid.magFilter=THREE.NearestFilter;terrainPatch(fx,x,z,28,12,fx.track(phong(0xffffff,{map:grid,emissive:0x0a2a0a})),.07,base);setSky(fx,{emissive:0x39ff14,fog:{color:0x173a17,near:40,far:200}});fx.click=()=>sfx('glitch');},
  // The first prototype's drift: a tiled patch, a purple sky, a building that floats away.
  CLASSIC_DRIFT(fx,x,z,base){const tx=fx.track(mutationTexture(fx.egg.variant));tx.wrapS=tx.wrapT=THREE.RepeatWrapping;tx.repeat.set(3,3);tx.magFilter=THREE.NearestFilter;terrainPatch(fx,x,z,11,8,fx.track(phong(0xffffff,{map:tx,side:THREE.DoubleSide})),.1,base);
    const nearest=buildings.reduce((a,b)=>Math.hypot(a.group.position.x-x,a.group.position.z-z)<Math.hypot(b.group.position.x-x,b.group.position.z-z)?a:b);if(Math.hypot(nearest.group.position.x-x,nearest.group.position.z-z)<38){nearest.floaters=(nearest.floaters||0)+1;fx.cleanup.push(()=>{nearest.floaters--;});}
    setSky(fx,{color:0x30233b,emissive:0xcaa2ed,fog:{color:0xd2badc}});fx.click=()=>sfx('glitch');},
};
function mutationTexture(variant){return texCanvas(128,128,(g)=>{if(variant%2){g.fillStyle='#284caa';g.fillRect(0,0,128,128);g.fillStyle='#cdd8f7';g.font='5px monospace';for(let i=0;i<17;i++)g.fillText(['A FUTURE EXCEPTION HAS OCCURRED','PUREUN_VILLAGE.EXE','PRESS ANY MEMORY TO CONTINUE'][i%3],5,12+i*6);}else{for(let x=0;x<8;x++)for(let y=0;y<8;y++){g.fillStyle=(x+y)%2?'#a1a5af':'#e6e2de';g.fillRect(x*16,y*16,16,16);}}});}

// ─── Sound memories ──────────────────────────────────────────────────────────
const TARGET_REACTIONS={
  GlassPhoneBooth2002:(fx,g)=>fx.every(()=>{const k=Math.sin(worldTime*40)*.03*(Math.sin(worldTime*2)>0?1:0);g.userData.parts.booth.rotation.z=k;g.userData.parts.phone.position.y=1.35+Math.abs(k)*2;}),
  FloatingElevatorCore:(fx,g)=>fx.every(()=>{g.userData.parts.cabin.position.y=15+Math.sin(fx.t*.9)*9+(fx.random()<.02?(fx.random()-.5)*3:0);}),
  PlasticPlaygroundSlide:(fx,g)=>fx.every(()=>{g.userData.parts.roof.rotation.y=Math.PI/4+Math.sin(fx.t*7)*.2;}),
  GeometricFountain:(fx,g)=>{const water=g.userData.parts.water,orig=water.map,st=fx.track(texCanvas(64,64,()=>{}));water.map=st;water.needsUpdate=true;fx.cleanup.push(()=>{water.map=orig;water.needsUpdate=true;});const sc=st.image.getContext('2d');fx.every(()=>{if(frame%3)return;const img=sc.createImageData(64,64);for(let i=0;i<img.data.length;i+=4){const v=fx.random()*255;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;}sc.putImageData(img,0,0);st.needsUpdate=true;});},
  LowPolyPineTree:(fx,g)=>fx.every(dt=>{g.userData.parts.tiers.forEach((c,i)=>c.rotation.y+=dt*(2+i*3)*Math.min(1,fx.t*.3));}),
  CyberModelHouseDome:(fx,g)=>fx.every(dt=>{g.userData.parts.halo.rotation.z+=dt*3;g.userData.parts.dome.material.opacity=.38+(fx.random()<.05?.3:0);}),
};
function audioFx(fx,x,y,z){const egg=fx.egg,def=egg.def,extra=egg.extra||{};
  const reacts=egg.target&&TARGET_REACTIONS[def.visualTarget];
  if(reacts)TARGET_REACTIONS[def.visualTarget](fx,egg.target);else{const host=materialize(fx,MODELS.AudioAnomalyOrb(),x,y-1.3,z),pr=host.userData.parts;fx.every(dt=>{pr.core.rotation.y+=dt*2;pr.wave.scale.setScalar(1+Math.sin(fx.t*9)*.08+(fx.random()<.04?.3:0));});}
  const audio=fx.sound(positional(egg.group,eggBuffer(extra.recipe||egg.recipe||'classic0'),{vol:.72}));
  if(extra.loopVoice){const lv=extra.loopVoice;let i=0;const speak=()=>{if(egg.done)return;voiceSay(lv.lines[i++%lv.lines.length],lv.preset);fx.at(fx.t+lv.every,speak);};fx.at(1.2,speak);}
  if(extra.footsteps){const ghost=fx.add(new THREE.Object3D());const stepBuf=makeBuffer(.12,(a,r)=>{for(let i=0;i<a.length;i++)a[i]=(fx.random()*2-1)*Math.exp(-i/r*40);});let next=0;fx.every(dt=>{const a=fx.t*1.4;ghost.position.set(fx.anchor.x+Math.cos(a)*4,fx.anchor.y+.2,fx.anchor.z+Math.sin(a)*4);next-=dt;if(next<=0&&audioReady){next=.42;const s=new THREE.PositionalAudio(listener);s.setBuffer(stepBuf);s.setRefDistance(2);s.setVolume(.9);s.onEnded=()=>{s.isPlaying=false;s.disconnect();ghost.remove(s);};ghost.add(s);s.play();}});}
  if(extra.ghostCar&&B1.cars){const carM=fx.add(new THREE.Mesh(B1.cars.geometry,fx.track(phong(0xdfe8ea,{vertexColors:true,transparent:true,opacity:.42,emissive:0x223033,depthWrite:false}))));const dir=new THREE.Vector3(0,0,-1);carM.position.copy(fx.anchor).addScaledVector(dir,70);carM.rotation.y=Math.atan2(dir.z,-dir.x);
    fx.every(dt=>{carM.position.addScaledVector(dir,-9*dt);carM.position.y=surfaceHeight(carM.position.x,carM.position.z,carM.position.y+3);if(!fx.honked&&carM.position.distanceTo(player.position)<9){fx.honked=true;sfx('alarm');shake(.6,.6);}});}
  if(extra.skip){let n=0;const skip=()=>{if(egg.done||n>=4)return;if(player.position.distanceTo(egg.group.position)<def.triggerRadius+6){skipBack(.85);n++;flash('white');}fx.at(fx.t+3.1,skip);};fx.at(2.4,skip);}
  runBeats(fx,extra);
  fx.click=n=>{if(audio){audio.setPlaybackRate(Math.max(.4,audio.playbackRate*.82));audio.setVolume(Math.min(1.4,audio.getVolume()*1.25));}sfx('glitch');shake(.4,.3);const line=(extra.clicks||[])[n-1]||extra.click;if(line)hallucinate({text:line,preset:'deep'},{force:true});};}

// ─── Records of someone ──────────────────────────────────────────────────────
function popupFx(fx,x,y,z){const egg=fx.egg,extra=egg.extra||{};
  const term=materialize(fx,MODELS.FloatingInfoTerminal(),x,y-1.2,z);const crt=term.userData.parts.crt;fx.every(()=>{term.rotation.y=Math.atan2(player.position.x-term.position.x,player.position.z-term.position.z);term.position.y=y-1.2+Math.sin(fx.t*1.5)*.12;if(frame%12===0)crt.tick();});
  const pops=[...egg.popups];if(extra.extraPopup)pops.push(extra.extraPopup);egg.required=pops.length;
  pops.forEach((p,i)=>fx.at(.15+i*.35,()=>{if(!egg.done)createMemoryWindow(egg,i,p);}));
  if(extra.leak)fx.sound(positional(term,eggBuffer('classic0'),{vol:.3,ref:2,rate:.7}));
  if(extra.faceCam)fx.at(2.4,()=>{camOverride={dur:3.2,rate:2.2,pos:()=>{const f=heading.rotation.y;return new THREE.Vector3(player.position.x+Math.sin(f)*3.4,player.position.y+2.6,player.position.z+Math.cos(f)*3.4);},look:()=>new THREE.Vector3(player.position.x,player.position.y+2.2,player.position.z)};motion.lock=3.2;});
  if(extra.cctv)fx.at(.6,()=>{const cam=new THREE.Vector3(x+14,y+16,z+14);camOverride={dur:5,rate:12,pos:()=>cam,look:()=>player.position.clone().setY(player.position.y+1.5)};cctv(true,'CAM 04 · 205동 앞 · 04:44 · REC ●');later(5,()=>cctv(false));});
  if(extra.child){const kid=createMannequin();kid.root.scale.setScalar(.55);fx.add(kid.root);const a=fx.random()*TAU,kx=x+Math.cos(a)*12,kz=z+Math.sin(a)*12;kid.root.position.set(kx,surfaceHeight(kx,kz,y),kz);
    fx.every(dt=>{if(!kid.root.visible)return;kid.heading.rotation.y=Math.atan2(player.position.x-kx,player.position.z-kz);poseMannequin(kid,{speed:0,t:worldTime,wave:true},dt);camera.getWorldDirection(projected);const to=kid.root.position.clone().sub(camera.position).normalize();if(fx.t>8){kid.root.visible=false;hallucinate({text:'...여기 있어.',preset:'child'},{force:true});}});}
  if(extra.grassRise){const n=140,inst=fx.add(new THREE.InstancedMesh(grassGeo,grassMat,n)),o=new THREE.Object3D(),pp=fx.anchor.clone(),baseM=[];for(let i=0;i<n;i++){const a=fx.random()*TAU,d=1.4+fx.random()*7,gx=pp.x+Math.cos(a)*d,gz=pp.z+Math.sin(a)*d;o.position.set(gx,surfaceHeight(gx,gz,pp.y+1),gz);o.rotation.set(0,fx.random()*TAU,0);o.scale.set(1.2,1,1.2);o.updateMatrix();baseM.push(o.matrix.clone());}
    let k=0;const sm=new THREE.Matrix4(),mm=new THREE.Matrix4();fx.every(dt=>{if(k>=1)return;k=Math.min(1,k+dt*.5);for(let i=0;i<n;i++){sm.makeScale(1,.02+ease(k)*2.4,1);mm.multiplyMatrices(baseM[i],sm);inst.setMatrixAt(i,mm);}inst.instanceMatrix.needsUpdate=true;});sfx('grow');}
  if(extra.unlockDoor)fx.at(3,()=>{World.touch('tilewall',{k:'문이 드러남',st:{door:1},silent:true});toast('흰 타일 벽 어딘가에 문이 생겼습니다.');});
  if(extra.beacon){const beam=fx.add(new THREE.Mesh(fx.track(new THREE.CylinderGeometry(.6,.6,140,10,1,true)),fx.track(phong(0xffffff,{emissive:0xfff2c0,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}))));beam.position.set(88,BRIDGE_Y+70,-179.5);flags.beacon=true;}
  runBeats(fx,extra);}
function startEffect(egg){const fx=makeFx(egg),g=egg.group.position,base=eggBase(egg);
  if(egg.type===1){const kind=egg.def.spatialEffect?.mutationType;(SPATIAL[kind]||SPATIAL.CLASSIC_DRIFT)(fx,g.x,g.z,egg.level?base:null);if(!egg.target){const mono=materialize(fx,MODELS.SpatialGlitchMonolith(),g.x+2.2,base,g.z-1.2),pr=mono.userData.parts;fx.every(()=>{pr.cage.rotation.y=fx.t*.6;pr.slab.position.x=(fx.random()<.05?(fx.random()-.5)*.3:0);});}runBeats(fx,egg.extra||{});}
  else if(egg.type===0)audioFx(fx,g.x,g.y,g.z);
  else popupFx(fx,g.x,g.y,g.z);
  return fx;}

