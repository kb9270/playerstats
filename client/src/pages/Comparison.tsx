import { useState, useRef, useEffect } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Search, X, BarChart3 } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import NavBar from "@/components/NavBar";

const PLAYER_COLORS = ["#e8344a", "#6366f1", "#10b981", "#f59e0b"];
const CAT_COLORS: Record<string, string> = { ATT: "#e8344a", CRE: "#6366f1", DEF: "#10b981", PHY: "#f59e0b" };
const METRICS = [
  { key: "Gls",  label: "Buts",          cat: "ATT" },
  { key: "Ast",  label: "Passes Dec.",   cat: "ATT" },
  { key: "xG",   label: "xG",            cat: "ATT" },
  { key: "xAG",  label: "xAG",           cat: "ATT" },
  { key: "Sh",   label: "Tirs",          cat: "ATT" },
  { key: "PrgC", label: "Portees Prog.", cat: "CRE" },
  { key: "PrgP", label: "Passes Prog.",  cat: "CRE" },
  { key: "Cmp%", label: "Pass %",        cat: "CRE" },
  { key: "TklW", label: "Tacles",        cat: "DEF" },
  { key: "Int",  label: "Interc.",       cat: "DEF" },
  { key: "MP",   label: "Matchs",        cat: "PHY" },
  { key: "Min",  label: "Minutes",       cat: "PHY" },
];
const f = (v: any) => isNaN(Number(v)) ? 0 : +Number(v).toFixed(2);

