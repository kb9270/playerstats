import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Info } from "lucide-react";
import NavBar from "@/components/NavBar";

// ── Types ──────────────────────────────────────────────────
interface Player {
  Player: string;
  Squad: string;
  Comp: string;
  Pos: string;
  Age: number;
  Gls: number;
  Ast: number;
  xG: number;
  xAG: number;
  Min: number;
  MP: number;
  Sh: number;
  SoT: number;
  Crs: number;
  TklW: number;
  Int: number;
  Saves: number;
  SavePct: number;
  SoTA: number;
  CS: number;
  PrgP: number;
  PrgC: number;
  CmpPct: number;
  SuccPct: number;
  Succ: number;
  Att: number;
  Tkl: number;
  TklW: number;
  Blocks: number;
  CarryDist: number;
  PrgCarryDist: number;
  AerWon: number;
  AerLost: number;
  logo?: string;
}

// ── Helpers ────────────────────────────────────────────────
const LEAGUES = ["Toutes", "Premier League", "La Liga", "Ligue 1", "Serie A", "Bundesliga"];
const POSITIONS = ["Tous", "FW", "MF", "DF", "GK"];
const LEAGUE_COLORS: Record<string, string> = {
  "Premier League": "#3b0ca3",
  "La Liga":        "#e01b24",
  "Ligue 1":        "#0a3d91",
  "Serie A":        "#008000",
  "Bundesliga":     "#d4000f",
};

function getLeagueColor(comp: string) {
  for (const [k, v] of Object.entries(LEAGUE_COLORS)) {
    if (comp?.includes(k)) return v;
  }
  return "#6366f1";
}

// ── Metric Definitions ─────────────────────────────────────
// Define the available metrics for axes
const METRICS: Record<string, { label: string; desc: string }> = {
  Gls: { label: "Buts Réels", desc: "Buts marqués" },
  xG: { label: "xG", desc: "Expected Goals" },
  Ast: { label: "Passes D.", desc: "Passes décisives" },
  xAG: { label: "xAG", desc: "Expected Assisted Goals" },
  Sh: { label: "Tirs", desc: "Tirs totaux" },
  SoT: { label: "Tirs Cadrés", desc: "Tirs cadrés" },
  Crs: { label: "Centres", desc: "Centres tentés" },
  Tkl: { label: "Tacles", desc: "Tacles tentés" },
  TklW: { label: "Tacles Réussis", desc: "Tacles défensifs remportés" },
  Int: { label: "Interceptions", desc: "Interceptions" },
  Blocks: { label: "Contres", desc: "Tirs/Passes contrés" },
  PrgP: { label: "Passes Pro.", desc: "Passes progressives" },
  PrgC: { label: "Courses Pro.", desc: "Courses progressives" },
  CmpPct: { label: "% Passes", desc: "Précision des passes" },
  SuccPct: { label: "% Dribbles", desc: "Réussite des dribbles" },
  Succ: { label: "Dribbles Réussis", desc: "Dribbles éliminant un joueur" },
  Att: { label: "Dribbles Tentés", desc: "Tentatives de dribbles" },
  Saves: { label: "Arrêts (GK)", desc: "Arrêts du gardien" },
  SavePct: { label: "% Arrêts (GK)", desc: "Pourcentage d'arrêts" },
  SoTA: { label: "Tirs Subis (GK)", desc: "Tirs cadrés concédés" },
  CS: { label: "Clean Sheets", desc: "Matchs sans encaisser" },
  CarryDist: { label: "Dist. Balle au Pied (m)", desc: "Distance couverte balle au pied" },
  PrgCarryDist: { label: "Dist. Progr. (m)", desc: "Distance vers l'avant balle au pied" },
  AerWon: { label: "Duels Aér. Gagnés", desc: "Duels aériens remportés" },
  AerLost: { label: "Duels Aér. Perdus", desc: "Duels aériens perdus" },
};

// Common comparisons to quickly select
const COMPARISONS = [
  { label: "Finition (Gls vs xG)", x: "xG", y: "Gls", color: "#4ade80" },
  { label: "Création (Ast vs xAG)", x: "xAG", y: "Ast", color: "#fbbf24" },
  { label: "Activité Balle au Pied (Prog vs Total)", x: "CarryDist", y: "PrgCarryDist", color: "#38bdf8" },
  { label: "Duels Au Sol (Réussis vs Tentés)", x: "Tkl", y: "TklW", color: "#f472b6" },
  { label: "Poids Aérien (Gagnés vs Perdus)", x: "AerLost", y: "AerWon", color: "#818cf8" },
  { label: "Provocation (Réussis vs Tentés)", x: "Att", y: "Succ", color: "#2dd4bf" },
  { label: "Gardiens (Arrêts vs Tirs Subis)", x: "SoTA", y: "Saves", color: "#a855f7" },
];

