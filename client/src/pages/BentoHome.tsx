import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

// Load additional fonts for special widgets
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}
import {
  Search, Trophy, Zap, BarChart3, Users, Activity,
  TrendingUp, ArrowUpRight, Globe, ChevronRight,
  Star, Target, Crosshair, Clock, Newspaper, Menu, X
} from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";

/* ─── Framer Motion variants ────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Glassmorphism card primitive ─────────────────────── */
function GlassCard({
  children,
  className = "",
  glowColor = "rgba(255,255,255,0.06)",
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      variants={cardVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.018, transition: { duration: 0.25, ease: "easeOut" } }}
      style={{
        background: "rgba(255,255,255,0.032)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hovered
          ? `0 0 40px ${glowColor}, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`,
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        ...style,
      }}
      className={className}
    >
      {/* Subtle top shine */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,${hovered ? 0.15 : 0.07}), transparent)`,
        transition: "all 0.3s ease",
        pointerEvents: "none",
      }} />
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ to, duration = 1600, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { requestAnimationFrame(step); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString("fr-FR")}{suffix}</span>;
}

/* ─── Team of the Week primitives ────────────────────────  */
const PlayerToken = ({ player, top, left, onClick }: { player: any; top: string; left: string; onClick: () => void }) => {
  if (!player) return null;
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute", top, left, transform: "translate(-50%, -50%)",
        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10
      }}
    >
      <div style={{ position: "relative" }}>
        <div style={{
          border: "2px solid rgba(245,200,66,0.6)",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
          display: "inline-flex",
          background: "rgba(0,0,0,0.4)",
        }}>
          <PlayerAvatar
            playerName={player.Player || ""}
            teamName={player.Squad}
            sofaId={player.sofaId}
            size="md"
            className="rounded-xl w-10 h-10"
          />
        </div>
        <div style={{
          position: "absolute",
          top: -6, right: -12,
          background: "#F5C842",
          color: "#0a0a0f",
          fontSize: 10,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          padding: "2px 6px",
          borderRadius: 6,
          lineHeight: 1,
          boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
          zIndex: 5,
        }}>
          {Number(player.displayRating || player.rating).toFixed(1)}
        </div>
      </div>
      <div style={{
        marginTop: 6,
        fontSize: 10,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.9)",
        textShadow: "0 2px 4px rgba(0,0,0,0.9)",
        background: "rgba(0,0,0,0.5)",
        padding: "2px 6px",
        borderRadius: 4,
        whiteSpace: "nowrap",
      }}>
        {player.Player?.split(" ").pop() || "Player"}
      </div>
    </div>
  );
};

const FieldLines = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{
      position: "absolute", inset: 0,
      width: "100%", height: "100%",
      opacity: 0.25, pointerEvents: "none", zIndex: 1,
    }}
  >
    <rect x="4" y="3" width="92" height="94" fill="none" stroke="#fff" strokeWidth="0.8" rx="2" />
    <line x1="4" y1="50" x2="96" y2="50" stroke="#fff" strokeWidth="0.6" />
    <circle cx="50" cy="50" r="13" fill="none" stroke="#fff" strokeWidth="0.6" />
    <circle cx="50" cy="50" r="1" fill="#fff" />
    <rect x="26" y="3" width="48" height="20" fill="none" stroke="#fff" strokeWidth="0.6" />
    <rect x="26" y="77" width="48" height="20" fill="none" stroke="#fff" strokeWidth="0.6" />
    <rect x="36" y="3" width="28" height="9" fill="none" stroke="#fff" strokeWidth="0.5" />
    <rect x="36" y="88" width="28" height="9" fill="none" stroke="#fff" strokeWidth="0.5" />
    <path d="M 36 23 Q 50 32 64 23" fill="none" stroke="#fff" strokeWidth="0.4" />
    <path d="M 36 77 Q 50 68 64 77" fill="none" stroke="#fff" strokeWidth="0.4" />
  </svg>
);
 
const UCLPlayerCard = ({ player, top, left }: { player: any; top: string; left: string }) => {
  if (!player) return null;
  const teamId = player.teamId || 0;
  const teamLogo = teamId ? `https://www.sofascore.com/api/v1/team/${teamId}/image` : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.15, zIndex: 100 }}
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
          border: "1.5px solid #0043ff"
        }}>
          <img src={teamLogo} alt={player.Squad} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
      )}

      {/* The Hexagon Shield with Neon Gradient Border */}
      <div style={{
        position: "relative",
        width: 72, height: 86,
        padding: "2.2px",
        background: "linear-gradient(45deg, #A855F7, #06B6D4)", 
        clipPath: "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 12px 28px rgba(0,0,0,0.8)",
      }}>
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(180deg, #0043FF 0%, #001A4D 100%)",
          clipPath: "polygon(50% 0%, 100% 20%, 100% 80%, 50% 100%, 0% 80%, 0% 20%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          <div style={{ width: "100%", height: "100%", transform: "scale(1.18) translateY(4%)" }}>
            <PlayerAvatar
              playerName={player.Player || ""}
              teamName={player.Squad}
              sofaId={player.sofaId}
              size="md"
              className="w-full h-full object-cover object-[center_top] bg-transparent border-none opacity-98"
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
        {player.Player?.split(" ").pop() || "NAME"}
      </div>
    </motion.div>
  );
};

