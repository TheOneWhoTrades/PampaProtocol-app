import { useState, useEffect, useRef } from "react";

// ── PALETA CAMPO ARGENTINO ────────────────────────────────────────────────
const G = {
  bg:        "#1a2e1a",      // verde campo profundo
  bgMid:     "#223322",      // verde medio
  bgCard:    "#1e2e1e",      // card oscuro
  bgPanel:   "#162416",      // panel más oscuro
  bgLight:   "#2a3f2a",      // verde claro interior
  border:    "#3a5c3a",      // borde verde musgo
  borderLight:"#4a7a4a",
  cream:     "#f5f0e8",      // crema principal
  creamDim:  "#c8bfa8",      // crema apagado
  creamDark: "#9e9078",      // crema oscuro
  green1:    "#5a8f3c",      // verde activo
  green2:    "#7ab648",      // verde brillante
  green3:    "#a8d470",      // verde claro acento
  red:       "#c0392b",      // rojo campo
  redLight:  "#e74c3c",
  gold:      "#c9a84c",      // dorado trigo
  goldLight: "#e8c96a",
  text:      "#f0ece0",      // texto principal crema
  textDim:   "#8aad6e",      // texto apagado verde
  white:     "#ffffff",
};

const ARS_RATE = 1180;

// ── SVG VACA DECORATIVA ───────────────────────────────────────────────────
const CowSVG = ({ size = 48, opacity = 0.07, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
    style={{ ...style, opacity }}>
    {/* cuerpo */}
    <ellipse cx="50" cy="58" rx="30" ry="20" fill={G.cream}/>
    {/* cabeza */}
    <ellipse cx="78" cy="46" rx="14" ry="11" fill={G.cream}/>
    {/* orejas */}
    <ellipse cx="68" cy="38" rx="5" ry="3" fill={G.cream} transform="rotate(-20 68 38)"/>
    <ellipse cx="90" cy="38" rx="5" ry="3" fill={G.cream} transform="rotate(20 90 38)"/>
    {/* cuernos */}
    <path d="M70 37 Q65 28 60 30" stroke={G.cream} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M86 37 Q91 28 96 30" stroke={G.cream} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    {/* patas */}
    <rect x="25" y="74" width="7" height="16" rx="3" fill={G.cream}/>
    <rect x="38" y="74" width="7" height="16" rx="3" fill={G.cream}/>
    <rect x="52" y="74" width="7" height="16" rx="3" fill={G.cream}/>
    <rect x="65" y="74" width="7" height="16" rx="3" fill={G.cream}/>
    {/* manchas */}
    <ellipse cx="40" cy="55" rx="8" ry="6" fill="#1a2e1a" opacity="0.5"/>
    <ellipse cx="58" cy="62" rx="6" ry="4" fill="#1a2e1a" opacity="0.5"/>
    {/* ojo */}
    <circle cx="82" cy="45" r="2" fill="#1a2e1a"/>
    {/* nariz */}
    <ellipse cx="90" cy="52" rx="5" ry="3.5" fill={G.creamDim}/>
    <circle cx="88" cy="52" r="1" fill="#333"/>
    <circle cx="92" cy="52" r="1" fill="#333"/>
    {/* rabo */}
    <path d="M20 55 Q10 50 12 60 Q14 65 20 63" stroke={G.cream} strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

// ── PATRON DE FONDO (vacas repetidas) ────────────────────────────────────
const BgPattern = () => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden",
  }}>
    {/* gradient overlay */}
    <div style={{
      position: "absolute", inset: 0,
      background: `radial-gradient(ellipse at 20% 50%, #2d4a1e44 0%, transparent 60%),
                   radial-gradient(ellipse at 80% 20%, #1a3a1a44 0%, transparent 50%),
                   radial-gradient(ellipse at 60% 80%, #223322aa 0%, transparent 40%)`,
    }}/>
    {/* vacas decorativas */}
    {[
      { top:"8%",  left:"5%",  size:90,  rot:0   },
      { top:"15%", left:"88%", size:70,  rot:180 },
      { top:"45%", left:"2%",  size:60,  rot:15  },
      { top:"65%", left:"92%", size:80,  rot:-10 },
      { top:"80%", left:"15%", size:55,  rot:5   },
      { top:"30%", left:"50%", size:45,  rot:180 },
      { top:"88%", left:"70%", size:65,  rot:0   },
    ].map((v, i) => (
      <div key={i} style={{
        position: "absolute", top: v.top, left: v.left,
        transform: `rotate(${v.rot}deg)`, opacity: 0.045,
      }}>
        <CowSVG size={v.size} opacity={1}/>
      </div>
    ))}
    {/* línea horizontal decorativa */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent, ${G.green2}88, ${G.gold}88, transparent)`,
    }}/>
  </div>
);

// ── TOKENS ────────────────────────────────────────────────────────────────
const TOKENS = {
  HFORD: { name: "Hereford Token", ticker: "HFORD", basePrice: 124.5,  color: G.cream,    colorDim: G.creamDim,  desc: "Raza Hereford — carne premium de exportación",    icon: "🐄" },
  ANG:   { name: "Angus Token",    ticker: "ANG",   basePrice: 148.2,  color: G.green3,   colorDim: G.green2,    desc: "Aberdeen Angus — alto marbling, cortes selectos",  icon: "🐂" },
  BRAF:  { name: "Braford Token",  ticker: "BRAF",  basePrice: 98.75,  color: G.goldLight, colorDim: G.gold,     desc: "Braford — rusticidad y rendimiento en feed lot",   icon: "🐃" },
};

function genHistory(base) {
  const candles = [];
  let price = base * 0.85;
  for (let i = 0; i < 90; i++) {
    const change = (Math.random() - 0.48) * price * 0.025;
    const open = price;
    const close = Math.max(price + change, 1);
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low  = Math.min(open, close) * (1 - Math.random() * 0.012);
    candles.push({ open, close, high, low, vol: Math.random() * 5000 + 500 });
    price = close;
  }
  return candles;
}

const FAKE_USERS = ["Estancia_LaPampa","CampoLargo","ToroNegro_SRL","VakaBit","PampasTrader","GanadoPro","FieldToken","ChacareroX","LagunaSeca","ElOmbu"];
function genOrders(ticker, basePrice) {
  const buys = [], sells = [];
  for (let i = 0; i < 8; i++) {
    buys.push({
      id: `b-${ticker}-${i}`,
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      price: +(basePrice * (0.97 - i * 0.005) + (Math.random()-0.5) * 0.5).toFixed(2),
      qty:   +(Math.random() * 200 + 10).toFixed(0),
      payment: ["Transferencia","Wise","USDT","Efectivo"][Math.floor(Math.random()*4)],
    });
    sells.push({
      id: `s-${ticker}-${i}`,
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      price: +(basePrice * (1.03 + i * 0.005) + (Math.random()-0.5) * 0.5).toFixed(2),
      qty:   +(Math.random() * 200 + 10).toFixed(0),
      payment: ["Transferencia","Wise","USDT","Efectivo"][Math.floor(Math.random()*4)],
    });
  }
  return { buys, sells };
}

// ── CANDLE CHART ──────────────────────────────────────────────────────────
function CandleChart({ candles, color, height = 160 }) {
  const W = 900, H = height;
  const visible = candles.slice(-60);
  const prices = visible.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...prices), maxP = Math.max(...prices);
  const scaleY = v => H - ((v - minP) / (maxP - minP + 0.001)) * (H - 10) - 5;
  const cw = W / visible.length;
  const gradId = `g${color.replace(/[^a-z0-9]/gi,'')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      {[0.25,0.5,0.75].map(t => (
        <line key={t} x1={0} x2={W} y1={H*t} y2={H*t}
          stroke={G.border} strokeWidth={0.6} strokeDasharray="3,6"/>
      ))}
      <path
        d={[
          `M ${cw*.5} ${scaleY(visible[0].close)}`,
          ...visible.map((c,i) => `L ${cw*i+cw*.5} ${scaleY(c.close)}`),
          `L ${cw*(visible.length-.5)} ${H}`,
          `L ${cw*.5} ${H}`, "Z"
        ].join(" ")}
        fill={`url(#${gradId})`}
      />
      {visible.map((c,i) => {
        const up = c.close >= c.open;
        const col = up ? G.green2 : G.red;
        const y1 = scaleY(Math.max(c.open,c.close));
        const y2 = scaleY(Math.min(c.open,c.close));
        return (
          <g key={i}>
            <line x1={cw*i+cw/2} x2={cw*i+cw/2} y1={scaleY(c.high)} y2={scaleY(c.low)}
              stroke={col} strokeWidth={0.9}/>
            <rect x={cw*i+cw*.15} y={y1} width={cw*.7} height={Math.max(y2-y1,1)}
              fill={col} rx={1}/>
          </g>
        );
      })}
      {(() => {
        const lp = scaleY(visible[visible.length-1].close);
        return <line x1={0} x2={W} y1={lp} y2={lp}
          stroke={color} strokeWidth={1} strokeDasharray="5,5" opacity={0.7}/>;
      })()}
    </svg>
  );
}

