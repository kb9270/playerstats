import React from 'react';
import { useLocation } from 'wouter';
import { Clock } from 'lucide-react';

export interface MatchCardProps {
  id: number;
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
  score: { home: number | null; away: number | null };
  status: string;
  minute: number | null;
  startTime: string;
}

export default function MatchCard({ id, homeTeam, awayTeam, score, status, minute, startTime }: MatchCardProps) {
  const [, setLocation] = useLocation();
  const isLive = status === "LIVE" || status === "IN_PLAY" || status === "PAUSED";
  const isFinished = status === "FINISHED";

  const startTimeFormatted = new Date(startTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div
      className="match-row"
      onClick={() => setLocation(`/match/${id}`)}
    >
      {/* Status */}
      <div style={{ width: 44, flexShrink: 0 }}>
        {isLive ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-accent)" }}>
              {minute ? `${minute}'` : 'LIVE'}
            </span>
          </div>
        ) : isFinished ? (
          <span style={{ fontSize: 10, fontWeight: 500, color: "var(--c-text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Fin</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--c-text-3)" }}>
            <Clock size={11} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>{startTimeFormatted}</span>
          </div>
        )}
      </div>

      {/* Home team */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: "var(--c-text-1)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{homeTeam.name}</span>
        <img src={homeTeam.logo} alt={homeTeam.name} style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
      </div>

      {/* Score */}
      <div className={`score-badge${isLive ? " live" : ""}`} style={{ flexShrink: 0 }}>
        {score.home !== null ? score.home : '—'}:{score.away !== null ? score.away : '—'}
      </div>

      {/* Away team */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 6, minWidth: 0 }}>
        <img src={awayTeam.logo} alt={awayTeam.name} style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: "var(--c-text-1)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{awayTeam.name}</span>
      </div>
    </div>
  );
}
