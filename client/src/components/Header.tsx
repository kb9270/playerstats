import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { BarChart3, Users, Trophy, Activity, Menu, X } from "lucide-react";

const navItems = [
  { path: "/", label: "Joueurs", icon: Users },
  { path: "/comparison", label: "Comparaison", icon: BarChart3 },
  { path: "/teams", label: "Équipes", icon: Trophy },
  { path: "/leagues", label: "Ligues", icon: Trophy },
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
        borderBottom: `1px solid ${scrolled ? "rgba(255,255,255,0.09)" : "transparent"}`,
        background: scrolled
          ? "rgba(10,10,15,0.82)"
          : "rgba(10,10,15,0.0)",
        backdropFilter: scrolled ? "blur(20px) saturate(1.5)" : "none",
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1,
              }}>
                Player<span style={{ color: "var(--c-accent)" }}>Stats</span>
              </span>
              <span style={{ fontSize: 10, color: "var(--c-text-3)", fontWeight: 500, letterSpacing: "0.05em" }}>
                ANALYTICS
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
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

          {/* CTA */}
          <div className="hidden-mobile">
            <Link href="/matches-live" style={{ textDecoration: "none" }}>
              <button className="btn-ghost" style={{ fontSize: 12 }}>
                <span style={{ width: 6, height: 6, background: "var(--c-accent)", borderRadius: "50%", display: "inline-block" }} />
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
          background: "var(--c-surface)",
          borderTop: "1px solid var(--c-border)",
          padding: "12px 24px 20px",
          animation: "slide-down 0.25s var(--ease-out) both",
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
                  borderBottom: "1px solid var(--c-border)",
                  color: active ? "var(--c-accent)" : "var(--c-text-2)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
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
