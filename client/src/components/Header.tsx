import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { BarChart3, Users, Trophy, Activity, Menu, X, Globe } from "lucide-react";

const navItems = [
  { path: "/", label: "Joueurs", icon: Users },
  { path: "/comparison", label: "Comparaison", icon: BarChart3 },
  { path: "/teams", label: "Équipes", icon: Trophy },
  { path: "/leagues", label: "Ligues", icon: Globe },
  { path: "/matches-live", label: "Direct", icon: Activity },
];

export default function Header() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: scrolled ? "1px solid rgba(232,52,74,0.15)" : "1px solid transparent",
        background: scrolled
          ? "rgba(8, 11, 30, 0.92)"
          : "rgba(8, 11, 30, 0.0)",
        backdropFilter: scrolled ? "blur(24px) saturate(1.6)" : "none",
        transition: "background 0.4s ease, border-color 0.4s ease, backdrop-filter 0.4s ease",
      }}
    >
      {/* WC26 top accent bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: "linear-gradient(90deg, #E8344A 0%, rgba(26,111,255,0.6) 60%, transparent 100%)",
        opacity: scrolled ? 1 : 0,
        transition: "opacity 0.4s ease",
      }} />

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              {/* WC26-style logo accent */}
              <div style={{
                width: 28,
                height: 28,
                background: "var(--c-accent)",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 14,
                color: "#fff",
                letterSpacing: "-0.02em",
                flexShrink: 0,
              }}>
                PS
              </div>
              <div>
                <span style={{
                  display: "block",
                  fontSize: 16,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}>
                  Player<span style={{ color: "var(--c-accent)" }}>Stats</span>
                </span>
                <span style={{
                  display: "block",
                  fontSize: 9,
                  color: "var(--c-text-3)",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  textTransform: "uppercase",
                  marginTop: 1,
                }}>
                  Analytics · 2025/26
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 36 }} className="hidden-mobile">
            {navItems.map(item => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link${active ? " active" : ""}`}
                  style={{ textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Live CTA */}
          <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/matches-live" style={{ textDecoration: "none" }}>
              <button style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "0 16px",
                height: 36,
                background: "rgba(232,52,74,0.1)",
                color: "var(--c-accent)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 12,
                border: "1px solid rgba(232,52,74,0.3)",
                borderRadius: "3px",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,52,74,0.2)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,52,74,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,52,74,0.1)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,52,74,0.3)";
              }}
              >
                <span className="live-dot" />
                Live
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="show-mobile"
            onClick={() => setOpen(!open)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--c-text-2)",
              padding: 6,
            }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div style={{
          background: "rgba(8,11,30,0.97)",
          borderTop: "1px solid rgba(232,52,74,0.2)",
          padding: "12px 24px 20px",
          animation: "slide-down 0.25s var(--ease-out) both",
          backdropFilter: "blur(20px)",
        }}>
          {navItems.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  color: active ? "var(--c-accent)" : "var(--c-text-2)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  transition: "color 0.15s ease",
                }}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: flex !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
