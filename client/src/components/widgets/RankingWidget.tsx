import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type BallonDorRanking = {
  playerName: string;
  team: string;
  points: number;
  rank: number;
  season: string;
  metrics: any;
};

const medalColors = ["#F5C842", "#C0C0C0", "#CD7F32"];

export default function RankingWidget() {
  const { data, isLoading } = useQuery<{ success: boolean; rankings: BallonDorRanking[] }>({
    queryKey: ["/api/ballon-dor"],
  });

  const rankings = data?.rankings || [];

  return (
    <div className="widget animate-fade-up delay-300">
      <div className="widget-header">
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Trophy size={13} style={{ color: "var(--c-gold)" }} />
          <span className="widget-title">Ballon d'Or Ladder</span>
        </div>
        <span style={{
          fontSize: 9,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--c-gold)",
          background: "rgba(245,200,66,0.08)",
          border: "1px solid rgba(245,200,66,0.25)",
          borderRadius: "2px",
          padding: "2px 8px",
        }}>2026</span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shimmer" style={{ height: 40, borderRadius: 3 }} />
            ))}
          </div>
        ) : rankings.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {rankings.map((rank, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: "3px",
                  transition: "background 0.15s ease",
                  background: idx === 0 ? "rgba(245,200,66,0.05)" : "transparent",
                  border: idx === 0 ? "1px solid rgba(245,200,66,0.1)" : "1px solid transparent",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = idx === 0 ? "rgba(245,200,66,0.05)" : "transparent"}
              >
                {/* Rank number */}
                <div style={{
                  width: 22, height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                  fontSize: 12,
                  color: idx < 3 ? medalColors[idx] : "var(--c-text-3)",
                  flexShrink: 0,
                  background: idx < 3 ? `rgba(${idx === 0 ? "245,200,66" : idx === 1 ? "192,192,192" : "205,127,50"},0.1)` : "rgba(255,255,255,0.04)",
                  borderRadius: "2px",
                  border: idx < 3 ? `1px solid ${idx === 0 ? "rgba(245,200,66,0.3)" : idx === 1 ? "rgba(192,192,192,0.3)" : "rgba(205,127,50,0.3)"}` : "1px solid rgba(255,255,255,0.06)",
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    color: idx === 0 ? "var(--c-gold)" : "var(--c-text-1)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {rank.playerName}
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontFamily: "'Barlow', sans-serif",
                    color: "var(--c-text-3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 1,
                  }}>
                    {rank.team}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <span style={{
                    fontSize: 15,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900,
                    color: idx === 0 ? "var(--c-gold)" : "var(--c-text-2)",
                    letterSpacing: "-0.02em",
                  }}>
                    {Math.round(rank.points)}
                  </span>
                  <span style={{
                    fontSize: 9,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    color: "var(--c-text-3)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--c-text-3)", fontSize: 13 }}>
            Calcul en cours…
          </div>
        )}
      </div>
    </div>
  );
}
