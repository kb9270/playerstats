import { Link } from "wouter";

const links = {
  Plateforme: [
    { label: "Joueurs", href: "/" },
    { label: "Comparaison", href: "/comparison" },
    { label: "Équipes", href: "/teams" },
    { label: "Ligues", href: "/leagues" },
    { label: "Direct", href: "/matches-live" },
  ],
  Données: [
    { label: "FBref.com", href: "#" },
    { label: "SofaScore", href: "#" },
    { label: "Transfermarkt", href: "#" },
    { label: "ESPN API", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(232,52,74,0.12)",
      marginTop: 80,
      position: "relative",
      background: "rgba(8,11,30,0.6)",
    }}>
      {/* Top accent bar */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg, var(--c-accent) 0%, rgba(26,111,255,0.5) 50%, transparent 100%)",
      }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
        {/* Top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 48,
          marginBottom: 40,
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}>
              <div style={{
                width: 28, height: 28,
                background: "var(--c-accent)",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900,
                fontSize: 12,
                color: "#fff",
                flexShrink: 0,
              }}>PS</div>
              <span style={{
                fontSize: 16,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                letterSpacing: "0.04em",
                color: "var(--c-text-1)",
                textTransform: "uppercase",
              }}>
                Player<span style={{ color: "var(--c-accent)" }}>Stats</span>
              </span>
            </div>
            <p style={{
              fontSize: 13,
              fontFamily: "'Barlow', sans-serif",
              color: "var(--c-text-3)",
              lineHeight: 1.7,
              margin: 0,
            }}>
              Analyses footballistiques avancées — données en temps réel, modèles prédictifs et scouting 2025/26.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p style={{
                fontSize: 10,
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--c-accent)",
                margin: "0 0 16px",
              }}>
                {section}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        fontSize: 13,
                        fontFamily: "'Barlow', sans-serif",
                        color: "var(--c-text-2)",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text-1)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-2)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--c-text-3)",
            textTransform: "uppercase",
          }}>
            © 2026 PlayerStats · Toutes les données proviennent de sources officielles.
          </span>
          <span style={{
            fontSize: 11,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            color: "var(--c-accent)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            Saison 2025/2026
          </span>
        </div>
      </div>
    </footer>
  );
}
