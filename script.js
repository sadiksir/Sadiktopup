/* =====================================================
   Settings (WhatsApp, payment number, UID worker) => config.js
   ===================================================== */

/* ---------- Data ---------- */
const diamondRows = [
  [[25,20],[50,35],[100,70]],
  [[115,80],[240,158],[355,237],[480,316]],
  [[505,336],[610,400],[725,480],[850,560],[965,639]],
  [[1090,718],[1240,800],[1505,980],[1850,1200]],
  [[2530,1610],[3140,2010],[3770,2410]],
  [[5060,3220],[7590,4830],[10120,6440]]
];
const GROUPS = diamondRows.map(rows => ({
  title: "💎 Diamond", icon: "💎",
  items: rows.map(([d, p]) => ({ name: d + " Diamond", label: String(d), price: p }))
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

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let selected = null;
let payment = null;

async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch (e) {
    const t = document.createElement("input"); t.value = text; document.body.appendChild(t);
    t.select(); document.execCommand("copy"); t.remove();
  }
  const old = btn.textContent;
  btn.textContent = "Copied ✓";
  setTimeout(() => btn.textContent = old, 1400);
}

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
    if (!(g.title === "💎 Diamond" && gi > 0)) box.innerHTML = `<div class="group-title">${g.title}</div>`;
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
  renderPayPanel();
}
$("#qMinus").onclick = () => { $("#qty").value = Math.max(1, getQty() - 1); updateTotal(); };
$("#qPlus").onclick  = () => { $("#qty").value = Math.min(99, getQty() + 1); updateTotal(); };
$("#qty").addEventListener("input", () => { if ($("#qty").value !== "") $("#qty").value = getQty(); updateTotal(); });
$("#qty").addEventListener("blur", () => { $("#qty").value = getQty(); updateTotal(); });

/* ---------- Payment ---------- */
function renderPay() {
  const wrap = $("#payList");
  Object.entries(CONFIG.payments).forEach(([key, p]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm";
    b.dataset.p = key;
    b.style.setProperty("--pc", p.color || "#ff7a00");

    const box = document.createElement("span");
    box.className = "lg";
    const img = new Image();
    img.alt = p.name;
    // PNG na thakle letter badge dekhabe
    img.onerror = () => { box.classList.add("fallback"); box.textContent = p.name[0]; };
    img.src = p.logo;
    box.appendChild(img);

    b.appendChild(box);
    b.appendChild(document.createTextNode(p.name));
    b.onclick = () => {
      payment = key;
      $$(".pm").forEach(x => x.classList.toggle("active", x === b));
      renderPayPanel(true);
    };
    wrap.appendChild(b);
  });
}

function renderPayPanel(scroll) {
  const panel = $("#payPanel");
  if (!payment) { panel.hidden = true; return; }
  const p = CONFIG.payments[payment];
  const amt = total() + " Tk";

  panel.hidden = false;
  panel.style.setProperty("--pc", p.color || "#ff7a00");
  $("#ppName").textContent = p.name;
  const logo = $("#ppLogo");
  logo.style.display = "";
  logo.onerror = () => { logo.style.display = "none"; };
  if (logo.getAttribute("src") !== p.logo) logo.src = p.logo;
  $("#payAmt").textContent = amt;
  $("#payNum").textContent = p.number;

  const qr = $("#ppQr");
  if (p.qr) { qr.src = p.qr; qr.hidden = false; } else { qr.hidden = true; }

  $("#ppSteps").innerHTML = [
    `${esc(p.name)} app open korun${p.ussd ? ` (ba <b>${esc(p.ussd)}</b> dial korun)` : ""}`,
    `<b>Send Money</b> select korun`,
    `Number din: <b>${esc(p.number)}</b>`,
    `Amount din: <b>${esc(amt)}</b>`,
    `PIN diye confirm korun`,
    `Transaction ID (TrxID) niche likhun`
  ].map(s => `<li>${s}</li>`).join("");

  if (scroll) setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
}
$("#copyBtn").onclick = e => copyText($("#payNum").textContent, e.currentTarget);
$("#copyAmt").onclick = e => copyText(String(total()), e.currentTarget);

/* ---------- Input filters ---------- */
$("#sender").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ""));

/* ---------- UID Checker ---------- */
// uidState: null | {uid, status: "ok"|"bad"|"unknown", name?}
let uidState = null;

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

$("#gameId").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/\D/g, "");
  uidState = null;
  setUidResult("", "");
});

