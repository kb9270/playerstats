import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import NewsWidget from "@/components/widgets/NewsWidget";
import TeamOfTheWeekWidget from "@/components/widgets/TeamOfTheWeekWidget";
import RankingWidget from "@/components/widgets/RankingWidget";
import LiveMatchesWidget from "@/components/widgets/LiveMatchesWidget";
import {
  BarChart3,
  Users,
  Trophy,
  ArrowUpRight,
  ChevronRight,
  Zap,
  Globe,
} from "lucide-react";

/* ── Animated counter ───────────────────────────────────── */
function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
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
  return <span ref={ref}>{val.toLocaleString("fr-FR")}</span>;
}

/* ── Feature card ───────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  body,
  href,
  delay,
  accentColor = "var(--c-accent)",
}: {
  icon: any;
  title: string;
  body: string;
  href: string;
  delay?: string;
  accentColor?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="glass-card hover-lift animate-fade-up"
        style={{
          padding: "28px 24px",
          cursor: "pointer",
          animationDelay: delay,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "100%",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
        }} />

        <div style={{
          width: 42, height: 42,
          background: `rgba(232,52,74,0.1)`,
          border: `1px solid rgba(232,52,74,0.2)`,
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={19} style={{ color: accentColor }} />
        </div>
        <div>
          <h3 style={{
            fontSize: 17,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            color: "var(--c-text-1)",
            margin: "0 0 8px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>{title}</h3>
          <p style={{
            fontSize: 13,
            color: "var(--c-text-3)",
            lineHeight: 1.6,
            margin: 0,
            fontFamily: "'Barlow', sans-serif",
          }}>{body}</p>
        </div>
        <div style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
          color: "var(--c-accent)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}>
          Explorer <ChevronRight size={13} />
        </div>
      </div>
    </Link>
  );
}

/* ── Stat pill ──────────────────────────────────────────── */
function StatPill({ value, label, accent = false }: { value: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
      padding: "22px 28px",
      background: accent ? "rgba(232,52,74,0.08)" : "rgba(13,17,40,0.8)",
      borderRadius: "var(--radius-md)",
      border: `1px solid ${accent ? "rgba(232,52,74,0.25)" : "rgba(255,255,255,0.06)"}`,
      textAlign: "center",
      flex: 1,
      backdropFilter: "blur(12px)",
      position: "relative",
      overflow: "hidden",
    }}>
      {accent && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "var(--c-accent)",
        }} />
      )}
      <span style={{
        fontSize: 32,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900,
        color: accent ? "var(--c-accent)" : "var(--c-text-1)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontSize: 10,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        color: "var(--c-text-3)",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}>{label}</span>
    </div>
  );
}

