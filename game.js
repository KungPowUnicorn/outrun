'use strict';
/* ============================================================
   OUTRUN DELIVERY: INFINITE NIGHT
   Single-file HTML5 idle game — Canvas highway + idle economy
   ============================================================ */

/* ---------------- CONFIG & DATA ---------------- */
const CONFIG = {
  saveKey: 'outrun_delivery_v1',
  baseIncome: 1, baseSpeed: 10, deliveryInterval: 10,
  offlineEff: 0.5, offlineCapH: 8,
  od: { chargeMax: 100, duration: 15, baseMult: 5 },
  prestigeThreshold: 25000, tapeDivisor: 12000,
};
const MILESTONES = [100,500,1000,2500,5000,10000,25000,50000,100000,250000,500000,1000000,2500000,5000000,10000000];
const GARAGE = [
  {id:'turbo',   name:'Turbo Engine',    icon:'gauge',   base:60,  growth:1.18, max:60, color:'#FF784F', desc:'+2 km/s base speed per level.',            eff:l=>(10+2*l)+' km/s base'},
  {id:'tires',   name:'Synthwave Tires', icon:'tires',   base:90,  growth:1.16, max:30, color:'#42DCE5', desc:'Faster, smoother lane changes.',           eff:l=>(3.2*(1+0.08*l)).toFixed(1)+' lanes/s'},
  {id:'gps',     name:'Holographic GPS', icon:'gps',     base:120, growth:1.17, max:40, color:'#7554D9', desc:'+15% package & delivery payout per level.',eff:l=>'x'+(1+0.15*l).toFixed(2)+' payouts'},
  {id:'cassette',name:'Cassette AI',     icon:'tape',    base:180, growth:1.19, max:50, color:'#E34FB9', desc:'+10% all income per level.',               eff:l=>'x'+(1+0.10*l).toFixed(2)+' income'},
  {id:'solar',   name:'Solar Panels',    icon:'sun',     base:150, growth:1.18, max:30, color:'#F9D68A', desc:'+3% income, softer collision penalties.',  eff:l=>'x'+(1+0.03*l).toFixed(2)+' income'},
  {id:'gearbox', name:'Quantum Gearbox', icon:'gear',    base:260, growth:1.20, max:40, color:'#42DCE5', desc:'+8% speed multiplier per level.',          eff:l=>'x'+(1+0.08*l).toFixed(2)+' speed'},
  {id:'chrome',  name:'Chrome Exhaust',  icon:'exhaust', base:260, growth:1.20, max:25, color:'#FF784F', desc:'+10% reputation gained per level.',        eff:l=>'x'+(1+0.10*l).toFixed(2)+' rep'},
  {id:'nos',     name:'NOS Booster',     icon:'bolt',    base:340, growth:1.22, max:20, color:'#E34FB9', desc:'+0.5x Overdrive multiplier per level.',    eff:l=>'x'+(5+0.5*l).toFixed(1)+' overdrive'},
];
const FLEET = [
  {id:'coupe',       name:'Retro Coupe',       icon:'v_coupe', cost:500,    income:2,   tag:'BALANCED'},
  {id:'interceptor', name:'Turbo Interceptor', icon:'v_int',   cost:2500,   income:8,   tag:'SPEED'},
  {id:'cruiser',     name:'Solar Cruiser',     icon:'v_cru',   cost:10000,  income:25,  tag:'EFFICIENCY'},
  {id:'hover',       name:'Hover Courier',     icon:'v_hov',   cost:50000,  income:100, tag:'URBAN'},
  {id:'hauler',      name:'Heavy Hauler',      icon:'v_hau',   cost:250000, income:450, tag:'BULK'},
];
const AUTO = [
  {id:'apilot',  name:'Basic Autopilot',    icon:'wheel',  base:2000,  growth:1,    max:1,  desc:'Automatically dodges traffic and chases packages. Toggle on the Drive screen.'},
  {id:'aod',    name:'Auto Overdrive',     icon:'bolt',   base:8000,  growth:1,    max:1,  desc:'Engages Overdrive the moment the meter is full. Toggle on the Drive screen.'},
  {id:'synth',   name:'Synth Drivers',      icon:'chip',   base:1200,  growth:1.9,  max:25, desc:'+20% fleet income per level.'},
  {id:'sorting', name:'Package Sorting',    icon:'box',    base:900,   growth:1.85, max:25, desc:'+10% package value and a wider pickup magnet per level.'},
  {id:'drones',  name:'Courier Drones',     icon:'drone',  base:5000,  growth:2.1,  max:30, desc:'+3 CR/s of drone income per level.'},
  {id:'qlogi',   name:'Quantum Logistics',  icon:'atom',   base:20000, growth:2.2,  max:25, desc:'+25% ALL income per level.'},
];
const ROUTES = [
  {id:'coastal', name:'Coastal Circuit',  mult:1.0,  req:0,      desc:'Sun-bleached shoreline runs. Where it all began.'},
  {id:'desert',  name:'Desert Express',   mult:1.35, req:5000,   desc:'Long flat straights across the neon dunes.'},
  {id:'loop',    name:'Neon Loop',        mult:1.8,  req:25000,  desc:'The city ring road, glowing end to end.'},
  {id:'midnight',name:'Midnight Freeway', mult:2.4,  req:60000,  desc:'Six lanes of chrome and static.'},
  {id:'ridge',   name:'Static Ridge',     mult:3.2,  req:120000, desc:'A mountain pass above the cloud deck.'},
  {id:'horizon', name:'Event Horizon',    mult:4.5,  req:300000, desc:'The road stops pretending to be real.'},
];
const TIMELINES = {
  t1984:{id:'t1984', name:'1984 · NEON DESERT', short:'1984', unlock:0, mult:1, env:'desert',
    sky:['#171329','#421a55','#93365f'], glow:'rgba(255,120,79,', sun:['#f9d68a','#ff784f','#e34fb9'],
    ground:'#140f26', grid:'rgba(117,84,217,', edge:'#e34fb9', edge2:'#42dce5', dash:'#f9d68a',
    roadA:'#261b42', roadB:'#211639', ridge:'#1a1231',
    desc:'Where the company was born. Chrome, dusk and palm shadows.'},
  t1989:{id:'t1989', name:'1989 · NEON CITY', short:'1989', unlock:100000, mult:1.5, env:'city',
    sky:['#0b081c','#1c1245','#0e4a5e'], glow:'rgba(66,220,229,', sun:['#eafffb','#7df3ef','#42dce5'],
    ground:'#0d0a1e', grid:'rgba(227,79,185,', edge:'#42dce5', edge2:'#e34fb9', dash:'#bffcff',
    roadA:'#141741', roadB:'#111336', ridge:'#120e28',
    desc:'Downtown grid at night. The future arrived early.'},
};
const FUTURE_TL = ['1997 · CYBERPUNK STREETS','2025 · CORPORATE MEGACITY','2088 · QUANTUM HIGHWAY','??? · REALITY DISTORTION'];
const PRESTIGE = [
  {id:'analog',   name:'Analog Memories',     icon:'tape',      max:10, costs:[1,2,4,7,11,16,22,29,37,46], desc:l=>'Start each run with '+fmt(startCreditsFor(l))+' CR'},
  {id:'odinf',    name:'Infinite Overdrive',  icon:'bolt',      max:5,  costs:[2,4,7,11,16],               desc:l=>'Overdrive '+(15+3*l)+'s, base x'+(5+0.5*l).toFixed(1)},
  {id:'workforce',name:'Synthetic Workforce', icon:'chip',      max:10, costs:[1,2,4,6,9,12,16,20,25,30],  desc:l=>'+'+(25*l)+'% fleet income'},
  {id:'nav',      name:'Perfect Navigation',  icon:'compass',   max:10, costs:[1,2,4,6,9,12,16,20,25,30],  desc:l=>'+'+(12*l)+'% all income'},
  {id:'temporal', name:'Temporal Stability',  icon:'hourglass', max:5,  costs:[2,3,5,8,12],                desc:l=>'+'+(15*l)+'% Cassette Tapes from Dawnbreak'},
];
function startCreditsFor(l){ return l<=0?0:Math.round(400*l*l); }
const TPAL = [['#5a4f9f','#372e66'],['#9f4f86','#5e2e50'],['#3f8b8b','#255454'],['#8b7a3f','#544a25'],['#8b4f4f','#542e2e']];
const SCENE_STAGES={
  t1984:[
    {id:'dunes',name:'NEON DUNES',env:'desert',weather:'clear',sky:['#171329','#421a55','#93365f'],ground:'#140f26',edge:'#e34fb9',edge2:'#42dce5',ridge:'#1a1231'},
    {id:'canyon',name:'RED ROCK PASS',env:'canyon',weather:'dust',sky:['#241322','#6b2d3f','#a84f53'],ground:'#241226',edge:'#ff784f',edge2:'#f9d68a',ridge:'#381c31'},
    {id:'salt',name:'SALT MIRROR FLATS',env:'coast',weather:'mist',sky:['#102332','#276278','#90b8af'],ground:'#10212b',edge:'#42dce5',edge2:'#f9d68a',ridge:'#1a343e'},
    {id:'oasis',name:'PALM OASIS',env:'desert',weather:'clear',sky:['#0f1d31','#274e68','#b25f6e'],ground:'#101d2b',edge:'#53e5bd',edge2:'#f9d68a',ridge:'#203747'}
  ],
  t1989:[
    {id:'grid',name:'NEON DISTRICT',env:'city',weather:'clear',sky:['#0b081c','#1c1245','#0e4a5e'],ground:'#0d0a1e',edge:'#42dce5',edge2:'#e34fb9',ridge:'#120e28'},
    {id:'rain',name:'RAIN CIRCUIT',env:'city',weather:'rain',sky:['#080c20','#182d56','#155868'],ground:'#071521',edge:'#58cfff',edge2:'#e34fb9',ridge:'#10182f'},
    {id:'harbor',name:'AFTERHOURS HARBOR',env:'coast',weather:'mist',sky:['#101627','#24435a','#668b91'],ground:'#101c29',edge:'#42dce5',edge2:'#ff784f',ridge:'#172838'},
    {id:'skybridge',name:'SKYBRIDGE LOOP',env:'city',weather:'clear',sky:['#170c2d','#4b1d67','#b14882'],ground:'#151027',edge:'#ff5cc8',edge2:'#f9d68a',ridge:'#211438'}
  ]
};
const COLOR_THEMES={
  ocean:{sky:['#061923','#0c4355','#167579'],ground:'#071a22',edge:'#42dec5',edge2:'#91f5ed',dash:'#d7fff4',grid:'rgba(66,220,197,',roadA:'#102830',roadB:'#0d232c',ridge:'#0b2933',sun:['#d9fff5','#56d9c4','#257da0'],glow:'rgba(66,220,197,'},
  arcade:{sky:['#16051f','#52206d','#ba3864'],ground:'#170d25',edge:'#ff4fd8',edge2:'#fff05e',dash:'#fff4a1',grid:'rgba(255,79,216,',roadA:'#291442',roadB:'#211236',ridge:'#251235',sun:['#fff68a','#ff9d40','#ff4fd8'],glow:'rgba(255,79,216,'},
  mono:{sky:['#101018','#343444','#777784'],ground:'#17171c',edge:'#d2d2e0',edge2:'#9999ae',dash:'#f0f0f2',grid:'rgba(210,210,224,',roadA:'#292933',roadB:'#22222c',ridge:'#292933',sun:['#fff','#b9b9c7','#858593'],glow:'rgba(210,210,224,'}
};
function sceneStage(t=sim.travel){const stages=SCENE_STAGES[state.timeline]||SCENE_STAGES.t1984;return stages[Math.floor(t/4500)%stages.length];}
const DAY_LEN=480;
const TOD_DAY={sky:['#2f7bff','#ff8fd0','#ffd9a0'],ground:'#2b1b55',ridge:'#4b2a7a',roadA:'#3c2c70',roadB:'#35285f',edge:'#ff4fd8',edge2:'#35e0ff',dash:'#fff1a8',sun:['#fffbd0','#ffb347','#ff4fa3'],glow:'rgba(255,170,120,',grid:'rgba(255,79,216,'};
const TOD_NIGHT={sky:['#13062e','#5a2a8f','#ff71ce'],ground:'#10072a',ridge:'#1f1048',roadA:'#1c1245',roadB:'#170e3a',edge:'#05ffa1',edge2:'#01cdfe',dash:'#fffb96',sun:['#fffb96','#ff71ce','#b967ff'],glow:'rgba(185,103,255,',grid:'rgba(185,103,255,'};
function dayFactor(){ if(!state.settings.dayNight) return null; const d=0.5+0.5*Math.cos(sim.tod*Math.PI*2), x=Math.max(0,Math.min(1,(d-0.3)/0.4)); return x*x*(3-2*x); }
function hex2rgb(h){ h=h.replace('#',''); if(h.length===3) h=h.split('').map(c=>c+c).join(''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
function mixHex(a,b,t){ if(typeof a!=='string'||a[0]!=='#'||typeof b!=='string') return a; const x=hex2rgb(a),y=hex2rgb(b); return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join(''); }
function mixPre(a,b,t){ const m=/(\d+),\s*(\d+),\s*(\d+)/.exec(a), n=/(\d+),\s*(\d+),\s*(\d+)/.exec(b); if(!m||!n) return a; return 'rgba('+[1,2,3].map(i=>Math.round(+m[i]+(+n[i]-m[i])*t)).join(',')+','; }
function applyTOD(o){
  const f=dayFactor(); if(f===null) return o;
  const hx=(c,n,d)=>mixHex(mixHex(c,n,.6),mixHex(c,d,.8),f), pr=(c,n,d)=>mixPre(mixPre(c,n,.6),mixPre(c,d,.8),f);
  o.sky=o.sky.map((c,i)=>hx(c,TOD_NIGHT.sky[i],TOD_DAY.sky[i])); o.sun=o.sun.map((c,i)=>hx(c,TOD_NIGHT.sun[i],TOD_DAY.sun[i]));
  for(const k of ['ground','ridge','roadA','roadB','edge','edge2','dash']) o[k]=hx(o[k],TOD_NIGHT[k],TOD_DAY[k]);
  for(const k of ['glow','grid']) o[k]=pr(o[k],TOD_NIGHT[k],TOD_DAY[k]);
  o.day=f; return o;
}
function visualTimeline(t,raw){const base=TIMELINES[state.timeline]||TIMELINES.t1984,stage=sceneStage(t),theme=COLOR_THEMES[state.settings.palette];return (raw?{...base,...stage,...(theme||{}),env:stage.env,weather:stage.weather,regionName:stage.name,stageId:stage.id}:applyTOD({...base,...stage,...(theme||{}),env:stage.env,weather:stage.weather,regionName:stage.name,stageId:stage.id}));}

/* ---------------- UTIL ---------------- */
const el = id => document.getElementById(id);
const rand = (a,b) => a + Math.random()*(b-a);
const randInt = n => Math.floor(Math.random()*n);
const pick = a => a[randInt(a.length)];
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const SUF = ['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No'];
function fmt(n){
  if(!isFinite(n)) return '∞';
  if(n<0) return '-'+fmt(-n);
  if(n<1000) return (Math.abs(n%1)<0.01 || n<10 && n%1!==0) ? (n%1<0.01?String(Math.floor(n)):n.toFixed(1)) : String(Math.floor(n));
  let t = Math.min(Math.floor(Math.log10(n)/3), SUF.length-1);
  const v = n/Math.pow(10,3*t);
  return (v>=100?v.toFixed(0):v>=10?v.toFixed(1):v.toFixed(2))+SUF[t];
}
function fmtTime(s){
  s=Math.floor(s); const h=Math.floor(s/3600), m=Math.floor(s%3600/60);
  return (h?h+'h ':'')+(m?m+'m ':'')+(s%60)+'s';
}
function hash1(n){ const x=Math.sin(n)*43758.5453; return x-Math.floor(x); }
function reducedMotion(){ return state.settings.reduced; }

/* ---------------- STATE ---------------- */
function defaultState(){
  return {
    version:1,
    credits:0, distance:0, lifetimeDistance:0, travel:0,
    deliveries:0, packages:0, reputation:0, fragments:0,
    timeline:'t1984', unlocked:['t1984'],
    prestigeCount:0, tapes:0, tapesEarned:0, msIdx:0,
    upgrades:{turbo:0,tires:0,gps:0,cassette:0,solar:0,gearbox:0,chrome:0,nos:0},
    fleet:{coupe:0,interceptor:0,cruiser:0,hover:0,hauler:0},
    fleetLv:{coupe:0,interceptor:0,cruiser:0,hover:0,hauler:0},
    route:'coastal', offUp:{rate:0,cap:0},
    auto:{apilot:0,aod:0,synth:0,sorting:0,drones:0,qlogi:0},
    prestige:{analog:0,odinf:0,workforce:0,nav:0,temporal:0},
    settings:{master:0.8, music:0.55, sfx:0.8, engine:0.65, muted:false,
      reduced: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches,
      pauseMenus:false, pauseBackground:false, highContrast:false, reduceFlashes:false, speedStreaks:true, scanlines:true, glowEffects:true, uiScale:1, controls:'swipe', palette:'sunset', dayNight:true, track:'auto', trackMinutes:3, pickupGuides:true},
    stats:{playtime:0, odUses:0, eventsWon:0, closeCalls:0, collisions:0},
    tod:0.3, tutorialDone:false, runHistory:[], newTL:false,
    lastSavedAt:Date.now(),
  };
}
let state = defaultState();
function sanitize(d){
  const s = defaultState();
  if(!d || typeof d!=='object') return s;
  const num = v => (typeof v==='number' && isFinite(v) && v>=0) ? v : null;
  for(const k of ['credits','distance','lifetimeDistance','travel','tod','deliveries','packages','reputation','fragments','prestigeCount','tapes','tapesEarned','msIdx','lastSavedAt']){
    const v=num(d[k]); if(v!==null) s[k]=v;
  }
  if(typeof d.timeline==='string' && TIMELINES[d.timeline]) s.timeline=d.timeline;
  if(Array.isArray(d.unlocked)) d.unlocked.forEach(t=>{ if(TIMELINES[t] && !s.unlocked.includes(t)) s.unlocked.push(t); });
  for(const [key,src] of [['upgrades',GARAGE],['fleet',FLEET],['fleetLv',FLEET],['auto',AUTO],['prestige',PRESTIGE],['settings',null],['stats',null]]){
    if(d[key] && typeof d[key]==='object'){
      for(const k2 in s[key]){ const v=num(d[key][k2]); if(v!==null) s[key][k2]=Math.min(v, src? src.find? (src.find(x=>x.id===k2)||{max:1e9}).max||1e9 : 1e9 : 1e9); }
    }
  }
  if(d.stats) for(const k2 in s.stats){ const v=num(d.stats[k2]); if(v!==null) s.stats[k2]=v; }
  if(d.settings) for(const k2 in s.settings){
    if(k2==='muted'||k2==='reduced'){ if(typeof d.settings[k2]==='boolean') s.settings[k2]=d.settings[k2]; }
    else { const v=num(d.settings[k2]); if(v!==null) s.settings[k2]=clamp(v,0,1); }
  }
  for(const key of ['upgrades','fleet','fleetLv','auto','prestige']) for(const k in s[key]) s[key][k]=Math.floor(s[key][k]);
  for(const k in s.fleetLv) s.fleetLv[k]=Math.min(100,s.fleetLv[k]);
  for(const k in s.fleet) s.fleet[k]=Math.min(1e6,s.fleet[k]);
  s.tod=s.tod%1;
  if(d.offUp&&typeof d.offUp==='object'){ s.offUp.rate=clamp(Math.floor(+d.offUp.rate)||0,0,19); s.offUp.cap=clamp(Math.floor(+d.offUp.cap)||0,0,46); }
  if(d.settings){
    for(const k of ['pauseMenus','pauseBackground','highContrast','reduceFlashes','speedStreaks','scanlines','glowEffects','dayNight','pickupGuides']) if(typeof d.settings[k]==='boolean') s.settings[k]=d.settings[k];
    if(typeof d.settings.uiScale==='number') s.settings.uiScale=clamp(d.settings.uiScale,0.85,1.25);
    if(['swipe','buttons','tap'].includes(d.settings.controls)) s.settings.controls=d.settings.controls;
    if(['sunset','ocean','arcade','mono'].includes(d.settings.palette)) s.settings.palette=d.settings.palette;
    if(d.settings.track==='auto'||d.settings.track==='shuffle'||(typeof d.settings.track==='string'&&TRACKS[d.settings.track])) s.settings.track=d.settings.track;
    s.settings.trackMinutes=typeof d.settings.trackMinutes==='number'&&isFinite(d.settings.trackMinutes)?clamp(Math.round(d.settings.trackMinutes),1,30):3;
  }
  if(typeof d.tutorialDone==='boolean') s.tutorialDone=d.tutorialDone;
  if(Array.isArray(d.runHistory)) s.runHistory=d.runHistory.filter(x=>x&&typeof x.distance==='number'&&isFinite(x.distance)).slice(-8).map(x=>({distance:Math.max(0,x.distance),tapes:Math.max(0,+x.tapes||0),timestamp:Math.max(0,+x.timestamp||0)}));
  if(d.newTL) s.newTL=true;
  return s;
}
function loadGame(){
  try{ const raw=localStorage.getItem(CONFIG.saveKey); if(!raw) return false; state=sanitize(JSON.parse(raw)); return true; }
  catch(e){ return false; }
}
function saveGame(){
  state.lastSavedAt=Date.now(); state.travel=sim.travel; state.tod=sim.tod;
  try{ localStorage.setItem(CONFIG.saveKey, JSON.stringify(state)); const badge=el('saveStatus'); if(badge){badge.textContent='SAVED '+new Date(state.lastSavedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});badge.classList.remove('unsaved','saving');} }catch(e){ const badge=el('saveStatus'); if(badge){badge.textContent='SAVE ERROR';badge.classList.add('unsaved');} }
}
function wipeSave(){ try{ localStorage.removeItem(CONFIG.saveKey); }catch(e){} }

/* ---------------- SIM STATE ---------------- */
const sim = {
  travel:0, curve:0, lanePos:1, target:1,
  traffic:[], packages:[], scenery:[], floats:[], particles:[], boosts:[],
  rival:null, policeCar:null, ev:null, evCd:55, sirenT:0, paused:false, regionStep:null, tod:0.3, phase:null,
  trafficT:2.5, pkgT:2, nextSc:200, nextGate:600,
  od:{charge:0, active:false, t:0},
  deliverT:0, autoT:0, clock:0,
  collisionT:0, invulnT:0, shakeT:0,
  laneChange:null, autoOn:true, autoOdOn:true, air:[], airT:18,
};
let cachedParts={base:1,player:1,fleet:0,drones:0};
let cachedIncome=1, cachedSpeed=10;
function markUnsaved(){const b=el('saveStatus');if(b){b.textContent='UNSAVED';b.classList.add('unsaved');}}
function applyVisualSettings(){document.body.classList.toggle('high-contrast',state.settings.highContrast);document.body.classList.toggle('fx-lite',state.settings.reduceFlashes);document.body.classList.toggle('no-scanlines',!state.settings.scanlines);document.body.classList.toggle('no-glow',!state.settings.glowEffects);document.body.style.setProperty('--ui-scale',state.settings.uiScale);document.body.dataset.palette=state.settings.palette;document.body.dataset.controls=state.settings.controls;document.body.classList.toggle('rm',state.settings.reduced);document.body.classList.toggle('landscape',innerWidth>innerHeight);}
function updatePauseUI(){
  const b=el('btnPause'); if(!b) return;
  const paused=gameStopped(), show=sim.paused&&curTab==='drive', key=paused+'|'+show;
  if(updatePauseUI.k===key) return; updatePauseUI.k=key;
  b.innerHTML=I[paused?'play':'pause']; b.setAttribute('aria-label',paused?'Resume game':'Pause game'); b.setAttribute('aria-pressed',String(paused)); b.title=paused?'Resume game':'Pause game';
  let screen=el('pauseScreen');
  if(!screen){ screen=document.createElement('div'); screen.id='pauseScreen'; screen.className='pause-screen'; screen.hidden=true; screen.innerHTML='<div class="pause-card"><h2>PAUSED</h2><p>Your road run is safely on hold.</p><button class="btn buy big" id="resumeBtn">RESUME DRIVING</button></div>'; el('content').appendChild(screen); screen.querySelector('#resumeBtn').addEventListener('click',()=>togglePause()); }
  screen.hidden=!show;
}
function togglePause(){sim.paused=!sim.paused;AudioSys.sfx('click');updatePauseUI();}
function openTour(step=0){
  const pages=[
    ['1 / 4 · DRIVE','Change lanes with A/D, arrow keys, swipes, taps, mouse clicks or wheel, or the on-screen arrows. Collect glowing packages and avoid traffic.'],
    ['2 / 4 · OVERDRIVE','The Overdrive meter charges on its own and from deliveries, energy cells, and close calls. Engage it when full for a temporary speed and income boost.'],
    ['3 / 4 · BUILD','Garage upgrades improve your courier. Fleet vehicles earn credits in the background. Use the ×1, ×10, and MAX purchase selector to speed up repeat buys.'],
    ['4 / 4 · LONG GAME','Routes and timelines unlock as lifetime distance grows. At 25,000 km, Dawnbreak trades this run for permanent Cassette Tapes. Your browser stores the save; export it to move devices.']
  ];
  const [title,text]=pages[step];
  showModal('<h2>SHIFT BRIEFING</h2><p style="font:700 11px var(--font-n);letter-spacing:2px;color:var(--cyan)">'+title+'</p><p>'+text+'</p>'+modalBtns([{label:step?'BACK':'SKIP TOUR',fn:()=>step?openTour(step-1):(state.tutorialDone=true,saveGame(),closeModal())},{label:step===pages.length-1?'FINISH':'NEXT',cls:'buy',fn:()=>{if(step===pages.length-1){state.tutorialDone=true;saveGame();closeModal();toast('SHIFT BRIEFING COMPLETE','reward');}else openTour(step+1);}}]));
}

/* ---------------- ECONOMY ---------------- */
function upgradeCost(u){ return Math.ceil(u.base*Math.pow(u.growth, state.upgrades[u.id])); }
function fleetCost(v){ return Math.ceil(v.cost*Math.pow(1.35, state.fleet[v.id])); }
function fleetLvCost(v){ return Math.ceil(v.cost*3*Math.pow(1.6, state.fleetLv[v.id])); }
function autoCost(a){ return Math.ceil(a.base*Math.pow(a.growth, state.auto[a.id])); }
function prestigeCost(p){ const l=state.prestige[p.id]; return l>=p.max?Infinity:p.costs[l]; }
function offEff(){ return 0.05*(1+state.offUp.rate); }
function offCapS(){ return 3600+1800*state.offUp.cap; }
function offCost(k){ return Math.ceil((k==='rate'?1000:800)*Math.pow(k==='rate'?1.45:1.14,state.offUp[k])); }
function routeMult(){ return ROUTES.find(r=>r.id===state.route).mult; }
let buyMode='1'; const sortMode={fleet:'recommended',garage:'recommended'};
function purchaseQuote(costAt, level, cap){
  const remaining=Math.max(0,cap-level), wanted=buyMode==='max'?5000:Math.max(1,+buyMode||1);
  let qty=0,total=0;
  for(let i=0;i<Math.min(remaining,wanted,5000);i++){
    const c=costAt(level+i);
    if(buyMode==='max' && total+c>state.credits) break;
    total+=c; qty++;
  }
  const n=qty||(remaining>0?1:0), shown=qty?total:(remaining>0?costAt(level):0);
  return {qty,total,n,shown,enabled:qty>0&&(buyMode==='max'||total<=state.credits),label:(buyMode==='max'&&qty>0?'MAX ×':'×')+n};
}
function qtyTools(){return '<div class="qty-tools" role="group" aria-label="Purchase quantity"><span>BUY QUANTITY</span>'+[['1','1'],['10','10'],['max','MAX']].map(([v,t])=>'<button type="button" data-qty="'+v+'" class="'+(buyMode===v?'selected':'')+'" aria-pressed="'+(buyMode===v)+'">'+t+'</button>').join('')+'</div>';}

function calcIncomeParts(){
  const u=state.upgrades, a=state.auto, p=state.prestige, tl=TIMELINES[state.timeline];
  const common = (1+0.10*u.cassette)*(1+0.03*u.solar)*(1+0.12*p.nav)*(1+0.25*a.qlogi)
    *(1+0.005*Math.floor(state.reputation))*(1+0.01*Math.floor(state.fragments))*tl.mult;
  const player = CONFIG.baseIncome*common;
  let fleetRaw=0;
  for(const v of FLEET) fleetRaw += state.fleet[v.id]*v.income*Math.pow(1.25, state.fleetLv[v.id]);
  const fleet = fleetRaw*(1+0.20*a.synth)*(1+0.25*p.workforce)*routeMult()*common;
  const drones = 3*a.drones*common;
  return {player, fleet, drones, base:player+fleet+drones};
}
function boostMult(){ let m=1; for(const b of sim.boosts) m*=b.mult; return m; }
function odMult(){ return CONFIG.od.baseMult + 0.5*state.upgrades.nos + 0.5*state.prestige.odinf; }
function odDuration(){ return CONFIG.od.duration + 3*state.prestige.odinf; }
function calcIncome(){ return cachedParts.base*boostMult()*(sim.od.active?odMult():1); }
function calcSpeed(){
  let s=(10+2*state.upgrades.turbo)*(1+0.08*state.upgrades.gearbox);
  if(sim.od.active) s*=1.5;
  for(const b of sim.boosts) if(b.speed) s*=b.speed;
  if(sim.collisionT>0) s*=0.45;
  return s;
}
function calcSpeedPure(){
  return (10+2*state.upgrades.turbo)*(1+0.08*state.upgrades.gearbox);
}
function visSpeed(){ return 70+Math.min(cachedSpeed*1.6,450)+(sim.od.active?50:0); }
function gpsMult(){ return (1+0.15*state.upgrades.gps)*(1+0.10*state.auto.sorting); }
function gainRep(n){ state.reputation += n*(1+0.10*state.upgrades.chrome); }
function tapeReward(){
  return Math.floor(Math.sqrt(Math.max(0,state.distance)/CONFIG.tapeDivisor)*(1+0.15*state.prestige.temporal));
}
function dawnbreakReady(){ return state.distance>=CONFIG.prestigeThreshold; }

/* ---------------- AUDIO ---------------- */
const MT=n=>440*Math.pow(2,(n-69)/12);
const CH={m:[0,3,7],M:[0,4,7],m7:[0,3,7,10],M7:[0,4,7,11],sus:[0,5,7]};
const TRACKS={
  neon:{name:'Neon Highway',step:.15,prog:[[45,'m'],[41,'M'],[48,'M'],[43,'M']],kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.',bass:'XxxxXx^xXxxxXx^x',bassW:'sawtooth',arp:'0213213.0213213.',arpW:'triangle',arpG:.06,padW:'sawtooth',padG:.016,padLen:2.6},
  vapor:{name:'Vapor Dreams',step:.22,prog:[[48,'M7'],[45,'m7'],[41,'M7'],[43,'sus']],kick:'x.......x.....x.',snare:'........x.......',hat:'..x...x...x...x.',drum:.5,bass:'X.......x.......',bassW:'sine',arp:'0.1.2.3.2.1.3.2.',arpW:'sine',arpG:.07,arpLen:.3,padW:'triangle',padG:.03,padLen:3.8},
  chase:{name:'Turbo Chase',step:.115,prog:[[45,'m'],[41,'M'],[43,'M'],[40,'M']],kick:'x..x..x.x...x.x.',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.x.',bass:'XxxXxxXxXxxXxxXx',bassW:'sawtooth',arp:'0.1.2.1.0.1.2.3.',arpW:'sawtooth',arpG:.04,padW:'sawtooth',padG:.012,padLen:1.8},
  golden:{name:'Golden Hour',step:.13,prog:[[48,'M'],[43,'M'],[45,'m'],[41,'M']],kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.',bass:'X.x.X.x.X.x.X.x.',bassW:'triangle',arp:'0120210.0120213.',arpW:'square',arpG:.035,padW:'triangle',padG:.022,padLen:2.4},
  dark:{name:'Dark Synth',step:.125,prog:[[40,'m'],[43,'M'],[38,'M'],[41,'M']],kick:'x...x..xx...x...',snare:'....x.......x...',hat:'x.x.x.x.x.x.x.xx',bass:'XxXxXxXxXxXxXx^x',bassW:'sawtooth',arp:'0.2.1.3.0.2.1.3.',arpW:'square',arpG:.03,padW:'sawtooth',padG:.014,padLen:2},
  italo:{name:'Italo Disco',step:.121,prog:[[50,'m'],[46,'M'],[53,'M'],[48,'M']],kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.',bass:'X^X^X^X^X^X^X^X^',bassW:'sawtooth',arp:'0213021302130213',arpW:'triangle',arpG:.05,padW:'sawtooth',padG:.012,padLen:1.8},
  sunset:{name:'Sunset Cruise',step:.18,prog:[[48,'M7'],[53,'M7'],[52,'m7'],[45,'m7']],kick:'x.....x.x.......',snare:'........x.......',hat:'..x...x...x...x.',drum:.6,bass:'X.....x.X.......',bassW:'triangle',arp:'0.1.2.3.4.3.2.1.',arpW:'sine',arpG:.06,arpLen:.25,padW:'triangle',padG:.028,padLen:3.2},
  rain:{name:'Neon Rain',step:.3,prog:[[43,'m7'],[41,'M7'],[38,'m7'],[40,'sus']],kick:'................',snare:'................',hat:'..............x.',drum:.3,bass:'X...............',bassW:'sine',arp:'0...2...1...3...',arpW:'sine',arpG:.05,arpLen:.8,padW:'sine',padG:.04,padLen:5},
  lofi:{name:'Lo-Fi Highway',step:.17,prog:[[50,'m7'],[43,'M7'],[48,'M7'],[45,'m7']],kick:'x.....x...x.....',snare:'....x.......x...',hat:'..x...x...x...x.',drum:.6,bass:'X.....x.X.....x.',bassW:'sine',arp:'0.1...2.1...3...',arpW:'triangle',arpG:.05,padW:'triangle',padG:.025,padLen:2.6},
  arcade:{name:'8-Bit Arcade',step:.1,prog:[[57,'M'],[53,'M'],[55,'M'],[52,'m']],kick:'x...x...x...x...',snare:'....x.......x...',hat:'..x...x...x...x.',drum:.7,bass:'X.x.X.x.X.x.X.x.',bassW:'square',arp:'0123210301232103',arpW:'square',arpG:.045,arpLen:.09,padW:'square',padG:0,padLen:1},
};
const AudioSys = {
  ctx:null, on:false, noise:null, seqTimer:null,
  unlock(){
    if(!this.ctx){
      try{ this.ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
      this.build();
    }
    if(this.ctx.state==='suspended') this.ctx.resume();
    if(!this.on){ this.on=true; this.startSeq(); this.applyVol(); }
  },
  build(){
    const c=this.ctx;
    this.master=c.createGain(); this.master.connect(c.destination);
    this.mus=c.createGain(); this.mus.connect(this.master);
    this.sfxG=c.createGain(); this.sfxG.connect(this.master);
    this.arpBus=c.createGain(); this.arpBus.connect(this.mus);
    const dl=c.createDelay(1); dl.delayTime.value=0.32;
    const fb=c.createGain(); fb.gain.value=0.32;
    this.arpBus.connect(dl); dl.connect(fb); fb.connect(dl); fb.connect(this.mus);
    this.dl=dl;
    const len=c.sampleRate; const buf=c.createBuffer(1,len,c.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    this.noise=buf;
    // engine
    this.engGain=c.createGain(); this.engGain.gain.value=0;
    const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=220;
    this.eo1=c.createOscillator(); this.eo1.type='sawtooth'; this.eo1.frequency.value=46;
    this.eo2=c.createOscillator(); this.eo2.type='square'; this.eo2.frequency.value=23;
    this.eo1.connect(lp); this.eo2.connect(lp); lp.connect(this.engGain); this.engGain.connect(this.master);
    this.eo1.start(); this.eo2.start();
    // music sequencer
    this.step=0; this.nextT=c.currentTime+0.1; this.trackKey='';
  },
  applyVol(){
    if(!this.ctx) return;
    const s=state.settings;
    this.master.gain.value=s.muted?0:s.master;
    this.mus.gain.value=s.music;
    this.sfxG.gain.value=s.sfx;
  },
  resolveTrack(){ const k=state.settings.track;
    if(k==='shuffle'){ const now=performance.now(); if(!this.shuffleKey||!TRACKS[this.shuffleKey]||now>=this.shuffleAt){ this.shuffleKey=pick(Object.keys(TRACKS).filter(x=>x!==this.shuffleKey)); this.shuffleAt=now+(state.settings.trackMinutes||3)*60000; } return this.shuffleKey; }
    if(k!=='auto'&&TRACKS[k]) return k; const f=dayFactor(); return (f===null||f>.5)?'neon':'vapor'; },
  startSeq(){ if(this.seqTimer) return; this.seqTimer=setInterval(()=>this.schedule(),30); },
  schedule(){
    const c=this.ctx;
    const tk=this.resolveTrack(); if(tk!==this.trackKey){ const prev=this.trackKey; this.trackKey=tk; if(prev) toast('♪ NOW PLAYING: '+TRACKS[tk].name.toUpperCase(),'info',2400); this.TR=TRACKS[tk]; this.step=0; this.nextT=Math.max(this.nextT,c.currentTime+0.05); }
    if(this.nextT < c.currentTime-0.4) this.nextT=c.currentTime+0.05;
    let guard=0;
    while(this.nextT < c.currentTime+0.18 && guard++<8){
      this.playStep(this.step, this.nextT);
      this.step=(this.step+1)%64;
      this.nextT+=this.TR.step;
    }
  },
  tone(type,f0,f1,dur,peak,when,bus,att){
    const c=this.ctx, t=(when||c.currentTime);
    const os=c.createOscillator(), g=c.createGain();
    os.type=type; os.frequency.setValueAtTime(f0,t);
    if(f1) os.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(peak,t+(att||0.005));
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    os.connect(g); g.connect(bus||this.sfxG);
    os.start(t); os.stop(t+dur+0.05);
  },
  noiseHit(dur,peak,f,type,when,bus){
    const c=this.ctx, t=when||c.currentTime;
    const src=c.createBufferSource(); src.buffer=this.noise;
    const fl=c.createBiquadFilter(); fl.type=type||'bandpass'; fl.frequency.value=f;
    const g=c.createGain();
    g.gain.setValueAtTime(peak,t); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(fl); fl.connect(g); g.connect(bus||this.sfxG);
    src.start(t); src.stop(t+dur+0.05);
  },
  playStep(step,t){
    const T=this.TR, c=this.ctx, bar=((step/16)|0)%4, q=step%16, [rm,ty]=T.prog[bar], semis=CH[ty], dg=T.drum==null?1:T.drum;
    if(T.kick[q]==='x'){
      const o=c.createOscillator(), g=c.createGain();
      o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(42,t+0.11);
      g.gain.setValueAtTime(0.5*dg,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
      o.connect(g); g.connect(this.mus); o.start(t); o.stop(t+0.2);
    }
    if(T.snare[q]==='x') this.noiseHit(0.14,0.22*dg,1800,'bandpass',t,this.mus);
    if(T.hat[q]==='x') this.noiseHit(0.04,(q%4===2?0.09:0.05)*dg,7500,'highpass',t,this.mus);
    const bp=T.bass[q]; if(bp!=='.') this.tone(T.bassW,MT(rm-12+(bp==='^'?12:0)),null,0.13,bp==='X'?0.15:0.09,t,this.mus,0.004);
    const ap=T.arp[q]; if(ap!=='.'){ const notes=semis.concat([12]); this.tone(T.arpW,MT(rm+12+notes[(+ap)%notes.length]),null,T.arpLen||0.12,T.arpG,t,this.arpBus,0.003); }
    if(q===0&&T.padG>0) for(const n of semis){ const f=MT(rm+n); this.tone(T.padW,f*1.004,null,T.padLen,T.padG,t,this.mus,0.5); this.tone(T.padW,f*0.996,null,T.padLen,T.padG,t,this.mus,0.5); }
  },
  updateEngine(){
    if(!this.on) return;
    if(typeof gameStopped==='function'&&gameStopped()){this.engGain.gain.value=0;return;}
    const v=visSpeed();
    this.eo1.frequency.value=34+v*0.09;
    this.eo2.frequency.value=(34+v*0.09)/2;
    this.engGain.gain.value=(0.024+Math.min(0.04,v*0.0001)+(sim.od.active?0.02:0))*state.settings.engine;
  },
  sfx(n){
    if(!this.on) return;
    const t=this.ctx.currentTime;
    switch(n){
      case 'collect': this.tone('square',740,1180,0.09,0.16); break;
      case 'delivery': this.tone('sine',523,null,0.1,0.18); this.tone('sine',784,null,0.14,0.18,t+0.09); break;
      case 'buy': this.tone('sine',440,null,0.08,0.14); this.tone('sine',554,null,0.08,0.14,t+0.07); this.tone('sine',659,null,0.14,0.16,t+0.14); break;
      case 'deny': this.tone('square',130,90,0.15,0.2); break;
      case 'notify': this.tone('sawtooth',620,null,0.09,0.12); this.tone('sawtooth',830,null,0.12,0.12,t+0.11); break;
      case 'od': this.tone('sawtooth',180,980,0.5,0.22); this.noiseHit(0.4,0.1,3000,'highpass',t); break;
      case 'crash': this.noiseHit(0.3,0.4,320,'lowpass',t); this.tone('sine',95,38,0.25,0.4); break;
      case 'success': [523,659,784].forEach((f,i)=>this.tone('sine',f,null,0.18,0.16,t+i*0.08)); break;
      case 'fail': this.tone('sawtooth',330,150,0.35,0.2); break;
      case 'siren': this.tone('sine',700,950,0.4,0.06); this.tone('sine',950,700,0.4,0.06,t+0.4); break;
      case 'prestige': this.tone('sawtooth',110,880,1.2,0.2); [262,330,392,523].forEach((f,i)=>this.tone('sine',f,null,0.9,0.1,t+0.5+i*0.1)); break;
      case 'click': this.tone('square',1100,null,0.03,0.06); break;
    }
  },
};

/* ---------------- INPUT / LANES ---------------- */
function setLane(l){
  l=clamp(l,0,2);
  if(l===sim.target) return;
  sim.laneChange={from:sim.target, t:sim.clock};
  sim.target=l;
}
function activateOD(){
  if(sim.od.active || sim.od.charge<CONFIG.od.chargeMax) { if(sim.od.charge<100) AudioSys.sfx('deny'); return; }
  sim.od.charge=0; sim.od.active=true; sim.od.t=odDuration();
  state.stats.odUses++;
  AudioSys.sfx('od'); document.body.classList.add('od');
  floatText(R.W/2, R.H*0.55, 'OVERDRIVE x'+odMult().toFixed(1), '#E34FB9');
}

/* ---------------- FLOATING TEXT ---------------- */
function floatText(x,y,txt,color){ sim.floats.push({x,y,txt,color,t:1,age:0,seed:Math.random()}); }
function emitBurst(x,y,color,count=8){if(reducedMotion())return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=28+Math.random()*105;sim.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-22,life:.45+Math.random()*.5,max:.95,color,r:1.2+Math.random()*2.4});}}
function worldToScreen(z,wx){ return {x:R.sxAt(z,wx), y:R.sy(z), s:R.f/z}; }

/* ---------------- GAMEPLAY EVENTS ---------------- */
function eventBeat(id,phase,detail=''){
  const box=el('eventTransition'),icons={diner:'✦',rival:'◆',police:'⚠'},names={diner:'NEON DINER',rival:'RIVAL RACER',police:'POLICE PURSUIT'};
  if(!box)return;box.className='event-transition '+(phase==='start'?'start':'result')+' event-'+id+(phase==='failed'?' failed':'');
  el('eventTransitionIcon').textContent=icons[id]||'✦';
  const titles=phase==='start'?{diner:'PIT STOP AHEAD',rival:'CHALLENGER DETECTED',police:'PURSUIT ENGAGED'}:{success:'EVENT CLEARED',failed:'EVENT FAILED',reward:'PIT STOP REWARD'};
  el('eventTransitionTitle').textContent=titles[phase]||names[id]||'EVENT';
  el('eventTransitionText').textContent=detail||({diner:'Find the glowing diner on the roadside.',rival:'Hold your nerve. Make it through clean.',police:'Keep clear of traffic until the sirens fade.'}[id]||'');
  clearTimeout(box._hideTimer);requestAnimationFrame(()=>box.classList.add('show'));
  box._hideTimer=setTimeout(()=>box.classList.remove('show'),phase==='start'?1900:1500);
}
function startEvent(){
  const id=pick(['diner','diner','rival','rival','police']);
  if(id==='diner'){
    sim.scenery.push({type:'diner', abs:sim.travel+1300, side:1, off:14, seed:Math.random(), used:false});
    sim.ev={id, t:70, dur:70};
    toast('NEON DINER AHEAD — drive through the lights!','event');
  } else if(id==='rival'){
    sim.ev={id, t:30, dur:30};
    sim.rival={z:420, lane:1, laneF:0, laneT:1.5, tgt:170, flee:false};
    toast('RIVAL RACER! Survive 30s without a collision.','event');
  } else {
    sim.ev={id:'police', t:25, dur:25};
    sim.policeCar={z:610,laneF:0};
    toast('POLICE PURSUIT! Do not touch anything for 25s.','event');
    sim.sirenT=0;
  }
  AudioSys.sfx('notify');
  el('eventBanner').classList.remove('hidden');
  el('eventBanner').classList.remove('event-diner','event-rival','event-police'); el('eventBanner').classList.add('event-'+id);
  el('evIcon').textContent=id==='police'?'⚠':id==='rival'?'◆':'✦';
  eventBeat(id,'start');
}
function endEvent(){
  sim.ev=null; sim.evCd=rand(75,120);
  sim.policeCar=null;
  el('eventBanner').classList.add('hidden');
  el('eventBanner').classList.remove('event-diner','event-rival','event-police');
  if(sim.rival){ sim.rival.flee=true; sim.rival.tgt=2400; }
}
function eventSuccess(){
  const eventId=sim.ev.id;
  const inc=cachedParts.base;
  if(sim.ev.id==='rival'){
    const cr=inc*70; state.credits+=cr; gainRep(6);
    sim.boosts.push({name:'RACER MOMENTUM', mult:1, speed:1.25, t:20});
    floatText(R.W/2,R.H*0.5,'RIVAL DEFEATED +'+fmt(cr)+' CR','#FF784F');
  } else {
    const cr=inc*90; state.credits+=cr; gainRep(10);
    floatText(R.W/2,R.H*0.5,'GOT AWAY +'+fmt(cr)+' CR','#42DCE5');
  }
  emitBurst(R.W/2,R.H*.5, eventId==='rival'?'#ff784f':'#42dce5',14);
  state.stats.eventsWon++; AudioSys.sfx('success');
  eventBeat(eventId,'success',eventId==='rival'?'Rival beaten · clean driving bonus secured.':'Payout secured · the road is yours again.');
  toast('EVENT COMPLETE — rewards delivered','reward');
  endEvent();
}
function eventFail(){
  if(!sim.ev || sim.ev.id==='diner') return;
  const eventId=sim.ev.id;
  if(sim.ev.id==='rival'){
    const cr=cachedParts.base*15; state.credits+=cr;
    floatText(R.W/2,R.H*0.5,'RACE LOST +'+fmt(cr)+' CR','#FF5D7A');
  } else {
    sim.boosts.push({name:'HEAT COOLDOWN', mult:0.55, t:20});
    floatText(R.W/2,R.H*0.5,'BUSTED — INCOME x0.55','#FF5D7A');
  }
  emitBurst(R.W/2,R.H*.5,'#ff5d7a',10);AudioSys.sfx('fail');eventBeat(eventId,'failed',eventId==='rival'?'Collision ended the race. Keep the consolation payout.':'Traffic contact broke the pursuit run.');endEvent();
}
function dinerReward(){
  if(!sim.ev||sim.ev.id!=='diner') return;
  const cr=cachedParts.base*45; state.credits+=cr; gainRep(3);
  sim.boosts.push({name:'DINER SPECIAL', mult:2, t:30});
  emitBurst(R.W/2,R.H*.58,'#f9d68a',16);
  eventBeat('diner','reward','Credits delivered · x2 income for 30 seconds.');
  floatText(R.W/2,R.H*0.5,'DINER SPECIAL +'+fmt(cr)+' CR · x2 30s','#F9D68A');
  AudioSys.sfx('success'); endEvent();
}
function updateEvents(dt){
  if(sim.ev){
    const ev=sim.ev;
    ev.t-=dt;
    if(ev.id==='police'){sim.sirenT-=dt;if(sim.sirenT<=0){sim.sirenT=0.9;AudioSys.sfx('siren');}if(sim.policeCar){sim.policeCar.z=610+Math.sin(sim.clock*1.3)*75;const ln=Math.round(1+Math.sin(sim.clock*.75));sim.policeCar.laneF+=((ln-1)*4.5-sim.policeCar.laneF)*Math.min(1,dt*1.6);}}
    if(ev.t<=0){ if(ev.id==='diner') endEvent(); else eventSuccess(); }
  } else {
    sim.evCd-=dt;
    if(sim.evCd<=0) startEvent();
  }
}

/* ---------------- COLLISIONS / PICKUPS ---------------- */
function onCollision(){
  sim.invulnT=1.4; sim.collisionT=3; sim.shakeT=0.5;
  state.stats.collisions++;
  AudioSys.sfx('crash');
  if(!state.settings.reduceFlashes&&!reducedMotion()){const v=el('vignette');v.classList.add('hitflash');setTimeout(()=>v.classList.remove('hitflash'),320);}
  floatText(R.W/2, R.H*0.7, 'COLLISION', '#FF5D7A');
  if(sim.ev && (sim.ev.id==='rival'||sim.ev.id==='police')) eventFail();
}
function closeCallCheck(c){
  const lc=sim.laneChange;
  if(lc && c.lane===lc.from && sim.clock-lc.t<1.0){
    sim.od.charge=Math.min(100,sim.od.charge+4);
    const cr=cachedParts.base*0.8; state.credits+=cr;
    state.stats.closeCalls++;
    floatText(R.W/2, R.H*0.66, 'CLOSE CALL +'+fmt(cr), '#42DCE5');
    AudioSys.sfx('collect');
  }
}
function collectPackage(p, scr){
  const gm=gpsMult(), inc=cachedParts.base;
  let cr=0, msg='', color='#42DCE5';
  if(p.type==='std'){ cr=inc*2.5*gm; state.packages++; msg='+'+fmt(cr)+' CR'; }
  else if(p.type==='rush'){ cr=inc*7.5*gm; state.packages++; msg='RUSH +'+fmt(cr); color='#FF784F'; }
  else if(p.type==='energy'){ sim.od.charge=Math.min(100,sim.od.charge+8); cr=inc*0.8*gm; msg='+ENERGY CELL'; color='#7DF3EF'; }
  else { cr=inc*30*gm; state.packages++; state.fragments++; gainRep(2); msg='DATA FRAGMENT +1'; color='#E34FB9'; }
  state.credits+=cr;
  floatText(scr.x, scr.y-30, msg, color);
  emitBurst(scr.x,scr.y-6,color,p.type==='rare'?12:7);
  AudioSys.sfx('collect');
}
function doDelivery(){
  const cr=cachedParts.base*6*gpsMult();
  state.credits+=cr; state.deliveries++;
  sim.od.charge=Math.min(100,sim.od.charge+6);
  floatText(R.W/2, R.H*0.6, pick(['NEON MOTEL','CHROME DINER','ARCADE 84','RADIO TOWER','LASER VEGAS','TAPE SHOP','PALM HOTEL','NIGHT CLUB'])+' +'+fmt(cr)+' CR', '#F9D68A');
  emitBurst(R.W/2,R.H*.6,'#F9D68A',12);
  AudioSys.sfx('delivery');
}

/* ---------------- AUTOPILOT ---------------- */
function autoThink(){
  if(!state.auto.apilot || !sim.autoOn) return;
  const vs=visSpeed(), lt=1/(3.2*(1+0.08*state.upgrades.tires)), HZ=3.0, M=.3, p=sim.lanePos, T=sim.target;
  const cars=[];
  for(const c of sim.traffic){ if(c.z<=40) continue; const cl=Math.max(1,vs-c.spd), t=(c.z-60)/cl; if(t>9) continue; cars.push({l:c.lane,t,h:6/cl}); }
  const pk=l=>sim.packages.some(q=>q.lane===l&&q.z>90&&q.z<900);
  // when would driving to lane D first collide? (Infinity = never). Every lane crossed on the way counts.
  const plan=(D,H)=>{
    const iv=[], dist=Math.abs(D-p), sg=D>=p?1:-1;
    if(dist<.01) iv.push([D,0,H]);
    else for(let m=0;m<3;m++){ const u=(m-p)*sg; if(u>dist+.49||u<-.49) continue; iv.push([m,Math.max(0,u-.49)*lt,m===D?H:(u+.49)*lt]); }
    let first=1e9;
    for(const [m,a,b] of iv) for(const c of cars) if(c.l===m && a-M<c.t+c.h && b+M>c.t-c.h) first=Math.min(first,Math.max(a,c.t-c.h));
    return first;
  };
  const f=[0,1,2].map(D=>plan(D,HZ)), clear=f.map(x=>x>=1e9), ext=[0,1,2].map(D=>plan(D,7));
  if(clear[T]){ if(!pk(T)){ const w=[T-1,T+1].filter(l=>l>=0&&l<3&&pk(l)&&clear[l]); if(w.length) setLane(w[0]); } return; }
  const order=[0,1,2].sort((a,b)=>Math.abs(a-p)-Math.abs(b-p));
  let best=-1;
  for(const l of order){ if(!clear[l]) continue; if(best<0||ext[l]>ext[best]+.01||(Math.abs(ext[l]-ext[best])<=.01&&pk(l)&&!pk(best))) best=l; }
  if(best<0){ best=T; for(const l of order) if(f[l]>f[best]+.05) best=l; }
  if(best!==T) setLane(best);
}

/* ---------------- SPAWNING ---------------- */
function spawnStuff(dt){
  sim.trafficT-=dt;
  const dens = sim.ev&&sim.ev.id==='rival'?1.9 : sim.ev&&sim.ev.id==='police'?2.3 : 1;
  if(sim.trafficT<=0 && sim.traffic.length<16){
    sim.trafficT=rand(1.5,2.6)/dens;
    const tl=visualTimeline(undefined,true),types=tl.env==='city'?['sedan','sedan','van','truck','bike','sport','wagon','hover']:['sedan','sedan','van','truck','bike','sport','wagon','pickup'];
    const ty=pick(types),spd=ty==='bike'?rand(40,56):(['sport','hover'].includes(ty)?rand(48,66):['truck','pickup'].includes(ty)?rand(18,30):rand(24,38));
    // never spawn an unavoidable 3-lane wall: skip lanes where both other lanes already have a car arriving within ~1.1s of this one
    const vN=visSpeed(), arr=(z,sp)=>(z-60)/Math.max(1,vN-sp), tn=arr(2200,spd);
    const free=[0,1,2].filter(L=>[0,1,2].filter(l=>l!==L&&sim.traffic.some(c=>c.lane===l&&c.z>40&&Math.abs(arr(c.z,c.spd)-tn)<1.1)).length<2);
    if(free.length) sim.traffic.push({lane:pick(free),z:2200,spd,type:ty,pal:pick(TPAL),passed:false}); else sim.trafficT=0.4;
  }
  sim.pkgT-=dt;
  if(sim.pkgT<=0){
    sim.pkgT=rand(2.2,3.6);
    const r=Math.random();
    const lane=randInt(3);sim.packages.push({lane,laneF:(lane-1)*4.5,attracted:0,z:1600,type:r<0.62?'std':r<0.82?'rush':r<0.94?'energy':'rare',seed:Math.random()*7});
  }
    const tl=visualTimeline(undefined,true);
    while(sim.nextSc < sim.travel+2300){
      const z=sim.nextSc, sd=Math.random(), tl=visualTimeline(z,true);
    if(tl.env==='desert'){
      const bt=['palm','cactus','cactus'][Math.floor(z/7000)%3];
      sim.scenery.push({type:bt, abs:z+rand(0,20), side:-1, off:rand(12,30), seed:sd});
      sim.scenery.push({type:bt, abs:z+rand(0,20), side:1, off:rand(12,30), seed:Math.random()});
      if(Math.random()<0.28) sim.scenery.push({type:'bill', abs:z+rand(0,40), side:Math.random()<0.5?-1:1, off:rand(12,20), seed:Math.random()});
    } else if(tl.env==='canyon'){
      sim.scenery.push({type:'rock',abs:z+rand(0,30),side:-1,off:rand(12,30),seed:sd});
      sim.scenery.push({type:'rock',abs:z+rand(0,30),side:1,off:rand(12,30),seed:Math.random()});
      if(z%3500<100)sim.scenery.push({type:'windmill',abs:z+45,side:Math.random()<.5?-1:1,off:rand(16,28),seed:Math.random()});
      if(z%4800<100)sim.scenery.push({type:'bridge',abs:z+60,side:0,off:0,seed:sd});
    } else if(tl.env==='coast'){
      sim.scenery.push({type:'palm',abs:z+rand(0,20),side:-1,off:rand(16,34),seed:sd});
      if(z%3600<100)sim.scenery.push({type:'lighthouse',abs:z+40,side:Math.random()<.5?-1:1,off:rand(22,36),seed:Math.random()});
      if(Math.random()<0.36)sim.scenery.push({type:'bill',abs:z+rand(0,45),side:Math.random()<.5?-1:1,off:rand(12,24),seed:Math.random()});
    } else {
      sim.scenery.push({type:'sign', abs:z, side:-1, off:rand(11,22), seed:sd});
      if(Math.random()<0.7) sim.scenery.push({type:'sign', abs:z+30, side:1, off:rand(11,22), seed:Math.random()});
      if(Math.random()<0.3) sim.scenery.push({type:'bill', abs:z+60, side:Math.random()<0.5?-1:1, off:rand(12,20), seed:Math.random()});
      if(tl.stageId==='skybridge'&&z%2700<100)sim.scenery.push({type:'bridge',abs:z+70,side:0,off:0,seed:sd});
    }
    if(Math.random()<0.45){ const cty=tl.env==='city'; sim.scenery.push({type:'bldg', abs:z+rand(0,60), side:Math.random()<.5?-1:1, off:cty?rand(15,30):rand(22,46), seed:Math.random()}); }
      sim.nextSc+=100;
    }
    if(tl.env==='city'){
    while(sim.nextGate < sim.travel+2300){
      sim.scenery.push({type:'gate', abs:sim.nextGate, side:0, off:0, seed:Math.random()});
      sim.nextGate+=460;
    }
  }
}

/* ---------------- OBJECT MOVEMENT ---------------- */
function moveObjects(dt){
  const vs=visSpeed();
  for(let i=sim.traffic.length-1;i>=0;i--){
    const c=sim.traffic[i];
    c.z-=(vs-c.spd)*dt;
    const px=(sim.lanePos-1)*4.5, cx=(c.lane-1)*4.5;
    if(c.z<66 && c.z>54 && Math.abs(cx-px)<2.2 && sim.invulnT<=0) onCollision();
    if(c.z<54 && !c.passed){ c.passed=true; closeCallCheck(c); }
    if(c.z<20) sim.traffic.splice(i,1);
  }
  if(sim.rival){
    const r=sim.rival;
    r.z+=(r.tgt-r.z)*Math.min(1,dt*0.6);
    if(!r.flee){
      r.laneT-=dt;
      if(r.laneT<=0){ r.laneT=rand(1.2,2.2); r.lane=clamp(r.lane+pick([-1,1]),0,2); }
      r.laneF+=((r.lane-1)*4.5-r.laneF)*Math.min(1,dt*2.5);
    }
    if(r.z>2150) sim.rival=null;
  }
  const magnet=2.2+0.35*state.auto.sorting;
  for(let i=sim.packages.length-1;i>=0;i--){
    const p=sim.packages[i];
    p.z-=vs*dt;
    const px=(sim.lanePos-1)*4.5;if(!isFinite(p.laneF))p.laneF=(p.lane-1)*4.5;
    const dx=px-p.laneF,range=Math.min(5.5,magnet*1.45);
    if(!reducedMotion()&&p.z<850&&p.z>60&&Math.abs(dx)<range){p.attracted=clamp(1-Math.abs(dx)/range,0,1);p.laneF+=dx*Math.min(1,dt*(.8+state.auto.sorting*.08));}
    else p.attracted=0;
    if(p.z<64 && p.z>50 && Math.abs(p.laneF-px)<magnet){
      collectPackage(p, worldToScreen(Math.max(p.z,58),p.laneF));
      sim.packages.splice(i,1); continue;
    }
    if(p.z<48) sim.packages.splice(i,1);
  }
  for(let i=sim.scenery.length-1;i>=0;i--){
    const s=sim.scenery[i];
    if(s.type==='diner' && !s.used && s.abs-sim.travel<62){ s.used=true; dinerReward(); }
    if(s.abs < sim.travel-80) sim.scenery.splice(i,1);
  }
}

/* ---------------- MAIN UPDATE ---------------- */
function update(dt){
  if(!isFinite(state.credits)) state.credits=0;
  state.stats.playtime+=dt;
  sim.clock+=dt;
  if(state.settings.dayNight){ sim.tod=(sim.tod+dt/DAY_LEN)%1; const ph=dayFactor()>.5; if(sim.phase===null) sim.phase=ph; else if(ph!==sim.phase){ sim.phase=ph; toast(ph?'☀ SYNTHWAVE DAY':'☾ VAPORWAVE NIGHT','event',2600); } }
  cachedParts=calcIncomeParts();
  cachedIncome=calcIncome();
  state.credits+=cachedIncome*dt;
  cachedSpeed=calcSpeed();
  const dk=cachedSpeed*dt;
  state.distance+=dk; state.lifetimeDistance+=dk;
  sim.travel+=visSpeed()*dt;
  const regionStep=Math.floor(sim.travel/4500);
  if(sim.regionStep===null)sim.regionStep=regionStep;
  else if(regionStep!==sim.regionStep){sim.regionStep=regionStep;const profile=visualTimeline();R.stageKey='';toast('ENTERING · '+profile.regionName,'event',2600);el('regionBadge').classList.remove('region-enter');void el('regionBadge').offsetWidth;el('regionBadge').classList.add('region-enter');}
  sim.curve=Math.sin(sim.travel*0.0011)*0.75+Math.sin(sim.travel*0.00034+1.7)*0.35;

  const rate=3.2*(1+0.08*state.upgrades.tires);
  const d=sim.target-sim.lanePos;
  if(Math.abs(d)>0.002) sim.lanePos+=Math.sign(d)*Math.min(Math.abs(d),rate*dt);

  if(sim.od.active){ sim.od.t-=dt; if(sim.od.t<=0){ sim.od.active=false; toast('Overdrive ended','info'); } }
  else sim.od.charge=Math.min(100, sim.od.charge+(1.1+0.05*state.upgrades.nos)*dt);

  for(let i=sim.boosts.length-1;i>=0;i--){ const b=sim.boosts[i]; b.t-=dt; if(b.t<=0) sim.boosts.splice(i,1); }
  if(sim.collisionT>0) sim.collisionT-=dt;
  if(sim.invulnT>0) sim.invulnT-=dt;
  if(sim.shakeT>0) sim.shakeT-=dt;
  sim.airT-=dt; if(sim.airT<=0){ sim.airT=rand(25,60); if(sim.air.length<2){ const he=Math.random()<.6,dir=Math.random()<.5?1:-1; sim.air.push({k:he?'heli':'plane',dir,x:dir>0?-.1:1.1,y:he?rand(.3,.6):rand(.12,.4),v:he?rand(.04,.07):rand(.09,.14),ph:Math.random()*6}); } }
  for(let i=sim.air.length-1;i>=0;i--){ const a=sim.air[i]; a.x+=a.dir*a.v*dt; if(a.x<-.2||a.x>1.2) sim.air.splice(i,1); }

  spawnStuff(dt);
  moveObjects(dt);
  sim.autoT-=dt; if(sim.autoT<=0){ sim.autoT=0.1; autoThink(); }
  if(state.auto.aod&&sim.autoOdOn&&!sim.od.active&&sim.od.charge>=CONFIG.od.chargeMax) activateOD();
  updateEvents(dt);

  sim.deliverT+=dt;
  if(sim.deliverT>=CONFIG.deliveryInterval){ sim.deliverT-=CONFIG.deliveryInterval; doDelivery(); }

  while(state.msIdx<MILESTONES.length && state.distance>=MILESTONES[state.msIdx]){
    const cr=Math.max(50,cachedParts.base*60);
    state.credits+=cr; state.msIdx++;
    toast('MILESTONE '+fmt(MILESTONES[state.msIdx-1])+' KM — +'+fmt(cr)+' CR','reward');
    AudioSys.sfx('success');
  }
  if(state.lifetimeDistance>=TIMELINES.t1989.unlock && !state.unlocked.includes('t1989')){
    state.unlocked.push('t1989'); state.newTL=true;
    AudioSys.sfx('prestige');
    showModal('<h2>NEW TIMELINE UNLOCKED</h2><p>The desert rolls on forever, but the <b style="color:var(--cyan)">1989 · NEON CITY</b> grid has appeared on your dashboard.</p><p>Travel there from the TIMELINE tab for a <b>x1.5</b> income modifier and a brand-new skyline.</p>'+modalBtns([{label:'KEEP DRIVING',cls:'buy'}]));
    saveGame();
  }
  for(let i=sim.floats.length-1;i>=0;i--){const f=sim.floats[i];f.t-=dt;f.age+=dt;f.y-=(34+Math.min(24,f.age*30))*dt;if(f.t<=0)sim.floats.splice(i,1);}
  for(let i=sim.particles.length-1;i>=0;i--){const p=sim.particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt;if(p.life<=0)sim.particles.splice(i,1);}
}

/* ---------------- RENDERER ---------------- */
const R = {
  cv:null, cx:null, W:0, H:0, DPR:1, f:0, camH:0, horizonY:0,
  sun:null, stars:[], city:[], city2:[], streaks:[], stageKey:'',
  init(){
    this.cv=el('hw'); this.cx=this.cv.getContext('2d');
    addEventListener('resize',()=>this.resize());
    this.resize();
    for(let i=0;i<16;i++) this.streaks.push({a:Math.random()*Math.PI*2, p:Math.random()});
  },
  resize(){
    document.body.classList.toggle('landscape',innerWidth>innerHeight);
    this.DPR=Math.min(devicePixelRatio||1,2);
    this.W=innerWidth; this.H=innerHeight;
    this.cv.width=this.W*this.DPR; this.cv.height=this.H*this.DPR;
    this.cv.style.width=this.W+'px'; this.cv.style.height=this.H+'px';
    this.cx.setTransform(this.DPR,0,0,this.DPR,0,0);
    this.f=clamp(Math.min(this.W*0.98,this.H*1.5)*4,1800,9000);
    this.horizonY=this.H*0.40;
    this.camH=(this.H*0.86-this.horizonY)*60/this.f;
    this.buildSun(); this.buildStars(); this.buildCity();
  },
  buildSun(){
    const r=Math.min(this.W,this.H)*0.155;
    const c=document.createElement('canvas'); c.width=c.height=Math.ceil(r*2);
    const g=c.getContext('2d');
    const grad=g.createLinearGradient(0,0,0,r*2);
    const cols=visualTimeline().sun;
    grad.addColorStop(0,cols[0]); grad.addColorStop(0.55,cols[1]); grad.addColorStop(1,cols[2]);
    g.fillStyle=grad; g.beginPath(); g.arc(r,r,r,0,7); g.fill();
    g.globalCompositeOperation='destination-out';
    let y=r*1.02, h=2;
    while(y<r*2){ g.fillRect(0,y,r*2,h); y+=h+Math.max(3,(2*r-y)*0.14); h+=1.7; }
    this.sun=c;
  },
  buildStars(){
    this.stars=[];
    for(let i=0;i<90;i++) this.stars.push({x:Math.random(), y:Math.random()*0.36, r:Math.random()<0.85?1:2, tw:rand(0.5,2.4), ph:Math.random()*7});
  },
  buildCity(){
    this.city=[]; this.city2=[];
    let x=0; while(x<1.45){ const w=rand(0.028,0.085); this.city.push({x,w,h:rand(0.05,0.2),seed:Math.random()*100}); x+=w+rand(0.004,0.02); }
    x=0; while(x<1.45){ const w=rand(0.02,0.05); this.city2.push({x,w,h:rand(0.08,0.3),seed:Math.random()*100}); x+=w+rand(0.01,0.05); }
  },
  curveOff(z){ const t=z/2200; return sim.curve*t*t*150; },
  sxAt(z,wx){ return this.W/2 + (this.curveOff(z)+wx)*this.f/z; },
  sy(z){ return this.horizonY + this.camH*this.f/z; },
  render(dt,t){
    const g=this.cx, W=this.W, H=this.H, hY=this.horizonY, tl=visualTimeline();
    const stageKey=state.timeline+':'+tl.stageId+':'+state.settings.palette+':'+Math.round((tl.day||0)*12);
    if(this.stageKey!==stageKey){this.stageKey=stageKey;this.buildSun();}
    g.save();
    if(sim.shakeT>0 && !reducedMotion()) g.translate(rand(-1,1)*7*sim.shakeT, rand(-1,1)*7*sim.shakeT);
    // sky
    const sky=g.createLinearGradient(0,0,0,hY*1.12);
    sky.addColorStop(0,tl.sky[0]); sky.addColorStop(0.62,tl.sky[1]); sky.addColorStop(1,tl.sky[2]);
    g.fillStyle=sky; g.fillRect(-12,-12,W+24,hY+14);
    // stars
    g.fillStyle='#fff';
    for(const s of this.stars){
      g.globalAlpha=(0.2+0.35*Math.abs(Math.sin(t*s.tw+s.ph)))*(s.y/0.36)*(1-(tl.day||0)*.95);
      g.fillRect(s.x*W, s.y*H, s.r, s.r);
    }
    g.globalAlpha=1;
    // horizon glow
    if(state.settings.glowEffects){const gl=g.createLinearGradient(0,hY-110,0,hY);gl.addColorStop(0,tl.glow+'0)');gl.addColorStop(1,tl.glow+'0.34)');g.fillStyle=gl;g.fillRect(0,hY-110,W,110);}
    // sun
    const sunX=W/2-sim.curve*34;
    g.drawImage(this.sun, sunX-this.sun.width/2, hY-this.sun.height*0.42);
    this.drawAir(g,t);
    // background scenery
    if(tl.env==='city') this.drawCity(g,tl); else this.drawRidges(g,tl);
    // ground
    g.fillStyle=tl.ground; g.fillRect(-12,hY,W+24,H-hY+14);
    if(tl.env==='coast')this.drawWater(g,tl,t);
    this.drawGrid(g,tl);
    this.drawRoad(g,tl);
    // world objects far -> near
    this.drawWorld(g,tl,t,dt);
    this.drawPlayer(g,tl,t);
    this.drawFX(g,dt,t,tl);
    for(const p of sim.particles){g.globalAlpha=clamp(p.life/p.max,0,1);g.fillStyle=p.color;if(state.settings.glowEffects){g.shadowColor=p.color;g.shadowBlur=6;}g.beginPath();g.arc(p.x,p.y,p.r*(.65+.35*p.life/p.max),0,7);g.fill();g.shadowBlur=0;}
    // floating texts
    g.textAlign='center'; g.font='700 14px Orbitron, monospace';
    for(const f of sim.floats){
      const life=clamp(f.t,0,1),scale=1+(1-life)*.14;
      g.save();g.globalAlpha=Math.min(1,life*1.8);g.translate(f.x,f.y);g.scale(scale,scale);g.fillStyle=f.color;if(state.settings.glowEffects){g.shadowColor=f.color;g.shadowBlur=8;}
      g.fillText(f.txt,0,0);
      g.restore();
      g.shadowBlur=0;
    }
    g.globalAlpha=1;
    g.restore();
  },
  drawRidges(g,tl){
    const hY=this.horizonY,H=this.H,W=this.W;
    const reg=sim.travel/7000,r0=Math.floor(reg),f=reg-r0,bl=f*f*(3-2*f);
    const Pm=r=>({amp:.6+hash1(r*3.1)*1.2,fr:.6+hash1(r*5.7)*1.4,jag:hash1(r*7.3),mesa:hash1(r*11.9)>.6?1:0,hue:hash1(r*2.3)});
    const A=Pm(r0),B=Pm(r0+1),mx=k=>A[k]+(B[k]-A[k])*bl;
    const amp=mx('amp'),fr=mx('fr'),jag=mx('jag'),cap=1-.5*mx('mesa'),hue=mx('hue');
    const pal=state.settings.palette,baseHue=pal==='ocean'?188:pal==='arcade'?302:pal==='mono'?240:255,sat=pal==='mono'?3:38;
    const layers=[
      {par:.4,k:.55,off:60,c:`hsl(${baseHue+hue*24},${sat}%,${15+hue*5}%)`},
      {par:1,k:1,off:0,c:`hsl(${baseHue-5+hue*24},${sat+2}%,${10+hue*4}%)`}];
    for(const L of layers){
      const shift=-sim.curve*52*L.k+L.off+sim.travel*.012*L.par;
      g.fillStyle=L.c;g.beginPath();g.moveTo(-24,hY+2);
      for(let x=-24;x<=W+24;x+=22){
        const u=(x+shift)*.008;
        let v=(Math.sin(u*1.7*fr)*.5+Math.sin(u*.53*fr+2.1)*.8+Math.sin(u*3.3*fr+.5)*jag*.4+1.4)/2.6;
        v=Math.min(v,cap);
        g.lineTo(x,hY-v*amp*38*L.k*(H/900));
      }
      g.lineTo(W+24,hY+2);g.closePath();g.fill();
    }
  },
  drawCity(g,tl){
    const hY=this.horizonY, W=this.W, H=this.H, shift=-sim.curve*70;
    g.fillStyle=tl.ridge;
    for(const b of this.city2){
      const x=b.x*W*1.45-W*0.22+shift*0.55, bw=b.w*W, bh=b.h*H;
      g.fillRect(x,hY-bh,bw,bh);
    }
    const wcols=[tl.edge,tl.edge2,tl.dash];
    for(const b of this.city){
      const x=b.x*W*1.45-W*0.22+shift, bw=b.w*W, bh=b.h*H*1.1;
      g.fillStyle='#151030'; g.fillRect(x,hY-bh,bw,bh);
      if(bw>24){
        const cols=Math.floor(bw/11), rows=Math.min(28,Math.floor(bh/15));
        for(let r2=0;r2<rows;r2++) for(let c2=0;c2<cols;c2++){
          const hv=hash1(b.seed+r2*13+c2*7);
          if(hv>0.55){ g.globalAlpha=.6;g.fillStyle=wcols[Math.floor(hv*30)%3]; g.fillRect(x+4+c2*11, hY-bh+5+r2*15, 4, 6);g.globalAlpha=1; }
        }
      }
      g.fillStyle=tl.edge; g.globalAlpha=0.75; g.fillRect(x,hY-bh-2,bw,2); g.globalAlpha=1;
    }
  },
  drawWater(g,tl,t){
    const hY=this.horizonY,W=this.W,H=this.H;
    const water=g.createLinearGradient(0,hY,0,H);water.addColorStop(0,'rgba(34,115,135,.34)');water.addColorStop(1,'rgba(5,18,31,.92)');
    g.fillStyle=water;
    this.quad(g,0,hY,this.sxAt(2200,-7.55),this.sy(2200),this.sxAt(26,-7.55),H,0,H);
    this.quad(g,W,hY,this.sxAt(2200,7.55),this.sy(2200),this.sxAt(26,7.55),H,W,H);
    g.strokeStyle=tl.edge2;g.lineWidth=1;
    const motionT=reducedMotion()?0:t;
    for(let i=0;i<18;i++){
      const y=hY+((i*41+motionT*19)%(H-hY)),a=.05+.1*hash1(i*17+Math.floor(motionT*2));
      g.globalAlpha=a;g.beginPath();g.moveTo(0,y);g.lineTo(W*.22,y+Math.sin(i+t)*2);g.moveTo(W*.78,y);g.lineTo(W,y+Math.cos(i+t)*2);g.stroke();
    }
    g.globalAlpha=1;
  },
  drawRock(g,x,y,s,seed,tl){
    if(s<1.1)return;const w=(3+seed*4)*s,h=(1.4+hash1(seed*12)*2.2)*s;
    g.fillStyle='#171022';g.beginPath();g.moveTo(x-w,y);g.lineTo(x-w*.8,y-h*.65);g.lineTo(x-w*.25,y-h);g.lineTo(x+w*.1,y-h*.75);g.lineTo(x+w*.65,y-h*.9);g.lineTo(x+w,y);g.closePath();g.fill();
    g.strokeStyle=tl.edge;g.globalAlpha=.3;g.lineWidth=Math.max(1,.11*s);g.stroke();g.globalAlpha=1;
  },
  drawLighthouse(g,x,y,s,seed,tl){
    if(s<1.2)return;const h=Math.min(90,(7+seed*3)*s),w=Math.min(22,1.5*s),top=y-h;
    g.fillStyle='#ece5d7';g.beginPath();g.moveTo(x-w*.55,y);g.lineTo(x-w*.34,top);g.lineTo(x+w*.34,top);g.lineTo(x+w*.55,y);g.closePath();g.fill();
    g.fillStyle=tl.edge;g.fillRect(x-w*.4,top+h*.28,w*.8,Math.max(2,h*.12));
    g.fillStyle='#28223a';g.fillRect(x-w*.5,top-h*.12,w,h*.14);
    if(state.settings.glowEffects){g.fillStyle=tl.dash;g.shadowColor=tl.dash;g.shadowBlur=Math.min(18,s*1.5);g.beginPath();g.arc(x,top-h*.12,Math.max(2,s*.35),0,7);g.fill();g.shadowBlur=0;}
  },
  drawWindmill(g,x,y,s,seed,tl){
    if(s<1.1)return;const h=Math.min(80,(7+seed*4)*s),top=y-h*.5,hubY=y-h;
    g.strokeStyle='#121020';g.lineWidth=Math.max(1,.18*s);g.beginPath();g.moveTo(x, y);g.lineTo(x,hubY);g.stroke();
    g.save();g.translate(x,hubY);g.rotate(reducedMotion()?0:sim.clock*(.25+seed*.1));g.strokeStyle=tl.edge2;g.lineWidth=Math.max(1,.16*s);
    for(let i=0;i<3;i++){g.rotate(Math.PI*2/3);g.beginPath();g.moveTo(0,0);g.lineTo(0,-Math.min(28,2.8*s));g.stroke();}g.restore();
  },
  drawBridge(g,z,s,tl){
    if(s<1.2)return;const left=this.sxAt(z,-8.4),right=this.sxAt(z,8.4),y=this.sy(z),arch=Math.min(this.H*.34,4.2*s);
    g.strokeStyle='#111027';g.lineWidth=Math.max(2,.42*s);g.beginPath();g.moveTo(left,y);g.quadraticCurveTo(this.W/2,y-arch*1.5,right,y);g.stroke();
    g.strokeStyle=tl.edge;g.globalAlpha=.8;g.lineWidth=Math.max(1,.12*s);g.beginPath();g.moveTo(left,y-1.5*s);g.quadraticCurveTo(this.W/2,y-arch*1.5-1.5*s,right,y-1.5*s);g.stroke();g.globalAlpha=1;
    for(const x of [left,right]){g.fillStyle=tl.edge2;g.fillRect(x-.18*s,y-2.2*s,.36*s,2.2*s);}
  },
  drawGrid(g,tl){
    const W=this.W, H=this.H, hY=this.horizonY;
    const vpX=W/2+this.curveOff(2200)*this.f/2200;
    g.strokeStyle=tl.grid+'1)'; g.lineWidth=1;
    for(let i=1;i<=14;i++){
      const wz=i*70-(sim.travel%70);
      if(wz<40) continue;
      const y=this.sy(wz); if(y>H+40) continue;
      g.globalAlpha=0.05+0.28*(1-wz/2300);
      g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke();
    }
    g.globalAlpha=0.13;
    for(let k=-14;k<=14;k++){
      g.beginPath(); g.moveTo(vpX+k*6,hY); g.lineTo(W/2+k*W*0.085,H+30); g.stroke();
    }
    g.globalAlpha=1;
  },
  quad(g,x1,y1,x2,y2,x3,y3,x4,y4){
    g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.lineTo(x3,y3); g.lineTo(x4,y4); g.closePath(); g.fill();
  },
  drawRoad(g,tl){
    const zs=[]; for(let z=2200; z>26; z*=0.87) zs.push(z); zs.push(26);
    for(let i=zs.length-1;i>=1;i--){
      const zF=zs[i], zN=zs[i-1];
      const yF=this.sy(zF), yN=this.sy(zN);
      const shade=Math.floor((sim.travel+zN)/9)%2;
      g.fillStyle=shade?tl.roadA:tl.roadB;
      this.quad(g,this.sxAt(zF,-7.5),yF,this.sxAt(zF,7.5),yF,this.sxAt(zN,7.5),yN,this.sxAt(zN,-7.5),yN);
      // neon edges
      g.globalAlpha=0.32; g.fillStyle=tl.edge;
      this.quad(g,this.sxAt(zF,6.85),yF,this.sxAt(zF,7.5),yF,this.sxAt(zN,7.5),yN,this.sxAt(zN,6.85),yN);
      this.quad(g,this.sxAt(zF,-7.5),yF,this.sxAt(zF,-6.85),yF,this.sxAt(zN,-6.85),yN,this.sxAt(zN,-7.5),yN);
      g.globalAlpha=0.85; g.fillStyle=tl.edge2;
      this.quad(g,this.sxAt(zF,7.02),yF,this.sxAt(zF,7.3),yF,this.sxAt(zN,7.3),yN,this.sxAt(zN,7.02),yN);
      this.quad(g,this.sxAt(zF,-7.3),yF,this.sxAt(zF,-7.02),yF,this.sxAt(zN,-7.02),yN,this.sxAt(zN,-7.3),yN);
      // lane dashes
      if(((sim.travel+zN)%9)<4.5){
        g.globalAlpha=0.75; g.fillStyle=tl.dash;
        for(const b of [-2.25,2.25])
          this.quad(g,this.sxAt(zF,b-0.12),yF,this.sxAt(zF,b+0.12),yF,this.sxAt(zN,b+0.12),yN,this.sxAt(zN,b-0.12),yN);
      }
      g.globalAlpha=1;
    }
  },
  drawWorld(g,tl,t,dt){
    const items=[];
    for(const s of sim.scenery){ const z=s.abs-sim.travel; if(z>28&&z<2200) items.push({z,k:s.type,o:s}); }
    for(const c of sim.traffic) items.push({z:c.z,k:'traffic',o:c});
    if(sim.policeCar)items.push({z:sim.policeCar.z,k:'police',o:sim.policeCar});
    for(const p of sim.packages) items.push({z:p.z,k:'pkg',o:p});
    if(sim.rival) items.push({z:sim.rival.z,k:'rival',o:sim.rival});
    items.sort((a,b)=>b.z-a.z);
    for(const it of items){
      if(it.z<=27) continue;
      const z=it.z,s=this.f/z,lateral=(it.k==='bridge'||it.k==='gate')?0:(it.k==='rival'||it.k==='police'||it.k==='pkg')?it.o.laneF:it.o.side?it.o.side*it.o.off:it.o.lane!==undefined?(it.o.lane-1)*4.5:0,x=this.sxAt(z,lateral),y=this.sy(z);
      let a=1; if(z>1700) a=1-(z-1700)/500;
      if(a<=0) continue;
      g.globalAlpha=a;
      switch(it.k){
        case 'palm': this.drawPalm(g,x,y,s,it.o.seed,tl); break;
        case 'cactus': this.drawCactus(g,x,y,s,it.o.seed,tl); break;
        case 'bldg': this.drawBldg(g,x,y,s,it.o.seed,tl); break;
        case 'sign': this.drawSign(g,x,y,s,it.o.seed,tl); break;
        case 'bill': this.drawBill(g,x,y,s,it.o.seed,tl); break;
        case 'gate': this.drawGate(g,z,s,tl); break;
        case 'diner': this.drawDiner(g,x,y,s,t); break;
        case 'rock': this.drawRock(g,x,y,s,it.o.seed,tl); break;
        case 'lighthouse': this.drawLighthouse(g,x,y,s,it.o.seed,tl); break;
        case 'windmill': this.drawWindmill(g,x,y,s,it.o.seed,tl); break;
        case 'bridge': this.drawBridge(g,z,s,tl); break;
        case 'traffic': drawCarRear(g,x,y,s,{c1:it.o.pal[0],c2:it.o.pal[1],type:it.o.type}); break;
        case 'rival': drawCarRear(g,x,y,s,{c1:'#ffd08a',c2:'#ff784f',type:'sedan',spoiler:true,rival:true}); break;
        case 'police': this.drawPoliceCar(g,x,y,s,t); break;
        case 'pkg': this.drawPkg(g,x,y,s,it.o,t); break;
      }
      g.globalAlpha=1;
    }
  },
  drawPalm(g,x,y,s,seed,tl){
    if(s<1.2) return;
    const h=(6.5+seed*2.5)*s, lean=(seed-0.5)*2.4*s;
    g.lineCap='round';
    g.strokeStyle='#100b1f'; g.lineWidth=Math.max(1,0.3*s);
    g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+lean*0.3,y-h*0.6,x+lean,y-h); g.stroke();
    const tx=x+lean, ty=y-h;
    for(let i=0;i<6;i++){
      const ang=-2.6+i*0.85+seed, len=(1.7+((seed*7+i)%1)*1.3)*s;
      g.beginPath(); g.moveTo(tx,ty);
      g.quadraticCurveTo(tx+Math.cos(ang)*len*0.6, ty+Math.sin(ang)*len*0.5-len*0.35, tx+Math.cos(ang)*len, ty+Math.sin(ang)*len*0.7+len*0.3);
      g.stroke();
    }
    if(s>5){
      g.strokeStyle=tl.edge; g.globalAlpha*=0.35; g.lineWidth=Math.max(1,0.12*s);
      g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x+lean*0.3,y-h*0.6,x+lean,y-h); g.stroke();
      g.globalAlpha/=0.35;
    }
  },
  drawBldg(g,x,y,s,seed,tl){
    if(s<.9) return;
    const h1=n=>hash1(seed*313+n), city=tl.env==='city';
    const w=(4+h1(1)*5)*s, h=(city?6+h1(2)*16:3+h1(2)*5)*s, c=[tl.edge,tl.edge2,'#FF784F','#F9D68A'][Math.floor(h1(3)*4)];
    g.fillStyle=city?'#120d2a':'#17112c'; g.fillRect(x-w/2,y-h,w,h);
    g.fillStyle=c; g.globalAlpha*=.8; g.fillRect(x-w/2,y-h-.25*s,w,.25*s); g.globalAlpha/=.8;
    if(s>2.5){ const cw=1.1*s,ch=.9*s,cols=Math.max(1,Math.floor(w/(cw*1.9))),rows=Math.max(1,Math.floor(h/(ch*2.1)));
      for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){ if(hash1(seed*91+r*7+q*3)>.4){ g.fillStyle=hash1(seed*17+r+q)>.5?'#F9D68A':c; g.globalAlpha*=.75; g.fillRect(x-w/2+(q+.5)*w/cols-cw/2,y-h+(r+.5)*h/rows-ch/2,cw,ch); g.globalAlpha/=.75; } } }
    if(!city && h1(4)>.5 && s>2){ g.fillStyle=c; g.fillRect(x-w*.2,y-h-.9*s,w*.4,.5*s); }
  },
  drawAir(g,t){
    const W=this.W,hY=this.horizonY;
    for(const a of sim.air){
      const z=Math.max(10,W*(a.k==='heli'?.016:.011));
      g.save(); g.translate(a.x*W,a.y*hY); g.scale(a.dir,1); g.fillStyle='#0c0818';
      if(a.k==='heli'){
        g.beginPath(); g.ellipse(0,0,z,z*.5,0,0,7); g.fill();
        g.fillRect(-z*2.2,-z*.12,z*1.5,z*.22); g.fillRect(-z*2.2,-z*.5,z*.18,z*.5); g.fillRect(-z*.08,-z*.75,z*.16,z*.3);
        g.strokeStyle='#0c0818'; g.lineWidth=Math.max(1,z*.08); const rl=z*1.9*Math.abs(Math.cos(t*18+a.ph));
        g.beginPath(); g.moveTo(-rl,-z*.78); g.lineTo(rl,-z*.78); g.stroke();
      } else {
        g.beginPath(); g.ellipse(0,0,z*2,z*.28,0,0,7); g.fill();
        g.beginPath(); g.moveTo(-z*.2,0); g.lineTo(-z*1.1,z*1.1); g.lineTo(-z*.5,z*1.1); g.lineTo(z*.5,0); g.fill();
        g.beginPath(); g.moveTo(-z*1.7,0); g.lineTo(-z*2.3,-z*.8); g.lineTo(-z*1.9,-z*.8); g.lineTo(-z*1.2,0); g.fill();
      }
      g.fillStyle=Math.sin(t*5+a.ph)>0?'#ff2d55':'#42dce5'; if(state.settings.glowEffects){g.shadowColor=g.fillStyle;g.shadowBlur=8;}
      g.beginPath(); g.arc(a.k==='heli'?-z*2.2:-z*1.9,a.k==='heli'?-z*.3:-z*.8,Math.max(1.2,z*.1),0,7); g.fill();
      g.restore();
    }
  },
  drawCactus(g,x,y,s,seed,tl){
    if(s<1.2)return;
    const h=(3+seed*2)*s,w=.55*s;
    g.fillStyle='#0f0a1d';g.fillRect(x-w/2,y-h,w,h);
    g.fillRect(x-w*2.1,y-h*.62,w*1.6,w*.8);g.fillRect(x-w*2.1,y-h*.62-w*1.6,w*.8,w*2.4);
    g.fillRect(x+w*.5,y-h*.45,w*1.6,w*.8);g.fillRect(x+w*1.3,y-h*.45-w*1.3,w*.8,w*2.1);
    if(s>5){g.strokeStyle=tl.edge;g.globalAlpha*=.35;g.lineWidth=Math.max(1,.1*s);g.strokeRect(x-w/2,y-h,w,h);g.globalAlpha/=.35}
  },
  drawSign(g,x,y,s,seed,tl){
    if(s<1.5) return;
    const w=1.3*s, h=(4.5+seed*2)*s;
    g.fillStyle='#0e0a20'; g.fillRect(x-w/2,y-h,w,h);
    const cols=[tl.edge,tl.edge2,'#FF784F'];
    for(let i=0;i<3;i++){
      g.fillStyle=cols[Math.floor(seed*10+i)%3];
      g.globalAlpha*=0.85;
      g.fillRect(x-w*0.28, y-h+0.5*s+i*(h-1*s)/3, w*0.56, (h-1*s)/3.6);
      g.globalAlpha/=0.85;
    }
  },
  drawBill(g,x,y,s,seed,tl){
    if(s<1.5) return;
    const h1=n=>hash1(seed*977+n), cols=[tl.edge,tl.edge2,'#FF784F','#F9D68A','#7554D9','#7DF3EF'];
    const c1=cols[Math.floor(h1(1)*6)], c2=cols[Math.floor(h1(2)*6)], st=Math.floor(h1(3)*5);
    const h=(1.7+h1(5)*1.4)*s, hy=(1.3+h1(6)*1.8)*s;
    const WD=['OUTRUN','NIGHT','DRIVE','NEON','CR++','TAPE','DINER','MOTEL','TURBO','24H','OPEN','CHROME','RADIO','FUEL','1984','SYNTH','GAS','VEGAS','PALM','LASER','COLA','ARCADE','HOTEL','MIAMI','MIDNIGHT CAFE','SUNSET BLVD','SPEED SHOP'];
    const word=WD[Math.floor(h1(7)*WD.length)];
    let fs=h*(st===3?.5:.6); g.font='700 '+fs+'px Orbitron, monospace';
    let tw=g.measureText(word).width; const pad=h*.8, k=st===4?1.35:1, maxW=(st===3?5.4:8)*s;
    let w=tw*k+pad; if(w>maxW){ const f=(maxW-pad)/(tw*k); fs*=f; tw*=f; w=maxW; }
    w=Math.max(w,h*1.6);
    const cy=y-hy-h/2, lw=Math.max(1,.09*s);
    g.strokeStyle='#0e0a20'; g.lineWidth=Math.max(1,.18*s); g.beginPath();
    if(st===3){ g.moveTo(x,y); g.lineTo(x,cy); } else { g.moveTo(x-w*.3,y); g.lineTo(x-w*.3,cy); g.moveTo(x+w*.3,y); g.lineTo(x+w*.3,cy); }
    g.stroke();
    const fl=st===1?0.65+0.35*Math.abs(Math.sin(sim.clock*(2+h1(8)*5)+seed*9)):1;
    g.globalAlpha*=fl; g.lineWidth=lw;
    if(st===3){
      const r=Math.max(h*.8,tw*.6+h*.25); g.fillStyle='#1b1436'; g.beginPath(); g.arc(x,cy,r,0,7); g.fill();
      g.strokeStyle=c1; g.stroke(); g.beginPath(); g.arc(x,cy,r*.88,0,7); g.strokeStyle=c2; g.stroke();
    } else if(st===4){
      g.fillStyle='#1b1436'; g.beginPath(); g.moveTo(x-w/2,cy-h/2); g.lineTo(x+w*.25,cy-h/2); g.lineTo(x+w/2,cy); g.lineTo(x+w*.25,cy+h/2); g.lineTo(x-w/2,cy+h/2); g.closePath(); g.fill();
      g.strokeStyle=c1; g.stroke();
    } else {
      g.fillStyle=st===1?'rgba(14,10,32,.75)':'#1b1436'; g.fillRect(x-w/2,cy-h/2,w,h);
      if(st===2){ g.fillStyle=c2; g.globalAlpha*=.35; for(let i=0;i<3;i++) g.fillRect(x-w/2,cy-h/2+i*h/3+h*.08,w,h*.12); g.globalAlpha/=.35; }
      g.strokeStyle=c1; g.strokeRect(x-w/2,cy-h/2,w,h);
      if(st!==1){ g.strokeStyle=c2; g.strokeRect(x-w/2+.2*s,cy-h/2+.2*s,w-.4*s,h-.4*s); }
    }
    if(s>3){
      g.fillStyle=c1; g.shadowColor=c1; g.shadowBlur=Math.min(10,.6*s); g.textAlign='center';
      g.font='700 '+fs+'px Orbitron, monospace'; g.fillText(word,x-(st===4?w*.11:0),cy+fs*.35); g.shadowBlur=0;
    }
    g.globalAlpha/=fl;
  },
  drawGate(g,z,s,tl){
    const W=this.W;
    const xl=this.sxAt(z,-8.6), xr=this.sxAt(z,8.6), y=this.sy(z);
    const pw=0.9*s, ph=7*s;
    g.fillStyle=tl.edge; g.globalAlpha*=0.9;
    g.fillRect(xl-pw/2,y-ph,pw,ph); g.fillRect(xr-pw/2,y-ph,pw,ph);
    g.fillStyle=tl.edge2;
    g.fillRect(Math.min(xl,xr),y-ph-0.8*s,Math.abs(xr-xl)+pw,0.8*s);
    g.globalAlpha=1;
  },
  drawDiner(g,x,y,s,t){
    if(s<1.5) return;
    const w=8*s, h=3.6*s, bx=x-w/2, by=y-h;
    g.fillStyle='#1d1636'; g.fillRect(bx,by,w,h);
    g.fillStyle='#f9d68a'; g.globalAlpha*=0.85;
    for(let i=0;i<2;i++) g.fillRect(bx+1.2*s+i*2.6*s, by+1.4*s, 1.8*s, 1.4*s);
    g.globalAlpha=1;
    for(let i=0;i<10;i++){ g.fillStyle=i%2?'#ff784f':'#f9d68a'; g.fillRect(bx+i*w/10, by-0.45*s, w/10, 0.45*s); }
    const flick=reducedMotion()?1:0.75+0.25*Math.sin(t*9+seedWave(sim));
    if(state.settings.glowEffects){g.shadowColor='#ff784f';g.shadowBlur=14;}
    g.fillStyle='rgba(255,120,79,'+flick+')';
    g.font='700 '+Math.max(7,1.1*s)+'px Orbitron, monospace'; g.textAlign='center';
    g.fillText('DINER', x, by-0.8*s);
    g.shadowBlur=0;
  },
  drawPoliceCar(g,x,y,s,t){
    drawCarRear(g,x,y,s,{c1:'#e9f2ff',c2:'#304a8f',type:'sedan',spoiler:false});
    const top=y-1.42*s;g.fillStyle='#152343';g.fillRect(x-.38*s,top,.76*s,.12*s);
    const pulse=state.settings.reduceFlashes||reducedMotion()?0.78:(.45+.55*Math.abs(Math.sin(t*8)));
    for(const [dx,c] of [[-.23*s,'#ff315b'],[.23*s,'#50dfff']]){g.globalAlpha=pulse;g.fillStyle=c;if(state.settings.glowEffects){g.shadowColor=c;g.shadowBlur=Math.min(12,s*.5);}g.fillRect(x+dx-.11*s,top-.12*s,.22*s,.12*s);g.shadowBlur=0;}
    g.globalAlpha=1;
  },
  drawPkg(g,x,y,s,p,t){
    if(s<1) return;
    const a=1.0*s, bob=reducedMotion()?0:Math.sin(t*3+p.seed)*0.25*s;
    const col={std:'#42dce5',rush:'#ff784f',energy:'#7df3ef',rare:'#e34fb9'}[p.type];
    if(p.attracted>0.04&&!reducedMotion()&&state.settings.pickupGuides){
      const px=this.sxAt(60,(sim.lanePos-1)*4.5),py=this.sy(60)-1.2*this.f/60;
      g.save();g.globalAlpha=Math.min(.5,p.attracted*.55);g.strokeStyle=col;g.lineWidth=Math.max(1,s*.025);g.setLineDash([Math.max(2,s*.1),Math.max(2,s*.12)]);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo((x+px)/2,y-22*s*.03,px,py);g.stroke();g.setLineDash([]);g.restore();
    }
    g.save(); g.translate(x, y-1.4*s+bob); g.rotate(reducedMotion()?0:Math.sin(t*1.5+p.seed)*0.25);
    if(state.settings.glowEffects){g.shadowColor=col;g.shadowBlur=Math.min(16,6*s);}
    g.fillStyle='rgba(14,10,32,0.9)'; g.fillRect(-a/2,-a/2,a,a);
    g.strokeStyle=col; g.lineWidth=Math.max(1,0.09*s); g.strokeRect(-a/2,-a/2,a,a);
    g.lineWidth=Math.max(1,0.12*s);
    g.beginPath();
    if(p.type==='energy'){ g.moveTo(a*0.12,-a*0.32); g.lineTo(-a*0.14,a*0.05); g.lineTo(a*0.05,a*0.05); g.lineTo(-a*0.1,a*0.34); }
    else if(p.type==='rare'){ g.moveTo(0,-a*0.3); g.lineTo(a*0.3,0); g.lineTo(0,a*0.3); g.lineTo(-a*0.3,0); g.closePath(); }
    else if(p.type==='rush'){ g.moveTo(-a*0.26,-a*0.24); g.lineTo(-a*0.04,0); g.lineTo(-a*0.26,a*0.24); g.moveTo(a*0.06,-a*0.24); g.lineTo(a*0.28,0); g.lineTo(a*0.06,a*0.24); }
    else { g.moveTo(0,-a*0.22); g.lineTo(0,a*0.22); g.moveTo(-a*0.22,0); g.lineTo(a*0.22,0); }
    g.stroke();
    g.restore(); g.shadowBlur=0;
  },
  drawPlayer(g,tl,t){
    const z=60, s=this.f/z;
    const x=this.sxAt(z,(sim.lanePos-1)*4.5), y=this.sy(z);
    // headlight beam
    if(!reducedMotion()){
      const tz=520, tx=this.sxAt(tz,(sim.lanePos-1)*4.5), ty=this.sy(tz), tw=3.4*this.f/tz;
      const bg=g.createLinearGradient(0,y-1.1*s,0,ty);
      bg.addColorStop(0,'rgba(249,214,138,0.14)'); bg.addColorStop(1,'rgba(249,214,138,0)');
      g.fillStyle=bg;
      g.beginPath(); g.moveTo(x-0.7*s,y-1.1*s); g.lineTo(x+0.7*s,y-1.1*s); g.lineTo(tx+tw,ty); g.lineTo(tx-tw,ty); g.closePath(); g.fill();
    }
    // underglow
    if(state.settings.glowEffects){const ug=g.createRadialGradient(x,y,0,x,y,2.4*s);ug.addColorStop(0,sim.od.active?'rgba(255,120,79,0.4)':'rgba(66,220,229,0.35)');ug.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=ug;g.beginPath();g.ellipse(x,y,2.4*s,0.55*s,0,0,7);g.fill();}
    const paint=courierPaint();
    const lean=reducedMotion()?0:clamp((sim.target-sim.lanePos)*.035,-.12,.12);
    g.save();g.translate(x,y);g.rotate(lean);
    drawCarRear(g,0,0,s,{c1:paint[0],c2:paint[1],type:'sedan',spoiler:true,brake:sim.collisionT>0,od:sim.od.active,player:true,upgrades:state.upgrades});
    g.restore();
  },
  drawWeather(g,t,tl){
    if(reducedMotion()||tl.weather==='clear')return;const W=this.W,H=this.H,hY=this.horizonY;
    if(tl.weather==='rain'){
      g.strokeStyle=state.settings.palette==='mono'?'rgba(230,230,240,.28)':'rgba(133,220,255,.34)';g.lineWidth=1;
      for(let i=0;i<42;i++){const x=hash1(i*13.7)*W,y=hY+((hash1(i*3.2)*H+(t*360+i*29))%(H-hY));g.beginPath();g.moveTo(x,y);g.lineTo(x-5,y+13);g.stroke();}
    }else if(tl.weather==='dust'){
      for(let i=0;i<24;i++){const x=hash1(i*7.31+t*.06)*W,y=hY+((hash1(i*9.7)*H+t*42)%(H-hY));g.globalAlpha=.08+hash1(i*2.3)*.12;g.fillStyle='#e9a276';g.beginPath();g.ellipse(x,y,10+hash1(i)*20,1.4,0,0,7);g.fill();}
    }else if(tl.weather==='mist'){
      const fog=g.createLinearGradient(0,hY,0,H);fog.addColorStop(0,'rgba(174,225,226,.17)');fog.addColorStop(.48,'rgba(174,225,226,.08)');fog.addColorStop(1,'rgba(174,225,226,0)');g.fillStyle=fog;g.fillRect(0,hY,W,H-hY);
    }
    g.globalAlpha=1;
  },
  drawFX(g,dt,t,tl){
    const W=this.W, H=this.H;
    const spd=visSpeed();
    if(!reducedMotion() && state.settings.speedStreaks && (spd>150||sim.od.active)){
      const inten=clamp((spd-140)/350,0,1)+(sim.od.active?0.35:0);
      g.strokeStyle=sim.od.active?'rgba(255,120,79,0.5)':'rgba(66,220,229,0.4)';
      for(const st of this.streaks){
        st.p+=dt*(0.7+inten); if(st.p>1) { st.p-=1; st.a=Math.random()*Math.PI*2; }
        const r1=st.p*Math.max(W,H)*0.75, r2=r1+40+inten*130;
        g.globalAlpha=inten*0.5*(1-st.p);
        g.lineWidth=1.5;
        g.beginPath();
        g.moveTo(W/2+Math.cos(st.a)*r1, H*0.42+Math.sin(st.a)*r1*0.7);
        g.lineTo(W/2+Math.cos(st.a)*r2, H*0.42+Math.sin(st.a)*r2*0.7);
        g.stroke();
      }
      g.globalAlpha=1;
    }
    if(sim.od.active && !reducedMotion() && !state.settings.reduceFlashes){
      const a=0.08+0.05*Math.sin(t*6);
      const rg=g.createRadialGradient(W/2,H*0.5,H*0.3,W/2,H*0.5,H*0.75);
      rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(227,79,185,'+a+')');
      g.fillStyle=rg; g.fillRect(0,0,W,H);
    }
    if(sim.ev && sim.ev.id==='police' && !state.settings.reduceFlashes && !reducedMotion()){
      const ph=Math.sin(t*8)>0;
      const lg=g.createLinearGradient(0,0,W,0);
      lg.addColorStop(0, ph?'rgba(255,45,85,0.22)':'rgba(66,120,255,0.22)');
      lg.addColorStop(0.4,'rgba(0,0,0,0)'); lg.addColorStop(0.6,'rgba(0,0,0,0)');
      lg.addColorStop(1, ph?'rgba(66,120,255,0.22)':'rgba(255,45,85,0.22)');
      g.fillStyle=lg; g.fillRect(0,0,W,H);
    }
    this.drawWeather(g,t,tl);
  },
};
function seedWave(){ return 0; }
function roundRect(g,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  g.beginPath();
  g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r);
  g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r);
  g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y);
  g.closePath();
}
function drawCarRear(g,x,y,s,o){
  if(o.type==='bike'){
    g.fillStyle='rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(x,y,.55*s,.16*s,0,0,7); g.fill();
    g.fillStyle='#0a0716'; g.fillRect(x-.1*s,y-.7*s,.2*s,.7*s);
    g.fillStyle=o.c1; g.fillRect(x-.22*s,y-1.0*s,.44*s,.45*s);
    g.fillStyle='#141028'; g.fillRect(x-.28*s,y-1.7*s,.56*s,.75*s); g.beginPath(); g.arc(x,y-1.95*s,.24*s,0,7); g.fill();
    g.shadowColor='#ff2d55'; g.shadowBlur=Math.min(12,s); g.fillStyle='#ff3355'; g.fillRect(x-.1*s,y-.95*s,.2*s,.1*s); g.shadowBlur=0;
    return;
  }
  if(o.type==='hover'){
    g.fillStyle='rgba(0,0,0,.42)';g.beginPath();g.ellipse(x,y-.08*s,1.3*s,.22*s,0,0,7);g.fill();
    const grad=g.createLinearGradient(x,y-1.25*s,x,y);grad.addColorStop(0,o.c1);grad.addColorStop(1,o.c2);g.fillStyle=grad;
    g.beginPath();g.moveTo(x-1.05*s,y-.25*s);g.lineTo(x-.76*s,y-.9*s);g.lineTo(x-.34*s,y-1.18*s);g.lineTo(x+.34*s,y-1.18*s);g.lineTo(x+.76*s,y-.9*s);g.lineTo(x+1.05*s,y-.25*s);g.lineTo(x+.8*s,y-.05*s);g.lineTo(x-.8*s,y-.05*s);g.closePath();g.fill();
    g.fillStyle='#101a33';g.beginPath();g.moveTo(x-.55*s,y-.85*s);g.lineTo(x-.28*s,y-1.08*s);g.lineTo(x+.28*s,y-1.08*s);g.lineTo(x+.55*s,y-.85*s);g.closePath();g.fill();
    for(const dx of [-.76,.76]){g.fillStyle=o.c2;if(state.settings.glowEffects){g.shadowColor=o.c2;g.shadowBlur=Math.min(12,s*.25);}g.beginPath();g.ellipse(x+dx*s,y-.04*s,.26*s,.08*s,0,0,7);g.fill();g.shadowBlur=0;}
    g.fillStyle='#ff3157';g.fillRect(x-.74*s,y-.42*s,.42*s,.12*s);g.fillRect(x+.32*s,y-.42*s,.42*s,.12*s);return;
  }
  const w=o.type==='truck'?1.35:o.type==='pickup'?1.12:o.type==='sport'?1.08:1;
  g.fillStyle='rgba(0,0,0,0.45)';
  g.beginPath(); g.ellipse(x,y,w*s*1.1,0.26*s,0,0,7); g.fill();
  g.fillStyle='#0a0716';
  g.fillRect(x-(w+0.12)*s, y-0.75*s, 0.34*s, 0.75*s);
  g.fillRect(x+(w-0.22)*s, y-0.75*s, 0.34*s, 0.75*s);
  const bh=o.type==='van'||o.type==='wagon'?1.7:o.type==='truck'?2.9:o.type==='pickup'?1.55:o.type==='sport'?.88:1.15;
  const bTop=y-bh*s;
  const grad=g.createLinearGradient(0,bTop,0,y);
  grad.addColorStop(0,o.c1); grad.addColorStop(1,o.c2);
  g.fillStyle=grad;
  roundRect(g, x-w*s, bTop, 2*w*s, (bh-0.12)*s, 0.14*s); g.fill();
  if(o.type==='truck'){
    g.fillStyle='#ff784f';
    for(let i=-2;i<=2;i++) g.fillRect(x+i*0.5*s-0.05*s, bTop+0.08*s, 0.1*s, 0.1*s);
    g.strokeStyle='rgba(0,0,0,0.4)'; g.lineWidth=Math.max(1,0.03*s);
    g.beginPath(); g.moveTo(x,y-0.3*s); g.lineTo(x,bTop+0.3*s); g.stroke();
  } else {
    g.fillStyle=o.player?'#101a33':'#141028';
    g.beginPath();
    const roofLift=o.type==='sport' ? .24 : o.type==='wagon' ? .52 : .42;
    g.moveTo(x-0.72*s, bTop+0.02*s); g.lineTo(x-0.5*s, bTop-roofLift*s);
    g.lineTo(x+0.5*s, bTop-roofLift*s); g.lineTo(x+0.72*s, bTop+0.02*s);
    g.closePath(); g.fill();
    if(o.rival){g.fillStyle='#291329';g.fillRect(x-.095*s,bTop-.38*s,.19*s,.37*s);g.fillStyle='#fff1c5';g.fillRect(x-.095*s,y-.74*s,.19*s,.1*s);g.fillStyle='#291329';g.font='700 '+Math.max(4,.16*s)+'px Orbitron, monospace';g.textAlign='center';g.fillText('84',x,y-.65*s);}
    g.strokeStyle='rgba(66,220,229,0.35)'; g.lineWidth=Math.max(1,0.03*s); g.stroke();
    g.shadowColor='#ff2d55'; g.shadowBlur=state.settings.glowEffects?Math.min(16,1.3*s):0;
    g.fillStyle=o.brake?'#ff3355':'#e0244a';
    g.fillRect(x-(w-0.16)*s, y-0.85*s, 0.5*s, 0.15*s);
    g.fillRect(x+(w-0.66)*s, y-0.85*s, 0.5*s, 0.15*s);
    if(o.player){ g.fillStyle='#ff2d55'; g.fillRect(x-0.85*s, y-1.04*s, 1.7*s, 0.12*s); }
    g.shadowBlur=0;
  }
  if(o.type==='pickup'){g.strokeStyle='#d8d8ea';g.lineWidth=Math.max(1,.05*s);g.strokeRect(x-.58*s,y-1.22*s,1.16*s,.32*s);g.beginPath();g.moveTo(x-.58*s,y-1.22*s);g.lineTo(x-.58*s,y-.9*s);g.moveTo(x+.58*s,y-1.22*s);g.lineTo(x+.58*s,y-.9*s);g.stroke();}
  if(o.spoiler){
    g.fillStyle=o.c2;
    g.fillRect(x-0.17*s, y-1.56*s, 0.1*s, 0.36*s);
    g.fillRect(x+0.07*s, y-1.56*s, 0.1*s, 0.36*s);
    g.fillRect(x-0.95*s, y-1.7*s, 1.9*s, 0.13*s);
  }
  if(o.player&&o.upgrades){
    const u=o.upgrades;
    if(u.tires>0){g.fillStyle='#8ef7ff';for(const wx of [-.95,.95]){g.beginPath();g.arc(x+wx*s,y-.39*s,Math.max(1,.105*s),0,7);g.fill();g.fillStyle='#171329';g.beginPath();g.arc(x+wx*s,y-.39*s,Math.max(1,.045*s),0,7);g.fill();g.fillStyle='#8ef7ff';}}
    if(u.solar>0){g.fillStyle='#132d4a';g.fillRect(x-.32*s,y-1.13*s,.64*s,.23*s);g.strokeStyle='#6be7e9';g.lineWidth=Math.max(1,.025*s);g.beginPath();g.moveTo(x,y-1.13*s);g.lineTo(x,y-.9*s);g.moveTo(x-.32*s,y-1.02*s);g.lineTo(x+.32*s,y-1.02*s);g.stroke();}
    if(u.gps>0){g.strokeStyle='#86f3ff';g.lineWidth=Math.max(1,.025*s);g.beginPath();g.moveTo(x,y-1.48*s);g.lineTo(x,y-1.78*s);g.stroke();g.fillStyle='#86f3ff';g.beginPath();g.arc(x,y-1.8*s,Math.max(1,.055*s),0,7);g.fill();}
    if(u.cassette>0){g.fillStyle='#201333';g.fillRect(x-.28*s,y-.58*s,.56*s,.2*s);g.strokeStyle='#ff70cf';g.lineWidth=Math.max(1,.025*s);g.strokeRect(x-.28*s,y-.58*s,.56*s,.2*s);for(const q of [-.14,.14]){g.beginPath();g.arc(x+q*s,y-.48*s,.045*s,0,7);g.stroke();}}
    if(u.gearbox>0){g.strokeStyle='#a7fcff';g.lineWidth=Math.max(1,.045*s);for(const dx of [-.42,.42]){g.beginPath();g.moveTo(x+dx*s,y-.3*s);g.lineTo(x+dx*s*.78,y-.14*s);g.stroke();}}
    if(u.chrome>0){g.fillStyle='#dceaff';for(const dx of [-.34,.34]){g.fillRect(x+(dx-.09)*s,y-.18*s,.18*s,.09*s);if(state.settings.glowEffects){g.shadowColor='#c8faff';g.shadowBlur=Math.min(9,s*.14);g.fillRect(x+(dx-.09)*s,y-.18*s,.18*s,.09*s);g.shadowBlur=0;}}}
    if(u.turbo>0){g.strokeStyle='#ffb77e';g.lineWidth=Math.max(1,.05*s);for(const dx of [-.67,.67]){g.beginPath();g.moveTo(x+dx*s,y-.72*s);g.lineTo(x+dx*.82*s,y-.63*s);g.lineTo(x+dx*s,y-.54*s);g.stroke();}}
    if(u.nos>0&&o.od&&!reducedMotion()){g.globalAlpha=.75;g.fillStyle='#72edff';g.beginPath();g.moveTo(x-.42*s,y-.38*s);g.lineTo(x-.23*s,y-.38*s);g.lineTo(x-.33*s,y+.24*s);g.closePath();g.fill();g.beginPath();g.moveTo(x+.23*s,y-.38*s);g.lineTo(x+.42*s,y-.38*s);g.lineTo(x+.33*s,y+.24*s);g.closePath();g.fill();g.globalAlpha=1;}
  }
  if(o.od && !reducedMotion()){
    g.globalCompositeOperation='lighter';
    for(const ex of [-0.55,0.55]){
      const fl=(0.5+Math.random()*0.9)*s;
      g.fillStyle=Math.random()<0.5?'rgba(255,140,60,0.9)':'rgba(120,240,255,0.9)';
      g.beginPath(); g.moveTo(x+ex*s-0.12*s,y-0.5*s); g.lineTo(x+ex*s+0.12*s,y-0.5*s); g.lineTo(x+ex*s,y-0.5*s+fl); g.closePath(); g.fill();
    }
    g.globalCompositeOperation='source-over';
  }
}