/* ─── League Widget Primitive ──────────────────────────── */
function LeagueWidget({
  name, logo, color, leader, points, topScorer, goals, onClick, standings = []
}: {
  name: string;
  logo: string;
  color: string;
  leader?: string;
  points?: number;
  topScorer?: string;
  goals?: number;
  onClick: () => void;
  standings?: any[];
}) {
  const isPL = name === "Premier League";
  const isL1 = name === "Ligue 1";
  const isLL = name === "La Liga";
  const isSA = name === "Serie A";

  if (isSA) {
    const displayRows = standings.length > 0 ? standings : [
      { rank: 1, team: "Inter Milan", points: 82 },
      { rank: 2, team: "AC Milan", points: 68 },
      { rank: 3, team: "Juventus", points: 62 },
      { rank: 4, team: "Bologna", points: 58 },
      { rank: 5, team: "AS Roma", points: 55 },
    ];

    return (
      <div className="sa-ui-container sheen-container" onClick={onClick} style={{ cursor: "pointer", height: "100%" }}>
        <div className="sa-ui-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Serie A "A" Logo */}
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg" 
              alt="Serie A" 
              style={{ height: 28, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
            />
            <div className="sa-header-title">CLASSEMENT</div>
          </div>
          <div style={{ background: "rgba(0, 219, 255, 0.2)", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, color: "#00DBFF" }}>LIVE</div>
        </div>

        <motion.div 
          className="sa-ui-body"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {displayRows.map((row, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, scale: 0.95, y: 5 },
                show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
              }}
              className="sa-ui-row"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="sa-rank">{row.rank || row.r}</span>
                <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "white" }}>{row.team || row.t}</span>
              </div>
              <span className="sa-points">{row.points || row.p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (isLL) {
    const displayRows = standings.length > 0 ? standings : [
      { rank: 1, team: "Real Madrid", points: 75 },
      { rank: 2, team: "Barcelona", points: 67 },
      { rank: 3, team: "Girona", points: 65 },
      { rank: 4, team: "Atlético", points: 58 },
      { rank: 5, team: "Athletic", points: 56 },
    ];

    return (
      <div className="ll-ui-container sheen-container" onClick={onClick} style={{ cursor: "pointer", height: "100%" }}>
        <div className="ll-ui-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* New LaLiga LL Monogram Logo */}
            <img 
              src="https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png" 
              alt="LL" 
              style={{ height: 28, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
            />
            <div className="ll-header-title">CLASSEMENT</div>
          </div>
          <motion.div
             animate={{ opacity: [0.4, 1, 0.4] }}
             transition={{ duration: 2, repeat: Infinity }}
             style={{ width: 6, height: 6, borderRadius: "50%", background: "#FA1832" }}
          />
        </div>

        <motion.div 
          className="ll-ui-body"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {displayRows.map((row, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0, transition: { type: "tween", duration: 0.2 } }
              }}
              className={`ll-ui-row ${i === 0 ? 'll-row-leader' : ''}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="ll-rank">{row.rank || row.r}</span>
                <span style={{ fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.02em" }}>{row.team || row.t}</span>
              </div>
              <span className="ll-points">{row.points || row.p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (isL1) {
    const displayRows = standings.length > 0 ? standings : [
      { rank: 1, team: "PSG", points: 59 },
      { rank: 2, team: "Marseille", points: 50 },
      { rank: 3, team: "Monaco", points: 49 },
      { rank: 4, team: "Lille", points: 46 },
      { rank: 5, team: "Lens", points: 45 },
    ];

    return (
      <div className="l1-ui-container sheen-container" onClick={onClick} style={{ cursor: "pointer", height: "100%" }}>
        <div className="l1-ui-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img 
              src="https://r2.thesportsdb.com/images/media/league/badge/9f7z9d1742983155.png" 
              alt="L1" 
              style={{ height: 28, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
            />
            <div className="l1-header-title">CLASSEMENT</div>
          </div>
          <Zap size={16} />
        </div>

        <motion.div 
          className="l1-ui-body"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.04
              }
            }
          }}
        >
          {displayRows.map((row, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }
              }}
              className={`l1-ui-row ${i === 0 ? 'l1-row-accent' : ''}`}
            >
              <div className="pl-team-info">
                <span style={{ fontWeight: 900, color: i < 3 ? "var(--l1-yellow)" : "rgba(255,255,255,0.4)", width: 22, fontSize: 13 }}>{row.rank || row.r}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: "white" }}>{row.team || row.t}</span>
              </div>
              <span className="l1-points">{row.points || row.p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

    if (isPL) {
    const displayRows = standings.length > 0 ? standings : [
      { rank: 1, team: "Liverpool", points: 67 },
      { rank: 2, team: "Arsenal", points: 64 },
      { rank: 3, team: "Man City", points: 63 },
      { rank: 4, team: "Chelsea", points: 60 },
      { rank: 5, team: "Aston Villa", points: 59 },
    ];

    return (
      <div className="pl-ui-container sheen-container" onClick={onClick} style={{ cursor: "pointer", height: "100%" }}>
        <div className="pl-ui-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg" 
              alt="PL" 
              style={{ height: 28, filter: "brightness(0) invert(1)" }} 
            />
            <div className="pl-header-title" data-text="CLASSEMENT">CLASSEMENT</div>
          </div>
          <div className="pl-header-icon"></div>
        </div>

        <motion.div 
          className="pl-ui-body"
          initial="hidden"
          animate="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {displayRows.map((row, i) => (
            <motion.div 
              key={i} 
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
              className={`pl-ui-row ${i === 0 ? 'pl-row-accent' : ''}`}
            >
              <div className="pl-team-info">
                <span className="pl-rank">{row.rank || row.r}</span>
                <span className="pl-team-name">{row.team || row.t}</span>
              </div>
              <span className="pl-points">{row.points || row.p}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <GlassCard
      glowColor={`${color}33`}
      onClick={onClick}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: 180,
        background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, ${color}08 100%)`,
        border: `1px solid ${color}22`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt={name} style={{ width: 28, height: 28, objectFit: "contain", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }} />
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "#fff"
          }}>{name}</span>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {leader && (
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>Leader</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{leader}</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: color }}>{points} pts</span>
            </div>
          </div>
        )}
        {topScorer && (
          <div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>Meilleur Buteur</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{topScorer}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{goals} <span style={{ fontSize: 10, opacity: 0.5 }}>⚽</span></span>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/* ─── Nav ───────────────────────────────────────────────── */
function BentoNav() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const nav = [
    { href: "/", label: "Joueurs" },
    { href: "/comparison", label: "Comparaison" },
    { href: "/ldc", label: "🏆 LDC" },
    { href: "/matches-live", label: "Direct" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0, x: "-50%" }}
      animate={{ y: 0, opacity: 1, x: "-50%" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 16, left: "50%",
        zIndex: 100,
        width: "calc(100% - 48px)",
        maxWidth: 1232,
        background: scrolled ? "rgba(10,10,10,0.85)" : "rgba(10,10,10,0.5)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "0 20px",
        transition: "background 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #E8344A, #c9253d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: 13, color: "#fff", boxShadow: "0 4px 12px rgba(232,52,74,0.4)",
          }}>PS</div>
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
            fontSize: 16, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase",
          }}>
            Player<span style={{ color: "#E8344A" }}>Stats</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", gap: 6 }} className="hidden-mobile">
          {nav.map(item => {
            const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "6px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  transition: "all 0.2s ease",
                }}>
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Live button */}
        <Link href="/matches-live" style={{ textDecoration: "none" }} className="hidden-mobile">
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px",
              background: "rgba(232,52,74,0.15)",
              border: "1px solid rgba(232,52,74,0.35)",
              borderRadius: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 12,
              color: "#E8344A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#E8344A",
              boxShadow: "0 0 8px rgba(232,52,74,0.8)",
              animation: "pulse-dot 1s ease-in-out infinite",
            }} />
            Live
          </motion.div>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="show-mobile"
          onClick={() => setOpen(!open)}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 6 }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.07)", paddingBottom: 12 }}
          >
            {nav.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "12px 4px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: 15, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
                }}>{item.label}</div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </motion.header>
  );
}

