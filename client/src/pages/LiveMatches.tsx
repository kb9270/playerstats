import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Activity, Calendar, MapPin, Trophy, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface Match {
  id: string;
  date: string;
  status: {
    type: {
      name: string;
      description: string;
      state: "pre" | "in" | "post";
      completed: boolean;
    };
    displayClock: string;
    period: number;
  };
  homeTeam: {
    name: string;
    logo: string;
    score: string;
    winner: boolean;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: string;
    winner: boolean;
  };
  league: string;
  venue: string;
}

export default function LiveMatches() {
  const { data, isLoading, error } = useQuery<{ success: boolean; matches: Match[] }>({
    queryKey: ["/api/live/matches"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const matches = data?.matches || [];

  const getStatusColor = (state: string) => {
    switch (state) {
      case "in": return "bg-red-500 animate-pulse text-white";
      case "post": return "bg-gray-500 text-white";
      case "pre": return "bg-blue-500 text-white";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-stats-dark text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-stats-accent/20 rounded-lg">
                <Activity className="w-6 h-6 text-stats-accent" />
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                Matchs en <span className="text-stats-accent">Direct</span>
              </h1>
            </div>
            <p className="text-gray-400 font-medium">
              Scores en temps réel, matchs à venir et résultats de la journée.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-stats-secondary/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
            <Calendar className="w-5 h-5 text-stats-accent" />
            <span className="font-bold text-lg">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-stats-accent" />
            <p className="text-gray-400 animate-pulse">Chargement des matchs en direct...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
            <p className="text-red-400 font-bold">Impossible de récupérer les scores pour le moment.</p>
            <Button variant="link" className="text-white mt-2" onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-stats-secondary/30 border border-white/5 p-16 rounded-3xl text-center">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
            <p className="text-xl text-gray-500 font-medium">Aucun match programmé pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-stats-secondary/40 border border-white/5 hover:border-stats-accent/30 transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-0">
                    {/* League Header */}
                    <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-stats-yellow" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">{match.league}</span>
                      </div>
                      <Badge className={`${getStatusColor(match.status.type.state)} border-none text-[10px] font-black uppercase px-2 py-0.5`}>
                        {match.status.type.state === 'in' ? match.status.displayClock : match.status.type.description}
                      </Badge>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center justify-between gap-4">
                        {/* Home Team */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3">
                          <div className="w-20 h-20 bg-stats-dark/50 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-stats-accent/20 transition-colors">
                            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="max-w-full max-h-full object-contain drop-shadow-lg" />
                          </div>
                          <span className={`text-lg font-black uppercase italic leading-tight ${match.homeTeam.winner ? 'text-white' : 'text-gray-400'}`}>
                            {match.homeTeam.name}
                          </span>
                        </div>

                        {/* Score / VS */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-stats-dark/80 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
                            <span className="text-4xl font-black italic text-stats-accent">
                              {match.homeTeam.score || '0'}
                            </span>
                            <span className="text-gray-600 font-black text-xl">-</span>
                            <span className="text-4xl font-black italic text-stats-accent">
                              {match.awayTeam.score || '0'}
                            </span>
                          </div>
                          {match.status.type.state === 'in' && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                              <span className="text-[10px] font-black uppercase text-red-500 tracking-tighter">Live</span>
                            </div>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex-1 flex flex-col items-center text-center gap-3">
                          <div className="w-20 h-20 bg-stats-dark/50 rounded-2xl flex items-center justify-center p-3 border border-white/5 group-hover:border-stats-accent/20 transition-colors">
                            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="max-w-full max-h-full object-contain drop-shadow-lg" />
                          </div>
                          <span className={`text-lg font-black uppercase italic leading-tight ${match.awayTeam.winner ? 'text-white' : 'text-gray-400'}`}>
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      {match.venue && (
                        <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{match.venue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
