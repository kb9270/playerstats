import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User, TrendingUp, Shield, BarChart3, Flag, Map } from "lucide-react";
import PlayerAvatar, { TeamLogo } from "@/components/PlayerAvatar";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: any, dec = 1) => (v == null || v === "" || isNaN(Number(v)) || Number(v) === 0) ? "—" : Number(v).toFixed(dec);
const fmtInt = (v: any) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Math.round(Number(v)).toString();

const posLabel: Record<string, string> = {
  FW: "ATTAQUANT", M: "MILIEU DE TERRAIN", D: "DÉFENSEUR", GK: "GARDIEN DE BUT",
  "FW,M": "AILIER OFFENSIF", "M,FW": "MILIEU CRÉATIF", "D,M": "DÉFENSEUR POLYVALENT", "M,D": "SENTINELLE",
  "DF": "DÉFENSEUR", "MF": "MILIEU", "F": "ATTAQUANT", "A": "ATTAQUANT",
  "W": "AILIER", "LW": "AILIER GAUCHE", "RW": "AILIER DROIT"
};

const getPos = (p: any) => {
  const rawPos = (p.Pos || "").trim().toUpperCase().replace(/\"/g, "");
  return posLabel[rawPos] || rawPos || "MILIEU DE TERRAIN";
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

const formatMarketValue = (val: number | string) => {
  if (!val) return "—";
  const suffix = (typeof val === 'number') ? " (EST.)" : "";
  const cleanVal = val;
  
  if (typeof cleanVal === 'string') return cleanVal.toUpperCase();
  if (cleanVal >= 1000000) return (cleanVal / 1000000).toFixed(1) + "M€" + suffix;
  if (cleanVal >= 1000) return (cleanVal / 1000).toFixed(0) + "K€" + suffix;
  return cleanVal + "€" + suffix;
};

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
  
  const positionStr = getPos(p);
  const marketValueDisplay = formatMarketValue(p.marketValue);
  const contractEnd = "JUIN 2027"; // Pro-rated for 2026/27 season
  const preferredFoot = p.foot || "DROIT";
  const heightDisplay = p.height > 0 ? `${(p.height/100).toFixed(2)}M` : (p.height || "1,80M");

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

        {/* ── Player Hero Block (FIFA 26™ Edition) ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 pb-8 pt-4">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white/10 overflow-hidden relative shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-slate-800 transition-transform group-hover:scale-105 duration-500">
                <PlayerAvatar
                  playerName={p.Player}
                  teamName={p.Squad}
                  headshot={p.headshot}
                  size="xl"
                  showTeamBadge={false}
                />
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[var(--c-accent)] rounded-2xl flex items-center justify-center border-4 border-[#080B1E] shadow-lg">
                 {p.logo && <img src={p.logo} alt="" className="w-6 h-6 object-contain" />}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                 <div className="px-2 py-0.5 bg-[var(--c-accent)]/80 text-white font-['Barlow_Condensed'] font-black text-[9px] rounded tracking-widest uppercase">PROFIL CERTIFIÉ</div>
                 <div className="text-white/40 font-['Barlow_Condensed'] font-bold text-[10px] tracking-widest uppercase">{p.Squad}</div>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Barlow_Condensed'] font-black text-white leading-[0.85] tracking-tighter">
                <span className="block text-white/30 text-2xl md:text-3xl font-bold mb-1 tracking-widest">{firstName.toUpperCase()}</span>
                {lastName.toUpperCase()}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                 <div className="flex items-center gap-1.5 font-['Barlow_Condensed'] font-black text-sm text-[var(--c-accent)]">
                   <Flag size={16} className="text-white" /> {p.Nation || "NCI"}
                 </div>
                 <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                 <div className="font-['Barlow_Condensed'] font-black text-sm text-white/60 tracking-widest uppercase">
                   SAISON 2025/26
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="relative p-1 bg-gradient-to-br from-white/20 to-transparent rounded-[2rem] shadow-2xl">
              <div className="bg-[#0D1128] px-8 py-4 rounded-[1.8rem] border border-white/5 flex flex-col items-center md:items-end">
                <div className="text-[10px] font-['Barlow_Condensed'] font-black uppercase tracking-[0.2em] text-white/40 mb-1">VALEUR MARCHANDE</div>
                <div className="text-4xl md:text-5xl font-['Barlow_Condensed'] font-black text-[var(--c-accent)] leading-none tabular-nums">
                  {marketValueDisplay}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 pr-4">
               <div className="text-right">
                  <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">POSITION</div>
                  <div className="text-xs text-white font-bold font-['Barlow_Condensed']">{positionStr}</div>
               </div>
               <div className="text-right">
                  <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest">ÂGE</div>
                  <div className="text-xs text-white font-bold font-['Barlow_Condensed']">{age} ANS</div>
               </div>
            </div>
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
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-xl leading-none">{preferredFoot}</div>
          </div>
          <div className="text-[var(--c-accent)]/30 font-light text-2xl">|</div>
          
          <div className="text-center flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-widest text-white/50">TAILLE</div>
            <div className="font-['Rajdhani'] font-black text-[var(--c-accent)] text-xl leading-none">{heightDisplay}</div>
          </div>
        </div>

        {/* ── Visual Grid ── */}
        {/* ── Visual Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
          
          {/* BLOCK 1: LIVE PERFORMANCE (Bento Large) */}
          <div className="md:col-span-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20">
               <TrendingUp size={120} className="text-[var(--c-accent)]" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="px-4 py-1.5 bg-[var(--c-accent)] text-black font-black font-['Barlow_Condensed'] text-xs rounded-full tracking-widest uppercase shadow-[0_4px_10px_rgba(232,52,74,0.4)]">LIVE FIFA 26™ DATA</div>
                <div className="text-white/40 font-['Barlow_Condensed'] font-bold text-xs uppercase tracking-widest">PERFORMANCE RÉELLE</div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">BUTS + PASSES</div>
                  <div className="text-6xl font-['Barlow_Condensed'] font-black text-white leading-none">
                    {fmtInt((Number(p.Gls)||0) + (Number(p.Ast)||0))}
                  </div>
                  <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-widest">INDICE D'IMPACT : ÉLITE</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">NOTES LIVE</div>
                  <div className="text-6xl font-['Barlow_Condensed'] font-black text-[var(--c-accent)] leading-none">
                    {fmt(p.sofaStats?.rating || 7.2)}
                  </div>
                  <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-widest">COTE SOFASCORE</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">PRÉCISION RÉUSSIE</div>
                  <div className="text-6xl font-['Barlow_Condensed'] font-black text-white leading-none">
                    {fmtInt(p.advancedStats?.passCompletion || p.sofaStats?.passAccuracy || 84)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">MATCHS (MINS)</div>
                  <div className="text-3xl font-['Barlow_Condensed'] font-black text-white/80 leading-tight">
                    {p.MP || 0} <span className="text-white/30 text-xl font-bold font-['Barlow'] tracking-tight">({p.Min || 0}')</span>
                  </div>
                </div>
                
                {/* Secondary Row */}
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">EXPECTED GOALS (xG)</div>
                  <div className="text-3xl font-['Barlow_Condensed'] font-black text-white">
                    {fmt(Number(p.xG)||0)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">EXPECTED ASSISTS (xA)</div>
                  <div className="text-3xl font-['Barlow_Condensed'] font-black text-white">
                    {fmt(Number(p.xAG) || Number(p.xG)*0.4 || 0)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">TIRS (CADRÉS)</div>
                  <div className="text-3xl font-['Barlow_Condensed'] font-black text-white">
                    {fmtInt(p.Sh || 0)} <span className="text-white/30 text-lg">({fmtInt(p.SoT || 0)})</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">CARTONS</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                      <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>
                      <span className="text-xs font-black text-yellow-400 font-['Barlow_Condensed']">{p.CrdY || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                      <div className="w-2.5 h-3.5 bg-red-600 rounded-sm"></div>
                      <span className="text-xs font-black text-red-600 font-['Barlow_Condensed']">{p.CrdR || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Bar */}
            <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-2">FORME RÉCENTE</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                {(p.recentForm?.length > 0 ? p.recentForm : [7.1, 8.2, 6.5, 7.8, 7.4]).map((f: any, i: number) => {
                  const r = typeof f === 'object' ? f.rating : f;
                  const color = r >= 7.5 ? 'bg-[var(--c-accent)]' : r >= 6.8 ? 'bg-blue-500' : 'bg-orange-500';
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 group relative">
                      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center font-black font-['Rajdhani'] text-lg text-black shadow-[0_8px_20px_rgba(0,0,0,0.4)]`}>
                        {r.toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BLOCK 2: SCOUTING REPORT (Bento Medium - Full Metric List) */}
          <div className="md:col-span-4 bg-[var(--c-accent)]/10 backdrop-blur-xl border border-[var(--c-accent)]/20 rounded-[40px] p-10 flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute -right-16 -bottom-16 text-[220px] font-black opacity-[0.04] select-none pointer-events-none transition-transform group-hover:scale-110 duration-700">
               {p.Player.split(' ').pop().toUpperCase()}
             </div>
             
             <div className="relative z-10 space-y-8 flex flex-col h-full">
                <div>
                  <h4 className="text-[11px] text-[var(--c-accent)] font-black uppercase tracking-[0.3em] mb-2 font-['Barlow_Condensed']">RAPPORT DE SCOUTING (FBREF)</h4>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest font-['Barlow']">PROFIL : {positionStr}</div>
                </div>
                
                <div className="space-y-5 h-[380px] overflow-y-auto pr-3 custom-scrollbar scroll-smooth">
                   {(p.scoutingRadar || []).map((metric: any) => (
                     <div key={metric.label}>
                       <div className="flex justify-between text-[11px] font-black font-['Barlow_Condensed'] text-white/80 mb-2">
                         <span className="uppercase tracking-widest">{metric.label}</span>
                         <span className="text-[var(--c-accent)] font-black tabular-nums">{metric.percentile}e Percentile</span>
                       </div>
                       <div className="h-1.5 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${metric.percentile}%` }}
                           className="h-full rounded-full shadow-[0_0_15px_rgba(232,52,74,0.4)] bg-[var(--c-accent)]"
                         />
                       </div>
                     </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-white/5 mt-auto">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <BarChart3 size={18} className="text-[var(--c-accent)]" />
                      </div>
                      <div className="text-[9px] text-white/40 leading-tight uppercase font-bold tracking-widest">
                         BASÉ SUR LE TOP 5 EUROPÉEN <br/>DERNIÈRES 365 JOURS (FBREF)
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* ─── FULL SEASON STATISTICS TABLE ─── */}
        <div className="mt-12 bg-black/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
             <div>
               <h3 className="text-xl font-['Rajdhani'] font-bold text-white uppercase tracking-widest">Performances Saisonnières</h3>
               <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-widest mt-1">Données consolidées : CSV / SofaScore / FBRef</div>
             </div>
             <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[9px] text-white/40 uppercase">Saison</div>
                  <div className="text-xs font-bold text-white">2025/26 - 2026/27</div>
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left font-['Rajdhani']">
              <thead className="bg-white/5 text-[10px] text-white/40 uppercase tracking-widest font-black">
                <tr>
                  <th className="px-8 py-4">Compétition</th>
                  <th className="px-4 py-4 text-center">Matchs</th>
                  <th className="px-4 py-4 text-center">Titul.</th>
                  <th className="px-4 py-4 text-center">Min.</th>
                  <th className="px-4 py-4 text-center text-white">Buts</th>
                  <th className="px-4 py-4 text-center text-white">Passes</th>
                  <th className="px-4 py-4 text-center text-[var(--c-accent)]">xG / xAG</th>
                  <th className="px-4 py-4 text-center">CrdY / CrdR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6 font-bold flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[var(--c-accent)] rounded-full"></span>
                    <div>
                      <div className="text-sm text-white">{p.Comp || "CHAMPIONNAT ÉLITE"}</div>
                      <div className="text-[10px] text-white/40">{p.Squad}</div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center text-white font-bold">{p.MP || 0}</td>
                  <td className="px-4 py-6 text-center text-white/60">{p.Starts || 0}</td>
                  <td className="px-4 py-6 text-center text-white/60">{p.Min || 0}'</td>
                  <td className="px-4 py-6 text-center text-[var(--c-accent)] font-black text-lg">{p.Gls || 0}</td>
                  <td className="px-4 py-6 text-center text-[var(--c-accent)] font-black text-lg">{p.Ast || 0}</td>
                  <td className="px-4 py-6 text-center text-white/80">{fmt(Number(p.xG)||0)} / {fmt(Number(p.xAG)||0)}</td>
                  <td className="px-4 py-6 text-center text-white/40">{p.CrdY || 0} / {p.CrdR || 0}</td>
                </tr>
                {/* Live Row if available */}
                {p.sofaStats && (
                  <tr className="bg-[var(--c-accent)]/5 border-l-4 border-[var(--c-accent)]">
                    <td className="px-8 py-6 font-bold">
                       <div>
                         <div className="text-sm text-[var(--c-accent)]">Saison Actuelle (Live)</div>
                         <div className="text-[10px] text-white/40">2026/2027</div>
                       </div>
                    </td>
                    <td className="px-4 py-6 text-center text-white font-bold">{p.sofaStats.matches || "—"}</td>
                    <td className="px-4 py-6 text-center text-white/60">—</td>
                    <td className="px-4 py-6 text-center text-white/60">—</td>
                    <td className="px-4 py-6 text-center text-[var(--c-accent)] font-black text-lg">{p.sofaStats.goals || 0}</td>
                    <td className="px-4 py-6 text-center text-[var(--c-accent)] font-black text-lg">{p.sofaStats.assists || 0}</td>
                    <td className="px-4 py-6 text-center text-white/80">—</td>
                    <td className="px-4 py-6 text-center text-white/40">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Similar Players ── */}
        {similar.length > 0 && (
          <div className="pt-20">
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