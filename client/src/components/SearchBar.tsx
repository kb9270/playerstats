import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
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
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Rechercher un joueur — Mbappé, Haaland, Bellingham…"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length > 2);
          }}
          onFocus={() => { if (query.length > 2) setShowResults(true); }}
        />
        <button type="submit" className="search-btn" aria-label="Rechercher">
          <Search size={15} />
        </button>
      </form>

      {/* Dropdown */}
      {showResults && debouncedQuery.length > 2 && (
        <div className="search-dropdown">
          {isLoading ? (
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div className="skeleton" style={{ height: 12, width: "50%" }} />
                    <div className="skeleton" style={{ height: 10, width: "35%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
            searchResults.slice(0, 8).map((player: any) => (
              <button
                key={player.id || player.name}
                onClick={() => handlePlayerClick(player)}
                className="search-item"
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
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
                    fontWeight: 600,
                    color: "var(--c-text-1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: 11,
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
                    borderRadius: 6,
                    background: "var(--c-surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, color: "var(--c-text-3)",
                  }}>
                    {(player.league || "").replace(/^[a-z]+ /, "").substring(0, 3).toUpperCase()}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div style={{
              padding: "24px 16px",
              textAlign: "center",
              fontSize: 13,
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