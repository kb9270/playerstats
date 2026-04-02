import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Trophy, Star, Target, Zap, ChevronLeft, Award } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import Header from "@/components/Header";

// ─── Ultimate Stage Palette ────────────────────────────────
const UCL_NIGHT = "#000B29"; // Deep night blue
const UCL_ROYAL = "#003399"; // Royal blue
const UCL_CYAN  = "#00E5FF"; // Electric cyan spotlight
const UCL_WHITE = "#FFFFFF";
const UCL_GLOW  = "rgba(0, 229, 255, 0.3)";

// ─── Seed Data ──────────────────────────────────────────────
const UCL_TOTW_2526: any[] = [
  { Player: "Gianluigi Donnarumma", Squad: "Paris Saint-Germain", Pos: "GK", rating: 8.4, sofaId: 215998 },
  { Player: "Achraf Hakimi",        Squad: "Paris Saint-Germain", Pos: "DF", rating: 8.1, sofaId: 852073 },
  { Player: "Virgil van Dijk",      Squad: "Liverpool",           Pos: "DF", rating: 8.3, sofaId: 80077  },
  { Player: "Antonio Rüdiger",      Squad: "Real Madrid",         Pos: "DF", rating: 7.9, sofaId: 136939 },
  { Player: "Alphonso Davies",      Squad: "Real Madrid",         Pos: "DF", rating: 7.8, sofaId: 875692 },
  { Player: "Lamine Yamal",         Squad: "Barcelona",           Pos: "FW", rating: 9.2, sofaId: 1157638},
  { Player: "Pedri",                Squad: "Barcelona",           Pos: "MF", rating: 8.5, sofaId: 977777 },
  { Player: "Jude Bellingham",      Squad: "Real Madrid",         Pos: "MF", rating: 8.8, sofaId: 1157656},
  { Player: "Vinícius Júnior",      Squad: "Real Madrid",         Pos: "FW", rating: 9.0, sofaId: 948666 },
  { Player: "Erling Haaland",       Squad: "Manchester City",     Pos: "FW", rating: 9.1, sofaId: 839956 },
  { Player: "Rafael Leão",          Squad: "AC Milan",            Pos: "FW", rating: 8.6, sofaId: 910948 },
];

const UCL_SCORERS_SEED = [
  { name: "Erling Haaland",   team: "Manchester City",     goals: 14, sofaId: 839956 },
  { name: "Kylian Mbappé",    team: "Real Madrid",         goals: 12, sofaId: 1403848},
  { name: "Vinícius Júnior",  team: "Real Madrid",         goals: 11, sofaId: 948666 },
  { name: "Lamine Yamal",     team: "Barcelona",           goals: 9,  sofaId: 1157638},
  { name: "Jude Bellingham",  team: "Real Madrid",         goals: 8,  sofaId: 1157656},
];

const UCL_ASSISTERS_SEED = [
  { name: "Lamine Yamal",     team: "Barcelona",           assists: 9,  sofaId: 1157638},
  { name: "Kevin De Bruyne",  team: "Manchester City",     assists: 8,  sofaId: 164655 },
  { name: "Vinícius Júnior",  team: "Real Madrid",         assists: 7,  sofaId: 948666 },
  { name: "Erling Haaland",   team: "Manchester City",     assists: 6,  sofaId: 839956 },
  { name: "Achraf Hakimi",    team: "Paris Saint-Germain", assists: 6,  sofaId: 852073 },
];

const UCL_YOUNG_SEED = [
  { name: "Lamine Yamal",        team: "Barcelona",           age: 17, rating: 9.2, sofaId: 1157638},
  { name: "Jude Bellingham",     team: "Real Madrid",         age: 21, rating: 8.8, sofaId: 1157656},
  { name: "Pedri",               team: "Barcelona",           age: 22, rating: 8.5, sofaId: 977777 },
  { name: "Alphonso Davies",     team: "Real Madrid",         age: 24, rating: 7.8, sofaId: 875692 },
  { name: "Gavi",                team: "Barcelona",           age: 20, rating: 7.7, sofaId: 976566 },
];

// ─── Starball SVG watermark ──────────────────────────────
function UCLStarball({ size = 80, opacity = 1 }: { size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ opacity }}>
      <circle cx="50" cy="50" r="47" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M50 5 L54.9 35.5 L85 30.5 L63.5 50 L76 78.5 L50 62 L24 78.5 L36.5 50 L15 30.5 L45.1 35.5 Z" fill="white" opacity="0.9" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
    </svg>
  );
}

