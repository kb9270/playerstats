import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Trophy, Target, TrendingUp, Users, 
  Star, Shield, User, ChevronRight, Search 
} from "lucide-react";
import { TeamLogo } from "@/components/PlayerAvatar";
import PlayerAvatar from "@/components/PlayerAvatar";

/* ─── League Metadata ───────────────────────────────────── */
const LEAGUE_META: Record<string, { flag: string; country: string; color: string; espn: string }> = {
  "eng Premier League": { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "Angleterre", color: "#3b82f6", espn: "eng.1" },
  "es La Liga":         { flag: "🇪🇸",           country: "Espagne",    color: "#f97316", espn: "esp.1" },
  "fr Ligue 1":        { flag: "🇫🇷",           country: "France",     color: "#60a5fa", espn: "fra.1" },
  "it Serie A":        { flag: "🇮🇹",           country: "Italie",     color: "#22c55e", espn: "ita.1" },
  "de Bundesliga":     { flag: "🇩🇪",           country: "Allemagne",  color: "#eab308", espn: "ger.1" },
};
function getMeta(n: string) { return LEAGUE_META[n] || { flag: "🌍", country: "", color: "#64748b", espn: "" }; }
function shortName(n: string) { return n.split(" ").slice(1).join(" ") || n; }

/* ─── UI Components ───────────────────────────────────── */
function GlassCard({ children, style, className = "" }: any) {
  return (
    <div 
      className={`glass-card ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 20,
        ...style
      }}
    >
      {children}
    </div>
  );
}

function RankingBoard({ title, icon: Icon, data, color, unit = "", onClickPlayer, isPL, isL1 }: any) {
  return (
    <GlassCard className={isPL ? "pl-table sheen-container" : isL1 ? "l1-table sheen-container" : ""} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 24px", borderBottom: isPL ? "1px solid rgba(61,25,91,0.1)" : "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: isPL ? "rgba(61,25,91,0.08)" : `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} style={{ color: isPL ? "#3d195b" : color }} />
        </div>
        <h3 className={isPL ? "pl-header-text" : ""} style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0, color: isPL ? "#3d195b" : "white" }}>{title}</h3>
      </div>
      <motion.div 
        style={{ flex: 1, padding: "8px 0" }}
        initial="hidden"
        animate="show"
        variants={{
          show: { transition: { staggerChildren: 0.05 } }
        }}
      >
        {data.slice(0, 10).map((row: any, i: number) => (
          <motion.div 
            key={row.name + i}
            onClick={() => onClickPlayer(row.name)}
            variants={{
              hidden: { opacity: 0, x: -15 },
              show: { opacity: 1, x: 0 }
            }}
            style={{ 
              display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", 
              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              borderBottom: (isPL && i < data.slice(0, 10).length - 1) ? "1px solid rgba(61,25,91,0.05)" : "none"
            }}
            className={isPL ? "pl-row" : "hover-bg-white-05"}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: isPL ? "rgba(61,25,91,0.4)" : "rgba(255,255,255,0.3)", width: 14 }}>{i + 1}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
               <PlayerAvatar 
                 playerName={row.name} 
                 teamName={row.team} 
                 logo={row.logo} 
                 size="sm" 
                 className="rounded-full" 
                 showTeamBadge={isPL} 
               />
               <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: 13, fontWeight: 700, color: isPL ? "#3d195b" : "white" }}>{row.name}</span>
                 <span style={{ fontSize: 11, color: isPL ? "rgba(61,25,91,0.6)" : "rgba(255,255,255,0.4)" }}>{row.team}</span>
               </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: isPL ? "#3d195b" : color }}>{row.value}<span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>{unit}</span></span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </GlassCard>
  );
}

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const leagueName = decodeURIComponent(id || "");
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const meta = getMeta(leagueName);
  const name = shortName(leagueName);
  const isPL = leagueName.toLowerCase().includes("premier league");
  const isL1 = leagueName.toLowerCase().includes("ligue 1");
  const isLL = leagueName.toLowerCase().includes("la liga");
  const isSA = leagueName.toLowerCase().includes("serie a");

  // Mock data as fallback if API is empty
  const PL_MOCK = [
    { rank: 1, team: "Liverpool", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png", points: 67 },
    { rank: 2, team: "Arsenal", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png", points: 64 },
    { rank: 3, team: "Man City", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png", points: 63 },
    { rank: 4, team: "Chelsea", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png", points: 60 },
    { rank: 5, team: "Aston Villa", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/362.png", points: 59 },
    { rank: 6, team: "Tottenham", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png", points: 56 },
    { rank: 7, team: "Man United", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png", points: 54 },
    { rank: 8, team: "Newcastle", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png", points: 52 },
  ];

  const L1_MOCK = [
    { rank: 1, team: "PSG", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png", points: 59 },
    { rank: 2, team: "Marseille", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/176.png", points: 50 },
    { rank: 3, team: "Monaco", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/174.png", points: 49 },
    { rank: 4, team: "Lille", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/169.png", points: 46 },
    { rank: 5, team: "Lens", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/172.png", points: 45 },
    { rank: 6, team: "Nice", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/164.png", points: 42 },
  ];

  const LL_MOCK = [
    { rank: 1, team: "Real Madrid", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png", points: 75 },
    { rank: 2, team: "Barcelona", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png", points: 67 },
    { rank: 3, team: "Girona", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/9812.png", points: 65 },
    { rank: 4, team: "Atlético", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png", points: 58 },
    { rank: 5, team: "Athletic", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png", points: 56 },
    { rank: 6, team: "Real Sociedad", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/89.png", points: 49 },
  ];

  const SA_MOCK = [
    { rank: 1, team: "Inter Milan", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png", points: 82 },
    { rank: 2, team: "AC Milan", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png", points: 68 },
    { rank: 3, team: "Juventus", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png", points: 62 },
    { rank: 4, team: "Bologna", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png", points: 58 },
    { rank: 5, team: "AS Roma", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/106.png", points: 55 },
    { rank: 6, team: "Atalanta", logo: "https://a.espncdn.com/i/teamlogos/soccer/500/102.png", points: 50 },
  ];

  // Queries
  const { data: standingsData, isLoading: loadingSt } = useQuery<any>({
    queryKey: [`/api/standings/${encodeURIComponent(leagueName)}`],
    staleTime: 5 * 60 * 1000,
  });

  const { data: rankings, isLoading: loadingR } = useQuery<any>({
    queryKey: [`/api/csv/leagues/${encodeURIComponent(leagueName)}/rankings`],
    staleTime: 5 * 60 * 1000,
  });

  let standings = standingsData?.standings || [];
  if (isPL && standings.length === 0 && !loadingSt) {
    standings = PL_MOCK;
  } else if (isL1 && standings.length === 0 && !loadingSt) {
    standings = L1_MOCK;
  } else if (isLL && standings.length === 0 && !loadingSt) {
    standings = LL_MOCK;
  } else if (isSA && standings.length === 0 && !loadingSt) {
    standings = SA_MOCK;
  }

  return (
    <div 
      className={`min-h-screen ${isPL ? 'theme-premier-league' : isL1 ? 'theme-ligue1' : isLL ? 'theme-laliga' : isSA ? 'theme-seriea' : 'bg-[#070708] text-white'} font-sans`} 
      style={{ color: isPL ? '#3d195b' : (isL1 || isLL || isSA) ? '#fff' : 'white' }}
    >
      {/* ── Navbar ── */}
      <div style={{ 
        position: "sticky", top: 0, zIndex: 100, background: isPL ? "rgba(255,255,255,0.1)" : (isL1 || isLL || isSA) ? "rgba(7,7,8,0.8)" : "rgba(7,7,8,0.8)", 
        backdropFilter: "blur(20px)", borderBottom: isPL ? "1px solid rgba(61,25,91,0.2)" : (isL1 || isLL || isSA) ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.08)" 
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button 
              onClick={() => setLocation("/leagues")}
              style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{meta.flag}</span>
              <div>
                <h1 
                  className={isPL ? "pl-header-title" : isL1 ? "l1-header-title" : isLL ? "ll-header-title" : isSA ? "sa-header-title" : ""} 
                  data-text={isPL ? name : ""}
                  style={{ 
                    fontSize: isPL ? 32 : ((isL1 || isLL || isSA) ? 26 : 20), 
                    fontWeight: 900, 
                    fontFamily: "'Barlow Condensed', sans-serif", 
                    margin: 0, 
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  {isL1 && (
                    <img 
                      src="https://r2.thesportsdb.com/images/media/league/badge/9f7z9d1742983155.png" 
                      alt="L1" 
                      style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
                    />
                  )}
                  {isLL && (
                    <img 
                      src="https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png" 
                      alt="LL" 
                      style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
                    />
                  )}
                  {isSA && (
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg" 
                      alt="A" 
                      style={{ height: 32, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
                    />
                  )}
                  {name}
                </h1>
                <p style={{ fontSize: 11, color: isPL ? "rgba(61,25,91,0.6)" : "rgba(255,255,255,0.5)", margin: 0, letterSpacing: "0.05em" }}>{meta.country.toUpperCase()} • 2025/2026</p>
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 4 }}>
            {["overview", "standings"].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: activeTab === t ? "rgba(255,255,255,0.1)" : "transparent",
                  border: "none", color: activeTab === t ? "#fff" : "rgba(255,255,255,0.4)",
                  padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {t === "overview" ? "Tableau de Bord" : "Classement Complet"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: isPL ? "32px 40px" : "32px 24px", position: "relative", zIndex: 1 }}>
        
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
            
            {/* ── Left Column: Standings Teaser ── */}
            <div style={{ gridColumn: "span 4" }}>
              <GlassCard className={isPL ? "pl-table sheen-container" : isL1 ? "l1-table sheen-container" : isLL ? "ll-table ll-neon-glow" : isSA ? "sa-table sa-neon-glow" : ""} style={{ padding: 0, overflow: "hidden", height: "100%" }}>
                <div style={{ padding: "24px", borderBottom: isPL ? "1px solid rgba(61,25,91,0.1)" : "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", margin: 0, color: isPL ? "#3d195b" : "white" }}>Classement</h3>
                   <button onClick={() => setActiveTab("standings")} style={{ background: "none", border: "none", color: isPL ? "#3d195b" : meta.color, opacity: 0.6, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      Voir tout <ChevronRight size={14} />
                   </button>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {loadingSt ? (
                    <div style={{ padding: 60, textAlign: "center", color: isPL ? "#3d195b" : "rgba(255,255,255,0.4)" }}>
                      <div style={{ width: 32, height: 32, border: `3px solid ${isPL ? 'rgba(61,25,91,0.1)' : 'rgba(255,255,255,0.1)'}`, borderTopColor: isPL ? '#3d195b' : meta.color, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
                      Chargement...
                    </div>
                  ) : standings.length === 0 ? (
                    <div style={{ padding: 60, textAlign: "center", color: isPL ? "#3d195b" : "rgba(255,255,255,0.4)", fontSize: 13 }}>
                      Données non disponibles pour le moment
                    </div>
                  ) : (
                    <motion.div 
                      key="standings-list"
                      initial="hidden"
                      animate="show"
                      variants={{
                        show: { transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      {standings.slice(0, 10).map((row: any, i: number) => (
                        <motion.div 
                          key={row.team + i} 
                          variants={{
                            hidden: { opacity: 0, x: -15 },
                            show: { opacity: 1, x: 0 }
                          }}
                          style={{ 
                            display: "flex", alignItems: "center", gap: 12, padding: "10px 24px",
                            borderBottom: i < 9 ? (isPL ? "1px solid rgba(61,25,91,0.05)" : "1px solid rgba(255,255,255,0.02)") : "none"
                          }} 
                          className={i < 3 && (isPL || isL1) ? (isPL ? "bg-pl-light" : "l1-row-accent") : ""}
                        >
                          <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: isPL ? (i < 4 ? "#3d195b" : "rgba(61,25,91,0.4)") : isL1 ? (i < 3 ? "var(--l1-yellow)" : "rgba(255,255,255,0.4)") : (i < 4 ? meta.color : "rgba(255,255,255,0.3)") }}>{row.rank}</span>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                            <TeamLogo logo={row.logo} teamName={row.abbr || row.team} size="sm" />
                            <span style={{ fontSize: 14, fontWeight: 700, color: isPL ? "#3d195b" : "white" }}>{row.team}</span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 900, color: isPL ? "#3d195b" : "white" }}>{row.points}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* ── Right Column: Rankings Grid ── */}
            <div style={{ gridColumn: "span 8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {loadingR ? (
                 <div style={{ gridColumn: "span 2", padding: 100, textAlign: "center" }}>
                   <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: meta.color, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                 </div>
              ) : (
                <>
                  <RankingBoard 
                    title="Meilleurs Buteurs" 
                    icon={Target} 
                    data={rankings?.scorers || []} 
                    color="#f97316" 
                    unit="buts"
                    isPL={isPL}
                    isL1={isL1}
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Meilleurs Passeurs" 
                    icon={TrendingUp} 
                    data={rankings?.assists || []} 
                    color="#3b82f6" 
                    unit="PD"
                    isPL={isPL}
                    isL1={isL1}
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Meilleures Notes" 
                    icon={Star} 
                    data={rankings?.ratings || []} 
                    color="#eab308" 
                    unit="/10"
                    isPL={isPL}
                    isL1={isL1}
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Pépites (-21 ans)" 
                    icon={Users} 
                    data={rankings?.young || []} 
                    color="#a855f7" 
                    unit="/10"
                    isPL={isPL}
                    isL1={isL1}
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Murs (Clean Sheets)" 
                    icon={Shield} 
                    data={rankings?.keepers || []} 
                    color="#22c55e" 
                    unit="CS"
                    isPL={isPL}
                    isL1={isL1}
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                </>
              )}
            </div>

          </div>
        )}

        {/* ── Full Standings Tab ── */}
        {activeTab === "standings" && (
          <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
            {isPL && (
              <div className="pl-logo-container">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" 
                  alt="Premier League" 
                  style={{ height: 60, filter: "brightness(0) saturate(100%) invert(14%) sepia(35%) saturate(3665%) hue-rotate(256deg) brightness(92%) contrast(100%)" }} 
                />
              </div>
            )}
            {isLL && (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.12 }}>
                <img 
                  src="https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png" 
                  alt="LL" 
                  style={{ height: 120, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
                />
              </div>
            )}
            {isSA && (
              <div style={{ padding: 40, textAlign: "center", opacity: 0.12 }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg" 
                  alt="A" 
                  style={{ height: 120, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
                />
              </div>
            )}
            <GlassCard className={isPL ? "pl-table" : isL1 ? "l1-table" : isLL ? "ll-table ll-neon-glow" : isSA ? "sa-table sa-neon-glow" : ""} style={{ padding: 0, overflow: "hidden" }}>
              {!isPL && !isLL && !isSA && (
                <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", margin: 0 }}>Classement Complet</h3>
                </div>
              )}
              {isSA && (
                <div style={{ padding: "24px", borderBottom: "1px solid rgba(0, 219, 255, 0.2)", display: "flex", justifyContent: "center" }}>
                   <div className="sa-header-title" style={{ fontSize: 16 }}>Calcio / Standings</div>
                </div>
              )}
              {isLL && (
                <div style={{ padding: "24px", borderBottom: "1px solid rgba(250, 24, 50, 0.2)", display: "flex", justifyContent: "center" }}>
                   <div className="ll-header-title" style={{ fontSize: 16 }}>The Force / Standings</div>
                </div>
              )}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15, color: isPL ? "#3d195b" : "white" }}>
                  <thead>
                    <tr className={isPL ? "pl-header-dark" : ""} style={{ 
                      background: isPL ? "transparent" : "rgba(255,255,255,0.02)", 
                      textAlign: "left", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", 
                      color: isPL ? "#fff" : "rgba(255,255,255,0.4)",
                      borderBottom: isPL ? "none" : "none"
                    }}>
                      <th style={{ padding: "16px 24px", width: "7%" }}>Pos</th>
                      <th style={{ padding: "16px 24px", width: "63%" }}>Club</th>
                      <th style={{ padding: "16px 12px", textAlign: "right", width: "15%" }}>Pl</th>
                      <th style={{ padding: "16px 12px", textAlign: "right", width: "15%" }}>GD</th>
                      <th style={{ padding: "16px 24px", textAlign: "right", width: "15%" }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row: any, i: number) => (
                      <tr 
                        key={row.team}
                        style={{ borderBottom: isPL ? "1px solid rgba(61,25,91,0.1)" : "1px solid rgba(255,255,255,0.02)" }}
                        className={isPL ? "pl-row" : "hover-bg-white-05"}
                      >
                        <td style={{ padding: "16px 24px", fontWeight: 800, color: isPL ? "#3d195b" : (i < 4 ? meta.color : "rgba(255,255,255,0.3)") }}>{row.rank}</td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <TeamLogo logo={row.logo} teamName={row.abbr || row.team} size="sm" />
                            <span style={{ fontWeight: 700, fontSize: 18 }}>{row.team}</span>
                          </div>
                        </td>
                        <td style={{ padding: "16px 12px", textAlign: "right", fontWeight: 600 }}>{row.played}</td>
                        <td style={{ padding: "16px 12px", textAlign: "right", fontWeight: 600 }}>{row.goalDiff > 0 ? "+" : ""}{row.goalDiff}</td>
                        <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 900, fontSize: 20 }}>{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            {isPL && (
              <div className="pl-matchweek-badge">Matchweek 8</div>
            )}
          </div>
        )}

      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-bg-white-05:hover { background: rgba(255,255,255,0.05); }
        .bg-white-02 { background: rgba(255,255,255,0.02); }
        @media (max-width: 1100px) {
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
