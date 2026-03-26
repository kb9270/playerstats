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
      borderTop: "1px solid var(--c-border)",
      marginTop: 80,
      paddingTop: 48,
      paddingBottom: 32,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* Top row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 48,
          marginBottom: 40,
          flexWrap: "wrap",
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--c-text-1)",
              marginBottom: 10,
            }}>
              Player<span style={{ color: "var(--c-accent)" }}>Stats</span>
            </div>
            <p style={{
              fontSize: 13,
              color: "var(--c-text-3)",
              lineHeight: 1.7,
              margin: 0,
            }}>
              Analyses footballistiques avancées — données en temps réel, modèles prédictifs et scouting 2026.
            </p>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--c-text-3)",
                marginBottom: 16,
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
          borderTop: "1px solid var(--c-border)",
          paddingTop: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 12, color: "var(--c-text-3)" }}>
            © 2026 PlayerStats — Toutes les données proviennent de sources officielles.
          </span>
          <span style={{ fontSize: 12, color: "var(--c-text-3)" }}>
            Saison 2025/2026
          </span>
        </div>
      </div>
    </footer>
  );
}
