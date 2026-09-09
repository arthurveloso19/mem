/* ==========================================================
   MEME ARENA 3D — motor do jogo
   Three.js (r128, via cdnjs) + lógica de duelo estilo TCG
   ========================================================== */

/* ---------------------------------------------------------
   1. DADOS DAS CARTAS (placeholders — trocar depois por artes reais)
   --------------------------------------------------------- */
const CARD_POOL = [
  { id:'chad',    name:'Chad Supremo',     atk:2500, def:2000, emoji:'😎', rarity:'lendario', grad:['#ff9d2f','#ff2fb0'] },
  { id:'doge',    name:'Doge Guardião',    atk:1800, def:2200, emoji:'🐕', rarity:'raro',     grad:['#ffd400','#c9a400'] },
  { id:'sapo',    name:'Sapo Sábio',       atk:1200, def:2800, emoji:'🐸', rarity:'raro',     grad:['#37f2a1','#0a8f5c'] },
  { id:'gato',    name:'Gato Caótico',     atk:2000, def:1000, emoji:'🐱', rarity:'comum',    grad:['#8a8a9a','#3a3a4a'] },
  { id:'nyan',    name:'Nyan Fúria',       atk:2200, def:1500, emoji:'🌈', rarity:'lendario', grad:['#00e5ff','#7b2fff'] },
  { id:'rage',    name:'Rage Face Fúria',  atk:2800, def:800,  emoji:'😡', rarity:'raro',     grad:['#ff2f2f','#8f0000'] },
  { id:'stonks',  name:'Stonks Guy',       atk:1600, def:1600, emoji:'📈', rarity:'comum',    grad:['#00e5ff','#005f6e'] },
  { id:'bf',      name:'Distraído BF',     atk:1400, def:1800, emoji:'👀', rarity:'comum',    grad:['#ff2fb0','#7a0a55'] },
  { id:'kid',     name:'Success Kid',      atk:2400, def:1200, emoji:'👶', rarity:'raro',     grad:['#ffd400','#ff9d2f'] },
  { id:'troll',   name:'Troll Face',       atk:1000, def:3000, emoji:'😈', rarity:'lendario', grad:['#7b2fff','#2a0a5c'] },
];

const RARITY_COLOR = { comum:'#8a8a9a', raro:'#00e5ff', lendario:'#ffd400' };

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function buildDeck(){
  // 2 cópias de cada template = 20 cartas
  let deck = [];
  CARD_POOL.forEach(tpl=>{
    deck.push({...tpl, uid:tpl.id+'_a'});
    deck.push({...tpl, uid:tpl.id+'_b'});
  });
  return shuffle(deck);
}

/* ---------------------------------------------------------
   2. DESENHO DAS CARTAS EM CANVAS (usado no 3D e na mão/HTML)
   --------------------------------------------------------- */
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

function drawCardCanvas(card){
  const W=300,H=420;
  const cv=document.createElement('canvas');
  cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');

  // fundo
  roundRect(ctx,0,0,W,H,22);
  ctx.clip();
  const grad=ctx.createLinearGradient(0,0,W,H);
  grad.addColorStop(0,card.grad[0]);
  grad.addColorStop(1,card.grad[1]);
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,W,H);

  // textura sutil (linhas diagonais)
  ctx.globalAlpha=0.06;
  ctx.strokeStyle='#000';
  for(let i=-H;i<W;i+=18){
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+H,H); ctx.stroke();
  }
  ctx.globalAlpha=1;

  // janela interna escura pro emoji
  ctx.fillStyle='rgba(5,2,14,0.55)';
  roundRect(ctx,20,20,W-40,H-160,16);
  ctx.fill();

  // emoji grande
  ctx.font='170px serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(card.emoji, W/2, H/2 - 42);

  // faixa do nome
  ctx.fillStyle='rgba(5,2,14,0.82)';
  roundRect(ctx,20,H-170,W-40,44,10);
  ctx.fill();
  ctx.fillStyle='#f2eefc';
  ctx.font='bold 22px Arial';
  ctx.textAlign='center';
  ctx.fillText(card.name, W/2, H-148, W-60);

  // faixa de raridade
  ctx.fillStyle=RARITY_COLOR[card.rarity];
  roundRect(ctx,20,H-118,W-40,22,8);
  ctx.fill();
  ctx.fillStyle='#0a0118';
  ctx.font='bold 12px Arial';
  ctx.fillText(card.rarity.toUpperCase(), W/2, H-107);

  // stats ATK / DEF
  ctx.fillStyle='rgba(5,2,14,0.82)';
  roundRect(ctx,20,H-84,W-40,64,10);
  ctx.fill();
  ctx.textAlign='left';
  ctx.font='bold 26px monospace';
  ctx.fillStyle='#ff5d5d';
  ctx.fillText('⚔ '+card.atk, 34, H-46);
  ctx.textAlign='right';
  ctx.fillStyle='#5dc8ff';
  ctx.fillText('🛡 '+card.def, W-34, H-46);

  // borda pela raridade
  ctx.globalAlpha=1;
  ctx.lineWidth=10;
  ctx.strokeStyle=RARITY_COLOR[card.rarity];
  roundRect(ctx,5,5,W-10,H-10,20);
  ctx.stroke();

  return cv;
}

