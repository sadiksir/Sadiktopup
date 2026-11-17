// Cloudflare Worker — UID checker proxy
// API key ei file e likhben NA. Cloudflare dashboard e Secret hishebe rakhun:
//   Settings -> Variables and Secrets -> Add -> Name: API_KEY  (Type: Secret)
// Optional: ALLOWED_ORIGIN = https://apnar-username.github.io   (onno site theke use thekhe ruke)

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowed === "*" ? "*" : allowed,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };
    const send = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: cors });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (allowed !== "*" && origin !== allowed) return send({ error: "Forbidden" }, 403);

    const url = new URL(request.url);
    const uid = (url.searchParams.get("uid") || "").trim();
    if (!/^\d{6,14}$/.test(uid)) return send({ error: "Invalid UID" }, 400);

    try {
      const r = await fetch(
        `https://api.gameskinbo.com/ff-info/get?uid=${uid}&region=BD`,
        { headers: { "X-API-Key": env.API_KEY, "Accept": "application/json" } }
      );
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: "Bad response from API" }; }
      return send(data, r.ok ? 200 : r.status);
    } catch (e) {
      return send({ error: "UID server e connect kora jay nai" }, 502);
    }
  }
};
