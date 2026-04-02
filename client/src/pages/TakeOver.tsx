import React, { useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Trophy, Activity, Zap } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";

// Verified Match Data for Lamine Yamal vs Villarreal - Powered by Match Analysis Service
const MATCH_DATA = {
  playerName: "Lamine Yamal",
  fakeName: "Wolfgang Amadeus Yamal",
  sofaId: 1402912,
  team: "Barcelone",
  opponent: "Villarreal CF",
  score: "5 - 1",
  stats: {
    goals: 3,
    assists: 0,
    rating: 10.0,
    passes: "41/47 (87%)",
    dribbles: "6/10 (60%)",
    keyPasses: 2,
    shotsOnTarget: "4/6",
    minutes: 73,
    touches: 70,
    xg: 0.94,
    duelsWon: "6/13",
    recoveries: 3,
    longBalls: "2/2",
    progression: "219m",
    progressiveActions: 10,
    foulsDrawn: 1
  },
  heatmapPoints: [
    {x: 70, y: 25}, {x: 71, y: 26}, {x: 93, y: 25}, {x: 91, y: 41}, {x: 78, y: 15}, {x: 91, y: 29}, {x: 97, y: 34}, {x: 54, y: 10}, {x: 65, y: 22}, {x: 67, y: 12}, {x: 69, y: 14}, {x: 61, y: 31}, {x: 31, y: 79}, {x: 86, y: 25}, {x: 71, y: 4}, {x: 58, y: 8}, {x: 64, y: 6}, {x: 57, y: 14}, {x: 70, y: 6}, {x: 61, y: 7}, {x: 26, y: 8}, {x: 60, y: 6}, {x: 85, y: 31}, {x: 52, y: 4}, {x: 63, y: 4}, {x: 88, y: 43}, {x: 64, y: 8}, {x: 22, y: 21}, {x: 37, y: 10}, {x: 60, y: 7}, {x: 59, y: 19}, {x: 63, y: 6}, {x: 89, y: 18}, {x: 88, y: 25}, {x: 86, y: 32}, {x: 34, y: 63}, {x: 35, y: 63}, {x: 78, y: 16}
  ],
  shots: [
    { x: 66.6, y: 5.1, result: 'goal', type: 'Shot', time: "28'", xg: 0.25 },
    { x: 67.8, y: 13.1, result: 'goal', type: 'Shot', time: "37'", xg: 0.15 },
    { x: 66.6, y: 5.1, result: 'goal', type: 'Shot', time: "69'", xg: 0.24 },
    { x: 59.7, y: 20, result: 'missed', type: 'Shot', time: "61'", xg: 0.10 },
    { x: 62.3, y: 14.4, result: 'missed', type: 'Header', time: "45+1'", xg: 0.08 },
    { x: 68.3, y: 15, result: 'saved', type: 'Shot', time: "23'", xg: 0.12 }
  ]
};

// ── Components ──────────────────────────────────────────────────────────────
function StatBox({ label, value, sub }: { label: string, value: string | number, sub?: string }) {
  return (
    <div className="bg-black/40 border border-[#D4AF37]/20 rounded-2xl p-4 backdrop-blur flex flex-col justify-center items-center text-center hover:border-[#D4AF37]/50 transition-colors group">
      <div className="text-[9px] text-[#D4AF37] uppercase tracking-widest font-black mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
      <div className="text-2xl font-black text-white group-hover:scale-110 transition-transform duration-300">
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-white/40 mt-1 font-bold uppercase tracking-tighter">
          {sub}
        </div>
      )}
    </div>
  );
}

function ImpactItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[#D4AF37] font-black uppercase text-xs tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
        {title}
      </div>
      <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}