/* ─── Search modal ──────────────────────────────────────── */
function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [debQ, setDebQ] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else setQ("");
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data: results, isLoading } = useQuery<any[]>({
    queryKey: [`/api/players/search?q=${debQ}`],
    enabled: debQ.length > 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "flex-start", justifyContent: "center",
            paddingTop: 100, paddingLeft: 24, paddingRight: 24,
          }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.97 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 640,
              background: "rgba(12,12,12,0.96)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Input row */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Search size={18} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Mbappé, Haaland, Bellingham…"
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 16, fontFamily: "'Barlow', sans-serif",
                  color: "#fff",
                }}
              />
              <kbd onClick={onClose} style={{
                padding: "3px 8px", borderRadius: 6,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 11, color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
              }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {isLoading && (
                <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)" }} className="shimmer" />
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ height: 12, width: "50%", borderRadius: 4 }} className="shimmer" />
                        <div style={{ height: 9, width: "30%", borderRadius: 4 }} className="shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!isLoading && Array.isArray(results) && results.length > 0 && results.slice(0, 7).map((p: any) => (
                <div
                  key={p.id || p.name}
                  onClick={() => { setLocation(`/joueur/${encodeURIComponent(p.name)}`); onClose(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 20px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <PlayerAvatar playerName={p.name} teamName={p.team} headshot={p.headshot} logo={p.logo} size="md" showTeamBadge={!!p.logo} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.04em" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {[p.team, p.position, p.nationality].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <ArrowUpRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
              ))}
              {!isLoading && debQ.length > 2 && (!results || results.length === 0) && (
                <div style={{ padding: "28px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                  Aucun joueur trouvé
                </div>
              )}
              {debQ.length <= 2 && (
                <div style={{ padding: "20px", color: "rgba(255,255,255,0.25)", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Tapez au moins 3 caractères…
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Take Over Animated Stats Component ──────────────────── */
function TakeOverExpandingStats() {
  const [expanded, setExpanded] = useState(false);
  
  const maps = [
    { map: "Maestro", opponent: "vs Villarreal", stats: "Hat-trick Historique, 10/10", rating: 10.0 },
    { map: "Récital", opponent: "@ Real Madrid", stats: "1 But, 2 Passes Clés", rating: 9.2 },
    { map: "Partition", opponent: "vs PSG", stats: "2 Passes Décisives, 4 Dribbles", rating: 8.9 },
  ];

  return (
    <div style={{ position: "relative", zIndex: 10 }}>
      {/* Expand/Collapse Toggle Button */}
      <div 
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        style={{ 
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", background: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: 6, transition: "all 0.2s"
        }}
      >
        <span style={{ fontSize: 11, color: "#D4AF37", fontFamily: "'Inter', sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{expanded ? "Fermer le récital" : "Voir la symphonie (Maps)"}</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronRight size={14} style={{ color: "#D4AF37", transform: expanded ? "none" : "rotate(90deg)" }} />
        </motion.div>
      </div>

      {/* Expanded Animated Area */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden", marginTop: expanded ? 12 : 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {maps.map((m, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + (i*0.1) }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderLeft: "2px solid #D4AF37", borderRadius: "0 4px 4px 0" }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#D4AF37", fontFamily: "'Inter', sans-serif" }}>{m.map}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>{m.opponent}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: "'Georgia', serif", fontStyle: "italic", marginTop: 2 }}>{m.stats}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#D4AF37", fontFamily: "'Georgia', serif" }}>{m.rating}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main BentoHome page ─────────────────────────────── */
export default function BentoHome() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [, setLocation] = useLocation();

  /* Data hooks */
  const { data: totwData } = useQuery<{ success: boolean; players: any[] }>({
    queryKey: ["/api/live/top-players"],
    staleTime: 5 * 60_000,
  });
  const { data: matchesData } = useQuery<any[]>({
    queryKey: ["/api/live-matches"],
    refetchInterval: 10_000,
    staleTime: 0,
  });
  const { data: rankingData } = useQuery<{ success: boolean; rankings: any[] }>({
    queryKey: ["/api/ballon-dor"],
    staleTime: 5 * 60_000,
  });
  const { data: newsData } = useQuery<{ success: boolean; news: any[] }>({
    queryKey: ["/api/news"],
    staleTime: 5 * 60_000,
  });

  // --- Real PL Standings for the Widget ---
  const { data: plData } = useQuery<any>({
    queryKey: ["/api/standings/eng Premier League"],
    staleTime: 5 * 60_000,
  });
  const plStandings = plData?.standings?.slice(0, 5) || [];

  const { data: l1Data } = useQuery<any>({
    queryKey: ["/api/standings/fr Ligue 1"],
    staleTime: 5 * 60_000,
  });
  const l1Standings = l1Data?.standings?.slice(0, 5) || [];

  const { data: llData } = useQuery<any>({
    queryKey: ["/api/standings/esp La Liga"],
    staleTime: 5 * 60_000,
  });
  const llStandings = llData?.standings?.slice(0, 5) || [];

  const { data: saData } = useQuery<any>({
    queryKey: ["/api/standings/it Serie A"],
    staleTime: 5 * 60_000,
  });
  const saStandings = saData?.standings?.slice(0, 5) || [];

  const players = totwData?.players || [];
  const topPlayer = players[0];
  
  // Tactical layout for TOTW (4-3-3)
  const fws = players.filter(p => p.Pos?.includes("F") || p.Pos?.includes("W")).slice(0, 3);
  const mfs = players.filter(p => !fws.includes(p) && (p.Pos?.includes("M") || p.Pos?.includes("C"))).slice(0, 3);
  const dfs = players.filter(p => !fws.includes(p) && !mfs.includes(p) && (p.Pos?.includes("D") || p.Pos?.includes("B"))).slice(0, 4);
  const gk = players.find(p => p.Pos?.includes("G") || p.Pos?.includes("K")) || players[10];

  const matches = matchesData || [];
  const liveMatches = matches.filter(m => m.status === "LIVE" || m.status === "IN_PLAY");
  const rankings = rankingData?.rankings || [];
  const news = newsData?.news || [];

  /* Keyboard shortcut */
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Barlow', sans-serif",
    }}>
      {/* ── Ambient background glows ─────────────────── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 50% at 15% 0%, rgba(232,52,74,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 85% 100%, rgba(26,111,255,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)
        `,
      }} />

      <BentoNav />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Page content ────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "100px 24px 60px" }}>

        {/* ── Hero tagline ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px 5px 10px",
            background: "rgba(232,52,74,0.1)",
            border: "1px solid rgba(232,52,74,0.25)",
            borderRadius: 100,
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8344A", boxShadow: "0 0 8px rgba(232,52,74,0.8)", animation: "pulse-dot 1s ease-in-out infinite", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#E8344A", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Saison 2025–2026 · Live Data
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(56px, 9vw, 108px)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            letterSpacing: "-0.01em",
            lineHeight: 0.92,
            textTransform: "uppercase",
            margin: "0 0 24px",
          }}>
            L'Analyse<br />
            <span style={{ color: "#E8344A" }}>Football.</span>
          </h1>

          <p style={{
            fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 460, margin: "0 auto 36px",
            lineHeight: 1.65,
          }}>
            Plus de <strong style={{ color: "#fff" }}>2 800 joueurs</strong> européens, des modèles prédictifs avancés et des statistiques en temps réel.
          </p>

          {/* Search trigger */}
          <motion.button
            onClick={() => setSearchOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "14px 28px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              color: "rgba(255,255,255,0.45)",
              fontSize: 14, fontFamily: "'Barlow', sans-serif",
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              transition: "all 0.25s ease",
              minWidth: 360,
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={16} />
              Rechercher — Mbappé, Haaland, Bellingham…
            </span>
            <kbd style={{
              padding: "3px 8px", borderRadius: 6,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: 11, color: "rgba(255,255,255,0.3)",
            }}>⌘K</kbd>
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════
            BENTO GRID
        ═══════════════════════════════════════════ */}
        <motion.div
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gridTemplateRows: "auto",
            gap: 12,
          }}
        >

          {/* ── CARD 1: TAKE OVER WIDGET (Wolfgang Amadeus Yamal) ── */}
          <GlassCard
            glowColor="rgba(212, 175, 55, 0.5)"
            onClick={() => setLocation("/takeover")}
            style={{ 
              gridColumn: "1 / 6", 
              gridRow: "1 / 3", 
              padding: 0,
              background: "linear-gradient(135deg, #1A0D00 0%, #3B0000 100%)", // Velours baroque / Rouge opéra profond
              border: "1px solid rgba(212, 175, 55, 0.4)",
              position: "relative",
              overflow: "hidden",
              minHeight: 440,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Décoration Baroque & Musique */}
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1, pointerEvents: "none" }}>
               {/* Clé de sol géante en filigrane */}
               <svg width="250" height="350" viewBox="0 0 100 200" fill="none">
                 <path d="M40 180 C10 180 10 150 30 140 C50 130 70 140 70 160 C70 180 30 180 30 110 C30 40 80 40 80 80 C80 100 50 110 50 80 C50 60 70 60 70 80 C70 120 40 120 40 180" stroke="#D4AF37" strokeWidth="3" fill="none" strokeLinecap="round"/>
               </svg>
            </div>
            {/* Notes volantes */}
            <motion.div animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: "absolute", top: 30, right: 120, fontSize: 32, color: "#D4AF37" }}>♪</motion.div>
            <motion.div animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} style={{ position: "absolute", bottom: 60, left: 30, fontSize: 40, color: "#D4AF37" }}>♫</motion.div>

            <div style={{ padding: "30px", height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 2 }}>
              
              {/* En-tête : Badge Take Over & Expire */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <div style={{ 
                    background: "rgba(212, 175, 55, 0.15)", border: "1px solid #D4AF37", borderRadius: 4, 
                    padding: "4px 10px", fontSize: 11, fontWeight: 800, color: "#D4AF37", fontFamily: "'Inter', sans-serif",
                    letterSpacing: "0.15em", display: "inline-block", textTransform: "uppercase"
                  }}>
                    ⚡ Take Over
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(0,0,0,0.3)", padding: "4px 10px", borderRadius: 100 }}>
                  Expire dans 2j 14h
                </div>
              </div>

              {/* Titre & Surnom de L'Identité Visuelle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>
                {/* Avatar du Joueur Cerclé d'Or Baroque */}
                <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid #D4AF37", padding: 3, background: "#000", flexShrink: 0, boxShadow: "0 0 25px rgba(212, 175, 55, 0.4)" }}>
                   <PlayerAvatar playerName="Lamine Yamal" teamName="Barcelone" sofaId={1402912} size="md" className="rounded-full w-full h-full object-cover" />
                </div>
                <div>
                  {/* Police style classique/symphonique */}
                  <h3 style={{ margin: 0, fontSize: 38, fontWeight: 700, color: "#D4AF37", fontFamily: "'Georgia', serif", fontStyle: "italic", lineHeight: 1.1 }}>
                    Wolfgang Amadeus Yamal
                  </h3>
                  <p style={{ margin: "12px 0 0 0", fontSize: 16, color: "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>
                    « 3 buts (Hat-trick). <br/>Le récital historique du Maestro. Note parfaite de 10. »
                  </p>
                </div>
              </div>

              {/* Système Rétractable des Statistiques Détaillées par Map */}
              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <TakeOverExpandingStats />
              </div>

            </div>
          </GlassCard>

          {/* ── CARD 2: Live Scores (medium) ────────── */}
          <GlassCard
            glowColor="rgba(232,52,74,0.2)"
            style={{ gridColumn: "6 / 9", gridRow: "1 / 2", padding: 24, minHeight: 180 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#E8344A",
                  boxShadow: "0 0 10px rgba(232,52,74,0.8)",
                  animation: "pulse-dot 1s ease-in-out infinite",
                  display: "inline-block",
                }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Scores Direct
                </span>
              </div>
              <Link href="/matches-live" style={{ textDecoration: "none" }}>
                <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
              </Link>
            </div>
            {liveMatches.length > 0 ? liveMatches.slice(0, 3).map((m: any) => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#E8344A", width: 30, letterSpacing: "0.06em" }}>
                  {m.minute ? `${m.minute}'` : "LIVE"}
                </span>
                <span style={{ flex: 1, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.homeTeam?.name}</span>
                <span style={{
                  padding: "2px 10px", fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  background: "rgba(232,52,74,0.15)", border: "1px solid rgba(232,52,74,0.3)",
                  borderRadius: 6, color: "#E8344A", letterSpacing: "0.05em", flexShrink: 0,
                }}>{m.score?.home ?? "–"}:{m.score?.away ?? "–"}</span>
                <span style={{ flex: 1, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.awayTeam?.name}</span>
              </div>
            )) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80, color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
                Aucun match en direct
              </div>
            )}
          </GlassCard>

          {/* ── CARD 3: Quick stat — Total players ─── */}
          <GlassCard
            glowColor="rgba(26,111,255,0.2)"
            style={{ gridColumn: "9 / 11", gridRow: "1 / 2", padding: 28, minHeight: 180 }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(26,111,255,0.15)",
                border: "1px solid rgba(26,111,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Users size={18} style={{ color: "#1A6FFF" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff" }}>
                  <Counter to={2800} />
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Joueurs analysés
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ── CARD 4: Quick stat — Metrics ─────── */}
          <GlassCard
            glowColor="rgba(245,200,66,0.2)"
            style={{ gridColumn: "11 / 13", gridRow: "1 / 2", padding: 28, minHeight: 180 }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(245,200,66,0.12)",
                border: "1px solid rgba(245,200,66,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BarChart3 size={18} style={{ color: "#F5C842" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1, color: "#F5C842" }}>
                  <Counter to={42} />
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Métriques
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ── CARD 5: Ballon d'Or Ranking ─────── */}
          <GlassCard
            glowColor="rgba(223, 181, 68, 0.25)"
            style={{ 
              gridColumn: "6 / 9", 
              gridRow: "2 / 3", 
              padding: 0, 
              cursor: "pointer",
              background: "linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(20,20,20,1) 100%)",
              border: "1px solid rgba(223, 181, 68, 0.3)",
              fontFamily: "'Montserrat', sans-serif"
            }}
            onClick={() => setLocation("/ballon-dor")}
          >
            <div style={{ padding: "20px 24px", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ transform: "scale(0.35)", transformOrigin: "left center", width: 40, height: 40, marginBottom: -25, marginTop: -15 }}>
                  <svg width="140" height="220" viewBox="0 0 140 220" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g stroke="#DFB544" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="67" cy="102" r="34" />
                      <path d="M 67 85 L 82 95 L 75 113 L 59 113 L 52 95 Z" />
                      <line x1="67" y1="85" x2="67" y2="68" />
                      <line x1="82" y1="95" x2="98" y2="90" />
                      <line x1="75" y1="113" x2="86" y2="129" />
                      <line x1="59" y1="113" x2="48" y2="129" />
                      <line x1="52" y1="95" x2="36" y2="90" />
                    </g>
                  </svg>
                </div>
                <div style={{ marginLeft: -10 }}>
                  <div style={{ 
                    fontFamily: "'Montserrat', sans-serif", 
                    fontWeight: 300, 
                    fontSize: 14, 
                    color: "#DFB544", 
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    lineHeight: 1
                  }}>
                    Ballon d'Or
                  </div>
                  <div style={{ 
                    fontSize: 8, 
                    color: "rgba(223, 181, 68, 0.5)", 
                    letterSpacing: "0.4em", 
                    textTransform: "uppercase",
                    marginTop: 2
                  }}>
                    The Race 2026
                  </div>
                </div>
                <ChevronRight size={14} style={{ marginLeft: "auto", color: "rgba(223, 181, 68, 0.4)" }} />
              </div>

              {rankings.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {rankings.slice(0, 4).map((r: any, i: number) => {
                    const isWinner = i === 0;
                    return (
                      <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: i < 3 ? "1px solid rgba(223, 181, 68, 0.12)" : "none",
                        transition: "all 0.2s ease"
                      }}>
                        <span style={{
                          width: 20,
                          fontFamily: "'Montserrat', sans-serif",
                          fontWeight: isWinner ? 700 : 300,
                          fontSize: isWinner ? 16 : 12,
                          color: "#DFB544",
                          opacity: isWinner ? 1 : 0.6,
                          textAlign: "center"
                        }}>{i + 1}</span>
                        
                        <div style={{ 
                          width: 32, height: 32, borderRadius: "50%", overflow: "hidden", 
                          border: `1px solid ${isWinner ? "#DFB544" : "rgba(223, 181, 68, 0.3)"}`,
                          padding: 1.5, flexShrink: 0
                        }}>
                           <PlayerAvatar playerName={r.playerName} teamName={r.team} sofaId={r.sofaId} size="md" className="rounded-full h-full w-full object-cover" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontFamily: "'Montserrat', sans-serif", 
                            fontWeight: isWinner ? 600 : 400, 
                            fontSize: 12, 
                            textTransform: "uppercase", 
                            letterSpacing: "0.08em", 
                            color: "#DFB544",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" 
                          }}>
                            {r.playerName}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ 
                            fontFamily: "'Montserrat', sans-serif", 
                            fontWeight: 700, 
                            fontSize: 14, 
                            color: "#DFB544",
                            lineHeight: 1
                          }}>{Math.round(r.points)}</div>
                          <div style={{ fontSize: 7, color: "rgba(223, 181, 68, 0.4)", textTransform: "uppercase", marginTop: 2 }}>PTS</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...Array(4)].map((_, i) => <div key={i} style={{ height: 40, borderRadius: 6, background: "rgba(223, 181, 68, 0.05)" }} className="shimmer" />)}
                </div>
              )}
            </div>
          </GlassCard>

          {/* ── CARD 6: Quick stats 2 cols ────────── */}
          <GlassCard
            glowColor="rgba(232,52,74,0.15)"
            style={{ gridColumn: "9 / 11", gridRow: "2 / 3", padding: 28 }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(232,52,74,0.12)",
                border: "1px solid rgba(232,52,74,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Globe size={18} style={{ color: "#E8344A" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1, color: "#E8344A" }}>
                  <Counter to={5} />
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Ligues majeures
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ── CARD 7: Coverage stat ────────────── */}
          <GlassCard
            glowColor="rgba(26,111,255,0.15)"
            style={{ gridColumn: "11 / 13", gridRow: "2 / 3", padding: 28 }}
          >
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(26,111,255,0.12)",
                border: "1px solid rgba(26,111,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Target size={18} style={{ color: "#1A6FFF" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 48, letterSpacing: "-0.04em", lineHeight: 1, color: "#1A6FFF" }}>
                  <Counter to={98} suffix="%" />
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Couverture EU
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ── CARD 8: UCL TEAM OF THE WEEK (Broadcast Style) ─── */}
          <GlassCard
            glowColor="rgba(0, 229, 255, 0.4)"
            style={{ 
              gridColumn: "1 / 7",  
              gridRow: "3 / 5",
              padding: 0,
              cursor: "pointer",
              background: "linear-gradient(135deg, #000B29 0%, #002266 100%)", 
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontFamily: "'Rajdhani', sans-serif",
              overflow: "visible", // Set to visible so logo can 'pop' out
              position: "relative",
              backdropFilter: "blur(12px)",
            }}
            onClick={() => setLocation("/ldc")}
          >
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", height: "100%", position: "relative", zIndex: 10 }}>
              
              {/* Header with Direct Official Logo - Pure UEFA Glow */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "0 8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Official UCL Logo - No square, directly on blue with MAX brightness and BIG presence */}
                  <div style={{
                    width: 65, height: 65, 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    filter: "drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))"
                  }}>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/fr/b/bf/UEFA_Champions_League_logo_2.svg" 
                      alt="UCL" 
                      style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(0) invert(1)" }} // ABSOLUTE WHITE
                    />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontSize: 38, color: "white", 
                      fontFamily: "'Saira Extra Condensed', sans-serif", fontWeight: 800,
                      letterSpacing: "0.01em",
                      textTransform: "uppercase", margin: 0, lineHeight: 0.85,
                      textShadow: "0 4px 15px rgba(0,0,0,0.4)"
                    }}>
                      Équipe de la Semaine
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#00E5FF", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'Oswald', sans-serif" }}>
                        Champions League 2025/26
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Pitch Container with Exact Official Background - No filter */}
              <div style={{ 
                flex: 1, position: "relative", minHeight: 460, marginTop: 10, 
                backgroundImage: `url("https://editorial.uefa.com/resources/028c-1a7337f7f34c-6a7e0a8d6b9d-1000/ucl_kv_2024-25_16x9.jpg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderRadius: 16, overflow: "hidden", 
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
                fontFamily: "'Montserrat', sans-serif"
              }}>
                {/* Grass texture / Glow effect */}
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
                
                {/* UCL Watermark */}
                <div style={{ 
                  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", 
                  width: "50%", opacity: 0.05, pointerEvents: "none", zIndex: 0 
                }}>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/07/UEFA_Champions_League_Starsball.svg" 
                    alt="" 
                    style={{ width: "100%", filter: "brightness(10)" }} 
                  />
                </div>

                {/* Tactical Lines */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
                  <rect x="0" y="0" width="100" height="100" fill="none" stroke="#fff" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#fff" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="12" stroke="#fff" strokeWidth="0.5" fill="none" />
                  <rect x="25" y="0" width="50" height="15" stroke="#fff" strokeWidth="0.5" fill="none" />
                  <rect x="25" y="85" width="50" height="15" stroke="#fff" strokeWidth="0.5" fill="none" />
                </svg>

                {/* Professional Player Rendering */}
                {(() => {
                  const all = players.slice(0, 11);
                  if (all.length === 0) return (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)" }}>
                      Chargement des données SofaScore...
                    </div>
                  );
                  const isYamal = (p: any) => p.Player?.toLowerCase().includes("yamal");
                  const attackers = all.filter(p => isYamal(p) || ["F", "FW", "W", "S", "A", "ATT"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag))).slice(0, 3);
                  const defenders = all.filter(p => !attackers.includes(p) && ["D", "DF", "B", "DEF"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag))).slice(0, 4);
                  const goalies = all.filter(p => !attackers.includes(p) && !defenders.includes(p) && ["G", "GK", "K"].some(tag => p.Pos?.toUpperCase() === tag || p.Pos?.toUpperCase().includes(tag))).slice(0, 1);
                  const mid = all.filter(p => !attackers.includes(p) && !defenders.includes(p) && !goalies.includes(p));

                  const finalFw = [...attackers];
                  const finalDf = [...defenders];
                  const finalGk = goalies[0] || null;
                  const finalMf = [...mid.slice(0, 3)];

                  const usedIdx = new Set([...finalFw, ...finalMf, ...finalDf, finalGk].filter(Boolean).map(p => all.indexOf(p)));
                  const remaining = all.filter((_, i) => !usedIdx.has(i));

                  while (finalFw.length < 3 && remaining.length > 0) finalFw.push(remaining.shift());
                  while (finalMf.length < 3 && remaining.length > 0) finalMf.push(remaining.shift());
                  while (finalDf.length < 4 && remaining.length > 0) finalDf.push(remaining.shift());
                  const safeGk = finalGk || remaining.shift() || all[0];

                  const yamalIdx = finalFw.findIndex(p => isYamal(p));
                  if (yamalIdx !== -1 && yamalIdx !== 2) {
                    const temp = finalFw[2];
                    finalFw[2] = finalFw[yamalIdx];
                    finalFw[yamalIdx] = temp;
                  }

                  return (
                    <div style={{ position: "absolute", inset: 0 }}>
                      <UCLPlayerCard player={finalFw[0]} top="12%" left="15%" />
                      <UCLPlayerCard player={finalFw[1]} top="7%" left="45%" />
                      <UCLPlayerCard player={finalFw[2]} top="12%" left="75%" />

                      <UCLPlayerCard player={finalMf[0]} top="39%" left="20%" />
                      <UCLPlayerCard player={finalMf[1]} top="34%" left="45%" />
                      <UCLPlayerCard player={finalMf[2]} top="39%" left="70%" />

                      <UCLPlayerCard player={finalDf[0]} top="65%" left="10%" />
                      <UCLPlayerCard player={finalDf[1]} top="61%" left="33%" />
                      <UCLPlayerCard player={finalDf[2]} top="61%" left="57%" />
                      <UCLPlayerCard player={finalDf[3]} top="65%" left="80%" />

                      <UCLPlayerCard player={safeGk} top="81%" left="45%" />
                    </div>
                  );
                })()}
              </div>
            </div>
          </GlassCard>


          {/* ── CARD 9: News ─────────────────────── */}

          <GlassCard
            style={{ gridColumn: "7 / 13", gridRow: "3 / 4", padding: 24 }}
          >

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Newspaper size={13} style={{ color: "#E8344A" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Actualités</span>
              <span style={{
                marginLeft: "auto", fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                color: "#E8344A", background: "rgba(232,52,74,0.1)", border: "1px solid rgba(232,52,74,0.2)",
                padding: "2px 8px", borderRadius: 100, letterSpacing: "0.1em",
              }}>Live</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {news.slice(0, 3).map((n: any, i: number) => (
                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    transition: "padding-left 0.2s ease",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = "6px"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.paddingLeft = "0"}
                  >
                    <div style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#E8344A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
                      {n.source || "Football"}
                    </div>
                    <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, lineHeight: 1.4, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {n.title}
                    </div>
                  </div>
                </a>
              ))}
              {news.length === 0 && [...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <div style={{ height: 10, width: "25%", borderRadius: 3, marginBottom: 6 }} className="shimmer" />
                  <div style={{ height: 13, width: "85%", borderRadius: 3 }} className="shimmer" />
                </div>
              ))}
            </div>
          </GlassCard>


          {/* ── LEAGUES ROW (5 Widgets) ────────────────── */}
          <div style={{ gridColumn: "1 / 13", marginTop: 12 }}>
             <h2 style={{ 
               fontFamily: "'Barlow Condensed', sans-serif", 
               fontSize: 14, 
               fontWeight: 800, 
               letterSpacing: "0.15em", 
               textTransform: "uppercase", 
               color: "rgba(255,255,255,0.4)", 
               marginBottom: 16, 
               display: "flex", 
               alignItems: "center", 
               gap: 10,
               paddingLeft: 4
             }}>
               <Globe size={14} style={{ color: "#E8344A" }} /> Championnats Majeurs
             </h2>
             <div style={{ 
               display: "grid", 
               gridTemplateColumns: "repeat(5, 1fr)", 
               gap: 12,
             }} className="leagues-container">
                <LeagueWidget
                  name="Premier League"
                  logo="https://a.espncdn.com/i/leaguelogos/soccer/500/23.png"
                  color="#3D195B"
                  leader={plStandings[0]?.team || "Liverpool"}
                  points={plStandings[0]?.points || 67}
                  topScorer="M. Salah"
                  goals={18}
                  standings={plStandings}
                  onClick={() => setLocation("/league/eng Premier League")}
                />
                <LeagueWidget
                  name="Ligue 1"
                  logo="https://r2.thesportsdb.com/images/media/league/badge/9f7z9d1742983155.png"
                  color="#DAE025"
                  leader={l1Standings[0]?.team || "PSG"}
                  points={l1Standings[0]?.points || 59}
                  topScorer="B. Barcola"
                  goals={15}
                  standings={l1Standings}
                  onClick={() => setLocation("/league/fr Ligue 1")}
                />
                <LeagueWidget
                  name="La Liga"
                  logo="https://a.espncdn.com/i/leaguelogos/soccer/500/15.png"
                  color="#EE1C23"
                  leader={llStandings[0]?.team || "Real Madrid"}
                  points={llStandings[0]?.points || 75}
                  topScorer="R. Lewandowski"
                  goals={21}
                  standings={llStandings}
                  onClick={() => setLocation("/league/esp La Liga")}
                />
                <LeagueWidget
                  name="Bundesliga"
                  logo="https://a.espncdn.com/i/leaguelogos/soccer/500/10.png"
                  color="#D3010C"
                  leader="Bayer Leverkusen"
                  points={63}
                  topScorer="H. Kane"
                  goals={24}
                  onClick={() => setLocation("/league/de Bundesliga")}
                />
                <LeagueWidget
                  name="Serie A"
                  logo="https://a.espncdn.com/i/leaguelogos/soccer/500/12.png"
                  color="#0032A0"
                  leader={saStandings[0]?.team || "Inter Milan"}
                  points={saStandings[0]?.points || 82}
                  topScorer="L. Martínez"
                  goals={23}
                  standings={saStandings}
                  onClick={() => setLocation("/league/it Serie A")}
                />
             </div>
          </div>

        </motion.div>

        {/* ── Data sources ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginTop: 52, flexWrap: "wrap", opacity: 0.18 }}
        >
          {["FBref", "Opta", "Transfermarkt", "SofaScore", "ESPN"].map(src => (
            <span key={src} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>{src}</span>
          ))}
        </motion.div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: repeat(6, 1fr) !important; }
        }
        @media (max-width: 1200px) {
          .leagues-container { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .leagues-container { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .leagues-container { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
