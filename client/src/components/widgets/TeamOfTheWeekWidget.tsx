import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import totwBg from "@/assets/totw_bg.png";

type TopPlayer = {
  Player: string;
  Squad: string;
  Gls: number;
  Ast: number;
  Pos: string;
};

export default function TeamOfTheWeekWidget() {
  const { data, isLoading } = useQuery<{ success: boolean, players: TopPlayer[] }>({
    queryKey: ["/api/live/top-players"],
  });

  const topPlayers = data?.players || [];

  return (
    <Card className="stats-card overflow-hidden h-full relative border-none">
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${totwBg})` }}
      />
      
      <div className="relative z-10 flex flex-col h-full bg-gradient-to-t from-stats-dark via-transparent to-transparent">
        <CardHeader className="pb-3 px-6 pt-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-stats-yellow">
              <Trophy className="w-6 h-6" />
              Équipe de la Semaine
            </CardTitle>
            <Badge className="bg-stats-yellow text-stats-dark flex items-center gap-1 font-bold">
              <Star className="w-3 h-3 fill-stats-dark" />
              SÉLECTION XI
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pb-6 mt-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="w-8 h-8 rounded-full border-4 border-stats-yellow border-t-transparent animate-spin" />
              </div>
            ) : (
              topPlayers.slice(0, 5).map((player, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 group hover:border-stats-yellow/50 transition-all cursor-pointer">
                  <div className="relative">
                    <Avatar className="w-14 h-14 border-2 border-stats-yellow/30 group-hover:border-stats-yellow">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.Player}`} />
                      <AvatarFallback>{player.Player[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-stats-yellow text-stats-dark w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold truncate group-hover:text-stats-yellow transition-colors">
                        {player.Player}
                      </h4>
                      <span className="text-stats-yellow font-black text-xl italic drop-shadow-lg">
                        {player.Gls}G
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-white/10 text-gray-300 text-[10px] uppercase">
                        {player.Pos}
                      </Badge>
                      <span className="text-xs text-gray-400 font-medium truncate">
                        {player.Squad}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!isLoading && topPlayers.length === 0 && (
              <div className="text-center p-8 text-gray-400">
                Données de sélection indisponibles
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