// ─── Tactical Pitch Lines ────────────────────────────────
function UCLField() {
  return (
    <svg viewBox="0 0 100 160" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
      <rect x="3" y="3" width="94" height="154" fill="none" stroke="#fff" strokeWidth="0.6" rx="1"/>
      <line x1="3" y1="80" x2="97" y2="80" stroke="#fff" strokeWidth="0.5"/>
      <circle cx="50" cy="80" r="14" fill="none" stroke="#fff" strokeWidth="0.5"/>
      <circle cx="50" cy="80" r="1" fill="#fff"/>
      <rect x="22" y="3" width="56" height="28" fill="none" stroke="#fff" strokeWidth="0.4"/>
      <rect x="35" y="3" width="30" height="11" fill="none" stroke="#fff" strokeWidth="0.4"/>
      <circle cx="50" cy="22" r="0.8" fill="#fff"/>
      <rect x="22" y="129" width="56" height="28" fill="none" stroke="#fff" strokeWidth="0.4"/>
      <rect x="35" y="146" width="30" height="11" fill="none" stroke="#fff" strokeWidth="0.4"/>
      <circle cx="50" cy="138" r="0.8" fill="#fff"/>
    </svg>
  );
}

// ─── Player Token (Pitch) ────────────────────────────────
function PitchPlayer({ player, top, left, delay = 0, onClick }: { player: any; top: string; left: string; delay?: number; onClick?: () => void; }) {
  if (!player) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.15, zIndex: 50, filter: `drop-shadow(0 0 12px ${UCL_CYAN})` }}
      onClick={onClick}
      style={{ position: "absolute", top, left, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", zIndex: 10 }}
    >
      <div style={{
        width: 58, height: 68,
        background: "rgba(0, 11, 41, 0.6)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0, 229, 255, 0.4)",
        borderRadius: "8px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative",
        boxShadow: `inset 0 0 10px rgba(0, 229, 255, 0.1), 0 4px 12px rgba(0,0,0,0.5)`,
      }}>
        <span style={{ position: "absolute", top: 4, left: 5, fontSize: 8, fontWeight: 700, color: UCL_CYAN, fontFamily: "'Inter', sans-serif" }}>{player.Pos?.substring(0,2)}</span>
        <span style={{ position: "absolute", top: 3, right: 4, fontSize: 9, fontWeight: 800, color: "#fff", fontFamily: "'Rajdhani', sans-serif" }}>{player.rating?.toFixed(1)}</span>
        <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", marginTop: 8, border: "2px solid rgba(255,255,255,0.8)" }}>
          <PlayerAvatar playerName={player.Player} teamName={player.Squad} sofaId={player.sofaId} size="md" className="w-full h-full object-cover" />
        </div>
      </div>
      <div style={{
        marginTop: 4, background: "rgba(0,11,41,0.8)", border: "1px solid rgba(0,229,255,0.3)",
        padding: "2px 8px", borderRadius: 4, fontSize: 10, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#fff",
        whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
      }}>
        {player.Player?.split(" ").pop()}
      </div>
    </motion.div>
  );
}

