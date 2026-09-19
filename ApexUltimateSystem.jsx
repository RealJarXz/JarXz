import { useState } from "react";

// ═══════════════════════════════════════════════════════════
//  COMPLETE DATA — ALL STRATEGIES COMBINED
// ═══════════════════════════════════════════════════════════

const HTF_STEPS = [
  { tf:"4H", role:"MACRO BIAS", desc:"Is price bullish, bearish, or ranging? EMA stack direction. Are we making HH/HL or LH/LL? This sets the ONLY direction you trade.", color:"#00ff88" },
  { tf:"1H", role:"STRUCTURAL BIAS", desc:"Confirms 4H. Where are the key swing highs/lows? Where is the premium/discount zone? What liquidity pools are marked?", color:"#5bc4f5" },
  { tf:"15m", role:"ENTRY TIMEFRAME", desc:"MSS/CHoCH confirmation. FVG identification. Displacement candle. Order block retest. This is where you watch for signals.", color:"#f5a623" },
  { tf:"5m", role:"PRECISION ENTRY", desc:"Fine-tune entry inside the 15m FVG/OB zone. Stop placement. Exact RR calculation. Volume confirmation at entry.", color:"#c87af5" },
];

const SESSIONS = [
  {
    name:"ASIA SESSION", time:"8PM–3AM ET (00:00–07:00 UTC)", color:"#5bc4f5", icon:"🌏",
    behavior:"Consolidation. Liquidity creation. Range formation.",
    what:["Forms the range that London will manipulate","Creates equal highs and equal lows (liquidity pools)","Low volume, tight range, choppy candles","Smart money accumulates positions quietly"],
    trade:"DO NOT TRADE: Low probability setups. Mark the Asia High and Asia Low — these become the liquidity targets for London.",
  },
  {
    name:"LONDON SESSION", time:"3AM–9AM ET (07:00–13:00 UTC)", color:"#f5a623", icon:"🌍",
    behavior:"Manipulation. Liquidity sweep. Expansion begins.",
    what:["Sweeps the Asia High or Asia Low (JUDAS SWING)","Creates a false breakout to trap retail traders","Then violently reverses in the real direction","MSS/CHoCH prints after the sweep"],
    trade:"WATCH: London sweep of Asia range = HIGHEST PROBABILITY setup. Long if Asia Low swept + bullish MSS. Short if Asia High swept + bearish MSS.",
  },
  {
    name:"NEW YORK SESSION", time:"9:30AM–4PM ET (13:30–20:00 UTC)", color:"#00ff88", icon:"🌎",
    behavior:"Continuation or reversal. Highest volume. Kill zone.",
    what:["NY Open Kill Zone: 9:30–11:00 AM ET = PRIMARY","Confirms or reverses London direction","FVG retests happen here before continuation","PM session (2–4 PM) = secondary expansion"],
    trade:"PRIMARY TRADING WINDOW: All 8 factors must align here. NY Open Kill Zone 9:30–11 AM has 65–78% WR on valid setups. Lunch (12–2 PM) = avoid.",
  },
];

const JUDAS_MODEL = [
  { step:"1", title:"ASIA RANGE FORMS", desc:"Price consolidates. Equal highs and equal lows build. This is smart money setting the trap. Mark these levels as BSL (above highs) and SSL (below lows).", c:"#5bc4f5" },
  { step:"2", title:"LONDON JUDAS SWING", desc:"London opens. Price sweeps ABOVE the Asia High (Judas Swing) trapping longs. OR sweeps BELOW the Asia Low trapping shorts. Volume spikes on the fake move.", c:"#f5a623" },
  { step:"3", title:"DISPLACEMENT + MSS", desc:"After the sweep, a violent displacement candle fires in the opposite direction. MSS/CHoCH prints. FVG is left behind. This is the real move starting.", c:"#f57474" },
  { step:"4", title:"FVG RETEST ENTRY", desc:"Price pulls back into the FVG or OB left by the displacement candle. This is the entry. Stop beyond the sweep wick. Target the opposite session liquidity.", c:"#00ff88" },
  { step:"5", title:"NY CONTINUATION", desc:"NY Open confirms the London direction. Price delivers to the next liquidity pool — equal lows, weak lows, PDL, or round numbers. Take partials on the way.", c:"#c87af5" },
];