// ── ESTILOS BASE ──────────────────────────────────────────────────────────
const S = {
  // layout
  app: {
    minHeight: "100vh",
    background: G.bg,
    fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
    color: G.text,
    overflowX: "hidden",
    position: "relative",
  },
  page: { padding: "32px 36px", maxWidth: 1400, margin: "0 auto", position: "relative", zIndex: 1 },

  // NAV
  nav: {
    position: "sticky", top: 0, zIndex: 100,
    background: `${G.bgPanel}f0`,
    backdropFilter: "blur(16px)",
    borderBottom: `1px solid ${G.border}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 36px", height: 64,
  },
  navLogo: {
    display: "flex", alignItems: "center", gap: 12,
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    fontSize: 24, fontWeight: 700, color: G.cream,
    letterSpacing: 0.5, fontStyle: "italic",
  },
  navLogoSub: {
    fontSize: 9, fontFamily: "'Lato', sans-serif",
    color: G.textDim, letterSpacing: 3, fontStyle: "normal",
    fontWeight: 400, display: "block", marginTop: -2,
  },
  navLink: (active) => ({
    padding: "7px 20px", borderRadius: 4, cursor: "pointer",
    fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
    textTransform: "uppercase", transition: "all .2s",
    background: active ? `${G.green1}30` : "transparent",
    color: active ? G.green3 : G.creamDark,
    border: `1px solid ${active ? G.green1 : "transparent"}`,
    fontFamily: "'Lato', sans-serif",
  }),
  navBadge: {
    padding: "4px 12px",
    background: `${G.green1}20`,
    border: `1px solid ${G.green1}50`,
    borderRadius: 4, fontSize: 10,
    color: G.green3, letterSpacing: 1.5,
    textTransform: "uppercase", fontWeight: 700,
  },

  // TITLES
  pageTitle: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    fontSize: 36, fontWeight: 700, fontStyle: "italic",
    color: G.cream, marginBottom: 4, lineHeight: 1.1,
  },
  pageTitleAccent: { color: G.green3 },
  subtitle: {
    fontSize: 12, color: G.textDim, marginBottom: 32,
    letterSpacing: 1, textTransform: "uppercase",
  },
  divider: {
    height: 1, marginBottom: 28,
    background: `linear-gradient(90deg, ${G.border}, transparent)`,
  },

  // CARDS
  card: {
    background: G.bgCard,
    border: `1px solid ${G.border}`,
    borderRadius: 8,
  },
  cardInner: { padding: "18px 20px" },

  // TICKER CARDS
  tickerCard: (active, color) => ({
    flex: 1, minWidth: 200, padding: "18px 20px", borderRadius: 8,
    background: active ? G.bgLight : G.bgCard,
    border: `1px solid ${active ? color : G.border}`,
    cursor: "pointer", transition: "all .22s",
    boxShadow: active ? `0 0 24px ${color}22, inset 0 0 20px ${color}08` : "none",
    position: "relative", overflow: "hidden",
  }),
  tickerCardBg: (color) => ({
    position: "absolute", right: -10, bottom: -10, opacity: 0.04,
  }),

  // INPUTS
  label: {
    fontSize: 10, color: G.textDim, marginBottom: 5,
    display: "block", letterSpacing: 2, textTransform: "uppercase",
    fontWeight: 700,
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: G.bgPanel, border: `1px solid ${G.border}`,
    color: G.cream, padding: "11px 14px", borderRadius: 6,
    fontSize: 14, fontFamily: "'Lato', sans-serif",
    marginBottom: 14, outline: "none", transition: "border .18s",
  },
  select: {
    width: "100%", boxSizing: "border-box",
    background: G.bgPanel, border: `1px solid ${G.border}`,
    color: G.cream, padding: "11px 14px", borderRadius: 6,
    fontSize: 13, fontFamily: "'Lato', sans-serif",
    marginBottom: 14, outline: "none", appearance: "none",
  },

  // BUTTONS
  btnBuy: {
    width: "100%", padding: "13px", borderRadius: 6, cursor: "pointer",
    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
    letterSpacing: 2, textTransform: "uppercase", border: "none", transition: "all .18s",
    background: `linear-gradient(135deg, ${G.green1}, #3d7a1e)`,
    color: G.cream,
    boxShadow: `0 4px 20px ${G.green1}44`,
  },
  btnSell: {
    width: "100%", padding: "13px", borderRadius: 6, cursor: "pointer",
    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
    letterSpacing: 2, textTransform: "uppercase", border: "none", transition: "all .18s",
    background: `linear-gradient(135deg, ${G.red}, #8b1a1a)`,
    color: G.cream,
    boxShadow: `0 4px 20px ${G.red}44`,
  },
  btnPrimary: {
    width: "100%", padding: "13px", borderRadius: 6, cursor: "pointer",
    fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13,
    letterSpacing: 2, textTransform: "uppercase", border: `1px solid ${G.green1}`,
    background: `${G.green1}22`, color: G.green3, transition: "all .18s",
  },

  // P2P
  obHead: {
    display: "grid", gridTemplateColumns: "1fr 90px 70px 90px",
    gap: 8, padding: "10px 0 8px",
    fontSize: 9, color: G.textDim, letterSpacing: 2,
    textTransform: "uppercase", fontWeight: 700,
    borderBottom: `1px solid ${G.border}`,
  },
  obRow: {
    display: "grid", gridTemplateColumns: "1fr 90px 70px 90px",
    gap: 8, padding: "10px 0",
    borderBottom: `1px solid ${G.border}22`,
    fontSize: 12, alignItems: "center",
  },

  // TOAST
  toast: (vis) => ({
    position: "fixed", bottom: 28, right: 28, zIndex: 999,
    background: G.bgLight,
    border: `1px solid ${G.green1}`,
    borderLeft: `3px solid ${G.green2}`,
    borderRadius: 6, padding: "14px 20px",
    fontSize: 13, color: G.cream, fontWeight: 600,
    boxShadow: `0 8px 32px #000a`,
    opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(16px)",
    transition: "all .3s", pointerEvents: "none",
  }),

  // PORTFOLIO
  txHead: {
    display: "grid", gridTemplateColumns: "90px 70px 1fr 100px 100px",
    gap: 8, padding: "12px 20px",
    background: G.bgPanel, fontSize: 9, color: G.textDim,
    letterSpacing: 2, textTransform: "uppercase", fontWeight: 700,
  },
  txRow: {
    display: "grid", gridTemplateColumns: "90px 70px 1fr 100px 100px",
    gap: 8, padding: "12px 20px",
    borderTop: `1px solid ${G.border}22`,
    fontSize: 12, alignItems: "center",
  },
};

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function PampaToken() {
  const [page, setPage]               = useState("market");
  const [selectedToken, setSelected]  = useState("HFORD");
  const [prices, setPrices]           = useState(() => Object.fromEntries(Object.keys(TOKENS).map(t => [t, TOKENS[t].basePrice])));
  const [histories, setHistories]     = useState(() => Object.fromEntries(Object.keys(TOKENS).map(t => [t, genHistory(TOKENS[t].basePrice)])));
  const [changes, setChanges]         = useState(() => Object.fromEntries(Object.keys(TOKENS).map(t => [t, 0])));
  const [balance, setBalance]         = useState({ USD: 10000, HFORD: 50, ANG: 30, BRAF: 80 });
  const [buyQty, setBuyQty]           = useState("");
  const [sellQty, setSellQty]         = useState("");
  const [toast, setToast]             = useState({ vis: false, msg: "" });
  const [p2pOrders, setP2pOrders]     = useState(() => Object.fromEntries(Object.keys(TOKENS).map(t => [t, genOrders(t, TOKENS[t].basePrice)])));
  const [p2pToken, setP2pToken]       = useState("HFORD");
  const [p2pSide, setP2pSide]         = useState("buy");
  const [p2pPrice, setP2pPrice]       = useState("");
  const [p2pQty, setP2pQty]           = useState("");
  const [p2pPayment, setP2pPayment]   = useState("Transferencia");
  const [txHistory, setTxHistory]     = useState([]);

  // fonts
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700;900&display=swap";
    document.head.appendChild(l);
  }, []);

  // price ticker
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const nc = {};
        Object.keys(TOKENS).forEach(t => {
          const d = (Math.random() - 0.49) * prev[t] * 0.004;
          next[t] = Math.max(+(prev[t] + d).toFixed(2), 1);
          nc[t] = +((next[t] - TOKENS[t].basePrice) / TOKENS[t].basePrice * 100).toFixed(2);
        });
        setChanges(nc);
        return next;
      });
      setHistories(prev => {
        const next = { ...prev };
        Object.keys(TOKENS).forEach(t => {
          const last = next[t][next[t].length - 1];
          const ch = (Math.random() - 0.49) * last.close * 0.018;
          const open = last.close, close = Math.max(open + ch, 1);
          next[t] = [...next[t].slice(-89), {
            open, close,
            high: Math.max(open,close)*(1+Math.random()*.01),
            low:  Math.min(open,close)*(1-Math.random()*.01),
            vol:  Math.random()*3000+300,
          }];
        });
        return next;
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const showToast = msg => {
    setToast({ vis: true, msg });
    setTimeout(() => setToast({ vis: false, msg: "" }), 3200);
  };

  const handleBuy = () => {
    const qty = parseFloat(buyQty);
    if (!qty || qty <= 0) return showToast("⚠️ Ingresá una cantidad válida");
    const total = qty * prices[selectedToken];
    if (total > balance.USD) return showToast("⚠️ Saldo USD insuficiente");
    setBalance(b => ({ ...b, USD: +(b.USD - total).toFixed(2), [selectedToken]: +(b[selectedToken] + qty).toFixed(4) }));
    setTxHistory(h => [{ type:"BUY", token: selectedToken, qty, price: prices[selectedToken], total: +total.toFixed(2), ts: new Date().toLocaleTimeString() }, ...h.slice(0,49)]);
    setBuyQty(""); showToast(`✅ Compraste ${qty} ${selectedToken} @ $${prices[selectedToken].toFixed(2)}`);
  };

  const handleSell = () => {
    const qty = parseFloat(sellQty);
    if (!qty || qty <= 0) return showToast("⚠️ Ingresá una cantidad válida");
    if (qty > balance[selectedToken]) return showToast("⚠️ Tokens insuficientes");
    const total = qty * prices[selectedToken];
    setBalance(b => ({ ...b, USD: +(b.USD + total).toFixed(2), [selectedToken]: +(b[selectedToken] - qty).toFixed(4) }));
    setTxHistory(h => [{ type:"SELL", token: selectedToken, qty, price: prices[selectedToken], total: +total.toFixed(2), ts: new Date().toLocaleTimeString() }, ...h.slice(0,49)]);
    setSellQty(""); showToast(`✅ Vendiste ${qty} ${selectedToken} @ $${prices[selectedToken].toFixed(2)}`);
  };

  const handlePublishOrder = () => {
    const price = parseFloat(p2pPrice), qty = parseFloat(p2pQty);
    if (!price || !qty) return showToast("⚠️ Completá precio y cantidad");
    const newOrder = { id: `my-${Date.now()}`, user: "Vos 🟢", price, qty, payment: p2pPayment };
    setP2pOrders(prev => ({
      ...prev,
      [p2pToken]: {
        buys:  p2pSide==="buy"  ? [newOrder, ...prev[p2pToken].buys]  : prev[p2pToken].buys,
        sells: p2pSide==="sell" ? [newOrder, ...prev[p2pToken].sells] : prev[p2pToken].sells,
      }
    }));
    setP2pPrice(""); setP2pQty("");
    showToast(`✅ Orden P2P publicada: ${p2pSide.toUpperCase()} ${qty} ${p2pToken} @ $${price}`);
  };

  const token   = TOKENS[selectedToken];
  const price   = prices[selectedToken];
  const change  = changes[selectedToken];
  const candles = histories[selectedToken];
  const portfolioUSD = balance.USD + Object.keys(TOKENS).reduce((a, t) => a + balance[t] * prices[t], 0);

  // ── RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <BgPattern/>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navLogo}>
          <span style={{ fontSize: 32 }}>🐄</span>
          <div>
            PampaToken
            <span style={S.navLogoSub}>Ganadería Digital · Argentina</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["market","📈 Mercado"],["p2p","🤝 P2P"],["portfolio","💼 Portfolio"]].map(([p,l]) => (
            <button key={p} style={S.navLink(page===p)} onClick={() => setPage(p)}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: G.creamDim }}>
            💵 <strong style={{ color: G.cream }}>${balance.USD.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>
          </span>
          <span style={S.navBadge}>Testnet</span>
        </div>
      </nav>

      {/* ════════════════════════════════════════════
          MARKET PAGE
      ════════════════════════════════════════════ */}
      {page === "market" && (
        <div style={S.page}>
          <h1 style={S.pageTitle}>Mercado de <em style={{ color: G.green3 }}>Tokens</em></h1>
          <p style={S.subtitle}>Hacienda tokenizada · Precios en tiempo real · Simulación testnet</p>
          <div style={S.divider}/>

          {/* TOKEN CARDS */}
          <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
            {Object.values(TOKENS).map(tk => (
              <div key={tk.ticker} style={S.tickerCard(selectedToken===tk.ticker, tk.color)}
                onClick={() => setSelected(tk.ticker)}>
                {/* vaca de fondo decorativa */}
                <div style={{ position:"absolute", right:-8, bottom:-8, opacity:0.06 }}>
                  <CowSVG size={70} opacity={1}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 2, color: tk.color, textTransform:"uppercase" }}>{tk.ticker}</span>
                  <span style={{ fontSize: 18 }}>{tk.icon}</span>
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: G.cream, marginBottom: 2 }}>
                  ${prices[tk.ticker].toFixed(2)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: changes[tk.ticker]>=0 ? G.green3 : G.redLight, marginBottom: 6 }}>
                  {changes[tk.ticker]>=0 ? "▲" : "▼"} {Math.abs(changes[tk.ticker])}%
                </div>
                <div style={{ fontSize: 10, color: G.creamDark, lineHeight: 1.4 }}>{tk.desc}</div>
              </div>
            ))}
          </div>

          {/* CHART */}
          <div style={{ ...S.card, padding: "22px 24px 14px", marginBottom: 22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:700, color:G.cream, fontStyle:"italic" }}>
                  {token.name} <span style={{ color:G.textDim, fontWeight:400, fontSize:15 }}>/ USD</span>
                </div>
                <div style={{ fontSize:9, color:G.textDim, letterSpacing:2, textTransform:"uppercase", marginTop:3 }}>
                  Velas 4h · Últimas 60 sesiones
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:38, fontWeight:700, color: token.color, lineHeight:1 }}>
                  ${price.toFixed(2)}
                </div>
                <div style={{ fontSize:11, color:G.textDim, marginTop:4 }}>
                  ≈ ARS ${(price * ARS_RATE).toLocaleString("es-AR",{maximumFractionDigits:0})}
                </div>
                <div style={{ fontSize:11, fontWeight:700, marginTop:2, color: change>=0 ? G.green3 : G.redLight }}>
                  {change>=0?"▲":"▼"} {Math.abs(change)}% desde precio base
                </div>
              </div>
            </div>
            <CandleChart candles={candles} color={token.color} height={190}/>
          </div>

          {/* BUY / SELL */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {/* COMPRAR */}
            <div style={{ ...S.card, padding:22, borderColor:`${G.green1}44` }}>
              <div style={{ fontSize:11, fontWeight:900, letterSpacing:2, color:G.green3, marginBottom:18, textTransform:"uppercase" }}>
                ▲ Comprar {selectedToken}
              </div>
              <label style={S.label}>Cantidad</label>
              <input style={S.input} type="number" placeholder="0.00" value={buyQty} onChange={e=>setBuyQty(e.target.value)}/>
              <label style={S.label}>Precio market</label>
              <input style={{ ...S.input, color:G.textDim, cursor:"default" }} readOnly value={`$${price.toFixed(2)} USD`}/>
              <div style={{ fontSize:11, color:G.creamDark, marginBottom:16, padding:"10px 12px", background:G.bgPanel, borderRadius:5, borderLeft:`2px solid ${G.green1}` }}>
                Total estimado: <strong style={{ color:G.cream }}>${buyQty ? ((parseFloat(buyQty)||0)*price).toFixed(2) : "—"}</strong>
                <span style={{ color:G.textDim }}> · Saldo: ${balance.USD.toFixed(2)}</span>
              </div>
              <button style={S.btnBuy} onClick={handleBuy}>Comprar {selectedToken}</button>
            </div>

            {/* VENDER */}
            <div style={{ ...S.card, padding:22, borderColor:`${G.red}33` }}>
              <div style={{ fontSize:11, fontWeight:900, letterSpacing:2, color:G.redLight, marginBottom:18, textTransform:"uppercase" }}>
                ▼ Vender {selectedToken}
              </div>
              <label style={S.label}>Cantidad</label>
              <input style={S.input} type="number" placeholder="0.00" value={sellQty} onChange={e=>setSellQty(e.target.value)}/>
              <label style={S.label}>Precio market</label>
              <input style={{ ...S.input, color:G.textDim, cursor:"default" }} readOnly value={`$${price.toFixed(2)} USD`}/>
              <div style={{ fontSize:11, color:G.creamDark, marginBottom:16, padding:"10px 12px", background:G.bgPanel, borderRadius:5, borderLeft:`2px solid ${G.red}` }}>
                Total estimado: <strong style={{ color:G.cream }}>${sellQty ? ((parseFloat(sellQty)||0)*price).toFixed(2) : "—"}</strong>
                <span style={{ color:G.textDim }}> · Tenés: {balance[selectedToken]} {selectedToken}</span>
              </div>
              <button style={S.btnSell} onClick={handleSell}>Vender {selectedToken}</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          P2P PAGE
      ════════════════════════════════════════════ */}
      {page === "p2p" && (
        <div style={S.page}>
          <h1 style={S.pageTitle}>Mercado <em style={{ color: G.green3 }}>P2P</em></h1>
          <p style={S.subtitle}>Operá directamente con productores y inversores · Publicá tus órdenes</p>
          <div style={S.divider}/>

          {/* token selector */}
          <div style={{ display:"flex", gap:10, marginBottom:24, alignItems:"center", flexWrap:"wrap" }}>
            {Object.values(TOKENS).map(tk => (
              <button key={tk.ticker} onClick={() => setP2pToken(tk.ticker)}
                style={{
                  padding:"8px 22px", borderRadius:5, cursor:"pointer",
                  fontFamily:"'Lato', sans-serif", fontSize:12, fontWeight:700,
                  letterSpacing:1.5, textTransform:"uppercase", transition:"all .18s",
                  background: p2pToken===tk.ticker ? `${tk.color}25` : "transparent",
                  border: `1px solid ${p2pToken===tk.ticker ? tk.color : G.border}`,
                  color: p2pToken===tk.ticker ? tk.color : G.creamDark,
                }}>
                {tk.icon} {tk.ticker}
              </button>
            ))}
            <div style={{ marginLeft:"auto", fontSize:11, color:G.textDim }}>
              Spread:{" "}
              <strong style={{ color:G.gold, fontSize:13 }}>
                {p2pOrders[p2pToken].sells[0] && p2pOrders[p2pToken].buys[0]
                  ? `$${(p2pOrders[p2pToken].sells[0].price - p2pOrders[p2pToken].buys[0].price).toFixed(2)}`
                  : "—"}
              </strong>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* LIBROS */}
            <div>
              {/* VENTAS */}
              <div style={{ ...S.card, padding:"18px 20px", marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:900, letterSpacing:2, color:G.redLight, marginBottom:12, textTransform:"uppercase" }}>
                  ▼ Vendedores · {p2pToken}
                </div>
                <div style={S.obHead}>
                  <span>Usuario</span><span>Precio</span><span>Cant.</span><span>Método</span>
                </div>
                {p2pOrders[p2pToken].sells.slice(0,7).map(o => (
                  <div key={o.id} style={S.obRow}>
                    <span style={{ color:G.textDim, fontSize:11 }}>{o.user}</span>
                    <span style={{ color:G.redLight, fontWeight:700 }}>${o.price.toFixed(2)}</span>
                    <span style={{ color:G.cream }}>{o.qty}</span>
                    <span style={{ fontSize:10, color:G.creamDark }}>{o.payment}</span>
                  </div>
                ))}
              </div>
              {/* COMPRAS */}
              <div style={{ ...S.card, padding:"18px 20px" }}>
                <div style={{ fontSize:11, fontWeight:900, letterSpacing:2, color:G.green3, marginBottom:12, textTransform:"uppercase" }}>
                  ▲ Compradores · {p2pToken}
                </div>
                <div style={S.obHead}>
                  <span>Usuario</span><span>Precio</span><span>Cant.</span><span>Método</span>
                </div>
                {p2pOrders[p2pToken].buys.slice(0,7).map(o => (
                  <div key={o.id} style={S.obRow}>
                    <span style={{ color:G.textDim, fontSize:11 }}>{o.user}</span>
                    <span style={{ color:G.green3, fontWeight:700 }}>${o.price.toFixed(2)}</span>
                    <span style={{ color:G.cream }}>{o.qty}</span>
                    <span style={{ fontSize:10, color:G.creamDark }}>{o.payment}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FORM */}
            <div style={{ ...S.card, padding:"22px 24px" }}>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:700, fontStyle:"italic", color:G.cream, marginBottom:18 }}>
                Publicar Orden P2P
              </div>
              {/* lado */}
              <div style={{ display:"flex", gap:8, marginBottom:18 }}>
                {["buy","sell"].map(side => (
                  <button key={side} onClick={() => setP2pSide(side)}
                    style={{
                      flex:1, padding:"10px", borderRadius:5, cursor:"pointer",
                      fontFamily:"'Lato', sans-serif", fontWeight:700, fontSize:12,
                      letterSpacing:1.5, textTransform:"uppercase", transition:"all .18s",
                      border:`1px solid ${p2pSide===side ? (side==="buy"?G.green1:G.red) : G.border}`,
                      background: p2pSide===side ? (side==="buy"?`${G.green1}25`:`${G.red}25`) : "transparent",
                      color: p2pSide===side ? (side==="buy"?G.green3:G.redLight) : G.creamDark,
                    }}>
                    {side==="buy"?"▲ Comprar":"▼ Vender"}
                  </button>
                ))}
              </div>

              <label style={S.label}>Token</label>
              <select style={S.select} value={p2pToken} onChange={e => setP2pToken(e.target.value)}>
                {Object.values(TOKENS).map(tk => (
                  <option key={tk.ticker} value={tk.ticker}>{tk.icon} {tk.name} ({tk.ticker})</option>
                ))}
              </select>

              <label style={S.label}>Precio (USD)</label>
              <input style={S.input} type="number" placeholder={`~${prices[p2pToken].toFixed(2)}`}
                value={p2pPrice} onChange={e=>setP2pPrice(e.target.value)}/>

              <label style={S.label}>Cantidad</label>
              <input style={S.input} type="number" placeholder="0"
                value={p2pQty} onChange={e=>setP2pQty(e.target.value)}/>

              <label style={S.label}>Método de Pago</label>
              <select style={S.select} value={p2pPayment} onChange={e=>setP2pPayment(e.target.value)}>
                {["Transferencia","Wise","USDT","Efectivo","Crypto"].map(m=><option key={m}>{m}</option>)}
              </select>

              {p2pPrice && p2pQty && (
                <div style={{ fontSize:11, color:G.creamDark, marginBottom:14, padding:"12px 14px", background:G.bgPanel, borderRadius:5, borderLeft:`2px solid ${G.gold}` }}>
                  Total: <strong style={{ color:G.cream }}>${(parseFloat(p2pPrice)*parseFloat(p2pQty)).toFixed(2)}</strong>
                  <br/>≈ ARS ${((parseFloat(p2pPrice)*parseFloat(p2pQty))*ARS_RATE).toLocaleString("es-AR",{maximumFractionDigits:0})}
                </div>
              )}

              <button style={p2pSide==="buy" ? S.btnBuy : S.btnSell} onClick={handlePublishOrder}>
                Publicar Orden
              </button>
              <div style={{ fontSize:9, color:G.textDim, marginTop:10, textAlign:"center", letterSpacing:1 }}>
                LAS ÓRDENES SON VISIBLES PARA TODOS LOS PARTICIPANTES DE LA RED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          PORTFOLIO PAGE
      ════════════════════════════════════════════ */}
      {page === "portfolio" && (
        <div style={S.page}>
          <h1 style={S.pageTitle}>Mi <em style={{ color: G.green3 }}>Portfolio</em></h1>
          <p style={S.subtitle}>Posición actual en testnet · PampaToken</p>
          <div style={S.divider}/>

          {/* TOTAL */}
          <div style={{
            ...S.card, padding:"28px 32px", marginBottom:24,
            background: `linear-gradient(135deg, ${G.bgLight}, ${G.bgCard})`,
            borderColor: G.borderLight, position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", right:-20, top:-20, opacity:0.04 }}>
              <CowSVG size={140} opacity={1}/>
            </div>
            <div style={{ fontSize:9, color:G.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>
              Valor Total del Portfolio
            </div>
            <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:52, fontWeight:700, color:G.cream, lineHeight:1 }}>
              ${portfolioUSD.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
            </div>
            <div style={{ fontSize:12, color:G.textDim, marginTop:8 }}>
              ≈ ARS ${(portfolioUSD*ARS_RATE).toLocaleString("es-AR",{maximumFractionDigits:0})}
            </div>
          </div>

          {/* BALANCES */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px,1fr))", gap:16, marginBottom:28 }}>
            {/* USD */}
            <div style={{ ...S.card, padding:"20px 22px", borderTop:`3px solid ${G.cream}` }}>
              <div style={{ fontSize:9, color:G.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>💵 Saldo Cash</div>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:700, color:G.cream }}>${balance.USD.toFixed(2)}</div>
              <div style={{ fontSize:11, color:G.textDim, marginTop:4 }}>≈ ARS ${(balance.USD*ARS_RATE).toLocaleString("es-AR",{maximumFractionDigits:0})}</div>
            </div>
            {Object.values(TOKENS).map(tk => (
              <div key={tk.ticker} style={{ ...S.card, padding:"20px 22px", borderTop:`3px solid ${tk.color}`, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", right:-5, bottom:-5, opacity:0.05 }}>
                  <CowSVG size={60} opacity={1}/>
                </div>
                <div style={{ fontSize:9, color:G.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
                  {tk.icon} {tk.ticker}
                </div>
                <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:32, fontWeight:700, color:G.cream }}>
                  {balance[tk.ticker].toLocaleString()}
                </div>
                <div style={{ fontSize:11, color:G.textDim, marginBottom:8 }}>{tk.name}</div>
                <div style={{ fontSize:18, fontWeight:700, color:tk.color }}>
                  ${(balance[tk.ticker]*prices[tk.ticker]).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
                </div>
                <div style={{ fontSize:10, color:G.creamDark, marginTop:2 }}>@ ${prices[tk.ticker].toFixed(2)} / token</div>
              </div>
            ))}
          </div>

          {/* MINI CHARTS */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:10, color:G.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:14, fontWeight:700 }}>
              Evolución de Precios
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:14 }}>
              {Object.values(TOKENS).map(tk => (
                <div key={tk.ticker} style={{ ...S.card, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:tk.color, letterSpacing:1 }}>{tk.icon} {tk.ticker}</span>
                    <span style={{ fontSize:12, color:G.cream }}>${prices[tk.ticker].toFixed(2)}</span>
                  </div>
                  <CandleChart candles={histories[tk.ticker]} color={tk.color} height={80}/>
                </div>
              ))}
            </div>
          </div>

          {/* TX HISTORY */}
          {txHistory.length > 0 ? (
            <div>
              <div style={{ fontSize:10, color:G.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:12, fontWeight:700 }}>
                Historial de Transacciones
              </div>
              <div style={{ ...S.card, overflow:"hidden" }}>
                <div style={S.txHead}>
                  <span>Hora</span><span>Tipo</span><span>Token</span><span>Precio</span><span>Total USD</span>
                </div>
                {txHistory.map((tx,i) => (
                  <div key={i} style={S.txRow}>
                    <span style={{ color:G.textDim }}>{tx.ts}</span>
                    <span style={{ color:tx.type==="BUY"?G.green3:G.redLight, fontWeight:700, fontSize:11, letterSpacing:1 }}>{tx.type}</span>
                    <span style={{ color:G.cream }}>{tx.qty} {tx.token}</span>
                    <span style={{ color:G.textDim }}>${tx.price.toFixed(2)}</span>
                    <span style={{ color:tx.type==="BUY"?G.redLight:G.green3, fontWeight:700 }}>
                      {tx.type==="BUY"?"-":"+"}${tx.total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 20px", color:G.textDim, fontSize:13 }}>
              Aún no realizaste transacciones.{" "}
              <span style={{ color:G.green3, cursor:"pointer" }} onClick={()=>setPage("market")}>
                Ir al Mercado →
              </span>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{
        borderTop:`1px solid ${G.border}`, padding:"20px 36px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        fontSize:10, color:G.textDim, letterSpacing:1, position:"relative", zIndex:1,
        textTransform:"uppercase",
      }}>
        <span>🐄 PampaToken · Ganadería Digital Argentina · © 2025</span>
        <span>1 USD = ARS {ARS_RATE.toLocaleString("es-AR")} (ficticio) · Precios simulados · No constituyen asesoramiento financiero</span>
      </footer>

      {/* TOAST */}
      <div style={S.toast(toast.vis)}>{toast.msg}</div>
    </div>
  );
}
