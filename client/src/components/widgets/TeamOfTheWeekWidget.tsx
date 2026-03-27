import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import PlayerAvatar from "../PlayerAvatar";

type TopPlayer = {
  Player: string;
  Squad: string;
  Gls: number;
  Ast: number;
  Pos: string;
  rating: number;
  displayRating?: number;
  sofaId?: number;
};

const PlayerToken = ({ player, top, left }: { player: TopPlayer; top: string; left: string }) => (
  <div
    className="player-token"
    style={{ position: "absolute", top, left, transform: "translate(-50%, -50%)" }}
  >
    <div style={{ position: "relative" }}>
      <div style={{
        border: "2px solid rgba(255,207,64,0.4)",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
        display: "inline-flex",
        background: "rgba(0,0,0,0.2)",
      }}>
        <PlayerAvatar
          playerName={player.Player || ""}
          teamName={player.Squad}
          sofaId={player.sofaId}
          size="md"
          className="rounded-xl"
        />
      </div>
      <div style={{
        position: "absolute",
        top: -5, right: -10,
        background: "var(--c-gold)",
        color: "#0a0a0f",
        fontSize: 10,
        fontWeight: 900,
        padding: "2px 5px",
        borderRadius: 5,
        lineHeight: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        zIndex: 5,
      }}>
        {Number(player.displayRating || player.rating).toFixed(1)}
      </div>
    </div>
    <div className="player-token-name">
      {player.Player?.split(" ").pop() || "Player"}
    </div>
  </div>
);

// Field line SVG
const FieldLines = () => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      opacity: 0.12,
    }}
  >
    {/* Outer rectangle */}
    <rect x="4" y="3" width="92" height="94" fill="none" stroke="white" strokeWidth="0.8" rx="2" />
    {/* Halfway line */}
    <line x1="4" y1="50" x2="96" y2="50" stroke="white" strokeWidth="0.6" />
    {/* Centre circle */}
    <circle cx="50" cy="50" r="13" fill="none" stroke="white" strokeWidth="0.6" />
    {/* Centre spot */}
    <circle cx="50" cy="50" r="1" fill="white" />
    {/* Top penalty area */}
    <rect x="26" y="3" width="48" height="20" fill="none" stroke="white" strokeWidth="0.6" />
    {/* Bottom penalty area */}
    <rect x="26" y="77" width="48" height="20" fill="none" stroke="white" strokeWidth="0.6" />
    {/* Top goal area */}
    <rect x="36" y="3" width="28" height="9" fill="none" stroke="white" strokeWidth="0.5" />
    {/* Bottom goal area */}
    <rect x="36" y="88" width="28" height="9" fill="none" stroke="white" strokeWidth="0.5" />
    {/* Top arc */}
    <path d="M 36 23 Q 50 32 64 23" fill="none" stroke="white" strokeWidth="0.4" />
    {/* Bottom arc */}
    <path d="M 36 77 Q 50 68 64 77" fill="none" stroke="white" strokeWidth="0.4" />
  </svg>
);

export default function TeamOfTheWeekWidget() {
  const { data, isLoading } = useQuery<{ success: boolean; players: TopPlayer[] }>({
    queryKey: ["/api/live/top-players"],
  });

  const players = data?.players || [];
  const fws = players.filter(p => p.Pos.includes("F") || p.Pos.includes("W")).slice(0, 3);
  const mfs = players.filter(p => !fws.includes(p) && (p.Pos.includes("M") || p.Pos.includes("C"))).slice(0, 3);
  const dfs = players.filter(p => !fws.includes(p) && !mfs.includes(p) && (p.Pos.includes("D") || p.Pos.includes("B"))).slice(0, 4);
  const gk = players.find(p => p.Pos.includes("G") || p.Pos.includes("K")) || players[10];

  return (
    <div className="widget animate-fade-up delay-75" style={{ height: "100%", minHeight: 480 }}>
      {/* Header */}
      <div className="widget-header">
        <span className="widget-title">11 de la semaine</span>
        <span className="pill pill-gold">4-3-3</span>
      </div>

      {/* Field */}
      <div style={{
        position: "relative",
        margin: "12px 16px 16px",
        flex: 1,
        height: 380,
        borderRadius: 14,
        overflow: "visible",
        background: "linear-gradient(180deg, #0d1f0d 0%, #112011 50%, #0d1f0d 100%)",
      }}>
        <FieldLines />

        {isLoading ? (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 28, height: 28,
              border: "2.5px solid var(--c-gold)",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }} />
          </div>
        ) : players.length >= 11 ? (
          <>
            {/* Forwards */}
            <PlayerToken player={fws[0]} top="13%" left="24%" />
            <PlayerToken player={fws[1]} top="10%"  left="50%" />
            <PlayerToken player={fws[2]} top="13%" left="76%" />
            {/* Midfielders */}
            <PlayerToken player={mfs[0]} top="37%" left="28%" />
            <PlayerToken player={mfs[1]} top="33%" left="50%" />
            <PlayerToken player={mfs[2]} top="37%" left="72%" />
            {/* Defenders */}
            <PlayerToken player={dfs[0]} top="62%" left="15%" />
            <PlayerToken player={dfs[1]} top="59%" left="37%" />
            <PlayerToken player={dfs[2]} top="59%" left="63%" />
            <PlayerToken player={dfs[3]} top="62%" left="85%" />
            {/* GK */}
            <PlayerToken player={gk}    top="85%" left="50%" />
          </>
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--c-text-3)", fontSize: 13,
          }}>
            Construction tactique…
          </div>
        )}

        {/* Watermark */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          display: "flex", alignItems: "center", gap: 5,
          opacity: 0.4,
        }}>
          <TrendingUp size={10} style={{ color: "var(--c-gold)" }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: "white", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Live · SofaScore
          </span>
        </div>
      </div>
    </div>
  );
}