$("#checkUid").onclick = async () => {
  const uid = $("#gameId").value.trim();
  if (uid.length < 6) return setUidResult("bad", "❌ Sothik UID din.");
  const btn = $("#checkUid");
  btn.disabled = true;
  setUidResult("load", "⏳ Checking...");
  try {
    const r = await fetch(`${CONFIG.uidApi}?uid=${encodeURIComponent(uid)}`);
    let data = null;
    try { data = await r.json(); } catch (e) {}

    if (r.ok && data) {
      const info = data.AccountInfo || data;
      const name = info.AccountName || deepFind(data, ["AccountName", "nickname", "name"]);
      const level = info.AccountLevel ?? deepFind(data, ["AccountLevel", "level"]);
      const region = info.AccountRegion || "";
      if (name) {
        uidState = { uid, status: "ok", name: String(name) };
        setUidResult("ok", `✅ ${esc(name)}${level ? " &bull; Level " + esc(level) : ""}${region ? " &bull; " + esc(region) : ""}`);
      } else {
        uidState = { uid, status: "bad" };
        setUidResult("bad", "❌ Ei UID er player paoa jay nai.");
      }
    } else if ([400, 402, 404].includes(r.status)) {
      // API bolche UID-i thik na
      uidState = { uid, status: "bad" };
      setUidResult("bad", "❌ UID sothik na ba player paoa jay nai.");
    } else {
      // Server/limit problem — UID thik kina bola jacche na
      uidState = { uid, status: "unknown" };
      setUidResult("warn", "⚠️ UID check server ekhon kaj korche na. UID ta nijer chokhe ekbar dekhe nin, tarpor order korte paren.");
    }
  } catch (e) {
    uidState = { uid, status: "unknown" };
    setUidResult("warn", "⚠️ UID check kora jay nai (connection problem). UID ta ekbar dekhe nin, tarpor order korte paren.");
  } finally {
    btn.disabled = false;
  }
};

/* ---------- Submit ---------- */
$("#submitBtn").onclick = () => {
  const err = $("#err");
  const uid = $("#gameId").value.trim();
  const sender = $("#sender").value.trim();
  const trx = $("#trx").value.trim();
  const st = uidState && uidState.uid === uid ? uidState.status : null;

  err.textContent = "";
  if (!selected)                  return err.textContent = "Age ekta package select korun.";
  if (uid.length < 6)             return err.textContent = "Sothik Game ID din (shudhu number).";
  if (st === "bad")               return err.textContent = "Ei UID thik na. Sothik UID diye abar Check korun.";
  if (CONFIG.requireUidCheck && st !== "ok") return err.textContent = "Age UID 'Check' button chepe verify korun.";
  if (!payment)                   return err.textContent = "Payment method select korun.";
  if (!/^01\d{9}$/.test(sender))  return err.textContent = "Sothik 11 digit number din (01XXXXXXXXX).";
  if (trx.length < 6)             return err.textContent = "Transaction ID din.";

  const nameLine = st === "ok" ? `👤 Name: ${uidState.name}` : "⚠️ UID verify hoy nai";
  const msg =
`🛒 *NEW ORDER*
━━━━━━━━━━━━
📦 Package: ${selected.name}
🔢 Quantity: ${getQty()}
💰 Total: ${total()} Tk
🆔 Game ID: ${uid}
${nameLine}
💳 Method: ${CONFIG.payments[payment].name}
📱 Sender: ${sender}
🧾 TrxID: ${trx}`;

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* =====================================================
   HOME: snake + sticky title
   ===================================================== */
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

  // aka-baka snake — shesh button e giye-i thame (faka jaygay jay na)
  const amp = Math.min(W * 0.13, 80);
  const pts = [[W / 2, 0]];
  let px = W / 2, py = 0, sign = 1;
  sBtns.forEach(b => {
    for (const t of [1 / 3, 2 / 3]) {
      pts.push([px + (b.x - px) * t + sign * amp, py + (b.y - py) * t]);
      sign = -sign;
    }
    pts.push([b.x, b.y]);
    px = b.x; py = b.y;
  });
  const d = catmull(pts);
  sBase.setAttribute("d", d);
  sLine.setAttribute("d", d);

  sTotal = sLine.getTotalLength();
  sLine.style.strokeDasharray = sTotal;
  sLine.style.strokeDashoffset = sTotal;

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
  sHead.style.opacity = headY > 0 && drawn < sTotal - 2 ? 1 : 0;
  sBtns.forEach(b => b.el.classList.toggle("active", headY > 0 && drawn >= b.len - 1));
}

/* ---------- Sticky title: boro -> chhoto, bam kone lock ---------- */
const ft = $("#fixedTitle"), hbar = $("#homeBar"),
      hSub = $(".hero-sub"), hHint = $(".scroll-hint");

function updateTitle() {
  if (!$("#home").classList.contains("active")) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = ft.offsetWidth, h = ft.offsetHeight;
  const raw = Math.min(1, Math.max(0, window.scrollY / (vh * 0.5)));
  const e = raw * raw * (3 - 2 * raw);

  const fs = parseFloat(getComputedStyle(ft).fontSize) || 48;
  const s1 = Math.min(1, 22 / fs);            // chhoto size ~22px
  const s = 1 + (s1 - 1) * e;
  const x0 = (vw - w) / 2, y0 = vh * 0.36 - h / 2;
  const x1 = 16,           y1 = (48 - h * s1) / 2;
  const x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e;

  ft.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
  ft.classList.toggle("mini", raw >= 0.98);
  hbar.style.opacity = e;
  hSub.style.opacity = Math.max(0, 1 - raw * 1.8);
  hHint.style.opacity = Math.max(0, 1 - raw * 4);
}
ft.addEventListener("click", () => { if (ft.classList.contains("mini")) window.scrollTo({ top: 0, behavior: "smooth" }); });

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateSnake(); updateTitle(); ticking = false; });
}, { passive: true });
window.addEventListener("resize", () => { buildSnake(); updateTitle(); });
window.addEventListener("load", () => { buildSnake(); updateTitle(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { buildSnake(); updateTitle(); });

/* ---------- Open app (icon zoom animation) ---------- */
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
  updateTitle();
};

/* ---------- Init ---------- */
renderLists();
renderPay();
buildSnake();
updateTitle();
   
