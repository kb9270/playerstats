import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Star, Target, Zap, ChevronLeft, Award, RefreshCw, Wifi, WifiOff } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";
import Header from "@/components/Header";
import uclStarballBg from "@/assets/ucl_starball_bg.png";

// ─── Ultimate Stage Palette ────────────────────────────────
const UCL_NIGHT = "#000B29"; // Deep night blue
const UCL_ROYAL = "#003399"; // Royal blue
const UCL_CYAN  = "#00E5FF"; // Electric cyan spotlight
const UCL_WHITE = "#FFFFFF";
const UCL_GLOW  = "rgba(0, 229, 255, 0.3)";

// ─── Seed Data ──────────────────────────────────────────────
const UCL_TOTW_2526 = [
  { Player: "Manuel Neuer", Squad: "Bayern Munich", Pos: "GK", rating: 8.8, sofaId: 8959 },
  { Player: "Ben White", Squad: "Arsenal", Pos: "DF", rating: 7.1, sofaId: 846036 },
  { Player: "William Saliba", Squad: "Arsenal", Pos: "DF", rating: 7.1, sofaId: 941168 },
  { Player: "Willian Pacho", Squad: "PSG", Pos: "DF", rating: 7.1, sofaId: 979480 },
  { Player: "Alphonso Davies", Squad: "Bayern Munich", Pos: "DF", rating: 7.6, sofaId: 843665 },
  { Player: "Declan Rice", Squad: "Arsenal", Pos: "MF", rating: 7.8, sofaId: 856714 },
  { Player: "Luis Díaz", Squad: "Liverpool", Pos: "MF", rating: 7.8, sofaId: 883537 },
  { Player: "Khvicha Kvaratskhelia", Squad: "Napoli", Pos: "FW", rating: 7.9, sofaId: 889259 },
  { Player: "Leandro Trossard", Squad: "Arsenal", Pos: "FW", rating: 7.5, sofaId: 135666 },
  { Player: "Ousmane Dembélé", Squad: "PSG", Pos: "FW", rating: 7.5, sofaId: 818244 },
  { Player: "Harry Kane", Squad: "Bayern Munich", Pos: "FW", rating: 7.8, sofaId: 108579 },
];