// ── Radar SVG ─────────────────────────────────────────────────
function RadarChart({ players }: { players: any[] }) {
  const mets = METRICS.slice(0, 8);
  const N = mets.length;
  const CX = 190, CY = 190, R = 145;
  const angles = mets.map((_, i) => (i / N) * 2 * Math.PI - Math.PI / 2);
  const maxes = mets.map(m => Math.max(...players.map(p => f(p[m.key])), 0.01));
  return (
    <svg width="380" height="380" viewBox="0 0 380 380" style={{ display: "block", margin: "0 auto" }}>
      {[0.25, 0.5, 0.75, 1].map(lvl => (
        <polygon key={lvl}
          points={angles.map(a => `${CX + R * lvl * Math.cos(a)},${CY + R * lvl * Math.sin(a)}`).join(" ")}
          fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={CX} y1={CY} x2={CX + R * Math.cos(a)} y2={CY + R * Math.sin(a)}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      ))}
      {mets.map((m, i) => {
        const lx = CX + (R + 26) * Math.cos(angles[i]);
        const ly = CY + (R + 26) * Math.sin(angles[i]);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill={CAT_COLORS[m.cat]} fontSize={9.5}
            fontFamily="'Barlow Condensed',sans-serif" fontWeight={700}>
            {m.label}
          </text>
        );
      })}
      {players.map((p, pi) => {
        const pts = mets.map((m, i) => {
          const v = Math.min(f(p[m.key]) / maxes[i], 1);
          return `${CX + R * v * Math.cos(angles[i])},${CY + R * v * Math.sin(angles[i])}`;
        }).join(" ");
        return (
          <g key={pi}>
            <polygon points={pts} fill={PLAYER_COLORS[pi]} fillOpacity={0.15}
              stroke={PLAYER_COLORS[pi]} strokeWidth={2} />
            {mets.map((m, i) => {
              const v = Math.min(f(p[m.key]) / maxes[i], 1);
              return <circle key={i}
                cx={CX + R * v * Math.cos(angles[i])}
                cy={CY + R * v * Math.sin(angles[i])}
                r={4} fill={PLAYER_COLORS[pi]}
                stroke="rgba(0,0,0,0.5)" strokeWidth={1} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ── Bar row ───────────────────────────────────────────────────
function MetricBars({ players, metric }: { players: any[]; metric: typeof METRICS[0] }) {
  const vals = players.map(p => f(p[metric.key]));
  const maxV = Math.max(...vals, 0.01);
  const bestIdx = vals.indexOf(Math.max(...vals));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
        color: CAT_COLORS[metric.cat], textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
        {metric.label}
      </div>
      {players.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 72, fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "right",
            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, flexShrink: 0 }}>
            {(p.Player || "").split(" ").pop()}
          </div>
          <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${maxV > 0 ? (vals[i] / maxV) * 100 : 0}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              style={{ height: "100%", borderRadius: 4, background: PLAYER_COLORS[i],
                boxShadow: i === bestIdx && vals[i] > 0 ? `0 0 8px ${PLAYER_COLORS[i]}` : "none" }}
            />
          </div>
          <div style={{ width: 40, fontSize: 11, fontFamily: "monospace",
            fontWeight: i === bestIdx && vals[i] > 0 ? 900 : 400,
            color: i === bestIdx && vals[i] > 0 ? PLAYER_COLORS[i] : "rgba(255,255,255,0.35)", flexShrink: 0 }}>
            {vals[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Search ─────────────────────────────────────────────────────
function PlayerSearch({ onAdd, disabled }: { onAdd: (p: any) => void; disabled: boolean }) {
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDq(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const { data: results, isLoading: searching } = useQuery<any[]>({
    queryKey: [`/api/players/search?q=${dq}`],
    enabled: dq.length > 2,
    staleTime: 60_000,
  });

  const pick = (p: any) => { onAdd(p); setQ(""); setDq(""); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ position: "relative", maxWidth: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14 }}>
        <Search size={15} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
        <input value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => dq.length > 2 && setOpen(true)}
          disabled={disabled}
          placeholder={disabled ? "Maximum 4 joueurs atteint" : "Rechercher un joueur (ex: Mbappe, Haaland)..."}
          style={{ flex: 1, background: "none", border: "none", outline: "none",
            color: disabled ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 14,
            fontFamily: "'Barlow', sans-serif", cursor: disabled ? "not-allowed" : "text" }} />
      </div>
      <AnimatePresence>
        {open && dq.length > 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
              background: "rgba(8,8,22,0.98)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
              maxHeight: 300, overflowY: "auto" }}>
            {searching && <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Recherche...</div>}
            {!searching && (!results || results.length === 0) && (
              <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Aucun resultat pour "{dq}"</div>
            )}
            {!searching && results && results.slice(0, 8).map((p: any) => (
              <div key={p.name} onClick={() => pick(p)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                  cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <PlayerAvatar playerName={p.name} teamName={p.team} size="sm" />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{p.team} · {p.position}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function Comparison() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<{ name: string; team: string }[]>([]);

  const slots = [
    selected[0]?.name ?? null,
    selected[1]?.name ?? null,
    selected[2]?.name ?? null,
    selected[3]?.name ?? null,
  ];

  const qResults = useQueries({
    queries: slots.map(name => ({
      queryKey: [`/api/csv-direct/player/${encodeURIComponent(name ?? "")}/full`],
      enabled: !!name,
      staleTime: 5 * 60_000,
      retry: 1,
    })),
  });

  const fullPlayers = qResults
    .map((r, i) => (slots[i] ? (r.data as any)?.player : null))
    .filter(Boolean);

  const isLoading = qResults.some((r, i) => !!slots[i] && r.isLoading);

  const addPlayer = (p: { name: string; team: string }) => {
    if (selected.length >= 4 || selected.find(x => x.name === p.name)) return;
    setSelected(prev => [...prev, p]);
  };
  const removePlayer = (name: string) => setSelected(prev => prev.filter(p => p.name !== name));

  const cats = ["ATT", "CRE", "DEF", "PHY"] as const;
  const catLabels: Record<string, string> = { ATT: "Attaque", CRE: "Creation", DEF: "Defense", PHY: "Physique" };

  return (
    <div style={{ minHeight: "100vh", background: "#04040f", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>

        <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontFamily: "'Barlow Condensed',sans-serif",
          fontWeight: 900, textTransform: "uppercase", margin: "0 0 6px" }}>
          Comparaison <span style={{ color: "#e8344a" }}>Joueurs</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>
          Jusqu'a 4 joueurs · Radar + Barres + Tableau · CSV + SofaScore 2025/26
        </p>

        <div style={{ marginBottom: 20 }}>
          <PlayerSearch onAdd={addPlayer} disabled={selected.length >= 4} />
        </div>

        {selected.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
            {selected.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
                  background: `${PLAYER_COLORS[i]}18`, border: `1px solid ${PLAYER_COLORS[i]}40`, borderRadius: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PLAYER_COLORS[i] }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 13,
                  color: PLAYER_COLORS[i] }}>{p.name}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{p.team}</span>
                <button onClick={() => removePlayer(p.name)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", padding: 2 }}>
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0",
            color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            <div style={{ width: 18, height: 18, border: "2px solid rgba(232,52,74,0.3)",
              borderTopColor: "#e8344a", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
            Chargement des donnees...
          </div>
        )}

        {selected.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.18)" }}>
            <BarChart3 size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 6 }}>
              Aucun joueur selectionne
            </div>
            <div style={{ fontSize: 13 }}>Recherchez un joueur ci-dessus pour commencer</div>
          </div>
        )}

        {selected.length === 1 && !isLoading && (
          <div style={{ padding: "30px 0", color: "rgba(255,255,255,0.28)", fontSize: 13, textAlign: "center" }}>
            Ajoutez un 2eme joueur pour afficher la comparaison
          </div>
        )}

        {fullPlayers.length >= 2 && !isLoading && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>

            {/* RADAR CHART — toujours visible en premier */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20, padding: "24px 28px", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18,
                    textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff", marginBottom: 4 }}>
                    Radar des Performances
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    Normalise par rapport au meilleur joueur selectionne — 8 metriques
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {fullPlayers.map((p: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 24, height: 4, borderRadius: 2, background: PLAYER_COLORS[i] }} />
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                        fontSize: 13, color: PLAYER_COLORS[i] }}>{p.Player}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
                <div style={{ flex: "0 0 auto" }}>
                  <RadarChart players={fullPlayers} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {METRICS.slice(0, 8).map((m, i) => {
                    const vals = fullPlayers.map((p: any) => f(p[m.key]));
                    const maxV = Math.max(...vals, 0.01);
                    const bestIdx = vals.indexOf(Math.max(...vals));
                    return (
                      <div key={m.key} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed',sans-serif",
                            fontWeight: 700, color: CAT_COLORS[m.cat], textTransform: "uppercase" }}>
                            {m.label}
                          </span>
                          <div style={{ display: "flex", gap: 10 }}>
                            {fullPlayers.map((p: any, pi: number) => (
                              <span key={pi} style={{ fontSize: 11, fontFamily: "monospace",
                                fontWeight: pi === bestIdx ? 900 : 400,
                                color: pi === bestIdx ? PLAYER_COLORS[pi] : "rgba(255,255,255,0.35)" }}>
                                {f(p[m.key])}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 2 }}>
                          {fullPlayers.map((p: any, pi: number) => (
                            <motion.div key={pi}
                              initial={{ width: 0 }}
                              animate={{ width: `${(f(p[m.key]) / maxV) * 100}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 + pi * 0.03 }}
                              style={{ height: 5, borderRadius: 3, background: PLAYER_COLORS[pi],
                                opacity: pi === bestIdx ? 1 : 0.4,
                                boxShadow: pi === bestIdx ? `0 0 6px ${PLAYER_COLORS[pi]}` : "none" }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BARRES PAR CATEGORIE */}
            <div style={{ display: "grid", gridTemplateColumns: `160px repeat(${fullPlayers.length},1fr)`,
              gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div />
              {fullPlayers.map((p: any, i: number) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%",
                    border: `3px solid ${PLAYER_COLORS[i]}`, overflow: "hidden",
                    margin: "0 auto 8px", background: "rgba(255,255,255,0.05)" }}>
                    <PlayerAvatar playerName={p.Player} teamName={p.Squad} size="lg" />
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900,
                    fontSize: 13, color: PLAYER_COLORS[i], textTransform: "uppercase" }}>{p.Player}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>{p.Squad}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{p.Pos} · {p.Age} ans</div>
                </div>
              ))}
            </div>

            {cats.map(cat => {
              const catMets = METRICS.filter(m => m.cat === cat);
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: CAT_COLORS[cat] }} />
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800,
                      fontSize: 13, color: CAT_COLORS[cat], textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {catLabels[cat]}
                    </span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14, padding: "16px 20px" }}>
                    {catMets.map(m => <MetricBars key={m.key} players={fullPlayers} metric={m} />)}
                  </div>
                </div>
              );
            })}

            {/* TABLEAU RECAP */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13,
                color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Tableau recapitulatif
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      <th style={{ padding: "9px 16px", textAlign: "left", fontSize: 10,
                        color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Metrique</th>
                      {fullPlayers.map((p: any, i: number) => (
                        <th key={i} style={{ padding: "9px 16px", textAlign: "center", fontSize: 11,
                          fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: PLAYER_COLORS[i] }}>
                          {(p.Player || "").split(" ").pop()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {METRICS.map((m, ri) => {
                      const vals = fullPlayers.map((p: any) => f(p[m.key]));
                      const maxV = Math.max(...vals);
                      return (
                        <tr key={m.key} style={{ borderTop: "1px solid rgba(255,255,255,0.04)",
                          background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "8px 16px", fontSize: 11,
                            fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700,
                            color: CAT_COLORS[m.cat], textTransform: "uppercase" }}>{m.label}</td>
                          {fullPlayers.map((p: any, i: number) => {
                            const v = f(p[m.key]);
                            const best = v === maxV && maxV > 0;
                            return (
                              <td key={i} style={{ padding: "8px 16px", textAlign: "center",
                                fontFamily: "monospace", fontWeight: best ? 900 : 400,
                                fontSize: best ? 14 : 12,
                                color: best ? PLAYER_COLORS[i] : "rgba(255,255,255,0.45)" }}>
                                {v}{best ? " *" : ""}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
