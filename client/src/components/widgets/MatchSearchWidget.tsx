import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Target, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type Match = {
  HomeTeam: string;
  AwayTeam: string;
  FTR: string;
  Score: string;
  Date: string;
  League: string;
};

export default function MatchSearchWidget() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, refetch, isFetching } = useQuery<{ success: boolean, matches: Match[] }>({
    queryKey: [`/api/matches/search?q=${searchTerm}`],
    enabled: searchTerm.length > 2,
  });

  const matches = data?.matches || [];

  return (
    <Card className="stats-card">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-stats-blue" />
          Recherche de Matchs
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Chercher une équipe ou ligue..." 
              className="pl-10 h-10 bg-white/5 border-white/10 text-white rounded-lg focus:ring-stats-blue focus:border-stats-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="bg-stats-blue hover:bg-stats-blue/80 text-white px-6 font-bold"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "..." : "Voir"}
          </Button>
        </div>
        
        <div className="space-y-3">
          {isFetching ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 rounded-full border-2 border-stats-blue border-t-transparent animate-spin" />
            </div>
          ) : matches.length > 0 ? (
            matches.slice(0, 4).map((match, idx) => (
              <Link key={idx} href={`/match-analyzer?home=${match.HomeTeam}&away=${match.AwayTeam}`}>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-stats-blue/50 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-bold truncate group-hover:text-stats-blue transition-colors">
                      {match.HomeTeam}
                    </span>
                    <span className="text-xs text-gray-500 font-bold lowercase">vs</span>
                    <span className="text-sm font-bold truncate group-hover:text-stats-blue transition-colors">
                      {match.AwayTeam}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <Badge className="bg-stats-blue font-bold px-3 text-[10px]">
                      {match.Score || "N/A"}
                    </Badge>
                    <span className="text-[10px] text-gray-500 mt-1 uppercase">
                      {match.Date}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : searchTerm.length > 2 ? (
            <div className="text-center p-12 bg-white/5 rounded-xl border border-dashed border-white/10">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Aucun match trouvé pour "{searchTerm}"
              </p>
            </div>
          ) : (
             <div className="text-center p-12 bg-white/5 rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-gray-400 font-medium italic">
                Entrez le nom d'une équipe pour explorer les résultats
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-stats-blue/10 border border-stats-blue/30 rounded-xl relative overflow-hidden group">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stats-blue border border-white/20 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-stats-blue transition-colors">Analyse Prédictive</h4>
                <p className="text-[10px] text-gray-400">Basé sur les données ELO historiques</p>
              </div>
            </div>
            <Link href="/matches">
              <Button size="sm" variant="outline" className="text-[10px] font-bold h-8 border-stats-blue/40 hover:bg-stats-blue hover:text-white">
                Explorer
              </Button>
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-stats-blue opacity-5 blur-2xl rounded-full -translate-y-12 translate-x-12" />
        </div>
      </CardContent>
    </Card>
  );
}
