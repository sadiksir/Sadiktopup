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

    // Logo khuje: config e deya path -> bkash.png (same folder) -> img/bkash.png
    const cands = [p.logo, key + ".png", "img/" + key + ".png"].filter((v, i, a) => v && a.indexOf(v) === i);
    let ci = 0;
    const img = new Image();
    img.alt = p.name;
    img.onload = () => { p._logo = cands[ci]; };
    img.onerror = () => {
      ci++;
      if (ci < cands.length) { img.src = cands[ci]; }
      else { box.classList.add("fallback"); box.textContent = p.name[0]; }
    };
    img.src = cands[0];
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
  if (p._logo) { logo.src = p._logo; logo.parentElement.style.display = ""; }
  else { logo.parentElement.style.display = "none"; }
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
      uidState = { uid, status: "bad" };
      setUidResult("bad", "❌ UID sothik na ba player paoa jay nai.");
    } else {
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
   HOME: snake + sticky title  (smooth version)
   - scroll e kono layout-read nai (shob age theke measure kora)
   - heavy blur/filter/text-shadow animation nai
   ===================================================== */
const wrap = $("#snakeWrap"), svg = $("#snakeSvg"), sLine = $("#snakeLine"),
      sGlow = $("#snakeGlow"), sBase = $("#snakeBase"), sHead = $("#snakeHead");
const ft = $("#fixedTitle"), hbar = $("#homeBar"), hSub = $(".hero-sub"), hHint = $(".scroll-hint"), hLogo = $("#heroLogo");

// measurements (resize/load e ekbar)
const M = { vw: 0, vh: 0, tw: 0, th: 0, fs: 48, wrapTop: 0 };
// snake lookup table
let T = null, sTotal = 0, sBtns = [], homeScroll = 0;
let lastMini = null;

function homeActive() { return $("#home").classList.contains("active"); }

function measure() {
  M.vw = window.innerWidth;
  M.vh = window.innerHeight;
  M.tw = ft.offsetWidth;
  M.th = ft.offsetHeight;
  M.fs = parseFloat(getComputedStyle(ft).fontSize) || 48;
  M.wrapTop = wrap.getBoundingClientRect().top + window.scrollY;
}

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
  if (!homeActive()) return;
  measure();
  const W = wrap.clientWidth, H = wrap.clientHeight, wr = wrap.getBoundingClientRect();
  svg.setAttribute("width", W); svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  sBtns = $$(".snake-btn", wrap).map(el => {
    const r = el.getBoundingClientRect(), left = el.classList.contains("left");
    return { el, on: false, y: r.top - wr.top + r.height / 2, x: left ? (r.right - wr.left - 10) : (r.left - wr.left + 10) };
  });

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
  [sBase, sLine, sGlow].forEach(p => p.setAttribute("d", d));

  sTotal = sLine.getTotalLength();
  [sLine, sGlow].forEach(p => { p.style.strokeDasharray = sTotal; p.style.strokeDashoffset = sTotal; });

  // lookup table (ekbar-i banai, scroll e getPointAtLength lage na)
  const N = 500;
  T = { len: new Float32Array(N + 1), my: new Float32Array(N + 1), x: new Float32Array(N + 1), y: new Float32Array(N + 1) };
  let maxY = -1;
  for (let i = 0; i <= N; i++) {
    const len = sTotal * i / N, p = sLine.getPointAtLength(len);
    maxY = Math.max(maxY, p.y);
    T.len[i] = len; T.my[i] = maxY; T.x[i] = p.x; T.y[i] = p.y;
  }
  sBtns.forEach(b => b.idx = idxAtY(b.y));
  render();
}

function idxAtY(y) {
  let lo = 0, hi = T.my.length - 1;
  if (T.my[hi] < y) return hi;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (T.my[m] >= y) hi = m; else lo = m + 1;
  }
  return lo;
}

function render() {
  if (!homeActive() || !T) return;
  const sy = window.scrollY, vh = M.vh;

  /* ---- snake ---- */
  const headY = sy + vh * 0.72 - M.wrapTop;
  const idx = headY > 0 ? idxAtY(headY) : 0;
  const off = sTotal - T.len[idx];
  sLine.style.strokeDashoffset = off;
  sGlow.style.strokeDashoffset = off;
  const showHead = headY > 0 && idx < T.len.length - 1;
  sHead.setAttribute("cx", T.x[idx]);
  sHead.setAttribute("cy", T.y[idx]);
  sHead.style.opacity = showHead ? 1 : 0;
  for (const b of sBtns) {
    const on = headY > 0 && idx >= b.idx;
    if (on !== b.on) { b.on = on; b.el.classList.toggle("active", on); }
  }

  /* ---- title: boro -> chhoto, uporer bam kone lock ---- */
  const raw = Math.min(1, Math.max(0, sy / (vh * 0.45)));
  const e = raw * raw * (3 - 2 * raw);
  const s1 = Math.min(1, 22 / M.fs);
  const s = 1 + (s1 - 1) * e;
  const x0 = (M.vw - M.tw) / 2, y0 = vh * 0.36 - M.th / 2;
  const x1 = 16, y1 = (48 - M.th * s1) / 2;
  ft.style.transform = `translate3d(${x0 + (x1 - x0) * e}px, ${y0 + (y1 - y0) * e}px, 0) scale(${s})`;
  const mini = raw >= 0.98;
  if (mini !== lastMini) { lastMini = mini; ft.classList.toggle("mini", mini); }
  hbar.style.opacity = e;
  hSub.style.opacity = Math.max(0, 1 - raw * 1.8);
  hLogo.style.opacity = Math.max(0, 1 - raw * 2.2);
  hHint.style.opacity = Math.max(0, 1 - raw * 4);
}

ft.addEventListener("click", () => { if (ft.classList.contains("mini")) window.scrollTo({ top: 0, behavior: "smooth" }); });

let ticking = false, settle = null;
function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }
  // scroll thamle abar ekbar — jate kokhono atke na thake
  clearTimeout(settle);
  settle = setTimeout(render, 120);
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("scrollend", render);
window.addEventListener("touchend", () => setTimeout(render, 150), { passive: true });

let lastW = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth !== lastW) { lastW = window.innerWidth; buildSnake(); }   // shudhu width bodlale rebuild
  else { M.vh = window.innerHeight; render(); }                                   // browser bar uthle-namle halka update
});
window.addEventListener("load", buildSnake);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildSnake);

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
  render();
};

/* ---------- Site logo (auto): logo.png upload korlei boshe jabe ---------- */
(function () {
  const cands = ["logo.png", "logo.webp", "logo.jpg", "logo.jpeg", "logo.svg", "img/logo.png"];
  let i = 0;
  const im = new Image();
  im.onload = () => {
    const src = cands[i];
    hLogo.src = src; hLogo.hidden = false;                      // home page er upore
    const a = $("#appLogo");                                    // app header e SS er jaygay
    a.innerHTML = ""; a.classList.add("has-img");
    const x = new Image(); x.src = src; x.alt = "Sadik Store"; a.appendChild(x);
    let fav = document.querySelector('link[rel="icon"]');       // browser tab icon
    if (!fav) { fav = document.createElement("link"); fav.rel = "icon"; document.head.appendChild(fav); }
    fav.href = src;
  };
  im.onerror = () => { i++; if (i < cands.length) im.src = cands[i]; };
  im.src = cands[0];
})();

/* ---------- Init ---------- */
renderLists();
renderPay();
buildSnake();