// ── Heatmap Rendering ────────────────────────────────────────────────────────
function HeatmapCanvas({ points }: { points: Array<{x: number, y: number, count?: number}> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480; 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points?.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0e2818';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)'; // Gold pitch lines
    ctx.lineWidth = 1.2;
    const m = 20; 
    const pW = W - m*2, pH = H - m*2;
    ctx.strokeRect(m, m, pW, pH);
    ctx.beginPath(); ctx.moveTo(W/2, m); ctx.lineTo(W/2, H-m); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, pH*0.134, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, Math.PI*2); ctx.fillStyle='rgba(212, 175, 55, 0.8)'; ctx.fill();
    
    const paW = pW*0.157, paH = pH*0.593;
    ctx.strokeRect(m, (H-paH)/2, paW, paH);
    ctx.strokeRect(W-m-paW, (H-paH)/2, paW, paH);
    const gaW = pW*0.052, gaH = pH*0.269;
    ctx.strokeRect(m, (H-gaH)/2, gaW, gaH);
    ctx.strokeRect(W-m-gaW, (H-gaH)/2, gaW, gaH);

    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = W; heatCanvas.height = H;
    const hCtx = heatCanvas.getContext('2d')!;
    
    const maxCount = Math.max(...points.map(p => p.count || 1));
    for (const pt of points) {
      const cx = m + (pt.y / 100) * pW;
      const cy = m + (pt.x / 100) * pH;
      const count = pt.count || 1;
      const normCount = count / maxCount;
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
      else if (t < 0.35) { const s = (t - 0.2) / 0.15; r = Math.round(50 + 205 * s); g = Math.round(180 + 75 * s); b = Math.round(30 - 30 * s); } 
      else if (t < 0.70) { const s = (t - 0.35) / 0.35; r = 255; g = 255 - Math.round(60 * s); b = 0; } 
      else if (t < 0.85) { const s = (t - 0.70) / 0.15; r = 255; g = Math.round(195 - 95 * s); b = 0; } 
      else { const s = (t - 0.85) / 0.15; r = 255; g = Math.round(100 - 100 * s); b = 0; }
      d[i] = r; d[i+1] = g; d[i+2] = b;
      d[i+3] = Math.min(220, Math.round(a * 2.0));
    }
    
    hCtx.putImageData(imageData, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(heatCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }, [points]);

  return (
    <div className="w-full max-w-[740px] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative">
      <canvas ref={canvasRef} width={W} height={H} style={{width: '100%', height: 'auto', display: 'block'}} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-[#D4AF37]/40 pointer-events-none">
        <span className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] uppercase font-['Inter']">Sens de l'attaque</span>
        <div className="flex items-center">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D4AF37]"></div>
          <div className="w-1.5 h-1.5 border-t border-r border-[#D4AF37] rotate-45 -ml-1"></div>
        </div>
      </div>
    </div>
  );
}

