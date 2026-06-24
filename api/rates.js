// api/rates.js  — Vercel Serverless Function
// Fetches live USD exchange rates from open.er-api.com (free, no key needed)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200"); // cache 1h

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!upstream.ok) throw new Error("rates upstream error");
    const data = await upstream.json();
    // Return only the currencies we care about
    const { RUB, EUR, GBP, UAH, KZT, CNY } = data.rates;
    res.status(200).json({ RUB, EUR, GBP, UAH, KZT, CNY, base: "USD", time: data.time_last_update_utc });
  } catch (err) {
    // Fallback values so the app still works
    res.status(200).json({ RUB: 90, EUR: 0.92, GBP: 0.79, UAH: 41, KZT: 450, CNY: 7.2, base: "USD", fallback: true });
  }
}