/* ---------------- ICONS ---------------- */
const I = {
  credit:'<svg viewBox="0 0 24 24"><path d="M12 2l8 5v10l-8 5-8-5V7z"/><path d="M12 7v10M9 9.5h4.2a2 2 0 1 1 0 4H9"/></svg>',
  bolt:'<svg viewBox="0 0 24 24"><path d="M13 2L5 14h5l-1 8 8-12h-5z"/></svg>',
  box:'<svg viewBox="0 0 24 24"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 5.9L12 16.4 6.6 19.3l1.2-5.9L3.4 9.3l6-.7z"/></svg>',
  tape:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2"/><circle cx="15.5" cy="12" r="2"/><path d="M8.5 14h7"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1"/></svg>',
  gauge:'<svg viewBox="0 0 24 24"><path d="M5 19a9 9 0 1 1 14 0"/><path d="M12 15l4.5-5.5"/><circle cx="12" cy="15" r="1.4"/></svg>',
  tires:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M12 15v5M4 12h5M15 12h5"/></svg>',
  gps:'<svg viewBox="0 0 24 24"><path d="M12 2l7 9-7 11-7-11z"/><circle cx="12" cy="11" r="2.4"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
  exhaust:'<svg viewBox="0 0 24 24"><path d="M3 9h9M3 13h9M12 7v8"/><circle cx="17" cy="9" r="1.4"/><circle cx="20" cy="13" r="1.8"/><circle cx="16.5" cy="16.5" r="1.2"/></svg>',
  wheel:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2"/><path d="M12 3.5V10M4.5 15.5L10 13M19.5 15.5L14 13"/></svg>',
  chip:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  drone:'<svg viewBox="0 0 24 24"><rect x="9" y="9" width="6" height="6"/><path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></svg>',
  atom:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(-60 12 12)"/></svg>',
  compass:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  hourglass:'<svg viewBox="0 0 24 24"><path d="M6 3h12M6 21h12M7 3c0 5 4 5.5 4 9s-4 4-4 9M17 3c0 5-4 5.5-4 9s4 4 4 9"/></svg>',
  route:'<svg viewBox="0 0 24 24"><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 19h7a4 4 0 0 0 0-8H9a4 4 0 0 1 0-6h8"/></svg>',
  wrench:'<svg viewBox="0 0 24 24"><path d="M14.5 6.5a4.5 4.5 0 0 0-6 5.6L3 17.6V21h3.4l5.5-5.5a4.5 4.5 0 0 0 5.6-6L14 13l-3-3z"/></svg>',
  car:'<svg viewBox="0 0 24 24"><path d="M4 15l1.5-4.5A2 2 0 0 1 7.4 9h9.2a2 2 0 0 1 1.9 1.5L20 15v4h-2.5v-1.5h-11V19H4z"/><circle cx="8" cy="15.5" r="0.8"/><circle cx="16" cy="15.5" r="0.8"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',
  speaker:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  speakerOff:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  settings:'<svg viewBox="0 0 24 24"><path d="M18.97 9.84 L22.21 10.04 L22.21 13.96 L18.97 14.16 L18.46 15.41 L20.61 17.83 L17.83 20.61 L15.41 18.46 L14.16 18.97 L13.96 22.21 L10.04 22.21 L9.84 18.97 L8.59 18.46 L6.17 20.61 L3.39 17.83 L5.54 15.41 L5.03 14.16 L1.79 13.96 L1.79 10.04 L5.03 9.84 L5.54 8.59 L3.39 6.17 L6.17 3.39 L8.59 5.54 L9.84 5.03 L10.04 1.79 L13.96 1.79 L14.16 5.03 L15.41 5.54 L17.83 3.39 L20.61 6.17 L18.46 8.59Z"/><circle cx="12" cy="12" r="3.3"/></svg>',
  v_coupe:'<svg viewBox="0 0 64 28"><path d="M4 21l3-6 11-3 7-5h13l8 5 12 3 2 6h-5a5 5 0 0 0-10 0H23a5 5 0 0 0-10 0z"/><circle cx="18" cy="21" r="3.4"/><circle cx="46" cy="21" r="3.4"/><path d="M23 12l5-4h9l6 4z"/></svg>',
  v_int:'<svg viewBox="0 0 64 28"><path d="M2 21l11-8 18-3 20 5 9 2 1 4h-7a5 5 0 0 0-10 0H25a5 5 0 0 0-10 0z"/><circle cx="19" cy="21" r="3.4"/><circle cx="47" cy="21" r="3.4"/><path d="M38 9l7-2 3 2M14 13l6-3"/></svg>',
  v_cru:'<svg viewBox="0 0 64 28"><path d="M5 21c0-8 5-12 15-12h24c9 0 15 4 15 12h-7a5 5 0 0 0-10 0H22a5 5 0 0 0-10 0z"/><circle cx="17" cy="21" r="3.4"/><circle cx="47" cy="21" r="3.4"/><path d="M14 13c2-3 6-4 10-4h5v5H14zM33 9h6c4 0 7 1 9 4H33z"/></svg>',
  v_hov:'<svg viewBox="0 0 64 28"><path d="M8 19c0-7 9-11 24-11s24 4 24 11c0 2-2 3-4 3H12c-2 0-4-1-4-3z"/><path d="M42 9l6-4 1 5M14 26h36" stroke-dasharray="4 3"/></svg>',
  v_hau:'<svg viewBox="0 0 64 28"><path d="M2 21V7h24v14zM26 12h13l9 6v3h-4a5 5 0 0 0-10 0h-8z"/><circle cx="12" cy="21" r="3.4"/><circle cx="36" cy="21" r="3.4"/><circle cx="47" cy="21" r="3.4"/><path d="M6 11h14M6 15h14"/></svg>',
};
function icon(n){ return '<span class="ic">'+(I[n]||'')+'</span>'; }
function vehIcon(n){ return '<span class="vehicon ic">'+(I[n]||'')+'</span>'; }

