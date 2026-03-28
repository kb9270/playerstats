import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PlayerAvatar from "@/components/PlayerAvatar";
import Header from "@/components/Header";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  },
};

const GOLD = "#DFB544";

const BallonDorLogo = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 70 }}>
    <svg width="140" height="220" viewBox="0 0 140 220" fill="none" xmlns="http://www.w3.org/2000/svg">
       <g stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
         {/* Top rays */}
         <line x1="35" y1="75" x2="35" y2="65" />
         <line x1="43" y1="70" x2="43" y2="55" />
         <line x1="51" y1="65" x2="51" y2="45" />
         <line x1="59" y1="62" x2="59" y2="35" />
         <line x1="67" y1="60" x2="67" y2="30" />
         <line x1="75" y1="62" x2="75" y2="35" />
         <line x1="83" y1="65" x2="83" y2="45" />
         <line x1="91" y1="70" x2="91" y2="55" />
         <line x1="99" y1="75" x2="99" y2="65" />

         {/* Bottom rays */}
         <line x1="48" y1="135" x2="48" y2="155" />
         <line x1="56" y1="140" x2="56" y2="175" />
         <line x1="64" y1="143" x2="64" y2="195" />
         <line x1="72" y1="143" x2="72" y2="195" />
         <line x1="80" y1="140" x2="80" y2="175" />
         <line x1="88" y1="135" x2="88" y2="155" />

         {/* Ball outline */}
         <circle cx="67" cy="102" r="34" />
         
         {/* Inner Pentagon & lines to outline */}
         <path d="M 67 85 L 82 95 L 75 113 L 59 113 L 52 95 Z" />
         <line x1="67" y1="85" x2="67" y2="68" />
         <line x1="82" y1="95" x2="98" y2="90" />
         <line x1="75" y1="113" x2="86" y2="129" />
         <line x1="59" y1="113" x2="48" y2="129" />
         <line x1="52" y1="95" x2="36" y2="90" />

         {/* Extra ball segments */}
         <path d="M 48 129 Q 67 136 86 129" />
         <path d="M 36 90 Q 34 102 48 129" />
         <path d="M 98 90 Q 100 102 86 129" />
         <path d="M 67 68 Q 46 72 36 90" />
         <path d="M 67 68 Q 88 72 98 90" />
       </g>
    </svg>
    <div style={{ marginTop: 20, textAlign: "center" }}>
       <h1 style={{ 
         fontFamily: "'Montserrat', sans-serif", 
         fontWeight: 300, 
         fontSize: 48, 
         color: GOLD,
         letterSpacing: "0.18em",
         lineHeight: 1.1,
         margin: 0,
       }}>
         BALLON<br/><span style={{ fontSize: 38, letterSpacing: "0.22em" }}>D'OR™</span>
       </h1>
    </div>
  </div>
);

