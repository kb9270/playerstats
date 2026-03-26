import { Clock, TrendingUp } from "lucide-react";
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
        <span className="widget-title">Actualités</span>
        <span className="pill pill-accent">Live</span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="skeleton" style={{ height: 10, width: "30%" }} />
                <div className="skeleton" style={{ height: 13, width: "90%" }} />
                <div className="skeleton" style={{ height: 10, width: "60%" }} />
              </div>
            ))}
          </div>
        ) : newsItems.length > 0 ? (
          newsItems.slice(0, 5).map(item => (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
              className="news-item"
              style={{ textDecoration: "none" }}
            >
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--c-accent)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {item.source || "Général"}
              </span>
              <h4 style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--c-text-1)",
                lineHeight: 1.45,
                margin: "3px 0",
              }}>
                {item.title}
              </h4>
              <p style={{
                fontSize: 12,
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
                color: "var(--c-text-3)",
                marginTop: 4,
              }}>
                <Clock size={10} />
                {new Date(item.publishedAt).toLocaleDateString("fr-FR", {
                  hour: "2-digit", minute: "2-digit",
                  day: "2-digit", month: "short",
                })}
              </span>
            </a>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--c-text-3)", fontSize: 13 }}>
            Aucune actualité disponible
          </div>
        )}
      </div>
    </div>
  );
}
