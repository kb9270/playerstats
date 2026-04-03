import React, { useRef, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  motion,
  AnimatePresence,
  useAnimation,
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

// ── Easing / Physics ─────────────────────────────────────────────────────────
const SPRING_SMOOTH = { type: "spring", stiffness: 60, damping: 20, mass: 1.2 };
const SPRING_SNAPPY = { type: "spring", stiffness: 120, damping: 18 };
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_CINEMA = [0.76, 0, 0.24, 1] as const;

// ── Curtain reveal ──────────────────────────────────────────────────────────
function Curtain({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 1.4, ease: EASE_CINEMA, delay: 0.1 }}
      onAnimationComplete={onDone}
      style={{ transformOrigin: "top" }}
      className="fixed inset-0 z-[9999] bg-[#1A0D00] flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-[#D4AF37] font-serif italic text-5xl font-black select-none"
      >
        Take Over
      </motion.div>
    </motion.div>
  );
}

// ── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({
  label, value, sub, delay = 0,
}: { label: string; value: string | number; sub?: string; delay?: number }) {
  const isTop = typeof value === "number" && value >= 9;
  const controls = useAnimation();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_SMOOTH, delay }}
      whileHover={{ y: -6, scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`
        relative overflow-hidden rounded-2xl p-4 flex flex-col justify-center items-center text-center
        bg-black/50 backdrop-blur-md cursor-default
        border transition-colors duration-500
        ${isTop ? "border-[#D4AF37]/60 shadow-[0_0_28px_rgba(212,175,55,0.25)]" : "border-[#D4AF37]/15"}
      `}
    >
      {/* Gold shimmer on high-value */}
      {isTop && (
        <motion.div
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/12 to-transparent skew-x-12 pointer-events-none"
        />
      )}

      {/* Glow orb on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-[#D4AF37]/5 rounded-2xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="text-[9px] text-[#D4AF37]/70 uppercase tracking-[0.3em] font-black mb-1 relative z-10">
        {label}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_SNAPPY, delay: delay + 0.15 }}
        className={`
          relative z-10 font-black font-serif italic leading-none
          text-2xl sm:text-3xl
          ${isTop ? "text-[#D4AF37] drop-shadow-[0_0_16px_rgba(212,175,55,0.7)]" : "text-white"}
        `}
      >
        {value}
      </motion.div>
      {sub && (
        <div className="text-[9px] text-white/30 mt-1.5 font-bold uppercase tracking-tight relative z-10">
          {sub}
        </div>
      )}
    </motion.div>
  );
}

// ── Heatmap ──────────────────────────────────────────────────────────────────
function HeatmapCanvas({ points, visible }: { points: Array<{x:number;y:number;count?:number}>; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480;
  const frameRef = useRef(0);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points?.length) return;
    const ctx = canvas.getContext("2d")!;
    const m = 20, pW = W - m*2, pH = H - m*2;

    // ── Create offscreen heat canvas ONCE ──────────────────────────
    const hc = document.createElement("canvas");
    hc.width = W; hc.height = H;
    const hCtx = hc.getContext("2d")!;
    const maxC = Math.max(...points.map(p => p.count || 1));

    // Pre-render heatmap blobs into hc (static, not per-frame)
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
    // Colorize heatmap once
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

    // ── Animate: only redraw pitch + composite heatmap (no new canvas each frame) ──
    const drawPitch = () => {
      ctx.fillStyle = "#0a1f10";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(212,175,55,0.35)"; ctx.lineWidth = 1.2;
      ctx.strokeRect(m, m, pW, pH);
      ctx.beginPath(); ctx.moveTo(W/2, m); ctx.lineTo(W/2, H-m); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2, H/2, pH*0.134, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W/2, H/2, 3, 0, Math.PI*2);
      ctx.fillStyle="rgba(212,175,55,0.8)"; ctx.fill();
      const paW=pW*0.157,paH=pH*0.593;
      ctx.strokeRect(m,(H-paH)/2,paW,paH); ctx.strokeRect(W-m-paW,(H-paH)/2,paW,paH);
      const gaW=pW*0.052,gaH=pH*0.269;
      ctx.strokeRect(m,(H-gaH)/2,gaW,gaH); ctx.strokeRect(W-m-gaW,(H-gaH)/2,gaW,gaH);
    };

    const render = () => {
      // Pulse via globalAlpha only — zero GC pressure
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
    return () => cancelAnimationFrame(animRef.current!);
  }, [points]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
      animate={visible ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.2, ease: EASE_EXPO, delay: 0.2 }}
      className="w-full max-w-[740px] rounded-2xl overflow-hidden border border-[#D4AF37]/25 shadow-[0_0_40px_rgba(212,175,55,0.12)] relative group"
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ width:"100%", height:"auto", display:"block" }} />
      <motion.div
        initial={{ opacity:0, y:4 }}
        animate={visible ? { opacity:1, y:0 } : {}}
        transition={{ delay:1.2, duration:0.5 }}
        className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur rounded-full border border-[#D4AF37]/20 text-[8px] font-black text-[#D4AF37] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      >
        Intensité Temps Réel
      </motion.div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-[#D4AF37]/30 pointer-events-none whitespace-nowrap">
        <span className="text-[8px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">Sens de l'attaque</span>
        <div className="flex items-center">
          <div className="h-px w-6 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <div className="w-1.5 h-1.5 border-t border-r border-[#D4AF37] rotate-45 -ml-0.5" />
        </div>
      </div>
    </motion.div>
  );
}

// ── Shootmap ─────────────────────────────────────────────────────────────────
function ShootmapCanvas({ shots, visible }: { shots: Array<any>; visible: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 370, H = 480;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setShown(p => p < shots.length ? p+1 : p), 500);
    return () => clearInterval(t);
  }, [visible, shots.length]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const m=15, pW=W-m*2, pH=H-m*2;
    ctx.fillStyle="#160800"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="rgba(212,175,55,0.28)"; ctx.lineWidth=1.5;
    ctx.strokeRect(m,m,pW,pH);
    const gaW=pW*0.35,gaH=pH*0.1;
    ctx.strokeRect(m+(pW-gaW)/2,m,gaW,gaH);
    const paW=pW*0.65,paH=pH*0.25;
    ctx.strokeRect(m+(pW-paW)/2,m,paW,paH);
    ctx.beginPath(); ctx.arc(W/2,m+paH,pW*0.15,0,Math.PI); ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,0.6)"; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(m+(pW-gaW*0.3)/2,m); ctx.lineTo(m+(pW+gaW*0.3)/2,m); ctx.stroke();

    shots.slice(0,shown).forEach(s => {
      const cx=m+(s.y/100)*pW, cy=m+((100-s.x)/50)*pH;
      ctx.beginPath(); ctx.arc(cx,cy,9,0,Math.PI*2);
      ctx.shadowBlur=0;
      if(s.result==="goal"){
        ctx.fillStyle="#D4AF37"; ctx.shadowColor="#D4AF37"; ctx.shadowBlur=18;
        ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle="#fff"; ctx.lineWidth=2; ctx.stroke();
      } else {
        ctx.fillStyle="rgba(255,255,255,0.15)";
        ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,0.7)"; ctx.lineWidth=1.5; ctx.stroke();
      }
      ctx.fillStyle="rgba(255,255,255,0.85)";
      ctx.font="bold 9px Inter"; ctx.shadowBlur=0;
      ctx.fillText(s.time, cx+13, cy+4);
    });
  }, [shots, shown]);

  return (
    <motion.div
      initial={{ opacity:0, x:30, filter:"blur(8px)" }}
      animate={visible ? { opacity:1, x:0, filter:"blur(0px)" } : {}}
      transition={{ duration:1, ease:EASE_EXPO, delay:0.5 }}
      className="w-full max-w-[370px] rounded-2xl overflow-hidden border border-[#D4AF37]/25 shadow-[0_0_30px_rgba(212,175,55,0.12)] relative"
    >
      <canvas ref={canvasRef} width={W} height={H} style={{ width:"100%", height:"auto", display:"block" }} />
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 bg-black/80 backdrop-blur p-2.5 rounded-xl border border-[#D4AF37]/15 scale-90 origin-bottom-left sm:scale-100">
        <div className="flex items-center gap-2 text-[9px] text-white font-bold uppercase">
          <div className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" /> Buts
        </div>
        <div className="flex items-center gap-2 text-[9px] text-white font-bold uppercase">
          <div className="w-3 h-3 rounded-full bg-white/20 border border-white/70" /> Ratés / Arrêts
        </div>
      </div>
    </motion.div>
  );
}

// ── Animated number counter ───────────────────────────────────────────────────
function Counter({ to, delay=0 }: { to: number; delay?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let raf: number;
    const startTime = performance.now() + delay * 1000;
    const duration = 1400;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const pct = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 4);
      setCount(Math.round(ease * to));
      if (pct < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, delay]);
  return <>{count}</>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TakeOver() {
  const [, setLocation] = useLocation();
  const [curtainDone, setCurtainDone] = useState(false);
  const [vizVisible, setVizVisible] = useState(false);

  // Chain: curtain → hero revealed → after delay, show viz
  useEffect(() => {
    if (!curtainDone) return;
    const t = setTimeout(() => setVizVisible(true), 900);
    return () => clearTimeout(t);
  }, [curtainDone]);

  // Magnetic effect on avatar
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(springY, [-100, 100], [8, -8]);
  const rotateY = useTransform(springX, [-100, 100], [-8, 8]);

  const STATS = [
    { label:"Buts",           value: MATCH_DATA.stats.goals,              sub:"Hat-trick" },
    { label:"Note SofaScore", value: MATCH_DATA.stats.rating,             sub:"Perfection" },
    { label:"xG",             value: MATCH_DATA.stats.xg,                 sub:"Expected Goals" },
    { label:"Passes",         value: MATCH_DATA.stats.passes,             sub:"Précision 87%" },
    { label:"Passes Clés",    value: MATCH_DATA.stats.keyPasses,          sub:"Créations" },
    { label:"Dribbles",       value: MATCH_DATA.stats.dribbles,           sub:"Succès" },
    { label:"Tirs Cadrés",    value: MATCH_DATA.stats.shotsOnTarget,      sub:"Clinicality" },
    { label:"Touches",        value: MATCH_DATA.stats.touches,            sub:"Ballons joués" },
    { label:"Duels",          value: MATCH_DATA.stats.duelsWon,           sub:"Gagnés" },
    { label:"Récupérations",  value: MATCH_DATA.stats.recoveries,         sub:"Activité" },
    { label:"Long Ballons",   value: MATCH_DATA.stats.longBalls,          sub:"Transv." },
    { label:"Prog.",          value: MATCH_DATA.stats.progression,        sub:"Distance" },
    { label:"Act. Prog.",     value: MATCH_DATA.stats.progressiveActions, sub:"Impact off." },
    { label:"Temps",          value: `${MATCH_DATA.stats.minutes}'`,      sub:"Maestro" },
  ];

  return (
    <>
      {/* ── Curtain ── */}
      <Curtain onDone={() => setCurtainDone(true)} />

      <div
        className="min-h-screen relative overflow-hidden"
        style={{ background: "radial-gradient(ellipse 130% 80% at 80% 0%, #3B0800 0%, #1A0D00 50%, #0a0600 100%)", color:"#fff" }}
      >
        {/* ── Scanlines overlay ── */}
        <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.04]"
          style={{ background:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)" }}
        />

        {/* ── Animated background orbs ── */}
        <motion.div
          animate={{ scale:[1,1.3,1], opacity:[0.12,0.25,0.12] }}
          transition={{ duration:8, repeat:Infinity, ease:"easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale:[1,1.2,1], opacity:[0.06,0.15,0.06] }}
          transition={{ duration:12, repeat:Infinity, ease:"easeInOut", delay:3 }}
          className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, rgba(180,30,0,0.2) 0%, transparent 70%)" }}
        />

        {/* ── Floating ornaments ── */}
        <motion.div
          animate={{ y:[0,-40,0], x:[0,12,0], opacity:[0.08,0.28,0.08], rotate:[0,8,-4,0] }}
          transition={{ duration:8, repeat:Infinity, ease:"easeInOut" }}
          className="absolute top-[18%] left-[4%] text-[#D4AF37] pointer-events-none select-none"
          style={{ fontSize:"clamp(60px,10vw,100px)", filter:"blur(3px)" }}
        >♪</motion.div>
        <motion.div
          animate={{ y:[0,-60,0], x:[0,-18,0], opacity:[0.04,0.18,0.04], rotate:[0,-12,6,0] }}
          transition={{ duration:11, repeat:Infinity, ease:"easeInOut", delay:2 }}
          className="absolute bottom-[8%] right-[8%] text-[#D4AF37] pointer-events-none select-none"
          style={{ fontSize:"clamp(80px,14vw,140px)", filter:"blur(5px)" }}
        >♫</motion.div>
        <motion.div
          animate={{ rotate:[0,360], opacity:[0.03,0.09,0.03] }}
          transition={{ duration:25, repeat:Infinity, ease:"linear" }}
          className="absolute top-[30%] right-[15%] pointer-events-none border-2 border-dashed border-[#D4AF37]/20 rounded-full"
          style={{ width:"38vw", height:"38vw" }}
        />

        {/* ── Back button ── */}
        <motion.button
          initial={{ opacity:0, x:-24 }}
          animate={curtainDone ? { opacity:1, x:0 } : {}}
          transition={{ duration:0.7, ease:EASE_EXPO, delay:0.1 }}
          onClick={() => setLocation("/")}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors uppercase tracking-[0.3em] text-[9px] font-black group"
        >
          <motion.span whileHover={{ x:-4 }} transition={SPRING_SNAPPY}>
            <ArrowLeft size={13} />
          </motion.span>
          Dashboard
        </motion.button>

        {/* ── Main content ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-32 relative z-10">

          {/* ── Hero ── */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12 lg:gap-16 mb-20">

            {/* Text side */}
            <div className="flex-1 space-y-8 text-center lg:text-left">
              {/* Badge */}
              <motion.div
                initial={{ opacity:0, y:14 }}
                animate={curtainDone ? { opacity:1, y:0 } : {}}
                transition={{ duration:0.6, ease:EASE_EXPO, delay:0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#D4AF37]/35 bg-[#D4AF37]/6 backdrop-blur-sm text-[#D4AF37] rounded-sm uppercase tracking-[0.35em] font-black text-[9px]"
              >
                <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:1.5, repeat:Infinity }}>
                  <Zap size={9} />
                </motion.span>
                TAKE OVER — {MATCH_DATA.opponent.toUpperCase()}
              </motion.div>

              {/* Headline — letter reveal */}
              <div className="overflow-hidden">
                <motion.h1
                  className="font-black italic font-serif text-[#D4AF37] leading-[0.88] drop-shadow-[0_0_50px_rgba(212,175,55,0.25)]"
                  style={{ fontSize:"clamp(3rem,9vw,7rem)" }}
                >
                  {MATCH_DATA.fakeName.split(" ").map((word, wi) => (
                    <span key={wi} className="inline-block mr-[0.15em] overflow-hidden">
                      {word.split("").map((ch, ci) => (
                        <motion.span
                          key={ci}
                          initial={{ y:"100%", opacity:0 }}
                          animate={curtainDone ? { y:"0%", opacity:1 } : {}}
                          transition={{
                            duration: 0.85,
                            ease: EASE_EXPO,
                            delay: 0.15 + wi * 0.12 + ci * 0.035,
                          }}
                          className="inline-block"
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </motion.h1>
              </div>

              {/* Quote */}
              <motion.p
                initial={{ opacity:0, y:16 }}
                animate={curtainDone ? { opacity:1, y:0 } : {}}
                transition={{ duration:0.9, ease:EASE_EXPO, delay:0.7 }}
                className="text-base md:text-xl text-white/60 font-light max-w-xl leading-relaxed mx-auto lg:mx-0"
              >
                « Le récital absolu. La défense de{" "}
                <span className="text-[#D4AF37]/80 font-semibold">{MATCH_DATA.opponent}</span>{" "}
                n'a pu que constater les dégâts face au chef d'orchestre{" "}
                <span className="text-[#D4AF37] font-bold">blaugrana</span>. »
              </motion.p>

              {/* Score / rating row */}
              <motion.div
                initial={{ opacity:0, y:16 }}
                animate={curtainDone ? { opacity:1, y:0 } : {}}
                transition={{ duration:0.9, ease:EASE_EXPO, delay:0.85 }}
                className="flex items-center justify-center lg:justify-start gap-8"
              >
                <div className="text-center">
                  <div className="text-5xl font-black text-white italic font-serif leading-none">
                    {curtainDone ? <Counter to={10} delay={1} /> : "0"}
                    <span className="text-2xl text-[#D4AF37]">.0</span>
                  </div>
                  <div className="text-[9px] uppercase text-[#D4AF37] font-black tracking-[0.3em] mt-1">SofaScore</div>
                </div>
                <motion.div
                  initial={{ scaleY:0 }}
                  animate={curtainDone ? { scaleY:1 } : {}}
                  transition={{ duration:0.6, ease:EASE_EXPO, delay:1.1 }}
                  className="w-px h-14 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent"
                />
                <div className="text-left">
                  <div className="text-white font-black italic uppercase text-base md:text-lg">
                    {MATCH_DATA.team}{" "}
                    <span className="text-[#D4AF37] mx-2">{MATCH_DATA.score}</span>{" "}
                    {MATCH_DATA.opponent}
                  </div>
                  <div className="text-white/35 text-[9px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                    <Star size={8} className="text-[#D4AF37]" /> LaLiga · Saison 25/26
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Avatar — 3D tilt */}
            <motion.div
              initial={{ opacity:0, scale:0.75, rotate:-8 }}
              animate={curtainDone ? { opacity:1, scale:1, rotate:0 } : {}}
              transition={{ ...SPRING_SMOOTH, delay:0.4 }}
              className="relative"
              onMouseMove={e => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                mouseX.set(e.clientX - rect.left - rect.width/2);
                mouseY.set(e.clientY - rect.top  - rect.height/2);
              }}
              onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
              style={{ perspective:600 }}
            >
              <motion.div style={{ rotateX, rotateY }}>
                <div className="w-52 h-52 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full border-[5px] border-[#D4AF37] p-2 bg-black shadow-[0_0_80px_rgba(212,175,55,0.45)] relative z-10 overflow-hidden">
                  <motion.div
                    animate={{ scale:[1,1.06,1] }}
                    transition={{ duration:12, repeat:Infinity, ease:"easeInOut" }}
                    className="w-full h-full"
                  >
                    <PlayerAvatar
                      playerName={MATCH_DATA.playerName}
                      sofaId={MATCH_DATA.sofaId}
                      size="xl"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/15 via-transparent to-transparent pointer-events-none rounded-full" />
                </div>
                {/* Orbiting ring */}
                <motion.div
                  animate={{ rotate:360 }}
                  transition={{ duration:22, repeat:Infinity, ease:"linear" }}
                  className="absolute -inset-5 border border-dashed border-[#D4AF37]/20 rounded-full pointer-events-none"
                />
                <motion.div
                  animate={{ rotate:-360 }}
                  transition={{ duration:16, repeat:Infinity, ease:"linear" }}
                  className="absolute -inset-10 border border-dotted border-[#D4AF37]/10 rounded-full pointer-events-none"
                />
              </motion.div>
            </motion.div>
          </div>

          {/* ── Stats grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
            {STATS.map((s, i) => (
              <StatBox
                key={s.label}
                label={s.label}
                value={s.value}
                sub={s.sub}
                delay={curtainDone ? 0.6 + i * 0.06 : 999}
              />
            ))}
          </div>

          {/* ── Viz panels ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Heatmap */}
            <motion.div
              initial={{ opacity:0, y:40 }}
              animate={vizVisible ? { opacity:1, y:0 } : {}}
              transition={{ duration:1, ease:EASE_EXPO }}
              className="lg:col-span-8 rounded-3xl border border-[#D4AF37]/15 bg-black/40 backdrop-blur-md p-6 md:p-8 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/4 blur-3xl rounded-full pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate:15, scale:1.1 }}
                    transition={SPRING_SNAPPY}
                    className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20"
                  >
                    <Activity size={22} className="text-[#D4AF37]" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-white tracking-widest font-serif italic">Heatmap du Maestro</h3>
                    <motion.div
                      initial={{ width:0 }}
                      animate={vizVisible ? { width:"4rem" } : {}}
                      transition={{ duration:0.8, ease:EASE_EXPO, delay:0.3 }}
                      className="h-0.5 bg-[#D4AF37] mt-1"
                    />
                  </div>
                </div>
                <p className="text-white/35 text-[9px] font-bold uppercase tracking-[0.18em] max-w-xs leading-relaxed">
                  Activité intense flanc droit · percées axiales dévastatrices
                </p>
              </div>
              <div className="flex justify-center">
                <HeatmapCanvas points={MATCH_DATA.heatmapPoints} visible={vizVisible} />
              </div>
            </motion.div>

            {/* Shootmap */}
            <motion.div
              initial={{ opacity:0, y:40 }}
              animate={vizVisible ? { opacity:1, y:0 } : {}}
              transition={{ duration:1, ease:EASE_EXPO, delay:0.15 }}
              className="lg:col-span-4 rounded-3xl border border-[#D4AF37]/15 bg-black/40 backdrop-blur-md p-6 md:p-8 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl gap-6"
            >
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#D4AF37]/4 blur-3xl rounded-full pointer-events-none" />
              <div className="w-full">
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    whileHover={{ rotate:-15, scale:1.1 }}
                    transition={SPRING_SNAPPY}
                    className="p-3 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20"
                  >
                    <Target size={22} className="text-[#D4AF37]" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-white tracking-widest font-serif italic">Shootmap</h3>
                    <motion.div
                      initial={{ width:0 }}
                      animate={vizVisible ? { width:"3rem" } : {}}
                      transition={{ duration:0.8, ease:EASE_EXPO, delay:0.5 }}
                      className="h-0.5 bg-[#D4AF37] mt-1"
                    />
                  </div>
                </div>
                <p className="text-white/35 text-[9px] font-bold uppercase tracking-[0.18em]">
                  Efficacité : <span className="text-white">3 buts</span> / 6 tentatives
                </p>
              </div>
              <ShootmapCanvas shots={MATCH_DATA.shots} visible={vizVisible} />
              <motion.div
                initial={{ opacity:0, scale:0.8 }}
                animate={vizVisible ? { opacity:1, scale:1 } : {}}
                transition={{ delay:2.5, duration:0.6, ...SPRING_SNAPPY }}
                className="px-5 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full text-[8px] text-[#D4AF37] font-black uppercase tracking-[0.3em]"
              >
                Rating 10/10 — Perfection Tactique
              </motion.div>
            </motion.div>
          </div>

          {/* ── Footer ── */}
          <motion.div
            initial={{ opacity:0 }}
            animate={vizVisible ? { opacity:1 } : {}}
            transition={{ delay:2, duration:1 }}
            className="mt-20 text-center"
          >
            <div className="text-[8px] text-white/15 uppercase tracking-[0.5em] font-black">
              Match Analysis Service · Data Verified · LaLiga 2025/26
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
