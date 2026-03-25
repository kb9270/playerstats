import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Search, Users, ArrowLeft } from "lucide-react";
import PlayerAvatar, { TeamLogo } from "@/components/PlayerAvatar";

const LEAGUE_FLAGS: Record<string, string> = {
  "eng Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "es La Liga":         "🇪🇸",
  "fr Ligue 1":        "🇫🇷",
  "it Serie A":        "🇮🇹",
  "de Bundesliga":     "🇩🇪",
  "nl Eredivisie":     "🇳🇱",
  "pt Primeira Liga":  "🇵🇹",
};

const POS_LABEL: Record<string, string> = { FW: "Attaquants", MF: "Milieux", DF: "Défenseurs", GK: "Gardiens" };
const POS_COLOR: Record<string, string> = { FW: "#f97316", MF: "#3b82f6", DF: "#22c55e", GK: "#eab308" };

function getFlag(comp: string) {
  return LEAGUE_FLAGS[comp] || "🌍";
}

function getShortLeague(comp: string) {
  return comp.split(" ").slice(1).join(" ") || comp;
}

// ── Team Detail Page ──────────────────────────────────────────────────────
function TeamDetail({ teamName }: { teamName: string }) {
  const [, setLocation] = useLocation();

  const { data: players = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/csv/teams/${encodeURIComponent(teamName)}/players`],
    staleTime: 5 * 60 * 1000,
  });

  const league = (players[0] as any)?.Comp || "";
  const totalGoals = players.reduce((s, p: any) => s + (Number(p.Gls) || 0), 0);
  const totalAssists = players.reduce((s, p: any) => s + (Number(p.Ast) || 0), 0);
  const agesArr = players.map((p: any) => Number(p.Age)).filter(a => a > 0);
  const avgAge = agesArr.length ? agesArr.reduce((a, b) => a + b, 0) / agesArr.length : 0;

  const posGroups: Record<string, any[]> = { FW: [], MF: [], DF: [], GK: [] };
  players.forEach((p: any) => {
    const base = (p.Pos || "MF").split(",")[0];
    (posGroups[base] || posGroups["MF"]).push(p);
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setLocation("/teams")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Équipes
          </button>
          <span className="text-gray-600">|</span>
          <span className="font-bold">{teamName}</span>
          {league && <span className="text-gray-500 text-sm">{getFlag(league)} {getShortLeague(league)}</span>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8">
          <div className="flex items-center gap-6 mb-6">
            <TeamLogo logo={players[0]?.logo} teamName={teamName} size="lg" className="w-20 h-20" />
            <div>
              <h1 className="text-4xl font-black">{teamName}</h1>
              {league && <div className="text-gray-400 mt-1">{getFlag(league)} {getShortLeague(league)}</div>}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Joueurs", value: players.length, color: "#60a5fa" },
              { label: "Buts", value: totalGoals, color: "#f97316" },
              { label: "Passes D.", value: totalAssists, color: "#3b82f6" },
              { label: "Âge moyen", value: avgAge ? (avgAge.toFixed(1) + " ans") : "—", color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/60 rounded-xl p-4 text-center">
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-900 rounded-xl h-20 animate-pulse" />)}
          </div>
        ) : (
          <>
            {Object.entries(posGroups).map(([pos, group]) =>
              group.length === 0 ? null : (
                <div key={pos}>
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: POS_COLOR[pos] }}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: POS_COLOR[pos] }} />
                    {POS_LABEL[pos]} ({group.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...group].sort((a: any, b: any) => (Number(b.Gls) || 0) - (Number(a.Gls) || 0)).map((p: any) => (
                      <button
                        key={p.Player}
                        onClick={() => setLocation(`/joueur/${encodeURIComponent(p.Player)}`)}
                        className="bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 flex items-center gap-4 text-left transition-all group"
                      >
                        <PlayerAvatar
                          playerName={p.Player}
                          teamName={p.Squad}
                          headshot={p.headshot}
                          logo={p.logo}
                          size="md"
                          showTeamBadge={false}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{p.Player}</div>
                          <div className="text-xs text-gray-500">{p.Nation} • {p.Age} ans</div>
                        </div>
                        <div className="flex gap-3 text-sm font-bold shrink-0">
                          <span className="text-orange-400">{p.Gls || 0}⚽</span>
                          <span className="text-blue-400">{p.Ast || 0}🅰️</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Teams List Page ───────────────────────────────────────────────────────
function TeamsList() {
  const [search, setSearch] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [, setLocation] = useLocation();

  const { data: teams = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/csv/teams"],
    staleTime: 5 * 60 * 1000,
  });

  const { data: leagues = [] } = useQuery<any[]>({
    queryKey: ["/api/csv/leagues"],
    staleTime: 5 * 60 * 1000,
  });

  const filtered = teams.filter((t: any) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchLeague = !leagueFilter || t.league === leagueFilter;
    return matchSearch && matchLeague;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-1 flex items-center gap-3">
            <Users className="w-9 h-9 text-blue-400" /> Équipes
          </h1>
          <p className="text-gray-400">{teams.length} équipes • Données réelles 2025/2026</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Équipes", value: teams.length, color: "#60a5fa" },
            { label: "Buts totaux", value: teams.reduce((s: number, t: any) => s + (t.totalGoals || 0), 0).toLocaleString(), color: "#f97316" },
            { label: "Passes D.", value: teams.reduce((s: number, t: any) => s + (t.totalAssists || 0), 0).toLocaleString(), color: "#3b82f6" },
            { label: "Joueurs", value: teams.reduce((s: number, t: any) => s + (t.playerCount || 0), 0).toLocaleString(), color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1 uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une équipe…"
              className="bg-gray-900 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={leagueFilter}
            onChange={e => setLeagueFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Tous les championnats</option>
            {leagues.map((l: any) => (
              <option key={l.name} value={l.name}>
                {getFlag(l.name)} {getShortLeague(l.name)}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-40 animate-pulse" />)}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filtered.length} équipe(s)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((team: any) => (
                <button
                  key={team.name}
                  onClick={() => setLocation(`/equipe/${encodeURIComponent(team.name)}`)}
                  className="bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 text-left transition-all group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TeamLogo logo={team.logo} teamName={team.name} size="md" />
                    <div className="min-w-0">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{team.name}</div>
                      <div className="text-xs text-gray-500">{getFlag(team.league)} {getShortLeague(team.league)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Joueurs", value: team.playerCount, color: "#60a5fa" },
                      { label: "Buts", value: team.totalGoals, color: "#f97316" },
                      { label: "PD", value: team.totalAssists, color: "#3b82f6" },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-800/60 rounded-lg p-2 text-center">
                        <div className="text-lg font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {team.topScorer && (
                    <div className="border-t border-gray-800 pt-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 mb-0.5">⚽ Top buteur</div>
                        <div className="text-sm font-bold truncate">{team.topScorer.name}</div>
                      </div>
                      <div className="text-xl font-black text-orange-400 shrink-0 ml-2">{team.topScorer.goals}</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Root Export: decides which view to render ─────────────────────────────
export default function Teams() {
  const params = useParams<{ id?: string }>();
  if (params.id) {
    return <TeamDetail teamName={decodeURIComponent(params.id)} />;
  }
  return <TeamsList />;
}