/* ---------------- TOASTS & MODALS ---------------- */
function toast(msg, type='info', ms=3800){
  const d=document.createElement('div');
  d.className='toast '+type; d.textContent=msg;
  el('toasts').appendChild(d);
  setTimeout(()=>{ d.classList.add('out'); setTimeout(()=>d.remove(),350); }, ms);
}
let MODALCBS=[];
function modalBtns(arr){
  MODALCBS=arr.map(b=>b.fn||null);
  return '<div class="mbtns">'+arr.map((b,i)=>'<button class="btn '+(b.cls||'')+'" data-mb="'+i+'">'+b.label+'</button>').join('')+'</div>';
}
function showModal(html){
  const r=el('modalRoot');r.innerHTML='<div class="mback"></div><div class="mbox" role="dialog" aria-modal="true">'+html+'</div>';r.classList.remove('hidden');
  const first=r.querySelector('button,input,textarea,select,[tabindex]');if(first)requestAnimationFrame(()=>first.focus());
}
function closeModal(){ el('modalRoot').classList.add('hidden'); el('modalRoot').innerHTML=''; MODALCBS=[]; if(typeof state!=='undefined')saveGame(); }
el('modalRoot').addEventListener('click', e=>{
  if(e.target.classList.contains('mback')){ closeModal(); return; }
  const b=e.target.closest('[data-mb]');
  if(b){ const fn=MODALCBS[+b.dataset.mb]; AudioSys.sfx('click'); if(fn) fn(); else closeModal(); }
});

