import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { ArrowLeft, Target, Activity, Zap, Star } from "lucide-react";
import PlayerAvatar from "@/components/PlayerAvatar";

// ── Match Data ───────────────────────────────────────────────────────────────
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
    foulsDrawn: 1,
  },
  heatmapPoints: [
    {x:70,y:25},{x:71,y:26},{x:93,y:25},{x:91,y:41},{x:78,y:15},
    {x:91,y:29},{x:97,y:34},{x:54,y:10},{x:65,y:22},{x:67,y:12},
    {x:69,y:14},{x:61,y:31},{x:31,y:79},{x:86,y:25},{x:71,y:4},
    {x:58,y:8},{x:64,y:6},{x:57,y:14},{x:70,y:6},{x:61,y:7},
    {x:26,y:8},{x:60,y:6},{x:85,y:31},{x:52,y:4},{x:63,y:4},
    {x:88,y:43},{x:64,y:8},{x:22,y:21},{x:37,y:10},{x:60,y:7},
    {x:59,y:19},{x:63,y:6},{x:89,y:18},{x:88,y:25},{x:86,y:32},
    {x:34,y:63},{x:35,y:63},{x:78,y:16}
  ],
  shots: [
    { x:66.6, y:5.1,  result:'goal',   type:'Shot',   time:"28'", xg:0.25 },
    { x:67.8, y:13.1, result:'goal',   type:'Shot',   time:"37'", xg:0.15 },
    { x:66.6, y:5.1,  result:'goal',   type:'Shot',   time:"69'", xg:0.24 },
    { x:59.7, y:20,   result:'missed', type:'Shot',   time:"61'", xg:0.10 },
    { x:62.3, y:14.4, result:'missed', type:'Header', time:"45+1'", xg:0.08 },
    { x:68.3, y:15,   result:'saved',  type:'Shot',   time:"23'", xg:0.12 },
  ],
};

// ── Easing ───────────────────────────────────────────────────────────────────
const SPRING_SMOOTH = { type: "spring", stiffness: 60, damping: 20, mass: 1.2 };
const SPRING_SNAPPY = { type: "spring", stiffness: 120, damping: 18 };
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

// ── Realistic Red Theater Curtain ────────────────────────────────────────────
function RedCurtain({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // Phase 1: Wait a bit, then start opening
    const tStart = setTimeout(() => {
      setOpen(true);
      // Phase 2: Once it starts moving, trigger the "glide up" of content behind it
      // 300ms after the physical curtain starts to part
      setTimeout(() => onDoneRef.current(), 300);
    }, 400);

    return () => clearTimeout(tStart);
  }, []);

  const pleatGradient = `
    repeating-linear-gradient(
      to right,
      #3D0000 0px,
      #6B0000 4px,
      #A80000 10px,
      #CC1010 20px,
      #E01818 28px,
      #CC1010 36px,
      #A00000 44px,
      #7A0000 52px,
      #550000 58px,
      #3D0000 64px
    )
  `;
  const sheenGradient = `
    linear-gradient(180deg, rgba(180,20,20,0.5) 0%, rgba(220,40,40,0.2) 20%, transparent 50%, rgba(0,0,0,0.6) 100%)
  `;

  const panelStyle = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "51%",
    [side]: 0,
    backgroundImage: `${sheenGradient}, ${pleatGradient}`,
    backgroundBlendMode: "multiply, normal",
    // Hyper-theatrical "whoosh" with scaling (bunching up) effect
    transition: "transform 1.9s cubic-bezier(0.7, 0, 0.3, 1), scale 1.9s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.5s ease 1.4s",
    transformOrigin: side,
    transform: open 
      ? `translateX(${side === "left" ? "-100%" : "100%"}) scaleX(0.15)` 
      : "translateX(0) scaleX(1)",
    opacity: open ? 0 : 1, // Full exit
    zIndex: 9999,
    boxShadow: side === "left"
      ? "inset -30px 0 60px rgba(0,0,0,0.9)"
      : "inset  30px 0 60px rgba(0,0,0,0.9)",
  });

  const Fringe = () => (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:35, display:"flex", alignItems:"flex-end" }}>
      {Array.from({ length: 42 }).map((_, i) => (
        <div key={i} style={{
          flex:1, margin:"0 1px", 
          height:`${22 + Math.sin(i * 0.9) * 10}px`,
          background:"linear-gradient(180deg, #FFD700, #B8860B, #4B3621)",
          borderRadius:"0 0 4px 4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }} />
      ))}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", perspective: 1500 }}>
      {/* Golden Rod */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:22, zIndex:10001,
        background:"linear-gradient(180deg, #FFF9C4, #D4AF37, #8B6310, #B8860B)",
        boxShadow:"0 6px 20px rgba(0,0,0,0.6)",
        transform: open ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.8s ease 1.1s"
      }} />

      {/* Panels */}
      <div style={panelStyle("left")}>
        <div style={{ 
          position:"absolute", right:40, color:"#FFD700", fontWeight:900, fontStyle:"italic", 
          fontSize:"clamp(30px, 6vw, 70px)", textShadow:"0 0 20px #D4AF37, 2px 2px 4px #000" 
        }}>Take</div>
        <Fringe />
      </div>
      <div style={panelStyle("right")}>
        <div style={{ 
          position:"absolute", left:40, color:"#FFD700", fontWeight:900, fontStyle:"italic", 
          fontSize:"clamp(30px, 6vw, 70px)", textShadow:"0 0 20px #D4AF37, 2px 2px 4px #000" 
        }}>Over</div>
        <Fringe />
      </div>

      {/* Dark Ambient Overcoat that fades */}
      <div style={{
        position:"absolute", inset:0, background:"rgba(0,0,0,0.95)",
        opacity: open ? 0 : 0.8, transition: "opacity 1.5s ease",
        zIndex: 9998
      }} />
    </div>
  );
}

// ── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({
  label, value, sub, delay = 0,
}: { label: string; value: string | number; sub?: string; delay?: number }) {
  const isTop = typeof value === "number" && value >= 9;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_SMOOTH, delay }}
      whileHover={{ y: -8, scale: 1.05 }}
      className={`
        relative overflow-hidden rounded-2xl p-4 flex flex-col justify-center items-center text-center
        bg-black/60 backdrop-blur-xl border transition-all duration-300
        ${isTop ? "border-[#D4AF37]/60 shadow-[0_0_30px_rgba(212,175,55,0.2)]" : "border-white/10"}
      `}
    >
      <div className="text-[10px] text-[#D4AF37]/80 uppercase tracking-widest font-black mb-1.5">{label}</div>
      <div className={`text-2xl sm:text-3xl font-black font-serif italic ${isTop ? "text-[#D4AF37]" : "text-white"}`}>
        {value}
      </div>
      {sub && <div className="text-[8px] text-white/40 mt-1 uppercase font-bold">{sub}</div>}
    </motion.div>
  );
}

// ── Heatmap Canvas ────────────────────────────────────────────────────────────
function HeatmapCanvas({ points, visible }: { points: Array<{x:number;y:number;count?:number}>; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480;
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points?.length) return;
    const ctx = canvas.getContext("2d")!;
    const m = 20, pW = W - m*2, pH = H - m*2;

    const hc = document.createElement("canvas");
    hc.width = W; hc.height = H;
    const hCtx = hc.getContext("2d")!;
    const maxC = Math.max(...points.map(p => p.count || 1));

    for (const pt of points) {
      const cx = m + (pt.y/100)*pW, cy = m + (pt.x/100)*pH;
      const n = (pt.count||1)/maxC;
      const r = 22 + n*28, iv = 0.12 + n*0.35;
      const g = hCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${iv})`);
      g.addColorStop(0.5, `rgba(255,255,255,${iv*0.4})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      hCtx.fillStyle = g;
      hCtx.fillRect(cx-r, cy-r, r*2, r*2);
    }
    const id = hCtx.getImageData(0, 0, W, H); const d = id.data;
    for (let i = 0; i < d.length; i+=4) {
      const a = d[i+3]; if (a<3) continue;
      const t = Math.min(1, a/140);
      let r, g, b;
      if(t<0.2){r=30;g=Math.round(80+t*200);b=30;}
      else if(t<0.35){const s=(t-0.2)/0.15;r=Math.round(50+205*s);g=Math.round(180+75*s);b=Math.round(30-30*s);}
      else if(t<0.70){const s=(t-0.35)/0.35;r=255;g=255-Math.round(60*s);b=0;}
      else if(t<0.85){const s=(t-0.70)/0.15;r=255;g=Math.round(195-95*s);b=0;}
      else{const s=(t-0.85)/0.15;r=255;g=Math.round(100-100*s);b=0;}
      d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=Math.min(220,Math.round(a*2.0));
    }
    hCtx.putImageData(id, 0, 0);

    let alive = true;
    const drawPitch = () => {
      ctx.fillStyle = "#0a1f10";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(212,175,55,0.3)"; ctx.lineWidth = 1;
      ctx.strokeRect(m, m, pW, pH);
      ctx.beginPath(); ctx.moveTo(W/2, m); ctx.lineTo(W/2, H-m); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2, H/2, pH*0.134, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, Math.PI*2);
      ctx.fillStyle="rgba(212,175,55,0.7)"; ctx.fill();
      const paW=pW*0.157,paH=pH*0.593;
      ctx.strokeRect(m,(H-paH)/2,paW,paH); ctx.strokeRect(W-m-paW,(H-paH)/2,paW,paH);
    };

    const render = () => {
      if (!alive) return;
      const pulse = 0.85 + Math.sin(frameRef.current * 0.04) * 0.15;
      drawPitch();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = pulse;
      ctx.drawImage(hc, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      frameRef.current++;
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => {
      alive = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [points]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={visible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1 }}
      className="w-full max-w-[740px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative"
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ width:"100%", height:"auto", display:"block" }} />
    </motion.div>
  );
}

