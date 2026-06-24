// api/waxpeer.js  — Vercel Serverless Function
// Proxies Waxpeer public price API to bypass browser CORS restrictions

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=360"); // cache 3 min

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const upstream = await fetch(
      "https://api.waxpeer.com/v1/prices?game=csgo",
      { headers: { Accept: "application/json" } }
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Waxpeer upstream error" });
    }

    const data = await upstream.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