/* ---------------- PANELS ---------------- */
let PUP=[]; // panel updater bindings
function bindUpd(elRef, fn){ PUP.push({el:elRef, fn}); }
function runUpdaters(){
  for(const u of PUP){
    const v=u.fn();
    if(v && v.t!==undefined){
      if(u.el.textContent!==v.t) u.el.textContent=v.t;
      const dis=!!v.d;
      if(u.el.disabled!==dis) u.el.disabled=dis;
    } else if(typeof v==='string' && u.el.textContent!==v) u.el.textContent=v;
  }
}
function rowHTML(ic,name,lvl,desc,eff,btn){
  return '<div class="row"><span class="ric" style="color:'+ic.color+'">'+icon(ic.icon)+'</span>'
    +'<div class="rinfo"><h4>'+name+(lvl!==null?' <em>LV '+lvl+'</em>':'')+'</h4><p>'+desc+'</p><p class="reff">'+eff+'</p></div>'
    +'<div>'+btn+'</div></div>';
}
function bindBtn(sel, act, id, labelFn, disFn){
  const b=document.querySelector(sel);
  if(!b) return;
  bindUpd(b, ()=>({t:labelFn(), d:disFn()}));
}
function sortTools(kind){return '<div class="qty-tools"><span>ORDER BY</span><select data-sort="'+kind+'" aria-label="Sort '+kind+' items"><option value="recommended">Recommended</option><option value="affordable">Affordable first</option><option value="cost">Lowest cost</option><option value="value">Best value</option></select></div>';}
function sortPanel(kind,mode){
  const p=el(kind==='fleet'?'p-fleet':'p-garage');
  if(kind==='fleet'){
    const box=p.querySelector('.cards');if(!box)return;
    [...box.children].sort((a,b)=>{const va=FLEET.find(v=>a.querySelector('[data-act="fleet"]').dataset.id===v.id),vb=FLEET.find(v=>b.querySelector('[data-act="fleet"]').dataset.id===v.id);const ca=fleetCost(va),cb=fleetCost(vb);if(mode==='affordable')return (ca>state.credits)-(cb>state.credits)||vb.income-va.income;if(mode==='cost')return ca-cb;if(mode==='value')return vb.income/cb-va.income/ca;return FLEET.indexOf(va)-FLEET.indexOf(vb);}).forEach(x=>box.appendChild(x));
  }else{
    const rows=[...p.querySelectorAll(':scope > .row')];
    rows.sort((a,b)=>{const ua=GARAGE.find(u=>a.querySelector('[data-act="garage"]')?.dataset.id===u.id),ub=GARAGE.find(u=>b.querySelector('[data-act="garage"]')?.dataset.id===u.id);if(!ua||!ub)return 0;const ca=upgradeCost(ua),cb=upgradeCost(ub);if(mode==='affordable')return (ca>state.credits)-(cb>state.credits)||ca-cb;if(mode==='cost')return ca-cb;if(mode==='value'){const score=u=>{const level=state.upgrades[u.id],before=calcIncomeParts().base;state.upgrades[u.id]=level+1;const delta=calcIncomeParts().base-before;state.upgrades[u.id]=level;return delta/upgradeCost(u);};return score(ub)-score(ua);}return GARAGE.indexOf(ua)-GARAGE.indexOf(ub);});rows.forEach(x=>p.appendChild(x));
  }
}
/* ---- FLEET panel ---- */
function buildFleet(){
  const p=el('p-fleet'); PUP=[];
  let units=0; FLEET.forEach(v=>units+=state.fleet[v.id]);
  let html='<div class="phead"><h2>FLEET</h2><p>Every vehicle earns credits independently — even while you are away. Level up a vehicle type to boost all units of that type.</p>'
    +'<div class="pstats" id="fStats"></div></div>'+qtyTools()+sortTools('fleet');
  html+='<h3 class="sect">VEHICLES</h3><div class="cards">';
  for(const v of FLEET){
    const each=v.income*Math.pow(1.25,state.fleetLv[v.id]);
    html+='<div class="card"><div class="chead">'+vehIcon(v.icon)
      +'<div><h4>'+v.name+'</h4><span class="tag">'+v.tag+'</span></div><span class="owned">x'+state.fleet[v.id]+'</span></div>'
      +'<div class="cinfo"><div>Each produces <b id="fe_'+v.id+'"></b></div><div>Type total <b id="ft_'+v.id+'"></b></div><div>Level <b id="fl_'+v.id+'"></b></div><div>Next unit payback <b>'+fmt(fleetCost(v)/Math.max(.001,v.income*(1+0.20*state.auto.synth)*(1+0.25*state.prestige.workforce)*routeMult()*cachedParts.player))+'s</b></div></div>'
      +'<div class="cbtns"><button class="btn buy" data-act="fleet" data-id="'+v.id+'" id="fb_'+v.id+'"></button>'
      +'<button class="btn" data-act="fleetlv" data-id="'+v.id+'" id="flb_'+v.id+'"></button></div></div>';
  }
  html+='</div><h3 class="sect">AUTOMATION</h3>';
  for(const a of AUTO){
    const lvl=state.auto[a.id];
    html+=rowHTML({icon:a.icon,color:'#42DCE5'}, a.name, lvl, a.desc,
      lvl>0?effectAuto(a,lvl):'Inactive — purchase or level up',
      '<button class="btn buy" data-act="auto" data-id="'+a.id+'" id="ab_'+a.id+'"></button>');
  }
  const rl=state.offUp.rate, cl=state.offUp.cap, hh=l=>(3600+1800*l)/3600;
  html+='<h3 class="sect">OFFLINE EARNINGS</h3><div class="pstats" id="offNow" style="margin:0 0 10px"></div>';
  html+=rowHTML({icon:'compass',color:'#F9D68A'},'Offline Rate',rl,'Share of your income earned while the game is closed. 5% up to 100%, in 5% steps.','Now: '+(5+5*rl)+'%'+(rl<19?' &nbsp;→&nbsp; Next: <b>'+(10+5*rl)+'%</b>':''),'<button class="btn buy" data-act="off" data-id="rate" id="ob_rate"></button>');
  html+=rowHTML({icon:'hourglass',color:'#F9D68A'},'Offline Cap',cl,'Longest away time that counts. 1 hour up to 24 hours, in 30 minute steps.','Now: '+hh(cl)+'h'+(cl<46?' &nbsp;→&nbsp; Next: <b>'+hh(cl+1)+'h</b>':''),'<button class="btn buy" data-act="off" data-id="cap" id="ob_cap"></button>');
  p.innerHTML=html;
  { const sel=p.querySelector('[data-sort]'); sel.value=sortMode.fleet; sel.addEventListener('change',e=>{ sortMode.fleet=e.target.value; sortPanel('fleet',e.target.value); }); sortPanel('fleet',sortMode.fleet); }
  for(const v of FLEET){
    const fe=el('fe_'+v.id), ft=el('ft_'+v.id), fl=el('fl_'+v.id);
    bindUpd(fe, ()=>fmt(v.income*Math.pow(1.25,state.fleetLv[v.id]))+' CR/s');
    bindUpd(ft, ()=>fmt(state.fleet[v.id]*v.income*Math.pow(1.25,state.fleetLv[v.id])*(1+0.20*state.auto.synth)*(1+0.25*state.prestige.workforce)*routeMult())+' CR/s');
    bindUpd(fl, ()=>String(state.fleetLv[v.id]));
    const bb=el('fb_'+v.id), lb=el('flb_'+v.id);
    bindUpd(bb, ()=>{const q=purchaseQuote(l=>Math.ceil(v.cost*Math.pow(1.35,l)),state.fleet[v.id],1e9);return {t:'BUY '+q.label+' · '+fmt(q.shown)+' CR',d:!q.enabled};});
    bindUpd(lb, ()=>{if(state.fleetLv[v.id]>=100)return {t:'MAX LEVEL',d:true};const q=purchaseQuote(l=>Math.ceil(v.cost*3*Math.pow(1.6,l)),state.fleetLv[v.id],100);return {t:'LV+ '+q.label+' · '+fmt(q.shown)+' CR',d:!q.enabled};});
  }
  for(const a of AUTO){
    const b=el('ab_'+a.id);
    bindUpd(b, ()=>{
      if(state.auto[a.id]>=a.max) return {t:'MAX LEVEL',d:true};
      const q=purchaseQuote(l=>Math.ceil(a.base*Math.pow(a.growth,l)),state.auto[a.id],a.max);return {t:(state.auto[a.id]?'LV+ ':'BUY ')+q.label+' · '+fmt(q.shown)+' CR',d:!q.enabled};
    });
  }
  for(const k of ['rate','cap']) bindUpd(el('ob_'+k),()=>{const mx=k==='rate'?19:46,base=k==='rate'?1000:800,growth=k==='rate'?1.45:1.14;if(state.offUp[k]>=mx)return {t:'MAX LEVEL',d:true};const q=purchaseQuote(l=>Math.ceil(base*Math.pow(growth,l)),state.offUp[k],mx);return {t:'UPGRADE '+q.label+' · '+fmt(q.shown)+' CR',d:!q.enabled};});
  bindUpd(el('offNow'),()=>'OFFLINE: '+Math.round(offEff()*100)+'% RATE · '+(offCapS()/3600)+'H CAP');
  const fs=el('fStats');
  bindUpd(fs, ()=>'FLEET INCOME '+fmt(cachedParts.fleet)+' CR/S · UNITS '+units);
  runUpdaters();
}
function effectAuto(a,l){
  switch(a.id){
    case 'aod': return 'Overdrive auto-engages at 100%';
    case 'apilot': return l?'Autopilot engaged':'Requires purchase';
    case 'synth': return 'Fleet income x'+(1+0.2*l).toFixed(2);
    case 'sorting': return 'Package value x'+(1+0.1*l).toFixed(2)+' · magnet '+(2.2+0.35*l).toFixed(1)+'m';
    case 'drones': return 'Drone income '+(3*l)+' CR/s base';
    case 'qlogi': return 'All income x'+(1+0.25*l).toFixed(2);
  }
  return '';
}
/* ---- GARAGE panel ---- */
function garageImpact(u){
  const lvl=state.upgrades[u.id], beforeI=calcIncomeParts().base, beforeS=calcSpeedPure();
  state.upgrades[u.id]=lvl+1; const afterI=calcIncomeParts().base, afterS=calcSpeedPure(); state.upgrades[u.id]=lvl;
  if(afterI>beforeI) return 'Next: +'+fmt(afterI-beforeI)+' CR/s'+(beforeI>0?' · payback ~'+fmt(upgradeCost(u)/(afterI-beforeI))+'s':'');
  if(afterS>beforeS) return 'Next: +'+(afterS-beforeS).toFixed(1)+' km/s';
  return 'Next level: '+u.eff(lvl+1);
}
function courierPaint(){const total=GARAGE.reduce((n,u)=>n+state.upgrades[u.id],0);return state.settings.palette==='ocean'?['#4de2c4','#206f86']:state.settings.palette==='arcade'?['#ffe34f','#bf3fbd']:state.settings.palette==='mono'?['#e0e0ea','#777786']:TPAL[Math.floor(total/5)%TPAL.length];}
function garagePartsLabel(){const names=[['turbo','Turbo vents'],['tires','Synth rims'],['gps','Holo-GPS'],['cassette','Cassette deck'],['solar','Solar roof'],['gearbox','Quantum diffuser'],['chrome','Chrome exhaust'],['nos','NOS booster']];const on=names.filter(([id])=>state.upgrades[id]>0).map(([id,n])=>n+' Lv.'+state.upgrades[id]);return on.length?on.join(' · '):'Factory-spec courier · install an upgrade to customize your ride.';}
function drawGaragePreview(){const c=el('garagePreview');if(!c)return;const g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#171329');bg.addColorStop(1,'#0c1020');g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle='rgba(66,220,229,.13)';g.lineWidth=1;for(let y=25;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}const paint=courierPaint();drawCarRear(g,w*.5,h-7,49,{c1:paint[0],c2:paint[1],type:'sedan',spoiler:true,player:true,upgrades:state.upgrades,od:false});const name=el('garageModelName'),parts=el('garageParts');if(name)name.textContent='MK-'+Math.max(1,GARAGE.reduce((n,u)=>n+state.upgrades[u.id],0))+' COURIER';if(parts)parts.textContent=garagePartsLabel();}
function buildGarage(){
  const p=el('p-garage'); PUP=[];
  let html='<div class="phead"><h2>GARAGE</h2><p>Upgrade your active courier vehicle. Effects apply instantly to speed, income and Overdrive.</p>'
    +'<div class="pstats" id="gStats"></div></div>'
    +'<div class="garage-showcase"><canvas id="garagePreview" width="420" height="170" aria-label="Courier rear-view illustration with owned upgrades shown as fitted parts"></canvas><div class="garage-caption"><b id="garageModelName"></b><span id="garageParts"></span></div></div>'
    +qtyTools()+sortTools('garage');
  for(const u of GARAGE){
    const lvl=state.upgrades[u.id];
    html+=rowHTML(u, u.name, lvl, u.desc,
      'Now: '+u.eff(lvl)+' &nbsp;→&nbsp; '+u.eff(lvl+1)+'<br><span class="impact">'+garageImpact(u)+'</span>',
      '<button class="btn buy" data-act="garage" data-id="'+u.id+'" id="gb_'+u.id+'"></button>');
  }
  p.innerHTML=html;
  drawGaragePreview();
  { const sel=p.querySelector('[data-sort]'); sel.value=sortMode.garage; sel.addEventListener('change',e=>{ sortMode.garage=e.target.value; sortPanel('garage',e.target.value); }); sortPanel('garage',sortMode.garage); }
  for(const u of GARAGE){
    const b=el('gb_'+u.id);
    bindUpd(b, ()=>{
      if(state.upgrades[u.id]>=u.max) return {t:'MAX LEVEL',d:true};
      const q=purchaseQuote(l=>Math.ceil(u.base*Math.pow(u.growth,l)),state.upgrades[u.id],u.max);return {t:'UPGRADE '+q.label+' · '+fmt(q.shown)+' CR',d:!q.enabled};
    });
  }
  const gs=el('gStats');
  bindUpd(gs, ()=>'VEHICLE LV '+GARAGE.reduce((a,u)=>a+state.upgrades[u.id],0)+' · SPEED '+cachedSpeed.toFixed(1)+' KM/S');
  runUpdaters();
}
/* ---- ROUTES panel ---- */
function buildRoutes(){
  const p=el('p-routes'); PUP=[];
  let html='<div class="phead"><h2>ROUTES</h2><p>Assign your fleet to a delivery route. Higher routes multiply all fleet income. Routes unlock with lifetime distance and stay unlocked forever.</p>'
    +'<div class="pstats">ACTIVE MULTIPLIER x'+routeMult().toFixed(2)+'</div></div>';
  for(const r of ROUTES){
    const unlocked=state.lifetimeDistance>=r.req, active=state.route===r.id;
    html+='<div class="tcard'+(active?' active':'')+(unlocked?'':' locked')+'"><div class="yr" style="font-size:18px;color:var(--cyan)">x'+r.mult.toFixed(2)+'</div>'
      +'<div class="tinfo"><h4 style="font-family:var(--font-n);font-size:13px">'+r.name+'</h4><p>'+r.desc+'</p>'
      +'<p style="color:var(--horizon)">'+(unlocked?(active?'● ACTIVE ROUTE':'Unlocked'):'Requires '+fmt(r.req)+' km lifetime')+'</p>'+(unlocked?'':'<div class="unlock-progress" aria-label="Unlock progress"><i style="width:'+clamp(state.lifetimeDistance/Math.max(1,r.req)*100,0,100)+'%"></i></div>')+'</div>'
      +(unlocked&&!active?'<button class="btn" data-act="route" data-id="'+r.id+'">ASSIGN</button>':'')
      +'</div>';
  }
  p.innerHTML=html;
  runUpdaters();
}
/* ---- TIMELINE panel ---- */
function buildTimeline(){
  const p=el('p-timeline'); PUP=[];
  let html='<div class="phead"><h2>TIMELINE</h2><p>Travel between eras. Each timeline changes the world outside and modifies all income. Unlocked timelines are permanent — even through Dawnbreak.</p></div>';
  for(const k in TIMELINES){
    const tl=TIMELINES[k], unlocked=state.unlocked.includes(k), active=state.timeline===k;
    html+='<div class="tcard'+(active?' active':'')+(unlocked?'':' locked')+'"><div class="yr">'+tl.short+'</div>'
      +'<div class="tinfo"><h4 style="font-family:var(--font-n);font-size:13px;color:'+(active?'var(--cyan)':'inherit')+'">'+tl.name+'</h4><p>'+tl.desc+'</p>'
      +'<p style="color:var(--horizon)">'+(unlocked?('Income x'+tl.mult.toFixed(1)+(active?' · ● YOU ARE HERE':'')):'Unlocks at '+fmt(tl.unlock)+' km lifetime distance')+'</p>'+(unlocked?'':'<div class="unlock-progress"><i style="width:'+clamp(state.lifetimeDistance/Math.max(1,tl.unlock)*100,0,100)+'%"></i></div>')+'</div>'
      +(unlocked&&!active?'<button class="btn" data-act="travel" data-id="'+k+'">TRAVEL</button>':'')
      +'</div>';
  }
  html+='<div class="tcard locked"><div class="yr" style="font-size:14px">???</div><div class="tinfo"><p>'+FUTURE_TL.join(' · ')+'</p><p style="color:var(--magenta)">FUTURE EXPANSION</p></div></div>';
  const gain=tapeReward(), ready=dawnbreakReady();
  html+='<h3 class="sect">DAWNBREAK</h3><div class="dawnbox">'
    +'<p>Fold this timeline back into the cassette. Dawnbreak resets your run in exchange for <b style="color:var(--horizon)">Cassette Tapes</b> — permanent currency for the upgrades below.</p>'
    +'<div class="dawngrid"><div class="resetlist"><h5 class="h-reset">RESETS</h5><ul><li>Credits (minus Analog Memories)</li><li>Garage upgrades</li><li>Fleet &amp; automation</li><li>Run distance &amp; milestones</li><li>Active route</li></ul></div>'
    +'<div class="resetlist"><h5 class="h-keep">RETAINED</h5><ul><li>Cassette Tapes</li><li>Permanent upgrades</li><li>Unlocked timelines</li><li>Data Fragments &amp; stats</li><li>Lifetime distance</li></ul></div></div>'
    +'<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap"><div><span class="bigtape" id="dGain">+'+gain+'</span> '+icon('tape')+' TAPES ON RESET</div>'
    +'<div style="flex:1;min-width:200px"><div class="hud-sub">RUN DISTANCE <span id="dDist">'+fmt(state.distance)+'</span> / '+fmt(CONFIG.prestigeThreshold)+' KM</div>'
    +'<div id="odBar" style="margin-top:6px"><i id="dFill" style="display:block;height:100%;background:linear-gradient(90deg,var(--purple),var(--sunset));width:'+clamp(state.distance/CONFIG.prestigeThreshold*100,0,100)+'%"></i></div></div>'
    +'<button class="btn warn big" data-act="dawnbreak" id="dBtn"></button></div></div>';
  html+='<h3 class="sect">PERMANENT UPGRADES</h3>';
  for(const pr of PRESTIGE){
    const lvl=state.prestige[pr.id];
    html+=rowHTML({icon:pr.icon,color:'#F9D68A'}, pr.name, lvl, pr.desc(pr.levelDesc||0),
      'Now: '+pr.desc(lvl)+' → Next: <b>'+pr.desc(lvl+1)+'</b>',
      '<button class="btn buy" data-act="prestigebuy" data-id="'+pr.id+'" id="pb_'+pr.id+'"></button>');
  }
  p.innerHTML=html;
  const db=el('dBtn');
  bindUpd(db, ()=>({t: ready?('INITIATE DAWNBREAK · +'+tapeReward()):'REQUIRES '+fmt(CONFIG.prestigeThreshold)+' KM', d:!ready||tapeReward()<1}));
  for(const pr of PRESTIGE){
    const b=el('pb_'+pr.id);
    bindUpd(b, ()=>{
      if(state.prestige[pr.id]>=pr.max) return {t:'MAX LEVEL', d:true};
      const c=prestigeCost(pr);
      return {t:'LV+ · '+c+(c===1?' TAPE':' TAPES'), d:state.tapes<c};
    });
  }
  const dg=el('dGain'), dd=el('dDist'), dfl=el('dFill');
  bindUpd(dg, ()=>'+'+tapeReward());
  bindUpd(dd, ()=>fmt(state.distance));
  bindUpd(dfl, ()=>{ dfl.style.width=clamp(state.distance/CONFIG.prestigeThreshold*100,0,100)+'%'; return ''; });
  runUpdaters();
}
function doDawnbreak(){
  const gain=tapeReward();
  if(!dawnbreakReady()||gain<1){ AudioSys.sfx('deny'); return; }
  showModal('<h2>INITIATE DAWNBREAK?</h2><p>The run ends. The sun comes up. A new cassette spins.</p>'
    +'<div class="statgrid"><div>Run distance<b>'+fmt(state.distance)+' km</b></div><div>Credits to reset<b>'+fmt(state.credits)+' CR</b></div><div>Prestige reward<b>+'+gain+' tapes</b></div><div>Current tapes<b>'+fmt(state.tapes)+'</b></div></div>'
    +'<ul><li>Reset: credits, upgrades, fleet, automation, route, run distance</li>'
    +'<li>Keep: <b style="color:var(--horizon)">'+gain+' Cassette Tapes</b>, permanent upgrades, timelines, stats</li></ul>'
    +modalBtns([{label:'CANCEL'},{label:'DAWNBREAK',cls:'warn',fn:()=>{
      state.runHistory=(state.runHistory||[]).concat([{distance:state.distance,tapes:gain,timestamp:Date.now()}]).slice(-8);
      state.tapes+=gain; state.tapesEarned+=gain; state.prestigeCount++;
      state.credits=startCreditsFor(state.prestige.analog);
      for(const u of GARAGE) state.upgrades[u.id]=0;
      for(const v of FLEET){ state.fleet[v.id]=0; state.fleetLv[v.id]=0; }
      for(const a of AUTO) state.auto[a.id]=0;
      state.route='coastal'; state.distance=0; state.msIdx=0;
      sim.traffic=[];sim.packages=[];sim.boosts=[];sim.particles=[];sim.rival=null;sim.policeCar=null;sim.ev=null;
      sim.od={charge:0,active:false,t:0}; sim.collisionT=0; sim.invulnT=0;
      el('eventBanner').classList.add('hidden');
      state.newTL=false; el('tlBadge').classList.remove('on');
      saveGame(); AudioSys.sfx('prestige');
      toast('DAWNBREAK COMPLETE — +'+gain+' CASSETTE TAPES','reward',6000);
      showModal('<h2>DAWNBREAK</h2><p>The horizon resets. Your tapes are safe.</p><p style="font-family:var(--font-n);font-size:26px;color:var(--horizon)">+'+gain+' '+icon('tape')+'</p>'+modalBtns([{label:'START NEW RUN',cls:'buy'}]));
      buildTimeline();
    }}]));
}
/* ---- ACTIONS ---- */
const ACTIONS = {
  garage(id){
    const u=GARAGE.find(x=>x.id===id), q=purchaseQuote(l=>Math.ceil(u.base*Math.pow(u.growth,l)),state.upgrades[u.id],u.max);
    if(!q.enabled){AudioSys.sfx('deny');return;}
    state.credits-=q.total;state.upgrades[u.id]+=q.qty;AudioSys.sfx('buy');saveGame();buildGarage();
  },
  fleet(id){
    const v=FLEET.find(x=>x.id===id), q=purchaseQuote(l=>Math.ceil(v.cost*Math.pow(1.35,l)),state.fleet[v.id],1e9);
    if(!q.enabled){AudioSys.sfx('deny');return;}
    state.credits-=q.total;state.fleet[v.id]+=q.qty;AudioSys.sfx('buy');
    toast(q.qty+' '+v.name+(q.qty===1?' joined':'s joined')+' the fleet','reward');saveGame();buildFleet();
  },
  fleetlv(id){
    const v=FLEET.find(x=>x.id===id), q=purchaseQuote(l=>Math.ceil(v.cost*3*Math.pow(1.6,l)),state.fleetLv[v.id],100);
    if(!q.enabled){AudioSys.sfx('deny');return;}
    state.credits-=q.total;state.fleetLv[v.id]+=q.qty;AudioSys.sfx('buy');saveGame();buildFleet();
  },
  auto(id){
    const a=AUTO.find(x=>x.id===id), q=purchaseQuote(l=>Math.ceil(a.base*Math.pow(a.growth,l)),state.auto[a.id],a.max);
    if(!q.enabled){AudioSys.sfx('deny');return;}
    state.credits-=q.total;state.auto[a.id]+=q.qty;AudioSys.sfx('buy');
    if(id==='apilot') toast('AUTOPILOT INSTALLED — toggle it on the Drive screen','reward');
    saveGame();buildFleet();
  },
  route(id){
    const r=ROUTES.find(x=>x.id===id);
    if(state.lifetimeDistance<r.req){ AudioSys.sfx('deny'); return; }
    state.route=id; AudioSys.sfx('buy'); toast('Fleet assigned to '+r.name,'info'); saveGame(); buildRoutes();
  },
  travel(id){
    if(!state.unlocked.includes(id)){ AudioSys.sfx('deny'); return; }
    if(state.timeline===id) return;
    state.timeline=id; sim.scenery=[]; sim.nextSc=sim.travel+200; sim.nextGate=sim.travel+460;
    R.buildSun(); AudioSys.sfx('notify');
    toast('Timeline shifted — '+TIMELINES[id].name,'event'); saveGame(); buildTimeline();
  },
  dawnbreak(){ doDawnbreak(); },
  off(k){const mx=k==='rate'?19:46,base=k==='rate'?1000:800,growth=k==='rate'?1.45:1.14,q=purchaseQuote(l=>Math.ceil(base*Math.pow(growth,l)),state.offUp[k],mx);if(!q.enabled){AudioSys.sfx('deny');return;}state.credits-=q.total;state.offUp[k]+=q.qty;AudioSys.sfx('buy');saveGame();buildFleet();},
  prestigebuy(id){
    const pr=PRESTIGE.find(x=>x.id===id), c=prestigeCost(pr);
    if(state.prestige[id]>=pr.max||state.tapes<c){ AudioSys.sfx('deny'); return; }
    state.tapes-=c; state.prestige[id]++; AudioSys.sfx('buy'); saveGame(); buildTimeline();
  },
};
document.querySelectorAll('.panel').forEach(p=>{
  p.addEventListener('click', e=>{
    const q=e.target.closest('[data-qty]'); if(q){ buyMode=q.dataset.qty; document.querySelectorAll('.qty-tools button').forEach(x=>{x.classList.toggle('selected',x.dataset.qty===buyMode);x.setAttribute('aria-pressed',String(x.dataset.qty===buyMode));}); runUpdaters(); return; }
    const b=e.target.closest('[data-act]');
    if(!b) return;
    AudioSys.unlock(); AudioSys.sfx('click');
    const hadFocus=document.activeElement===b, key='[data-act="'+b.dataset.act+'"][data-id="'+b.dataset.id+'"]';
    ACTIONS[b.dataset.act] && ACTIONS[b.dataset.act](b.dataset.id);
    if(hadFocus){ const nb=p.querySelector(key); if(nb) nb.focus({preventScroll:true}); }
  });
});

/* ---------------- TABS ---------------- */
let curTab='drive';
function switchTab(name){
  curTab=name;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el('tab-'+name).classList.add('active');
  document.querySelectorAll('.ntab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));
  if(name==='fleet') buildFleet();
  else if(name==='garage') buildGarage();
  else if(name==='routes') buildRoutes();
  else if(name==='timeline'){ buildTimeline(); state.newTL=false; }
  AudioSys.sfx('click');
}
document.querySelectorAll('.ntab').forEach(t=>t.addEventListener('click',()=>{ AudioSys.unlock(); switchTab(t.dataset.tab); }));

/* ---------------- HUD / UI TICKS ---------------- */
function missionInfo(){
  if(dawnbreakReady())return {title:'DAWNBREAK READY',text:'Reset this run for '+tapeReward()+' permanent Cassette Tape'+(tapeReward()===1?'':'s'),pct:100,tab:'timeline'};
  const nextR=ROUTES.find(r=>r.req>state.lifetimeDistance);if(nextR)return {title:'ROUTE UNLOCK',text:nextR.name+' · '+fmt(nextR.req-state.lifetimeDistance)+' km to go',pct:state.lifetimeDistance/nextR.req*100,tab:'routes'};
  const nextT=Object.values(TIMELINES).find(t=>t.unlock>state.lifetimeDistance);if(nextT)return {title:'NEW TIMELINE',text:nextT.name+' · '+fmt(nextT.unlock-state.lifetimeDistance)+' km to go',pct:state.lifetimeDistance/nextT.unlock*100,tab:'timeline'};
  const milestone=MILESTONES.find(m=>m>state.distance);if(milestone)return {title:'NEXT DISTANCE MARK',text:fmt(milestone-state.distance)+' km to '+fmt(milestone)+' km',pct:state.distance/milestone*100,tab:'drive'};
  return {title:'NIGHT SHIFT',text:'Keep earning, upgrading, and delivering.',pct:100,tab:'fleet'};
}
function updateMissionUI(){const m=missionInfo(), t=el('missionText'), f=el('missionFill'), c=el('missionCard');if(t)t.textContent=m.text;if(f)f.style.width=clamp(m.pct,0,100)+'%';if(c){c.dataset.tab=m.tab;const heading=c.querySelector('b');if(heading)heading.textContent=m.title;}const h=el('hHint');if(h)h.textContent='NEXT: '+m.title;}
function nextHint(){
  if(dawnbreakReady()) return 'NEXT: DAWNBREAK IS READY';
  if(!state.auto.apilot && state.credits>=autoCost(AUTO[0])) return 'NEXT: BASIC AUTOPILOT';
  for(const v of FLEET) if(state.fleet[v.id]===0 && state.credits>=fleetCost(v)) return 'NEXT: BUY '+v.name.toUpperCase();
  const sorted=GARAGE.map(g=>({g,c:upgradeCost(g)})).sort((a,b)=>a.c-b.c)
    .find(x=>x.c<=state.credits && state.upgrades[x.g.id]<x.g.max);
  if(sorted) return 'NEXT: '+sorted.g.name.toUpperCase()+' LV'+(state.upgrades[sorted.g.id]+1);
  const nm=MILESTONES.find(m=>m>state.distance);
  return nm?('REACH '+fmt(nm)+' KM'):'KEEP DRIVING';
}
let lastSpeedTxt='';
function frameHUD(){
  document.body.classList.toggle('od',sim.od.active);
  const spd=cachedSpeed.toFixed(1);
  if(spd!==lastSpeedTxt){ el('hSpeed').textContent=spd; lastSpeedTxt=spd; }
  const pct=sim.od.active?100:sim.od.charge;
  el('odFill').style.width=pct+'%';
  el('odBar').classList.toggle('ready', !sim.od.active && pct>=100);
  const b=el('odBtn');
  const lbl=sim.od.active?'OVERDRIVE ACTIVE — '+sim.od.t.toFixed(1)+'s':(pct>=100?'ENGAGE OVERDRIVE — SPACE':'CHARGING '+Math.floor(pct)+'%');
  if(b.textContent!==lbl) b.textContent=lbl;
  const dis=sim.od.active||pct<100; if(b.disabled!==dis) b.disabled=dis;
  AudioSys.updateEngine();
}
function uiTick(){
  el('rCred').textContent=fmt(state.credits);
  updateMissionUI(); updatePauseUI();
  el('rInc').textContent=fmt(cachedIncome);
  el('rDist').textContent=fmt(state.distance);
  el('rPkg').textContent=fmt(state.packages);
  el('rTime').textContent=TIMELINES[state.timeline].short;
  el('rRep').textContent=fmt(Math.floor(state.reputation));
  el('rTapeW').classList.toggle('hidden', state.tapes<=0 && state.prestigeCount===0);
  el('rTape').textContent=String(state.tapes);
  el('hVeh').textContent='COURIER MK-'+Math.min(99,1+GARAGE.reduce((a,u)=>a+state.upgrades[u.id],0));
  { const df=dayFactor(); el('regionBadge').textContent=visualTimeline().regionName+(df===null?'':df>.5?' · ☀ SYNTHWAVE DAY':' · ☾ VAPORWAVE NIGHT'); }
  el('hMult').textContent='INCOME x'+(boostMult()*(sim.od.active?odMult():1)).toFixed(1);
  const ha=el('hAuto');
  if(state.auto.apilot){ ha.classList.remove('hidden'); ha.classList.toggle('off',!sim.autoOn); ha.textContent='AUTOPILOT: '+(sim.autoOn?'ON':'OFF'); }
  else ha.classList.add('hidden');
  const ho=el('hAutoOd');
  if(state.auto.aod){ ho.classList.remove('hidden'); ho.classList.toggle('off',!sim.autoOdOn); ho.textContent='AUTO OVERDRIVE: '+(sim.autoOdOn?'ON':'OFF'); }
  else ho.classList.add('hidden');
  const hb=el('hBoosts');
  const html=sim.boosts.map(b=>'<span class="boostchip">'+b.name+' x'+b.mult.toFixed(2)+' · '+Math.ceil(b.t)+'s</span>').join('');
  if(hb.innerHTML!==html) hb.innerHTML=html;
  const eb=el('eventBanner');
  if(sim.ev){
    eb.classList.remove('hidden');
    const names={diner:'NEON DINER', rival:'RIVAL RACER', police:'POLICE PURSUIT'};
    const descs={diner:'Drive past the diner for rewards', rival:'Avoid all collisions for '+Math.ceil(sim.ev.t)+'s', police:'Survive '+Math.ceil(sim.ev.t)+'s without touching anything'};
    el('evName').textContent=names[sim.ev.id];
    el('evDesc').textContent=descs[sim.ev.id];
    el('evFill').style.width=(sim.ev.t/sim.ev.dur*100)+'%';
  } else eb.classList.add('hidden');
  el('tlBadge').classList.toggle('on', dawnbreakReady()||state.newTL);
  if(curTab!=='drive') runUpdaters();
}
el('btnPause').addEventListener('click',togglePause);
el('missionCard').addEventListener('click',()=>{const t=el('missionCard').dataset.tab;if(t&&t!=='drive')switchTab(t);else if(dawnbreakReady())switchTab('timeline');else toast('Keep driving toward the next distance milestone','info');});
el('hHint').addEventListener('click',()=>{const t=missionInfo().tab;if(t&&t!=='drive')switchTab(t);});
el('saveStatus').addEventListener('click',()=>{saveGame();toast('Game saved','info',1200);});
el('hAuto').addEventListener('click',()=>{ if(state.auto.apilot){ sim.autoOn=!sim.autoOn; AudioSys.sfx('click'); } });
el('hAutoOd').addEventListener('click',()=>{ if(state.auto.aod){ sim.autoOdOn=!sim.autoOdOn; AudioSys.sfx('click'); } });
el('odBtn').addEventListener('click',()=>{ AudioSys.unlock(); activateOD(); });
el('lcL').addEventListener('click',()=>setLane(sim.target-1));
el('lcR').addEventListener('click',()=>setLane(sim.target+1));

/* ---------------- SETTINGS MODAL ---------------- */
const SETTING_TIPS={"master": "Overall loudness for everything. Music, effects and engine all scale with it.", "music": "Volume of the background music only.", "sfx": "Volume of pickups, crashes, Overdrive and menu sounds.", "engine": "Volume of the engine hum, which rises with your speed.", "preset": "Quick mixes that set music, effects and engine volume in one go.", "scale": "Makes all interface text bigger or smaller.", "mute": "Silences all sound. Your volume levels are kept.", "reduced": "Turns off screen shake, speed streaks and most animations. Helps with motion sickness.", "contrast": "Boosts text and panel contrast on the HUD so it is easier to read.", "flashes": "Tones down pulsing glows and full-screen event overlays, for light sensitivity.", "streaks": "The speed lines that fly past at high speed and in Overdrive. Ignored when Reduced motion is on.", "scan": "A faint retro CRT line pattern over the whole screen.", "glow": "Neon glow around lights and the HUD. Turn off for a flatter look and slightly better performance.", "guides": "The dotted lines from your car to nearby pickups. Pickups are still pulled in when this is off.", "pausemenus": "Freezes driving while a tab other than Drive is open, so traffic cannot hit you while you shop.", "pausebg": "Freezes the game while this browser tab is hidden, and disables away earnings for that time.", "controls": "How touch screens steer: swipe, on-screen arrow buttons, or tapping the left or right side. Mouse and keyboard always work.", "palette": "Changes the color scheme of the road, sky and HUD.", "track": "Which music plays. Auto follows day and night. Shuffle picks a random track on a timer.", "trackmin": "How often Shuffle switches to a new random track. Only used when Music Track is set to Shuffle.", "daynight": "The sky slowly cycles between synthwave day and vaporwave night, about every 8 minutes."};
function si(k){ return '<span class="info" tabindex="0" role="img" aria-label="'+SETTING_TIPS[k]+'" data-tip="'+SETTING_TIPS[k]+'">?</span>'; }
function openSettings(){
  const s=state.settings;
  showModal('<h2>SETTINGS</h2>'
    +'<div class="slrow"><span>MASTER VOL'+si('master')+'</span><input type="range" id="sMaster" min="0" max="1" step="0.05" value="'+s.master+'"><b id="vMaster">'+Math.round(s.master*100)+'%</b></div>'
    +'<div class="slrow"><span>MUSIC VOL'+si('music')+'</span><input type="range" id="sMusic" min="0" max="1" step="0.05" value="'+s.music+'"><b id="vMusic">'+Math.round(s.music*100)+'%</b></div>'
    +'<div class="slrow"><span>SFX VOL'+si('sfx')+'</span><input type="range" id="sSfx" min="0" max="1" step="0.05" value="'+s.sfx+'"><b id="vSfx">'+Math.round(s.sfx*100)+'%</b></div>'
    +'<div class="slrow"><span>ENGINE VOL'+si('engine')+'</span><input type="range" id="sEngine" min="0" max="1" step="0.05" value="'+s.engine+'"><b id="vEngine">'+Math.round(s.engine*100)+'%</b></div>'
    +'<div class="slrow"><label for="sAudioPreset">AUDIO PRESET'+si('preset')+'</label><select id="sAudioPreset"><option value="custom">Custom</option><option value="quiet">Quiet cruise</option><option value="balanced">Balanced</option><option value="engine">Engine forward</option></select><b></b></div>'
    +'<div class="settings-section">ACCESSIBILITY & CONTROLS</div>'
    +'<div class="slrow"><label for="sScale">TEXT SIZE'+si('scale')+'</label><input type="range" id="sScale" min="0.85" max="1.25" step="0.05" value="'+s.uiScale+'"><b id="vScale">'+Math.round(s.uiScale*100)+'%</b></div>'
    +'<label class="chkrow"><input type="checkbox" id="sMute" '+(s.muted?'checked':'')+'> Mute all audio'+si('mute')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sReduced" '+(s.reduced?'checked':'')+'> Reduced motion'+si('reduced')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sContrast" '+(s.highContrast?'checked':'')+'> High contrast HUD'+si('contrast')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sFlashes" '+(s.reduceFlashes?'checked':'')+'> Reduce pulsing flashes and event overlays'+si('flashes')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sStreaks" '+(s.speedStreaks?'checked':'')+'> Speed streaks (when motion is enabled)'+si('streaks')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sScanlines" '+(s.scanlines?'checked':'')+'> Scanline overlay'+si('scan')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sGlow" '+(s.glowEffects?'checked':'')+'> Neon glow lighting'+si('glow')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sGuides" '+(s.pickupGuides?'checked':'')+'> Pickup guide lines'+si('guides')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sPauseMenus" '+(s.pauseMenus?'checked':'')+'> Pause active driving while viewing menus'+si('pausemenus')+'</label>'
    +'<label class="chkrow"><input type="checkbox" id="sPauseBg" '+(s.pauseBackground?'checked':'')+'> Pause progress while this tab is hidden (disable offline earnings)'+si('pausebg')+'</label>'
    +'<div class="slrow"><label for="sControls">TOUCH CONTROL'+si('controls')+'</label><select id="sControls"><option value="swipe" '+(s.controls==='swipe'?'selected':'')+'>Swipe / arrows</option><option value="buttons" '+(s.controls==='buttons'?'selected':'')+'>On-screen arrows</option><option value="tap" '+(s.controls==='tap'?'selected':'')+'>Tap screen sides</option></select><b></b></div>'
    +'<div class="slrow"><label for="sPalette">COLOR THEME'+si('palette')+'</label><select id="sPalette"><option value="sunset" '+(s.palette==='sunset'?'selected':'')+'>Sunset</option><option value="ocean" '+(s.palette==='ocean'?'selected':'')+'>Ocean</option><option value="arcade" '+(s.palette==='arcade'?'selected':'')+'>Arcade</option><option value="mono" '+(s.palette==='mono'?'selected':'')+'>Monochrome</option></select><b></b></div>'
    +'<div class="slrow"><label for="sTrack">MUSIC TRACK'+si('track')+'</label><select id="sTrack"><option value="auto" '+(s.track==='auto'?'selected':'')+'>Auto (follows day / night)</option><option value="shuffle" '+(s.track==='shuffle'?'selected':'')+'>Shuffle (random on a timer)</option>'+Object.keys(TRACKS).map(k=>'<option value="'+k+'" '+(s.track===k?'selected':'')+'>'+TRACKS[k].name+'</option>').join('')+'</select></div>'
    +'<div class="slrow"><label for="sTrackMin">SHUFFLE EVERY'+si('trackmin')+'</label><select id="sTrackMin" '+(s.track==='shuffle'?'':'disabled')+'>'+[1,2,3,5,10,15,30].map(m=>'<option value="'+m+'" '+(s.trackMinutes===m?'selected':'')+'>'+m+' min</option>').join('')+'</select><b></b></div>'
    +'<label class="chkrow"><input type="checkbox" id="sDayNight" '+(s.dayNight?'checked':'')+'> Day / night cycle (synthwave day, vaporwave night)'+si('daynight')+'</label>'
    +'<p style="font-size:12px;opacity:.55">Progress saves automatically every 10s and when you leave. Offline earnings: '+Math.round(offEff()*100)+'% rate, capped at '+(offCapS()/3600)+'h.</p>'
    +modalBtns([
      {label:'SAVE NOW',fn:()=>{ saveGame(); toast('Game saved','info'); closeModal(); }},
      {label:'HARD RESET',cls:'warn',fn:()=>{
        showModal('<h2>ERASE EVERYTHING?</h2><p>This deletes your entire save — credits, fleet, tapes, everything. There is no undo.</p>'
          +modalBtns([{label:'KEEP MY SAVE'},{label:'ERASE ALL DATA',cls:'warn',fn:()=>{ wipeSave(); location.reload(); }}]));
      }},
      {label:'ABOUT & HELP',fn:openAbout},
      {label:'GUIDED TUTORIAL',fn:()=>openTour(0)},
      {label:'STATISTICS',fn:openStats},
      {label:'EXPORT SAVE',fn:exportSave},
      {label:'IMPORT SAVE',fn:importSave},
      {label:'CLOSE',cls:'buy',fn:closeModal},
    ])+'<p style="text-align:center;font-size:11px;opacity:.5;margin-top:14px">Made With ❤️ By <a href="https://ko-fi.com/kungpowunicorn" target="_blank" rel="noopener" style="color:inherit">KungPowUnicorn</a></p>');
  const wire=(id,key,vid)=>{ const i=el(id); i.addEventListener('input',()=>{ state.settings[key]=+i.value; el(vid).textContent=Math.round(i.value*100)+'%'; AudioSys.applyVol(); }); };
  wire('sMaster','master','vMaster');wire('sMusic','music','vMusic');wire('sSfx','sfx','vSfx');wire('sEngine','engine','vEngine');
  el('sAudioPreset').addEventListener('change',e=>{const presets={quiet:[0.3,0.45,0.25],balanced:[0.55,0.8,0.65],engine:[0.35,0.7,1]};const v=presets[e.target.value];if(!v)return;[['sMusic','music','vMusic'],['sSfx','sfx','vSfx'],['sEngine','engine','vEngine']].forEach(([id,key,label],i)=>{state.settings[key]=v[i];el(id).value=v[i];el(label).textContent=Math.round(v[i]*100)+'%';});AudioSys.applyVol();});
  el('sScale').addEventListener('input',e=>{state.settings.uiScale=+e.target.value;el('vScale').textContent=Math.round(state.settings.uiScale*100)+'%';applyVisualSettings();});
  for(const [id,key] of [['sContrast','highContrast'],['sFlashes','reduceFlashes'],['sStreaks','speedStreaks'],['sScanlines','scanlines'],['sGlow','glowEffects'],['sPauseMenus','pauseMenus'],['sPauseBg','pauseBackground'],['sDayNight','dayNight'],['sGuides','pickupGuides']])el(id).addEventListener('change',e=>{state.settings[key]=e.target.checked;applyVisualSettings();updatePauseUI();});
  el('sTrack').addEventListener('change',e=>{state.settings.track=e.target.value;el('sTrackMin').disabled=e.target.value!=='shuffle';AudioSys.shuffleAt=0;});
  el('sTrackMin').addEventListener('change',e=>{state.settings.trackMinutes=+e.target.value;AudioSys.shuffleAt=performance.now()+state.settings.trackMinutes*60000;});
  el('sControls').addEventListener('change',e=>{state.settings.controls=e.target.value;applyVisualSettings();});
  el('sPalette').addEventListener('change',e=>{state.settings.palette=e.target.value;applyVisualSettings();R.stageKey='';if(curTab==='garage')drawGaragePreview();});
  el('sMute').addEventListener('change',e=>{ state.settings.muted=e.target.checked; AudioSys.applyVol(); syncAudioBtn(); });
  el('sReduced').addEventListener('change',e=>{state.settings.reduced=e.target.checked;applyVisualSettings();});
}
function openAbout(){
  showModal('<div class="about"><h2>ABOUT OUTRUN DELIVERY</h2>'+`
<p>You run an autonomous courier company on an endless neon highway. Earn credits by driving and delivering, upgrade your car, build a fleet that earns while you are away, then reset with <b>Dawnbreak</b> for permanent bonuses.</p>
<h3>CONTROLS</h3><ul><li><b>A / D</b> or <b>arrow keys</b>: change lane. On touch: tap either side of the screen, swipe, or use the on-screen arrows. With a mouse: click a lane (or anywhere on the road) to move there, drag sideways, scroll the wheel, or right-click for Overdrive.</li><li><b>SPACE</b> or the Overdrive button: engage Overdrive when the meter is full.</li><li><b>1-5</b>: switch tabs. <b>Esc</b>: close a window. <b>P</b>: pause.</li><li>The sky cycles between <b>synthwave day</b> and <b>vaporwave night</b> about every 8 minutes. Pick a music track, set the music to shuffle on a timer, or turn the cycle off in Settings.</li></ul>
<h3>TOP BAR</h3><ul><li><b>Credits</b>: your money. <b>/S</b>: income per second, including every multiplier. <b>KM</b>: distance this run.</li><li><b>Box</b>: packages collected. <b>Era</b>: current timeline. <b>Star</b>: reputation, +0.5% income per point. <b>Tape</b>: Cassette Tapes, appears after your first Dawnbreak.</li></ul>
<h3>DRIVE HUD</h3><ul><li><b>Big number</b>: current speed in km/s. It drops after a collision and rises in Overdrive.</li><li><b>COURIER MK-n</b>: total Garage levels, a quick power rating.</li><li><b>NEXT: ...</b>: the best thing you can afford right now.</li><li><b>AUTOPILOT / AUTO OVERDRIVE</b>: appear once bought. Click to toggle.</li><li><b>Right side</b>: active boosts with timers, and your total income multiplier.</li><li><b>Pink meter</b>: Overdrive charge. It fills over time, from deliveries, Energy Cells and close calls.</li></ul>
<h3>ON THE ROAD</h3><ul><li>Blue boxes are <b>standard</b> packages, orange are <b>rush</b> (big payout), light-cyan bolts are <b>Energy Cells</b> (charge Overdrive), magenta diamonds are <b>Data Fragments</b> (+1% income each, permanent).</li><li>Cars are obstacles. A collision slows you for 3s but never costs credits.</li><li>Change lanes just before a car passes for a <b>close call</b>: bonus credits and Overdrive charge.</li><li>A <b>delivery</b> pays out automatically every 10s.</li></ul>
<h3>OVERDRIVE</h3><p>15s of x5 income and faster driving. NOS Booster and Infinite Overdrive improve it. It does not apply offline.</p>
<h3>EVENTS</h3><ul><li><b>Neon Diner</b>: drive through the lights for credits and x2 income for 30s.</li><li><b>Rival Racer</b>: survive 30s without a collision for credits, reputation and a speed bonus.</li><li><b>Police Pursuit</b>: survive 25s without touching anything. Failing costs income x0.55 for 20s. Credits are never lost.</li></ul>
<h3>TABS</h3><ul><li><b>Fleet</b>: buy vehicles that earn on their own, level them, and buy automation.</li><li><b>Routes</b>: multiply fleet income; unlocked by lifetime distance.</li><li><b>Garage</b>: upgrade your own car.</li><li><b>Timeline</b>: switch eras, and perform Dawnbreak.</li></ul>
<h3>DAWNBREAK</h3><p>At 25,000 km you can reset credits, upgrades, fleet and route for Cassette Tapes. Spend tapes on permanent upgrades. Timelines, tapes, fragments and stats are kept.</p>
<h3>OFFLINE &amp; SAVING</h3><p>The game saves every 10s and when you leave. While away you earn at your Offline Rate (starts at 5%, upgradeable to 100%) for up to your Offline Cap (starts at 1 hour, upgradeable to 24 hours). Upgrade both in the Fleet tab. Hover or tap any top-bar icon for a tooltip. Settings has Export and Import for backing up your save.</p>`+'</div>'
  +modalBtns([{label:'BACK',fn:openSettings},{label:'CLOSE',cls:'buy',fn:closeModal}]));
}
function openStats(){
  const P=calcIncomeParts(), r=(k,v)=>'<div>'+k+'<b>'+v+'</b></div>';
  const units=FLEET.reduce((a,v)=>a+state.fleet[v.id],0), gl=GARAGE.reduce((a,u)=>a+state.upgrades[u.id],0), nm=MILESTONES.find(m=>m>state.distance);
  const rows=[['Credits',fmt(state.credits)],['Income /s',fmt(cachedIncome)],['· Driver',fmt(P.player)],['· Fleet',fmt(P.fleet)],['· Drones',fmt(P.drones)],
  ['Speed',cachedSpeed.toFixed(1)+' km/s'],['Overdrive','x'+odMult().toFixed(1)+' / '+odDuration()+'s'],['Run distance',fmt(state.distance)+' km'],['Lifetime distance',fmt(state.lifetimeDistance)+' km'],
  ['Next milestone',nm?fmt(nm)+' km':'none'],['Deliveries',fmt(state.deliveries)],['Packages',fmt(state.packages)],['Data fragments',fmt(state.fragments)+' (+'+Math.floor(state.fragments)+'%)'],
  ['Reputation',fmt(Math.floor(state.reputation))+' (+'+(0.5*Math.floor(state.reputation)).toFixed(1)+'%)'],['Fleet vehicles',units],['Garage levels',gl],['Route','x'+routeMult().toFixed(2)],
  ['Era',TIMELINES[state.timeline].short],['Timelines',state.unlocked.length+'/'+Object.keys(TIMELINES).length],['Offline rate',Math.round(offEff()*100)+'%'],['Offline cap',(offCapS()/3600)+'h'],
  ['Overdrives used',fmt(state.stats.odUses)],['Close calls',fmt(state.stats.closeCalls)],['Collisions',fmt(state.stats.collisions)],['Events won',fmt(state.stats.eventsWon)],
  ['Dawnbreaks',fmt(state.prestigeCount)],['Tapes held',state.tapes],['Tapes earned',fmt(state.tapesEarned)],['Playtime',fmtTime(state.stats.playtime)]];
  showModal('<h2>STATISTICS</h2><div class="statgrid">'+rows.map(a=>r(a[0],a[1])).join('')+'</div><h3 class="settings-section">RECENT RUNS · DISTANCE</h3><canvas id="historyChart" width="600" height="120" aria-label="Recent run distances"></canvas><p>'+((state.runHistory||[]).length?state.runHistory.map((x,i)=>'Run '+(i+1)+': '+fmt(x.distance)+' km · +'+x.tapes+' tapes').join(' &nbsp; | &nbsp;'):'Complete a Dawnbreak to start your run history.')+'</p>'+modalBtns([{label:'BACK',fn:openSettings},{label:'CLOSE',cls:'buy',fn:closeModal}]));
  const cv=el('historyChart');if(cv){const g=cv.getContext('2d'),a=(state.runHistory||[]).map(x=>x.distance);g.clearRect(0,0,cv.width,cv.height);g.strokeStyle='#42DCE5';g.lineWidth=3;g.beginPath();const mx=Math.max(1,...a);a.forEach((v,i)=>{const x=16+i*(cv.width-32)/Math.max(1,a.length-1),y=cv.height-16-v/mx*(cv.height-32);i?g.lineTo(x,y):g.moveTo(x,y);});g.stroke();g.fillStyle='#F9D68A';a.forEach((v,i)=>{const x=16+i*(cv.width-32)/Math.max(1,a.length-1),y=cv.height-16-v/mx*(cv.height-32);g.beginPath();g.arc(x,y,4,0,7);g.fill();});}
}
function exportSave(){
  saveGame();
  const code=btoa(unescape(encodeURIComponent(JSON.stringify(state))));
  showModal('<h2>EXPORT SAVE</h2><p>Copy this code and keep it somewhere safe. Paste it into Import Save to restore your progress on any device.</p><textarea id="expTa" readonly>'+code+'</textarea>'
    +modalBtns([{label:'BACK',fn:openSettings},{label:'COPY CODE',cls:'buy',fn:()=>{ const ta=el('expTa'); ta.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(e){} if(!ok&&navigator.clipboard) navigator.clipboard.writeText(code).then(()=>toast('Save code copied','info')).catch(()=>{}); else toast(ok?'Save code copied':'Select the code and copy it manually','info'); }}]));
  el('expTa').addEventListener('focus',e=>e.target.select());
}
function importSave(){
  showModal('<h2>IMPORT SAVE</h2><p>Paste a save code exported from this game. This <b>replaces</b> your current progress.</p><textarea id="impTa" placeholder="Paste save code here"></textarea>'
    +modalBtns([{label:'BACK',fn:openSettings},{label:'IMPORT',cls:'warn',fn:()=>{
      const raw=el('impTa').value.trim(); let obj=null;
      try{ obj=JSON.parse(raw.startsWith('{')?raw:decodeURIComponent(escape(atob(raw)))); }catch(e){}
      if(!obj||typeof obj!=='object'||obj.version!==1||typeof obj.credits!=='number'){ toast('That is not a valid save code','warn'); AudioSys.sfx('deny'); return; }
      showModal('<h2>REPLACE CURRENT SAVE?</h2><p>Credits '+fmt(obj.credits)+' · lifetime '+fmt(obj.lifetimeDistance||0)+' km. Your current progress will be overwritten.</p>'
        +modalBtns([{label:'CANCEL',fn:importSave},{label:'REPLACE SAVE',cls:'warn',fn:()=>{ state=sanitize(obj); sim.travel=state.travel||0; saveGame(); location.reload(); }}]));
    }}]));
}
el('btnSettings').addEventListener('click',()=>{ AudioSys.unlock(); openSettings(); });
function syncAudioBtn(){ el('btnAudio').innerHTML=icon(state.settings.muted?'speakerOff':'speaker'); }
el('btnAudio').addEventListener('click',()=>{
  AudioSys.unlock();
  state.settings.muted=!state.settings.muted;
  AudioSys.applyVol(); syncAudioBtn();
  toast(state.settings.muted?'Audio muted':'Audio on','info',1500);
});

/* ---------------- INPUT ---------------- */
addEventListener('keydown', e=>{
  if(!el('modalRoot').classList.contains('hidden')){
    if(e.key.toLowerCase()==='escape'){closeModal();e.preventDefault();return;}
    if(e.key==='Tab'){const f=[...el('modalRoot').querySelectorAll('button:not(:disabled),input:not(:disabled),textarea,select,a[href]')];if(f.length){const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}}
    return;
  }
  if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
  AudioSys.unlock();
  const k=e.key.toLowerCase();
  if(k==='arrowleft'||k==='a'){ setLane(sim.target-1); if(curTab==='drive') e.preventDefault(); }
  else if(k==='arrowright'||k==='d'){ setLane(sim.target+1); if(curTab==='drive') e.preventDefault(); }
  else if(k===' '){const b=e.target.closest&&e.target.closest('button,a,select');if(b&&curTab!=='drive')return;if(!gameStopped())activateOD();e.preventDefault();}
  else if(k==='p'){togglePause();e.preventDefault();}
  else if(k==='escape') closeModal();
  else if(['1','2','3','4','5'].includes(k)) switchTab(['drive','fleet','routes','garage','timeline'][+k-1]);
});
let tStart=null;
el('hw').addEventListener('pointerdown', e=>{ AudioSys.unlock(); tStart={x:e.clientX,y:e.clientY}; });
function laneAtX(x){ let b=1,bd=1e9; for(let l=0;l<3;l++){ const d=Math.abs(R.sxAt(60,(l-1)*4.5)-x); if(d<bd){ bd=d; b=l; } } return b; }
el('hw').addEventListener('wheel',e=>{ if(curTab!=='drive'||gameStopped()) return; e.preventDefault(); const n=performance.now(); if(n-(laneAtX.w||0)<140) return; laneAtX.w=n; setLane(sim.target+(e.deltaY>0?1:-1)); },{passive:false});
el('hw').addEventListener('contextmenu',e=>{ e.preventDefault(); AudioSys.unlock(); if(!gameStopped()) activateOD(); });
el('hw').addEventListener('pointerup', e=>{
  if(!tStart)return;const dx=e.clientX-tStart.x,dy=e.clientY-tStart.y,scheme=state.settings.controls;
  if(e.pointerType==='mouse'&&Math.abs(dx)<16&&Math.abs(dy)<16){ if(!gameStopped()) setLane(laneAtX(e.clientX)); }
  else if((scheme!=='buttons'||e.pointerType==='mouse')&&Math.abs(dx)>28&&Math.abs(dx)>Math.abs(dy))setLane(sim.target+(dx>0?1:-1));
  else if(scheme==='tap'&&Math.abs(dx)<16&&Math.abs(dy)<16)setLane(sim.target+(e.clientX<R.W/2?-1:1));
  tStart=null;
});
addEventListener('pointerdown', ()=>AudioSys.unlock(), {once:false});

/* ---------------- BACKGROUND / OFFLINE ---------------- */
let hiddenAt=Date.now(), lastFrame=performance.now();
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){ hiddenAt=Date.now(); saveGame(); }
  else{
    const gap=(state.settings.pauseBackground||gameStopped())?0:clamp((Date.now()-hiddenAt)/1000, 0, offCapS());
    if(gap>5){
      const parts=calcIncomeParts();
      const cr=parts.base*gap*offEff();
      const dk=calcSpeedPure()*gap*offEff();
      state.credits+=cr; state.distance+=dk; state.lifetimeDistance+=dk;
      state.deliveries+=Math.floor(gap/CONFIG.deliveryInterval);
      if(gap>60) toast('Back online — +'+fmt(cr)+' CR earned in the background','reward',5000);
      state.lastSavedAt=Date.now(); saveGame(); // consume this away interval immediately; prevents duplicate earnings after a quick reload
    }
    lastFrame=performance.now();
  }
});
addEventListener('beforeunload', saveGame);
function applyOffline(){
  if(state.settings.pauseBackground) return;
  const gap=clamp((Date.now()-state.lastSavedAt)/1000, 0, offCapS());
  if(gap<90) return;
  const parts=calcIncomeParts();
  const cr=parts.base*gap*offEff();
  const dk=calcSpeedPure()*gap*offEff();
  const del=Math.floor(gap/CONFIG.deliveryInterval);
  state.credits+=cr; state.distance+=dk; state.lifetimeDistance+=dk; state.deliveries+=del;
  showModal('<h2>WHILE YOU WERE AWAY</h2>'
    +'<div class="statgrid">'
    +'<div>Time away<b>'+fmtTime(gap)+'</b></div>'
    +'<div>Credits earned<b>'+fmt(cr)+' CR</b></div>'
    +'<div>Distance<b>'+fmt(dk)+' km</b></div>'
    +'<div>Deliveries<b>'+fmt(del)+'</b></div>'
    +'</div>'
    +'<p style="font-size:12px;opacity:.6">Offline efficiency '+Math.round(offEff()*100)+'% · capped at '+(offCapS()/3600)+'h. Upgrade your fleet to earn more while away.</p>'
    +modalBtns([{label:'COLLECT',cls:'buy',fn:closeModal}]));
  AudioSys.sfx('success');
  saveGame();
}

