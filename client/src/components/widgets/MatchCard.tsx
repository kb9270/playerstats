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
      onClick={() => setLocation(`/match/${id}`)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: "3px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        border: `1px solid ${isLive ? "rgba(232,52,74,0.2)" : "transparent"}`,
        background: isLive ? "rgba(232,52,74,0.04)" : "transparent",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = "rgba(232,52,74,0.07)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,52,74,0.2)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = isLive ? "rgba(232,52,74,0.04)" : "transparent";
        (e.currentTarget as HTMLDivElement).style.borderColor = isLive ? "rgba(232,52,74,0.2)" : "transparent";
      }}
    >
      {/* Left accent bar for live */}
      {isLive && (
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: "2px",
          background: "var(--c-accent)",
        }} />
      )}

      {/* Status */}
      <div style={{ width: 42, flexShrink: 0, paddingLeft: isLive ? 4 : 0 }}>
        {isLive ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div className="live-dot" />
            <span style={{
              fontSize: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              color: "var(--c-accent)",
              letterSpacing: "0.06em",
            }}>
              {minute ? `${minute}'` : 'LIVE'}
            </span>
          </div>
        ) : isFinished ? (
          <span style={{
            fontSize: 9,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            color: "var(--c-text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}>FIN</span>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--c-text-3)" }}>
            <Clock size={10} />
            <span style={{
              fontSize: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
            }}>{startTimeFormatted}</span>
          </div>
        )}
      </div>

      {/* Home team */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: 12,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          color: "var(--c-text-1)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{homeTeam.name}</span>
        <img src={homeTeam.logo} alt={homeTeam.name} style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
      </div>

      {/* Score */}
      <div style={{
        flexShrink: 0,
        minWidth: 44,
        textAlign: "center",
        padding: "4px 8px",
        background: isLive ? "rgba(232,52,74,0.12)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${isLive ? "rgba(232,52,74,0.3)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: "2px",
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 14,
        color: isLive ? "var(--c-accent)" : "var(--c-text-1)",
        letterSpacing: "0.05em",
      }}>
        {score.home !== null ? score.home : '—'}:{score.away !== null ? score.away : '—'}
      </div>

      {/* Away team */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 6, minWidth: 0 }}>
        <img src={awayTeam.logo} alt={awayTeam.name} style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }} />
        <span style={{
          fontSize: 12,
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700,
          color: "var(--c-text-1)",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{awayTeam.name}</span>
      </div>
    </div>
  );
}