const CONCEPTS = [
  {
    name:"MSS — Market Structure Shift", color:"#00ff88", icon:"🔄",
    def:"A break of the most recent swing high (bullish MSS) or swing low (bearish MSS) that changes the direction of structure.",
    bull:"Price was making LH/LL (bearish). Breaks ABOVE the last lower high. Structure shifts to bullish. First sign the bearish move is over.",
    bear:"Price was making HH/HL (bullish). Breaks BELOW the last higher low. Structure shifts to bearish. First sign the bullish move is over.",
    use:"MSS after a liquidity sweep = confirmation the trap worked. This is your signal that institutional order flow reversed.",
    warning:"MSS alone is NOT an entry. Must combine with: sweep + CHoCH + FVG/OB + kill zone."
  },
  {
    name:"CHoCH — Change of Character", color:"#5bc4f5", icon:"⚡",
    def:"Early warning signal that appears BEFORE MSS. The market shows first signs of losing momentum in the current direction.",
    bull:"Bearish trend shows first bullish close above a short-term high. Not yet MSS but momentum is weakening bearishly.",
    bear:"Bullish trend shows first bearish close below a short-term low. Not yet MSS but momentum is weakening bullishly.",
    use:"CHoCH = prepare. MSS = confirm. CHoCH gets you ready. MSS gets you in. Combine: sweep → CHoCH → wait for MSS → FVG entry.",
    warning:"CHoCH alone has low probability. It is a warning, not a signal. Wait for full MSS confirmation."
  },
  {
    name:"FVG — Fair Value Gap", color:"#f5a623", icon:"📊",
    def:"A 3-candle imbalance where candle 1's high is below candle 3's low (bullish FVG) or candle 1's low is above candle 3's high (bearish FVG).",
    bull:"[C1.high < C3.low] = gap = demand zone. Price returns here before continuing up. Entry: react INSIDE the FVG with bullish close.",
    bear:"[C1.low > C3.high] = gap = supply zone. Price returns here before continuing down. Entry: react INSIDE the FVG with bearish close.",
    use:"Best FVGs: Left by aggressive displacement candles. Use as entry zone, stop reference, and target. Stack FVG + OB overlap for highest probability.",
    warning:"Weak FVGs (small gaps after small candles) have lower probability. Only trade FVGs left by strong institutional displacement."
  },
  {
    name:"OB — Order Block", color:"#c87af5", icon:"🧱",
    def:"The last opposing candle before a significant displacement move. This is where institutional buy or sell orders originated.",
    bull:"BULLISH OB: Last bearish (red) candle before bullish displacement. When price returns to this candle's range, institutional buyers are still there.",
    bear:"BEARISH OB: Last bullish (green) candle before bearish displacement. When price returns to this range, institutional sellers are still present.",
    use:"OB + FVG overlap = highest quality entry zone. OB defines the exact stop placement. Stack with MSS and kill zone for A+ setup.",
    warning:"OBs that have been tested multiple times lose reliability. Fresh OBs (first retest) have highest probability."
  },
  {
    name:"IFVG — Inverse Fair Value Gap", color:"#ff8c6b", icon:"🔁",
    def:"When a FVG fails (price breaks through it) it FLIPS polarity. Old demand becomes supply. Old supply becomes demand.",
    bull:"Bearish FVG fails (price closes above it) → old supply becomes demand. Retest from above = LONG entry.",
    bear:"Bullish FVG fails (price closes below it) → old demand becomes supply. Retest from below = SHORT entry.",
    use:"IFVG + MSS = one of the strongest reversal combos. The failure itself IS the signal — it shows price rejected the zone as supply/demand.",
    warning:"IFVGs are higher risk than standard FVGs. Require MSS confirmation. Do not trade IFVG alone."
  },
  {
    name:"DISPLACEMENT", color:"#ffd700", icon:"🚀",
    def:"A strong, aggressive impulse candle with: large body (≥1.5× ATR), expanding volume, minimal wicks, and leaves an FVG behind.",
    bull:"Large green candle breaking through resistance. Volume spike. FVG left below. MSS printed. Institutions are buying aggressively.",
    bear:"Large red candle breaking through support. Volume spike. FVG left above. MSS printed. Institutions are selling aggressively.",
    use:"Displacement confirms institutional intent. Without displacement, any move is retail chop. Entry: wait for FVG retest after displacement — not ON the displacement candle.",
    warning:"Chasing the displacement candle itself has 40-50% WR. Waiting for the FVG retest = 65-78% WR. Patience is the edge."
  },
];

const PREM_DISC = {
  steps:[
    { label:"FIND THE RANGE", desc:"Identify the most recent swing high and swing low. This is your reference range for premium/discount.", c:"#5bc4f5" },
    { label:"MARK EQUILIBRIUM (50%)", desc:"Exact midpoint of the range. Price always gravitates back here. Trade FROM away from EQ back toward it, OR from EQ toward the next liquidity pool.", c:"#f5a623" },
    { label:"PREMIUM ZONE", desc:"Above 50% — price is expensive. Institutions SELL here. Only take SHORTS in premium. Longs in premium = fighting smart money.", c:"#f57474" },
    { label:"DISCOUNT ZONE", desc:"Below 50% — price is cheap. Institutions BUY here. Only take LONGS in discount. Shorts in discount = fighting smart money.", c:"#00ff88" },
    { label:"OPTIMAL TRADE ENTRY (OTE)", desc:"61.8%–78.6% Fibonacci retracement from the displacement move. The deepest discount (for longs) or premium (for shorts) before continuation.", c:"#c87af5" },
  ],
  rule:"LONGS: Only in discount (below 50%). SHORTS: Only in premium (above 50%). Breaking this rule is the #1 cause of losses in the model."
};

const TARGET_LOGIC = [
  { step:"1", title:"FIND THE LIQUIDITY", items:["Mark equal highs above (BSL)","Mark equal lows below (SSL)","Mark PDH / PDL / PWH / PWL","Mark weak highs and weak lows","Mark round numbers (.000 / .500)","These are your TARGETS — price seeks them"], c:"#f57474" },
  { step:"2", title:"FIND CURRENT STRUCTURE", items:["Is price making HH/HL? → bullish","Is price making LH/LL? → bearish","Has MSS/CHoCH printed? → potential reversal","Where is the last confirmed BOS?","What timeframe confirms: 4H → 1H → 15m","Bearish 4H + bullish CHoCH 15m = retracement"], c:"#5bc4f5" },
  { step:"3", title:"FIND THE IMBALANCE", items:["Identify FVG after displacement","Mark bullish or bearish OB zone","Is there an IFVG that flipped?","Price rebalances into FVG before continuing","FVG + OB overlap = highest quality zone","These become your ENTRY zones"], c:"#f5a623" },
  { step:"4", title:"CHECK PREMIUM / DISCOUNT", items:["Calculate equilibrium of recent range","Longs: only below 50% (discount)","Shorts: only above 50% (premium)","OTE: 61.8–78.6% retrace from displacement","Never long in premium / short in discount","This is the single biggest WR filter"], c:"#00ff88" },
  { step:"5", title:"CHECK SESSION TIMING", items:["Asia: mark range. No trades.","London: watch for Judas Swing sweep","NY Open 9:30–11AM: PRIMARY window","PM 2–4PM: secondary window","Avoid lunch 12–2PM completely","News events: avoid ±30 minutes"], c:"#c87af5" },
  { step:"6", title:"CONFIRM MSS / CHoCH", items:["CHoCH first: early warning, prepare","MSS confirms: momentum fully shifted","BOS after MSS: continuation confirmed","MSS + displacement + FVG = entry signal","No MSS = no entry, regardless of other factors","This step removes the most false signals"], c:"#ffd700" },
];