// ─── Ranking Row ──────────────────────────────────────────
function RankRow({ rank, name, team, value, valueLabel, sofaId, delay = 0, onClick }: { rank: number; name: string; team: string; value: number; valueLabel: string; sofaId?: number; delay?: number; onClick?: () => void; }) {
  const isTop = rank === 1;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, background: "rgba(0, 229, 255, 0.05)", borderLeft: `4px solid ${UCL_CYAN}` }}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
        background: "rgba(255,255,255,0.01)", borderLeft: "4px solid transparent",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ width: 30, textAlign: "center", fontFamily: "'Rajdhani', sans-serif", fontSize: isTop ? 28 : 20, fontWeight: 700, color: isTop ? UCL_CYAN : "rgba(255,255,255,0.5)" }}>
        {rank}
      </div>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${isTop ? UCL_CYAN : "rgba(255,255,255,0.2)"}`, overflow: "hidden", flexShrink: 0, boxShadow: isTop ? `0 0 15px ${UCL_GLOW}` : "none" }}>
        <PlayerAvatar playerName={name} teamName={team} sofaId={sofaId} size="md" className="w-full h-full object-cover" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "0.02em" }}>{name}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{team}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 28, color: UCL_CYAN, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{valueLabel}</div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function ChampionsLeague() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"totw" | "scorers" | "assisters" | "young">("totw");

  const { data: uclData } = useQuery<any>({ queryKey: ["/api/ucl/stats"], staleTime: 10 * 60_000 });
  const { data: totwData } = useQuery<{ success: boolean; players: any[] }>({ queryKey: ["/api/live/top-players"], staleTime: 5 * 60_000 });

  const totwPlayers = (totwData?.players && totwData.players.length >= 11) ? totwData.players : UCL_TOTW_2526;
  const scorers   = uclData?.scorers?.length > 0 ? uclData.scorers : UCL_SCORERS_SEED;
  const assisters = uclData?.assisters?.length > 0 ? uclData.assisters : UCL_ASSISTERS_SEED;
  const young     = uclData?.young?.length > 0 ? uclData.young : UCL_YOUNG_SEED;

  const gk  = totwPlayers.find((p: any) => p.Pos?.includes("GK")) || totwPlayers[0];
  const dfs = totwPlayers.filter((p: any) => p.Pos?.includes("DF")).slice(0, 4);
  const mfs = totwPlayers.filter((p: any) => p.Pos?.includes("MF")).slice(0, 3);
  const fws = totwPlayers.filter((p: any) => p.Pos?.includes("FW")).slice(0, 3);

  const tabs = [
    { id: "totw",     label: "ÉQUIPE DU TOUR", icon: <Star size={16}/> },
    { id: "scorers",  label: "BUTEURS",        icon: <Target size={16}/> },
    { id: "assisters",label: "PASSEURS",       icon: <Zap size={16}/> },
    { id: "young",    label: "JEUNES TALENTS", icon: <Award size={16}/> },
  ] as const;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url("https://editorial.uefa.com/resources/028c-1a7337f7f34c-6a7e0a8d6b9d-1000/ucl_kv_2024-25_16x9.jpg")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      <Header />
      
      {/* ── Font Injection ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Rajdhani:wght@500;600;700&display=swap');
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        /* Converging Spotlight Lines */
        .spotlight {
          position: absolute;
          width: 2px;
          height: 100vh;
          background: linear-gradient(to bottom, transparent, rgba(0, 229, 255, 0.15), transparent);
          transform-origin: top center;
        }
      `}</style>

      {/* Background Spotlights */}
      <div className="spotlight" style={{ left: '20%', transform: 'rotate(25deg)' }} />
      <div className="spotlight" style={{ right: '20%', transform: 'rotate(-25deg)' }} />

      {/* Giant Starball Watermark */}
      <div style={{ position: "absolute", top: -150, right: -150, opacity: 0.05, pointerEvents: "none", zIndex: 0 }}>
        <UCLStarball size={800} />
      </div>

      <main style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "100px 32px 80px" }}>
        
        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <button
              onClick={() => setLocation("/")}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "8px 16px", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              <ChevronLeft size={16} /> RETOUR
            </button>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: UCL_CYAN, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>UEFA Champions League</div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 44, fontWeight: 700, margin: 0, lineHeight: 1, letterSpacing: "0.02em" }}>THE ULTIMATE STAGE</h1>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ padding: "6px 16px", background: "rgba(0, 229, 255, 0.1)", border: `1px solid ${UCL_CYAN}`, borderRadius: 100, fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: UCL_CYAN, display: "inline-block" }}>
              MATCHDAY 8
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="glass-panel"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "16px 20px", borderRadius: 12, cursor: "pointer",
                fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700,
                color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.5)",
                background: activeTab === tab.id ? "rgba(0, 229, 255, 0.15)" : "rgba(255,255,255,0.02)",
                border: activeTab === tab.id ? `1px solid ${UCL_CYAN}` : "1px solid rgba(255,255,255,0.1)",
                boxShadow: activeTab === tab.id ? `0 0 20px ${UCL_GLOW}` : "none",
                transition: "all 0.3s ease",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content Area ── */}
        <AnimatePresence mode="wait">
          {/* TOTW TAB */}
          {activeTab === "totw" && (
            <motion.div key="totw" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
              
              {/* Tactical Pitch Container */}
              <div className="glass-panel" style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}>
                {/* Field Grass Gradient with Official Background Overlay */}
                <div style={{ 
                  position: "absolute", inset: 0, 
                  backgroundImage: `linear-gradient(rgba(0,30,80,0.4), rgba(0,10,40,0.6)), url("https://editorial.uefa.com/resources/028c-1a7337f7f34c-6a7e0a8d6b9d-1000/ucl_kv_2024-25_16x9.jpg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: 0 
                }} />
                <UCLField />
                
                {/* Players */}
                <PitchPlayer player={fws[0]} top="15%" left="25%" delay={0.1} onClick={() => fws[0] && setLocation(`/joueur/${encodeURIComponent(fws[0].Player)}`)} />
                <PitchPlayer player={fws[1]} top="10%" left="50%" delay={0.15} onClick={() => fws[1] && setLocation(`/joueur/${encodeURIComponent(fws[1].Player)}`)} />
                <PitchPlayer player={fws[2]} top="15%" left="75%" delay={0.1} onClick={() => fws[2] && setLocation(`/joueur/${encodeURIComponent(fws[2].Player)}`)} />
                <PitchPlayer player={mfs[0]} top="40%" left="25%" delay={0.2} onClick={() => mfs[0] && setLocation(`/joueur/${encodeURIComponent(mfs[0].Player)}`)} />
                <PitchPlayer player={mfs[1]} top="37%" left="50%" delay={0.25} onClick={() => mfs[1] && setLocation(`/joueur/${encodeURIComponent(mfs[1].Player)}`)} />
                <PitchPlayer player={mfs[2]} top="40%" left="75%" delay={0.2} onClick={() => mfs[2] && setLocation(`/joueur/${encodeURIComponent(mfs[2].Player)}`)} />
                <PitchPlayer player={dfs[0]} top="65%" left="15%" delay={0.3} onClick={() => dfs[0] && setLocation(`/joueur/${encodeURIComponent(dfs[0].Player)}`)} />
                <PitchPlayer player={dfs[1]} top="62%" left="38%" delay={0.33} onClick={() => dfs[1] && setLocation(`/joueur/${encodeURIComponent(dfs[1].Player)}`)} />
                <PitchPlayer player={dfs[2]} top="62%" left="62%" delay={0.33} onClick={() => dfs[2] && setLocation(`/joueur/${encodeURIComponent(dfs[2].Player)}`)} />
                <PitchPlayer player={dfs[3]} top="65%" left="85%" delay={0.3} onClick={() => dfs[3] && setLocation(`/joueur/${encodeURIComponent(dfs[3].Player)}`)} />
                <PitchPlayer player={gk}     top="85%" left="50%" delay={0.4} onClick={() => gk && setLocation(`/joueur/${encodeURIComponent(gk.Player)}`)} />
              </div>

              {/* Sidebar List */}
              <div className="glass-panel" style={{ borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                  <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>STARTING XI</h2>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: UCL_CYAN, marginTop: 4 }}>Formation: 4-3-3</div>
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: "12px 0" }}>
                  {totwPlayers.map((p: any, i: number) => (
                    <motion.div key={p.Player} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => setLocation(`/joueur/${encodeURIComponent(p.Player)}`)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", cursor: "pointer", transition: "background 0.2s" }}
                      whileHover={{ background: "rgba(0, 229, 255, 0.08)" }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${UCL_CYAN}`, overflow: "hidden" }}>
                        <PlayerAvatar playerName={p.Player} teamName={p.Squad} sofaId={p.sofaId} size="md" className="w-full h-full object-cover" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700 }}>{p.Player}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{p.Pos} · {p.Squad}</div>
                      </div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: UCL_CYAN }}>{p.rating?.toFixed(1)}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* OTHER TABS */}
          {activeTab !== "totw" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="glass-panel" style={{ borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                  <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: "#fff" }}>
                    {activeTab === "scorers" ? "TOP SCORERS" : activeTab === "assisters" ? "TOP ASSISTERS" : "RISING STARS (U23)"}
                  </h2>
                </div>
                <div>
                  {(activeTab === "scorers" ? scorers : activeTab === "assisters" ? assisters : young).map((p: any, i: number) => (
                    <RankRow
                      key={p.name} rank={i + 1} name={p.name} team={p.team}
                      value={activeTab === "scorers" ? p.goals : activeTab === "assisters" ? p.assists : Number(p.rating?.toFixed(1))}
                      valueLabel={activeTab === "scorers" ? "Buts" : activeTab === "assisters" ? "Passes" : "Note"}
                      sofaId={p.sofaId} delay={i * 0.05}
                      onClick={() => setLocation(`/joueur/${encodeURIComponent(p.name)}`)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
