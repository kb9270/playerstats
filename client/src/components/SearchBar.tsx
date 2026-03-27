import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";
import PlayerAvatar, { TeamLogo } from "@/components/PlayerAvatar";

interface SearchBarProps {
  onPlayerSelect?: (playerId: number) => void;
}

export default function SearchBar({ onPlayerSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery<any[]>({
    queryKey: [`/api/players/search?q=${debouncedQuery}`],
    enabled: debouncedQuery.length > 2,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setShowResults(true);
  };

  const handlePlayerClick = (player: any) => {
    if (onPlayerSelect) {
      onPlayerSelect(player.id);
    } else {
      setLocation(`/joueur/${encodeURIComponent(player.name)}`);
    }
    setShowResults(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ position: "relative" }}>
          {/* Search icon left */}
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--c-text-3)",
              pointerEvents: "none",
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un joueur — Mbappé, Haaland, Bellingham…"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setShowResults(e.target.value.length > 2);
            }}
            onFocus={() => { if (query.length > 2) setShowResults(true); }}
            style={{
              width: "100%",
              height: 52,
              padding: "0 52px",
              background: "rgba(8, 11, 30, 0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "2px solid rgba(232,52,74,0.5)",
              borderRadius: "4px 4px 0 0",
              color: "var(--c-text-1)",
              fontSize: 14,
              fontFamily: "'Barlow', sans-serif",
              outline: "none",
              transition: "all 0.25s ease",
            }}
            onFocusCapture={e => {
              e.currentTarget.style.borderBottomColor = "var(--c-accent)";
              e.currentTarget.style.background = "rgba(8,11,30,0.95)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,52,74,0.12)";
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderBottomColor = "rgba(232,52,74,0.5)";
              e.currentTarget.style.background = "rgba(8,11,30,0.85)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          {/* Clear or submit button */}
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setShowResults(false); }}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                background: "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: "3px",
                color: "var(--c-text-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              aria-label="Effacer"
            >
              <X size={14} />
            </button>
          ) : (
            <button
              type="submit"
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                background: "var(--c-accent)",
                border: "none",
                borderRadius: "3px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              aria-label="Rechercher"
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "#c9253d"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--c-accent)"}
            >
              <Search size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showResults && debouncedQuery.length > 2 && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(8, 11, 30, 0.97)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(232,52,74,0.15)",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          zIndex: 100,
          overflow: "hidden",
          maxHeight: 400,
          overflowY: "auto",
        }}>
          {/* Red accent top line */}
          <div style={{ height: "1px", background: "linear-gradient(90deg, var(--c-accent), transparent)" }} />

          {isLoading ? (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 3, background: "rgba(255,255,255,0.05)", flexShrink: 0 }}
                    className="shimmer" />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="shimmer" style={{ height: 11, width: "55%", borderRadius: 2 }} />
                    <div className="shimmer" style={{ height: 9, width: "35%", borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.slice(0, 8).map((player: any) => (
              <button
                key={player.id || player.name}
                onClick={() => handlePlayerClick(player)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,52,74,0.06)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
              >
                <PlayerAvatar
                  playerName={player.name}
                  teamName={player.team}
                  headshot={player.headshot}
                  logo={player.logo}
                  size="md"
                  showTeamBadge={!!player.logo}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    color: "var(--c-text-1)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontFamily: "'Barlow', sans-serif",
                    color: "var(--c-text-3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 2,
                  }}>
                    {[player.team, player.position, player.age ? `${player.age} ans` : null, player.nationality]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
                {player.logo ? (
                  <TeamLogo logo={player.logo} teamName={player.team || ""} size="sm" className="shrink-0" />
                ) : (
                  <div style={{
                    width: 28, height: 28, flexShrink: 0,
                    borderRadius: 3,
                    background: "rgba(232,52,74,0.08)",
                    border: "1px solid rgba(232,52,74,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    color: "var(--c-accent)",
                    letterSpacing: "0.05em",
                  }}>
                    {(player.league || "").replace(/^[a-z]+ /, "").substring(0, 3).toUpperCase()}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div style={{
              padding: "28px 16px",
              textAlign: "center",
              fontSize: 13,
              fontFamily: "'Barlow', sans-serif",
              color: "var(--c-text-3)",
            }}>
              {debouncedQuery.length > 2
                ? "Aucun joueur trouvé. Essayez un nom complet."
                : "Tapez au moins 3 caractères…"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}