/* ── Home page ──────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", position: "relative" }}>
      <Header />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px 88px",
        textAlign: "center",
      }}>
        {/* WC26 background decoration */}
        {/* Large diagonal red beam */}
        <div style={{
          position: "absolute",
          top: -200, left: -100,
          width: 700, height: 700,
          background: "radial-gradient(ellipse, rgba(232,52,74,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        {/* Blue counter-beam */}
        <div style={{
          position: "absolute",
          bottom: -100, right: -50,
          width: 500, height: 500,
          background: "radial-gradient(ellipse, rgba(26,111,255,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        {/* Diagonal geometric lines */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(65deg, transparent 0, transparent 60px, rgba(232,52,74,0.025) 60px, rgba(232,52,74,0.025) 62px)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>
          {/* Badge */}
          <div className="animate-fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px 5px 10px",
            background: "rgba(232,52,74,0.1)",
            border: "1px solid rgba(232,52,74,0.3)",
            borderRadius: "3px",
            marginBottom: 32,
          }}>
            <div style={{
              width: 6, height: 6,
              background: "var(--c-accent)",
              borderRadius: "50%",
              animation: "pulse-dot 1s ease-in-out infinite",
            }} />
            <span style={{
              fontSize: 11,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              color: "var(--c-accent)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}>
              Saison 2025–2026 · Live Data
            </span>
          </div>

          {/* Title */}
          <h1 className="animate-fade-up delay-75" style={{
            fontSize: "clamp(52px, 8vw, 96px)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            letterSpacing: "-0.01em",
            lineHeight: 0.95,
            color: "var(--c-text-1)",
            margin: "0 0 24px",
            textTransform: "uppercase",
          }}>
            L'Analyse<br />
            Football{" "}
            <span style={{
              color: "var(--c-accent)",
              display: "block",
            }}>Réinventée.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up delay-150" style={{
            fontSize: 16,
            fontFamily: "'Barlow', sans-serif",
            color: "var(--c-text-2)",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: "0 auto 44px",
            fontWeight: 400,
          }}>
            Plus de <strong style={{ color: "var(--c-text-1)", fontWeight: 600 }}>2 800 joueurs</strong> européens, des modèles prédictifs avancés et des statistiques en temps réel pour la saison 2025–2026.
          </p>

          {/* Search */}
          <div className="animate-fade-up delay-225" style={{ maxWidth: 580, margin: "0 auto 44px" }}>
            <SearchBar />
          </div>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-300" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button className="btn-primary">
                Explorer les données
                <ArrowUpRight size={15} />
              </button>
            </Link>
            <Link href="/matches" style={{ textDecoration: "none" }}>
              <button className="btn-ghost">
                Analyser les matchs
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}>
          <StatPill value={<Counter to={2800} />} label="Joueurs analysés" accent />
          <StatPill value={<Counter to={5} />} label="Ligues majeures" />
          <StatPill value={<Counter to={42} />} label="Métriques distinctes" />
          <StatPill value={<><Counter to={98} duration={1200} />%</>} label="Couverture Europe" />
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────── */}
      <section style={{ padding: "0 24px 88px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div className="wc26-line" />
            <p className="section-label" style={{ margin: 0 }}>Fonctionnalités</p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 12,
          }}>
            <FeatureCard
              icon={Users}
              title="Profils Joueurs"
              body="Statistiques détaillées, percentiles, carte de chaleur et analyse IA pour chaque joueur."
              href="/"
              delay="0ms"
            />
            <FeatureCard
              icon={BarChart3}
              title="Comparaison Pro"
              body="Algorithme de similarité avancé basé sur 42 métriques pour trouver des profils équivalents."
              href="/comparison"
              delay="60ms"
            />
            <FeatureCard
              icon={Trophy}
              title="Ligues & Équipes"
              body="Classements en direct, effectifs détaillés et suivi des performances de club."
              href="/leagues"
              delay="120ms"
              accentColor="var(--c-gold)"
            />
            <FeatureCard
              icon={Zap}
              title="Direct Live"
              body="Scores en temps réel, minutes jouées et statistiques match par match."
              href="/matches-live"
              delay="180ms"
            />
          </div>
        </div>
      </section>

      {/* ── Widgets grid ─────────────────────────────────── */}
      <section style={{ padding: "0 24px 88px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div className="wc26-line" />
            <p className="section-label" style={{ margin: 0 }}>Tableau de bord</p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              alignItems: "start",
            }}
            className="widgets-grid"
          >
            {/* Column 1 – TOTW */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TeamOfTheWeekWidget />
            </div>

            {/* Column 2 – Live + Ranking */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <LiveMatchesWidget />
              <RankingWidget />
            </div>

            {/* Column 3 – News */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <NewsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────── */}
      <section style={{
        borderTop: "1px solid rgba(232,52,74,0.1)",
        padding: "44px 24px",
        background: "rgba(13,17,40,0.5)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <p className="section-label" style={{ marginBottom: 28 }}>Sources de données</p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
            opacity: 0.28,
          }}>
            {["FBref", "Opta", "Transfermarkt", "Wyscout", "ESPN", "SofaScore"].map(src => (
              <span key={src} style={{
                fontSize: 13,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                color: "var(--c-text-1)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>{src}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Responsive grid fix */}
      <style>{`
        @media (max-width: 1024px) { .widgets-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 640px)  { .widgets-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
