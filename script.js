/* =====================================================
   CONFIG — ekhane nijer info boshan
   ===================================================== */
const CONFIG = {
  // Order ashbe ei WhatsApp number a (country code shoho, + chhara). Example: 8801XXXXXXXXX
  whatsapp: "01761645666",

  // Payment number gulo (Send Money)
  payments: {
    bkash:  { name: "bKash",  number: "01761645666" },
    nagad:  { name: "Nagad",  number: "01761645666" },
    rocket: { name: "Rocket", number: "01761645666" }
  },

  // ---------- UID CHECKER ----------
  // Third-party API er URL ekhane boshan. {uid} ar {region} auto replace hobe.
  // Example: "https://your-api.example.com/player?uid={uid}&region={region}"
  // Khali rakhle checker kaj korbe na (sudhu message dekhabe).
  uidApi: "https://api.gameskinbo.com/ff-info/get?uid=2312730961&region=BD?}",
  region: "bd",
  // true hole UID verify na hole order dewa jabe na. false hole check optional.
  requireUidCheck: false
};

/* =====================================================
   DATA
   ===================================================== */
const GROUPS = [
  [[25,20],[50,35],[100,70]],
  [[115,80],[240,158],[355,237],[480,316]],
  [[505,336],[610,400],[725,480],[850,560],[965,639]],
  [[1090,718],[1240,800],[1505,980],[1850,1200]],
  [[2530,1610],[3140,2010],[3770,2410]],
  [[5060,3220],[7590,4830],[10120,6440]]
].map(items => ({
  title: "💎 Diamond", icon: "💎",
  items: items.map(([d, p]) => ({ name: d + " Diamond", label: d, price: p }))
}));

const MEMBERSHIP = {
  title: "🌟 Membership", icon: "🔹",
  items: [
    { name: "Weekly Lite", label: "Weekly Lite", price: 40 },
    { name: "Weekly",      label: "Weekly",      price: 158 },
    { name: "Monthly",     label: "Monthly",     price: 790 }
  ]
};

const LEVELUP = {
  title: "⭐ Level Up Pass", icon: "🔹",
  items: [
    { name: "Level 6 (120)",    label: "Level 6 (120)",    price: 40 },
    { name: "Level 10 (200)",   label: "Level 10 (200)",   price: 65 },
    { name: "Level 15 (200)",   label: "Level 15 (200)",   price: 65 },
    { name: "Level 20 (200)",   label: "Level 20 (200)",   price: 65 },
    { name: "Level 25 (200)",   label: "Level 25 (200)",   price: 65 },
    { name: "Level 30 (350)",   label: "Level 30 (350)",   price: 90 },
    { name: "All Level (1270)", label: "All Level (1270)", price: 385 }
  ]
};
// Level Up Pass ekbar-i kena jay (quantity hide hobe)
LEVELUP.items.forEach(i => i.single = true);

const ALL_GROUPS = [...GROUPS, MEMBERSHIP, LEVELUP];

/* =====================================================
   HELPERS
   ===================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let selected = null;
let payment = null;

/* ---------- Pages / Tabs ---------- */
function showPage(id) {
  $$(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === id));
  $$(".page").forEach(p => p.classList.toggle("active", p.id === id));
  document.body.classList.toggle("is-home", id === "home");
  window.scrollTo({ top: 0, behavior: "auto" });
  if (id === "home") setTimeout(buildSnake, 30);
}
$$(".tab").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.tab)));
$$("[data-go]").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.go)));
$("#brandHome").addEventListener("click", () => showPage("home"));

/* =====================================================
   SNAKE LINE (scroll animation)
   ===================================================== */
const snakeBox = $("#snake");
const snakePath = $("#snakePath");
const snakeTrack = $("#snakeTrack");
const snakeHead = $("#snakeHead");
const snakeSvg = $("#snakeSvg");
let snakeTotal = 0;
let snakeTops = [];
let snakeItems = [];

