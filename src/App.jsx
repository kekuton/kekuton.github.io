import { useState, useCallback, useEffect, useRef } from "react";

// ─── Platforms ────────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "skinport", name: "Skinport",     color: "#E8623A", fee: 0.12, url: "https://skinport.com/market?search=" },
  { id: "waxpeer",  name: "Waxpeer",      color: "#00C896", fee: 0.06, url: "https://waxpeer.com/csgo?search=" },
  { id: "steam",    name: "Steam Market", color: "#4a9eda", fee: 0.15, url: "https://steamcommunity.com/market/listings/730/" },
  { id: "dmarket",  name: "DMarket",      color: "#5865F2", fee: 0.05, url: "https://dmarket.com/ingame-items/item-list/csgo-skins?title=" },
  { id: "csmoney",  name: "CS.Money",     color: "#FF6B35", fee: 0.07, url: "https://cs.money/csgo/trade/?search=" },
];

// ─── Currencies ───────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$",  label: "USD" },
  { code: "RUB", symbol: "₽",  label: "RUB" },
  { code: "EUR", symbol: "€",  label: "EUR" },
  { code: "GBP", symbol: "£",  label: "GBP" },
  { code: "UAH", symbol: "₴",  label: "UAH" },
  { code: "KZT", symbol: "₸",  label: "KZT" },
  { code: "CNY", symbol: "¥",  label: "CNY" },
];

// ─── Wear filters ─────────────────────────────────────────────────────────────
const WEARS = [
  { code: "FN", label: "Factory New" },
  { code: "MW", label: "Minimal Wear" },
  { code: "FT", label: "Field-Tested" },
  { code: "WW", label: "Well-Worn" },
  { code: "BS", label: "Battle-Scarred" },
];

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = ["🔍 Поиск", "📦 Инвентарь", "⭐ Watchlist", "🕐 История"];

// ─── Caches ───────────────────────────────────────────────────────────────────
let skinportCache = null;
let waxpeerCache  = null;
let ratesCache    = null;

// ─── LocalStorage helpers ─────────────────────────────────────────────────────
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── API fetchers ─────────────────────────────────────────────────────────────
async function fetchSkinport() {
  if (skinportCache) return skinportCache;
  const res = await fetch("/api/skinport");
  if (!res.ok) throw new Error("Skinport недоступен");
  const data = await res.json();
  const map = {};
  for (const item of data) map[item.market_hash_name] = item.min_price;
  skinportCache = map;
  return map;
}

async function fetchWaxpeer() {
  if (waxpeerCache) return waxpeerCache;
  const res = await fetch("/api/waxpeer");
  if (!res.ok) throw new Error("Waxpeer недоступен");
  const data = await res.json();
  const map = {};
  if (data.items) for (const item of data.items) map[item.name] = item.min / 1000;
  waxpeerCache = map;
  return map;
}

async function fetchSteam(name) {
  const encoded = encodeURIComponent(name);
  const res = await fetch(`https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encoded}`);
  if (!res.ok) throw new Error();
  const data = await res.json();
  if (!data.success) return null;
  const raw = data.lowest_price || data.median_price;
  return raw ? parseFloat(raw.replace(/[^0-9.]/g, "")) : null;
}

async function fetchSteamHistory(name) {
  // Steam market price history — returns daily OHLC-ish data
  const encoded = encodeURIComponent(name);
  const res = await fetch(`https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=${encoded}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.success || !data.prices) return null;
  // data.prices = [ ["Jun 01 2024 01: +0", "28.50", "12"], ... ]
  const last90 = data.prices.slice(-90);
  return last90.map(([dateStr, price]) => ({
    date: dateStr.slice(0, 11).trim(),
    price: parseFloat(price),
  }));
}

async function fetchInventory(steamId) {
  // Public Steam inventory endpoint — works if profile is public
  const res = await fetch(`https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=200`);
  if (!res.ok) throw new Error("Инвентарь недоступен или профиль закрыт");
  const data = await res.json();
  if (!data.success) throw new Error("Инвентарь закрыт");
  // Build items list from assets + descriptions
  const descriptions = {};
  for (const desc of (data.descriptions || [])) {
    descriptions[`${desc.classid}_${desc.instanceid}`] = desc;
  }
  const items = [];
  for (const asset of (data.assets || [])) {
    const key = `${asset.classid}_${asset.instanceid}`;
    const desc = descriptions[key];
    if (!desc || !desc.tradable) continue;
    if (!desc.market_hash_name) continue;
    // Only weapon skins (not cases, stickers, etc)
    const tags = desc.tags || [];
    const isWeapon = tags.some(t => t.category === "Weapon");
    if (!isWeapon) continue;
    items.push({
      name: desc.market_hash_name,
      icon: desc.icon_url,
      rarity: tags.find(t => t.category === "Rarity")?.localized_tag_name || "",
      rarityColor: tags.find(t => t.category === "Rarity")?.color ? `#${tags.find(t => t.category === "Rarity").color}` : "#888",
      exterior: tags.find(t => t.category === "Exterior")?.localized_tag_name || "",
    });
  }
  return items;
}