// ── Shootmap Canvas ───────────────────────────────────────────────────────────
function ShootmapCanvas({ shots, visible }: { shots: Array<any>; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 370, H = 480;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => setShown(p => p < shots.length ? p+1 : p), 400);
    return () => clearInterval(interval);
  }, [visible, shots.length]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const m=15, pW=W-m*2, pH=H-m*2;
    ctx.fillStyle="#100800"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(212,175,55,0.25)"; ctx.lineWidth=1;
    ctx.strokeRect(m,m,pW,pH);
    
    shots.slice(0,shown).forEach(s => {
      const cx=m+(s.y/100)*pW, cy=m+((100-s.x)/50)*pH;
      ctx.beginPath(); ctx.arc(cx,cy,8,0,Math.PI*2);
      if(s.result==="goal"){
        ctx.fillStyle="#D4AF37"; ctx.fill();
        ctx.strokeStyle="#fff"; ctx.stroke();
      } else {
        ctx.fillStyle="rgba(255,255,255,0.1)"; ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,0.5)"; ctx.stroke();
      }
    });
  }, [shots, shown]);

  return (
    <motion.div
      initial={{ opacity:0, x:20 }}
      animate={visible ? { opacity:1, x:0 } : {}}
      transition={{ duration:1, delay:0.3 }}
      className="w-full max-w-[370px] rounded-2xl overflow-hidden border border-white/10"
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ width:"100%", height:"auto", display:"block" }} />
    </motion.div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, delay=0 }: { to: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf: number;
    let alive = true;
    const startTime = performance.now() + delay * 1000;
    const duration = 1200;
    const tick = (now: number) => {
      if (!alive) return;
      const elapsed = now - startTime;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const pct = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setCount(Math.round(ease * to));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [to, delay]);
  return <>{count}</>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TakeOver() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleCurtainDone = useCallback(() => {
    if (!mountedRef.current) return;
    setPhase(1); 
    const t = setTimeout(() => {
      if (mountedRef.current) setPhase(2);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  const curtainDone = phase >= 1;
  const vizVisible  = phase >= 2;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(springY, [-100, 100], [8, -8]);
  const rotateY = useTransform(springX, [-100, 100], [-8, 8]);

  const STATS = [
    { label:"Buts",           value: MATCH_DATA.stats.goals,              sub:"Hat-trick" },
    { label:"Note",           value: MATCH_DATA.stats.rating,             sub:"Perfection" },
    { label:"xG",             value: MATCH_DATA.stats.xg,                 sub:"Exp. Goals" },
    { label:"Passes",         value: MATCH_DATA.stats.passes,             sub:"87% Préc." },
    { label:"Passes Clés",    value: MATCH_DATA.stats.keyPasses,          sub:"Créations" },
    { label:"Dribbles",       value: MATCH_DATA.stats.dribbles,           sub:"6/10" },
    { label:"Tirs Cadrés",    value: MATCH_DATA.stats.shotsOnTarget,      sub:"Clinique" },
    { label:"Touches",        value: MATCH_DATA.stats.touches,            sub:"Ballons" },
    { label:"Duels",          value: MATCH_DATA.stats.duelsWon,           sub:"Gagnés" },
    { label:"Récup.",         value: MATCH_DATA.stats.recoveries,         sub:"Activité" },
    { label:"Longs B.",       value: MATCH_DATA.stats.longBalls,          sub:"Précis" },
    { label:"Prog.",          value: MATCH_DATA.stats.progression,        sub:"Portée" },
    { label:"Att. Prog.",     value: MATCH_DATA.stats.progressiveActions, sub:"Impact" },
    { label:"Temps",          value: `${MATCH_DATA.stats.minutes}'`,      sub:"Maestro" },
  ];

  return (
    <>
      <RedCurtain onDone={handleCurtainDone} />

      <div
        className="min-h-screen relative overflow-hidden bg-[#0a0600] text-white"
        style={{ background: "radial-gradient(circle at 80% 20%, #200800 0%, #0a0600 100%)" }}
      >
        {/* Back Button */}
        <motion.button
          initial={{ opacity:0 }}
          animate={curtainDone ? { opacity:1 } : {}}
          onClick={() => setLocation("/")}
          className="fixed top-8 left-8 z-50 flex items-center gap-3 text-[#D4AF37] text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Dashboard
        </motion.button>

        <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">

          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-20">
            
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity:0, y:20 }}
                animate={curtainDone ? { opacity:1, y:0 } : {}}
                className="inline-block px-4 py-1 border border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-8"
              >
                Match Take Over — {MATCH_DATA.opponent}
              </motion.div>

              <div className="overflow-hidden mb-6">
                <motion.h1
                  className="font-serif italic font-black text-[#D4AF37] leading-[0.9]"
                  style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)" }}
                >
                  {MATCH_DATA.fakeName.split(" ").map((word, wi) => (
                    <span key={wi} className="inline-block mr-[0.2em] overflow-hidden">
                      {word.split("").map((ch, ci) => (
                        <motion.span
                          key={ci}
                          initial={{ y: "110%", opacity: 0 }}
                          animate={curtainDone ? { y: "0%", opacity: 1 } : {}}
                          transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.1 + wi*0.1 + ci*0.04 }}
                          className="inline-block"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity:0, y:20 }}
                animate={curtainDone ? { opacity:1, y:0 } : {}}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-10 mt-10"
              >
                <div className="text-center">
                  <div className="text-6xl font-black italic font-serif text-white">
                    {curtainDone ? <Counter to={10} delay={0.8} /> : "0"}<span className="text-2xl text-[#D4AF37]">.0</span>
                  </div>
                  <div className="text-[10px] uppercase font-black text-[#D4AF37] tracking-widest mt-1">SofaScore</div>
                </div>
                <div className="text-left border-l border-white/20 pl-10">
                  <div className="text-xl font-black italic text-white uppercase">{MATCH_DATA.team} <span className="text-[#D4AF37] mx-2">{MATCH_DATA.score}</span> {MATCH_DATA.opponent}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">LaLiga · Saison 2025/26</div>
                </div>
              </motion.div>
            </div>

            {/* Avatar */}
            <motion.div
              initial={{ opacity:0, scale:0.8 }}
              animate={curtainDone ? { opacity:1, scale:1 } : {}}
              transition={{ ...SPRING_SMOOTH, delay: 0.4 }}
              className="relative"
            >
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-[#D4AF37] p-2 bg-black/40 shadow-[0_0_60px_rgba(212,175,55,0.3)]">
                <PlayerAvatar
                  playerName={MATCH_DATA.playerName}
                  sofaId={MATCH_DATA.sofaId}
                  size="xl"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16">
            {STATS.map((s, i) => (
              <StatBox key={i} {...s} delay={curtainDone ? 0.8 + i*0.08 : 999} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
               <HeatmapCanvas points={MATCH_DATA.heatmapPoints} visible={vizVisible} />
            </div>
            <div className="lg:col-span-4">
               <ShootmapCanvas shots={MATCH_DATA.shots} visible={vizVisible} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
