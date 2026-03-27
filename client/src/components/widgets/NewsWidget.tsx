import { Clock, Newspaper } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function NewsWidget() {
  const { data, isLoading } = useQuery<{ success: boolean; news: NewsItem[] }>({
    queryKey: ["/api/news"],
  });

  const newsItems = data?.news || [];

  return (
    <div className="widget animate-fade-up delay-225">
      <div className="widget-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Newspaper size={13} style={{ color: "var(--c-accent)" }} />
          <span className="widget-title">Actualités</span>
        </div>
        <span style={{
          fontSize: 9,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--c-accent)",
          background: "rgba(232,52,74,0.1)",
          border: "1px solid rgba(232,52,74,0.25)",
          borderRadius: "2px",
          padding: "2px 8px",
        }}>Live</span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="shimmer" style={{ height: 9, width: "30%", borderRadius: 2 }} />
                <div className="shimmer" style={{ height: 12, width: "90%", borderRadius: 2 }} />
                <div className="shimmer" style={{ height: 9, width: "60%", borderRadius: 2 }} />
              </div>
            ))}
          </div>
        ) : newsItems.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {newsItems.slice(0, 5).map((item, idx) => (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                key={item.id}
                style={{
                  textDecoration: "none",
                  display: "block",
                  padding: "12px 0",
                  borderBottom: idx < Math.min(newsItems.length, 5) - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "8px";
                  (e.currentTarget as HTMLAnchorElement).style.borderLeftWidth = "2px";
                  (e.currentTarget as HTMLAnchorElement).style.borderLeftStyle = "solid";
                  (e.currentTarget as HTMLAnchorElement).style.borderLeftColor = "var(--c-accent)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.paddingLeft = "0px";
                  (e.currentTarget as HTMLAnchorElement).style.borderLeftWidth = "0px";
                }}
              >
                <span style={{
                  fontSize: 9,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  color: "var(--c-accent)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}>
                  {item.source || "Général"}
                </span>
                <h4 style={{
                  fontSize: 13,
                  fontFamily: "'Barlow', sans-serif",
                  fontWeight: 600,
                  color: "var(--c-text-1)",
                  lineHeight: 1.45,
                  margin: "4px 0",
                }}>
                  {item.title}
                </h4>
                <p style={{
                  fontSize: 12,
                  fontFamily: "'Barlow', sans-serif",
                  color: "var(--c-text-3)",
                  lineHeight: 1.5,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.summary}
                </p>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 600,
                  color: "var(--c-text-3)",
                  marginTop: 5,
                  letterSpacing: "0.04em",
                }}>
                  <Clock size={10} />
                  {new Date(item.publishedAt).toLocaleDateString("fr-FR", {
                    hour: "2-digit", minute: "2-digit",
                    day: "2-digit", month: "short",
                  })}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "28px 0", color: "var(--c-text-3)", fontSize: 13 }}>
            Aucune actualité disponible
          </div>
        )}
      </div>
    </div>
  );
}
