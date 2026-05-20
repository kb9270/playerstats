import { Clock, Newspaper, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function NewsWidget() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ success: boolean; news: NewsItem[] }>({
    queryKey: ["/api/news"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/news/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Génération échouée");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    }
  });

  const newsItems = data?.news || [];

  return (
    <div className="widget animate-fade-up delay-225">
      <div className="widget-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Newspaper size={13} style={{ color: "var(--c-accent)" }} />
          <span className="widget-title">Actualités IA</span>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          style={{
            fontSize: 10,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg, var(--c-accent) 0%, #ff5263 100%)",
            border: "none",
            padding: "4px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            boxShadow: "0 0 10px rgba(232,52,74,0.25)",
            transition: "all 0.2s ease",
            opacity: generateMutation.isPending ? 0.7 : 1
          }}
        >
          <Sparkles size={10} />
          {generateMutation.isPending ? "Génération..." : "Générer"}
        </button>
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
            {newsItems.slice(0, 4).map((item, idx) => {
              const isLocal = item.url && item.url.startsWith("/");
              const hasImage = !!(item as any).image;

              if (idx === 0 && hasImage) {
                const content = (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    paddingBottom: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    transition: "opacity 0.2s ease",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    <div style={{
                      position: "relative",
                      width: "100%",
                      height: 110,
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                      <img 
                        src={(item as any).image} 
                        alt={item.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                      <div style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        fontSize: 9,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        color: "#fff",
                        background: "var(--c-accent)",
                        padding: "2px 6px",
                        borderRadius: 3,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em"
                      }}>
                        À la une
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "var(--c-accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 2 }}>
                        {item.source || "Général"}
                      </div>
                      <h4 style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 700, lineHeight: 1.35, color: "var(--c-text-1)", margin: "4px 0" }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: 11, fontFamily: "'Barlow', sans-serif", color: "var(--c-text-3)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                        {item.summary}
                      </p>
                    </div>
                  </div>
                );

                return isLocal ? (
                  <Link key={item.id} href={item.url} style={{ textDecoration: "none" }}>
                    {content}
                  </Link>
                ) : (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    {content}
                  </a>
                );
              }

              const content = (
                <>
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
                </>
              );

              const anchorStyle = {
                textDecoration: "none",
                display: "block",
                padding: "12px 0",
                borderBottom: idx < Math.min(newsItems.length, 4) - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
                transition: "all 0.15s ease",
              };

              const handleMouseEnter = (e: any) => {
                e.currentTarget.style.paddingLeft = "8px";
                e.currentTarget.style.borderLeftWidth = "2px";
                e.currentTarget.style.borderLeftStyle = "solid";
                e.currentTarget.style.borderLeftColor = "var(--c-accent)";
              };

              const handleMouseLeave = (e: any) => {
                e.currentTarget.style.paddingLeft = "0px";
                e.currentTarget.style.borderLeftWidth = "0px";
              };

              return isLocal ? (
                <Link
                  href={item.url}
                  key={item.id}
                  style={anchorStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {content}
                </Link>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={item.id}
                  style={anchorStyle}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {content}
                </a>
              );
            })}
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

