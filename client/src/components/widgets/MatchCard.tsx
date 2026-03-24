import React from 'react';
import { useLocation } from 'wouter';
import { Trophy, Clock } from 'lucide-react';

export interface MatchCardProps {
  id: number;
  homeTeam: { id: number; name: string; logo: string };
  awayTeam: { id: number; name: string; logo: string };
  score: { home: number | null; away: number | null };
  status: string; // "LIVE", "FINISHED", "SCHEDULED"
  minute: number | null;
  startTime: string;
}

export default function MatchCard({ id, homeTeam, awayTeam, score, status, minute, startTime }: MatchCardProps) {
  const [, setLocation] = useLocation();

  const isLive = status === "LIVE" || status === "IN_PLAY" || status === "PAUSED";
  
  // Extraire l'heure de début si planifié
  const startTimeFormatted = new Date(startTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div 
      onClick={() => setLocation(`/match/${id}`)}
      className="bg-card hover:bg-zinc-800/80 transition-all duration-300 p-4 rounded-2xl cursor-pointer ring-1 ring-border group flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      
      {/* Statut et Temps (Mobile Top, Desktop Left) */}
      <div className="flex items-center gap-2 md:w-24 shrink-0">
        {isLive ? (
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            {minute ? `${minute}'` : 'LIVE'}
          </div>
        ) : status === "FINISHED" ? (
          <div className="text-zinc-500 font-bold text-xs uppercase">Terminé</div>
        ) : (
          <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
            <Clock className="w-3.5 h-3.5" />
            {startTimeFormatted}
          </div>
        )}
      </div>

      {/* Équipes (Centre) */}
      <div className="flex-1 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 md:justify-center">
        {/* Domicile */}
        <div className="flex items-center justify-between md:justify-end gap-3 flex-1">
          <span className="font-bold text-sm md:text-base group-hover:text-primary transition-colors">{homeTeam.name}</span>
          <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />
        </div>

        {/* Score Central */}
        <div className="hidden md:flex flex-col items-center justify-center shrink-0 w-16">
          <div className="bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-700/50 text-center shadow-inner">
            <span className={`font-black tracking-widest ${isLive ? 'text-red-500' : 'text-foreground'}`}>
              {score.home !== null ? score.home : '-'}:{score.away !== null ? score.away : '-'}
            </span>
          </div>
        </div>

        {/* Mobile Score Injecté */}
        <div className="md:hidden flex items-center justify-center gap-4 py-2 opacity-80 border-y border-border/50">
           <span className="font-black text-xl">{score.home !== null ? score.home : '-'}</span>
           <span className="text-zinc-500">-</span>
           <span className="font-black text-xl">{score.away !== null ? score.away : '-'}</span>
        </div>

        {/* Extérieur */}
        <div className="flex items-center justify-between md:justify-start gap-3 flex-1 flex-row-reverse md:flex-row">
          <span className="font-bold text-sm md:text-base group-hover:text-primary transition-colors">{awayTeam.name}</span>
          <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />
        </div>
      </div>

    </div>
  );
}