function getOverPerf(valY: number, valX: number) {
  return valY - valX;
}

// ── Tooltip ────────────────────────────────────────────────
function PlayerTooltip({ player, x, y, xAxis, yAxis }: { player: Player; x: number; y: number; xAxis: string; yAxis: string }) {
  const perf = getOverPerf(Number((player as any)[yAxis]) || 0, Number((player as any)[xAxis]) || 0);
  const perfColor = perf > 0 ? "#4ade80" : "#f87171";
  
  return (
    <div style={{
      position: "fixed",
      left: x + 12,
      top: y - 10,
      zIndex: 999,
      pointerEvents: "none",
      background: "rgba(8,8,20,0.97)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 12,
      padding: "12px 16px",
      minWidth: 220,
      boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, textTransform: "uppercase", color: "#fff", marginBottom: 4 }}>
        {player.Player}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
        {player.Squad} · {player.Pos} · {player.Age} ans
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px" }}>
        {[
          { label: METRICS[xAxis]?.label || xAxis, val: Number((player as any)[xAxis] || 0).toFixed(1) },
          { label: METRICS[yAxis]?.label || yAxis, val: Number((player as any)[yAxis] || 0).toFixed(1) },
          { label: "Minutes", val: player.Min },
          { label: "Matchs", val: player.MP },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Différence d'axe : </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: perfColor }}>
          {perf > 0 ? "+" : ""}{perf.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function ScoutMoneyball() {
  const [, setLocation] = useLocation();
  const [league, setLeague] = useState("Toutes");
  const [position, setPosition] = useState("Tous");
  const [minMin, setMinMin] = useState(500);
  const [hovered, setHovered] = useState<Player | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [xAxis, setXAxis] = useState<string>("xG");
  const [yAxis, setYAxis] = useState<string>("Gls");
  const [showSurprises, setShowSurprises] = useState(false);
  const [showTakeOver, setShowTakeOver] = useState(false);

  const preset = COMPARISONS.find(c => c.x === xAxis && c.y === yAxis) || { label: "", x: xAxis, y: yAxis };
  const isSubsetPreset = preset.label.includes("Provocation") || preset.label.includes("Gardiens") || preset.label.includes("Activité") || preset.label.includes("Duels Au Sol");

  const { data: rawPlayers, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/csv-direct/players/all"],
    staleTime: 10 * 60_000,
  });

  const players = useMemo(() => {
    if (!rawPlayers) return [];
    return rawPlayers.filter(p => {
      if (league !== "Toutes" && !p.Comp?.includes(league)) return false;
      if (position !== "Tous" && !p.Pos?.includes(position)) return false;
      if ((Number(p.Min) || 0) < minMin) return false;
      const xVal = Number((p as any)[xAxis]) || 0;
      const yVal = Number((p as any)[yAxis]) || 0;
      if (xVal === 0 && yVal === 0) return false;
      return true;
    });
  }, [rawPlayers, league, position, minMin, xAxis, yAxis]);

  const overPerfCount = players.filter(p => {
    const valY = Number((p as any)[yAxis]) || 0;
    const valX = Number((p as any)[xAxis]) || 0;
    return valY > valX * 1.1; 
  }).length;

  const xVals = players.map(p => Number((p as any)[xAxis]) || 0);
  const yVals = players.map(p => Number((p as any)[yAxis]) || 0);
  const globalMax = Math.max(...xVals, ...yVals, 1) * 1.05;
  const xMax = globalMax;
  const yMax = globalMax;

  const W = 820, H = 480;
  const PAD = { top: 30, right: 30, bottom: 60, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = (v: number) => PAD.left + (v / xMax) * plotW;
  const toY = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  return (
    <div style={{ minHeight: "100vh", background: "#04040f", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ padding: "4px 10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 6, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#818cf8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Portfolio Feature
            </div>
            <div style={{ padding: "4px 10px", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 6, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#4ade80", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Moneyball Scouting Pro
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, textTransform: "uppercase", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            Scout <span style={{ color: "#818cf8" }}>Moneyball Pro</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, maxWidth: 650, lineHeight: 1.6, margin: "0 0 28px" }}>
            Comparez n'importe quelle métrique pour dénicher les pépites sous-évaluées. 
            Croisez xG, tacles, arrêts ou centres pour trouver le profil exact dont votre équipe a besoin.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24, alignItems: "center" }}>
          {/* League */}
          <div style={{ display: "flex", gap: 4 }}>
            {LEAGUES.map(l => (
              <button key={l} onClick={() => setLeague(l)} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                background: league === l ? "rgba(129,140,248,0.2)" : "rgba(255,255,255,0.04)",
                border: league === l ? "1px solid rgba(129,140,248,0.5)" : "1px solid rgba(255,255,255,0.06)",
                color: league === l ? "#818cf8" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
          </div>

          {/* High Performer Toggles */}
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => setShowSurprises(!showSurprises)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
              background: showSurprises ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.04)",
              border: showSurprises ? "1px solid rgba(251,191,36,0.5)" : "1px solid rgba(255,255,255,0.06)",
              color: showSurprises ? "#fbbf24" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s",
            }}>
              🌟 Pépites
            </button>

            <button onClick={() => setShowTakeOver(!showTakeOver)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
              background: showTakeOver ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
              border: showTakeOver ? "1px solid rgba(34,211,238,0.5)" : "1px solid rgba(255,255,255,0.06)",
              color: showTakeOver ? "#22d3ee" : "rgba(255,255,255,0.4)",
              transition: "all 0.2s",
            }}>
              🔥 Take Over
            </button>
          </div>

          {/* Position */}
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => {
                setPosition(pos);
                if (pos === "GK") {
                  setXAxis("SoTA");
                  setYAxis("Saves");
                } else if (pos === "DF") {
                  setXAxis("TklW");
                  setYAxis("Int");
                }
              }} style={{
                padding: "6px 12px", borderRadius: 8, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
                background: position === pos ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
                border: position === pos ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.06)",
                color: position === pos ? "#fbbf24" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s",
              }}>{pos}</button>
            ))}
          </div>

          {/* Min minutes slider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Min. {minMin}min</span>
            <input type="range" min={0} max={2000} step={100} value={minMin} onChange={e => setMinMin(Number(e.target.value))}
              style={{ width: 100, accentColor: "#818cf8" }} />
          </div>
        </motion.div>

        {/* Axis & Presets */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 24, alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Presets :</span>
            {COMPARISONS.map(comp => {
              const isActive = xAxis === comp.x && yAxis === comp.y;
              return (
                <button key={comp.label} onClick={() => { setXAxis(comp.x); setYAxis(comp.y); }}
                  style={{
                    padding: "4px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer",
                    background: isActive ? `${comp.color}33` : "rgba(255,255,255,0.05)",
                    border: isActive ? `1px solid ${comp.color}80` : "1px solid transparent",
                    color: isActive ? comp.color : "rgba(255,255,255,0.6)",
                  }}>
                  {comp.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Axe X :</span>
              <select value={xAxis} onChange={e => setXAxis(e.target.value)} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12, outline: "none" }}>
                {Object.entries(METRICS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Axe Y :</span>
              <select value={yAxis} onChange={e => setYAxis(e.target.value)} style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12, outline: "none" }}>
                {Object.entries(METRICS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* KPI Row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Joueurs analysés", val: players.length, color: "#818cf8", icon: "📊" },
            { label: `Profil ${METRICS[yAxis]?.label || yAxis}`, val: isSubsetPreset ? "-" : players.filter(p => getOverPerf(Number((p as any)[yAxis]), Number((p as any)[xAxis])) > globalMax * 0.05).length, color: "#4ade80", icon: "⭐" },
            { label: `Profil ${METRICS[xAxis]?.label || xAxis}`, val: isSubsetPreset ? "-" : players.filter(p => getOverPerf(Number((p as any)[yAxis]), Number((p as any)[xAxis])) < -globalMax * 0.05).length, color: "#f59e0b", icon: "🔥" },
            { label: "Ligues couvertes", val: new Set(players.map(p => p.Comp)).size, color: "#ec4899", icon: "🌍" },
          ].map(({ label, val, color, icon }, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 24, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color }}>{val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scatter Plot */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px", overflow: "hidden", position: "relative" }}>

          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 48, height: 48, border: "3px solid rgba(129,140,248,0.3)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Analyse en cours…</div>
              </div>
            </div>
          ) : players.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 480, color: "rgba(255,255,255,0.5)" }}>
              Aucun joueur ne correspond aux critères sélectionnés.
            </div>
          ) : (
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
              style={{ cursor: "crosshair", display: "block" }}>
              {[0.25, 0.5, 0.75, 1].map(t => (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH * (1 - t)} y2={PAD.top + plotH * (1 - t)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                  <line x1={PAD.left + plotW * t} x2={PAD.left + plotW * t} y1={PAD.top} y2={PAD.top + plotH} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                </g>
              ))}

              {/* Axe de parité toujours affiché à la demande de l'utilisateur */}
              <>
                <line
                  x1={toX(0)} y1={toY(0)}
                  x2={toX(globalMax)} y2={toY(globalMax)}
                  stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="6,4"
                />
                <text x={toX(globalMax * 0.6) + 6} y={toY(globalMax * 0.6) - 6} fill="rgba(255,255,255,0.2)" fontSize={10} fontFamily="'Barlow Condensed', sans-serif">
                  {isSubsetPreset ? `100% ${METRICS[yAxis]?.label || yAxis}` : `Parité ${METRICS[yAxis]?.label || yAxis} / ${METRICS[xAxis]?.label || xAxis}`}
                </text>
              </>

              {/* Axis labels */}
              <text x={W / 2} y={H - 8} fill="rgba(255,255,255,0.35)" fontSize={12} textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>
                {METRICS[xAxis]?.label || xAxis}
              </text>
              <text x={14} y={H / 2} fill="rgba(255,255,255,0.35)" fontSize={12} textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700} transform={`rotate(-90,14,${H / 2})`}>
                {METRICS[yAxis]?.label || yAxis}
              </text>

              {/* Axis tick values */}
              {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <g key={t}>
                  <text x={PAD.left + plotW * t} y={PAD.top + plotH + 18} fill="rgba(255,255,255,0.2)" fontSize={9} textAnchor="middle" fontFamily="monospace">
                    {(xMax * t).toFixed(1)}
                  </text>
                  <text x={PAD.left - 8} y={PAD.top + plotH * (1 - t) + 4} fill="rgba(255,255,255,0.2)" fontSize={9} textAnchor="end" fontFamily="monospace">
                    {(yMax * t).toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Players */}
              {players.map((p, i) => {
                const cx = toX(Number((p as any)[xAxis]) || 0);
                const cy = toY(Number((p as any)[yAxis]) || 0);
                
                const valY = Number((p as any)[yAxis]) || 0;
                const valX = Number((p as any)[xAxis]) || 0;
                const overPerf = getOverPerf(valY, valX);
                
                const bigClubs = ['Real Madrid', 'Manchester City', 'Paris S-G', 'Bayern Munich', 'Arsenal', 'Liverpool', 'Barcelona', 'Inter', 'Juventus', 'Bayer Leverkusen'];
                const isTopClub = bigClubs.includes(p.Squad);
                const isPerformingWell = valY >= globalMax * 0.45;
                const isTakeOver = isTopClub && isPerformingWell;
                const isYoung = Number(p.Age) <= 27;
                const isPepite = !isTopClub && isYoung && isPerformingWell;

                let fillColor = getLeagueColor(p.Comp);
                let opacity = 0.7;

                const isAnyFilterOn = showSurprises || showTakeOver;

                if (isAnyFilterOn) {
                   if (showSurprises && isPepite) {
                       fillColor = "#fbbf24"; // Jaune Pépites
                       opacity = 1;
                   } else if (showTakeOver && isTakeOver) {
                       fillColor = "#22d3ee"; // Cyan Électrique Take Over
                       opacity = 1;
                   } else {
                       fillColor = "rgba(255,255,255,0.05)";
                       opacity = 0.1;
                   }
                } else {
                    if (isTakeOver) {
                        fillColor = "#22d3ee"; // On garde le cyan par défaut pour les stars
                        opacity = 0.85;
                    } else if (!isSubsetPreset) {
                        if (overPerf > globalMax * 0.05) fillColor = "#4ade80";
                        else if (overPerf < -globalMax * 0.05) fillColor = "#f87171";
                    } else {
                        const ratio = valX > 0 ? valY / valX : 0;
                        if (ratio >= 0.75 && valX > globalMax * 0.1) fillColor = "#4ade80";
                        else if (ratio <= 0.4 && valX > globalMax * 0.1) fillColor = "#f87171";
                    }
                }

                const isHov = hovered?.Player === p.Player;
                if (isHov) opacity = 1;

                return (
                  <g key={i}
                    onMouseEnter={() => setHovered(p)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setLocation(`/joueur/${encodeURIComponent(p.Player)}`)}>
                    <circle cx={cx} cy={cy} r={isHov ? 8 : (isAnyFilterOn && (isPepite || isTakeOver) ? 6 : 4)}
                      fill={fillColor} fillOpacity={opacity}
                      stroke={isHov || (isAnyFilterOn && (isPepite || isTakeOver)) ? "#fff" : "rgba(0,0,0,0.3)"} strokeWidth={isHov || (isAnyFilterOn && (isPepite || isTakeOver)) ? 2 : 0.5}
                      style={{ transition: "all 0.2s" }} />
                    {isHov && (
                      <text x={cx + 10} y={cy - 6} fill="#fff" fontSize={11} fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>
                        {p.Player.split(" ").pop()}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Tooltip */}
          <AnimatePresence>
            {hovered && (
              <motion.div key="tooltip" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                <PlayerTooltip player={hovered} x={mousePos.x} y={mousePos.y} xAxis={xAxis} yAxis={yAxis} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { color: "#4ade80", label: `Dominance ${METRICS[yAxis]?.label}` },
            { color: "#f87171", label: `Dominance ${METRICS[xAxis]?.label}` },
            { color: "#818cf8", label: "Equilibré / Couleur ligue" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
            Cliquer sur un point → Profil complet du joueur
          </div>
        </div>

        {/* Glossary & Explanations box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ marginTop: 24, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Info size={18} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: 14, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Le Carnet du Recruteur : Comment dénicher la perle rare ?
            </span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#4ade80" }}>⚽ Le Tueur Clinique (Finition)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Le <strong>xG</strong> évalue la qualité des occasions. Un attaquant très au-dessus de la ligne de parité est un finisseur d'élite, idéal si votre équipe se crée peu d'occasions. À l'inverse, un joueur très à droite (haut xG) mais sous la ligne est une cible à relancer s'il sait se créer des espaces.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#fbbf24" }}>🎯 La Pépite Sous-cotée (Création)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Le <strong>xAG</strong> représente les "caviars" distribués. Un créateur avec un très haut xAG (très à droite) mais peu de Passes D. (bas) pâtit du manque de réalisme de ses attaquants actuels. C'est l'opportunité de marché parfaite à recruter pour fournir votre buteur vedette !
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#38bdf8" }}>⚡ Le Porteur d'Eau (Activité)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Comparez la <strong>Distance Totale</strong> parcourue balle au pied à la <strong>Distance Progressive</strong> (vers l'avant). Un joueur collé à la ligne de parité est un accélérateur de jeu vertical qui ne court que pour attaquer.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#f472b6" }}>🛡️ Le Roc Defensif (Duels)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Les vrais défenseurs d'élite ont un ratio de <strong>Tacles Réussis</strong> proche de leurs <strong>Tacles Tentés</strong>. La ligne de parité représente 100% de réussite. Visez ceux avec un énorme volume (à droite) collés à la ligne !
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#818cf8" }}>✈️ La Tour de Contrôle (Aérien)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Comparez les <strong>Duels Aériens Gagnés</strong> et <strong>Perdus</strong>. Un joueur très haut sur l'axe Y et bas sur l'axe X est impérial de la tête, gagnant la majorité de ses batailles dans les airs.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#a855f7" }}>🛡️ Le Mur (Gardiens)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                La ligne de parité représente 100% d'arrêts. Plus un gardien s'en approche tout en affrontant un volume énorme de <strong>Tirs Subis (SoTA)</strong> (très à droite), plus il est décisif et rapporte de points à lui seul.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#2dd4bf" }}>✨ La Provocation (Dribbles)</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                Comparez les <strong>Dribbles Tentés</strong> aux <strong>Dribbles Réussis</strong>. Les joueurs très haut et très à droite sont les dribbleurs d'élite, véritables cauchemars pour les défenseurs, car ils ont à la fois un énorme volume de tentatives et un excellent taux de réussite.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
