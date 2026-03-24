import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  User, 
  TrendingUp, 
  Activity, 
  Target, 
  Brain, 
  Trophy,
  Medal,
  Users,
  Globe,
  Star,
  Zap,
  BarChart3
} from "lucide-react";

interface Player {
  Player: string;
  Squad: string;
  Pos: string;
  Age: number;
  Nation: string;
  Comp: string;
  Gls: number;
  Ast: number;
  xG: number;
  xAG: number;
  Min: number;
  MP: number;
  'Cmp%': number;
  Tkl: number;
  Int: number;
  PrgP: number;
  'Succ%': number;
  Sh: number;
  SoT: number;
}

interface PlayerAnalysis {
  player: Player;
  percentiles: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  playingStyle: string;
  overallRating: number;
  stats: {
    goalsPerGame: string;
    assistsPerGame: string;
    minutesPlayed: number;
    appearances: number;
  };
}

export default function BeautifulCSVDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");

  // Données de base
  const { data: leagueStats } = useQuery({
    queryKey: ['/api/csv-direct/leagues'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: teamStats } = useQuery({
    queryKey: ['/api/csv-direct/teams'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: topScorers } = useQuery({
    queryKey: ['/api/csv-direct/top-scorers', 5],
    staleTime: 5 * 60 * 1000,
  });

  const { data: topAssists } = useQuery({
    queryKey: ['/api/csv-direct/top-assists', 5],
    staleTime: 5 * 60 * 1000,
  });

  // Recherche
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: [`/api/csv-direct/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 2 && searchQuery.trim().length > 0,
    staleTime: 30 * 1000, // 30 secondes
  });

  // Analyse du joueur sélectionné
  const { data: playerAnalysis, isLoading: isLoadingAnalysis } = useQuery({
    queryKey: ['/api/csv-direct/player', selectedPlayer],
    enabled: !!selectedPlayer,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatPercentile = (value: number): string => {
    if (value >= 80) return "text-green-600 dark:text-green-400";
    if (value >= 60) return "text-blue-600 dark:text-blue-400";
    if (value >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPercentileIcon = (value: number): string => {
    if (value >= 80) return "🟢";
    if (value >= 60) return "🔵";
    if (value >= 40) return "🟡";
    return "🔴";
  };

  const getFlag = (nation: string): string => {
    const flagMap: Record<string, string> = {
      'eng ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'es ESP': '🇪🇸', 'fr FRA': '🇫🇷', 'it ITA': '🇮🇹', 
      'de GER': '🇩🇪', 'br BRA': '🇧🇷', 'ar ARG': '🇦🇷', 'pt POR': '🇵🇹',
      'nl NED': '🇳🇱', 'be BEL': '🇧🇪', 'hr CRO': '🇭🇷', 'pl POL': '🇵🇱'
    };
    return flagMap[nation] || '🌍';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0f172a] to-[#0f172a] text-white overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto py-8 space-y-8 relative z-10">

        {/* En-tête héroïque */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 py-12"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">Football Analytics Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg pb-2">
            Analyseur de Joueurs
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Explorez les données de <span className="font-semibold text-white">2800+ joueurs européens</span> avec 
            des analyses avancées et des insights générés par l'IA.
          </p>
        </motion.div>

        {/* Barre de recherche principale */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden text-white w-full max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-2xl font-light">
                <Search className="h-6 w-6 text-blue-400" />
                Recherche de Joueur
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Recherchez par nom (ex: Messi, Mbappé, Haaland...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-16 text-xl bg-black/40 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 rounded-xl"
                />
                <Button size="lg" disabled={isSearching} className="h-16 px-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] border-0">
                  {isSearching ? "Recherche..." : "Rechercher"}
                </Button>
              </div>

              {/* Résultats de recherche */}
              <AnimatePresence>
                {searchResults?.success && searchResults.players && searchResults.players.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 space-y-4"
                  >
                    <h3 className="font-medium text-gray-400 text-lg uppercase tracking-wider">Résultats ({searchResults.players.length})</h3>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                      {searchResults.players.slice(0, 8).map((player: Player, index: number) => (
                        <motion.div 
                          variants={itemVariants}
                          whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.99 }}
                          key={index}
                          className="p-5 border border-white/10 rounded-xl cursor-pointer bg-black/30 backdrop-blur-sm transition-all shadow-lg"
                          onClick={() => {
                            const safeId = encodeURIComponent(player.Player.trim());
                            window.open(`/joueur/${safeId}`, "_blank");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-5">
                              <Avatar className="h-14 w-14 ring-2 ring-blue-500/50">
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg">
                                  {player.Player.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-xl text-white">{player.Player}</h4>
                                <div className="flex items-center space-x-4 mt-1 text-gray-400">
                                  <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-md text-xs">
                                    {getFlag(player.Nation)} {player.Squad}
                                  </span>
                                  <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-0">{player.Pos}</Badge>
                                  <span className="text-sm">{player.Age} ans</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                {player.Gls}G <span className="text-gray-600">/</span> {player.Ast}A
                              </div>
                              <div className="text-xs text-gray-500 uppercase tracking-widest">{player.Comp}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analyse détaillée du joueur sélectionné */}
        {isLoadingAnalysis && selectedPlayer && (
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {playerAnalysis?.success && (
          <div className="space-y-6">
            {/* Carte principale du joueur */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-2xl font-bold">
                        {playerAnalysis.analysis.player.Player.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {playerAnalysis.analysis.player.Player}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center gap-2 text-lg text-gray-600 dark:text-gray-300">
                          {getFlag(playerAnalysis.analysis.player.Nation)} {playerAnalysis.analysis.player.Squad}
                        </span>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {playerAnalysis.analysis.player.Pos}
                        </Badge>
                        <span className="text-lg text-gray-600 dark:text-gray-300">
                          {playerAnalysis.analysis.player.Age} ans
                        </span>
                        <Button
                          onClick={() => window.open(`/api/csv-direct/player/${encodeURIComponent(playerAnalysis.analysis.player.Player)}/pdf`, '_blank')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Fiche PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {playerAnalysis.analysis.overallRating}/100
                    </div>
                    <div className="text-sm text-gray-500">Note Globale</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {playerAnalysis.analysis.player.Gls}
                    </div>
                    <div className="text-sm text-gray-500">Buts</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {playerAnalysis.analysis.player.Ast}
                    </div>
                    <div className="text-sm text-gray-500">Passes D.</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {playerAnalysis.analysis.player.MP}
                    </div>
                    <div className="text-sm text-gray-500">Matchs</div>
                  </div>
                  <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(playerAnalysis.analysis.player.Min / 90)}
                    </div>
                    <div className="text-sm text-gray-500">90 min jouées</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="percentiles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="percentiles" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Percentiles
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Analyse
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Statistiques
                </TabsTrigger>
              </TabsList>

              <TabsContent value="percentiles">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance vs Position
                    </CardTitle>
                    <CardDescription>
                      Comparaison avec les joueurs du même poste ayant joué au moins 90 minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(playerAnalysis.analysis.percentiles).map(([stat, value]) => (
                        <div key={stat} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-lg capitalize">{stat.replace(/([A-Z])/g, ' $1')}</span>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getPercentileIcon(value)}</span>
                              <Badge 
                                variant={value >= 70 ? "default" : value >= 40 ? "secondary" : "destructive"}
                                className="text-sm px-3 py-1"
                              >
                                {value}e percentile
                              </Badge>
                            </div>
                          </div>
                          <Progress value={value} className="h-3 bg-gray-200 dark:bg-gray-700" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Style de Jeu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline" className="text-xl p-4 w-full justify-center">
                        {playerAnalysis.analysis.playingStyle}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Forces & Faiblesses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {playerAnalysis.analysis.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Forces
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {playerAnalysis.analysis.strengths.map((strength, index) => (
                              <Badge key={index} variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {playerAnalysis.analysis.weaknesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Points d'amélioration
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {playerAnalysis.analysis.weaknesses.map((weakness, index) => (
                              <Badge key={index} variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                                {weakness}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="stats">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Statistiques Détaillées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-semibold">{playerAnalysis.analysis.stats.goalsPerGame}</div>
                        <div className="text-sm text-gray-500">Buts/Match</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-semibold">{playerAnalysis.analysis.stats.assistsPerGame}</div>
                        <div className="text-sm text-gray-500">Passes D./Match</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-semibold">{playerAnalysis.analysis.stats.minutesPlayed}</div>
                        <div className="text-sm text-gray-500">Minutes jouées</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-xl font-semibold">{playerAnalysis.analysis.stats.appearances}</div>
                        <div className="text-sm text-gray-500">Apparitions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Statistiques globales et classements */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Statistiques des ligues */}
          {leagueStats?.success && (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-light">
                  <Globe className="h-6 w-6 text-blue-400" />
                  Ligues Représentées
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {leagueStats.stats.totalPlayers} joueurs dans {Object.keys(leagueStats.stats.leagues).length} championnats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leagueStats.stats.topLeagues.slice(0, 5).map(([league, count]: [string, number], index: number) => (
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      key={league} 
                      className="flex justify-between items-center p-4 bg-black/20 border border-white/5 rounded-xl"
                    >
                      <span className="font-medium text-gray-200">{league}</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-0 rounded-full">{count} joueurs</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top buteurs */}
          {topScorers?.success && (
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[50px] pointer-events-none" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-light">
                  <Trophy className="h-6 w-6 text-pink-400" />
                  Top Buteurs Européens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topScorers.players.slice(0, 5).map((player: Player, index: number) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.1)" }}
                      className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-xl cursor-pointer"
                      onClick={() => {
                        const safeId = encodeURIComponent(player.Player.trim());
                        window.open(`/joueur/${safeId}`, "_blank");
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-100">{player.Player}</div>
                          <div className="text-xs text-gray-400 uppercase flex items-center gap-1">
                             <span className="text-base leading-none">{getFlag(player.Nation)}</span> {player.Squad}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                          {player.Gls}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Top passeurs */}
        {topAssists?.success && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="border border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl text-white overflow-hidden">
              <div className="absolute top-0 right-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-light">
                  <Medal className="h-6 w-6 text-cyan-400" />
                  Maitres de la Dernière Passe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {topAssists.players.slice(0, 6).map((player: Player, index: number) => (
                    <motion.div 
                      whileHover={{ scale: 1.03, y: -5, backgroundColor: "rgba(255,255,255,0.1)" }}
                      key={index}
                      className="p-5 bg-black/30 border border-white/5 rounded-xl cursor-pointer relative overflow-hidden group shadow-lg"
                      onClick={() => {
                        const safeId = encodeURIComponent(player.Player.trim());
                        window.open(`/joueur/${safeId}`, "_blank");
                      }}
                    >
                      <div className="absolute -right-4 -bottom-6 text-8xl font-black text-white/[0.03] transition-colors group-hover:text-cyan-400/[0.1] pointer-events-none">
                        {player.Ast}
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <div className="font-bold text-lg text-gray-100 mb-1">{player.Player}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="text-lg leading-none">{getFlag(player.Nation)}</span> {player.Squad}
                          </div>
                        </div>
                        <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-2 rounded-xl text-lg font-bold shadow-md">
                          {player.Ast} <span className="text-xs font-normal">ast</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Pied de page */}
        <div className="text-center py-8 space-y-4">
          <Separator />
          <p className="text-gray-600 dark:text-gray-400">
            Plateforme d'analyse alimentée par les données FBref 2024/25 - Projet de Khalil 🧬
          </p>
          <p className="text-sm text-gray-500">
            {leagueStats?.success && `${leagueStats.stats.totalPlayers} joueurs analysés`} • 
            Mise à jour en temps réel • Analyses par IA
          </p>
        </div>
      </div>
    </div>
  );
}