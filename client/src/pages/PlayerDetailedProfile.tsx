import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, TrendingUp, Shield, BarChart3, Flag, Map } from "lucide-react";
import PlayerAvatar, { TeamLogo } from "@/components/PlayerAvatar";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: any, dec = 1) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Number(v).toFixed(dec);
const fmtInt = (v: any) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Math.round(Number(v)).toString();

const posLabel: Record<string, string> = {
  FW: "AILIER / ATTAQUANT", MF: "MILIEU DE TERRAIN", DF: "DÉFENSEUR", GK: "GARDIEN DE BUT",
  "FW,MF": "AILIER OFFENSIF", "MF,FW": "MILIEU OFFENSIF", "DF,MF": "DÉFENSEUR POLYVALENT", "MF,DF": "MILIEU DÉFENSIF"
};

const leagueFlag: Record<string, string> = {
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "La Liga": "🇪🇸", "Ligue 1": "🇫🇷",
  "Serie A": "🇮🇹", "Bundesliga": "🇩🇪", "Eredivisie": "🇳🇱",
  "Primeira Liga": "🇵🇹", "Champions Lg": "🏆",
};

function getLeagueFlag(comp: string) {
  for (const key of Object.keys(leagueFlag)) {
    if (comp?.includes(key)) return " " + leagueFlag[key] + " " + key;
  }
  return comp;
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PlayerDetailedProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const playerName = decodeURIComponent(id as string).trim();

  const { data, isLoading, error } = useQuery<{ player: any; similar: any[] }>({
    queryKey: [`/api/csv-direct/player/${encodeURIComponent(playerName)}/full`],
    enabled: !!playerName,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-['Rajdhani'] uppercase tracking-widest">Chargement <span className="text-white font-bold">{playerName}</span>…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4 text-[var(--c-accent)]">⚽</div>
          <h1 className="text-3xl font-bold font-['Rajdhani'] uppercase text-white tracking-widest">Joueur introuvable</h1>
          <p className="text-gray-400">Impossible de trouver <span className="text-[var(--c-accent)] font-bold">{playerName}</span></p>
          <button onClick={() => setLocation("/")} className="mt-8 btn-primary">
            ← RETOUR
          </button>
        </div>
      </div>
    );
  }

  const p = data.player;
  const similar = data.similar || [];

  const age = Number(p.Age) || 29;
  
  // Format Name: First line white, second line BIG PINK (like Moses Simon)
  const nameParts = p.Player.split(" ");
  const firstName = nameParts.length > 1 ? nameParts[0] : "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : p.Player;
  
  const positionStr = posLabel[p.Pos] || p.Pos || "MILIEU DE TERRAIN";
  const mockValue = p?.Value || "12M€"; // Mocking as requested if missing
  const mockContractEnd = "JUIN 2026";
  const mockFoot = "DROIT";
  const mockHeight = "1,80M";

  // Chart data simulation points
  const g_a = (Number(p.Gls) || 0) + (Number(p.Ast) || 0);

  return (
    <div className="min-h-screen text-white relative pb-16">
      
      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6 animate-fade-in relative z-10">
        
        {/* ── Top Navigation ── */}
        <div className="flex items-center">
          <button onClick={() => setLocation("/")} className="btn-ghost !px-3 !h-10 text-xs text-gray-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> ACCUEIL
          </button>
        </div>

        {/* ── Player Hero Block ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4">
          {/* Left: Avatar & Name */}
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full border-4 border-[var(--c-accent)] overflow-hidden relative shadow-[0_0_20px_var(--c-accent-glow)] bg-slate-800">
              <PlayerAvatar
                playerName={p.Player}
                teamName={p.Squad}
                headshot={p.headshot}
                size="xl"
                showTeamBadge={false}
              />
            </div>
            <div>
              <div className="text-xl font-bold tracking-widest text-white uppercase">{firstName}</div>
              <div className="text-5xl md:text-6xl font-black italic tracking-tighter text-[var(--c-accent)] leading-none mb-3">
                {lastName.toUpperCase()}
              </div>
              <div className="flex items-center gap-3 font-['Rajdhani'] font-bold text-lg">
                <div className="flex items-center gap-2 text-white">
                  {p.logo && <TeamLogo logo={p.logo} teamName={p.Squad} size="sm" className="w-6 h-6 border border-white/20 rounded" />}
                  {p.Squad.toUpperCase()}
                </div>
                <div className="text-white/40 font-black text-xl italic px-2"></div>
                <div className="text-[var(--c-accent)] uppercase tracking-wider">
                  {getLeagueFlag(p.Comp).toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Value box */}
          <div className="flex flex-col items-center md:items-end">
            <div className="bg-white text-black font-['Rajdhani'] font-bold px-4 py-1 text-2xl rounded shadow-[0_0_20px_rgba(255,255,255,0.3)]">{mockValue}</div>
            <div className="text-[10px] font-['Montserrat'] font-bold uppercase tracking-widest text-white/60 mt-2 mb-1">FIN DE CONTRAT</div>
            <div className="text-[var(--c-accent)] font-bold font-['Rajdhani'] text-lg tracking-widest leading-none">{mockContractEnd}</div>
          </div>
        </div>

        {/* ── Horizontal Details Bar ── */}
        <div className="flex justify-center items-center gap-4 md:gap-8 py-4 border-y border-[var(--c-border-h)]">
          <div className="text-center flex flex-col items-center">
            <div className="font-['Rajdhani'] font-bold text-[var(--c-accent)] text-lg flex items-center gap-2">
              <Flag className="w-4 h-4 text-white" /> {p.Nation || "NCI"}
            </div>
          </div>
          <div className="text-[var(--c-accent)]/30 font-light text-2xl">|</div>
          
          <div className="text-center flex flex-col items-center">
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-2xl leading-none">{age} ANS</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">12/07/1995</div>
          </div>
          <div className="text-[var(--c-accent)]/30 font-light text-2xl">|</div>
          
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-white/50">PIED FORT</div>
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-xl leading-none">{mockFoot}</div>
          </div>
          <div className="text-[var(--c-accent)]/30 font-light text-2xl">|</div>
          
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-white/50">TAILLE</div>
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-xl leading-none">{mockHeight}</div>
          </div>
        </div>

        {/* ── Visual Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
          
          {/* Left panel: Pitch Area */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-white/50">POSTE PRINCIPAL</div>
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-3xl md:text-4xl italic tracking-tight mb-4">
              {positionStr}
            </div>
            
            <div className="w-full aspect-[4/5] bg-[var(--c-bg)] border-2 border-[var(--c-accent)]/30 relative overflow-hidden flex flex-col justify-end p-4 shadow-[inset_0_0_40px_rgba(34,197,94,0.1)]">
              {/* Pitch drawing simulation */}
              <div className="absolute inset-0 border-2 border-[var(--c-accent)]/40 m-6 mb-2"></div>
              <div className="absolute top-[20%] left-6 right-6 border-t-2 border-[var(--c-accent)]/40 h-10"></div>
              <div className="absolute bottom-2 left-[20%] right-[20%] border-2 border-[var(--c-accent)]/40 h-[25%] flex justify-center">
                <div className="border-2 border-[var(--c-accent)]/40 h-[40%] w-[50%] absolute bottom-0"></div>
              </div>
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-32 h-32 border-2 border-[var(--c-accent)]/40 rounded-full"></div>
              
              {/* Positional Dots - purely decorative based on the prompt DA */}
              <div className="absolute top-[30%] left-[15%] w-8 h-8 rounded-full bg-white border-4 border-[var(--c-accent)] shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-pulse-dot"></div>
              <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-[var(--c-accent)] opacity-80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <div className="absolute top-[30%] right-[15%] w-6 h-6 rounded-full bg-white border-4 border-[var(--c-accent)] opacity-80 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>
          </div>

          {/* Right panel: Graph & Stats */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-[var(--c-accent)] shadow-[0_0_10px_var(--c-accent)]"></div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-white">ÉVOLUTION DE LA VALEUR MARCHANDE</div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-[10px] uppercase tracking-widest text-white/50">VALEUR LA PLUS ÉLEVÉE</div>
              <div className="font-['Rajdhani'] font-bold text-[var(--c-accent)] text-xl">{mockValue}</div>
            </div>

            {/* Line Graph Mock */}
            <div className="w-full h-48 bg-transparent border-b border-l border-white/20 relative mb-8">
              {/* Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_19px,rgba(255,255,255,0.05)_20px)] bg-[length:100%_20px]"></div>
              
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline 
                  points="0,80 20,75 35,50 45,65 60,30 75,45 85,10 100,10" 
                  fill="none" 
                  stroke="var(--c-accent)" 
                  strokeWidth="2" 
                  className="drop-shadow-[0_4px_10px_rgba(34,197,94,0.6)]"
                />
                <circle cx="20" cy="75" r="2" fill="var(--c-accent)" />
                <circle cx="35" cy="50" r="2" fill="var(--c-accent)" />
                <circle cx="60" cy="30" r="2" fill="white" />
                <circle cx="85" cy="10" r="3" fill="var(--c-accent)" stroke="white" strokeWidth="1" />
                <circle cx="100" cy="10" r="3" fill="var(--c-accent)" stroke="white" strokeWidth="1" />
              </svg>
            </div>

            {/* Core Stats Overview Instead of overwhelming CSV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/10 p-4 rounded-lg">
                <div className="text-[10px] uppercase tracking-widest text-white">BUTS + PASSES</div>
                <div className="font-['Rajdhani'] font-black text-4xl mt-1 text-[var(--c-accent)]">{fmtInt(g_a)}</div>
              </div>
              <div className="bg-black/30 border border-white/10 p-4 rounded-lg">
                <div className="text-[10px] uppercase tracking-widest text-white/50">TIRS TENTÉS</div>
                <div className="font-['Rajdhani'] font-black text-4xl mt-1 text-white">{fmtInt(p.Sh)}</div>
              </div>
              <div className="bg-black/30 border border-white/10 p-4 rounded-lg">
                <div className="text-[10px] uppercase tracking-widest text-white/50">xG (ATTENDU)</div>
                <div className="font-['Rajdhani'] font-black text-3xl mt-1 text-white">{fmt(p.xG)}</div>
              </div>
              <div className="bg-black/30 border border-white/10 p-4 rounded-lg text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/50">MINUTES JOUÉES</div>
                <div className="font-['Rajdhani'] font-black text-3xl mt-1 text-[var(--c-accent)]">{fmtInt(p.Min)}'</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar Players ── */}
        {similar.length > 0 && (
          <div className="pt-10">
            <h3 className="text-xl md:text-2xl font-['Rajdhani'] font-bold uppercase tracking-wider mb-6 border-b border-[var(--c-border-h)] pb-2 flex items-center justify-between">
              <span>PROFILS STATISTIQUES SIMILAIRES <span className="text-[var(--c-accent)]">EN {p.Comp?.split(' ')[1] || p.Comp}</span></span>
            </h3>
            <div className="flex justify-center flex-wrap gap-8">
              {similar.slice(0, 3).map((s: any) => {
                const sNameParts = s.Player.split(" ");
                const sFirst = sNameParts.length > 1 ? sNameParts[0] : "";
                const sLast = sNameParts.length > 1 ? sNameParts.slice(1).join(" ") : s.Player;
                
                return (
                  <button
                    key={s.Player}
                    onClick={() => setLocation(`/joueur/${encodeURIComponent(s.Player)}`)}
                    className="flex flex-col items-center group transition-transform hover:scale-105"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-full border-[3px] border-[var(--c-accent)] overflow-hidden mb-3 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                       <PlayerAvatar
                          playerName={s.Player}
                          teamName={s.Squad}
                          headshot={s.headshot}
                          size="xl"
                          showTeamBadge={false}
                        />
                    </div>
                    <div className="font-['Rajdhani'] font-bold text-center leading-none">
                      <span className="text-white text-sm block">{sFirst.toUpperCase()}</span>
                      <span className="text-[var(--c-accent)] text-lg -mt-1 block">{sLast.toUpperCase()}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#a3b1c6] text-center mt-1">{s.Squad}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}