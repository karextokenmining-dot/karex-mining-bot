// Basit client-side app: localStorage ile çalışır.
// Eğer Telegram WebApp varsa user id olarak initData kullanırız.
// KAREX mekaniklerini burada özelleştirebilirsin.

const KEY_PREFIX = "karex_v1_";
const refEl = id => document.getElementById(id);

let userKey = null;
let state = {
  balance: 0,
  history: [],
  boosts: { turbo:false, autotap:false, energy:0 },
  tasks: { t1:false, t2:false, t3:false },
  wallet: null,
  daily: { earned:0, lastClaim: null }
};

function generateRef(){
  return 'KX' + Math.random().toString(36).slice(2,8).toUpperCase();
}

function loadUser(){
  // Telegram WebApp initData available?
  try{
    if(window.Telegram && Telegram.WebApp && Telegram.WebApp.initData){
      // use initData as user id proxy
      userKey = KEY_PREFIX + btoa(Telegram.WebApp.initData).slice(0,12);
    }
  }catch(e){}
  if(!userKey) userKey = KEY_PREFIX + (localStorage.getItem("karex_local_user") || (()=>{
    const k = 'local_' + Math.random().toString(36).slice(2,10);
    localStorage.setItem("karex_local_user", k);
    return k;
  })());

  const raw = localStorage.getItem(userKey);
  if(raw) state = JSON.parse(raw);
  else {
    state.ref = generateRef();
    saveState();
  }
}

function saveState(){
  localStorage.setItem(userKey, JSON.stringify(state));
  renderAll();
}

function addHistory(text){
  state.history.unshift({t:Date.now(), text});
  if(state.history.length>50) state.history.pop();
  saveState();
}

function renderAll(){
  refEl("balance").innerText = Math.floor(state.balance);
  refEl("dailyEarn").innerText = `+${state.daily.earned} / gün`;
  refEl("refCode").innerText = state.ref || "—";

  // tasks
  const tasks = document.querySelectorAll("#tasksList li");
  tasks.forEach(li=>{
    const id = li.getAttribute("data-id");
    li.querySelector("input").checked = !!state.tasks[id];
  });

  // history
  const hist = refEl("historyList");
  hist.innerHTML = "";
  state.history.forEach(h=>{
    const d = new Date(h.t).toLocaleString();
    const li = document.createElement("li");
    li.textContent = `${d} — ${h.text}`;
    hist.appendChild(li);
  });
}

// --- Tap to mine ---
let tapBtn = refEl("tapBtn");
let fly = refEl("fly");
tapBtn.addEventListener("click", ()=>{
  let gain = 1;
  if(state.boosts.turbo) gain *= 2;
  if(state.boosts.autotap) gain += 60/60; // per click small
  state.balance += gain;
  state.daily.earned += gain;
  addHistory(`+${gain.toFixed(0)} KRX (mine)`);
  animateGain("+" + Math.round(gain));
  saveState();
});

// small visual for flying number
function animateGain(text){
  fly.innerText = text;
  fly.classList.remove("show");
  void fly.offsetWidth;
  fly.classList.add("show");
  setTimeout(()=>fly.classList.remove("show"),900);
}

// boosts
document.querySelectorAll(".boost").forEach(b=>{
  b.addEventListener("click", ()=>{
    const k = b.dataset.key;
    if(k==="turbo"){ state.boosts.turbo = !state.boosts.turbo; addHistory(state.boosts.turbo ? "Turbo aktif" : "Turbo pasif") }
    if(k==="autotap"){ state.boosts.autotap = !state.boosts.autotap; addHistory(state.boosts.autotap ? "AutoTap aktif" : "AutoTap kapandı") }
    if(k==="energy"){ state.boosts.energy = (state.boosts.energy||0) + 10; addHistory("Energy +10") }
    saveState();
  })
});

// tasks - simple claim
refEl("claimTasks").addEventListener("click", ()=>{
  let reward = 0;
  for(const k of ["t1","t2","t3"]){
    if(state.tasks[k]) continue;
    // mark complete for demo - in production you validate externally
    state.tasks[k] = true;
    if(k==="t1") reward += 1000;
    if(k==="t2") reward += 750;
    if(k==="t3") reward += 500;
  }
  if(reward>0){
    state.balance += reward;
    addHistory(`Görev ödülü +${reward} KRX`);
  }
  saveState();
});

// checkboxes toggling (local)
document.querySelectorAll("#tasksList input").forEach(inp=>{
  inp.addEventListener("change", (e)=>{
    const id = e.target.closest("li").getAttribute("data-id");
    state.tasks[id] = e.target.checked;
    saveState();
  })
});

// wallet save
refEl("saveWallet").addEventListener("click", ()=>{
  const v = refEl("walletAddr").value.trim();
  state.wallet = v || null;
  addHistory("Cüzdan adresi kaydedildi");
  saveState();
});

// share referral
refEl("shareRef").addEventListener("click", ()=>{
  const txt = `Benim KAREX referansım: ${state.ref} - Hemen katıl!`;
  if(navigator.share) navigator.share({text:txt}).catch(()=>navigator.clipboard.writeText(txt));
  else navigator.clipboard.writeText(txt).then(()=>alert("Referans kopyalandı"));
});

// open modals (withdraw/shop) - simple alerts for now
refEl("openWithdraw").addEventListener("click", ()=>{
  alert("Withdraw talebi: Bu demo sürümde kapalı. Gerçek çekim için admin ile bağlantı gereklidir.");
});

// init
loadUser();
renderAll();

// small auto-save every 10s
setInterval(saveState, 10000);

// visual fly styles (add via JS to keep CSS small)
const flyStyle = document.createElement("style");
flyStyle.innerHTML = `
#fly{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);pointer-events:none;color:${getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#f7931a'};font-weight:800;font-size:22px;opacity:0;transition:all .45s}
#fly.show{transform:translate(-50%,-120%);opacity:1}
`;
document.head.appendChild(flyStyle);

// expose a small API to send commands from bot (optional)
window.karexApp = {
  getState: ()=>state,
  addBalance: (v,reason)=>{ state.balance += v; addHistory(`Admin +${v} (${reason||'admin'})`); saveState(); },
  setRef: (r)=>{ state.ref = r; saveState(); }
                                       }