function drawEmptySlotCanvas(isYours, glow){
  const W=300,H=420;
  const cv=document.createElement('canvas');
  cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='rgba(20,10,42,0.28)';
  roundRect(ctx,10,10,W-20,H-20,20);
  ctx.fill();
  ctx.setLineDash([14,10]);
  ctx.lineWidth=6;
  ctx.strokeStyle= glow ? '#ffd400' : (isYours ? 'rgba(0,229,255,0.55)' : 'rgba(255,47,176,0.4)');
  roundRect(ctx,16,16,W-32,H-32,18);
  ctx.stroke();
  ctx.setLineDash([]);
  if(isYours){
    ctx.fillStyle='rgba(0,229,255,0.55)';
    ctx.font='90px Arial';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('+', W/2, H/2-10);
  }
  return cv;
}

function highlightRingCanvas(){
  const W=300,H=420;
  const cv=document.createElement('canvas');
  cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  ctx.lineWidth=16;
  ctx.strokeStyle='#ffd400';
  ctx.shadowColor='#ffd400';
  ctx.shadowBlur=30;
  roundRect(ctx,10,10,W-20,H-20,22);
  ctx.stroke();
  return cv;
}

/* ---------------------------------------------------------
   3. CENA THREE.JS
   --------------------------------------------------------- */
const canvasEl = document.getElementById('scene-canvas');
const renderer = new THREE.WebGLRenderer({canvas:canvasEl, antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0118);
scene.fog = new THREE.FogExp2(0x0a0118, 0.045);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth/window.innerHeight, 0.1, 100);

// controle de câmera orbital simples (arraste com o mouse)
const camState = { radius:11.5, theta:0, phi:0.95, target:new THREE.Vector3(0,0,-0.3) };
function updateCameraFromState(){
  const p = camState;
  camera.position.set(
    p.target.x + p.radius*Math.sin(p.phi)*Math.sin(p.theta),
    p.target.y + p.radius*Math.cos(p.phi),
    p.target.z + p.radius*Math.sin(p.phi)*Math.cos(p.theta)
  );
  camera.lookAt(p.target);
}
updateCameraFromState();

let dragging=false, lastX=0, lastY=0;
canvasEl.addEventListener('pointerdown',(e)=>{dragging=true; lastX=e.clientX; lastY=e.clientY;});
window.addEventListener('pointerup',()=>dragging=false);
window.addEventListener('pointermove',(e)=>{
  if(!dragging) return;
  const dx=e.clientX-lastX, dy=e.clientY-lastY;
  lastX=e.clientX; lastY=e.clientY;
  camState.theta -= dx*0.005;
  camState.phi = Math.min(1.25, Math.max(0.55, camState.phi - dy*0.004));
  updateCameraFromState();
});

// luzes
scene.add(new THREE.AmbientLight(0x554a77, 0.9));
const cyanLight = new THREE.PointLight(0x00e5ff, 2.2, 22);
cyanLight.position.set(-6,5,4);
scene.add(cyanLight);
const magentaLight = new THREE.PointLight(0xff2fb0, 2.2, 22);
magentaLight.position.set(6,5,-4);
scene.add(magentaLight);
const topLight = new THREE.DirectionalLight(0xffffff, 0.55);
topLight.position.set(0,10,2);
scene.add(topLight);

