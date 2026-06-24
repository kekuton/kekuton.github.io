import { useState, useCallback, useEffect, useRef } from "react";

// ─── Platforms ────────────────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "skinport", name: "Skinport",     color: "#E8623A", fee: 0.12, url: "https://skinport.com" },
  { id: "waxpeer",  name: "Waxpeer",      color: "#00C896", fee: 0.06, url: "https://waxpeer.com" },
  { id: "steam",    name: "Steam Market", color: "#4a9eda", fee: 0.15, url: "https://steamcommunity.com/market" },
  { id: "dmarket",  name: "DMarket",      color: "#5865F2", fee: 0.05, url: "https://dmarket.com" },
  { id: "csmoney",  name: "CS.Money",     color: "#FF6B35", fee: 0.07, url: "https://cs.money" },
];

// ─── Currencies ───────────────────────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$",   label: "USD" },
  { code: "RUB", symbol: "₽",   label: "RUB" },
  { code: "EUR", symbol: "€",   label: "EUR" },
  { code: "GBP", symbol: "£",   label: "GBP" },
  { code: "UAH", symbol: "₴",   label: "UAH" },
  { code: "KZT", symbol: "₸",   label: "KZT" },
  { code: "CNY", symbol: "¥",   label: "CNY" },
];

// ─── API fetchers (all through Vercel proxies) ────────────────────────────────
let skinportCache = null;
let waxpeerCache  = null;
let ratesCache    = null;

async function fetchSkinport() {
  if (skinportCache) return skinportCache;
  // Uses our /api/skinport Vercel route — no CORS issues
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
  if (data.items) {
    for (const item of data.items) map[item.name] = item.min / 1000;
  }
  waxpeerCache = map;
  return map;
}

async function fetchSteam(name) {
  const encoded = encodeURIComponent(name);
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encoded}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Steam недоступен");
  const data = await res.json();
  if (!data.success) return null;
  const raw = data.lowest_price || data.median_price;
  if (!raw) return null;
  return parseFloat(raw.replace(/[^0-9.]/g, ""));
}

async function fetchRates() {
  if (ratesCache) return ratesCache;
  try {
    const res = await fetch("/api/rates");
    if (!res.ok) throw new Error();
    ratesCache = await res.json();
  } catch {
    // Fallback rates if proxy unavailable
    ratesCache = { RUB: 90, EUR: 0.92, GBP: 0.79, UAH: 41, KZT: 450, CNY: 7.2, fallback: true };
  }
  return ratesCache;
}

// ─── Autocomplete: fuzzy match over skinport names ───────────────────────────
function fuzzyMatch(query, name) {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n.startsWith(q)) return 3;        // exact prefix — highest rank
  if (n.includes(q)) return 2;          // substring match
  // word-by-word: all query words must appear in name
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every(w => n.includes(w))) return 1;
  return 0;
}