const LIQ_TYPES = [
  { label:"Equal Highs (EQH)", type:"BSL", desc:"Two or more candles at the same high. Buy stops sitting above. Price will sweep this.", c:"#00ff88" },
  { label:"Equal Lows (EQL)", type:"SSL", desc:"Two or more candles at the same low. Sell stops sitting below. Price will sweep this.", c:"#f57474" },
  { label:"Weak High", type:"BSL", desc:"A swing high that has NOT been broken. Still has buyside liquidity above. Lower probability than equal highs.", c:"#00d4ff" },
  { label:"Weak Low", type:"SSL", desc:"A swing low that has NOT been broken. Still has sellside liquidity below. Lower probability than equal lows.", c:"#ff8c6b" },
  { label:"PDH (Prior Day High)", type:"BSL", desc:"Yesterday's high. Heavy institutional orders above. Swept frequently at NY Open.", c:"#00ff88" },
  { label:"PDL (Prior Day Low)", type:"SSL", desc:"Yesterday's low. Heavy institutional orders below. Swept at London or NY Open.", c:"#f57474" },
  { label:"PWH (Prior Week High)", type:"BSL", desc:"Last week's high. Major liquidity pool. Often targeted at start of new week.", c:"#00d4ff" },
  { label:"PWL (Prior Week Low)", type:"SSL", desc:"Last week's low. Major liquidity pool. Often forms the weekly range low.", c:"#ff8c6b" },
  { label:"Session High/Low", type:"BOTH", desc:"Asia high/low, London high/low. The Judas Swing model uses these as manipulation targets.", c:"#ffd700" },
  { label:"Round Numbers", type:"BOTH", desc:"29,000 / 29,500 / 30,000. Massive psychological stop clusters. Always targets.", c:"#c87af5" },
];

const CURRENT_LEVELS = [
  { price:"29,782", type:"BSL", label:"Extension BSL — Round number", zone:"Target", c:"#c87af5" },
  { price:"29,600", type:"BSL", label:"Swing extension target", zone:"Target", c:"#c87af5" },
  { price:"29,448", type:"BSL", label:"Intermediate BSL", zone:"Target", c:"#00d4ff" },
  { price:"29,386", type:"PEAK", label:"Week high — Weak High formed here", zone:"Resistance", c:"#f5a623" },
  { price:"29,320", type:"BSL", label:"Prior Weak High BSL (swept)", zone:"Support now", c:"#00ff88" },
  { price:"29,089", type:"SUPPORT", label:"Key structural support", zone:"Watch level", c:"#5bc4f5" },
  { price:"29,000", type:"SSL/BSL", label:"Round number — MAJOR level", zone:"Key floor", c:"#ffd700" },
  { price:"28,950", type:"SUPPORT", label:"Old BOS level / PDH zone", zone:"Support", c:"#5bc4f5" },
  { price:"28,742", type:"SUPPORT", label:"Demand OB / FVG zone", zone:"Deep support", c:"#00ff88" },
  { price:"28,541", type:"SSL", label:"PDL (swept May 8) — now invalidation", zone:"Floor", c:"#f57474" },
];

const VENOM = [
  { phase:"ACCUMULATION", desc:"Smart money quietly builds positions. Price consolidates in a tight range. Volume is LOW. This creates the Asia range. Retail sees 'nothing happening'.", c:"#5bc4f5" },
  { phase:"MANIPULATION", desc:"The Judas Swing. Price makes a fake move in the WRONG direction to sweep stops and trap retail traders. Volume SPIKES briefly. This is London's job.", c:"#f5a623" },
  { phase:"DISPLACEMENT", desc:"The real move fires aggressively. Large bodies. Expanding volume. FVG left behind. MSS prints. Institutions enter their FULL position during this move.", c:"#f57474" },
  { phase:"DISTRIBUTION", desc:"Price approaches the liquidity target. Retail chases the move. Smart money begins selling into retail buying (or buying into retail selling). -SMT signals print here.", c:"#c87af5" },
  { phase:"REVERSAL / CONTINUATION", desc:"At the liquidity pool: either full reversal (if major level) or brief pullback to FVG then continuation. -SMT at highs = reversal. +SMT at lows = continuation.", c:"#00ff88" },
];