// ── Shootmap Rendering ───────────────────────────────────────────────────────
function ShootmapCanvas({ shots }: { shots: Array<any> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 370, H = 480; // Half pitch

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1A0D00';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1.5;
    
    // Half pitch drawing (vertical)
    const m = 15;
    const pW = W - m*2, pH = H - m*2;
    ctx.strokeRect(m, m, pW, pH); // outline
    
    // Goal area (top)
    const gaW = pW * 0.35, gaH = pH * 0.1;
    ctx.strokeRect(m + (pW - gaW)/2, m, gaW, gaH);
    
    // Penalty area
    const paW = pW * 0.65, paH = pH * 0.25;
    ctx.strokeRect(m + (pW - paW)/2, m, paW, paH);
    
    // Penalty arc
    ctx.beginPath();
    ctx.arc(W/2, m + paH, pW*0.15, 0, Math.PI);
    ctx.stroke();

    // Goal line
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(m + (pW - gaW*0.3)/2, m);
    ctx.lineTo(m + (pW + gaW*0.3)/2, m);
    ctx.stroke();

    // Draw shots
    shots.forEach(s => {
      // mapping 100x100 to vertical half-pitch
      const cx = m + (s.y / 100) * pW;
      const cy = m + ((100 - s.x) / 50) * pH; // scale X (0-50 of full pitch) to H
      
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI*2);
      if (s.result === 'goal') {
        ctx.fillStyle = '#D4AF37'; // Gold for goal
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Shot info text
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 10px Inter';
      ctx.shadowBlur = 0;
      ctx.fillText(s.time, cx + 12, cy + 4);
    });

  }, [shots]);

  return (
    <div className="w-full max-w-[370px] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative">
      <canvas ref={canvasRef} width={W} height={H} style={{width: '100%', height: 'auto', display: 'block'}} />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-black/80 backdrop-blur p-3 rounded-xl border border-[#D4AF37]/20">
        <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase"><div className="w-3 h-3 rounded-full bg-[#D4AF37] border border-white"></div> Buts</div>
        <div className="flex items-center gap-2 text-[10px] text-white font-bold uppercase"><div className="w-3 h-3 rounded-full bg-white/20 border border-white/80"></div> Arrêts / Ratés</div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TakeOver() {
  const [, setLocation] = useLocation();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1A0D00 0%, #3B0000 100%)",
        color: "white"
      }}
    >
      {/* Decors */}
      <div style={{ position: "absolute", top: -50, right: -50, opacity: 0.05, pointerEvents: "none" }}>
         <svg width="400" height="600" viewBox="0 0 100 200" fill="none">
           <path d="M40 180 C10 180 10 150 30 140 C50 130 70 140 70 160 C70 180 30 180 30 110 C30 40 80 40 80 80 C80 100 50 110 50 80 C50 60 70 60 70 80 C70 120 40 120 40 180" stroke="#D4AF37" strokeWidth="3" fill="none" strokeLinecap="round"/>
         </svg>
      </div>

      {/* Floating Notes */}
      <motion.div animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: "absolute", top: "15%", left: "5%", fontSize: 80, color: "#D4AF37", pointerEvents: "none" }}>♪</motion.div>
      <motion.div animate={{ y: [0, -25, 0], opacity: [0.05, 0.2, 0.05] }} transition={{ duration: 8, repeat: Infinity, delay: 2 }} style={{ position: "absolute", bottom: "10%", right: "10%", fontSize: 120, color: "#D4AF37", pointerEvents: "none" }}>♫</motion.div>
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 10, repeat: Infinity }} style={{ position: "absolute", top: "40%", right: "20%", fontSize: 60, color: "#D4AF37", pointerEvents: "none" }}>♭</motion.div>

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 relative z-10">
        {/* Header */}
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors uppercase tracking-widest text-xs font-bold mb-12">
          <ArrowLeft size={16} /> Retour au Dashboard
        </button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
            <div className="inline-block px-4 py-1.5 border border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] rounded uppercase tracking-[0.2em] font-black text-xs">
              ⚡ ÉVÉNEMENT TAKE OVER — {MATCH_DATA.opponent.toUpperCase()}
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black italic font-serif text-[#D4AF37] leading-[0.9] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              {MATCH_DATA.fakeName}
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 font-light max-w-2xl leading-relaxed">
              « Le récital absolu. La défense de {MATCH_DATA.opponent} n'a pu que constater les dégâts face au chef d'orchestre blaugrana. »
            </p>
            
            <div className="flex items-center gap-6 pt-4">
              <div className="text-center">
                <div className="text-5xl font-black text-white">{MATCH_DATA.stats.rating}</div>
                <div className="text-[10px] uppercase text-[#D4AF37] font-bold tracking-widest">Note SofaScore</div>
              </div>
              <div className="w-px h-12 bg-[#D4AF37]/30"></div>
              <div className="text-left space-y-1">
                <div className="text-white text-lg font-bold">{MATCH_DATA.team} {MATCH_DATA.score} {MATCH_DATA.opponent}</div>
                <div className="text-white/50 text-sm">LaLiga · Saison 25/26</div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#D4AF37] p-2 bg-black shadow-[0_0_50px_rgba(212,175,55,0.6)] relative z-10">
              <PlayerAvatar playerName={MATCH_DATA.playerName} sofaId={MATCH_DATA.sofaId} size="xl" className="w-full h-full rounded-full object-cover" />
            </div>
          </motion.div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Stats Panel - Expanded to 14 metrics */}
          <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
            <StatBox label="Buts" value={MATCH_DATA.stats.goals} sub="Triple Historique" />
            <StatBox label="Expected Goals" value={MATCH_DATA.stats.xg} sub="xG" />
            <StatBox label="Passes" value={MATCH_DATA.stats.passes} sub="Précision 87%" />
            <StatBox label="Passes Clés" value={MATCH_DATA.stats.keyPasses} sub="Dangers créés" />
            <StatBox label="Dribbles" value={MATCH_DATA.stats.dribbles} sub="Succès" />
            <StatBox label="Tirs Cadrés" value={MATCH_DATA.stats.shotsOnTarget} sub="Clinicality" />
            <StatBox label="Touches" value={MATCH_DATA.stats.touches} sub="Ballons joués" />
            
            <StatBox label="Duels Gagnés" value={MATCH_DATA.stats.duelsWon} sub="6 sur 13" />
            <StatBox label="Récupérations" value={MATCH_DATA.stats.recoveries} sub="Activité" />
            <StatBox label="Long Ballons" value={MATCH_DATA.stats.longBalls} sub="Transversales" />
            <StatBox label="Dist. Prog." value={MATCH_DATA.stats.progression} sub="Gain de terrain" />
            <StatBox label="Actions Prog." value={MATCH_DATA.stats.progressiveActions} sub="Impact off." />
            <StatBox label="Fautes Subies" value={MATCH_DATA.stats.foulsDrawn} sub="Provocation" />
            <StatBox label="Temps de jeu" value={`${MATCH_DATA.stats.minutes}'`} sub="Maestro" />
          </div>

          {/* Visualizations */}
          <div className="lg:col-span-8 bg-black/30 border border-[#D4AF37]/20 rounded-3xl p-8 backdrop-blur">
            <div className="flex items-center gap-3 mb-8">
               <Activity size={24} className="text-[#D4AF37]" />
               <h3 className="text-2xl font-black uppercase text-white tracking-widest font-serif italic">Heatmap du Maestro</h3>
            </div>
            <p className="text-white/50 text-sm mb-12">Activité intense sur le flanc droit avec des percées axiales dévastatrices.</p>
            <div className="flex justify-center">
              <HeatmapCanvas points={MATCH_DATA.heatmapPoints} />
            </div>
          </div>

          <div className="lg:col-span-4 bg-black/30 border border-[#D4AF37]/20 rounded-3xl p-8 backdrop-blur flex flex-col items-center justify-between">
            <div className="w-full text-left">
              <div className="flex items-center gap-3 mb-4">
                 <Target size={24} className="text-[#D4AF37]" />
                 <h3 className="text-2xl font-black uppercase text-white tracking-widest font-serif italic">Shootmap</h3>
              </div>
              <p className="text-white/50 text-sm mb-8">Efficacité totale : 3 buts sur 6 tentatives.</p>
            </div>
            <ShootmapCanvas shots={MATCH_DATA.shots} />
            <div className="mt-8 text-center text-xs text-white/40 italic">
               Note SofaScore : 10.0 — Perfection Tactique
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
