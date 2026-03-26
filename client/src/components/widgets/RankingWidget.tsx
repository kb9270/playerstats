import { Trophy, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type BallonDorRanking = {
  playerName: string;
  team: string;
  points: number;
  rank: number;
  season: string;
  metrics: any;
};

const medalColors = ["var(--c-gold)", "#C0C0C0", "#CD7F32"];

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
        <span className="pill pill-gold">2026</span>
      </div>

      <div className="widget-body">
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 40, borderRadius: 10 }} />
            ))}
          </div>
        ) : rankings.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rankings.map((rank, idx) => (
              <div key={idx} className="rank-row">
                <span className="rank-num" style={{ color: idx < 3 ? medalColors[idx] : undefined }}>
                  {idx + 1}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--c-text-1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {rank.playerName}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "var(--c-text-3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 1,
                  }}>
                    {rank.team}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: idx === 0 ? "var(--c-gold)" : "var(--c-text-2)",
                  }}>
                    {Math.round(rank.points)}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--c-text-3)", letterSpacing: "0.04em" }}>pts</span>
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
