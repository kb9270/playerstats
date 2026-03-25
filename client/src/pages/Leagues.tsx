import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Trophy, Users, Target, TrendingUp } from "lucide-react";

const LEAGUE_META: Record<string, { flag: string; country: string; color: string; bg: string }> = {
  "eng Premier League": { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "Angleterre", color: "#3b82f6", bg: "from-blue-900/40" },
  "es La Liga":         { flag: "🇪🇸",           country: "Espagne",    color: "#f97316", bg: "from-orange-900/40" },
  "fr Ligue 1":        { flag: "🇫🇷",           country: "France",     color: "#60a5fa", bg: "from-blue-900/30" },
  "it Serie A":        { flag: "🇮🇹",           country: "Italie",     color: "#22c55e", bg: "from-green-900/40" },
  "de Bundesliga":     { flag: "🇩🇪",           country: "Allemagne",  color: "#eab308", bg: "from-yellow-900/40" },
  "nl Eredivisie":     { flag: "🇳🇱",           country: "Pays-Bas",   color: "#f97316", bg: "from-orange-900/30" },
  "pt Primeira Liga":  { flag: "🇵🇹",           country: "Portugal",   color: "#a855f7", bg: "from-purple-900/40" },
};

function getMeta(n: string) {
  return LEAGUE_META[n] || { flag: "🌍", country: "", color: "#64748b", bg: "from-gray-900/40" };
}
function shortName(n: string) { return n.split(" ").slice(1).join(" ") || n; }

export default function Leagues() {
  const [, setLocation] = useLocation();

  const { data: leagues = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/csv/leagues"],
    staleTime: 5 * 60 * 1000,
  });

  const totalGoals   = leagues.reduce((s: number, l: any) => s + (l.totalGoals   || 0), 0);
  const totalPlayers = leagues.reduce((s: number, l: any) => s + (l.totalPlayers || 0), 0);
  const totalTeams   = leagues.reduce((s: number, l: any) => s + (l.totalTeams   || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight mb-1 flex items-center gap-3">
            <Trophy className="w-9 h-9 text-yellow-400" /> Championnats
          </h1>
          <p className="text-gray-400">Sélectionne un championnat pour voir les statistiques détaillées</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Trophy,     label: "Ligues",   value: leagues.length,               color: "#eab308" },
            { icon: Users,      label: "Équipes",  value: totalTeams,                   color: "#a855f7" },
            { icon: Users,      label: "Joueurs",  value: totalPlayers.toLocaleString(), color: "#22c55e" },
            { icon: Target,     label: "Buts",     value: totalGoals.toLocaleString(),   color: "#f97316" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* League Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league: any) => {
              const meta = getMeta(league.name);
              const name = shortName(league.name);
              return (
                <button
                  key={league.name}
                  onClick={() => setLocation(`/league/${encodeURIComponent(league.name)}`)}
                  className={`bg-gradient-to-br ${meta.bg} to-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-2xl p-6 text-left transition-all duration-200 hover:scale-[1.02] group`}
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl">{meta.flag}</span>
                      <div>
                        <div className="font-black text-xl" style={{ color: meta.color }}>{name}</div>
                        <div className="text-xs text-gray-400">{meta.country}</div>
                      </div>
                    </div>
                    <div className="text-gray-600 group-hover:text-gray-400 transition-colors text-lg">→</div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { label: "Équipes",  value: league.totalTeams },
                      { label: "Joueurs",  value: league.totalPlayers },
                      { label: "Buts",     value: league.totalGoals },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-950/60 rounded-xl p-2.5 text-center">
                        <div className="text-xl font-black text-white">{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top scorer */}
                  {league.topScorer && (
                    <div className="border-t border-gray-800/60 pt-4 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500">⚽ Top buteur</div>
                        <div className="font-bold text-sm text-white mt-0.5">{league.topScorer.name}</div>
                        <div className="text-xs text-gray-500">{league.topScorer.team}</div>
                      </div>
                      <div className="text-3xl font-black" style={{ color: meta.color }}>
                        {league.topScorer.goals}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}