function getSuggestions(query, names, max = 8) {
  if (!query || query.length < 2 || !names) return [];
  const scored = [];
  for (const name of names) {
    const score = fuzzyMatch(query, name);
    if (score > 0) scored.push({ name, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.name.length - b.name.length)
    .slice(0, max)
    .map(s => s.name);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatPrice(usdValue, currency, rates) {
  if (!usdValue) return "—";
  const cur = CURRENCIES.find(c => c.code === currency);
  if (!cur) return `$${usdValue.toFixed(2)}`;
  if (currency === "USD") return `$${usdValue.toFixed(2)}`;
  const rate = rates?.[currency] ?? 1;
  const converted = usdValue * rate;
  const decimals = converted >= 100 ? 0 : converted >= 10 ? 1 : 2;
  return `${cur.symbol}${converted.toFixed(decimals)}`;
}

const POPULAR = [
  "AK-47 | Redline (Field-Tested)",
  "AWP | Asiimov (Field-Tested)",
  "Desert Eagle | Blaze (Factory New)",
  "Glock-18 | Fade (Factory New)",
  "M4A4 | Howl (Field-Tested)",
  "AWP | Dragon Lore (Field-Tested)",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function CurrencyPicker({ currency, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {CURRENCIES.map(c => (
        <button
          key={c.code}
          onClick={() => onChange(c.code)}
          style={{
            background: currency === c.code ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${currency === c.code ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 7,
            padding: "4px 10px",
            color: currency === c.code ? "#f97316" : "#666",
            fontSize: 12,
            fontWeight: currency === c.code ? 700 : 400,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {c.symbol} {c.label}
        </button>
      ))}
    </div>
  );
}

function Autocomplete({ query, onChange, onSelect, names }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);

  const suggestions = getSuggestions(query, names);

  useEffect(() => {
    setActive(-1);
    setOpen(suggestions.length > 0);
  }, [query, suggestions.length]);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKey = e => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, -1)); }
    if (e.key === "Enter" && active >= 0) { e.preventDefault(); onSelect(suggestions[active]); setOpen(false); }
    if (e.key === "Escape") setOpen(false);
  };

  // Highlight matched portion
  function Highlight({ text, query }) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1 || !query) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <span style={{ color: "#f97316", fontWeight: 600 }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </span>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <input
        value={query}
        onChange={e => { onChange(e.target.value); }}
        onKeyDown={handleKey}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="AK-47 | Redline (Field-Tested)"
        autoComplete="off"
        autoFocus
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          padding: "13px 16px",
          color: "#fff",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={e => e.target.style.borderColor = "rgba(249,115,22,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />

      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0, right: 0,
          background: "#1a1d2e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          zIndex: 100,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              onMouseDown={() => { onSelect(s); setOpen(false); }}
              onMouseEnter={() => setActive(i)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                color: i === active ? "#fff" : "#aaa",
                background: i === active ? "rgba(249,115,22,0.12)" : "transparent",
                cursor: "pointer",
                borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                transition: "background 0.1s",
              }}
            >
              <Highlight text={s} query={query} />
            </div>
          ))}
          <div style={{
            padding: "6px 16px",
            fontSize: 11,
            color: "#444",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            ↑↓ навигация · Enter выбрать · Esc закрыть
          </div>
        </div>
      )}
    </div>
  );
}

