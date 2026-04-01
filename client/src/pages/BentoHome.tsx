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
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      style={{
        position: "absolute", top, left, transform: "translate(-50%, -50%)",
        display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10,
        cursor: "pointer"
      }}
    >
      <div style={{ 
        position: "relative",
        width: 65, height: 75,
        background: "linear-gradient(135deg, #003399 0%, #001A4D 100%)",
        border: "1.5px solid #00FFCC",
        clipPath: "polygon(10% 0, 90% 0, 100% 20%, 100% 80%, 90% 100%, 10% 100%, 0 80%, 0 20%)", // Sharper style
        boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden"
      }}>
        {/* Team mini logo */}
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 5,
          width: 18, height: 18, background: "#fff", borderRadius: "50%",
          padding: 2, border: "1px solid #001A4D"
        }}>
           <PlayerAvatar playerName="" teamName={player.Squad} size="sm" />
        </div>
        
        <PlayerAvatar
          playerName={player.Player || ""}
          teamName={player.Squad}
          sofaId={player.sofaId}
          size="lg"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Name Label */}
      <div style={{
        marginTop: -10,
        background: "#fff",
        color: "#001A4D",
        padding: "2px 8px",
        minWidth: 80,
        textAlign: "center",
        fontSize: 10,
        fontFamily: "'Roboto Condensed', sans-serif",
        fontWeight: 900,
        textTransform: "uppercase",
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        zIndex: 5,
        clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" // Official slanted look
      }}>
        {player.Player?.split(" ").pop() || "NAME"}
      </div>
    </motion.div>
  );
};

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
    { href: "/teams", label: "Équipes" },
    { href: "/leagues", label: "Ligues" },
    { href: "/matches-live", label: "Direct" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        top: 16, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        width: "calc(100% - 48px)",
        maxWidth: 1100,
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

          {/* ── CARD 1: Team of the Week (large) ── */}
          <GlassCard
            glowColor="rgba(245,200,66,0.3)"
            style={{ gridColumn: "1 / 6", gridRow: "1 / 3", padding: 0, overflow: "hidden", minHeight: 440, display: "flex", flexDirection: "column" }}
          >
            {/* Background gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(245,200,66,0.12) 0%, rgba(10,30,10,0.4) 100%)",
              pointerEvents: "none", zIndex: 0,
            }} />
            
            {/* Header */}
            <div style={{ padding: "26px 26px 0", position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Star size={14} style={{ color: "#F5C842" }} />
                  <span style={{ fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#F5C842" }}>
                    Équipe de la Semaine
                  </span>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 100, background: "rgba(245,200,66,0.15)", border: "1px solid rgba(245,200,66,0.3)",
                  fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#F5C842", letterSpacing: "0.1em"
                }}>
                  4-3-3
                </div>
              </div>
            </div>

            {/* Field */}
            <div style={{
              position: "relative",
              flex: 1,
              margin: "20px 24px 24px",
              borderRadius: 16,
              background: "linear-gradient(180deg, rgba(20,50,20,0.6) 0%, rgba(10,35,10,0.6) 50%, rgba(20,50,20,0.6) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}>
              <FieldLines />
              {players.length >= 11 ? (
                <>
                  <PlayerToken player={fws[0]} top="15%" left="22%" onClick={() => setLocation(`/joueur/${encodeURIComponent(fws[0]?.Player)}`)} />
                  <PlayerToken player={fws[1]} top="12%" left="50%" onClick={() => setLocation(`/joueur/${encodeURIComponent(fws[1]?.Player)}`)} />
                  <PlayerToken player={fws[2]} top="15%" left="78%" onClick={() => setLocation(`/joueur/${encodeURIComponent(fws[2]?.Player)}`)} />
                  
                  <PlayerToken player={mfs[0]} top="39%" left="26%" onClick={() => setLocation(`/joueur/${encodeURIComponent(mfs[0]?.Player)}`)} />
                  <PlayerToken player={mfs[1]} top="36%" left="50%" onClick={() => setLocation(`/joueur/${encodeURIComponent(mfs[1]?.Player)}`)} />
                  <PlayerToken player={mfs[2]} top="39%" left="74%" onClick={() => setLocation(`/joueur/${encodeURIComponent(mfs[2]?.Player)}`)} />
                  
                  <PlayerToken player={dfs[0]} top="65%" left="15%" onClick={() => setLocation(`/joueur/${encodeURIComponent(dfs[0]?.Player)}`)} />
                  <PlayerToken player={dfs[1]} top="62%" left="38%" onClick={() => setLocation(`/joueur/${encodeURIComponent(dfs[1]?.Player)}`)} />
                  <PlayerToken player={dfs[2]} top="62%" left="62%" onClick={() => setLocation(`/joueur/${encodeURIComponent(dfs[2]?.Player)}`)} />
                  <PlayerToken player={dfs[3]} top="65%" left="85%" onClick={() => setLocation(`/joueur/${encodeURIComponent(dfs[3]?.Player)}`)} />
                  
                  <PlayerToken player={gk}    top="87%" left="50%" onClick={() => setLocation(`/joueur/${encodeURIComponent(gk?.Player)}`)} />
                </>
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <div className="shimmer" style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(245,200,66,0.1)" }} />
                </div>
              )}
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

          {/* ── CARD 8: UCL Team of the Week (Official DA) ─────── */}
          <GlassCard
            glowColor="rgba(0, 102, 255, 0.45)"
            style={{ 
              gridColumn: "1 / 7", 
              gridRow: "3 / 5",
              padding: 0,
              background: "#001e4d",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              overflow: "hidden",
              position: "relative"
            }}
          >
            {/* Official UCL Chevron Beam Background */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.2,
              background: `
                repeating-linear-gradient(125deg, transparent, transparent 60px, rgba(0, 85, 255, 0.15) 60px, rgba(0, 85, 255, 0.15) 120px),
                linear-gradient(180deg, #001e4d 0%, #003399 100%)
              `,
              pointerEvents: "none"
            }} />
            
            {/* Animated Glow over the pitch */}
            <div style={{
              position: "absolute", bottom: "-10%", left: 0, right: 0, height: "80%",
              background: "radial-gradient(ellipse at 50% 100%, rgba(0,255,204,0.12) 0%, transparent 75%)",
              pointerEvents: "none"
            }} />

            {/* Official Header Area inspired by Image */}
            <div style={{ 
              padding: "24px 28px", 
              display: "flex", 
              alignItems: "center", 
              gap: 20,
              position: "relative",
              zIndex: 5,
              background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)"
            }}>
              {/* UCL Logo */}
              <div style={{ width: 60, height: 60 }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 L54 36 L90 32 L65 54 L78 88 L50 67 L22 88 L35 54 L10 32 L46 36 L50 0 Z" fill="white" opacity="0.9" />
                  <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
                </svg>
              </div>

              {/* Crypto.com-like partner slot (optional, but adds "official" feel) */}
              <div style={{ width: 1, height: 50, background: "rgba(255,255,255,0.2)" }} />
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontFamily: "'Barlow Condensed', sans-serif", 
                  fontWeight: 900, 
                  fontSize: 42, 
                  color: "#fff", 
                  textTransform: "uppercase", 
                  lineHeight: 0.85,
                  letterSpacing: "-0.01em",
                  display: "flex",
                  flexDirection: "column",
                  transform: "scaleY(1.1)", /* Makes it more condensed like the image */
                  transformOrigin: "left center"
                }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    ÉQUIPE <span style={{ fontSize: 16, fontWeight: 300, verticalAlign: "middle", letterSpacing: "0.1em" }}>DE LA</span>
                  </div>
                  <div>SEMAINE</div>
                </div>
              </div>
              
              {/* UCL Starball Graphic small */}
              <div style={{ width: 50, height: 50, opacity: 0.6 }}>
                 <svg viewBox="0 0 100 100" opacity="0.8">
                   <path d="M50 20 L53 38 L72 38 L57 48 L62 66 L50 56 L38 66 L43 48 L28 38 L47 38 Z" fill="#00FFCC" />
                 </svg>
              </div>
            </div>

            {/* Tactical Field Container */}
            <div style={{ 
              position: "relative", 
              height: 520, 
              margin: "0 24px 28px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "2px",
              border: "1.5px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}>
              {/* Official UCL Pitch markings */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}>
                <rect x="2" y="2" width="96" height="96" fill="none" stroke="#fff" strokeWidth="0.4" />
                <line x1="2" y1="50" x2="98" y2="50" stroke="#fff" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#fff" strokeWidth="0.5" />
                <rect x="22" y="2" width="56" height="18" fill="none" stroke="#fff" strokeWidth="0.4" />
                <rect x="22" y="80" width="56" height="18" fill="none" stroke="#fff" strokeWidth="0.4" />
                {/* Tactical Star markers */}
                <circle cx="50" cy="50" r="1" fill="#fff" />
              </svg>

              {/* Player Deployment (4-3-3 format) */}
              {players.length >= 11 ? (
                <>
                   {/* FORWARDS */}
                   <UCLPlayerCard player={fws[0]} top="12%" left="22%" />
                   <UCLPlayerCard player={fws[1]} top="8%" left="50%" />
                   <UCLPlayerCard player={fws[2]} top="12%" left="78%" />

                   {/* MIDFIELDERS */}
                   <UCLPlayerCard player={mfs[0]} top="42%" left="25%" />
                   <UCLPlayerCard player={mfs[1]} top="38%" left="50%" />
                   <UCLPlayerCard player={mfs[2]} top="42%" left="75%" />

                   {/* DEFENDERS */}
                   <UCLPlayerCard player={dfs[2]} top="64%" left="62%" />
                   <UCLPlayerCard player={dfs[3]} top="68%" left="85%" />

                   {/* GOALKEEPER */}
                   <UCLPlayerCard player={gk} top="88%" left="50%" />
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <div className="shimmer" style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                </div>
              )}
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

          {/* ── CARD 10: CTA Explorer ────────────── */}
          <GlassCard
            glowColor="rgba(232,52,74,0.3)"
            style={{ gridColumn: "1 / 7", gridRow: "5 / 6", padding: 32, background: "rgba(232,52,74,0.08)" }}
            onClick={() => setLocation("/dashboard")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, textTransform: "uppercase", letterSpacing: "0.01em", marginBottom: 6 }}>
                  Explorer les données
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>2 800+ joueurs · 42 métriques · Saison 2025/26</div>
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "#E8344A",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(232,52,74,0.5)",
                  flexShrink: 0,
                }}
              >
                <ArrowUpRight size={22} />
              </motion.div>
            </div>
          </GlassCard>

          {/* ── CARD 11: CTA Matches ─────────────── */}
          <GlassCard
            style={{ gridColumn: "7 / 13", gridRow: "5 / 6", padding: 32 }}
            onClick={() => setLocation("/matches")}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, textTransform: "uppercase", letterSpacing: "0.01em", marginBottom: 6 }}>
                  Analyser les matchs
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Prédictions · Historique · Live stats</div>
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Activity size={22} />
              </motion.div>
            </div>
          </GlassCard>

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
        @media (max-width: 640px) {
          .bento-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
