import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import PlayerProfile from "@/pages/PlayerProfile";
import PlayerDetailedProfile from "@/pages/PlayerDetailedProfile";
import Comparison from "@/pages/Comparison";
import Teams from "@/pages/Teams";
import Leagues from "@/pages/Leagues";
import LeagueDetail from "@/pages/LeagueDetail";
import CSVAnalyzer from "@/pages/CSVAnalyzer";
import StreamlitEquivalent from "@/pages/StreamlitEquivalent";
import BeautifulCSVDashboard from "@/pages/BeautifulCSVDashboard";
import MatchAnalyzer from "@/pages/MatchAnalyzer";
import LiveMatches from "@/pages/LiveMatches";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={BeautifulCSVDashboard} />
      <Route path="/player/:id" component={PlayerProfile} />
      <Route path="/player-profile/:playerName" component={PlayerDetailedProfile} />
      <Route path="/joueur/:id" component={PlayerDetailedProfile} />
      <Route path="/equipe/:id" component={Teams} />
      <Route path="/comparison/:id?" component={Comparison} />
      <Route path="/teams" component={Teams} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/league/:id" component={LeagueDetail} />
      <Route path="/csv-analyzer" component={CSVAnalyzer} />
      <Route path="/streamlit-style" component={StreamlitEquivalent} />
      <Route path="/matches" component={MatchAnalyzer} />
      <Route path="/matches-live" component={LiveMatches} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text-1)' }}>
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;