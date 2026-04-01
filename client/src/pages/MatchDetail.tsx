import React, { useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

// ── Match Heatmap (same canvas approach) ────────────────────────────
function MatchHeatmap({ points }: { points: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0e2818';
    ctx.fillRect(0, 0, W, H);

    // Pitch markings
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.2;
    const m = 20;
    const pW = W - m*2, pH = H - m*2;
    ctx.strokeRect(m, m, pW, pH);
    ctx.beginPath(); ctx.moveTo(W/2, m); ctx.lineTo(W/2, H-m); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, pH*0.134, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fill();
    const paW2 = pW*0.157, paH2 = pH*0.593;
    ctx.strokeRect(m, (H-paH2)/2, paW2, paH2); ctx.strokeRect(W-m-paW2, (H-paH2)/2, paW2, paH2);
    const gaW2 = pW*0.052, gaH2 = pH*0.269;
    ctx.strokeRect(m, (H-gaH2)/2, gaW2, gaH2); ctx.strokeRect(W-m-gaW2, (H-gaH2)/2, gaW2, gaH2);

    // Heatmap
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = W; heatCanvas.height = H;
    const hCtx = heatCanvas.getContext('2d')!;
    // SofaScore coords are vertical
    const maxCount = Math.max(...points.map(p => p.count || 1));

    for (const pt of points) {
      const cx = m + (pt.y / 100) * pW;
      const cy = m + (pt.x / 100) * pH;
      const normCount = (pt.count || 1) / maxCount;
      const radius = 22 + normCount * 28;
      const intensity = 0.12 + normCount * 0.35;
      const gradient = hCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(255,255,255,${intensity})`);
      gradient.addColorStop(0.5, `rgba(255,255,255,${intensity * 0.4})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      hCtx.fillStyle = gradient;
      hCtx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    }

    const imageData = hCtx.getImageData(0, 0, W, H);
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a < 3) continue;
      
      const t = Math.min(1, a / 140);
      let r, g, b;
      
      if (t < 0.2) { r = 30; g = Math.round(80 + t * 200); b = 30; }
      else if (t < 0.35) { const s = (t-0.2)/0.15; r = Math.round(50+205*s); g = Math.round(180+75*s); b = Math.round(30-30*s); }
      else if (t < 0.70) { const s = (t-0.35)/0.35; r = 255; g = 255-Math.round(60*s); b = 0; }
      else if (t < 0.85) { const s = (t-0.70)/0.15; r = 255; g = Math.round(195-95*s); b = 0; }
      else { const s = (t-0.85)/0.15; r = 255; g = Math.round(100-100*s); b = 0; }
      
      d[i] = r; d[i+1] = g; d[i+2] = b;
      d[i+3] = Math.min(220, Math.round(a * 2.0));
    }
    hCtx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(heatCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }, [points]);

  return (
    <div className="w-full max-w-[740px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto relative">
      <canvas ref={canvasRef} width={W} height={H} style={{width: '100%', height: 'auto', display: 'block'}} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
        <span className="text-[9px] font-black text-white/60 tracking-[0.2em] uppercase font-['Rajdhani']">Sens de l'attaque</span>
        <div className="flex items-center">
          <div className="h-[1px] w-8 bg-gradient-to-r from-white/0 to-white/60"></div>
          <div className="w-1.5 h-1.5 border-t border-r border-white/60 rotate-45 -ml-1"></div>
        </div>
      </div>
    </div>
  );
}

