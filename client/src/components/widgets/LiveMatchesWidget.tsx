import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import MatchCard, { MatchCardProps } from './MatchCard';

export default function LiveMatchesWidget() {
  const { data: matches, isLoading, error } = useQuery<MatchCardProps[]>({
    queryKey: ['/api/live-matches'],
    refetchInterval: 5000,
    staleTime: 0,
  });

  return (
    <div className="widget animate-fade-up" style={{ height: "100%" }}>
      <div className="widget-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="live-dot" />
          <span className="widget-title">Scores Direct</span>
        </div>
        <Link href="/matches-live" style={{ textDecoration: "none" }}>
          <button style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 3,
            color: "var(--c-text-3)",
            fontSize: 11,
            fontWeight: 500,
            transition: "color 0.15s ease",
            padding: 0,
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--c-text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--c-text-3)")}
          >
            Voir tout <ChevronRight size={13} />
          </button>
        </Link>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--c-text-3)", fontSize: 13 }}>
            Erreur de connexion
          </div>
        ) : matches && matches.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {matches.slice(0, 5).map(match => (
              <MatchCard key={match.id} {...match} />
            ))}
            {matches.length > 5 && (
              <Link href="/matches-live" style={{ textDecoration: "none" }}>
                <div style={{
                  textAlign: "center",
                  padding: "10px 0 4px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--c-text-3)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderTop: "1px solid var(--c-border)",
                  marginTop: 6,
                  transition: "color 0.15s ease",
                }}>
                  +{matches.length - 5} matchs aujourd'hui
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div style={{
            textAlign: "center",
            padding: "32px 0",
            color: "var(--c-text-3)",
            fontSize: 13,
          }}>
            Aucun match en cours
          </div>
        )}
      </div>
    </div>
  );
}