function buildSnake() {
  if (!snakeBox.offsetHeight) return;
  snakeItems = $$(".s-item", snakeBox);
  const W = snakeBox.clientWidth, H = snakeBox.clientHeight;

  const pts = [{ x: W / 2, y: 0 }];
  snakeItems.forEach(it => pts.push({
    x: it.offsetLeft + it.offsetWidth / 2,
    y: it.offsetTop + it.offsetHeight / 2
  }));
  pts.push({ x: W / 2, y: H });

  // aka-baka (S-curve) path: protiti button er majhkhan diye jay
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], m = (a.y + b.y) / 2;
    d += ` C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`;
  }
  snakeSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  snakeSvg.setAttribute("preserveAspectRatio", "none");
  snakeTrack.setAttribute("d", d);
  snakePath.setAttribute("d", d);
  snakeTotal = snakePath.getTotalLength();
  snakePath.style.strokeDasharray = snakeTotal;
  snakeTops = snakeItems.map(it => it.offsetTop);
  updateSnake();
}

function updateSnake() {
  if (!snakeTotal || !$("#home").classList.contains("active")) return;
  const H = snakeBox.clientHeight;
  const rect = snakeBox.getBoundingClientRect();
  let targetY = window.innerHeight * 0.62 - rect.top;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom) targetY = H;
  targetY = Math.max(0, Math.min(H, targetY));

  // path er y bariye jay, tai binary search diye head er position ber kori
  let lo = 0, hi = snakeTotal;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (snakePath.getPointAtLength(mid).y < targetY) lo = mid; else hi = mid;
  }
  const len = hi;
  const pt = snakePath.getPointAtLength(len);
  snakePath.style.strokeDashoffset = snakeTotal - len;
  snakeHead.setAttribute("cx", pt.x);
  snakeHead.setAttribute("cy", pt.y);

  // snake button e touch korle highlight, upore gele highlight chole jay
  snakeItems.forEach((it, i) => it.classList.toggle("lit", pt.y >= snakeTops[i] + 12));
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateSnake(); ticking = false; });
}, { passive: true });
window.addEventListener("resize", buildSnake);
window.addEventListener("load", buildSnake);

/* =====================================================
   TOPUP
   ===================================================== */
function renderLists() {
  const wrap = $("#lists");
  wrap.innerHTML = "";
  ALL_GROUPS.forEach((g, gi) => {
    const box = document.createElement("div");
    box.className = "group";
    const showTitle = !(g.title === "💎 Diamond" && gi > 0);
    if (showTitle) box.innerHTML = `<div class="group-title">${g.title}</div>`;
    const list = document.createElement("div");
    list.className = "items";
    g.items.forEach(it => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "item";
      b.innerHTML = `<span class="nm">${g.icon} ${it.label}</span><span class="pr">${it.price} Tk</span>`;
      b.addEventListener("click", () => selectItem(it, b));
      list.appendChild(b);
    });
    box.appendChild(list);
    wrap.appendChild(box);
  });
}