/* ---------------- MAIN LOOP ---------------- */
function gameStopped(){ return sim.paused || (state.settings.pauseMenus && curTab!=='drive'); }
function loop(ts){
  requestAnimationFrame(loop);
  const dtReal=Math.max(0,(ts-lastFrame)/1000); lastFrame=ts;
  if(document.hidden) return;
  try{ if(!gameStopped()) update(Math.min(dtReal,10)); }catch(e){ console.error('update',e); }
  try{ if(curTab==='drive') R.render(Math.min(dtReal,0.05), ts/1000); }
  catch(e){ console.error('render',e); R.cv.width=R.cv.width; R.cx.setTransform(R.DPR,0,0,R.DPR,0,0); }
  try{ frameHUD(); }catch(e){ console.error('hud',e); }
}

/* ---------------- INIT ---------------- */
function init(){
  document.body.classList.toggle('rm', state.settings.reduced);
  // static icons
  el('icCredit').innerHTML=I.credit; el('icBolt').innerHTML=I.bolt;
  el('icBox').innerHTML=I.box; el('icStar').innerHTML=I.star; el('icTape').innerHTML=I.tape;
  el('btnSettings').innerHTML=I.settings;syncAudioBtn();
  document.querySelectorAll('[data-ic]').forEach(s=>s.innerHTML=I[s.dataset.ic]||'');
  R.init();
  const hadSave=loadGame();
  applyVisualSettings(); syncAudioBtn();
  sim.tod=state.tod; sim.travel=state.travel||0; sim.nextSc=sim.travel+200; sim.nextGate=sim.travel+460;
  cachedParts=calcIncomeParts(); cachedIncome=cachedParts.base; cachedSpeed=calcSpeedPure();
  setInterval(saveGame,10000);
  setInterval(uiTick,250);
  requestAnimationFrame(ts=>{ lastFrame=ts; requestAnimationFrame(loop); });
  if(!hadSave){
    showModal('<h2>OUTRUN DELIVERY</h2>'
      +'<p style="color:var(--cyan);font-family:var(--font-n);font-size:12px;letter-spacing:2px">INFINITE NIGHT — NIGHT SHIFT 001</p>'
      +'<p>You run a one-car courier company on an endless neon highway.</p>'
      +'<ul><li><b>A / D</b> or <b>arrow keys</b> (or tap the screen sides) to change lanes</li>'
      +'<li>Collect <b style="color:var(--cyan)">packages</b> and dodge traffic — active driving pays</li>'
      +'<li>Fill the meter and hit <b>SPACE</b> to unleash <b style="color:var(--magenta)">OVERDRIVE</b></li>'
      +'<li>Spend credits in the <b>GARAGE</b>, grow a <b>FLEET</b>, automate everything</li>'
      +'<li>At '+fmt(CONFIG.prestigeThreshold)+' km, perform a <b style="color:var(--horizon)">DAWNBREAK</b> to earn permanent Cassette Tapes</li></ul>'
      +'<p>Your fleet keeps earning while you\'re away. See you on the road.</p>'
      +modalBtns([{label:'GUIDED TOUR',fn:()=>{AudioSys.unlock();openTour(0);}},{label:'START ENGINE',cls:'buy',fn:()=>{AudioSys.unlock();state.tutorialDone=true;saveGame();closeModal();toast('WELCOME TO THE NIGHT SHIFT','reward',4500);}}]));
  } else {
    applyOffline();
  }
}
(function setupTips(){
  const tipEl=document.createElement('div'); tipEl.id='tip'; document.body.appendChild(tipEl);
  const T=(n,t,nt)=>{ const e=typeof n==='string'?el(n):n; if(!e) return; const h=e.closest('.res')||e; h.dataset.tip=t; if(nt) h.classList.add('notap'); };
  T('rCred','CREDITS (CR): your money. Spend it in Garage, Fleet and Routes.');
  T('rInc','INCOME PER SECOND: everything you earn each second, with all multipliers.');
  T('rDist','DISTANCE (KM): how far you have driven this run. Unlocks milestones and Dawnbreak.');
  T('rPkg','PACKAGES: parcels collected on the road.');
  T('rTime','ERA: your current timeline. Each era changes the world and multiplies income.');
  T('rRep','REPUTATION: earned from events and rare packages. +0.5% income per point.');
  T('rTape','CASSETTE TAPES: permanent currency from Dawnbreak. Spend them in the Timeline tab.');
  T(el('hSpeed').parentElement,'SPEED: your driving speed in km/s. Drops after a crash, rises in Overdrive.');
  T('hVeh','COURIER MK: your total Garage level, a quick power rating.');
  T('hHint','NEXT OBJECTIVE: tap to jump to the tab that gets you there.');
  T('hMult','INCOME MULTIPLIER from active boosts and Overdrive.');
  T('odLabel','OVERDRIVE: fills over time, from deliveries, Energy Cells and close calls. Press SPACE when full.');
  T('odBar','OVERDRIVE METER: at 100% you can engage x5 income and extra speed.');
  T('hAuto','AUTOPILOT: dodges traffic and grabs packages. Click to toggle.',1);
  T('hAutoOd','AUTO OVERDRIVE: fires Overdrive as soon as the meter is full. Click to toggle.',1);
  T('btnAudio','SOUND: mute or unmute.',1); T('btnSettings','SETTINGS: audio, statistics, about, save backup.',1);
  let tt;
  function showTip(t){ tipEl.textContent=t.dataset.tip; tipEl.style.display='block'; const r=t.getBoundingClientRect(),w=tipEl.offsetWidth,h=tipEl.offsetHeight; let x=Math.max(6,Math.min(innerWidth-w-6,r.left+r.width/2-w/2)),y=r.bottom+8; if(y+h>innerHeight-6) y=r.top-h-8; tipEl.style.left=x+'px'; tipEl.style.top=Math.max(6,y)+'px'; }
  const hide=()=>{ tipEl.style.display='none'; };
  document.addEventListener('pointerover',e=>{ if(e.pointerType!=='mouse') return; const t=e.target.closest&&e.target.closest('[data-tip]'); t?showTip(t):hide(); });
  document.addEventListener('click',e=>{ if(e.target.closest&&e.target.closest('.info')) e.preventDefault(); },true);
  document.addEventListener('focusin',e=>{ const t=e.target.closest&&e.target.closest('.info'); if(t) showTip(t); });
  document.addEventListener('focusout',e=>{ if(e.target.classList&&e.target.classList.contains('info')) hide(); });
  document.addEventListener('click',e=>{ if(e.pointerType==='mouse') return; const t=e.target.closest('[data-tip]'); if(!t||t.classList.contains('notap')){ hide(); return; } showTip(t); clearTimeout(tt); tt=setTimeout(hide,3500); });
})();
init();

/* ---------------- OFFLINE / PWA ---------------- */
(function(){
  addEventListener('offline',()=>toast('OFFLINE — the game keeps running and saving on this device','info',3500));
  addEventListener('online',()=>toast('BACK ONLINE','info',2000));
  if(!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  addEventListener('load',()=>{
    const first=!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg=>{
      reg.addEventListener('updatefound',()=>{ const w=reg.installing; if(w) w.addEventListener('statechange',()=>{ if(w.state==='activated') toast(first?'READY FOR OFFLINE PLAY':'UPDATE INSTALLED — reload for the latest version','reward',5000); }); });
    }).catch(()=>{});
  });
})();