// ── Match Shotmap ───────────────────────────────────────────────────
function MatchShotmap({ shots }: { shots: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 400, H = 480; // Half pitch (attacking upright)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shots?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pitch background
    ctx.fillStyle = '#0e2818';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.2;
    const m = 20;
    const pW = W - m*2, pH = H - m; 
    
    // Draw penalty area at top
    ctx.strokeRect(m + pW*0.21, m, pW*0.58, pH*0.3);
    // Goal area
    ctx.strokeRect(m + pW*0.36, m, pW*0.28, pH*0.1);
    // Center circle at bottom
    ctx.beginPath(); ctx.arc(W/2, H, pW*0.2, Math.PI, Math.PI*2); ctx.stroke();
    // Pitch outline
    ctx.strokeRect(m, m, pW, pH);

    // Render shots
    for (const s of shots) {
      if (!s.playerCoordinates) continue;
      // SofaScore: x=0 is goal line, y=50 is center
      const cx = m + (s.playerCoordinates.y / 100) * pW;
      const cy = m + (s.playerCoordinates.x / 100) * pH;
      
      ctx.beginPath();
      // Style based on shot type
      if (s.shotType === 'goal') {
        ctx.fillStyle = '#10B981'; // Green
        ctx.arc(cx, cy, 6, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (s.shotType === 'save') {
        ctx.fillStyle = '#3B82F6'; // Blue
        ctx.arc(cx, cy, 5, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#EF4444'; // Red (miss/block)
        ctx.arc(cx, cy, 4, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }, [shots]);

  return (
    <div className="w-full max-w-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto relative group">
      <canvas ref={canvasRef} width={W} height={H} style={{width: '100%', height: 'auto', display: 'block'}} />
      
      {/* Direction indicator for vertical map */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 px-1.5 py-4 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
        <div className="flex flex-col items-center">
          <div className="w-1.5 h-1.5 border-t border-l border-white/60 rotate-45 -mb-1"></div>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-white/0"></div>
        </div>
        <span className="text-[8px] font-black text-white/60 tracking-[0.2em] uppercase font-['Rajdhani'] [writing-mode:vertical-lr] rotate-180">Attaque</span>
      </div>

      <div className="flex justify-center gap-4 bg-black/40 p-3 text-[10px] font-bold uppercase tracking-wider text-white/50">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 border border-white"></span> But</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Cadré</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Raté / Bloqué</span>
      </div>
    </div>
  );
}

// ── Match Event Map (Passes, Actions) ───────────────────────────────
function MatchEventMap({ type, events }: { type: 'passes' | 'actions', events: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !events?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pitch background
    ctx.fillStyle = '#0e2818';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.2;
    const m = 20;
    const pW = W - m*2, pH = H - m*2;
    ctx.strokeRect(m, m, pW, pH);
    ctx.beginPath(); ctx.moveTo(W/2, m); ctx.lineTo(W/2, H-m); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, pH*0.134, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.fill();
    const paW2 = pW*0.157, paH2 = pH*0.593;
    ctx.strokeRect(m, (H-paH2)/2, paW2, paH2); ctx.strokeRect(W-m-paW2, (H-paH2)/2, paW2, paH2);
    const gaW2 = pW*0.052, gaH2 = pH*0.269;
    ctx.strokeRect(m, (H-gaH2)/2, gaW2, gaH2); ctx.strokeRect(W-m-gaW2, (H-gaH2)/2, gaW2, gaH2);

    for (const ev of events) {
      if (!ev.x || !ev.y) continue;
      const startX = m + (ev.y / 100) * pW;
      const startY = m + (ev.x / 100) * pH;

      ctx.beginPath();
      // Render event depending on whether it has an end coordinate (like a pass/run)
      if (ev.endX && ev.endY) {
        const endX = m + (ev.endY / 100) * pW;
        const endY = m + (ev.endX / 100) * pH;
        // Directional line (arrow)
        ctx.strokeStyle = ev.accurate !== false ? 'rgba(59, 130, 246, 0.7)' : 'rgba(239, 68, 68, 0.5)';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(endX, endY, 3, 0, Math.PI*2);
        ctx.fill();
      } else {
        // Simple point (like a tackle, interception, etc)
        ctx.fillStyle = type === 'actions' ? (ev.accurate !== false ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)') : 'rgba(59, 130, 246, 0.8)';
        ctx.arc(startX, startY, 4, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }, [events]);

  return (
    <div className="w-full max-w-[740px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto relative">
      <canvas ref={canvasRef} width={W} height={H} style={{width: '100%', height: 'auto', display: 'block'}} />
      
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 pointer-events-none">
        <span className="text-[9px] font-black text-white/60 tracking-[0.2em] uppercase font-['Rajdhani']">Sens de l'attaque</span>
        <div className="flex items-center">
          <div className="h-[1px] w-8 bg-gradient-to-r from-white/0 to-white/60"></div>
          <div className="w-1.5 h-1.5 border-t border-r border-white/60 rotate-45 -ml-1"></div>
        </div>
      </div>

      <div className="flex justify-center gap-4 bg-black/40 p-3 text-[10px] font-bold uppercase tracking-wider text-white/50">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${type === 'passes' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
          {type === 'passes' ? 'Réussi' : 'Action Réussie'}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Échec
        </span>
      </div>
    </div>
  );
}

// ── Stat Row Component ──────────────────────────────────────────────
function StatRow({ label, value, suffix }: { label: string; value: any; suffix?: string }) {
  if (value == null || value === undefined) return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors px-4">
      <span className="text-sm text-white/60 font-['Rajdhani'] uppercase tracking-wider">{label}</span>
      <span className="text-lg font-black font-['Barlow_Condensed'] text-white tabular-nums">
        {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
        {suffix && <span className="text-white/40 text-sm ml-1">{suffix}</span>}
      </span>
    </div>
  );
}

// ── Main Match Detail Page ──────────────────────────────────────────
export default function MatchDetail() {
  const { eventId, sofaId } = useParams();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<any>({
    queryKey: [`/api/sofa/match/${eventId}/player/${sofaId}`],
    enabled: !!eventId && !!sofaId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[var(--c-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-['Rajdhani'] uppercase tracking-widest">Chargement du match…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold font-['Rajdhani'] uppercase text-white">Match introuvable</h1>
          <button onClick={() => window.history.back()} className="btn-primary mt-4">← RETOUR</button>
        </div>
      </div>
    );
  }

  const ev = data.event;
  const s = data.playerStats;
  const heatmap = data.heatmap || [];
  const matchDate = ev?.date ? new Date(ev.date * 1000).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen text-white pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-8 animate-fade-in">
        
        {/* Navigation */}
        <button onClick={() => window.history.back()} className="btn-ghost !px-3 !h-10 text-xs text-gray-400">
          <ArrowLeft className="w-4 h-4 mr-2" /> RETOUR AU PROFIL
        </button>

        {/* ── Match Header ── */}
        {ev && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 text-center">
            <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-[0.3em] mb-4">
              {ev.tournament} · {matchDate}
            </div>
            {ev.venue && <div className="text-[10px] text-white/30 uppercase tracking-wider mb-6">{ev.venue}</div>}
            
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-3">
                <img src={ev.homeTeam.logo} alt="" className="w-16 h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }} />
                <div className="font-['Barlow_Condensed'] font-black text-lg uppercase">{ev.homeTeam.shortName || ev.homeTeam.name}</div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-5xl font-['Barlow_Condensed'] font-black">{ev.homeScore}</span>
                <span className="text-2xl text-white/20 font-light">-</span>
                <span className="text-5xl font-['Barlow_Condensed'] font-black">{ev.awayScore}</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <img src={ev.awayTeam.logo} alt="" className="w-16 h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }} />
                <div className="font-['Barlow_Condensed'] font-black text-lg uppercase">{ev.awayTeam.shortName || ev.awayTeam.name}</div>
              </div>
            </div>

            {s?.rating && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">NOTE DU JOUEUR</div>
                <div className={`inline-block px-6 py-2 rounded-2xl font-black text-3xl font-['Rajdhani'] ${s.rating >= 7.5 ? 'bg-[var(--c-accent)] text-black' : s.rating >= 6.8 ? 'bg-blue-500 text-black' : 'bg-orange-500 text-black'}`}>
                  {s.rating.toFixed(1)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Match Maps (Heatmap + Shotmap + Passes/Actions if available) ── */}
        {(heatmap.length > 0 || data.shotmap?.length > 0 || data.passes?.length > 0 || data.actions?.length > 0) && (
          <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-['Rajdhani'] font-bold text-white uppercase tracking-widest">Cartographie du Match</h3>
              <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-widest mt-1">
                DATA MAPS · SOFASCORE {(heatmap.length === 0) && "(Heatmap indisponible pour ce match)"}
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              {heatmap.length > 0 && (
                <div className="w-full flex-col items-center flex">
                  <h4 className="text-sm font-['Rajdhani'] uppercase tracking-widest text-white/50 text-center mb-4">Heatmap Globale</h4>
                  <MatchHeatmap points={heatmap} />
                </div>
              )}
              {data.shotmap && data.shotmap.length > 0 && (
                <div className="w-full flex-col items-center flex">
                  <h4 className="text-sm font-['Rajdhani'] uppercase tracking-widest text-white/50 text-center mb-4">Shotmap (Tirs)</h4>
                  <MatchShotmap shots={data.shotmap} />
                </div>
              )}
              {data.passes && data.passes.length > 0 && (
                <div className="w-full flex-col items-center flex">
                  <h4 className="text-sm font-['Rajdhani'] uppercase tracking-widest text-white/50 text-center mb-4">Passes</h4>
                  <MatchEventMap type="passes" events={data.passes} />
                </div>
              )}
              {data.actions && data.actions.length > 0 && (
                <div className="w-full flex-col items-center flex">
                  <h4 className="text-sm font-['Rajdhani'] uppercase tracking-widest text-white/50 text-center mb-4">Actions (Dribbles, Défense, Courses)</h4>
                  <MatchEventMap type="actions" events={data.actions} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Player Statistics ── */}
        {s && (
          <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-xl font-['Rajdhani'] font-bold text-white uppercase tracking-widest">Statistiques du Match</h3>
              <div className="text-[10px] text-[var(--c-accent)] font-bold uppercase tracking-widest mt-1">PERFORMANCES INDIVIDUELLES · SOFASCORE</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-px md:bg-white/5">
              {/* Column 1: Attacking & Passing */}
              <div className="bg-[#080B1E]">
                <div className="px-4 py-3 bg-red-500/10 border-b border-white/5">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">⚽ ATTAQUE & PASSES</span>
                </div>
                <StatRow label="Minutes jouées" value={s.minutesPlayed} suffix="min" />
                <StatRow label="Touches de balle" value={s.touches} />
                <StatRow label="Note du match" value={s.rating} />
                <StatRow label="Passes totales" value={s.totalPass != null ? `${s.accuratePass || 0}/${s.totalPass}` : null} />
                <StatRow label="Précision passes" value={s.totalPass ? Math.round((s.accuratePass/s.totalPass)*100) : null} suffix="%" />
                <StatRow label="Passes longues" value={s.totalLongBalls != null ? `${s.accurateLongBalls || 0}/${s.totalLongBalls}` : null} />
                <StatRow label="Passes clés" value={s.keyPass} />
                <StatRow label="Passes décisives" value={s.goalAssist} />
                <StatRow label="Centres" value={s.totalCross != null ? `${s.accurateCross || 0}/${s.totalCross}` : null} />
                <StatRow label="Tirs totaux" value={s.onTargetScoringAttempt != null ? `${s.onTargetScoringAttempt} cadrés / ${s.totalScoringAttempt || s.onTargetScoringAttempt} total` : null} />
                <StatRow label="Buts" value={s.goals} />
                <StatRow label="Expected Goals (xG)" value={s.expectedGoals} />
                <StatRow label="Expected Assists (xA)" value={s.expectedAssists} />
              </div>
              
              {/* Column 2: Defense & Duels */}
              <div className="bg-[#080B1E]">
                <div className="px-4 py-3 bg-amber-500/10 border-b border-white/5">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">🛡️ DÉFENSE & DUELS</span>
                </div>
                <StatRow label="Tacles" value={s.totalTackle} />
                <StatRow label="Interceptions" value={s.interceptionWon} />
                <StatRow label="Dégagements" value={s.totalClearance} />
                <StatRow label="Duels gagnés" value={s.duelWon != null ? `${s.duelWon}/${(s.duelWon||0) + (s.duelLost||0)}` : null} />
                <StatRow label="Duels aériens" value={s.aerialWon != null ? `${s.aerialWon}/${(s.aerialWon||0) + (s.aerialLost||0)}` : null} />
                <StatRow label="Dribbles réussis" value={s.successfulDribbles != null ? `${s.successfulDribbles}/${(s.successfulDribbles||0) + (s.failedDribbles||0)}` : null} />
                <StatRow label="Possession perdue" value={s.possessionLostCtrl} />
                <StatRow label="Fautes commises" value={s.fouls} />
                <StatRow label="Fautes subies" value={s.wasFouled} />
                <StatRow label="Hors-jeux" value={s.offsides || s.totalOffside} />
                <StatRow label="Récupérations" value={s.ballRecovery} />
                <StatRow label="Erreurs" value={s.errorLeadToAShot || s.errorLeadToGoal} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
