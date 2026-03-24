import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type BallonDorRanking = {
  playerName: string;
  team: string;
  points: number;
  rank: number;
  season: string;
  metrics: any;
};

export default function RankingWidget() {
  const { data, isLoading } = useQuery<{ success: boolean, rankings: BallonDorRanking[] }>({
    queryKey: ["/api/ballon-dor"],
  });

  const rankings = data?.rankings || [];

  return (
    <Card className="stats-card">
      <CardHeader className="pb-3 px-6 pt-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-yellow-400">
          <Trophy className="w-6 h-6" />
          Ballon d'Or Ladder
        </CardTitle>
        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
          En Cours
        </Badge>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-white/5 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : rankings.length > 0 ? (
            rankings.map((rank, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all group border border-transparent hover:border-yellow-400/30">
                <span className="text-lg font-bold w-6 text-gray-400 group-hover:text-yellow-400 transition-colors">
                  {idx + 1}
                </span>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold truncate group-hover:text-yellow-400 transition-colors">
                    {rank.playerName}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 font-medium truncate">{rank.team}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-base font-black text-yellow-400">
                    {Math.round(rank.points)}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <TrendingUp className="w-3 h-3 text-yellow-400" />
                    <span>Pts</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400 text-sm">
              Le calcul du classement est en cours...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
