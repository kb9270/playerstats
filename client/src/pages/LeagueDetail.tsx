import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp, Search, Trophy, Users, Target, TrendingUp } from "lucide-react";
import { TeamLogo } from "@/components/PlayerAvatar";
import PlayerAvatar from "@/components/PlayerAvatar";

const LEAGUE_META: Record<string, { flag: string; country: string; color: string }> = {
  "eng Premier League": { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country: "Angleterre", color: "#3b82f6" },
  "es La Liga":         { flag: "🇪🇸",           country: "Espagne",    color: "#f97316" },
  "fr Ligue 1":        { flag: "🇫🇷",           country: "France",     color: "#60a5fa" },
  "it Serie A":        { flag: "🇮🇹",           country: "Italie",     color: "#22c55e" },
  "de Bundesliga":     { flag: "🇩🇪",           country: "Allemagne",  color: "#eab308" },
  "nl Eredivisie":     { flag: "🇳🇱",           country: "Pays-Bas",   color: "#f97316" },
  "pt Primeira Liga":  { flag: "🇵🇹",           country: "Portugal",   color: "#a855f7" },
};
function getMeta(n: string) { return LEAGUE_META[n] || { flag: "🌍", country: "", color: "#64748b" }; }
function shortName(n: string) { return n.split(" ").slice(1).join(" ") || n; }

const POS_COLOR: Record<string, string> = {
  FW: "bg-orange-900/40 text-orange-400",
  MF: "bg-blue-900/40 text-blue-400",
  DF: "bg-green-900/40 text-green-400",
  GK: "bg-yellow-900/40 text-yellow-400",
};

type SortKey = "Gls" | "Ast" | "xG" | "xAG" | "Sh" | "Min" | "MP" | "PrgC" | "PrgP";
const COLUMNS: { key: SortKey; label: string; hint: string }[] = [
  { key: "MP",   label: "MJ",   hint: "Matchs joués" },
  { key: "Min",  label: "Min",  hint: "Minutes" },
  { key: "Gls",  label: "Buts", hint: "Buts" },
  { key: "Ast",  label: "PD",   hint: "Passes décisives" },
  { key: "xG",   label: "xG",   hint: "Expected Goals" },
  { key: "xAG",  label: "xAG",  hint: "Expected Assisted Goals" },
  { key: "Sh",   label: "Tirs", hint: "Tirs" },
  { key: "PrgC", label: "PrgC", hint: "Carries progressives" },
  { key: "PrgP", label: "PrgP", hint: "Passes progressives" },
];

type TabType = "standings" | "players" | "teams";

