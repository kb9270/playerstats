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

function getOverPerf(gls: number, xG: number) {
  return gls - xG; // positive = overperformer
}

// ── Tooltip ────────────────────────────────────────────────
function PlayerTooltip({ player, x, y }: { player: Player; x: number; y: number }) {
  const perf = getOverPerf(Number(player.Gls) || 0, Number(player.xG) || 0);
  const perfColor = perf > 1 ? "#4ade80" : perf < -1 ? "#f87171" : "#facc15";
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
      minWidth: 200,
      boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, textTransform: "uppercase", color: "#fff", marginBottom: 4 }}>
        {player.Player}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
        {player.Squad} · {player.Pos}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px" }}>
        {[
          { label: "Buts", val: player.Gls },
          { label: "xG", val: Number(player.xG || 0).toFixed(1) },
          { label: "Passes D.", val: player.Ast },
          { label: "xAG", val: Number(player.xAG || 0).toFixed(1) },
          { label: "Tirs", val: player.Sh },
          { label: "Minutes", val: player.Min },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{val}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Sur-performance xG : </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: perfColor }}>
          {perf > 0 ? "+" : ""}{perf.toFixed(1)} buts
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
  const [xAxis, setXAxis] = useState<"xG" | "Ast">("xG");
  const [yAxis, setYAxis] = useState<"Gls" | "xAG">("Gls");

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
      if (!(Number(p.xG) > 0) && !(Number(p.Gls) > 0)) return false;
      return true;
    });
  }, [rawPlayers, league, position, minMin]);

  // Scale helpers
  const xVals = players.map(p => Number((p as any)[xAxis]) || 0);
  const yVals = players.map(p => Number((p as any)[yAxis]) || 0);
  const xMax = Math.max(...xVals, 1) * 1.1;
  const yMax = Math.max(...yVals, 1) * 1.1;

  const W = 820, H = 480;
  const PAD = { top: 30, right: 30, bottom: 60, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const toX = (v: number) => PAD.left + (v / xMax) * plotW;
  const toY = (v: number) => PAD.top + plotH - (v / yMax) * plotH;

  // Diagonal: y = x (parity line)
  const diag = [{ x: 0, y: 0 }, { x: xMax, y: xMax }];

  // Quadrant labels
  const quadrants = [
    { label: "💎 PÉPITES", desc: "xG élevé, sous-cotés", cx: plotW * 0.75 + PAD.left, cy: plotH * 0.2 + PAD.top, color: "#4ade80" },
    { label: "⭐ ÉLITE", desc: "Dominant dans les 2 axes", cx: plotW * 0.75 + PAD.left, cy: plotH * 0.8 + PAD.top, color: "#f59e0b" },
  ];

  // Axis options
  const axisLabels: Record<string, string> = {
    xG: "Expected Goals (xG)",
    Gls: "Buts Réels",
    Ast: "Passes Décisives",
    xAG: "Expected Assists (xAG)",
  };

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
              Moneyball Scouting
            </div>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, textTransform: "uppercase", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            Scout <span style={{ color: "#818cf8" }}>Moneyball</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, maxWidth: 600, lineHeight: 1.6, margin: "0 0 28px" }}>
            Identifier les joueurs <strong style={{ color: "#4ade80" }}>sous-évalués</strong> et <strong style={{ color: "#f87171" }}>sur-évalués</strong> en croisant les buts réels vs les Expected Goals (xG). 
            Approche statistique inspirée de la méthode Moneyball d'Oakland Athletics.
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

          {/* Position */}
          <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => setPosition(pos)} style={{
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

          {/* Axis selectors */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Axe X :</span>
            <select value={xAxis} onChange={e => setXAxis(e.target.value as any)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12 }}>
              <option value="xG">xG</option>
              <option value="Ast">Passes D.</option>
            </select>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Axe Y :</span>
            <select value={yAxis} onChange={e => setYAxis(e.target.value as any)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#fff", padding: "4px 8px", fontSize: 12 }}>
              <option value="Gls">Buts</option>
              <option value="xAG">xAG</option>
            </select>
          </div>
        </motion.div>

        {/* KPI Row */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Joueurs analysés", val: players.length, color: "#818cf8", icon: "📊" },
            { label: "Sur-performers xG", val: players.filter(p => getOverPerf(Number(p.Gls), Number(p.xG)) > 1).length, color: "#4ade80", icon: "⬆️" },
            { label: "Sous-performers xG", val: players.filter(p => getOverPerf(Number(p.Gls), Number(p.xG)) < -1).length, color: "#f87171", icon: "⬇️" },
            { label: "Ligues couvertes", val: new Set(players.map(p => p.Comp)).size, color: "#f59e0b", icon: "🌍" },
          ].map(({ label, val, color, icon }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 24, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, color }}>{val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
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
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Calcul des percentiles…</div>
              </div>
            </div>
          ) : (
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
              style={{ cursor: "crosshair", display: "block" }}>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(t => (
                <g key={t}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH * (1 - t)} y2={PAD.top + plotH * (1 - t)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                  <line x1={PAD.left + plotW * t} x2={PAD.left + plotW * t} y1={PAD.top} y2={PAD.top + plotH} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                </g>
              ))}

              {/* Parity line (y=x) */}
              <line
                x1={toX(0)} y1={toY(0)}
                x2={toX(Math.min(xMax, yMax))} y2={toY(Math.min(xMax, yMax))}
                stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="6,4"
              />
              <text x={toX(Math.min(xMax, yMax) * 0.6) + 6} y={toY(Math.min(xMax, yMax) * 0.6) - 6} fill="rgba(255,255,255,0.2)" fontSize={10} fontFamily="'Barlow Condensed', sans-serif">
                Parité xG/Buts
              </text>

              {/* Axis labels */}
              <text x={W / 2} y={H - 8} fill="rgba(255,255,255,0.35)" fontSize={12} textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>
                {axisLabels[xAxis]}
              </text>
              <text x={14} y={H / 2} fill="rgba(255,255,255,0.35)" fontSize={12} textAnchor="middle" fontFamily="'Barlow Condensed',sans-serif" fontWeight={700} transform={`rotate(-90,14,${H / 2})`}>
                {axisLabels[yAxis]}
              </text>

              {/* Axis tick values */}
              {[0, 0.25, 0.5, 0.75, 1].map(t => (
                <g key={t}>
                  <text x={PAD.left + plotW * t} y={PAD.top + plotH + 18} fill="rgba(255,255,255,0.2)" fontSize={9} textAnchor="middle" fontFamily="monospace">
                    {(xMax * t).toFixed(0)}
                  </text>
                  <text x={PAD.left - 8} y={PAD.top + plotH * (1 - t) + 4} fill="rgba(255,255,255,0.2)" fontSize={9} textAnchor="end" fontFamily="monospace">
                    {(yMax * t).toFixed(0)}
                  </text>
                </g>
              ))}

              {/* Players */}
              {players.map((p, i) => {
                const cx = toX(Number((p as any)[xAxis]) || 0);
                const cy = toY(Number((p as any)[yAxis]) || 0);
                const perf = getOverPerf(Number(p.Gls) || 0, Number(p.xG) || 0);
                const fillColor = perf > 1.5 ? "#4ade80" : perf < -1.5 ? "#f87171" : getLeagueColor(p.Comp);
                const isHov = hovered?.Player === p.Player;
                return (
                  <g key={i}
                    onMouseEnter={() => setHovered(p)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setLocation(`/joueur/${encodeURIComponent(p.Player)}`)}
                    style={{ cursor: "pointer" }}>
                    <circle cx={cx} cy={cy} r={isHov ? 8 : 5}
                      fill={fillColor} fillOpacity={isHov ? 1 : 0.75}
                      stroke={isHov ? "#fff" : "rgba(0,0,0,0.3)"} strokeWidth={isHov ? 2 : 0.5}
                      style={{ transition: "r 0.15s, fill-opacity 0.15s" }} />
                    {isHov && (
                      <text x={cx + 10} y={cy - 6} fill="#fff" fontSize={10} fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>
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
                <PlayerTooltip player={hovered} x={mousePos.x} y={mousePos.y} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { color: "#4ade80", label: "Sur-performer xG (buts > xG +1.5)" },
            { color: "#f87171", label: "Sous-performer xG (buts < xG -1.5)" },
            { color: "#818cf8", label: "Neutre / variable selon ligue" },
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

        {/* Methodology box */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ marginTop: 24, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Info size={14} style={{ color: "#818cf8" }} />
            <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Méthodologie — Approche Moneyball
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { title: "Source des données", desc: "CSV FBRef 2025/26 (2 800+ joueurs) enrichi via SofaScore API pour les xG et statistiques avancées." },
              { title: "Calcul xG", desc: "Expected Goals = probabilité pondérée par la position et le type de tir. Un écart +/- 1.5 buts signale une anomalie statistique." },
              { title: "Identification des pépites", desc: "Joueurs en haut à gauche = xG élevé, peu de buts réels → finisseur potentiel sous-coté. Cibles d'achat idéales." },
            ].map(({ title, desc }) => (
              <div key={title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