// Static fallback seeds (used while loading or if API is blocked)
const UCL_SCORERS_SEED = [
  { name: "Kylian Mbappé",    team: "Real Madrid",         goals: 15, sofaId: 826643 },
  { name: "Harry Kane",       team: "FC Bayern München",   goals: 14, sofaId: 108579 },
  { name: "Khvicha Kvaratskhelia", team: "Napoli", goals: 10, sofaId: 889259 },
  { name: "Julián Álvarez",   team: "Atlético Madrid",     goals: 10, sofaId: 911571 },
  { name: "Anthony Gordon",   team: "Newcastle United",    goals: 10, sofaId: 866030 },
];
const UCL_ASSISTERS_SEED = [
  { name: "Khvicha Kvaratskhelia", team: "Napoli", assists: 7, sofaId: 889259 },
  { name: "Michael Olise",    team: "FC Bayern München",   assists: 6, sofaId: 948496 },
  { name: "Achraf Hakimi",    team: "Paris Saint-Germain", assists: 6, sofaId: 852073 },
  { name: "Kevin De Bruyne",  team: "Manchester City",     assists: 6, sofaId: 164655 },
  { name: "Lamine Yamal",     team: "FC Barcelone",        assists: 5, sofaId: 1402912 },
];
const UCL_YOUNG_SEED = [
  { name: "Lamine Yamal",        team: "FC Barcelone",        age: 18, rating: 8.08, sofaId: 1402912 },
  { name: "Jude Bellingham",     team: "Real Madrid",         age: 22, rating: 7.85, sofaId: 991011 },
  { name: "Pau Cubarsí",         team: "FC Barcelone",        age: 19, rating: 7.72, sofaId: 1402913 },
  { name: "Warren Zaïre-Emery",  team: "Paris Saint-Germain", age: 20, rating: 7.65, sofaId: 1395892 },
  { name: "Gavi",                team: "FC Barcelone",        age: 21, rating: 7.55, sofaId: 976566 },
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
const CLUB_IDS: Record<string, number> = {
  "bayern munich": 2672,
  "fc bayern munchen": 2672,
  "fc bayern münchen": 2672,
  "bayern": 2672,
  "arsenal": 42,
  "psg": 1644,
  "paris saint-germain": 1644,
  "liverpool": 44,
  "real madrid": 2829,
  "barcelona": 2817,
  "fc barcelona": 2817,
  "fc barcelone": 2817,
  "ac milan": 2692,
  "manchester city": 17,
  "man city": 17,
  "atletico madrid": 2836,
  "atletico": 2836,
  "atlético madrid": 2836,
  "newcastle": 33,
  "newcastle united": 33,
  "psv": 2917,
  "club brugge": 349,
  "bayer leverkusen": 2681,
  "leverkusen": 2681,
  "dortmund": 2673,
  "borussia dortmund": 2673,
  "chelsea": 38,
  "juventus": 2687,
  "monaco": 1623,
  "lille": 1643,
  "marseille": 1641,
  "lens": 1648,
  "napoli": 2714,
  "ssc napoli": 2714,
  "atalanta": 2686,
};

const UCLPlayerCard = ({ player, top, left, onClick }: { player: any; top: string; left: string; onClick?: () => void }) => {
  if (!player) return null;
  const squadNormalized = (player.Squad || player.team || "").toLowerCase().trim();
  const teamId = player.teamId || CLUB_IDS[squadNormalized] || 0;
  
  const FOTMOB_IDS: Record<string, number> = {
    "bayern munich": 9823, "arsenal": 9825, "psg": 9847, "liverpool": 8650, "napoli": 9875
  };
  const fmId = FOTMOB_IDS[squadNormalized];
  
  // Use FotMob images if hardcoded, otherwise fallback to SofaScore
  const teamLogo = fmId 
    ? `https://images.fotmob.com/image_resources/logo/teamlogo/${fmId}.png` 
    : (teamId ? `https://api.sofascore.app/api/v1/team/${teamId}/image` : null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.15, zIndex: 100 }}
      onClick={onClick}
      style={{
        position: "absolute", top, left, transform: "translate(-50%, -50%)",
        display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10,
        cursor: "pointer"
      }}
    >
      {/* Club Logo Badge - 10 o'clock angle */}
      {teamLogo && (
        <div style={{
          position: "absolute", top: -8, left: -26,
          width: 32, height: 32,
          background: "white",
          borderRadius: "50%",
          padding: 2,
          boxShadow: "0 6px 16px rgba(0,0,0,0.5)",
          zIndex: 30,
          border: "1.5px solid #0043ff",
          overflow: "hidden"
        }}>
          <img 
            src={teamLogo} 
            alt={player.Squad} 
            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent && !parent.querySelector('.club-fallback')) {
                 parent.style.background = "linear-gradient(135deg, #1e3a8a, #3b82f6)";
                 parent.style.padding = "0";
                 const div = document.createElement('div');
                 div.className = "club-fallback";
                 div.style.cssText = "width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold; font-family:'Inter',sans-serif;";
                 div.innerText = (player.Squad || player.team || "???").substring(0, 3).toUpperCase();
                 parent.appendChild(div);
              }
            }}
          />
        </div>
      )}

      {/* The Hexagon Shield with Neon Gradient Border */}
      <div style={{
        position: "relative",
        width: 68, height: 82,
        padding: "2.1px",
        background: "linear-gradient(45deg, #A855F7, #06B6D4)", 
        clipPath: "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 10px 24px rgba(0,0,0,0.8)",
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(180deg, #0043FF 0%, #001A4D 100%)",
          clipPath: "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          <div style={{ width: "100%", height: "100%" }}>
            <PlayerAvatar
              playerName={player.Player || player.name || ""}
              teamName={player.Squad || player.team}
              sofaId={player.sofaId}
              size="md"
              className="w-full h-full object-cover bg-transparent border-none opacity-98"
            />
          </div>
        </div>
      </div>

      {/* Name Label - Elevated white box with bold Condensed Font */}
      <div style={{
        marginTop: -16,
        background: "white",
        color: "#000B29",
        width: 82,
        height: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
        boxShadow: "0 8px 18px rgba(0,0,0,0.6)",
        zIndex: 20,
        border: "1.2px solid #0043ff",
        fontFamily: "'Saira Extra Condensed', sans-serif",
        letterSpacing: "0.02em"
      }}>
        {String(player?.Player || player?.name || "NAME").split(" ").pop()}
      </div>
    </motion.div>
  );
};

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

  // Live UCL rankings from SofaScore — refreshed every hour server-side
  const { data: rankingsData, isLoading: rankingsLoading } = useQuery<any>({
    queryKey: ["/api/ucl/rankings"],
    staleTime: 0,         // Always re-fetch from server (server caches for 1h)
    gcTime: 0,            // Don't persist stale data in memory
    refetchOnWindowFocus: false,
  });
  const totwPlayers = (rankingsData?.totw?.length >= 5) ? rankingsData.totw : UCL_TOTW_2526;
  const scorers   = rankingsData?.scorers?.length   > 0 ? rankingsData.scorers   : UCL_SCORERS_SEED;
  const assisters = rankingsData?.assisters?.length > 0 ? rankingsData.assisters : UCL_ASSISTERS_SEED;
  const young     = rankingsData?.young?.length     > 0 ? rankingsData.young     : UCL_YOUNG_SEED;
  const isLive    = !!rankingsData?.liveFromApi;
  const lastUpdated = rankingsData?.lastUpdated ? new Date(rankingsData.lastUpdated) : null;

  // 4-4-2 Formation logic (Manual distribution as requested)
  const all = totwPlayers.slice(0, 11);
  
  const attackers = all.filter((p: any) => ["FW", "F", "ST", "ATT"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag)));
  const goalies = all.filter((p: any) => ["G", "GK", "K"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag)));
  const defenders = all.filter((p: any) => ["D", "DF", "B", "DEF"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag)));

  const finalGk = all.find((p: any) => p.Player?.includes("Neuer")) || goalies[0] || all[0];
  
  const lb = all.find((p: any) => p.Player?.includes("Davies")) || defenders[0];
  const cb1 = all.find((p: any) => p.Player?.includes("Saliba")) || defenders[1];
  const cb2 = all.find((p: any) => p.Player?.includes("Pacho")) || defenders[2];
  const rb = all.find((p: any) => p.Player?.includes("White")) || defenders[3];
  const finalDf = [lb, cb1, cb2, rb];

  const fwLeft = all.find((p: any) => p?.Player?.includes("Dembélé")) || attackers[0];
  const fwRight = all.find((p: any) => p?.Player?.includes("Kane")) || attackers[1];
  const finalFw = [fwLeft, fwRight].filter(Boolean);

  const usedIds = new Set([finalGk, ...finalDf, ...finalFw].filter(Boolean).map((p: any) => p?.Player || ""));
  const finalMf = all.filter((p: any) => p && !usedIds.has(p.Player || "")).slice(0, 4);

  const tabs = [
    { id: "totw",     label: "ÉQUIPE DU TOUR", icon: <Star size={16}/> },
    { id: "scorers",  label: "BUTEURS",        icon: <Target size={16}/> },
    { id: "assisters",label: "PASSEURS",       icon: <Zap size={16}/> },
    { id: "young",    label: "JEUNES TALENTS", icon: <Award size={16}/> },
  ] as const;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${uclStarballBg})`,
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
                  backgroundImage: `linear-gradient(rgba(0,30,80,0.4), rgba(0,10,40,0.6)), url(${uclStarballBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  zIndex: 0 
                }} />
                <UCLField />
                
                {/* Players (4-4-2) */}
                {/* Players (4-4-2) */}
                <UCLPlayerCard player={finalFw[0]} top="6%" left="30%" onClick={() => finalFw[0] && setLocation(`/joueur/${encodeURIComponent(finalFw[0].Player)}`)} />
                <UCLPlayerCard player={finalFw[1]} top="6%" left="60%" onClick={() => finalFw[1] && setLocation(`/joueur/${encodeURIComponent(finalFw[1].Player)}`)} />

                <UCLPlayerCard player={finalMf[0]} top="26%" left="13%" onClick={() => finalMf[0] && setLocation(`/joueur/${encodeURIComponent(finalMf[0].Player)}`)} />
                <UCLPlayerCard player={finalMf[1]} top="26%" left="34%" onClick={() => finalMf[1] && setLocation(`/joueur/${encodeURIComponent(finalMf[1].Player)}`)} />
                <UCLPlayerCard player={finalMf[2]} top="26%" left="56%" onClick={() => finalMf[2] && setLocation(`/joueur/${encodeURIComponent(finalMf[2].Player)}`)} />
                <UCLPlayerCard player={finalMf[3]} top="26%" left="77%" onClick={() => finalMf[3] && setLocation(`/joueur/${encodeURIComponent(finalMf[3].Player)}`)} />

                <UCLPlayerCard player={finalDf[0]} top="52%" left="10%" onClick={() => finalDf[0] && setLocation(`/joueur/${encodeURIComponent(finalDf[0].Player)}`)} />
                <UCLPlayerCard player={finalDf[1]} top="52%" left="33%" onClick={() => finalDf[1] && setLocation(`/joueur/${encodeURIComponent(finalDf[1].Player)}`)} />
                <UCLPlayerCard player={finalDf[2]} top="52%" left="57%" onClick={() => finalDf[2] && setLocation(`/joueur/${encodeURIComponent(finalDf[2].Player)}`)} />
                <UCLPlayerCard player={finalDf[3]} top="52%" left="80%" onClick={() => finalDf[3] && setLocation(`/joueur/${encodeURIComponent(finalDf[3].Player)}`)} />
                
                <UCLPlayerCard player={finalGk}    top="76%" left="45%" onClick={() => finalGk && setLocation(`/joueur/${encodeURIComponent(finalGk.Player)}`)} />
              </div>

              {/* Sidebar List */}
              <div className="glass-panel" style={{ borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
                  <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>STARTING XI</h2>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: UCL_CYAN, marginTop: 4 }}>Formation: 4-4-2</div>
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
                {/* Header with title + live badge */}
                <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: "#fff" }}>
                    {activeTab === "scorers" ? "TOP SCORERS" : activeTab === "assisters" ? "TOP ASSISTERS" : "RISING STARS (U23)"}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Live / Fallback badge */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "4px 12px", borderRadius: 100,
                      background: isLive ? "rgba(0,229,255,0.12)" : "rgba(255,180,0,0.1)",
                      border: `1px solid ${isLive ? UCL_CYAN : "rgba(255,180,0,0.4)"}`,
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                      color: isLive ? UCL_CYAN : "#ffb400",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}>
                      {isLive
                        ? <><Wifi size={12} /> LIVE SOFASCORE</>
                        : <><WifiOff size={12} /> DONNÉES VÉRIFIÉES</>}
                    </div>
                    {/* Last updated */}
                    {lastUpdated && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif" }}>
                        MAJ {lastUpdated.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Loading state */}
                {rankingsLoading ? (
                  <div style={{ padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <RefreshCw size={32} style={{ color: UCL_CYAN, animation: "spin 1s linear infinite" }} />
                    <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: "0.1em" }}>CHARGEMENT SOFASCORE...</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : (
                  <div>
                    {(activeTab === "scorers" ? scorers : activeTab === "assisters" ? assisters : young).map((p: any, i: number) => (
                      <RankRow
                        key={p.name} rank={i + 1} name={p.name} team={p.team}
                        value={activeTab === "scorers" ? p.goals : activeTab === "assisters" ? p.assists : Number(p.rating?.toFixed(1))}
                        valueLabel={activeTab === "scorers" ? "Buts" : activeTab === "assisters" ? "Passes Déc." : "Note Moy."}
                        sofaId={p.sofaId} delay={i * 0.05}
                        onClick={() => setLocation(`/joueur/${encodeURIComponent(p.name)}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
