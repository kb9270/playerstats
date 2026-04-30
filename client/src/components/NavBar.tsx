import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/",            label: "Joueurs" },
  { href: "/comparison",  label: "Comparaison" },
  { href: "/scout",       label: "🎯 Scout" },
  { href: "/pipeline",    label: "⚙️ Pipeline" },
  { href: "/ldc",         label: "🏆 LDC" },
  { href: "/matches-live",label: "Direct" },
];

export default function NavBar() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setOpen(false); }, [location]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 16, left: "50%",
          zIndex: 200,
          width: "calc(100% - 48px)",
          maxWidth: 1200,
          background: scrolled ? "rgba(6,6,18,0.92)" : "rgba(6,6,18,0.6)",
          backdropFilter: "blur(24px) saturate(1.8)",
          WebkitBackdropFilter: "blur(24px) saturate(1.8)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: "0 20px",
          transition: "background 0.35s ease",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #E8344A, #c9253d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
              fontSize: 13, color: "#fff", boxShadow: "0 4px 12px rgba(232,52,74,0.4)",
              flexShrink: 0,
            }}>PS</div>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 16, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase",
            }}>
              Player<span style={{ color: "#E8344A" }}>Stats</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
            {NAV_LINKS.map(item => {
              const active = item.href === "/"
                ? location === "/"
                : location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "6px 13px", borderRadius: 10,
                    fontSize: 13, fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    color: active ? "#fff" : "rgba(255,255,255,0.48)",
                    background: active ? "rgba(255,255,255,0.1)" : "transparent",
                    transition: "all 0.2s ease", cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.48)"; }}
                  >
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Live pill */}
          <Link href="/matches-live" style={{ textDecoration: "none" }} className="hidden-mobile">
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 14px",
              background: "rgba(232,52,74,0.12)",
              border: "1px solid rgba(232,52,74,0.3)",
              borderRadius: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: 12, color: "#E8344A",
              letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#E8344A", boxShadow: "0 0 8px rgba(232,52,74,0.8)",
                animation: "pulse-dot 1.2s ease-in-out infinite",
                flexShrink: 0,
              }} />
              Live
            </div>
          </Link>

          {/* Mobile burger */}
          <button
            className="show-mobile"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 6 }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", paddingBottom: 12 }}
            >
              {NAV_LINKS.map(item => {
                const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "10px 8px", fontSize: 14,
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      color: active ? "#E8344A" : "rgba(255,255,255,0.6)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer so content doesn't hide under fixed nav */}
      <div style={{ height: 80 }} />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