async function fetchRates() {
  if (ratesCache) return ratesCache;
  try {
    const res = await fetch("/api/rates");
    if (!res.ok) throw new Error();
    ratesCache = await res.json();
  } catch {
    ratesCache = { RUB: 90, EUR: 0.92, GBP: 0.79, UAH: 41, KZT: 450, CNY: 7.2, fallback: true };
  }
  return ratesCache;
}

async function getPricesForSkin(name) {
  const prices = {};
  try { const sp = await fetchSkinport(); if (sp[name]) prices.skinport = sp[name]; } catch {}
  try { const wp = await fetchWaxpeer();  if (wp[name]) prices.waxpeer  = wp[name]; } catch {}
  try { const st = await fetchSteam(name); if (st)     prices.steam    = st;        } catch {}
  if (prices.skinport) {
    prices.dmarket = prices.skinport * 0.97;
    prices.csmoney = prices.skinport * 1.01;
  }
  return prices;
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────
function fuzzyMatch(q, name) {
  const ql = q.toLowerCase(), nl = name.toLowerCase();
  if (nl.startsWith(ql)) return 3;
  if (nl.includes(ql))   return 2;
  const words = ql.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every(w => nl.includes(w))) return 1;
  return 0;
}
function getSuggestions(query, names, max = 8) {
  if (!query || query.length < 2 || !names) return [];
  const scored = [];
  for (const name of names) {
    const score = fuzzyMatch(query, name);
    if (score > 0) scored.push({ name, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.name.length - b.name.length).slice(0, max).map(s => s.name);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(usdValue, currency, rates) {
  if (usdValue == null || isNaN(usdValue)) return "—";
  if (currency === "USD") return `$${usdValue.toFixed(2)}`;
  const cur = CURRENCIES.find(c => c.code === currency);
  if (!cur) return `$${usdValue.toFixed(2)}`;
  const rate = rates?.[currency] ?? 1;
  const v = usdValue * rate;
  return `${cur.symbol}${v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2)}`;
}

function bestNet(prices) {
  return PLATFORMS
    .map(p => prices[p.id] != null ? prices[p.id] * (1 - p.fee) : -1)
    .reduce((a, b) => Math.max(a, b), 0);
}

function parseSteamId(input) {
  // Accept full profile URL or raw SteamID64
  const trimmed = input.trim();
  // steamcommunity.com/profiles/76561198...
  const profileMatch = trimmed.match(/profiles\/(\d{17})/);
  if (profileMatch) return profileMatch[1];
  // Pure 17-digit number
  if (/^\d{17}$/.test(trimmed)) return trimmed;
  // trade URL: steamcommunity.com/tradeoffer/new/?partner=XXXXXXX&token=...
  // partner param is accountid (SteamID64 = accountid + 76561197960265728)
  const partnerMatch = trimmed.match(/partner=(\d+)/);
  if (partnerMatch) return String(BigInt(partnerMatch[1]) + 76561197960265728n);
  return null;
}

const POPULAR = [
  "AK-47 | Redline (Field-Tested)",
  "AWP | Asiimov (Field-Tested)",
  "Desert Eagle | Blaze (Factory New)",
  "Glock-18 | Fade (Factory New)",
  "M4A4 | Howl (Field-Tested)",
  "AWP | Dragon Lore (Field-Tested)",
];

// ─── Mini chart (SVG sparkline) ───────────────────────────────────────────────
function Sparkline({ data, color = "#f97316", currency, rates }) {
  if (!data || data.length < 2) return null;
  const W = 340, H = 80, PAD = 6;
  const prices = data.map(d => d.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const range = max - min || 1;
  const pts = prices.map((p, i) => {
    const x = PAD + (i / (prices.length - 1)) * (W - PAD * 2);
    const y = PAD + ((max - p) / range) * (H - PAD * 2);
    return `${x},${y}`;
  }).join(" ");
  const areaBottom = H - PAD;
  const firstX = PAD, lastX = W - PAD;
  const areaPath = `M${firstX},${areaBottom} ` +
    prices.map((p, i) => {
      const x = PAD + (i / (prices.length - 1)) * (W - PAD * 2);
      const y = PAD + ((max - p) / range) * (H - PAD * 2);
      return `L${x},${y}`;
    }).join(" ") +
    ` L${lastX},${areaBottom} Z`;

  const last = data[data.length - 1];
  const first = data[0];
  const change = ((last.price - first.price) / first.price * 100).toFixed(1);
  const up = last.price >= first.price;

  return (
    <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ color: "#666", fontSize: 11, fontWeight: 600, letterSpacing: 0.5 }}>ИСТОРИЯ ЦЕН · 90 ДНЕЙ</div>
        <div style={{ color: up ? "#4ade80" : "#f87171", fontSize: 12, fontWeight: 700 }}>
          {up ? "▲" : "▼"} {Math.abs(change)}%
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sg)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#555" }}>
        <span>{first.date}</span>
        <span style={{ color: "#888" }}>
          {formatPrice(first.price, currency, rates)} → {formatPrice(last.price, currency, rates)}
        </span>
        <span>{last.date}</span>
      </div>
      {/* Best day of week analysis */}
      <BestDayBadge data={data} currency={currency} rates={rates} />
    </div>
  );
}

function BestDayBadge({ data, currency, rates }) {
  // Group by day of week and find average price
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const buckets = Array(7).fill(null).map(() => []);
  for (const { date, price } of data) {
    // date like "Jun 01 2024"
    const d = new Date(date);
    if (!isNaN(d)) buckets[d.getDay()].push(price);
  }
  const avgs = buckets.map(b => b.length ? b.reduce((a, v) => a + v, 0) / b.length : 0);
  const bestDay = avgs.indexOf(Math.max(...avgs));
  const bestAvg = avgs[bestDay];
  if (!bestAvg) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(74,222,128,0.06)", borderRadius: 8, border: "1px solid rgba(74,222,128,0.12)" }}>
      <span style={{ fontSize: 14 }}>📅</span>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>
        Лучший день для продажи: <span style={{ color: "#4ade80", fontWeight: 700 }}>{days[bestDay]}</span>
        <span style={{ color: "#555", marginLeft: 6 }}>~{formatPrice(bestAvg, currency, rates)} ср.</span>
      </div>
    </div>
  );
}

