import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Target, BarChart3, Shield, Zap, TrendingUp, Award, Clock, Flag } from "lucide-react";
import { useLocation } from "wouter";
import PlayerAvatar, { TeamLogo } from "@/components/PlayerAvatar";

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: any, dec = 1) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Number(v).toFixed(dec);
const fmtInt = (v: any) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Math.round(Number(v)).toString();

const posLabel: Record<string, string> = {
  FW: "Attaquant", MF: "Milieu", DF: "Défenseur", GK: "Gardien",
  "FW,MF": "Att./Milieu", "MF,FW": "Milieu/Att.", "DF,MF": "Déf./Milieu", "MF,DF": "Milieu/Déf."
};

const leagueFlag: Record<string, string> = {
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "La Liga": "🇪🇸", "Ligue 1": "🇫🇷",
  "Serie A": "🇮🇹", "Bundesliga": "🇩🇪", "Eredivisie": "🇳🇱",
  "Primeira Liga": "🇵🇹", "Champions Lg": "🏆",
};

function getLeagueFlag(comp: string) {
  for (const key of Object.keys(leagueFlag)) {
    if (comp?.includes(key)) return leagueFlag[key];
  }
  return "🌍";
}

// Bar that maps a raw value to a color-coded percentage within [min, max]
function StatBar({ value, min = 0, max, label, unit = "" }: { value: any; min?: number; max: number; label: string; unit?: string }) {
  const num = Number(value);
  const pct = isNaN(num) ? 0 : Math.min(100, Math.max(0, ((num - min) / (max - min)) * 100));
  const color = pct >= 75 ? "#22c55e" : pct >= 50 ? "#eab308" : pct >= 25 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="w-40 text-xs text-gray-400 text-right shrink-0">{label}</div>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-14 text-xs font-bold text-right" style={{ color }}>
        {isNaN(num) ? "—" : `${fmt(num)}${unit}`}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "#60a5fa" }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-4 flex flex-col gap-1 hover:border-gray-500 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
      {children}
    </h2>
  );
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Chargement du profil de <span className="text-white font-bold">{playerName}</span>…</p>
        </div>
      </div>
    );
  }

  if (error || !data?.player) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚽</div>
          <h1 className="text-2xl font-bold text-white">Joueur introuvable</h1>
          <p className="text-gray-400">Impossible de trouver les données pour <span className="text-blue-400 font-bold">{playerName}</span></p>
          <button onClick={() => setLocation("/")} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const p = data.player;
  const similar = data.similar || [];

  const goals = Number(p.Gls) || 0;
  const assists = Number(p.Ast) || 0;
  const matches = Number(p.MP) || 0;
  const minutes = Number(p.Min) || 0;
  const xg = Number(p.xG) || 0;
  const xag = Number(p.xAG) || 0;
  const shots = Number(p.Sh) || 0;
  const soT = Number(p.SoT) || 0;
  const soTPct = Number(p['SoT%']) || 0;
  const prgC = Number(p.PrgC) || 0;
  const prgP = Number(p.PrgP) || 0;
  const prgR = Number(p.PrgR) || 0;
  const tkl = Number(p.TklW) || 0;
  const intrcpt = Number(p.Int) || 0;
  const crdY = Number(p.CrdY) || 0;
  const crdR = Number(p.CrdR) || 0;
  const crs = Number(p.Crs) || 0;
  const age = Number(p.Age) || 0;

  const per90 = minutes > 0 ? (90 / minutes) : 0;

  const positionLabel = posLabel[p.Pos] || p.Pos || "Joueur";
  const flag = getLeagueFlag(p.Comp || "");
  const initials = playerName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  // Gradient based on position
  const posGradient: Record<string, string> = {
    FW: "from-orange-900/40 via-red-900/30 to-gray-950",
    MF: "from-blue-900/40 via-indigo-900/30 to-gray-950",
    DF: "from-emerald-900/40 via-teal-900/30 to-gray-950",
    GK: "from-yellow-900/40 via-amber-900/30 to-gray-950",
  };
  const gradient = posGradient[p.Pos?.split(",")[0] || "MF"] || posGradient.MF;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${gradient} text-white`}>
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <span className="text-gray-600">|</span>
          <span className="text-white font-bold">{p.Player}</span>
          <span className="text-gray-500 text-sm">{p.Squad} • {positionLabel}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero Section ── */}
        <div className="flex flex-col md:flex-row items-start gap-8 bg-gray-900/40 rounded-3xl p-8 border border-gray-800">
          {/* Avatar */}
          <div className="relative">
            <PlayerAvatar
              playerName={p.Player}
              teamName={p.Squad}
              headshot={p.headshot}
              logo={p.logo}
              size="xl"
              showTeamBadge={true}
            />
            <div className="absolute -bottom-2 -right-2 bg-gray-950 border border-gray-700 rounded-lg px-2 py-1 text-xs font-bold text-blue-400 flex items-center gap-1">
              {p.logo && <TeamLogo logo={p.logo} teamName={p.Squad} size="sm" className="w-3 h-3" />}
              {positionLabel}
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-1">{p.Player}</h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-400 mb-4">
              <span className="flex items-center gap-1">{flag} {p.Comp}</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-2 text-blue-400 font-semibold">
                {p.logo && <TeamLogo logo={p.logo} teamName={p.Squad} size="sm" className="w-5 h-5" />}
                {p.Squad}
              </span>
              {age > 0 && <><span className="text-gray-600">•</span><span>{age} ans</span></>}
              {p.Nation && <><span className="text-gray-600">•</span><span><Flag className="w-4 h-4 inline mr-1" />{p.Nation}</span></>}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: "Matchs", value: fmtInt(matches) },
                { label: "Buts", value: fmtInt(goals) },
                { label: "Passes D.", value: fmtInt(assists) },
                { label: "B+PD", value: fmtInt(goals + assists) },
                { label: "xG", value: fmt(xg) },
                { label: "Minutes", value: fmtInt(minutes) },
              ].map(item => (
                <div key={item.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-white">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ATTAQUE */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><Target className="w-5 h-5 text-orange-400" /> Statistiques Offensives</SectionTitle>
            <div className="space-y-3">
              <StatBar label="Buts" value={goals} max={40} />
              <StatBar label="But / 90'" value={goals * per90} max={1.2} />
              <StatBar label="xG (attendu)" value={xg} max={40} />
              <StatBar label="Tirs / 90'" value={shots * per90} max={6} />
              <StatBar label="Tirs cadrés %" value={soTPct} max={100} unit="%" />
              <StatBar label="Passes D." value={assists} max={20} />
              <StatBar label="xAG (attendu)" value={xag} max={20} />
              <StatBar label="Centres" value={crs} max={150} />
            </div>
          </div>

          {/* PROGRESSION */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><TrendingUp className="w-5 h-5 text-blue-400" /> Progression & Création</SectionTitle>
            <div className="space-y-3">
              <StatBar label="Carries Progressives" value={prgC} max={300} />
              <StatBar label="Passes Progressives" value={prgP} max={400} />
              <StatBar label="Récep. Progressives" value={prgR} max={500} />
              <StatBar label="Carries prog. / 90'" value={prgC * per90} max={10} />
              <StatBar label="Passes prog. / 90'" value={prgP * per90} max={12} />
              <StatBar label="PK tentés" value={p.PKatt} max={10} />
              <StatBar label="PK convertis" value={p.PK} max={10} />
            </div>
          </div>

          {/* DÉFENSE */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><Shield className="w-5 h-5 text-emerald-400" /> Statistiques Défensives</SectionTitle>
            <div className="space-y-3">
              <StatBar label="Tacles gagnés" value={tkl} max={100} />
              <StatBar label="Interceptions" value={intrcpt} max={80} />
              <StatBar label="Fautes" value={p.Fls} max={80} />
              <StatBar label="Fautes subies" value={p.Fld} max={80} />
              <StatBar label="Hors-jeux" value={p.OG} max={20} />
            </div>

            {/* Cards */}
            <div className="mt-4 flex gap-4">
              <div className="flex-1 bg-yellow-900/30 border border-yellow-700/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-yellow-400">{fmtInt(crdY)}</div>
                <div className="text-xs text-gray-400 mt-1">🟨 Jaunes</div>
              </div>
              <div className="flex-1 bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-red-400">{fmtInt(crdR)}</div>
                <div className="text-xs text-gray-400 mt-1">🟥 Rouges</div>
              </div>
              <div className="flex-1 bg-orange-900/30 border border-orange-700/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-orange-400">{fmtInt(p['2CrdY'])}</div>
                <div className="text-xs text-gray-400 mt-1">🟨🟨 2e jaune</div>
              </div>
            </div>
          </div>

          {/* DONNÉES BRUTES */}
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><BarChart3 className="w-5 h-5 text-purple-400" /> Données Complètes CSV</SectionTitle>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Matchs joués", fmtInt(p.MP)],
                ["Titulaire", fmtInt(p.Starts)],
                ["Minutes totales", fmtInt(p.Min)],
                ["90' joués", fmt(p['90s'])],
                ["Buts", fmtInt(p.Gls)],
                ["Passes D.", fmtInt(p.Ast)],
                ["G+PD", fmtInt(p['G+A'])],
                ["Buts (hors PK)", fmtInt(p['G-PK'])],
                ["xG", fmt(p.xG)],
                ["npxG", fmt(p.npxG)],
                ["xAG", fmt(p.xAG)],
                ["npxG+xAG", fmt(p['npxG+xAG'])],
                ["Sh total", fmtInt(p.Sh)],
                ["Sh cadrés", fmtInt(p.SoT)],
                ["Sh/90'", fmt(p['Sh/90'])],
                ["SoT/90'", fmt(p['SoT/90'])],
                ["Dist. moy. tir", fmt(p.Dist)],
                ["Tirs FK", fmtInt(p.FK)],
                ["Tacles", fmtInt(p.Tkl)],
                ["Interceptions", fmtInt(p.Int)],
                ["Dégagements", fmtInt(p.Clr)],
                ["Centres", fmtInt(p.Crs)],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-1 border-b border-gray-800/60">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="font-bold text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Per 90 Stats ── */}
        {minutes > 0 && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><Zap className="w-5 h-5 text-yellow-400" /> Statistiques par 90 minutes</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: "Buts / 90'", value: fmt(goals * per90), color: "#f97316" },
                { label: "PD / 90'", value: fmt(assists * per90), color: "#3b82f6" },
                { label: "Tirs / 90'", value: fmt(shots * per90), color: "#a855f7" },
                { label: "Carries P. / 90'", value: fmt(prgC * per90), color: "#22c55e" },
                { label: "Passes P. / 90'", value: fmt(prgP * per90), color: "#06b6d4" },
                { label: "Réc. P. / 90'", value: fmt(prgR * per90), color: "#eab308" },
              ].map(item => (
                <div key={item.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                  <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Gardien de but (GK) ── */}
        {p.Pos?.includes("GK") && (Number(p.GA) || Number(p.Saves) || Number(p.CS)) ? (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle><Award className="w-5 h-5 text-yellow-400" /> Stats Gardien</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Buts encaissés", value: fmtInt(p.GA), color: "#ef4444" },
                { label: "Arrêts", value: fmtInt(p.Saves), color: "#22c55e" },
                { label: "% Arrêts", value: fmt(p['Save%']) + "%", color: "#3b82f6" },
                { label: "Clean Sheets", value: fmtInt(p.CS), color: "#a855f7" },
                { label: "V / N / D", value: `${fmtInt(p.W)}/${fmtInt(p.D)}/${fmtInt(p.L)}`, color: "#eab308" },
                { label: "PK arrêtés", value: fmtInt(p.PKsv), color: "#06b6d4" },
              ].map(item => (
                <div key={item.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Similar Players ── */}
        {similar.length > 0 && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
            <SectionTitle>👥 Joueurs similaires ({positionLabel})</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {similar.slice(0, 10).map((s: any) => (
                <button
                  key={s.Player}
                  onClick={() => setLocation(`/joueur/${encodeURIComponent(s.Player)}`)}
                  className="bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-blue-500/50 rounded-xl p-3 text-left transition-all group"
                >
                  <PlayerAvatar
                    playerName={s.Player}
                    teamName={s.Squad}
                    headshot={s.headshot}
                    logo={s.logo}
                    size="lg"
                    showTeamBadge={true}
                    className="mb-2"
                  />
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 truncate">{s.Player}</div>
                  <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                    {s.logo && <TeamLogo logo={s.logo} teamName={s.Squad} size="sm" className="w-3 h-3" />}
                    {s.Squad}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {fmtInt(s.Gls)}⚽ {fmtInt(s.Ast)}🅰️
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center text-gray-600 text-xs pb-8">
          <Clock className="w-3 h-3 inline mr-1" />
          Données saison 2025/2026 — Source: FBref • PlayerStats Analytics
        </div>
      </div>
    </div>
  );
}