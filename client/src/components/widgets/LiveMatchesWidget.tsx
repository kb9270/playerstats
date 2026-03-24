import { useQuery } from '@tanstack/react-query';
import MatchCard, { MatchCardProps } from './MatchCard';
import { Loader2, Activity } from 'lucide-react';

export default function LiveMatchesWidget() {
  const { data: matches, isLoading, error } = useQuery<MatchCardProps[]>({
    queryKey: ['/api/live-matches'],
    // Le fetcher de base de wouter / queryClent gère /api/...
  });

  return (
    <div className="bg-stats-dark/50 border border-stats-accent/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-stats-accent/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <Activity className="w-6 h-6 text-stats-accent" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Scores <span className="text-stats-accent italic">en Direct</span></h2>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-stats-accent" />
        </div>
      ) : error ? (
        <div className="text-center py-10 opacity-50">
          <p className="text-sm">Erreur lors du chargement des scores</p>
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="flex flex-col gap-4 relative z-10">
          {matches.map(match => (
            <MatchCard key={match.id} {...match} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 opacity-50">
          <p className="text-sm">Aucun match en direct pour le moment.</p>
        </div>
      )}
    </div>
  );
}