const FACTORS = [
  { num:"01", name:"HTF BIAS (4H→1H→15m)", color:"#00ff88", icon:"📈",
    rule:"4H: Macro direction — HH/HL (bull) or LH/LL (bear)\n1H: Structural bias — key swing levels\n15m: Entry confirmation — MSS/CHoCH\n\nRule: Only trade IN the direction of 4H bias\nIf 4H bullish but 15m bearish = SHORT RETRACEMENT ONLY\nIf all 3 align = FULL POSITION SIZING" },
  { num:"02", name:"KILL ZONE (Session)", color:"#00d4ff", icon:"⏰",
    rule:"London Open: 3-5 AM ET ← Judas Swing zone\nNY Open: 9:30-11:00 AM ET ← PRIMARY ★\nNY PM: 2:00-4:00 PM ET ← Secondary\n\nAVOID:\n✗ Asia session (consolidation — no trades)\n✗ Lunch 12-2 PM ET (choppy, low probability)\n✗ ±30 min around FOMC / CPI / NFP" },
  { num:"03", name:"PREMIUM / DISCOUNT", color:"#f5a623", icon:"⚖️",
    rule:"Equilibrium = 50% of swing range\nDISCOUNT (below 50%) → ONLY LONGS\nPREMIUM (above 50%) → ONLY SHORTS\nOTE: 61.8-78.6% fib retracement for entries\n\nThis week: price entered premium at 28,944\nInstitutions SOLD there → -400pt crash\nAlways respect the premium/discount filter" },
  { num:"04", name:"LIQUIDITY SWEEP", color:"#f5c842", icon:"💧",
    rule:"BSL above: EQH, PDH, PWH, Weak Highs, rounds\nSSL below: EQL, PDL, PWL, Weak Lows, rounds\n\nJudas Swing model:\n1. Asia forms range (EQH/EQL)\n2. London sweeps one side (the fake move)\n3. MSS prints opposite direction\n4. Real move begins\n\nNO SWEEP = NO TRADE — this is the trigger" },
  { num:"05", name:"CHoCH → MSS", color:"#c87af5", icon:"🔄",
    rule:"CHoCH = early warning (prepare, do NOT enter)\nMSS = confirmation (structure fully shifted)\n\nBull sequence:\nSSL sweep → CHoCH above LH → MSS (breaks LH)\n→ BOS on continuation\n\nBear sequence:\nBSL sweep → CHoCH below HL → MSS (breaks HL)\n→ BOS on continuation\n\nBoth must fire. CHoCH alone = 40-50% WR" },
  { num:"06", name:"DISPLACEMENT ≥1.5×ATR", color:"#ff8c6b", icon:"⚡",
    rule:"Signs of real displacement:\n✓ Large candle body ≥ 1.5× ATR\n✓ Volume expands significantly\n✓ FVG left behind (3-candle imbalance)\n✓ Minimal wicks (strong close)\n✓ Breaks through structure cleanly\n\nChasing displacement candle: 40% WR\nWaiting for FVG retest: 68-78% WR\nNEVER enter ON the displacement — wait for retest" },
  { num:"07", name:"FVG / OB / IFVG", color:"#5bc4f5", icon:"🎯",
    rule:"FVG: [C1.high < C3.low] = gap = demand\nOB: Last opposing candle before displacement\nIFVG: Failed FVG that flipped polarity\n\nBest entry: FVG + OB overlap at same level\nStop: 0.8-1.0×ATR BELOW FVG boundary\nNOT at the sweep wick\n\nFVG-based stops: -25% fewer stop-outs\nvs swing-based stops at wicks" },
  { num:"08", name:"SMT DIVERGENCE", color:"#f57474", icon:"🔗",
    rule:"+SMT BULL: NQ sweeps low, ES does NOT → long\n-SMT BEAR: NQ sweeps high, ES does NOT → short\n\nThis week's SMT calls:\n28,637 reversal → +SMT confirmed ✅\n28,944 top → -SMT confirmed ✅\n29,386 top → -SMT confirmed ✅\n\n5+ consecutive -SMT = serious reversal warning\n→ Exactly what printed before the -432pt drop" },
];

const CONF_DATA = [
  { score:"3/8", wr:"40–50%", verdict:"DO NOT TRADE", c:"#e05555" },
  { score:"4/8", wr:"55–62%", verdict:"Minimum — small size only", c:"#f5a623" },
  { score:"5/8", wr:"62–70%", verdict:"Good setup — standard size", c:"#f5c842" },
  { score:"6/8", wr:"70–77%", verdict:"Strong setup ← APEX minimum", c:"#00ff88" },
  { score:"7/8", wr:"77–82%", verdict:"Scale up 1.5× risk", c:"#00d4ff" },
  { score:"8/8", wr:"80–85%", verdict:"All factors aligned — MAXIMUM", c:"#c87af5" },
];

const EXIT_STEPS = [
  { step:"ENTRY", action:"FVG/OB retest confirmed + reaction candle. Stop: 0.8×ATR below FVG boundary (NOT the sweep wick).", c:"#5bc4f5" },
  { step:"AT 1R", action:"Close 50% of position. Move stop to breakeven (BE). You cannot lose from here. Partial locked.", c:"#f5a623" },
  { step:"RUNNER (50%)", action:"Target 2.8R → next BSL/SSL pool: PDH/PDL, round number, weak high/low, session target.", c:"#00ff88" },
  { step:"STOPPED BE", action:"Net +0.4R from partial. Counts as a small win. Fully protects funded account rules.", c:"#c87af5" },
  { step:"FULL TARGET", action:"Close runner at 2.8R OR trail stop to next liquidity level beyond current target.", c:"#ffd700" },
];

const ACCOUNT = [
  { label:"Starting Capital", val:"$50,000", c:"#5bc4f5" },
  { label:"Risk Per Trade", val:"$300 (0.6%)", c:"#00ff88" },
  { label:"Daily Loss Limit", val:"$1,250 (2.5%)", c:"#f5a623" },
  { label:"Max Drawdown", val:"$3,000 (6%)", c:"#f57474" },
  { label:"Partial Exit", val:"50% at 1R", c:"#c87af5" },
  { label:"Runner Target", val:"2.8R", c:"#00ff88" },
  { label:"6/8 Size", val:"$300 (0.6%)", c:"#00ff88" },
  { label:"7/8 Size", val:"$450 (0.9%)", c:"#5bc4f5" },
  { label:"8/8 Size", val:"$600 (1.2%)", c:"#c87af5" },
  { label:"Monthly Target", val:"+$3,150 est.", c:"#ffd700" },
];

