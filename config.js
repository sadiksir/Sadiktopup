/* =====================================================
   CONFIG — shudhu ei file e apnar info boshan.
   Pore index.html / style.css / script.js update korleo
   ei file ar bodlate hobe na.
   ===================================================== */
const CONFIG = {
  // UID checker er Cloudflare Worker URL (API key ekhane KOKHONO likhben na)
  uidApi: "https://uidcheck.sadiksir36.workers.dev",

  // true hole UID verify na hole order dewa jabe na.
  // false hole UID checker kaj na korleo order dewa jabe (UID "verify hoy nai" likha thakbe)
  requireUidCheck: false,

  // Order ashbe ei WhatsApp number a (country code shoho, + chhara). Example: 8801XXXXXXXXX
  whatsapp: "01636376697",

  // Payment: number, logo (img folder e PNG rakhun), color, USSD code
  // qr: "img/bkash-qr.png"  -- QR image dile payment panel e dekhabe (optional)
  payments: {
    bkash:  { name: "bKash",  number: "01761645666", logo: "img/bkash.png",  color: "#e2136e", ussd: "*247#" },
    nagad:  { name: "Nagad",  number: "01761645666", logo: "img/nagad.png",  color: "#f6921e", ussd: "*167#" },
    rocket: { name: "Rocket", number: "01761645666", logo: "img/rocket.png", color: "#8c3494", ussd: "*322#" }
  }
};