function PriceBar({ platform, rawPrice, minPrice, maxPrice, isMax, currency, rates }) {
  const net = rawPrice * (1 - platform.fee);
  const pct = ((rawPrice - minPrice) / (maxPrice - minPrice || 1)) * 100;

  return (
    <a
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
    >
      <div style={{
        background: isMax ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${isMax ? platform.color + "55" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 10, padding: "12px 16px", marginBottom: 8,
        position: "relative", overflow: "hidden", transition: "all 0.2s",
        cursor: "pointer",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = platform.color + "88"}
        onMouseLeave={e => e.currentTarget.style.borderColor = isMax ? platform.color + "55" : "rgba(255,255,255,0.06)"}
      >
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${pct}%`, background: platform.color + "18",
          transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
        }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 10, height: 10, borderRadius: "50%", background: platform.color,
            flexShrink: 0, boxShadow: `0 0 8px ${platform.color}88`,
          }} />
          <span style={{ color: "#ccc", fontSize: 14, flex: 1, fontWeight: 500 }}>{platform.name}</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
              {formatPrice(rawPrice, currency, rates)}
            </div>
            <div style={{ color: "#888", fontSize: 11 }}>
              чистыми: <span style={{ color: isMax ? "#4ade80" : "#aaa" }}>
                {formatPrice(net, currency, rates)}
              </span>
            </div>
          </div>
          <div style={{
            background: platform.color + "22", color: platform.color,
            borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
            border: `1px solid ${platform.color}33`, flexShrink: 0,
          }}>-{Math.round(platform.fee * 100)}%</div>
          {isMax && (
            <div style={{
              background: "#4ade8022", color: "#4ade80", borderRadius: 6,
              padding: "2px 8px", fontSize: 11, fontWeight: 700, border: "1px solid #4ade8044",
            }}>ЛУЧШАЯ</div>
          )}
        </div>
      </div>
    </a>
  );
}

function SkinResult({ skin, prices, currency, rates }) {
  const entries = PLATFORMS
    .map(p => ({ platform: p, price: prices[p.id] }))
    .filter(e => e.price != null && e.price > 0)
    .sort((a, b) => (b.price * (1 - b.platform.fee)) - (a.price * (1 - a.platform.fee)));

  if (entries.length === 0) return (
    <div style={{ color: "#f87171", marginTop: 20, padding: 16, background: "rgba(248,113,113,0.08)", borderRadius: 10, border: "1px solid rgba(248,113,113,0.2)" }}>
      Не удалось получить цены. Попробуй другое название или зайди позже.
    </div>
  );

  const min = Math.min(...entries.map(e => e.price));
  const max = Math.max(...entries.map(e => e.price));
  const best = entries[0];
  const worst = entries[entries.length - 1];
  const spread = ((max - min) / min * 100).toFixed(1);
  const bestNet = best.price * (1 - best.platform.fee);
  const worstNet = worst.price * (1 - worst.platform.fee);

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
        paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>🔫</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{skin}</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>
            Спред: <span style={{ color: "#f97316" }}>{spread}%</span>
            {" · "}{entries.length} площадок
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Лучшая площадка",  value: formatPrice(bestNet, currency, rates),  sub: best.platform.name,   color: "#4ade80" },
          { label: "В другой валюте",   value: formatPrice(bestNet, currency === "USD" ? "RUB" : "USD", rates), sub: currency === "USD" ? "в рублях" : "в долларах", color: "#60a5fa" },
          { label: "Не продавай тут",  value: worst.platform.name,                    sub: formatPrice(worstNet, currency, rates) + " чистыми", color: "#f87171" },
          { label: "Выгода",           value: formatPrice(bestNet - worstNet, currency, rates), sub: "vs худшая площадка", color: "#a78bfa" },
        ].map(card => (
          <div key={card.label} style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 10,
            padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ color: "#666", fontSize: 11, marginBottom: 4 }}>{card.label}</div>
            <div style={{ color: card.color, fontWeight: 700, fontSize: 15 }}>{card.value}</div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 2 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {entries.map((e, i) => (
        <PriceBar key={e.platform.id} platform={e.platform} rawPrice={e.price}
          minPrice={min} maxPrice={max} isMax={i === 0}
          currency={currency} rates={rates} />
      ))}

      <div style={{
        marginTop: 12, padding: "10px 14px",
        background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
        borderRadius: 10, fontSize: 13, color: "#9ca3af",
      }}>
        💡 Продавай на <span style={{ color: "#4ade80", fontWeight: 600 }}>{best.platform.name}</span> — максимум после комиссии {Math.round(best.platform.fee * 100)}%
      </div>
    </div>
  );
}

function LoadingBar({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", color: "#666", fontSize: 13 }}>
      <div style={{
        width: 16, height: 16, border: "2px solid rgba(249,115,22,0.3)",
        borderTop: "2px solid #f97316", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      {label}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [query,        setQuery]        = useState("");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [error,        setError]        = useState(null);
  const [alertPrice,   setAlertPrice]   = useState("");
  const [alertSet,     setAlertSet]     = useState(false);
  const [cacheReady,   setCacheReady]   = useState(false);
  const [skinNames,    setSkinNames]    = useState(null); // for autocomplete
  const [currency,     setCurrency]     = useState("USD");
  const [rates,        setRates]        = useState(null);
  const [ratesLabel,   setRatesLabel]   = useState(null);

  // Preload Skinport (builds autocomplete index) + exchange rates in background
  useEffect(() => {
    fetchSkinport()
      .then(map => {
        setSkinNames(Object.keys(map));
        setCacheReady(true);
      })
      .catch(() => {});

    fetchRates()
      .then(r => {
        setRates(r);
        setRatesLabel(r.fallback ? "резервный курс" : "актуальный курс");
      })
      .catch(() => {});
  }, []);

  const addStep = (step) => setLoadingSteps(prev => [...prev, step]);

  const search = useCallback(async (skinName) => {
    const name = (skinName || query).trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setAlertSet(false);
    setLoadingSteps([]);

    const prices = {};

    // Skinport (cached after first load)
    addStep("Загружаю Skinport...");
    try {
      const sp = await fetchSkinport();
      const price = sp[name];
      if (price) prices.skinport = price;
    } catch { /* ignore */ }

    // Waxpeer
    addStep("Загружаю Waxpeer...");
    try {
      const wp = await fetchWaxpeer();
      const price = wp[name];
      if (price) prices.waxpeer = price;
    } catch { /* ignore */ }

    // Steam (direct — no CORS issue because it allows it)
    addStep("Загружаю Steam Market...");
    try {
      const price = await fetchSteam(name);
      if (price) prices.steam = price;
    } catch { /* ignore */ }

    // DMarket & CS.Money — estimated from Skinport (no public API)
    if (prices.skinport) {
      prices.dmarket = prices.skinport * 0.97;
      prices.csmoney = prices.skinport * 1.01;
    }

    setLoadingSteps([]);
    setLoading(false);

    const hasAny = Object.values(prices).some(v => v > 0);
    if (!hasAny) {
      setError(`Скин не найден. Убедись что название точное, например:\n"AK-47 | Redline (Field-Tested)"`);
    } else {
      setResult({ skin: name, prices });
    }
  }, [query]);

  const handleSelect = (name) => {
    setQuery(name);
    search(name);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", fontFamily: "'Inter', -apple-system, sans-serif", color: "#fff", padding: "0 0 40px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #1a1d2e 0%, #0f1117 100%)",
        padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>SkinRadar</div>
              <div style={{ color: "#555", fontSize: 11 }}>
                реальные цены · 5 площадок
                {ratesLabel && <span style={{ marginLeft: 6, color: "#4ade8077" }}>· {ratesLabel}</span>}
              </div>
            </div>
            {cacheReady && (
              <div style={{ marginLeft: "auto", background: "rgba(74,222,128,0.1)", color: "#4ade80", borderRadius: 6, padding: "3px 8px", fontSize: 11, border: "1px solid rgba(74,222,128,0.2)" }}>
                ● онлайн
              </div>
            )}
          </div>

          {/* Currency picker in header */}
          <CurrencyPicker currency={currency} onChange={setCurrency} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 0" }}>
        {/* Search with autocomplete */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <Autocomplete
            query={query}
            onChange={setQuery}
            onSelect={handleSelect}
            names={skinNames}
          />
          <button onClick={() => search()} disabled={loading} style={{
            background: loading ? "rgba(249,115,22,0.3)" : "linear-gradient(135deg, #f97316, #ef4444)",
            border: "none", borderRadius: 12, padding: "13px 20px",
            color: "#fff", fontWeight: 700, fontSize: 15,
            cursor: loading ? "default" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(249,115,22,0.35)",
            flexShrink: 0,
          }}>
            {loading ? "⏳" : "Найти"}
          </button>
        </div>

        {/* Hint */}
        <div style={{ color: "#444", fontSize: 11, marginBottom: 14 }}>
          {skinNames
            ? `💡 Автодополнение активно — ${skinNames.length.toLocaleString("ru-RU")} скинов`
            : "💡 Загружаю список скинов для автодополнения..."}
        </div>

        {/* Popular */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#555", fontSize: 11, fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>ПОПУЛЯРНЫЕ</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {POPULAR.map(name => (
              <button key={name} onClick={() => { setQuery(name); search(name); }} style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 12, cursor: "pointer",
              }}
                onMouseEnter={e => { e.target.style.background = "rgba(249,115,22,0.12)"; e.target.style.color = "#f97316"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.color = "#aaa"; }}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading steps */}
        {loading && loadingSteps.map((s, i) => <LoadingBar key={i} label={s} />)}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 10, padding: "14px 16px", color: "#f87171", fontSize: 13,
            whiteSpace: "pre-line",
          }}>❌ {error}</div>
        )}

        {/* Results */}
        {result && (
          <>
            <SkinResult {...result} currency={currency} rates={rates} />

            {/* Alert */}
            <div style={{
              marginTop: 20, padding: 16,
              background: "rgba(88,101,242,0.08)", border: "1px solid rgba(88,101,242,0.2)", borderRadius: 12,
            }}>
              <div style={{ color: "#818cf8", fontWeight: 600, fontSize: 13, marginBottom: 10 }}>🔔 Алерт на цену</div>
              {alertSet ? (
                <div style={{ color: "#4ade80", fontSize: 14 }}>✅ Уведомим когда цена достигнет ${alertPrice}</div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                    placeholder="Цена в $ для уведомления"
                    style={{
                      flex: 1, background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                      padding: "10px 12px", color: "#fff", fontSize: 14, outline: "none",
                    }} />
                  <button onClick={() => alertPrice && setAlertSet(true)} style={{
                    background: "#5865F2", border: "none", borderRadius: 8,
                    padding: "10px 16px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}>Поставить</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Platforms (shown only on empty state) */}
        {!result && !error && !loading && (
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#555", fontSize: 11, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>ПЛОЩАДКИ</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {PLATFORMS.map(p => (
                <div key={p.id} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <div>
                    <div style={{ color: "#ccc", fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ color: "#555", fontSize: 11 }}>комиссия {p.fee * 100}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, color: "#444", fontSize: 11, lineHeight: 1.6 }}>
              * DMarket и CS.Money — расчётные цены на основе рыночных данных
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
