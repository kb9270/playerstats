import { useQuery } from '@tanstack/react-query';
import MatchCard, { MatchCardProps } from './MatchCard';
import { Loader2, Activity, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export default function LiveMatchesWidget() {
  const { data: matches, isLoading, error } = useQuery<MatchCardProps[]>({
    queryKey: ['/api/live-matches'],
    refetchInterval: 5000,
    staleTime: 0,
  });

  return (
    <div className="bg-stats-dark/50 border border-stats-accent/10 rounded-3xl p-6 md:p-8 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-stats-accent/5 rounded-full blur-[80px] -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-stats-accent" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Scores <span className="text-stats-accent italic">Direct</span></h2>
        </div>
        <Link href="/matches-live">
          <button className="text-stats-accent hover:text-white transition-colors flex items-center gap-1 text-sm font-bold uppercase italic">
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
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
          {matches.slice(0, 4).map(match => (
            <MatchCard key={match.id} {...match} />
          ))}
          {matches.length > 4 && (
            <Link href="/matches-live">
              <div className="text-center py-2 text-xs font-bold text-gray-400 hover:text-stats-accent transition-colors cursor-pointer border-t border-white/5 mt-2 uppercase tracking-widest pt-4">
                +{matches.length - 4} autres matchs aujourd'hui
              </div>
            </Link>
          )}
        </div>
      ) : (
        <div className="text-center py-10 opacity-50 relative z-10">
          <p className="text-sm font-medium">Aucun match en cours ou prévu.</p>
        </div>
      )}
    </div>
  );
}