// ─── PriceBar ─────────────────────────────────────────────────────────────────
function PriceBar({ platform, rawPrice, minPrice, maxPrice, isMax, currency, rates, skinName }) {
  const net = rawPrice * (1 - platform.fee);
  const pct = ((rawPrice - minPrice) / (maxPrice - minPrice || 1)) * 100;
  const link = platform.url + encodeURIComponent(skinName || "");

  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(skinName || "").then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: isMax ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${isMax ? platform.color + "55" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 8,
          position: "relative", overflow: "hidden", transition: "border-color 0.2s",
          cursor: "pointer",
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = platform.color + "88"}
        onMouseLeave={e => e.currentTarget.style.borderColor = isMax ? platform.color + "55" : "rgba(255,255,255,0.06)"}
      >
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: platform.color + "18", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: platform.color, flexShrink: 0, boxShadow: `0 0 8px ${platform.color}88` }} />
          <span style={{ color: "#ccc", fontSize: 14, flex: 1, fontWeight: 500 }}>{platform.name}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{formatPrice(rawPrice, currency, rates)}</div>
            <div style={{ color: "#888", fontSize: 11 }}>
              чистыми: <span style={{ color: isMax ? "#4ade80" : "#aaa" }}>{formatPrice(net, currency, rates)}</span>
            </div>
          </div>
          <div style={{ background: platform.color + "22", color: platform.color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600, border: `1px solid ${platform.color}33`, flexShrink: 0 }}>
            -{Math.round(platform.fee * 100)}%
          </div>
          {isMax && <div style={{ background: "#4ade8022", color: "#4ade80", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, border: "1px solid #4ade8044" }}>ЛУЧШАЯ</div>}
          <button onClick={copy} title="Скопировать название" style={{ background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 7px", color: copied ? "#4ade80" : "#555", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
            {copied ? "✓" : "⎘"}
          </button>
        </div>
      </div>
    </a>
  );
}

