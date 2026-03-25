import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading } = useQuery<any[]>({
    queryKey: [`/api/players/search?q=${debouncedQuery}`],
    enabled: debouncedQuery.length > 2,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
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
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSearch} className="relative">
        <Input
          type="text"
          placeholder="Rechercher un joueur (ex: Mbappé, Haaland, Bellingham...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length > 2);
          }}
          className="w-full px-6 py-4 search-input rounded-xl text-blue-100 placeholder-blue-300 focus:outline-none transition-all pr-16"
        />
        <Button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 stats-button px-6 py-2 rounded-lg"
        >
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && debouncedQuery.length > 2 && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-blue-950/60 border border-blue-400/40 rounded-xl z-50 max-h-96 overflow-y-auto backdrop-blur-md shadow-2xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2">
                    <Skeleton className="w-10 h-10 rounded-xl bg-blue-800/40" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-36 bg-blue-800/40" />
                      <Skeleton className="h-3 w-24 bg-blue-800/40" />
                    </div>
                    <Skeleton className="w-6 h-6 rounded bg-blue-800/40" />
                  </div>
                ))}
              </div>
            ) : Array.isArray(searchResults) && searchResults.length > 0 ? (
              <div className="divide-y divide-blue-800/30">
                {searchResults.slice(0, 8).map((player: any, index: number) => {
                  const colors = [
                    "text-blue-300", "text-cyan-300", "text-emerald-300",
                    "text-violet-300", "text-pink-300",
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <button
                      key={player.id || player.name}
                      onClick={() => handlePlayerClick(player)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-900/40 transition-colors text-left group"
                    >
                      {/* Headshot (lazy loaded) */}
                      <PlayerAvatar
                        playerName={player.name}
                        teamName={player.team}
                        headshot={player.headshot}
                        logo={player.logo}
                        size="md"
                        showTeamBadge={!!player.logo}
                      />

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold truncate ${colorClass} group-hover:text-white transition-colors`}>
                          {player.name}
                        </div>
                        <div className="text-xs text-blue-300/70 truncate">
                          {player.team}
                          {player.position && ` · ${player.position}`}
                          {player.age && ` · ${player.age} ans`}
                          {player.nationality && ` · ${player.nationality}`}
                        </div>
                      </div>

                      {/* Team Logo */}
                      {player.logo ? (
                        <TeamLogo logo={player.logo} teamName={player.team || ""} size="sm" className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-8 h-8 shrink-0 rounded bg-blue-800/30 flex items-center justify-center text-[9px] font-bold text-blue-400">
                          {(player.league || "").replace("eng ", "").replace("es ", "").replace("fr ", "").replace("it ", "").replace("de ", "").replace("nl ", "").replace("pt ", "").substring(0, 3).toUpperCase()}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-blue-300/60">
                {debouncedQuery.length > 2
                  ? "Aucun joueur trouvé. Essayez un nom complet."
                  : "Tapez au moins 3 caractères…"}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}