function selectItem(it, el) {
  selected = it;
  $$(".item").forEach(x => x.classList.remove("selected"));
  el.classList.add("selected");
  $("#qty").value = 1;
  $("#qtyRow").hidden = !!it.single;
  $("#selName").textContent = it.name;
  $("#selUnit").textContent = "Unit price: " + it.price + " Tk";
  updateTotal();
  const box = $("#orderBox");
  box.hidden = false;
  setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

/* ---------- Quantity / Total ---------- */
function getQty() {
  if (selected && selected.single) return 1;
  let q = parseInt($("#qty").value, 10);
  if (isNaN(q) || q < 1) q = 1;
  if (q > 99) q = 99;
  return q;
}
function total() { return selected ? selected.price * getQty() : 0; }
function updateTotal() {
  $("#totalPrice").textContent = total() + " Tk";
  $("#payAmt").textContent = total() + " Tk";
}
$("#qMinus").onclick = () => { $("#qty").value = Math.max(1, getQty() - 1); updateTotal(); };
$("#qPlus").onclick  = () => { $("#qty").value = Math.min(99, getQty() + 1); updateTotal(); };
$("#qty").addEventListener("input", () => { if ($("#qty").value !== "") $("#qty").value = getQty(); updateTotal(); });
$("#qty").addEventListener("blur", () => { $("#qty").value = getQty(); updateTotal(); });

/* ---------- Payment ---------- */
function renderPay() {
  const wrap = $("#payList");
  const marks = { bkash: "b", nagad: "N", rocket: "R" };
  Object.entries(CONFIG.payments).forEach(([key, p]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm";
    b.dataset.p = key;
    // Real logo use korte chaile: <img src="img/bkash.png" width="46"> boshan
    b.innerHTML = `<span class="lg">${marks[key]}</span>${p.name}`;
    b.onclick = () => {
      payment = key;
      $$(".pm").forEach(x => x.classList.toggle("active", x === b));
      $("#payNum").textContent = p.number;
      $("#payInfo").hidden = false;
      updateTotal();
    };
    wrap.appendChild(b);
  });
}
$("#copyBtn").onclick = async () => {
  const num = $("#payNum").textContent;
  try { await navigator.clipboard.writeText(num); }
  catch (e) {
    const t = document.createElement("input"); t.value = num; document.body.appendChild(t);
    t.select(); document.execCommand("copy"); t.remove();
  }
  $("#copyBtn").textContent = "Copied ✓";
  setTimeout(() => $("#copyBtn").textContent = "Copy", 1500);
};

/* =====================================================
   UID CHECKER
   ===================================================== */
const uidState = { uid: "", name: "", verified: false };

function setUidRes(text, cls) {
  const el = $("#uidRes");
  el.textContent = text;
  el.className = "uid-res " + (cls || "");
}

function pickName(j) {
  if (!j || typeof j !== "object") return "";
  const c = [
    j.nickname, j.name, j.player_name, j.playerName, j.username, j.player,
    j.data && (j.data.nickname || j.data.name || j.data.player_name),
    j.basicInfo && j.basicInfo.nickname,
    j.result && (j.result.nickname || j.result.name),
    j.account && (j.account.nickname || j.account.name)
  ];
  return c.find(v => typeof v === "string" && v.trim()) || "";
}

async function checkUid() {
  const uid = $("#gameId").value.trim();
  uidState.verified = false; uidState.name = ""; uidState.uid = uid;

  if (uid.length < 6) { setUidRes("Sothik UID din.", "bad"); return; }
  if (!CONFIG.uidApi) { setUidRes("UID checker chalu kora nei (script.js e uidApi boshan).", "warn"); return; }

  setUidRes("Checking...", "");
  const btn = $("#uidBtn"); btn.disabled = true;
  try {
    const url = CONFIG.uidApi
      .replace("{uid}", encodeURIComponent(uid))
      .replace("{region}", encodeURIComponent(CONFIG.region));
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    const json = await res.json();
    const name = pickName(json);
    if ($("#gameId").value.trim() !== uid) return; // check cholar somoy UID bodle gele
    if (name) {
      uidState.verified = true; uidState.name = name;
      setUidRes("✅ Player: " + name, "ok");
    } else {
      setUidRes("❌ Ei UID paoa jay nai. Abar check korun.", "bad");
    }
  } catch (e) {
    setUidRes("⚠️ Checker connect hoy nai. Pore abar try korun.", "warn");
  } finally {
    btn.disabled = false;
  }
}
$("#uidBtn").onclick = checkUid;

let uidTimer;
$("#gameId").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "");
  uidState.verified = false;
  setUidRes("", "");
  clearTimeout(uidTimer);
  if (CONFIG.uidApi && e.target.value.length >= 8) uidTimer = setTimeout(checkUid, 700);
});
$("#sender").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ""));

/* =====================================================
   SUBMIT
   ===================================================== */
$("#submitBtn").onclick = () => {
  const err = $("#err");
  const uid = $("#gameId").value.trim();
  const sender = $("#sender").value.trim();
  const trx = $("#trx").value.trim();

  err.textContent = "";
  if (!selected)                 return err.textContent = "Age ekta package select korun.";
  if (uid.length < 6)            return err.textContent = "Sothik Game ID din (shudhu number).";
  if (CONFIG.uidApi && CONFIG.requireUidCheck && !(uidState.verified && uidState.uid === uid))
                                 return err.textContent = "Age 'Check UID' diye UID verify korun.";
  if (!payment)                  return err.textContent = "Payment method select korun.";
  if (!/^01\d{9}$/.test(sender)) return err.textContent = "Sothik 11 digit number din (01XXXXXXXXX).";
  if (trx.length < 6)            return err.textContent = "Transaction ID din.";

  const qty = getQty();
  const playerLine = uidState.verified && uidState.uid === uid ? `\n👤 Player: ${uidState.name}` : "";
  const msg =
`🛒 *NEW ORDER*
━━━━━━━━━━━━
📦 Package: ${selected.name}
🔢 Quantity: ${qty}
💰 Total: ${total()} Tk
🆔 Game ID: ${uid}${playerLine}
💳 Method: ${CONFIG.payments[payment].name}
📱 Sender: ${sender}
🧾 TrxID: ${trx}`;

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* ---------- Init ---------- */
renderLists();
renderPay();