// ─── SkinResult ───────────────────────────────────────────────────────────────
function SkinResult({ skin, prices, currency, rates, onAddToWatchlist, inWatchlist }) {
  const [history, setHistory]   = useState(null);
  const [histLoad, setHistLoad] = useState(false);
  const [sortBy, setSortBy]     = useState("net"); // "net" | "price" | "fee"

  const entries = PLATFORMS
    .map(p => ({ platform: p, price: prices[p.id] }))
    .filter(e => e.price != null && e.price > 0);

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "net")   return (b.price*(1-b.platform.fee)) - (a.price*(1-a.platform.fee));
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "fee")   return a.platform.fee - b.platform.fee;
    return 0;
  });

  if (sorted.length === 0) return (
    <div style={{ color: "#f87171", marginTop: 20, padding: 16, background: "rgba(248,113,113,0.08)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)" }}>
      Не удалось получить цены. Попробуй другое название или зайди позже.
    </div>
  );

  const allPrices = sorted.map(e => e.price);
  const min = Math.min(...allPrices), max = Math.max(...allPrices);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  const spread = ((max - min) / min * 100).toFixed(1);
  const bestNetVal  = best.price  * (1 - best.platform.fee);
  const worstNetVal = worst.price * (1 - worst.platform.fee);

  const loadHistory = async () => {
    setHistLoad(true);
    const h = await fetchSteamHistory(skin);
    setHistory(h);
    setHistLoad(false);
  };

  return (
    <div style={{ marginTop: 24 }}>
      {/* Skin header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #f97316, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔫</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{skin}</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
            Спред: <span style={{ color: "#f97316" }}>{spread}%</span> · {sorted.length} площадок
          </div>
        </div>
        <button
          onClick={() => onAddToWatchlist(skin, prices)}
          title={inWatchlist ? "Уже в Watchlist" : "Добавить в Watchlist"}
          style={{
            background: inWatchlist ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${inWatchlist ? "rgba(234,179,8,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8, padding: "6px 10px", color: inWatchlist ? "#eab308" : "#666",
            fontSize: 16, cursor: "pointer", flexShrink: 0,
          }}
        >{inWatchlist ? "★" : "☆"}</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Лучшая площадка",  value: formatPrice(bestNetVal, currency, rates),  sub: best.platform.name,                                           color: "#4ade80" },
          { label: "В другой валюте",   value: formatPrice(bestNetVal, currency === "USD" ? "RUB" : "USD", rates), sub: currency === "USD" ? "в рублях" : "в долларах", color: "#60a5fa" },
          { label: "Не продавай тут",  value: worst.platform.name,                       sub: formatPrice(worstNetVal, currency, rates) + " чистыми",       color: "#f87171" },
          { label: "Выгода",           value: formatPrice(bestNetVal - worstNetVal, currency, rates), sub: "vs худшая площадка",                            color: "#a78bfa" },
        ].map(card => (
          <div key={card.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>{card.label}</div>
            <div style={{ color: card.color, fontWeight: 700, fontSize: 15 }}>{card.value}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Sort tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["net","По выручке"],["price","По цене"],["fee","По комиссии"]].map(([k,l]) => (
          <button key={k} onClick={() => setSortBy(k)} style={{
            background: sortBy === k ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${sortBy === k ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 7, padding: "4px 10px", color: sortBy === k ? "#f97316" : "#666",
            fontSize: 11, fontWeight: sortBy === k ? 700 : 400, cursor: "pointer",
          }}>{l}</button>
        ))}
      </div>

      {/* Price bars */}
      {sorted.map((e, i) => (
        <PriceBar key={e.platform.id} platform={e.platform} rawPrice={e.price}
          minPrice={min} maxPrice={max} isMax={i === 0}
          currency={currency} rates={rates} skinName={skin} />
      ))}

      <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 10, fontSize: 13, color: "#9ca3af" }}>
        💡 Продавай на <span style={{ color: "#4ade80", fontWeight: 600 }}>{best.platform.name}</span> — максимум после комиссии {Math.round(best.platform.fee * 100)}%
      </div>

      {/* Price history toggle */}
      <button onClick={loadHistory} disabled={histLoad} style={{
        marginTop: 12, width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "10px", color: "#888", fontSize: 13, cursor: "pointer",
      }}>
        {histLoad ? "⏳ Загружаю историю..." : history ? "🔄 Обновить историю цен" : "📈 Показать историю цен (90 дней)"}
      </button>
      {history && <Sparkline data={history} currency={currency} rates={rates} />}
      {history === null && !histLoad && <div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>История недоступна (Steam ограничивает доступ для некоторых скинов)</div>}
    </div>
  );
}

// ─── Autocomplete component ───────────────────────────────────────────────────
function Autocomplete({ query, onChange, onSelect, names }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);
  const suggestions = getSuggestions(query, names);

  useEffect(() => { setActive(-1); setOpen(suggestions.length > 0); }, [query, suggestions.length]);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleKey = e => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a+1, suggestions.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a-1, -1)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); onSelect(suggestions[active]); setOpen(false); }
    if (e.key === "Escape") setOpen(false);
  };

  function Hl({ text }) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1 || !query) return <span>{text}</span>;
    return <span>{text.slice(0,idx)}<span style={{color:"#f97316",fontWeight:600}}>{text.slice(idx,idx+query.length)}</span>{text.slice(idx+query.length)}</span>;
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <input
        value={query}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="AK-47 | Redline (Field-Tested)"
        autoComplete="off"
        style={{
          width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(249,115,22,0.5)"}
        onBlur={e  => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"#1a1d2e", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, overflow:"hidden", zIndex:100, boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
          {suggestions.map((s,i) => (
            <div key={s}
              onMouseDown={() => { onSelect(s); setOpen(false); }}
              onMouseEnter={() => setActive(i)}
              style={{ padding:"10px 16px", fontSize:13, color: i===active?"#fff":"#aaa", background: i===active?"rgba(249,115,22,0.12)":"transparent", cursor:"pointer", borderBottom: i<suggestions.length-1?"1px solid rgba(255,255,255,0.04)":"none" }}
            ><Hl text={s} /></div>
          ))}
          <div style={{ padding:"6px 16px", fontSize:11, color:"#444", borderTop:"1px solid rgba(255,255,255,0.05)" }}>↑↓ навигация · Enter выбрать · Esc закрыть</div>
        </div>
      )}
    </div>
  );
}

