/* =====================================================
   CONFIG — ekhane nijer info boshan
   ===================================================== */
const CONFIG = {
  // UID checker er Cloudflare Worker URL (worker.js dekhun). API key ekhane BOSHBEN NA.
  uidApi: "https://uidcheck.sadiksir36.workers.dev/",
  // Order ashbe ei WhatsApp number a (country code shoho, + chhara). Example: 8801XXXXXXXXX
  whatsapp: "01761645666",
  // Payment number gulo (Send Money)
  payments: {
    bkash:  { name: "bKash",  number: "01761645666" },
    nagad:  { name: "Nagad",  number: "01761645666" },
    rocket: { name: "Rocket", number: "01761645666" }
  }
};

/* =====================================================
   DATA — Topup list
   ===================================================== */
const GROUPS = [
  { title: "💎 Diamond", icon: "💎", items: [
    [25,20],[50,35],[100,70]
  ], split: true },
  { title: "💎 Diamond", icon: "💎", items: [[115,80],[240,158],[355,237],[480,316]] },
  { title: "💎 Diamond", icon: "💎", items: [[505,336],[610,400],[725,480],[850,560],[965,639]] },
  { title: "💎 Diamond", icon: "💎", items: [[1090,718],[1240,800],[1505,980],[1850,1200]] },
  { title: "💎 Diamond", icon: "💎", items: [[2530,1610],[3140,2010],[3770,2410]] },
  { title: "💎 Diamond", icon: "💎", items: [[5060,3220],[7590,4830],[10120,6440]] }
].map(g => ({
  title: g.title, icon: g.icon,
  items: g.items.map(([d, p]) => ({ name: d + " Diamond", label: d, price: p }))
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
   STATE + HELPERS
   ===================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let selected = null;
let payment = null;

/* ---------- Tabs ---------- */
$$(".tab").forEach(btn => btn.addEventListener("click", () => {
  $$(".tab").forEach(b => b.classList.toggle("active", b === btn));
  $$(".page").forEach(p => p.classList.toggle("active", p.id === btn.dataset.tab));
  window.scrollTo({ top: 0, behavior: "smooth" });
}));

/* ---------- Render lists ---------- */
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

/* ---------- Select item ---------- */
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
$("#qty").addEventListener("input", () => { if ($("#qty").value !== "") { $("#qty").value = getQty(); } updateTotal(); });
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

/* ---------- Input filters ---------- */
["#gameId", "#sender"].forEach(s =>
  $(s).addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ""))
);

/* ---------- Submit ---------- */
$("#submitBtn").onclick = () => {
  const err = $("#err");
  const uid = $("#gameId").value.trim();
  const sender = $("#sender").value.trim();
  const trx = $("#trx").value.trim();

  err.textContent = "";
  if (!selected)                        return err.textContent = "Age ekta package select korun.";
  if (uid.length < 6)                   return err.textContent = "Sothik Game ID din (shudhu number).";
  if (!payment)                         return err.textContent = "Payment method select korun.";
  if (!/^01\d{9}$/.test(sender))        return err.textContent = "Sothik 11 digit number din (01XXXXXXXXX).";
  if (trx.length < 6)                   return err.textContent = "Transaction ID din.";

  if (!uidVerified || uidVerified.uid !== uid) return err.textContent = "Age UID 'Check' button chepe verify korun.";
  const qty = getQty();
  const msg =
`🛒 *NEW ORDER*
━━━━━━━━━━━━
📦 Package: ${selected.name}
🔢 Quantity: ${qty}
💰 Total: ${total()} Tk
🆔 Game ID: ${uid}
👤 Name: ${uidVerified.name}
💳 Method: ${CONFIG.payments[payment].name}
📱 Sender: ${sender}
🧾 TrxID: ${trx}`;

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* ---------- UID Checker ---------- */
let uidVerified = null;

function deepFind(obj, keys) {
  const want = keys.map(k => k.toLowerCase());
  const stack = [obj];
  while (stack.length) {
    const cur = stack.shift();
    if (cur && typeof cur === "object") {
      for (const [k, v] of Object.entries(cur)) {
        if (want.includes(k.toLowerCase()) && (typeof v === "string" || typeof v === "number") && String(v).trim() !== "") return v;
        if (v && typeof v === "object") stack.push(v);
      }
    }
  }
  return null;
}

function setUidResult(cls, html) {
  const el = $("#uidResult");
  el.className = "uid-result " + cls;
  el.innerHTML = html;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("#gameId").addEventListener("input", () => { uidVerified = null; setUidResult("", ""); });

$("#checkUid").onclick = async () => {
  const uid = $("#gameId").value.trim();
  if (uid.length < 6) return setUidResult("bad", "❌ Sothik UID din.");
  const btn = $("#checkUid");
  btn.disabled = true;
  setUidResult("load", "⏳ Checking...");
  try {
    const r = await fetch(`${CONFIG.uidApi}?uid=${encodeURIComponent(uid)}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || data.message || "Request failed");
    const name = deepFind(data, ["nickname", "nickName", "player_name", "playerName", "account_name", "accountName", "name"]);
    const level = deepFind(data, ["level", "account_level", "accountLevel"]);
    if (!name) throw new Error("Ei UID er player paoa jay nai.");
    uidVerified = { uid, name: String(name) };
    setUidResult("ok", `✅ ${esc(name)}${level ? " &bull; Level " + esc(level) : ""}`);
  } catch (e) {
    uidVerified = null;
    setUidResult("bad", "❌ " + esc(e.message || "UID check kora jay nai. Abar chesta korun."));
  } finally {
    btn.disabled = false;
  }
};

/* ---------- Home / Snake ---------- */
const wrap = $("#snakeWrap"), svg = $("#snakeSvg"), sLine = $("#snakeLine"),
      sBase = $("#snakeBase"), sHead = $("#snakeHead");
let table = [], sTotal = 0, sBtns = [], homeScroll = 0;

function catmull(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function buildSnake() {
  if (!$("#home").classList.contains("active")) return;
  const W = wrap.clientWidth, H = wrap.clientHeight, wr = wrap.getBoundingClientRect();
  svg.setAttribute("width", W); svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  sBtns = $$(".snake-btn", wrap).map(el => {
    const r = el.getBoundingClientRect(), left = el.classList.contains("left");
    return { el, y: r.top - wr.top + r.height / 2, x: left ? (r.right - wr.left - 10) : (r.left - wr.left + 10) };
  });

  // snake: aka-baka path, prottek button er edge chhuye jay
  const amp = W * 0.13;
  const pts = [[W / 2, 0]];
  let px = W / 2, py = 0, sign = 1;
  [...sBtns.map(b => [b.x, b.y]), [W / 2, H]].forEach(([x, y]) => {
    for (const t of [1 / 3, 2 / 3]) {
      pts.push([px + (x - px) * t + sign * amp, py + (y - py) * t]);
      sign = -sign;
    }
    pts.push([x, y]);
    px = x; py = y;
  });
  const d = catmull(pts);
  sBase.setAttribute("d", d);
  sLine.setAttribute("d", d);

  sTotal = sLine.getTotalLength();
  sLine.style.strokeDasharray = sTotal;
  sLine.style.strokeDashoffset = sTotal;

  // length -> y lookup table (monotonic)
  table = [];
  let maxY = -1;
  const N = 600;
  for (let i = 0; i <= N; i++) {
    const len = sTotal * i / N, p = sLine.getPointAtLength(len);
    maxY = Math.max(maxY, p.y);
    table.push({ len, y: maxY });
  }
  sBtns.forEach(b => b.len = lenAtY(b.y));
  updateSnake();
}

function lenAtY(y) {
  let lo = 0, hi = table.length - 1;
  if (table[hi].y < y) return sTotal;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (table[m].y >= y) hi = m; else lo = m + 1;
  }
  return table[lo].len;
}

function updateSnake() {
  if (!sTotal || !$("#home").classList.contains("active")) return;
  const top = wrap.getBoundingClientRect().top;
  const headY = window.innerHeight * 0.72 - top;
  const drawn = headY > 0 ? lenAtY(headY) : 0;
  sLine.style.strokeDashoffset = sTotal - drawn;
  const p = sLine.getPointAtLength(drawn);
  sHead.setAttribute("cx", p.x); sHead.setAttribute("cy", p.y);
  sHead.style.opacity = headY > 0 && drawn < sTotal ? 1 : 0;
  sBtns.forEach(b => b.el.classList.toggle("active", headY > 0 && drawn >= b.len - 1));
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateSnake(); ticking = false; });
}, { passive: true });
window.addEventListener("resize", buildSnake);
window.addEventListener("load", buildSnake);

function openApp(tab) {
  homeScroll = window.scrollY;
  $("#home").classList.remove("active");
  $("#app").classList.add("active");
  $(`.tab[data-tab="${tab}"]`).click();
  window.scrollTo(0, 0);
}
let zooming = false;
function zoomOpen(btn) {
  if (zooming) return;
  zooming = true;
  const ic = btn.querySelector(".ic");
  const r = ic.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

  const fx = document.createElement("div");
  fx.className = "zoom-fx";
  const g = document.createElement("div");
  g.className = "zoom-ic";
  g.textContent = ic.textContent;
  g.style.left = cx + "px";
  g.style.top = cy + "px";
  g.style.fontSize = getComputedStyle(ic).fontSize;
  fx.appendChild(g);
  document.body.appendChild(fx);
  ic.style.visibility = "hidden";

  const dx = window.innerWidth / 2 - cx, dy = window.innerHeight / 2 - cy;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fx.classList.add("go");
    g.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(9)`;
  }));

  // icon boro hoye gele page open + icon aro boro hoye fade out
  setTimeout(() => {
    openApp(btn.dataset.go);
    ic.style.visibility = "";
    g.style.transform = `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(20)`;
    g.style.opacity = "0";
    fx.style.opacity = "0";
    fx.style.pointerEvents = "none";
    setTimeout(() => { fx.remove(); zooming = false; }, 550);
  }, 700);
}
$$(".snake-btn").forEach(b => b.addEventListener("click", () => zoomOpen(b)));
$("#backHome").onclick = () => {
  $("#app").classList.remove("active");
  $("#home").classList.add("active");
  buildSnake();
  window.scrollTo(0, homeScroll);
  updateSnake();
};

/* ---------- Init ---------- */
buildSnake();
renderLists();
renderPay();
