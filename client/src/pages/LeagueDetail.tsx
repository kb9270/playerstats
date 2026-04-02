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

function RankingBoard({ title, icon: Icon, data, color, unit = "", onClickPlayer }: any) {
  return (
    <GlassCard style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>{title}</h3>
      </div>
      <div style={{ flex: 1, padding: "8px 0" }}>
        {data.slice(0, 5).map((row: any, i: number) => (
          <div 
            key={row.name + i}
            onClick={() => onClickPlayer(row.name)}
            style={{ 
              display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", 
              cursor: "pointer", transition: "background 0.2s" 
            }}
            className="hover-bg-white-05"
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", width: 14 }}>{i + 1}</span>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
               <TeamLogo logo={row.logo} teamName={row.team} size="sm" />
               <div style={{ display: "flex", flexDirection: "column" }}>
                 <span style={{ fontSize: 13, fontWeight: 600 }}>{row.name}</span>
                 <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{row.team}</span>
               </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 14, fontWeight: 900, color }}>{row.value}<span style={{ fontSize: 10, opacity: 0.7, marginLeft: 2 }}>{unit}</span></span>
            </div>
          </div>
        ))}
      </div>
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

  // Queries
  const { data: standingsData, isLoading: loadingSt } = useQuery<any>({
    queryKey: [`/api/standings/${encodeURIComponent(leagueName)}`],
    staleTime: 5 * 60 * 1000,
  });

  const { data: rankings, isLoading: loadingR } = useQuery<any>({
    queryKey: [`/api/csv/leagues/${encodeURIComponent(leagueName)}/rankings`],
    staleTime: 5 * 60 * 1000,
  });

  const standings = standingsData?.standings || [];

  return (
    <div className="min-h-screen bg-[#070708] text-white font-sans">
      {/* ── Navbar ── */}
      <div style={{ 
        position: "sticky", top: 0, zIndex: 100, background: "rgba(7,7,8,0.8)", 
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" 
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
                <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", margin: 0, textTransform: "uppercase" }}>{name}</h1>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0, letterSpacing: "0.05em" }}>{meta.country.toUpperCase()} • 2025/2026</p>
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

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
            
            {/* ── Left Column: Standings Teaser ── */}
            <div style={{ gridColumn: "span 4" }}>
              <GlassCard style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", margin: 0 }}>Classement</h3>
                   <button onClick={() => setActiveTab("standings")} style={{ background: "none", border: "none", color: meta.color, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                     Voir tout <ChevronRight size={14} />
                   </button>
                </div>
                <div style={{ paddingBottom: 16 }}>
                  {loadingSt ? (
                    <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>Chargement...</div>
                  ) : (
                    standings.slice(0, 10).map((row: any, i: number) => (
                      <div key={row.team} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 24px" }} className={i < 3 ? "bg-white-02" : ""}>
                        <span style={{ width: 18, fontSize: 12, fontWeight: 800, color: i < 4 ? meta.color : "rgba(255,255,255,0.3)" }}>{row.rank}</span>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                          <TeamLogo logo={row.logo} teamName={row.abbr || row.team} size="sm" />
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{row.team}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 900 }}>{row.points}</span>
                      </div>
                    ))
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
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Meilleurs Passeurs" 
                    icon={TrendingUp} 
                    data={rankings?.assists || []} 
                    color="#3b82f6" 
                    unit="PD"
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Meilleures Notes" 
                    icon={Star} 
                    data={rankings?.ratings || []} 
                    color="#eab308" 
                    unit="/10"
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Pépites (-21 ans)" 
                    icon={Users} 
                    data={rankings?.young || []} 
                    color="#a855f7" 
                    unit="/10"
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                  <RankingBoard 
                    title="Murs (Clean Sheets)" 
                    icon={Shield} 
                    data={rankings?.keepers || []} 
                    color="#22c55e" 
                    unit="CS"
                    onClickPlayer={(n: string) => setLocation(`/joueur/${encodeURIComponent(n)}`)}
                  />
                </>
              )}
            </div>

          </div>
        )}

        {/* ── Full Standings Tab ── */}
        {activeTab === "standings" && (
          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", textTransform: "uppercase", margin: 0 }}>Classement Complet</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)", textAlign: "left", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
                    <th style={{ padding: "12px 24px", width: 40 }}>Pos</th>
                    <th style={{ padding: "12px 24px" }}>Équipe</th>
                    <th style={{ padding: "12px 12px", textAlign: "right" }}>MJ</th>
                    <th style={{ padding: "12px 12px", textAlign: "right", color: "#22c55e" }}>V</th>
                    <th style={{ padding: "12px 12px", textAlign: "right" }}>N</th>
                    <th style={{ padding: "12px 12px", textAlign: "right", color: "#ef4444" }}>D</th>
                    <th style={{ padding: "12px 12px", textAlign: "right" }}>BP</th>
                    <th style={{ padding: "12px 12px", textAlign: "right" }}>BC</th>
                    <th style={{ padding: "12px 12px", textAlign: "right" }}>+/-</th>
                    <th style={{ padding: "12px 24px", textAlign: "right", color: "#fff" }}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row: any, i: number) => (
                    <tr 
                      key={row.team}
                      onClick={() => setLocation("/equipe/" + encodeURIComponent(row.team))}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", cursor: "pointer" }}
                      className="hover-bg-white-05"
                    >
                      <td style={{ padding: "14px 24px", fontWeight: 800, color: i < 4 ? meta.color : "rgba(255,255,255,0.3)" }}>{row.rank}</td>
                      <td style={{ padding: "14px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <TeamLogo logo={row.logo} teamName={row.abbr || row.team} size="sm" />
                          <span style={{ fontWeight: 600 }}>{row.team}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{row.played}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", fontWeight: 600 }}>{row.wins}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{row.draws}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", fontWeight: 600 }}>{row.losses}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{row.goalsFor}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{row.goalsAgainst}</td>
                      <td style={{ padding: "14px 12px", textAlign: "right", fontFamily: "monospace", color: row.goalDiff > 0 ? "#22c55e" : row.goalDiff < 0 ? "#ef4444" : "#94a3b8" }}>
                        {row.goalDiff > 0 ? "+" : ""}{row.goalDiff}
                      </td>
                      <td style={{ padding: "14px 24px", textAlign: "right", fontWeight: 900, fontSize: 16 }}>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
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