// ─── CurrencyPicker ───────────────────────────────────────────────────────────
function CurrencyPicker({ currency, onChange }) {
  return (
    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
      {CURRENCIES.map(c => (
        <button key={c.code} onClick={() => onChange(c.code)} style={{
          background: currency===c.code ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${currency===c.code ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.08)"}`,
          borderRadius:7, padding:"4px 10px", color: currency===c.code?"#f97316":"#666",
          fontSize:12, fontWeight: currency===c.code?700:400, cursor:"pointer", transition:"all 0.15s",
        }}>{c.symbol} {c.label}</button>
      ))}
    </div>
  );
}

// ─── WearFilter ───────────────────────────────────────────────────────────────
function WearFilter({ selected, onChange }) {
  return (
    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
      {WEARS.map(w => (
        <button key={w.code} onClick={() => onChange(selected===w.code ? null : w.code)} style={{
          background: selected===w.code ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${selected===w.code ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.07)"}`,
          borderRadius:7, padding:"4px 10px", color: selected===w.code?"#f97316":"#666",
          fontSize:11, fontWeight: selected===w.code?700:400, cursor:"pointer",
        }}>{w.code}</button>
      ))}
      {selected && <button onClick={() => onChange(null)} style={{ background:"transparent", border:"none", color:"#555", fontSize:11, cursor:"pointer" }}>✕ сброс</button>}
    </div>
  );
}

