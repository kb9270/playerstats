import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import NewsWidget from "@/components/widgets/NewsWidget";
import TeamOfTheWeekWidget from "@/components/widgets/TeamOfTheWeekWidget";
import RankingWidget from "@/components/widgets/RankingWidget";
import MatchSearchWidget from "@/components/widgets/MatchSearchWidget";
import LiveMatchesWidget from "@/components/widgets/LiveMatchesWidget";
import { Button } from "@/components/ui/button";
import { ChevronRight, Database, Shield, Zap, Search } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@assets/football_hero.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-stats-dark overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[650px] overflow-hidden flex items-center justify-center">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center brightness-50"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-stats-dark via-stats-dark/60 to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-stats-dark/80 via-transparent to-stats-dark/80" />
        {/* Decorative Grid */}
        <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-stats-accent/20 border border-stats-accent/30 rounded-full mb-8 backdrop-blur-md">
            <Zap className="w-5 h-5 text-stats-accent animate-pulse" />
            <span className="text-stats-accent font-bold text-sm tracking-widest uppercase italic">Base de Données Élite 2026-2027</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight leading-none drop-shadow-2xl">
            SAISON <span className="text-stats-accent italic contrast-200">2026</span> <br /> 
            LIVE SCRAPING
          </h1>
          
          <p className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-md">
            Explorez les performances de plus de <span className="text-stats-accent font-bold">2800+ joueurs</span> européens et analysez chaque match avec des modèles prédictifs avancés.
          </p>
          
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-8 translate-y-4">
             <div className="w-full relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-stats-accent/40 to-stats-blue/40 blur-xl opacity-50 rounded-2xl" />
                <div className="relative">
                   <SearchBar />
                </div>
             </div>
             
             <div className="flex flex-wrap items-center justify-center gap-6">
                <Link href="/dashboard">
                  <Button className="bg-stats-accent hover:bg-stats-accent/80 text-white px-8 h-14 text-lg font-black uppercase italic shadow-lg shadow-stats-accent/20 group">
                    <Database className="mr-3 w-6 h-6" />
                    Explorer CSV
                    <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/matches">
                  <Button variant="outline" className="border-stats-blue/50 bg-stats-blue/10 backdrop-blur-md hover:bg-stats-blue/20 text-stats-blue px-8 h-14 text-lg font-black uppercase italic group">
                    <Shield className="mr-3 w-6 h-6" />
                    Analyser Matchs
                  </Button>
                </Link>
             </div>
          </div>
        </div>
      </section>
      
      {/* Widget Section */}
      <section className="relative z-20 -mt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <NewsWidget />
              <div className="p-8 bg-stats-accent/10 border border-stats-accent/30 rounded-3xl relative overflow-hidden flex flex-col items-start gap-4">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-stats-accent/20 blur-3xl -translate-y-12 translate-x-12" />
                 <Shield className="w-12 h-14 text-stats-accent mb-2" />
                 <h3 className="text-3xl font-black text-white uppercase italic leading-none">Comparateur <br/> Pro V2</h3>
                 <p className="text-gray-400 text-sm font-medium">Algorithme de similarité avancé basé sur 42 métriques distinctes.</p>
                 <Link href="/comparison" className="mt-4">
                    <Button variant="link" className="text-stats-accent p-0 font-bold hover:no-underline flex items-center gap-2 group">
                      Comparer maintenant
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </Link>
              </div>
            </div>
            
            {/* Column 2 */}
            <div className="lg:col-span-1 space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <TeamOfTheWeekWidget />
              <MatchSearchWidget />
            </div>
            
            {/* Column 3 */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <RankingWidget />
              
              {/* Promo Card */}
              <div className="stats-card p-10 relative overflow-hidden min-h-[400px] flex flex-col justify-end">
                <div className="absolute top-0 left-0 w-full h-full scale-110 opacity-30 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-stats-dark via-stats-dark/60 text-stats-dark/20 to-transparent" />
                <div className="relative z-10 flex flex-col items-start gap-4">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-xl">
                      <Zap className="w-8 h-8 text-stats-yellow fill-stats-yellow" />
                   </div>
                   <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Scouting <br /> AI Engine</h3>
                   <p className="text-gray-200 text-base font-medium opacity-90 drop-shadow-lg">
                      L'intelligence artificielle au service du recrutement professionnel.
                   </p>
                   <Link href="/analyzer" className="mt-4 w-full">
                      <Button className="bg-white text-stats-dark hover:bg-gray-200 w-full h-14 font-black uppercase italic shadow-2xl">
                        Démarrer l'Analyse
                      </Button>
                   </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Partners Section */}
      <section className="py-24 border-t border-white/5 bg-stats-dark/30">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.4em] mb-12 italic">Data Powering Professional Scouting</h2>
            <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Just simple logos/text as placeholders for premium feel */}
               <span className="text-3xl font-black text-white italic tracking-tighter">FBREF</span>
               <span className="text-3xl font-black text-white italic tracking-tighter">OPTA</span>
               <span className="text-3xl font-black text-white italic tracking-tighter">TRANSFERMARKT</span>
               <span className="text-3xl font-black text-white italic tracking-tighter">WYSCOUT</span>
            </div>
         </div>
      </section>
      
      <Footer />
    </div>
  );
}
