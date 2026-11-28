/* =====================================================
   CONFIG — shudhu ei file e apnar info boshan.
   Pore index.html / style.css / script.js update korleo
   ei file ar bodlate hobe na.
   ===================================================== */
const CONFIG = {
  // Order ashbe ei WhatsApp number e (country code shoho, + chhara)
  whatsapp: "8801636376697",

  // Payment number, logo (repo te bkash.png / nagad.png / rocket.png rakhun), color, USSD code
  // qr: "bkash-qr.png"  -- QR image dile payment panel e dekhabe (optional)
  payments: {
    bkash:  { name: "bKash",  number: "01761645666", logo: "bkash.png",  color: "#e2136e", ussd: "*247#" },
    nagad:  { name: "Nagad",  number: "01761645666", logo: "nagad.png",  color: "#f6921e", ussd: "*167#" },
    rocket: { name: "Rocket", number: "01761645666", logo: "rocket.png", color: "#8c3494", ussd: "*322#" }
  }
};