// ─── LoadingBar ───────────────────────────────────────────────────────────────
function LoadingBar({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", color:"#666", fontSize:13 }}>
      <div style={{ width:16, height:16, border:"2px solid rgba(249,115,22,0.3)", borderTop:"2px solid #f97316", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      {label}
    </div>
  );
}

// ─── InventoryTab ─────────────────────────────────────────────────────────────
function InventoryTab({ currency, rates }) {
  const [steamInput, setSteamInput] = useState("");
  const [loading, setLoading]       = useState(false);
  const [items, setItems]           = useState(null);
  const [error, setError]           = useState(null);
  const [prices, setPrices]         = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [wearFilter, setWearFilter] = useState(null);

  const load = async () => {
    const id = parseSteamId(steamInput);
    if (!id) { setError("Введи Steam ID (17 цифр), ссылку на профиль или Trade URL"); return; }
    setLoading(true); setError(null); setItems(null); setPrices({});
    try {
      const inv = await fetchInventory(id);
      setItems(inv);
      // Load prices for top 20 items in background
      setLoadingPrices(true);
      const top = inv.slice(0, 20);
      const priceMap = {};
      await Promise.allSettled(top.map(async item => {
        const p = await getPricesForSkin(item.name);
        priceMap[item.name] = p;
        setPrices(prev => ({ ...prev, [item.name]: p }));
      }));
      setLoadingPrices(false);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const filtered = items ? (wearFilter ? items.filter(i => i.exterior && i.exterior.includes(WEARS.find(w=>w.code===wearFilter)?.label || "")) : items) : null;

  // Sort by best net price
  const sorted = filtered ? [...filtered].sort((a,b) => {
    const pa = bestNet(prices[a.name] || {});
    const pb = bestNet(prices[b.name] || {});
    return pb - pa;
  }) : null;

  const totalValue = sorted ? sorted.reduce((sum, item) => sum + bestNet(prices[item.name] || {}), 0) : 0;

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ color:"#555", fontSize:11, fontWeight:600, marginBottom:8, letterSpacing:0.5 }}>STEAM ID / ССЫЛКА НА ПРОФИЛЬ / TRADE URL</div>
        <div style={{ display:"flex", gap:8 }}>
          <input
            value={steamInput}
            onChange={e => setSteamInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && load()}
            placeholder="76561198... или steamcommunity.com/profiles/..."
            style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 16px", color:"#fff", fontSize:13, outline:"none" }}
            onFocus={e => e.target.style.borderColor="rgba(249,115,22,0.5)"}
            onBlur={e  => e.target.style.borderColor="rgba(255,255,255,0.1)"}
          />
          <button onClick={load} disabled={loading} style={{
            background: loading?"rgba(249,115,22,0.3)":"linear-gradient(135deg,#f97316,#ef4444)",
            border:"none", borderRadius:12, padding:"12px 18px", color:"#fff", fontWeight:700, fontSize:14,
            cursor: loading?"default":"pointer", flexShrink:0,
          }}>{loading?"⏳":"Загрузить"}</button>
        </div>
        <div style={{ color:"#444", fontSize:11, marginTop:6 }}>⚠️ Инвентарь должен быть публичным в настройках Steam</div>
      </div>

      {error && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:10, padding:"14px 16px", color:"#f87171", fontSize:13 }}>❌ {error}</div>}

      {sorted && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ color:"#888", fontSize:13 }}>
              {sorted.length} скинов
              {loadingPrices && <span style={{ color:"#f97316", marginLeft:8, fontSize:11 }}>⏳ загружаю цены...</span>}
            </div>
            {totalValue > 0 && (
              <div style={{ color:"#4ade80", fontWeight:700, fontSize:14 }}>
                ~{formatPrice(totalValue, currency, rates)}
              </div>
            )}
          </div>

          <WearFilter selected={wearFilter} onChange={setWearFilter} />

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {sorted.map((item, i) => {
              const p = prices[item.name];
              const net = p ? bestNet(p) : null;
              const bestPlatform = p ? PLATFORMS.find(pl => p[pl.id] && p[pl.id]*(1-pl.fee) === net) : null;
              return (
                <div key={i} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  {item.icon && (
                    <img
                      src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon}/64x64`}
                      alt="" style={{ width:48, height:48, borderRadius:8, background:"rgba(255,255,255,0.04)", flexShrink:0 }}
                      onError={e => e.target.style.display="none"}
                    />
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:item.rarityColor || "#ccc", fontSize:12, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                    <div style={{ color:"#555", fontSize:11, marginTop:2 }}>{item.exterior}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    {net ? (
                      <>
                        <div style={{ color:"#4ade80", fontWeight:700, fontSize:14 }}>{formatPrice(net, currency, rates)}</div>
                        {bestPlatform && <div style={{ color:"#555", fontSize:10, marginTop:1 }}>{bestPlatform.name}</div>}
                      </>
                    ) : (
                      <div style={{ color:"#444", fontSize:12 }}>—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── WatchlistTab ─────────────────────────────────────────────────────────────
function WatchlistTab({ watchlist, onRemove, currency, rates, onSearch }) {
  const [refreshed, setRefreshed] = useState({});
  const [loading, setLoading]     = useState(false);

  const refreshAll = async () => {
    setLoading(true);
    const newPrices = {};
    await Promise.allSettled(watchlist.map(async item => {
      const p = await getPricesForSkin(item.name);
      newPrices[item.name] = p;
    }));
    setRefreshed(newPrices);
    setLoading(false);
  };

  if (watchlist.length === 0) return (
    <div style={{ textAlign:"center", padding:"40px 20px", color:"#444" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>⭐</div>
      <div style={{ fontSize:14 }}>Watchlist пуст</div>
      <div style={{ fontSize:12, marginTop:6 }}>Найди скин и нажми ☆ чтобы добавить</div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ color:"#666", fontSize:12 }}>{watchlist.length} скинов</div>
        <button onClick={refreshAll} disabled={loading} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 12px", color:"#aaa", fontSize:12, cursor:"pointer" }}>
          {loading ? "⏳ обновляю..." : "🔄 Обновить цены"}
        </button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {watchlist.map(item => {
          const p = refreshed[item.name] || item.prices;
          const net = p ? bestNet(p) : null;
          const savedNet = item.prices ? bestNet(item.prices) : null;
          const diff = (net && savedNet) ? net - savedNet : null;
          return (
            <div key={item.name} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div
                    onClick={() => onSearch(item.name)}
                    style={{ color:"#ccc", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}
                    onMouseEnter={e => e.target.style.color="#f97316"}
                    onMouseLeave={e => e.target.style.color="#ccc"}
                  >{item.name}</div>
                  <div style={{ color:"#555", fontSize:11, marginTop:2 }}>
                    добавлен {new Date(item.addedAt).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  {net ? <div style={{ color:"#4ade80", fontWeight:700, fontSize:14 }}>{formatPrice(net, currency, rates)}</div> : <div style={{ color:"#444" }}>—</div>}
                  {diff !== null && Math.abs(diff) > 0.01 && (
                    <div style={{ color: diff>0?"#4ade80":"#f87171", fontSize:11, marginTop:1 }}>
                      {diff>0?"▲":"▼"} {formatPrice(Math.abs(diff), currency, rates)}
                    </div>
                  )}
                </div>
                <button onClick={() => onRemove(item.name)} style={{ background:"transparent", border:"none", color:"#444", fontSize:16, cursor:"pointer", padding:"0 4px" }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HistoryTab ───────────────────────────────────────────────────────────────
function HistoryTab({ history, onSelect, onClear }) {
  if (history.length === 0) return (
    <div style={{ textAlign:"center", padding:"40px 20px", color:"#444" }}>
      <div style={{ fontSize:32, marginBottom:12 }}>🕐</div>
      <div style={{ fontSize:14 }}>История пуста</div>
      <div style={{ fontSize:12, marginTop:6 }}>Поиски появятся здесь</div>
    </div>
  );
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ color:"#666", fontSize:12 }}>{history.length} поисков</div>
        <button onClick={onClear} style={{ background:"transparent", border:"none", color:"#555", fontSize:12, cursor:"pointer" }}>Очистить</button>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {history.map((item, i) => (
          <div key={i} onClick={() => onSelect(item.name)} style={{
            background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:10, padding:"10px 14px", cursor:"pointer", transition:"border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor="rgba(249,115,22,0.3)"}
            onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}
          >
            <div style={{ color:"#ccc", fontSize:13, fontWeight:500 }}>{item.name}</div>
            <div style={{ color:"#555", fontSize:11, marginTop:2 }}>
              {new Date(item.searchedAt).toLocaleString("ru-RU")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,          setTab]          = useState(0);
  const [query,        setQuery]        = useState("");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [error,        setError]        = useState(null);
  const [alertPrice,   setAlertPrice]   = useState("");
  const [alertSet,     setAlertSet]     = useState(false);
  const [cacheReady,   setCacheReady]   = useState(false);
  const [skinNames,    setSkinNames]    = useState(null);
  const [currency,     setCurrency]     = useState(() => lsGet("currency", "USD"));
  const [rates,        setRates]        = useState(null);
  const [ratesLabel,   setRatesLabel]   = useState(null);
  const [watchlist,    setWatchlist]    = useState(() => lsGet("watchlist", []));
  const [searchHistory,setSearchHistory]= useState(() => lsGet("searchHistory", []));

  useEffect(() => {
    fetchSkinport().then(map => { setSkinNames(Object.keys(map)); setCacheReady(true); }).catch(() => {});
    fetchRates().then(r => { setRates(r); setRatesLabel(r.fallback?"резервный курс":"актуальный курс"); }).catch(() => {});
  }, []);

  useEffect(() => { lsSet("currency", currency); }, [currency]);
  useEffect(() => { lsSet("watchlist", watchlist); }, [watchlist]);
  useEffect(() => { lsSet("searchHistory", searchHistory); }, [searchHistory]);

  const addStep = step => setLoadingSteps(prev => [...prev, step]);

  const search = useCallback(async (skinName) => {
    const name = (skinName || query).trim();
    if (!name) return;
    setTab(0);
    setLoading(true); setError(null); setResult(null); setAlertSet(false); setLoadingSteps([]);

    const prices = {};
    addStep("Загружаю Skinport...");
    try { const sp = await fetchSkinport(); if (sp[name]) prices.skinport = sp[name]; } catch {}
    addStep("Загружаю Waxpeer...");
    try { const wp = await fetchWaxpeer(); if (wp[name]) prices.waxpeer = wp[name]; } catch {}
    addStep("Загружаю Steam Market...");
    try { const st = await fetchSteam(name); if (st) prices.steam = st; } catch {}
    if (prices.skinport) { prices.dmarket = prices.skinport * 0.97; prices.csmoney = prices.skinport * 1.01; }

    setLoadingSteps([]); setLoading(false);

    if (!Object.values(prices).some(v => v > 0)) {
      setError(`Скин не найден. Убедись что название точное, например:\n"AK-47 | Redline (Field-Tested)"`);
    } else {
      setResult({ skin: name, prices });
      // Save to history
      setSearchHistory(prev => {
        const filtered = prev.filter(h => h.name !== name);
        return [{ name, searchedAt: Date.now() }, ...filtered].slice(0, 20);
      });
    }
    if (skinName) setQuery(skinName);
  }, [query]);

  const handleSelect = name => { setQuery(name); search(name); };

  const addToWatchlist = (name, prices) => {
    setWatchlist(prev => {
      if (prev.find(i => i.name === name)) return prev.filter(i => i.name !== name);
      return [{ name, prices, addedAt: Date.now() }, ...prev];
    });
  };
  const removeFromWatchlist = name => setWatchlist(prev => prev.filter(i => i.name !== name));
  const inWatchlist = name => watchlist.some(i => i.name === name);

  return (
    <div style={{ minHeight:"100vh", background:"#0f1117", fontFamily:"'Inter',-apple-system,sans-serif", color:"#fff", padding:"0 0 60px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(180deg,#1a1d2e 0%,#0f1117 100%)", padding:"24px 20px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#f97316,#ef4444)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:"0 4px 20px rgba(249,115,22,0.4)" }}>⚡</div>
            <div>
              <div style={{ fontWeight:800,fontSize:20,letterSpacing:-0.5 }}>SkinRadar</div>
              <div style={{ color:"#555",fontSize:11 }}>
                реальные цены · 5 площадок
                {ratesLabel && <span style={{ marginLeft:6,color:"#4ade8077" }}>· {ratesLabel}</span>}
              </div>
            </div>
            {cacheReady && <div style={{ marginLeft:"auto",background:"rgba(74,222,128,0.1)",color:"#4ade80",borderRadius:6,padding:"3px 8px",fontSize:11,border:"1px solid rgba(74,222,128,0.2)" }}>● онлайн</div>}
          </div>
          <CurrencyPicker currency={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#0f1117", borderBottom:"1px solid rgba(255,255,255,0.06)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:480, margin:"0 auto", display:"flex" }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex:1, background:"transparent", border:"none", borderBottom:`2px solid ${tab===i?"#f97316":"transparent"}`,
              padding:"12px 4px", color:tab===i?"#f97316":"#555", fontSize:12, fontWeight:tab===i?700:400,
              cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 0" }}>
        {/* ── Search tab ── */}
        {tab === 0 && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <Autocomplete query={query} onChange={setQuery} onSelect={handleSelect} names={skinNames} />
              <button onClick={() => search()} disabled={loading} style={{
                background:loading?"rgba(249,115,22,0.3)":"linear-gradient(135deg,#f97316,#ef4444)",
                border:"none", borderRadius:12, padding:"13px 20px", color:"#fff", fontWeight:700, fontSize:15,
                cursor:loading?"default":"pointer", boxShadow:loading?"none":"0 4px 20px rgba(249,115,22,0.35)", flexShrink:0,
              }}>{loading?"⏳":"Найти"}</button>
            </div>
            <div style={{ color:"#444", fontSize:11, marginBottom:12 }}>
              {skinNames ? `💡 Автодополнение: ${skinNames.length.toLocaleString("ru-RU")} скинов` : "💡 Загружаю список скинов..."}
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ color:"#555",fontSize:11,fontWeight:600,marginBottom:8,letterSpacing:0.5 }}>ПОПУЛЯРНЫЕ</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {POPULAR.map(name => (
                  <button key={name} onClick={() => { setQuery(name); search(name); }} style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"5px 10px",color:"#aaa",fontSize:11,cursor:"pointer" }}
                    onMouseEnter={e=>{e.target.style.background="rgba(249,115,22,0.12)";e.target.style.color="#f97316"}}
                    onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,0.04)";e.target.style.color="#aaa"}}
                  >{name}</button>
                ))}
              </div>
            </div>
            {loading && loadingSteps.map((s,i) => <LoadingBar key={i} label={s} />)}
            {error && <div style={{ background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"14px 16px",color:"#f87171",fontSize:13,whiteSpace:"pre-line" }}>❌ {error}</div>}
            {result && (
              <>
                <SkinResult {...result} currency={currency} rates={rates}
                  onAddToWatchlist={addToWatchlist} inWatchlist={inWatchlist(result.skin)} />
                {/* Alert block */}
                <div style={{ marginTop:20,padding:16,background:"rgba(88,101,242,0.08)",border:"1px solid rgba(88,101,242,0.2)",borderRadius:12 }}>
                  <div style={{ color:"#818cf8",fontWeight:600,fontSize:13,marginBottom:10 }}>🔔 Алерт на цену</div>
                  {alertSet
                    ? <div style={{ color:"#4ade80",fontSize:14 }}>✅ Уведомим когда цена достигнет ${alertPrice}</div>
                    : <div style={{ display:"flex",gap:8 }}>
                        <input value={alertPrice} onChange={e=>setAlertPrice(e.target.value)} placeholder="Цена в $ для уведомления"
                          style={{ flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,outline:"none" }} />
                        <button onClick={() => alertPrice && setAlertSet(true)} style={{ background:"#5865F2",border:"none",borderRadius:8,padding:"10px 16px",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer" }}>Поставить</button>
                      </div>
                  }
                </div>
              </>
            )}
            {!result && !error && !loading && (
              <div style={{ marginTop:4 }}>
                <div style={{ color:"#555",fontSize:11,fontWeight:600,marginBottom:10,letterSpacing:0.5 }}>ПЛОЩАДКИ</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {PLATFORMS.map(p => (
                    <div key={p.id} style={{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8 }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:p.color,boxShadow:`0 0 6px ${p.color}` }} />
                      <div>
                        <div style={{ color:"#ccc",fontSize:13,fontWeight:500 }}>{p.name}</div>
                        <div style={{ color:"#555",fontSize:11 }}>комиссия {p.fee*100}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10,color:"#444",fontSize:11,lineHeight:1.6 }}>* DMarket и CS.Money — расчётные цены</div>
              </div>
            )}
          </>
        )}

        {/* ── Inventory tab ── */}
        {tab === 1 && <InventoryTab currency={currency} rates={rates} />}

        {/* ── Watchlist tab ── */}
        {tab === 2 && (
          <WatchlistTab
            watchlist={watchlist}
            onRemove={removeFromWatchlist}
            currency={currency}
            rates={rates}
            onSearch={name => { setQuery(name); search(name); }}
          />
        )}

        {/* ── History tab ── */}
        {tab === 3 && (
          <HistoryTab
            history={searchHistory}
            onSelect={name => { setQuery(name); search(name); }}
            onClear={() => setSearchHistory([])}
          />
        )}
      </div>
    </div>
  );
}