export default function LeagueDetail() {
  const { id } = useParams<{ id: string }>();
  const leagueName = decodeURIComponent(id || "");
  const [, setLocation] = useLocation();

  const [tab, setTab] = useState<TabType>("standings");
  const [sortKey, setSortKey] = useState<SortKey>("Gls");
  const [sortAsc, setSortAsc] = useState(false);
  const [posFilter, setPosFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const meta = getMeta(leagueName);
  const name = shortName(leagueName);

  const { data: players = [], isLoading: loadingP } = useQuery<any[]>({
    queryKey: [`/api/csv/leagues/${encodeURIComponent(leagueName)}/players`],
    staleTime: 5 * 60 * 1000,
  });

  const { data: teams = [], isLoading: loadingT } = useQuery<any[]>({
    queryKey: [`/api/csv/teams?league=${encodeURIComponent(leagueName)}`],
    staleTime: 5 * 60 * 1000,
  });

  const { data: standingsData, isLoading: loadingSt } = useQuery<any>({
    queryKey: [`/api/standings/${encodeURIComponent(leagueName)}`],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const standings: any[] = standingsData?.standings || [];

  const totalGoals = players.reduce((s, p: any) => s + (Number(p.Gls) || 0), 0);
  const avgAge = players.length
    ? (players.reduce((s, p: any) => s + (Number(p.Age) || 0), 0) / players.filter((p: any) => p.Age).length).toFixed(1)
    : "—";
  const uniqueTeams = [...new Set(players.map((p: any) => p.Squad).filter(Boolean))] as string[];

  const filtered = players
    .filter(p => {
      const base = ((p as any).Pos || "").split(",")[0];
      return (!posFilter || base === posFilter)
        && (!teamFilter || (p as any).Squad === teamFilter)
        && (!search || (p as any).Player?.toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a: any, b: any) => {
      const diff = (Number(b[sortKey]) || 0) - (Number(a[sortKey]) || 0);
      return sortAsc ? -diff : diff;
    });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(v => !v); else { setSortKey(key); setSortAsc(false); }
    setPage(0);
  }

  const TABS: { key: TabType; label: string }[] = [
    { key: "standings", label: "🏆 Classement" },
    { key: "players",   label: "📊 Statistiques joueurs" },
    { key: "teams",     label: "🏟️ Équipes" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setLocation("/leagues")} className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Ligues
          </button>
          <span className="text-gray-700">|</span>
          <span className="text-2xl">{meta.flag}</span>
          <span className="font-black text-lg" style={{ color: meta.color }}>{name}</span>
          <span className="text-gray-500 text-sm">{meta.country} • 2025/2026</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Users,      label: "Joueurs", value: players.length,         color: "#60a5fa" },
            { icon: Trophy,     label: "Équipes", value: uniqueTeams.length,     color: "#a855f7" },
            { icon: Target,     label: "Buts",    value: totalGoals,             color: "#f97316" },
            { icon: TrendingUp, label: "Âge moy.",value: avgAge,                 color: "#22c55e" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <div>
                <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-800">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ STANDINGS ══ */}
        {tab === "standings" && (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            {loadingSt ? (
              <div className="text-center py-14">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chargement du classement en direct…</p>
              </div>
            ) : standings.length === 0 ? (
              <div className="text-center py-14 text-gray-500">Classement non disponible pour ce championnat.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-800 text-xs uppercase tracking-wider">
                        <th className="px-3 py-3 text-left text-gray-500 w-8">Pos</th>
                        <th className="px-4 py-3 text-left text-gray-400">Équipe</th>
                        <th className="px-3 py-3 text-right text-gray-400" title="Matchs joués">MJ</th>
                        <th className="px-3 py-3 text-right text-green-500" title="Victoires">V</th>
                        <th className="px-3 py-3 text-right text-gray-400" title="Nuls">N</th>
                        <th className="px-3 py-3 text-right text-red-500" title="Défaites">D</th>
                        <th className="px-3 py-3 text-right text-gray-400" title="Buts pour">BP</th>
                        <th className="px-3 py-3 text-right text-gray-400" title="Buts contre">BC</th>
                        <th className="px-3 py-3 text-right text-gray-400" title="Différence de buts">+/-</th>
                        <th className="px-3 py-3 text-right text-white font-bold">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((row: any, i: number) => {
                        const isTop4    = i < 4;
                        const isRelZ    = i >= standings.length - 3;
                        const indicator = isTop4 ? "border-l-blue-500" : isRelZ ? "border-l-red-600" : "border-l-transparent";
                        return (
                          <tr
                            key={row.team}
                            onClick={() => setLocation("/equipe/" + encodeURIComponent(row.team))}
                            className={"border-b border-gray-900/80 hover:bg-gray-900/50 cursor-pointer transition-colors border-l-2 " + indicator}
                          >
                            <td className="px-3 py-3 text-gray-500 font-mono text-xs text-center">{row.rank}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <TeamLogo logo={row.logo} teamName={row.abbr || row.team} size="sm" />
                                <span className="font-semibold text-white whitespace-nowrap">{row.team}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right text-gray-400">{row.played}</td>
                            <td className="px-3 py-3 text-right text-green-400 font-semibold">{row.wins}</td>
                            <td className="px-3 py-3 text-right text-gray-400">{row.draws}</td>
                            <td className="px-3 py-3 text-right text-red-400">{row.losses}</td>
                            <td className="px-3 py-3 text-right text-gray-300">{row.goalsFor}</td>
                            <td className="px-3 py-3 text-right text-gray-300">{row.goalsAgainst}</td>
                            <td className={"px-3 py-3 text-right font-semibold " + (row.goalDiff > 0 ? "text-green-400" : row.goalDiff < 0 ? "text-red-400" : "text-gray-400")}>
                              {row.goalDiff > 0 ? "+" : ""}{row.goalDiff}
                            </td>
                            <td className="px-3 py-3 text-right font-black text-white text-base">{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-6 px-4 py-3 bg-gray-900/40 border-t border-gray-800 text-xs text-gray-500">
                  <span className="flex items-center gap-2"><span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block" /> Qualification UEFA</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-1.5 rounded-full bg-red-600 inline-block" /> Zone relégation</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ PLAYERS ══ */}
        {tab === "players" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Nom du joueur…"
                  className="bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 w-44" />
              </div>
              <div className="flex gap-1">
                {["", "FW", "MF", "DF", "GK"].map(pos => (
                  <button key={pos} onClick={() => { setPosFilter(pos); setPage(0); }}
                    className={"px-3 py-1.5 rounded-lg text-xs font-bold transition-all " +
                      (posFilter === pos ? "bg-blue-600 text-white" : "bg-gray-900 border border-gray-700 text-gray-400 hover:border-gray-500")}>
                    {pos || "Tous"}
                  </button>
                ))}
              </div>
              <select value={teamFilter} onChange={e => { setTeamFilter(e.target.value); setPage(0); }}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">Toutes les équipes</option>
                {[...uniqueTeams].sort().map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="ml-auto text-xs text-gray-600 self-center">{filtered.length} joueurs</span>
            </div>

            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-800 text-xs uppercase tracking-wider">
                      <th className="px-3 py-3 text-left text-gray-500 w-8">Rg</th>
                      <th className="px-3 py-3 text-left text-gray-400">Joueur</th>
                      <th className="px-3 py-3 text-left text-gray-400">Équipe</th>
                      <th className="px-3 py-3 text-center text-gray-400">Pos</th>
                      <th className="px-3 py-3 text-right text-gray-400">Âge</th>
                      {COLUMNS.map(col => (
                        <th key={col.key} title={col.hint} onClick={() => handleSort(col.key)}
                          className={"px-3 py-3 text-right cursor-pointer select-none whitespace-nowrap transition-colors " +
                            (sortKey === col.key ? "text-white bg-blue-900/20" : "text-gray-400 hover:text-gray-200")}>
                          <span className="flex items-center justify-end gap-1">
                            {col.label}
                            {sortKey === col.key ? (sortAsc ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />) : null}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingP
                      ? [...Array(10)].map((_, i) => (
                          <tr key={i} className="border-b border-gray-900">
                            {[...Array(13)].map((__, j) => <td key={j} className="px-3 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse" /></td>)}
                          </tr>
                        ))
                      : paginated.map((p: any, i: number) => {
                          const rank = page * PAGE_SIZE + i + 1;
                          const basePos = (p.Pos || "MF").split(",")[0];
                          return (
                            <tr key={p.Player + p.Squad}
                              onClick={() => setLocation("/joueur/" + encodeURIComponent(p.Player))}
                              className="border-b border-gray-900/80 hover:bg-gray-900/50 cursor-pointer transition-colors">
                              <td className="px-3 py-2.5 text-gray-600 text-xs">{rank}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <PlayerAvatar
                                    playerName={p.Player}
                                    teamName={p.Squad}
                                    headshot={p.headshot}
                                  />
                                  <span className="font-semibold text-white">{p.Player}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <TeamLogo logo={p.logo} teamName={p.Squad} size="sm" />
                                  <span className="text-gray-400">{p.Squad}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className={"text-xs font-bold px-1.5 py-0.5 rounded " + (POS_COLOR[basePos] || POS_COLOR.MF)}>{p.Pos}</span>
                              </td>
                              <td className="px-3 py-2.5 text-right text-gray-400">{p.Age}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.MP || "—"}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.Min || "—"}</td>
                              <td className={"px-3 py-2.5 text-right font-bold " + (sortKey === "Gls" ? "text-orange-400" : "text-gray-200")}>{p.Gls || 0}</td>
                              <td className={"px-3 py-2.5 text-right font-bold " + (sortKey === "Ast" ? "text-blue-400" : "text-gray-200")}>{p.Ast || 0}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.xG ? Number(p.xG).toFixed(1) : "—"}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.xAG ? Number(p.xAG).toFixed(1) : "—"}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.Sh || 0}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.PrgC || 0}</td>
                              <td className="px-3 py-2.5 text-right text-gray-300">{p.PrgP || 0}</td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-gray-900/60 border-t border-gray-800">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40">← Précédent</button>
                  <span className="text-sm text-gray-400">Page {page + 1} / {totalPages} ({filtered.length} joueurs)</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40">Suivant →</button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ TEAMS ══ */}
        {tab === "teams" && (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left text-gray-400">Équipe</th>
                  <th className="px-4 py-3 text-right text-gray-400">Joueurs</th>
                  <th className="px-4 py-3 text-right text-gray-400">Buts</th>
                  <th className="px-4 py-3 text-right text-gray-400">Passes D.</th>
                  <th className="px-4 py-3 text-right text-gray-400">Âge moy.</th>
                  <th className="px-4 py-3 text-left text-gray-400">Top buteur</th>
                </tr>
              </thead>
              <tbody>
                {loadingT
                  ? [...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-900">
                        {[...Array(6)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse" /></td>)}
                      </tr>
                    ))
                  : [...teams].sort((a: any, b: any) => (b.totalGoals || 0) - (a.totalGoals || 0))
                      .map((team: any) => (
                        <tr key={team.name}
                          onClick={() => setLocation("/equipe/" + encodeURIComponent(team.name))}
                          className="border-b border-gray-900/80 hover:bg-gray-900/50 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <TeamLogo logo={team.logo} teamName={team.name} size="sm" />
                              <span className="font-semibold text-white">{team.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-300">{team.playerCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-orange-400">{team.totalGoals}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-400">{team.totalAssists}</td>
                          <td className="px-4 py-3 text-right text-gray-300">{team.avgAge}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {team.topScorer
                              ? <span>{team.topScorer.name} <span className="text-orange-400">({team.topScorer.goals}⚽)</span></span>
                              : "—"}
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
