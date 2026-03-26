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
}: {
  icon: any;
  title: string;
  body: string;
  href: string;
  delay?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="glass-card hover-lift animate-fade-up"
        style={{
          padding: "28px",
          cursor: "pointer",
          animationDelay: delay,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          height: "100%",
        }}
      >
        <div style={{
          width: 44, height: 44,
          background: "var(--c-accent-dim)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={20} style={{ color: "var(--c-accent)" }} />
        </div>
        <div>
          <h3 style={{
            fontSize: 15,
            fontWeight: 650,
            color: "var(--c-text-1)",
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}>{title}</h3>
          <p style={{
            fontSize: 13,
            color: "var(--c-text-3)",
            lineHeight: 1.6,
            margin: 0,
          }}>{body}</p>
        </div>
        <div style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          fontWeight: 600,
          color: "var(--c-accent)",
        }}>
          Explorer <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}

/* ── Stat pill ──────────────────────────────────────────── */
function StatPill({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "20px 28px",
      background: "var(--c-surface-2)",
      borderRadius: 16,
      border: "1px solid var(--c-border)",
      textAlign: "center",
      flex: 1,
    }}>
      <span style={{
        fontSize: 26,
        fontWeight: 700,
        color: "var(--c-text-1)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>{value}</span>
      <span style={{ fontSize: 11, color: "var(--c-text-3)", fontWeight: 500, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

/* ── Home page ──────────────────────────────────────────── */
export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)" }}>
      <Header />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "96px 24px 80px",
        textAlign: "center",
      }}>
        {/* Decorative orbs */}
        <div className="orb" style={{
          width: 560, height: 560,
          background: "var(--c-accent)",
          top: -200, left: "50%",
          transform: "translateX(-50%)",
        }} />
        <div className="orb" style={{
          width: 300, height: 300,
          background: "#4f8ef7",
          bottom: -80, right: "10%",
          opacity: 0.1,
        }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          {/* Badge */}
          <div className="animate-fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 14px",
            background: "var(--c-accent-dim)",
            border: "1px solid rgba(232,68,90,0.2)",
            borderRadius: 999,
            marginBottom: 28,
          }}>
            <Zap size={12} style={{ color: "var(--c-accent)" }} />
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--c-accent)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}>
              Saison 2025–2026 · Live Data
            </span>
          </div>

          {/* Title */}
          <h1 className="animate-fade-up delay-75" style={{
            fontSize: "clamp(36px, 6vw, 68px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            color: "var(--c-text-1)",
            margin: "0 0 20px",
          }}>
            L'analyse football<br />
            <span style={{ color: "var(--c-accent)" }}>réinventée.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up delay-150" style={{
            fontSize: 16,
            color: "var(--c-text-2)",
            lineHeight: 1.7,
            maxWidth: 480,
            margin: "0 auto 40px",
          }}>
            Plus de <strong style={{ color: "var(--c-text-1)" }}>2 800 joueurs</strong> européens, des modèles prédictifs avancés et des statistiques en temps réel.
          </p>

          {/* Search */}
          <div className="animate-fade-up delay-225" style={{ maxWidth: 560, margin: "0 auto 40px" }}>
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
      <section style={{ padding: "0 24px 72px" }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <StatPill value={<Counter to={2800} />} label="Joueurs analysés" />
          <StatPill value={<Counter to={5} />} label="Ligues majeures" />
          <StatPill value={<Counter to={42} />} label="Métriques distinctes" />
          <StatPill value={<Counter to={98} duration={1200} />} label="% couverture Europe" />
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="section-label animate-fade-up" style={{ marginBottom: 20 }}>Fonctionnalités</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
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
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <p className="section-label animate-fade-up" style={{ marginBottom: 20 }}>Tableau de bord</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
            alignItems: "start",
          }}
            className="widgets-grid"
          >
            {/* Column 1 – TOTW */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TeamOfTheWeekWidget />
            </div>

            {/* Column 2 – Live + Ranking */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <LiveMatchesWidget />
              <RankingWidget />
            </div>

            {/* Column 3 – News */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <NewsWidget />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────── */}
      <section style={{
        borderTop: "1px solid var(--c-border)",
        padding: "40px 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <p className="section-label" style={{ marginBottom: 24 }}>Sources de données</p>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
            opacity: 0.3,
          }}>
            {["FBref", "Opta", "Transfermarkt", "Wyscout", "ESPN", "SofaScore"].map(src => (
              <span key={src} style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--c-text-1)",
                letterSpacing: "0.07em",
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