const WEEK_TRADES = [
  { date:"May 8 8:40AM", call:"Sweep 28,814 WH → +OB 28,700 long → target 28,900", result:"✅ +240pts peak · +120pts locked", p:true },
  { date:"May 8 9:29AM", call:"SSL 28,637 swept → +SMT → CHoCH → displacement UP → LONG", result:"✅ +249pt candle fired", p:true },
  { date:"May 8 10:00AM", call:"T1 hit 28,900 → 50% off · stop 28,820 · runner 29,000", result:"✅ T1 ✅ Stop locked +120pts", p:true },
  { date:"May 8 11:15AM", call:"-OB 28,944 → BSL not swept → -SMT × 5 → BEARISH EXIT", result:"✅ Exited at 28,820 = +120pts", p:true },
  { date:"May 8 11:24AM", call:"SFP 28,635 + CHoCH + +SMT → LONG 28,685 (bounce attempt)", result:"⚠️ Market continued lower — small loss", p:false },
  { date:"May 9 12:47PM", call:"PDL 28,541 SSL swept → +SMT → BOS → LONG from 28,700", result:"✅ 28,541→29,100 · +559pts", p:true },
  { date:"May 10 9:15AM", call:"Target cascade: 29,200 → 29,320 Weak High → 29,500", result:"✅ All targets hit · 29,386 high", p:true },
  { date:"May 10 1:20PM", call:"5× -SMT at 29,278 · take 50% · warn cycle top zone", result:"✅ 29,386.75 formed · -SMT exact", p:true },
  { date:"May 10 6:05PM", call:"Weak High 29,386 swept · -SMT at top · MSS forming", result:"✅ Closed week +845pts from low", p:true },
];

// ═══════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════
const Tag = ({ label, c }) => (
  <span style={{ fontSize:8,color:c,border:`1px solid ${c}44`,padding:'1px 7px',borderRadius:3,letterSpacing:0.8,flexShrink:0 }}>{label}</span>
);

const SectionHead = ({ title, sub, color }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:4 }}>
      <div style={{ width:3,height:20,background:`linear-gradient(${color},${color}88)`,borderRadius:2 }}/>
      <h2 style={{ margin:0,fontSize:15,fontWeight:900,color:'#e8f4ff',letterSpacing:-0.3 }}>{title}</h2>
    </div>
    {sub && <p style={{ margin:'0 0 0 13px',fontSize:9,color:'#1e3a55',letterSpacing:0.3 }}>{sub}</p>}
  </div>
);

