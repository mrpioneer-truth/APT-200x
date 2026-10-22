// Apartments have actual walk-through ground-floor interiors. The needle has an attached observation room.
const Interiors=(()=>{
 const rooms=[],doors=[],group=new THREE.Group();scene.add(group);
 const terrazzo=phong(0xe4eee6,{shininess:130}),warmWhite=phong(0xf6f0dc,{emissive:0x4e503e}),sea=phong(0x7bada5,{shininess:110});
 function make({id,x,z,w,d,floor,doorX=x,name,remote=false,exit}){const ceil=floor+4.0,g=new THREE.Group();group.add(g);const r={id,minX:x-w/2+.56,maxX:x+w/2-.56,minZ:z-d/2+.56,maxZ:z+d/2-.6,floor,ceil,interior:true,group:g,remote,exit};ROOMS.push(r);rooms.push(r);LOCATION_NAMES['room:'+id]=['INSIDE / PUREUN VILLAGE',name];
  slab(x-w/2,x+w/2,floor-.2,floor,z-d/2,z+d/2+.6,terrazzo,g,'interiorfloor');box(x,ceil+.12,z,w,.24,d,white,g);
  for(const dx of [-w*.23,w*.23])box(x+dx,ceil-.05,z,.9,.035,d*.68,warmWhite,g);
  if(remote){for(const side of [-1,1])box(x+side*(w/2-.25),floor+2.1,z,.5,4.2,d,white,g);box(x,floor+2.1,z-d/2,w,4.2,.5,white,g);box(x,floor+2.1,z+d/2,w,4.2,.5,white,g);}
  box(x-w/2+1.15,floor+.82,z-d*.16,.8,1.64,1.6,sea,g);box(x+w/2-1.2,floor+.53,z-d*.2,.65,1.06,2.4,white,g);box(x+w/2-1.2,floor+.88,z-d*.2,.7,.08,2.4,sea,g);
  for(let i=0;i<3;i++){const zz=z-d*.35+i*.8;mesh(new THREE.CylinderGeometry(.2,.28,.5,10),white,x-w/2+1.05,floor+.25,zz,g);sphere(x-w/2+1.05,floor+.86,zz,.42,mint,g);}
  const tex=labelTex(512,128,[[name,'32px Arial',22,52],['입주자를 기다리는 로비 · 출입문은 뒤쪽','18px Arial',22,98,'#72988a']]);mesh(new THREE.PlaneGeometry(Math.min(w-2.3,5),1.25),phong(0xffffff,{map:tex}),x,floor+2.4,z-d/2+.6,g);
  const front=z+d/2,entry={id,name,x:doorX,z:front,floor,room:r,exit:exit||{x:doorX,y:floor+.15,z:front+2.4}};doors.push(entry);
  if(!remote){const glow=box(doorX,floor+1.7,front+.025,2.95,3.35,.025,phong(0xc2e6dc,{transparent:true,opacity:.07,depthWrite:false}),g);entry.glow=glow;const sign=labelTex(256,64,[[name+'  ↗','21px Arial',16,42]]);mesh(new THREE.PlaneGeometry(2.8,.7),phong(0xffffff,{map:sign}),doorX,floor+3.78,front+.14,g);}
  instanceBoxes(g);return entry;}
 for(const b of buildings)make({id:'home-'+b.id,x:b.group.position.x,z:b.group.position.z,w:b.w,d:b.d,floor:b.baseY+.4,name:b.id+'동 안쪽'});
 make({id:'sky-lobby',x:SKY.x,z:SKY.z,w:26,d:26,floor:P0+.05,doorX:54,name:'스카이타워 로비'});
 make({id:'twin-lobby',x:TWIN.x,z:TWIN.z,w:22,d:22,floor:P0+.05,name:'트윈 타워 로비'});
 const needle=make({id:'needle-room',x:260,z:260,w:16,d:14,floor:8,name:'바늘탑의 조용한 전망실',remote:true,exit:{x:138,y:terrainY(138,-133)+.1,z:-133}});
 const needleEntrance={...needle,x:138,z:-134.4,floor:terrainY(138,-134.4),portal:true};doors.push(needleEntrance);const gate=box(138,needleEntrance.floor+1.6,-135.1,2.6,3.2,.1,sea,group);gate.userData.interiorPortal=true;
 const button=document.createElement('button');button.id='enterBuilding';button.className='building-entry';button.textContent='안으로 들어가기 ↗';document.body.append(button);let nearby=null;
 function closest(){const p=player.position;return doors.filter(e=>Math.abs(p.y-e.floor)<2&&Math.hypot(p.x-e.x,p.z-e.z)<3.6&&(e.portal||!e.room.remote||currentRoom()?.id===e.id)).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];}
 function travel(d){if(!d)return false;if(d.portal){teleport(260,8.1,263,0);toast('바늘탑 안쪽으로 들어왔습니다.');return true;}if(currentRoom()?.id===d.id){teleport(d.exit.x,d.exit.y,d.exit.z,0);toast('단지로 나왔습니다.');}else{teleport(d.x,d.floor+.05,d.z-2.2,0);toast(d.name+'에 들어왔습니다.');}return true;}
 button.onclick=()=>travel(nearby);
 function tick(){nearby=closest();button.hidden=!started||paused||!nearby;button.textContent=nearby&&(currentRoom()?.id===nearby.id)?'밖으로 나가기 ↗':'안으로 들어가기 ↗';for(const r of rooms)r.group.visible=started&&(currentRoom()?.id===r.id||player.position.distanceTo(_tv.set((r.minX+r.maxX)/2,r.floor,(r.minZ+r.maxZ)/2))<45);}
 return {tick,handleInteract:()=>nearby?travel(nearby):false,doors:()=>doors.map(d=>({id:d.id,x:d.x,y:d.floor,z:d.z,portal:!!d.portal})),enter:id=>travel(doors.find(d=>d.id===id))};
})();