// piso / arena com grade neon
function buildFloorTexture(){
  const cv=document.createElement('canvas');
  cv.width=512; cv.height=512;
  const ctx=cv.getContext('2d');
  ctx.fillStyle='#0d0524';
  ctx.fillRect(0,0,512,512);
  ctx.strokeStyle='rgba(0,229,255,0.35)';
  ctx.lineWidth=2;
  for(let i=0;i<=512;i+=32){
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(512,i); ctx.stroke();
  }
  return cv;
}
const floorTex = new THREE.CanvasTexture(buildFloorTexture());
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(6,6);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(80,80),
  new THREE.MeshStandardMaterial({map:floorTex, roughness:0.9, metalness:0.1})
);
floor.rotation.x=-Math.PI/2;
floor.position.y=-0.05;
scene.add(floor);

// mesa central
const table = new THREE.Mesh(
  new THREE.BoxGeometry(11,0.4,7.5),
  new THREE.MeshStandardMaterial({color:0x1a0f38, roughness:0.6, metalness:0.35})
);
table.position.y=-0.2;
scene.add(table);
const tableRim = new THREE.Mesh(
  new THREE.BoxGeometry(11.15,0.06,7.65),
  new THREE.MeshStandardMaterial({color:0x00e5ff, emissive:0x00e5ff, emissiveIntensity:0.6, roughness:0.4})
);
tableRim.position.y=0.02;
scene.add(tableRim);

// linha central dividindo campos
const centerLine = new THREE.Mesh(
  new THREE.BoxGeometry(10.6,0.05,0.06),
  new THREE.MeshStandardMaterial({color:0xff2fb0, emissive:0xff2fb0, emissiveIntensity:0.7})
);
centerLine.position.set(0,0.03,0);
scene.add(centerLine);

/* ---------------------------------------------------------
   4. SLOTS DE CAMPO (3 do jogador + 3 do oponente)
   --------------------------------------------------------- */
const CARD_W=1.5, CARD_H=2.1;
const SLOT_X=[-2.6,0,2.6];
const YOU_Z=1.65, CPU_Z=-1.65;