export default function BallonDor() {
  const [, setLocation] = useLocation();

  const { data: rankingData, isLoading } = useQuery<{ success: boolean; rankings: any[] }>({
    queryKey: ["/api/ballon-dor"],
    staleTime: 0,
  });

  const rankings = rankingData?.rankings || [];

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: GOLD, fontFamily: "'Montserrat', sans-serif" }}>
      <Header />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;700&display=swap');
        
        .gold-glow {
          text-shadow: 0 0 20px rgba(223, 181, 68, 0.4);
        }
        
        .player-row:hover .player-name {
          color: #fff !important;
          text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
        }
      `}</style>
      
      {/* Absolute dark background to ensure no bleed */}
      <div style={{ position: "fixed", inset: 0, backgroundColor: "#000", zIndex: 0 }} />

      {/* Thin Gold Borders like the image */}
      <div style={{
         position: "fixed", top: 0, left: "4%", bottom: 0, width: 1, backgroundColor: GOLD, opacity: 0.7, zIndex: 1
      }} />
      <div style={{
         position: "fixed", top: 0, right: "4%", bottom: 0, width: 1, backgroundColor: GOLD, opacity: 0.7, zIndex: 1
      }} />

      <main style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "100px 32px 80px" }}>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ position: "relative" }}>
          <button 
            onClick={() => setLocation("/")}
            style={{ 
              position: "absolute", top: -40, left: 0,
              display: "flex", alignItems: "center", gap: 8, 
              background: "transparent", border: "none",
              color: GOLD, opacity: 0.8,
              fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.15em",
              cursor: "pointer", transition: "opacity 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            <ArrowLeft size={16} /> RETOUR
          </button>

          <BallonDorLogo />
        </motion.div>

        {/* Cérémonie Subtitle (Optional, inspired by image header) */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}
          style={{ textAlign: "center", marginBottom: 60, fontFamily: "'Montserrat', sans-serif", fontWeight: 200, fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.6 }}
        >
          Classement Officiel · The Race
        </motion.div>

        {/* Top 10 List */}
        <div>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="shimmer" style={{ height: 80, background: "rgba(223, 181, 68, 0.05)" }} />
              ))}
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column" }}>
              {rankings.map((player: any, index: number) => {
                const isWinner = index === 0;
                
                return (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    onClick={() => setLocation(`/joueur/${encodeURIComponent(player.playerName)}`)}
                    className="player-row"
                    style={{
                      borderBottom: `1px solid rgba(223, 181, 68, ${isWinner ? 0.3 : 0.15})`,
                      padding: "32px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 32,
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Rank Number */}
                    <div style={{
                      width: 50, flexShrink: 0,
                      fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: isWinner ? 42 : 28,
                      color: GOLD, opacity: isWinner ? 1 : 0.6,
                      textAlign: "center",
                    }}>
                      {player.rank || (index + 1)}
                      {isWinner && <span style={{ fontSize: 16, verticalAlign: "top", opacity: 0.8 }}>.</span>}
                    </div>
                    
                    {/* Player Avatar */}
                    <div style={{
                      width: isWinner ? 90 : 70, height: isWinner ? 90 : 70, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                      border: `1px solid ${GOLD}`,
                      padding: 4,
                      background: "transparent",
                    }}>
                      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: `1px solid rgba(223,181,68,0.3)` }}>
                        <PlayerAvatar 
                          playerName={player.playerName}
                          teamName={player.team}
                          sofaId={player.sofaId}
                          size="xl"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {isWinner && <Sparkles size={18} style={{ color: GOLD }} />}
                        <h2 className="player-name" style={{ 
                          fontFamily: "'Montserrat', sans-serif", fontWeight: isWinner ? 400 : 300, fontSize: isWinner ? 32 : 24, 
                          textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px",
                          color: GOLD, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          transition: "color 0.3s ease",
                        }}>
                          {player.playerName}
                        </h2>
                      </div>
                      <p style={{ color: "rgba(223, 181, 68, 0.6)", fontSize: 13, margin: 0, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                        {player.team}
                      </p>
                    </div>

                    {/* Minimalist Metrics */}
                    <div className="hidden md:flex" style={{ gap: 40, alignItems: "center", paddingRight: 32 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 24, color: GOLD }}>
                          {player.metrics?.buts || 0}
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4 }}>Buts</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 24, color: GOLD }}>
                          {player.metrics?.passes || 0}
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4 }}>Passes</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: 24, color: GOLD }}>
                          {player.metrics?.rating || "-"} <Star size={12} fill={GOLD} stroke={GOLD} />
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4 }}>Sofascore</div>
                      </div>
                    </div>

                    {/* Total Points */}
                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <div style={{ 
                        fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: isWinner ? 42 : 36, 
                        color: GOLD, lineHeight: 1 
                      }}>
                        {Math.round(player.points)}
                      </div>
                      <div style={{ fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 8 }}>
                        Points
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
