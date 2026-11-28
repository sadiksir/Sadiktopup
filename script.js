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

/* ---------- Like data ---------- */
const LIKES = {
  title: "❤️ Profile Like", icon: "❤️",
  items: [
    { name: "100 Like", label: "100 Like", price: 10, single: true },
    { name: "200 Like", label: "200 Like", price: 20, single: true }
  ]
};

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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

/* ---------- Package lists ---------- */
function renderGroups(wrapEl, groups, onPick) {
  wrapEl.innerHTML = "";
  groups.forEach((g, gi) => {
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
      b.addEventListener("click", () => onPick(it, b));
      list.appendChild(b);
    });
    box.appendChild(list);
    wrapEl.appendChild(box);
  });
}
function markSelected(wrapEl, el) {
  $$(".item", wrapEl).forEach(x => x.classList.toggle("selected", x === el));
}

/* =====================================================
   ORDER FORM (Topup ar Like — duto-te ekoi form)
   UID add -> payment -> TrxID -> WhatsApp
   ===================================================== */
function createOrder(root, kind) {
  root.innerHTML = `
  <div class="order" hidden>
    <h2>🛒 Your Order</h2>

    <div class="sel-item">
      <div><div class="sel-name">-</div><div class="sel-unit">-</div></div>
    </div>

    <div class="row qty-row">
      <label>Quantity</label>
      <div class="qty">
        <button type="button" class="q-minus">−</button>
        <input type="number" class="q-in" value="1" min="1" max="99" inputmode="numeric">
        <button type="button" class="q-plus">+</button>
      </div>
    </div>

    <div class="total"><span>Total Price</span><b class="t-price">0 Tk</b></div>

    <div class="step"><span class="n">1</span>Free Fire Game ID (UID)</div>
    <div class="row col">
      <div class="uid-row">
        <input type="text" class="uid-in" placeholder="Example: 123456789" inputmode="numeric" maxlength="14">
        <button type="button" class="uid-add">Add</button>
      </div>
      <div class="uid-result"></div>
    </div>

    <div class="step"><span class="n">2</span>Payment Method</div>
    <div class="pay"></div>

    <div class="pay-panel" hidden>
      <div class="pp-head">
        <span class="pp-logo"><img class="pp-img" alt=""></span>
        <div><b class="pp-name">-</b><small>Send Money korun</small></div>
      </div>
      <div class="pp-line"><span>Amount</span><b class="pay-amt">0 Tk</b><button type="button" class="copy-amt">Copy</button></div>
      <div class="pp-line"><span>Number</span><b class="pay-num">-</b><button type="button" class="copy-num">Copy</button></div>
      <img class="pp-qr" alt="QR" hidden>
      <ol class="pp-steps"></ol>
    </div>

    <div class="step"><span class="n">3</span>Payment kora hoye gele</div>
    <div class="row col">
      <label>Je number theke pathiyechen</label>
      <input type="tel" class="sender" placeholder="01XXXXXXXXX" inputmode="numeric" maxlength="11">
    </div>
    <div class="row col">
      <label>Transaction ID (TrxID)</label>
      <input type="text" class="trx" placeholder="Example: 9A7B6C5D4E">
    </div>

    <p class="err"></p>
    <button class="submit" type="button">Order Confirm Korun</button>

    <div class="wa-note" hidden>
      ✅ <b>WhatsApp khule gechhe.</b> Message ta ekbar <b>Send</b> chapun, tahole order amar kache pouchabe.<br>
      WhatsApp khule nai? <a href="#" target="_blank" rel="noopener">Ekhane chapun</a>
    </div>
  </div>`;

  const box = $(".order", root);
  const q = s => $(s, box);
  let selected = null, payment = null, uid = null;

  /* ---- quantity / total ---- */
  const qtyIn = q(".q-in");
  function getQty() {
    if (selected && selected.single) return 1;
    let n = parseInt(qtyIn.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    return Math.min(99, n);
  }
  const total = () => selected ? selected.price * getQty() : 0;
  function updateTotal() {
    q(".t-price").textContent = total() + " Tk";
    renderPanel();
  }
  q(".q-minus").onclick = () => { qtyIn.value = Math.max(1, getQty() - 1); updateTotal(); };
  q(".q-plus").onclick  = () => { qtyIn.value = Math.min(99, getQty() + 1); updateTotal(); };
  qtyIn.addEventListener("input", () => { if (qtyIn.value !== "") qtyIn.value = getQty(); updateTotal(); });
  qtyIn.addEventListener("blur", () => { qtyIn.value = getQty(); updateTotal(); });

  /* ---- UID add ---- */
  const uidIn = q(".uid-in"), uidBtn = q(".uid-add"), uidRes = q(".uid-result");
  function uidMsg(cls, html) { uidRes.className = "uid-result " + cls; uidRes.innerHTML = html; }
  uidIn.addEventListener("input", () => { uidIn.value = uidIn.value.replace(/\D/g, ""); uidMsg("", ""); });
  uidIn.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); uidBtn.click(); } });
  uidBtn.onclick = () => {
    if (uid) {                                   // "Change" chaple abar edit
      uid = null; uidIn.readOnly = false;
      uidBtn.textContent = "Add"; uidBtn.classList.remove("added");
      uidMsg("", ""); uidIn.focus();
      return;
    }
    const v = uidIn.value.trim();
    if (!/^\d{6,14}$/.test(v)) return uidMsg("bad", "❌ Sothik UID din (6 theke 14 digit, shudhu number).");
    uid = v; uidIn.readOnly = true;
    uidBtn.textContent = "Change"; uidBtn.classList.add("added");
    uidMsg("ok", `✅ UID added: <b>${esc(v)}</b>`);
  };

  /* ---- payment ---- */
  const payWrap = q(".pay");
  Object.entries(CONFIG.payments).forEach(([key, p]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pm";
    b.dataset.p = key;
    b.style.setProperty("--pc", p.color || "#ff7a00");

    const lg = document.createElement("span");
    lg.className = "lg";
    const cands = [p.logo, key + ".png", "img/" + key + ".png"].filter((v, i, a) => v && a.indexOf(v) === i);
    let ci = 0;
    const img = new Image();
    img.alt = p.name;
    img.onload = () => { p._logo = cands[ci]; if (payment === key) renderPanel(); };
    img.onerror = () => {
      ci++;
      if (ci < cands.length) img.src = cands[ci];
      else { lg.classList.add("fallback"); lg.textContent = p.name[0]; }
    };
    img.src = cands[0];
    lg.appendChild(img);

    b.appendChild(lg);
    b.appendChild(document.createTextNode(p.name));
    b.onclick = () => {
      payment = key;
      $$(".pm", box).forEach(x => x.classList.toggle("active", x === b));
      renderPanel(true);
    };
    payWrap.appendChild(b);
  });

  function renderPanel(scroll) {
    const panel = q(".pay-panel");
    if (!payment) { panel.hidden = true; return; }
    const p = CONFIG.payments[payment];
    const amt = total() + " Tk";
    panel.hidden = false;
    panel.style.setProperty("--pc", p.color || "#ff7a00");
    q(".pp-name").textContent = p.name;
    const logo = q(".pp-img");
    if (p._logo) { logo.src = p._logo; logo.parentElement.style.display = ""; }
    else logo.parentElement.style.display = "none";
    q(".pay-amt").textContent = amt;
    q(".pay-num").textContent = p.number;
    const qr = q(".pp-qr");
    if (p.qr) { qr.src = p.qr; qr.hidden = false; } else qr.hidden = true;
    q(".pp-steps").innerHTML = [
      `${esc(p.name)} app open korun${p.ussd ? ` (ba <b>${esc(p.ussd)}</b> dial korun)` : ""}`,
      `<b>Send Money</b> select korun`,
      `Number din: <b>${esc(p.number)}</b>`,
      `Amount din: <b>${esc(amt)}</b>`,
      `PIN diye confirm korun`,
      `Transaction ID (TrxID) niche likhun`
    ].map(s => `<li>${s}</li>`).join("");
    if (scroll) setTimeout(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  }
  q(".copy-num").onclick = e => copyText(q(".pay-num").textContent, e.currentTarget);
  q(".copy-amt").onclick = e => copyText(String(total()), e.currentTarget);

  q(".sender").addEventListener("input", e => e.target.value = e.target.value.replace(/\D/g, ""));

  /* ---- submit -> WhatsApp ---- */
  q(".submit").onclick = () => {
    const err = q(".err");
    const sender = q(".sender").value.trim();
    const trx = q(".trx").value.trim();
    err.textContent = "";
    if (!selected)                 return err.textContent = "Age ekta package select korun.";
    if (!uid)                      return err.textContent = "UID likhe 'Add' button chapun.";
    if (!payment)                  return err.textContent = "Payment method select korun.";
    if (!/^01\d{9}$/.test(sender)) return err.textContent = "Sothik 11 digit number din (01XXXXXXXXX).";
    if (trx.length < 6)            return err.textContent = "Transaction ID din.";

    const msg =
`🛒 *NEW ORDER* (${kind})
━━━━━━━━━━━━
📦 Package: ${selected.name}
🔢 Quantity: ${getQty()}
💰 Total: ${total()} Tk
🆔 Game ID: ${uid}
💳 Method: ${CONFIG.payments[payment].name}
📱 Sender: ${sender}
🧾 TrxID: ${trx}`;

    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    const w = window.open(url, "_blank");
    if (!w) window.location.href = url;          // popup block hole shorashori
    const note = q(".wa-note");
    note.hidden = false;
    $("a", note).href = url;
    setTimeout(() => note.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
  };

  return {
    select(it) {
      selected = it;
      qtyIn.value = 1;
      q(".qty-row").hidden = !!it.single;
      q(".sel-name").textContent = it.name;
      q(".sel-unit").textContent = "Unit price: " + it.price + " Tk";
      box.hidden = false;
      updateTotal();
      setTimeout(() => box.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };
}

function initOrders() {
  const topup = createOrder($("#orderTopup"), "Topup");
  const topupList = $("#lists");
  renderGroups(topupList, ALL_GROUPS, (it, el) => { markSelected(topupList, el); topup.select(it); });

  const like = createOrder($("#orderLike"), "Profile Like");
  const likeList = $("#likeLists");
  renderGroups(likeList, [LIKES], (it, el) => { markSelected(likeList, el); like.select(it); });
}

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
  M.lw = hLogo.hidden ? 0 : hLogo.offsetWidth;
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
  const hasLogo = !hLogo.hidden && M.lw > 0;
  const x1 = hasLogo ? 56 : 16, y1 = (48 - M.th * s1) / 2;
  ft.style.transform = `translate3d(${x0 + (x1 - x0) * e}px, ${y0 + (y1 - y0) * e}px, 0) scale(${s})`;
  if (hasLogo) {
    // logo-o nam-er shathe uporer bam kone giye boshe
    const L = M.lw, sl = Math.min(1, 32 / L), ls = 1 + (sl - 1) * e;
    const lx0 = (M.vw - L) / 2, ly0 = y0 - L - 16;
    const lx1 = 14, ly1 = (48 - L * sl) / 2;
    hLogo.style.transform = `translate3d(${lx0 + (lx1 - lx0) * e}px, ${ly0 + (ly1 - ly0) * e}px, 0) scale(${ls})`;
  }
  const mini = raw >= 0.98;
  if (mini !== lastMini) { lastMini = mini; ft.classList.toggle("mini", mini); }
  hbar.style.opacity = e;
  hSub.style.opacity = Math.max(0, 1 - raw * 1.8);
  hSub.style.transform = `translateY(${-e * 24}px)`;
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

  const dx = window.innerWidth / 2 - cx, dy = window.innerHeig