function makeSlotMesh(owner, index){
  const geo=new THREE.PlaneGeometry(CARD_W,CARD_H);
  const tex=new THREE.CanvasTexture(drawEmptySlotCanvas(owner==='you', false));
  const mat=new THREE.MeshBasicMaterial({map:tex, transparent:true, side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.x = -Math.PI/2 + (owner==='you' ? 0.55 : -0.55);
  mesh.position.set(SLOT_X[index], 0.22, owner==='you'?YOU_Z:CPU_Z);
  mesh.userData = { owner, index, card:null, attackedThisTurn:false, justSummoned:false };
  scene.add(mesh);
  return mesh;
}

// anel de destaque (fica invisível/atrás, movido para o slot ativo)
const highlightTex = new THREE.CanvasTexture(highlightRingCanvas());
const highlightMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(CARD_W*1.08,CARD_H*1.08),
  new THREE.MeshBasicMaterial({map:highlightTex, transparent:true, side:THREE.DoubleSide})
);
highlightMesh.visible=false;
scene.add(highlightMesh);

const youSlots = [0,1,2].map(i=>makeSlotMesh('you',i));
const cpuSlots = [0,1,2].map(i=>makeSlotMesh('cpu',i));
const allSlots = youSlots.concat(cpuSlots);

function refreshSlotVisual(slotMesh){
  const d = slotMesh.userData;
  const cv = d.card ? drawCardCanvas(d.card) : drawEmptySlotCanvas(d.owner==='you', false);
  slotMesh.material.map = new THREE.CanvasTexture(cv);
  slotMesh.material.needsUpdate = true;
}

function positionHighlight(slotMesh){
  highlightMesh.position.copy(slotMesh.position);
  highlightMesh.position.y += 0.01;
  highlightMesh.rotation.copy(slotMesh.rotation);
  highlightMesh.visible = true;
}
function clearHighlight(){ highlightMesh.visible=false; }

/* ---------------------------------------------------------
   5. RESIZE
   --------------------------------------------------------- */
window.addEventListener('resize',()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------------------------------------------------
   6. LOOP DE RENDER (com leve flutuação das cartas ocupadas)
   --------------------------------------------------------- */
let t=0;
function animate(){
  requestAnimationFrame(animate);
  t+=0.02;
  allSlots.forEach((s,i)=>{
    if(s.userData.card){
      s.position.y = 0.22 + Math.sin(t*1.4 + i)*0.02;
    }
  });
  renderer.render(scene, camera);
}
animate();

/* ==========================================================
   7. ESTADO DO JOGO E REGRAS
   ========================================================== */
const game = {
  turn:'you',
  turnCount:0,
  gameOver:false,
  you:{ life:8000, deck:[], hand:[], normalSummonUsed:false },
  cpu:{ life:8000, deck:[], hand:[], normalSummonUsed:false },
  selectedHandIndex:null,
  selectedAttackerSlot:null, // mesh
};

const el = {
  youLp: document.getElementById('you-lp'),
  cpuLp: document.getElementById('cpu-lp'),
  youLpBar: document.getElementById('you-lp-bar'),
  cpuLpBar: document.getElementById('cpu-lp-bar'),
  youDeckCount: document.getElementById('you-deck-count'),
  cpuDeckCount: document.getElementById('cpu-deck-count'),
  hand: document.getElementById('hand'),
  log: document.getElementById('log'),
  turnBanner: document.getElementById('turn-banner'),
  turnValue: document.getElementById('turn-value'),
  endTurnBtn: document.getElementById('end-turn-btn'),
  actionHint: document.getElementById('action-hint'),
  overlay: document.getElementById('overlay'),
  startBtn: document.getElementById('start-btn'),
  rulesBtn: document.getElementById('rules-btn'),
};

function log(msg){ el.log.textContent = msg; }

function updateHud(){
  el.youLp.textContent = game.you.life;
  el.cpuLp.textContent = game.cpu.life;
  el.youLpBar.style.width = Math.max(0,(game.you.life/8000*100))+'%';
  el.cpuLpBar.style.width = Math.max(0,(game.cpu.life/8000*100))+'%';
  el.youDeckCount.textContent = game.you.deck.length;
  el.cpuDeckCount.textContent = game.cpu.deck.length;

  el.turnBanner.className = game.turn;
  el.turnValue.textContent = game.turn==='you' ? 'SEU TURNO' : 'TURNO DO CPU';
  el.endTurnBtn.disabled = game.turn!=='you' || game.gameOver;

  renderHand();
  updateActionHint();
}

function updateActionHint(){
  if(game.gameOver){ el.actionHint.textContent=''; return; }
  if(game.turn!=='you'){ el.actionHint.textContent='Aguarde o CPU jogar...'; return; }
  if(game.selectedAttackerSlot){
    el.actionHint.textContent = 'Atacante selecionado — clique num monstro do CPU ou, se o campo dele estiver vazio, ataque direto.';
  } else if(game.selectedHandIndex!==null){
    el.actionHint.textContent = 'Carta selecionada — clique num slot vazio do seu campo para jogá-la.';
  } else {
    el.actionHint.textContent = 'Selecione uma carta da mão ou um monstro seu para atacar.';
  }
}

function renderHand(){
  el.hand.innerHTML='';
  game.you.hand.forEach((card,idx)=>{
    const div=document.createElement('div');
    div.className='hand-card'+(game.selectedHandIndex===idx?' selected':'');
    const img=document.createElement('img');
    img.src = drawCardCanvas(card).toDataURL();
    div.appendChild(img);
    div.addEventListener('click',(e)=>{
      e.stopPropagation();
      if(game.turn!=='you' || game.gameOver) return;
      if(game.you.normalSummonUsed){ log('Você já jogou uma carta neste turno.'); return; }
      game.selectedAttackerSlot=null; clearHighlight();
      game.selectedHandIndex = (game.selectedHandIndex===idx) ? null : idx;
      updateHud();
    });
    el.hand.appendChild(div);
  });
}

/* ---------- deals / draws ---------- */
function drawCard(side){
  const s = game[side];
  if(s.deck.length===0){ log((side==='you'?'Seu':'O') + ' deck está vazio!'); return; }
  s.hand.push(s.deck.pop());
}

function resetFieldFlagsForTurnStart(owner){
  const slots = owner==='you' ? youSlots : cpuSlots;
  slots.forEach(s=>{
    if(s.userData.card){
      s.userData.justSummoned=false;
      s.userData.attackedThisTurn=false;
    }
  });
}

/* ---------- jogar carta da mão ---------- */
function playCardToSlot(slotMesh){
  if(game.you.normalSummonUsed || game.selectedHandIndex===null) return;
  const card = game.you.hand[game.selectedHandIndex];
  game.you.hand.splice(game.selectedHandIndex,1);
  slotMesh.userData.card = card;
  slotMesh.userData.justSummoned = true;
  slotMesh.userData.attackedThisTurn = false;
  refreshSlotVisual(slotMesh);
  game.you.normalSummonUsed = true;
  game.selectedHandIndex = null;
  clearHighlight();
  log(`Você invocou ${card.name}!`);
  updateHud();
}

/* ---------- resolução de batalha ---------- */
function resolveBattle(attackerSlot, defenderSlot){
  const a = attackerSlot.userData.card, d = defenderSlot.userData.card;
  const aOwner = attackerSlot.userData.owner, dOwner = defenderSlot.userData.owner;
  if(a.atk > d.atk){
    const dmg = a.atk - d.atk;
    game[dOwner].life -= dmg;
    log(`${a.name} (${a.atk}) destruiu ${d.name} (${d.atk})! ${dmg} de dano.`);
    defenderSlot.userData.card=null; refreshSlotVisual(defenderSlot);
  } else if(a.atk === d.atk){
    log(`${a.name} e ${d.name} se destruíram mutuamente!`);
    attackerSlot.userData.card=null; refreshSlotVisual(attackerSlot);
    defenderSlot.userData.card=null; refreshSlotVisual(defenderSlot);
  } else {
    const dmg = d.atk - a.atk;
    game[aOwner].life -= dmg;
    log(`${d.name} (${d.atk}) destruiu ${a.name} (${a.atk})! ${dmg} de dano.`);
    attackerSlot.userData.card=null; refreshSlotVisual(attackerSlot);
  }
  attackerSlot.userData.attackedThisTurn = true;
  checkGameOver();
}

function directAttack(attackerSlot, targetOwner){
  const a = attackerSlot.userData.card;
  game[targetOwner].life -= a.atk;
  log(`${a.name} atacou diretamente! ${a.atk} de dano.`);
  attackerSlot.userData.attackedThisTurn = true;
  checkGameOver();
}

function checkGameOver(){
  if(game.you.life<=0 || game.cpu.life<=0){
    game.gameOver=true;
    const youWon = game.cpu.life<=0 && game.you.life>0;
    showGameOver(youWon);
  }
  updateHud();
}

function showGameOver(youWon){
  el.overlay.classList.remove('hidden');
  el.overlay.innerHTML = `
    <div class="result ${youWon?'win':'lose'}">${youWon?'VOCÊ VENCEU! 🏆':'VOCÊ PERDEU 💀'}</div>
    <p>${youWon?'Suas cartas meme dominaram a arena.':'O CPU memer levou a melhor desta vez.'}</p>
    <button id="restart-btn">JOGAR NOVAMENTE</button>
  `;
  document.getElementById('restart-btn').addEventListener('click', startGame);
}

/* ---------- clique na cena (raycast) ---------- */
const raycaster = new THREE.Raycaster();
const mouseNdc = new THREE.Vector2();

canvasEl.addEventListener('click',(e)=>{
  if(game.gameOver || game.turn!=='you') return;
  mouseNdc.x = (e.clientX/window.innerWidth)*2-1;
  mouseNdc.y = -(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouseNdc, camera);
  const hits = raycaster.intersectObjects(allSlots);
  if(hits.length===0){
    game.selectedAttackerSlot=null; clearHighlight(); updateHud();
    return;
  }
  const slot = hits[0].object;
  handleSlotClick(slot);
});

function handleSlotClick(slot){
  const d = slot.userData;

  // 1) jogando uma carta da mão num slot vazio seu
  if(game.selectedHandIndex!==null && d.owner==='you' && !d.card){
    playCardToSlot(slot);
    return;
  }

  // 2) selecionando um atacante (seu monstro elegível)
  if(d.owner==='you' && d.card && !d.attackedThisTurn && !d.justSummoned){
    game.selectedAttackerSlot = slot;
    game.selectedHandIndex = null;
    positionHighlight(slot);
    updateHud();
    return;
  }

  // 3) escolhendo alvo (lado do cpu) com atacante já selecionado
  if(d.owner==='cpu' && game.selectedAttackerSlot){
    const attacker = game.selectedAttackerSlot;
    if(d.card){
      resolveBattle(attacker, slot);
    } else {
      const cpuHasAnyMonster = cpuSlots.some(s=>s.userData.card);
      if(cpuHasAnyMonster){
        log('O CPU tem monstros no campo — ataque um deles primeiro.');
      } else {
        directAttack(attacker,'cpu');
      }
    }
    game.selectedAttackerSlot=null;
    clearHighlight();
    updateHud();
    return;
  }

  // clique inválido / re-clique no próprio atacante para desselecionar
  if(slot===game.selectedAttackerSlot){
    game.selectedAttackerSlot=null; clearHighlight();
  }
  updateHud();
}

/* ---------- fim de turno / turno do CPU ---------- */
el.endTurnBtn.addEventListener('click', ()=>{
  if(game.turn!=='you' || game.gameOver) return;
  game.selectedAttackerSlot=null; game.selectedHandIndex=null; clearHighlight();
  startCpuTurn();
});

function startCpuTurn(){
  game.turn='cpu';
  updateHud();
  drawCard('cpu');
  resetFieldFlagsForTurnStart('cpu');
  game.cpu.normalSummonUsed=false;
  updateHud();
  setTimeout(cpuPlayPhase, 900);
}

function cpuPlayPhase(){
  // joga a melhor carta possível num slot vazio
  const emptySlot = cpuSlots.find(s=>!s.userData.card);
  if(emptySlot && game.cpu.hand.length>0 && !game.cpu.normalSummonUsed){
    let best=0;
    for(let i=1;i<game.cpu.hand.length;i++){
      if(game.cpu.hand[i].atk>game.cpu.hand[best].atk) best=i;
    }
    const card = game.cpu.hand.splice(best,1)[0];
    emptySlot.userData.card=card;
    emptySlot.userData.justSummoned=true;
    emptySlot.userData.attackedThisTurn=false;
    refreshSlotVisual(emptySlot);
    game.cpu.normalSummonUsed=true;
    log(`CPU invocou ${card.name}!`);
    updateHud();
  }
  setTimeout(cpuAttackPhase, 1000);
}

function cpuAttackPhase(){
  const attackers = cpuSlots.filter(s=>s.userData.card && !s.userData.justSummoned && !s.userData.attackedThisTurn);
  let i=0;
  function nextAttack(){
    if(i>=attackers.length || game.gameOver){ setTimeout(endCpuTurn, 700); return; }
    const attacker = attackers[i]; i++;
    if(!attacker.userData.card){ nextAttack(); return; }
    const youMonsters = youSlots.filter(s=>s.userData.card);
    if(youMonsters.length===0){
      directAttack(attacker,'you');
    } else {
      // ataca o monstro com menor ATK do jogador
      let weakest = youMonsters[0];
      youMonsters.forEach(s=>{ if(s.userData.card.atk < weakest.userData.card.atk) weakest=s; });
      resolveBattle(attacker, weakest);
    }
    updateHud();
    setTimeout(nextAttack, 900);
  }
  nextAttack();
}

function endCpuTurn(){
  if(game.gameOver) return;
  game.turn='you';
  game.turnCount++;
  drawCard('you');
  resetFieldFlagsForTurnStart('you');
  game.you.normalSummonUsed=false;
  log('Seu turno! Jogue uma carta ou ataque.');
  updateHud();
}

/* ==========================================================
   8. INÍCIO / REINÍCIO DE PARTIDA
   ========================================================== */
function startGame(){
  el.overlay.classList.add('hidden');
  game.turn='you';
  game.turnCount=1;
  game.gameOver=false;
  game.selectedHandIndex=null;
  game.selectedAttackerSlot=null;
  clearHighlight();

  game.you.life=8000; game.cpu.life=8000;
  game.you.deck=buildDeck(); game.cpu.deck=buildDeck();
  game.you.hand=[]; game.cpu.hand=[];
  game.you.normalSummonUsed=false; game.cpu.normalSummonUsed=false;

  for(let i=0;i<5;i++){ drawCard('you'); drawCard('cpu'); }

  allSlots.forEach(s=>{
    s.userData.card=null; s.userData.attackedThisTurn=false; s.userData.justSummoned=false;
    refreshSlotVisual(s);
  });

  log('Duelo iniciado! Você começa — jogue uma carta da mão.');
  updateHud();
}

el.startBtn.addEventListener('click', startGame);

el.rulesBtn.addEventListener('click', ()=>{
  alert(
    'COMO JOGAR — MEME ARENA 3D\n\n'+
    '• Cada turno você compra 1 carta (exceto o 1º turno).\n'+
    '• Você pode jogar 1 carta da mão por turno num slot vazio do seu campo.\n'+
    '• Cada monstro pode atacar 1x por turno (não no turno em que foi invocado).\n'+
    '• Ao atacar um monstro inimigo: quem tem ATK maior destrói o outro e causa dano da diferença.\n'+
    '• Se o oponente não tiver monstros, você pode atacar diretamente os Life Points dele.\n'+
    '• Zere os 8000 LP do oponente para vencer!'
  );
});

updateHud();
