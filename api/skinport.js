// api/skinport.js  — Vercel Serverless Function
// Proxies Skinport public API to bypass browser CORS restrictions

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); // cache 5 min on CDN

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const upstream = await fetch(
      "https://api.skinport.com/v1/items?app_id=730&currency=USD",
      { headers: { Accept: "application/json" } }
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Skinport upstream error" });
    }

    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
