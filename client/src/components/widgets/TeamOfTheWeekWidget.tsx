import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Layout, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PlayerAvatar from "../PlayerAvatar";
import totwBg from "@/assets/totw_bg.png";

type TopPlayer = {
  Player: string;
  Squad: string;
  Gls: number;
  Ast: number;
  Pos: string;
  rating: number;
  displayRating?: number;
  sofaId?: number;
};

export default function TeamOfTheWeekWidget() {
  const { data, isLoading } = useQuery<{ success: boolean, players: TopPlayer[] }>({
    queryKey: ["/api/live/top-players"],
  });

  const players = data?.players || [];
  
  // Categorize for 4-3-3
  const fws = players.filter(p => p.Pos.includes('F') || p.Pos.includes('W')).slice(0, 3);
  const mfs = players.filter(p => !fws.includes(p) && (p.Pos.includes('M') || p.Pos.includes('C'))).slice(0, 3);
  const dfs = players.filter(p => !fws.includes(p) && !mfs.includes(p) && (p.Pos.includes('D') || p.Pos.includes('B'))).slice(0, 4);
  const gk = players.find(p => p.Pos.includes('G') || p.Pos.includes('K')) || players[10];

  const PlayerToken = ({ player, top, left }: { player: TopPlayer, top: string, left: string }) => (
    <div 
      className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 group"
      style={{ top, left }}
    >
      <div className="relative">
        <PlayerAvatar 
          playerName={player.Player} 
          teamName={player.Squad} 
          sofaId={player.sofaId}
          size="md"
          className="border-2 border-stats-yellow/50 group-hover:border-stats-yellow shadow-xl transition-all"
        />
        <div className="absolute -top-1 -right-1 bg-stats-yellow text-stats-dark text-[10px] font-black px-1 rounded border border-stats-dark">
          {Number(player.displayRating || player.rating).toFixed(1)}
        </div>
      </div>
      <div className="bg-stats-dark/90 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded shadow-lg">
        <p className="text-[9px] md:text-[10px] font-black text-white truncate max-w-[60px] md:max-w-[80px] uppercase leading-none">
          {player?.Player?.split(' ').pop()}
        </p>
      </div>
    </div>
  );

  return (
    <Card className="stats-card overflow-hidden h-[600px] relative border-none group">
       {/* Field Background */}
      <div className="absolute inset-0 z-0 bg-stats-dark">
         <div className="absolute inset-4 border-2 border-white/10 rounded-xl" />
         <div className="absolute inset-x-4 top-1/2 -translate-y-px h-px bg-white/10" />
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/10 rounded-full" />
         {/* Penalty Areas */}
         <div className="absolute inset-x-1/4 top-4 h-24 border-x-2 border-b-2 border-white/10 rounded-b-lg" />
         <div className="absolute inset-x-1/4 bottom-4 h-24 border-x-2 border-t-2 border-white/10 rounded-t-lg" />
      </div>

      <div className="relative z-10 flex flex-col h-full bg-gradient-to-b from-stats-dark/80 via-transparent to-stats-dark/80">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-black flex items-center gap-2 text-stats-yellow uppercase italic tracking-tighter">
              <Layout className="w-6 h-6" />
              11 DE LA SEMAINE
            </CardTitle>
            <Badge className="bg-stats-yellow text-stats-dark font-black text-[10px] italic">
              FORMATION 4-3-3
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 relative mt-4">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-stats-yellow border-t-transparent rounded-full animate-spin" />
            </div>
          ) : players.length >= 11 ? (
            <div className="relative w-full h-full">
              {/* Forwards */}
              <PlayerToken player={fws[0]} top="15%" left="25%" />
              <PlayerToken player={fws[1]} top="10%" left="50%" />
              <PlayerToken player={fws[2]} top="15%" left="75%" />
              
              {/* Midfielders */}
              <PlayerToken player={mfs[0]} top="40%" left="30%" />
              <PlayerToken player={mfs[1]} top="45%" left="50%" />
              <PlayerToken player={mfs[2]} top="40%" left="70%" />
              
              {/* Defenders */}
              <PlayerToken player={dfs[0]} top="70%" left="15%" />
              <PlayerToken player={dfs[1]} top="75%" left="38%" />
              <PlayerToken player={dfs[2]} top="75%" left="62%" />
              <PlayerToken player={dfs[3]} top="70%" left="85%" />
              
              {/* GK */}
              <PlayerToken player={gk} top="90%" left="50%" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 italic text-sm">
              Construction tactique en cours...
            </div>
          )}
        </CardContent>

        <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
           <TrendingUp className="w-4 h-4 text-stats-yellow" />
           <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">LIVE DATA @ SOFASCORE</span>
        </div>
      </div>
    </Card>
  );
}
