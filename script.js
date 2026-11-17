/* =====================================================
   CONFIG — ekhane nijer info boshan
   ===================================================== */
const CONFIG = {
  // Order ashbe ei WhatsApp number a (country code shoho, + chhara). Example: 8801XXXXXXXXX
  whatsapp: "8801XXXXXXXXX",
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

  const qty = getQty();
  const msg =
`🛒 *NEW ORDER*
━━━━━━━━━━━━
📦 Package: ${selected.name}
🔢 Quantity: ${qty}
💰 Total: ${total()} Tk
🆔 Game ID: ${uid}
💳 Method: ${CONFIG.payments[payment].name}
📱 Sender: ${sender}
🧾 TrxID: ${trx}`;

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
};

/* ---------- Init ---------- */
renderLists();
renderPay();