// ═══════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════
export default function APEXUltimateSystem() {
  const [tab, setTab] = useState('formula');

  const TABS = [
    { id:'formula',   label:'⚡ FORMULA' },
    { id:'sessions',  label:'🌍 SESSIONS' },
    { id:'judas',     label:'🎭 JUDAS MODEL' },
    { id:'venom',     label:'🐍 VENOM CYCLE' },
    { id:'factors',   label:'🎯 8 FACTORS' },
    { id:'concepts',  label:'📚 CONCEPTS' },
    { id:'prem',      label:'⚖️ PREM/DISC' },
    { id:'target',    label:'🗺️ 6-STEP TARGET' },
    { id:'liquidity', label:'💧 LIQUIDITY' },
    { id:'levels',    label:'📍 LIVE LEVELS' },
    { id:'exit',      label:'💰 EXIT MODEL' },
    { id:'trades',    label:'📈 LIVE TRADES' },
    { id:'account',   label:'🏦 $50K RULES' },
  ];

  return (
    <div style={{ fontFamily:"'Courier New',monospace",background:'#030b14',color:'#b0c8e0',minHeight:'100vh',padding:'16px 18px',
      backgroundImage:'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,255,136,0.06) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 0% 100%,rgba(91,196,245,0.04) 0%,transparent 60%)'
    }}>

      {/* HEADER */}
      <div style={{ marginBottom:18,borderBottom:'1px solid #0a1e30',paddingBottom:14 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap' }}>
          <div style={{ background:'linear-gradient(135deg,#00ff88,#00d4ff)',padding:'4px 12px',borderRadius:5,fontSize:11,fontWeight:900,color:'#030b14',letterSpacing:2 }}>APEX</div>
          <h1 style={{ margin:0,fontSize:19,fontWeight:900,color:'#ffffff',letterSpacing:-0.5 }}>ULTIMATE COMBINED TRADING SYSTEM</h1>
        </div>
        <p style={{ margin:0,fontSize:9,color:'#1e3a55' }}>
          ICT · SMC · TJR · Venom Model · Judas Swing · Liquidity Raid · MSS/CHoCH · FVG · OB · SMT · Session Manipulation · Premium/Discount · 8-Factor Confluence · $50K Funded
        </p>
        <div style={{ display:'flex',gap:8,marginTop:8,flexWrap:'wrap' }}>
          {['ICT/SMC','Venom Model','Judas Swing','Liquidity Raid','TJR/APEX','APEX V17'].map(t=>(
            <span key={t} style={{ fontSize:8,color:'#00ff88',border:'1px solid #00ff8830',padding:'2px 8px',borderRadius:3,letterSpacing:1 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex',gap:0,marginBottom:18,borderBottom:'1px solid #0a1e30',flexWrap:'wrap' }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:'transparent',border:'none',color:tab===t.id?'#00ff88':'#1e3a55',borderBottom:tab===t.id?'2px solid #00ff88':'2px solid transparent',padding:'7px 11px',cursor:'pointer',fontFamily:'inherit',fontSize:9,fontWeight:tab===t.id?900:400,letterSpacing:0.3,marginBottom:-1,whiteSpace:'nowrap',transition:'color 0.15s' }}>{t.label}</button>
        ))}
      </div>

      {tab==='formula'&&(
        <div>
          <SectionHead title="THE MASTER FORMULA" sub="Every step must confirm. Skip one = skip the trade. No exceptions." color="#00ff88"/>
          <div style={{ background:'#06111e',border:'1px solid #00ff8818',borderRadius:10,padding:20,marginBottom:14,textAlign:'center' }}>
            <div style={{ display:'flex',flexWrap:'wrap',justifyContent:'center',gap:4,marginBottom:12 }}>
              {['HTF BIAS','→','KILL ZONE','→','PREM/DISC','→','LIQ SWEEP','→','CHoCH','→','MSS','→','DISPLACEMENT','→','FVG/OB','→','TARGET'].map((s,i)=>(
                <span key={i} style={{ fontSize:s==='→'?14:10,color:s==='→'?'#1e3a55':'#00ff88',fontWeight:s==='→'?400:800,padding:s==='→'?'0 2px':'3px 8px',background:s==='→'?'transparent':'rgba(0,255,136,0.07)',borderRadius:s==='→'?0:4,border:s==='→'?'none':'1px solid rgba(0,255,136,0.15)',letterSpacing:s==='→'?0:0.8 }}>{s}</span>
              ))}
            </div>
            <p style={{ margin:0,fontSize:9,color:'#2a5a40',lineHeight:1.8 }}>The complete ICT/SMC delivery model: manipulation sweeps liquidity → structure shifts → displacement creates imbalance → FVG retest entry → deliver to opposite liquidity pool</p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8,marginBottom:14 }}>
            {HTF_STEPS.map(h=>(
              <div key={h.tf} style={{ background:'#06111e',border:`1px solid ${h.color}22`,borderRadius:8,padding:12 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:6 }}>
                  <span style={{ fontSize:13,fontWeight:900,color:h.color,width:40 }}>{h.tf}</span>
                  <span style={{ fontSize:8,color:h.color,fontWeight:700,letterSpacing:1 }}>{h.role}</span>
                </div>
                <p style={{ margin:0,fontSize:9,color:'#4a6a88',lineHeight:1.6 }}>{h.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background:'#06111e',border:'1px solid #f5a62322',borderRadius:9,padding:14,marginBottom:12 }}>
            <div style={{ fontSize:9,color:'#f5a623',fontWeight:900,marginBottom:10,letterSpacing:1 }}>⚡ CONFLUENCE SCORE → WIN RATE</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:7 }}>
              {CONF_DATA.map((c,i)=>(
                <div key={i} style={{ background:'#03080f',border:`1px solid ${c.c}22`,borderRadius:6,padding:'9px 12px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:14,fontWeight:900,color:c.c }}>{c.score}</div>
                    <div style={{ fontSize:8,color:'#1e3a55',marginTop:2 }}>{c.verdict}</div>
                  </div>
                  <div style={{ fontSize:16,fontWeight:900,color:c.c }}>{c.wr}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background:'#06111e',border:'1px solid #f5745418',borderRadius:8,padding:14 }}>
            <div style={{ fontSize:9,color:'#f57474',fontWeight:900,marginBottom:10,letterSpacing:1 }}>🚨 4 RULES YOU NEVER BREAK</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7 }}>
              {['Never risk >0.6% per trade on $50K','Never trade ±30 min around FOMC/CPI/NFP','Never add to a losing position','Daily limit hit → close platform immediately'].map((r,i)=>(
                <div key={i} style={{ display:'flex',gap:8,background:'#03080f',padding:'9px 12px',borderRadius:5,border:'1px solid #f5745415' }}>
                  <span style={{ color:'#f57474',flexShrink:0 }}>✗</span>
                  <span style={{ fontSize:9,color:'#5a4a4a',lineHeight:1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='sessions'&&(
        <div>
          <SectionHead title="SESSION-BASED MANIPULATION ANALYSIS" sub="Asia builds liquidity. London manipulates. NY delivers. This cycle repeats every day." color="#5bc4f5"/>
          <div style={{ display:'grid',gap:12 }}>
            {SESSIONS.map(s=>(
              <div key={s.name} style={{ background:'#06111e',border:`1px solid ${s.color}33`,borderRadius:9,padding:16 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap' }}>
                  <span style={{ fontSize:18 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize:12,fontWeight:900,color:s.color,letterSpacing:0.5 }}>{s.name}</div>
                    <div style={{ fontSize:9,color:'#1e3a55' }}>{s.time}</div>
                  </div>
                  <Tag label={s.behavior} c={s.color}/>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                  <div>
                    <div style={{ fontSize:8,color:s.color,marginBottom:6,letterSpacing:0.8 }}>WHAT HAPPENS:</div>
                    {s.what.map((w,i)=>(
                      <div key={i} style={{ display:'flex',gap:7,marginBottom:5 }}>
                        <span style={{ color:`${s.color}77`,flexShrink:0,fontSize:9 }}>→</span>
                        <span style={{ fontSize:9,color:'#5a7a95',lineHeight:1.5 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#03080f',borderRadius:7,padding:10,border:`1px solid ${s.color}18` }}>
                    <div style={{ fontSize:8,color:s.color,marginBottom:6,letterSpacing:0.8 }}>TRADING RULE:</div>
                    <p style={{ margin:0,fontSize:9,color:'#6a8aaa',lineHeight:1.7 }}>{s.trade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='judas'&&(
        <div>
          <SectionHead title="THE JUDAS SWING MODEL" sub="Asia range → London fake move → Displacement → FVG entry → NY delivery." color="#f5a623"/>
          <div style={{ display:'grid',gap:8,marginBottom:14 }}>
            {JUDAS_MODEL.map(j=>(
              <div key={j.step} style={{ background:'#06111e',border:`1px solid ${j.c}22`,borderLeft:`3px solid ${j.c}`,borderRadius:7,padding:13,display:'flex',gap:14 }}>
                <div style={{ width:28,height:28,borderRadius:'50%',background:`${j.c}15`,border:`1px solid ${j.c}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <span style={{ fontSize:11,fontWeight:900,color:j.c }}>{j.step}</span>
                </div>
                <div>
                  <div style={{ fontSize:10,fontWeight:800,color:j.c,marginBottom:4 }}>{j.title}</div>
                  <p style={{ margin:0,fontSize:9,color:'#5a7a95',lineHeight:1.7 }}>{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='venom'&&(
        <div>
          <SectionHead title="THE VENOM MARKET CYCLE" sub="Every major move follows this 5-phase cycle. Identify the phase → position correctly." color="#c87af5"/>
          <div style={{ display:'grid',gap:8 }}>
            {VENOM.map((v,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${v.c}22`,borderLeft:`3px solid ${v.c}`,borderRadius:8,padding:13 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
                  <span style={{ fontSize:9,fontWeight:900,color:v.c,width:30,textAlign:'center',background:`${v.c}15`,padding:'2px 4px',borderRadius:3 }}>{i+1}</span>
                  <span style={{ fontSize:11,fontWeight:900,color:v.c,letterSpacing:0.5 }}>{v.phase}</span>
                </div>
                <p style={{ margin:0,fontSize:9,color:'#6a8aaa',lineHeight:1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='factors'&&(
        <div>
          <SectionHead title="THE 8 CONFLUENCE FACTORS" sub="APEX Elite model — minimum 6/8 required for any trade. 8/8 = maximum position size." color="#f5a623"/>
          <div style={{ display:'grid',gap:9 }}>
            {FACTORS.map(f=>(
              <div key={f.num} style={{ background:'#06111e',border:`1px solid ${f.color}22`,borderLeft:`3px solid ${f.color}`,borderRadius:8,padding:14 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                  <span style={{ fontSize:9,color:f.color,opacity:0.4,fontWeight:700 }}>#{f.num}</span>
                  <span style={{ fontSize:10,fontWeight:900,color:f.color,letterSpacing:0.8 }}>{f.icon} {f.name}</span>
                </div>
                <pre style={{ margin:0,fontSize:9,color:'#6a8aaa',lineHeight:1.8,whiteSpace:'pre-wrap',fontFamily:'inherit' }}>{f.rule}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='concepts'&&(
        <div>
          <SectionHead title="CORE ICT/SMC CONCEPTS" sub="The building blocks of every setup. Master all of these before trading live." color="#c87af5"/>
          <div style={{ display:'grid',gap:10 }}>
            {CONCEPTS.map(c=>(
              <div key={c.name} style={{ background:'#06111e',border:`1px solid ${c.color}22`,borderRadius:9,padding:14 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
                  <span style={{ fontSize:14 }}>{c.icon}</span>
                  <span style={{ fontSize:11,fontWeight:900,color:c.color }}>{c.name}</span>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
                  <div>
                    <div style={{ fontSize:8,color:c.color,marginBottom:4,letterSpacing:0.8 }}>DEFINITION</div>
                    <p style={{ margin:'0 0 8px',fontSize:9,color:'#5a7a95',lineHeight:1.6 }}>{c.def}</p>
                    <div style={{ fontSize:8,color:'#00ff88',marginBottom:3,letterSpacing:0.8 }}>BULLISH</div>
                    <p style={{ margin:'0 0 6px',fontSize:9,color:'#4a7a5a',lineHeight:1.5 }}>{c.bull}</p>
                    <div style={{ fontSize:8,color:'#f57474',marginBottom:3,letterSpacing:0.8 }}>BEARISH</div>
                    <p style={{ margin:0,fontSize:9,color:'#7a4a4a',lineHeight:1.5 }}>{c.bear}</p>
                  </div>
                  <div>
                    <div style={{ background:'rgba(0,255,136,0.05)',border:`1px solid ${c.color}22`,borderRadius:6,padding:10,marginBottom:8 }}>
                      <div style={{ fontSize:8,color:c.color,marginBottom:4,letterSpacing:0.8 }}>HOW WE USE IT</div>
                      <p style={{ margin:0,fontSize:9,color:'#6a8aaa',lineHeight:1.6 }}>{c.use}</p>
                    </div>
                    <div style={{ background:'rgba(245,116,116,0.05)',border:'1px solid rgba(245,116,116,0.2)',borderRadius:6,padding:10 }}>
                      <div style={{ fontSize:8,color:'#f57474',marginBottom:4,letterSpacing:0.8 }}>⚠️ WARNING</div>
                      <p style={{ margin:0,fontSize:9,color:'#7a4a4a',lineHeight:1.6 }}>{c.warning}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='prem'&&(
        <div>
          <SectionHead title="PREMIUM / DISCOUNT / EQUILIBRIUM" sub="The most important filter. Violations of this rule cause the most losses." color="#f5a623"/>
          <div style={{ display:'grid',gap:8,marginBottom:14 }}>
            {PREM_DISC.steps.map((s,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${s.c}22`,borderLeft:`3px solid ${s.c}`,borderRadius:7,padding:12,display:'flex',gap:12,alignItems:'flex-start' }}>
                <div style={{ width:24,height:24,borderRadius:'50%',background:`${s.c}15`,border:`1px solid ${s.c}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <span style={{ fontSize:10,fontWeight:900,color:s.c }}>{i+1}</span>
                </div>
                <div>
                  <div style={{ fontSize:10,fontWeight:800,color:s.c,marginBottom:3 }}>{s.label}</div>
                  <p style={{ margin:0,fontSize:9,color:'#5a7a95',lineHeight:1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='target'&&(
        <div>
          <SectionHead title="6-STEP TARGET LOGIC" sub="How to calculate where price is going before it gets there." color="#ffd700"/>
          <div style={{ display:'grid',gap:9 }}>
            {TARGET_LOGIC.map(t=>(
              <div key={t.step} style={{ background:'#06111e',border:`1px solid ${t.c}22`,borderRadius:8,padding:14 }}>
                <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                  <div style={{ width:30,height:30,borderRadius:6,background:`${t.c}15`,border:`1px solid ${t.c}44`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <span style={{ fontSize:12,fontWeight:900,color:t.c }}>S{t.step}</span>
                  </div>
                  <span style={{ fontSize:11,fontWeight:900,color:t.c,letterSpacing:0.5 }}>{t.title}</span>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:5 }}>
                  {t.items.map((item,i)=>(
                    <div key={i} style={{ display:'flex',gap:7,fontSize:9,color:'#5a7a95',lineHeight:1.5 }}>
                      <span style={{ color:`${t.c}88`,flexShrink:0 }}>→</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='liquidity'&&(
        <div>
          <SectionHead title="COMPLETE LIQUIDITY REFERENCE" sub="Price moves TOWARD liquidity. Always. Map it before every session." color="#f57474"/>
          <div style={{ display:'grid',gap:7 }}>
            {LIQ_TYPES.map((l,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${l.c}22`,borderRadius:6,padding:'10px 13px',display:'flex',gap:12,alignItems:'center',flexWrap:'wrap' }}>
                <Tag label={l.type} c={l.c}/>
                <span style={{ fontSize:10,fontWeight:700,color:'#c0d8f0',width:140,flexShrink:0 }}>{l.label}</span>
                <span style={{ fontSize:9,color:'#5a7a95',flex:1 }}>{l.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='levels'&&(
        <div>
          <SectionHead title="CURRENT NQ LIVE LEVELS" sub="All levels from charts, liquidity analysis, OBs, weak highs/lows, equilibrium, and session structure." color="#00d4ff"/>
          <div style={{ display:'grid',gap:6 }}>
            {CURRENT_LEVELS.map((l,i)=>{
              const bg = l.type==='BSL'?'rgba(0,255,136,0.05)':l.type==='SSL'?'rgba(245,116,116,0.05)':l.type==='PEAK'?'rgba(200,122,245,0.05)':'rgba(91,196,245,0.05)';
              return(
                <div key={i} style={{ display:'flex',gap:12,alignItems:'center',background:bg,borderRadius:6,padding:'9px 12px',border:`1px solid ${l.c}22`,flexWrap:'wrap' }}>
                  <span style={{ fontSize:14,fontWeight:900,color:l.c,width:65,flexShrink:0 }}>{l.price}</span>
                  <Tag label={l.type} c={l.c}/>
                  <span style={{ fontSize:9,color:'#5a7a95',flex:1 }}>{l.label}</span>
                  <Tag label={l.zone} c={l.c}/>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==='exit'&&(
        <div>
          <SectionHead title="EXIT MANAGEMENT — PARTIAL PROFIT SYSTEM" sub="50% at 1R → breakeven stop → runner to 2.8R → take profits in stages." color="#f5a623"/>
          <div style={{ display:'grid',gap:8 }}>
            {EXIT_STEPS.map((s,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${s.c}33`,borderLeft:`3px solid ${s.c}`,borderRadius:7,padding:12,display:'flex',gap:14 }}>
                <div style={{ width:80,flexShrink:0 }}>
                  <div style={{ fontSize:10,fontWeight:900,color:s.c }}>{s.step}</div>
                  <div style={{ fontSize:8,color:'#1e3a55',marginTop:2 }}>Step {i+1}</div>
                </div>
                <p style={{ margin:0,fontSize:9,color:'#7a9ab5',lineHeight:1.7 }}>{s.action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='trades'&&(
        <div>
          <SectionHead title="LIVE TRADE LOG — MAY 8–10 2026" sub="Every call made in real time. +845 points total." color="#3dd6a3"/>
          <div style={{ display:'grid',gap:7 }}>
            {WEEK_TRADES.map((t,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${t.p?'rgba(61,214,163,0.2)':'rgba(245,116,116,0.15)'}`,borderLeft:`3px solid ${t.p?'#3dd6a3':'#f57474'}`,borderRadius:7,padding:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6,marginBottom:5 }}>
                  <span style={{ fontSize:9,fontWeight:700,color:'#5bc4f5' }}>{t.date}</span>
                  <span style={{ fontSize:9,fontWeight:700,color:t.p?'#3dd6a3':'#f57474' }}>{t.result}</span>
                </div>
                <p style={{ margin:0,fontSize:9,color:'#6a8aaa',lineHeight:1.6 }}>{t.call}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='account'&&(
        <div>
          <SectionHead title="$50K FUNDED ACCOUNT — COMPLETE RULES" sub="Every rule below is non-negotiable." color="#00d4ff"/>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8 }}>
            {ACCOUNT.map((a,i)=>(
              <div key={i} style={{ background:'#06111e',border:`1px solid ${a.c}22`,borderRadius:7,padding:'10px 13px' }}>
                <div style={{ fontSize:8,color:'#1e3a55',letterSpacing:1,marginBottom:4 }}>{a.label}</div>
                <div style={{ fontSize:14,fontWeight:900,color:a.c }}>{a.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:20,padding:'10px 14px',background:'#06111e',border:'1px solid #0a1e30',borderRadius:6,display:'flex',gap:10 }}>
        <span style={{ color:'#f5a623',flexShrink:0 }}>⚠</span>
        <p style={{ margin:0,fontSize:8,color:'#1e3a55',lineHeight:1.7 }}>
          APEX Ultimate System — ICT · SMC · TJR · Venom · Judas Swing model combined. Educational reference only. Not financial advice. Live results +845pts May 8-10 2026 from real-time chart analysis. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
