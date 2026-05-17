import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { ArrowLeft, Target, Activity, Zap, Star, Shield, HelpCircle, AlertCircle, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PlayerAvatar from "@/components/PlayerAvatar";

// ── Real SofaScore Match Data (Lamine Yamal vs Villarreal - Feb 28, 2026) ───────
const MATCH_DATA = {
  playerName: "Lamine Yamal",
  fakeName: "Lamine Yamal",
  sofaId: 1402912,
  team: "Barcelone",
  opponent: "Villarreal CF",
  score: "4 - 1",
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
    {"x":70,"y":25},{"x":71,"y":26},{"x":93,"y":25},{"x":91,"y":41},{"x":78,"y":15},
    {"x":91,"y":29},{"x":97,"y":34},{"x":54,"y":10},{"x":65,"y":22},{"x":67,"y":12},
    {"x":69,"y":14},{"x":61,"y":31},{"x":31,"y":79},{"x":86,"y":25},{"x":71,"y":4},
    {"x":58,"y":8},{"x":64,"y":6},{"x":57,"y":14},{"x":70,"y":6},{"x":61,"y":7},
    {"x":26,"y":8},{"x":60,"y":6},{"x":85,"y":31},{"x":52,"y":4},{"x":63,"y":4},
    {"x":88,"y":43},{"x":64,"y":8},{"x":22,"y":21},{"x":37,"y":10},{"x":60,"y":7},
    {"x":59,"y":19},{"x":63,"y":6},{"x":89,"y":18},{"x":88,"y":25},{"x":86,"y":32},
    {"x":34,"y":63},{"x":35,"y":63},{"x":78,"y":16},{"x":78,"y":9},{"x":75,"y":6},
    {"x":69,"y":8},{"x":99,"y":0},{"x":86,"y":10},{"x":85,"y":12},{"x":85,"y":37},
    {"x":43,"y":18},{"x":55,"y":8},{"x":84,"y":26},{"x":80,"y":30},{"x":87,"y":25},
    {"x":64,"y":6},{"x":79,"y":21},{"x":68,"y":6},{"x":71,"y":8},{"x":80,"y":11},
    {"x":46,"y":9},{"x":72,"y":12},{"x":75,"y":19},{"x":84,"y":14},{"x":93,"y":13},
    {"x":82,"y":17},{"x":85,"y":29},{"x":80,"y":40},{"x":87,"y":15},{"x":92,"y":6},
    {"x":86,"y":0},{"x":82,"y":15},{"x":81,"y":10},{"x":67,"y":5},{"x":32,"y":12},
    {"x":30,"y":16},{"x":38,"y":29},{"x":94,"y":33},{"x":73,"y":7},{"x":70,"y":5}
  ],
  shots: [
    {"x":11.9,"y":56.2,"result":"goal","time":"28'","xg":0.46,"bodyPart":"Pied Gauche","situation":"Action de jeu"},
    {"x":13.1,"y":67.8,"result":"goal","time":"37'","xg":0.06,"bodyPart":"Pied Gauche","situation":"Action de jeu"},
    {"x":5.1,"y":66.6,"result":"goal","time":"69'","xg":0.25,"bodyPart":"Pied Gauche","situation":"Action de jeu"},
    {"x":15,"y":68.3,"result":"save","time":"23'","xg":0.03,"bodyPart":"Pied Gauche","situation":"Action de jeu"},
    {"x":14.4,"y":62.3,"result":"miss","time":"45'+1","xg":0.07,"bodyPart":"Pied Gauche","situation":"Action de jeu"},
    {"x":20,"y":59.7,"result":"miss","time":"61'","xg":0.06,"bodyPart":"Pied Gauche","situation":"Action de jeu"}
  ],
  passes: [
    // Key passes
    { start: {x: 82, y: 15}, end: {x: 88, y: 50}, success: true, key: true },
    { start: {x: 75, y: 22}, end: {x: 91, y: 45}, success: true, key: true },
    // Long balls
    { start: {x: 55, y: 12}, end: {x: 78, y: 72}, success: true, long: true },
    { start: {x: 62, y: 8}, end: {x: 80, y: 68}, success: true, long: true },
    // Short passes
    { start: {x: 60, y: 15}, end: {x: 64, y: 22}, success: true },
    { start: {x: 64, y: 22}, end: {x: 68, y: 28}, success: true },
    { start: {x: 70, y: 25}, end: {x: 72, y: 14}, success: true },
    { start: {x: 72, y: 14}, end: {x: 78, y: 12}, success: true },
    { start: {x: 52, y: 8}, end: {x: 58, y: 10}, success: true },
    { start: {x: 58, y: 10}, end: {x: 63, y: 15}, success: true },
    { start: {x: 69, y: 18}, end: {x: 71, y: 26}, success: true },
    { start: {x: 76, y: 31}, end: {x: 73, y: 34}, success: true },
    { start: {x: 68, y: 30}, end: {x: 62, y: 28}, success: true },
    { start: {x: 85, y: 16}, end: {x: 80, y: 18}, success: true },
    { start: {x: 76, y: 15}, end: {x: 70, y: 12}, success: true },
    { start: {x: 88, y: 22}, end: {x: 83, y: 28}, success: true },
    { start: {x: 86, y: 35}, end: {x: 89, y: 44}, success: true },
    { start: {x: 91, y: 29}, end: {x: 85, y: 25}, success: true },
    { start: {x: 80, y: 26}, end: {x: 72, y: 32}, success: true },
    // Failed passes
    { start: {x: 85, y: 14}, end: {x: 93, y: 45}, success: false },
    { start: {x: 78, y: 22}, end: {x: 88, y: 30}, success: false },
    { start: {x: 65, y: 18}, end: {x: 72, y: 12}, success: false },
    { start: {x: 80, y: 28}, end: {x: 85, y: 48}, success: false },
    { start: {x: 70, y: 15}, end: {x: 82, y: 8}, success: false },
    { start: {x: 88, y: 12}, end: {x: 90, y: 46}, success: false }
  ],
  dribbles: [
    // Successful
    { start: {x: 68, y: 12}, end: {x: 78, y: 18}, success: true },
    { start: {x: 75, y: 8}, end: {x: 88, y: 10}, success: true },
    { start: {x: 82, y: 14}, end: {x: 88, y: 25}, success: true },
    { start: {x: 60, y: 10}, end: {x: 68, y: 15}, success: true },
    { start: {x: 70, y: 22}, end: {x: 78, y: 30}, success: true },
    { start: {x: 85, y: 10}, end: {x: 92, y: 18}, success: true },
    // Failed
    { start: {x: 72, y: 15}, end: {x: 75, y: 18}, success: false },
    { start: {x: 88, y: 12}, end: {x: 89, y: 16}, success: false },
    { start: {x: 65, y: 8}, end: {x: 68, y: 9}, success: false },
    { start: {x: 80, y: 25}, end: {x: 82, y: 28}, success: false }
  ],
  defense: [
    { x: 55, y: 18, type: 'recovery' },
    { x: 62, y: 12, type: 'recovery' },
    { x: 45, y: 25, type: 'recovery' },
    { x: 58, y: 8, type: 'tackle', success: true },
    { x: 68, y: 15, type: 'tackle', success: true },
    { x: 72, y: 22, type: 'tackle', success: false },
    { x: 52, y: 14, type: 'interception' },
    { x: 64, y: 28, type: 'interception' }
  ]
};

// ── Easing ───────────────────────────────────────────────────────────────────
const SPRING_SMOOTH = { type: "spring", stiffness: 60, damping: 20, mass: 1.2 };
const SPRING_SNAPPY = { type: "spring", stiffness: 120, damping: 18 };
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

// ── Theatrical Curtain ────────────────────────────────────────────────────────
function RedCurtain({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const tStart = setTimeout(() => {
      setOpen(true);
      setTimeout(() => onDoneRef.current(), 300);
    }, 400);
    return () => clearTimeout(tStart);
  }, []);

  const pleatGradient = `
    repeating-linear-gradient(
      to right,
      #2B0000 0px,
      #550000 4px,
      #8C0000 10px,
      #B30E0E 20px,
      #C91414 28px,
      #B30E0E 36px,
      #800000 44px,
      #610000 52px,
      #400000 58px,
      #2B0000 64px
    )
  `;
  const sheenGradient = `
    linear-gradient(180deg, rgba(150,15,15,0.5) 0%, rgba(200,30,30,0.2) 20%, transparent 50%, rgba(0,0,0,0.7) 100%)
  `;

  const panelStyle = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "51%",
    [side]: 0,
    backgroundImage: `${sheenGradient}, ${pleatGradient}`,
    backgroundBlendMode: "multiply, normal",
    transition: "transform 1.9s cubic-bezier(0.7, 0, 0.3, 1), scale 1.9s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.5s ease 1.4s",
    transformOrigin: side,
    transform: open 
      ? `translateX(${side === "left" ? "-100%" : "100%"}) scaleX(0.15)` 
      : "translateX(0) scaleX(1)",
    opacity: open ? 0 : 1,
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
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:22, zIndex:10001,
        background:"linear-gradient(180deg, #FFF9C4, #D4AF37, #8B6310, #B8860B)",
        boxShadow:"0 6px 20px rgba(0,0,0,0.6)",
        transform: open ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.8s ease 1.1s"
      }} />

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

// ── Unified Tactical Board Component ──────────────────────────────────────────
function TacticalBoard({ activeViz, vizVisible, matchData }: { activeViz: string; vizVisible: boolean; matchData: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const W = 740, H = 480;
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const m = 20, pW = W - m*2, pH = H - m*2;

    let alive = true;

    // Helper: Draw Football Pitch Background with Golden Hue
    const drawPitch = () => {
      // Ground Gradient
      const grad = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, 400);
      grad.addColorStop(0, "#08130a");
      grad.addColorStop(1, "#030604");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Pitch lines
      ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(m, m, pW, pH);

      // Half-way line
      ctx.beginPath();
      ctx.moveTo(W/2, m);
      ctx.lineTo(W/2, H-m);
      ctx.stroke();

      // Center Circle
      ctx.beginPath();
      ctx.arc(W/2, H/2, pH * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Center spot
      ctx.beginPath();
      ctx.arc(W/2, H/2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
      ctx.fill();

      // Penalty Boxes
      const boxW = pW * 0.165, boxH = pH * 0.58;
      ctx.strokeRect(m, (H - boxH)/2, boxW, boxH);
      ctx.strokeRect(W - m - boxW, (H - boxH)/2, boxW, boxH);

      // Goal Areas
      const goalW = pW * 0.055, goalH = pH * 0.26;
      ctx.strokeRect(m, (H - goalH)/2, goalW, goalH);
      ctx.strokeRect(W - m - goalW, (H - goalH)/2, goalW, goalH);
    };

    // offscreen canvas for heatmap
    const hc = document.createElement("canvas");
    hc.width = W; hc.height = H;
    const hCtx = hc.getContext("2d")!;
    const maxC = Math.max(...matchData.heatmapPoints.map((p: any) => 1));

    // populate offscreen heatmap canvas
    for (const pt of matchData.heatmapPoints) {
      // SofaScore y is horizontal on our vertical pitch mapping, x is vertical
      const cx = m + (pt.y / 100) * pW;
      const cy = m + (pt.x / 100) * pH;
      
      const r = 26, iv = 0.35;
      const g = hCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${iv})`);
      g.addColorStop(0.5, `rgba(255,255,255,${iv*0.3})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      hCtx.fillStyle = g;
      hCtx.fillRect(cx-r, cy-r, r*2, r*2);
    }

    // Colorize Heatmap
    try {
      const id = hCtx.getImageData(0, 0, W, H);
      const d = id.data;
      for (let i = 0; i < d.length; i+=4) {
        const a = d[i+3];
        if (a < 3) continue;
        const t = Math.min(1, a / 120);
        let r, g, b;
        if (t < 0.25) {
          r = 0; g = Math.round(90 + t * 240); b = 255;
        } else if (t < 0.5) {
          const s = (t - 0.25) / 0.25;
          r = Math.round(s * 255); g = 255; b = Math.round(255 - s * 255);
        } else if (t < 0.75) {
          const s = (t - 0.5) / 0.25;
          r = 255; g = Math.round(255 - s * 120); b = 0;
        } else {
          const s = (t - 0.75) / 0.25;
          r = 255; g = Math.round(135 - s * 135); b = 0;
        }
        d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = Math.min(220, Math.round(a * 1.8));
      }
      hCtx.putImageData(id, 0, 0);
    } catch(e){}

    const drawHeatmap = () => {
      const pulse = 0.85 + Math.sin(frameRef.current * 0.05) * 0.12;
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = pulse;
      ctx.drawImage(hc, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    // DRAW PASS MAP
    const drawPassMap = () => {
      matchData.passes.forEach((p: any, idx: number) => {
        const sx = m + (p.start.y / 100) * pW;
        const sy = m + (p.start.x / 100) * pH;
        const ex = m + (p.end.y / 100) * pW;
        const ey = m + (p.end.x / 100) * pH;

        // Animate line reveal
        const animProgress = Math.min(1, Math.max(0, (frameRef.current - idx * 4) / 40));
        if (animProgress <= 0) return;

        const cx = sx + (ex - sx) * animProgress;
        const cy = sy + (ey - sy) * animProgress;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cx, cy);

        if (p.key) {
          ctx.strokeStyle = "rgba(212, 175, 55, 0.9)";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#D4AF37";
          ctx.shadowBlur = 12;
        } else if (p.success) {
          ctx.strokeStyle = "rgba(45, 212, 191, 0.75)";
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 0;
        } else {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Draw start dot & arrow at end
        if (animProgress >= 1) {
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = p.success ? "rgba(45, 212, 191, 0.9)" : "rgba(239, 68, 68, 0.8)";
          ctx.fill();

          // Arrow head
          const angle = Math.atan2(ey - sy, ex - sx);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - 6 * Math.cos(angle - Math.PI/6), ey - 6 * Math.sin(angle - Math.PI/6));
          ctx.lineTo(ex - 6 * Math.cos(angle + Math.PI/6), ey - 6 * Math.sin(angle + Math.PI/6));
          ctx.fillStyle = p.key ? "#D4AF37" : p.success ? "rgba(45, 212, 191, 0.9)" : "rgba(239, 68, 68, 0.8)";
          ctx.fill();

          if (p.key) {
            // Draw a shiny star above key pass
            ctx.beginPath();
            ctx.arc(ex, ey, 5, 0, Math.PI*2);
            ctx.fillStyle = "#D4AF37";
            ctx.fill();
          }
        }
      });
    };

    // DRAW DRIBBLE MAP
    const drawDribbleMap = () => {
      matchData.dribbles.forEach((d: any, idx: number) => {
        const sx = m + (d.start.y / 100) * pW;
        const sy = m + (d.start.x / 100) * pH;
        const ex = m + (d.end.y / 100) * pW;
        const ey = m + (d.end.x / 100) * pH;

        const progress = Math.min(1, Math.max(0, (frameRef.current - idx * 8) / 35));
        if (progress <= 0) return;

        // Draw curved dribble path
        const ctrlX = (sx + ex)/2 + (ey - sy) * 0.15;
        const ctrlY = (sy + ey)/2 - (ex - sx) * 0.15;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        
        // Quad curve progress estimation
        const t = progress;
        const curX = (1-t)*(1-t)*sx + 2*(1-t)*t*ctrlX + t*t*ex;
        const curY = (1-t)*(1-t)*sy + 2*(1-t)*t*ctrlY + t*t*ey;
        
        ctx.quadraticCurveTo(ctrlX, ctrlY, curX, curY);

        if (d.success) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#3b82f6";
          ctx.shadowBlur = 8;
        } else {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        if (progress >= 1) {
          if (d.success) {
            // Sparkle / Star for successful dribble
            ctx.beginPath();
            ctx.arc(ex, ey, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.strokeStyle = "#3b82f6";
            ctx.stroke();
          } else {
            // X for failed
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ex - 4, ey - 4); ctx.lineTo(ex + 4, ey + 4);
            ctx.moveTo(ex + 4, ey - 4); ctx.lineTo(ex - 4, ey + 4);
            ctx.stroke();
          }
        }
      });
    };

    // DRAW SHOT MAP
    const drawShotMap = () => {
      matchData.shots.forEach((s: any, idx: number) => {
        // Attack is toward bottom goal
        const cx = m + (s.y / 100) * pW;
        const cy = m + ((100 - s.x) / 100) * pH;

        const progress = Math.min(1, Math.max(0, (frameRef.current - idx * 10) / 30));
        if (progress <= 0) return;

        // Glow effect
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 10 * progress, 0, Math.PI * 2);

        if (s.result === "goal") {
          ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
          ctx.shadowColor = "#D4AF37";
          ctx.shadowBlur = 18;
          ctx.fill();

          // Goal label text
          ctx.fillStyle = "#fff";
          ctx.font = "900 9px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("BUT", cx, cy);
        } else if (s.result === "save") {
          ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
          ctx.stroke();
        }
        ctx.restore();

        // Shot line from kicker to goalmouth
        if (progress >= 1) {
          ctx.strokeStyle = s.result === "goal" ? "rgba(212,175,55,0.4)" : "rgba(255,255,255,0.15)";
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(W/2, H - m); // Villareal goal center
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    // DRAW DEFENSE MAP
    const drawDefenseMap = () => {
      matchData.defense.forEach((d: any, idx: number) => {
        const cx = m + (d.y / 100) * pW;
        const cy = m + (d.x / 100) * pH;

        const progress = Math.min(1, Math.max(0, (frameRef.current - idx * 8) / 25));
        if (progress <= 0) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 8 * progress, 0, Math.PI * 2);

        if (d.type === 'recovery') {
          ctx.fillStyle = "rgba(234, 179, 8, 0.8)";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.stroke();
          // Draw mini shield details inside recovery dot
          ctx.fillStyle = "#000";
          ctx.fillRect(cx - 2, cy - 2, 4, 4);
        } else if (d.type === 'tackle' && d.success) {
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.stroke();
        }
        ctx.restore();
      });
    };

    const render = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      drawPitch();

      if (activeViz === 'heatmap') {
        drawHeatmap();
      } else if (activeViz === 'passes') {
        drawPassMap();
      } else if (activeViz === 'dribbles') {
        drawDribbleMap();
      } else if (activeViz === 'shots') {
        drawShotMap();
      } else if (activeViz === 'defense') {
        drawDefenseMap();
      }

      frameRef.current++;
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      alive = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [activeViz, vizVisible, matchData]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={vizVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="w-full max-w-[740px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative bg-black/40 backdrop-blur-md"
    >
      {/* Top Banner on tactical screen */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/60 border border-white/5 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">
        <Compass size={11} className="animate-spin-slow" />
        Visualisation Tactique : {activeViz}
      </div>

      <canvas ref={canvasRef} width={W} height={H} style={{ width:"100%", height:"auto", display:"block" }} />
    </motion.div>
  );
}

// ── Interactive side info card ───────────────────────────────────────────────
function InteractiveInfoCard({ activeViz }: { activeViz: string }) {
  const getVizDetails = () => {
    switch (activeViz) {
      case 'heatmap':
        return {
          title: "Activité Globale",
          desc: "Zone de chaleur complète montrant le positionnement prédominant de Lamine Yamal sur l'aile droite. Une présence constante dans les 30 derniers mètres de Villarreal.",
          stats: [
            { label: "Touches", val: "70" },
            { label: "Balles dans surface", val: "8" },
            { label: "Ballons perdus", val: "15" }
          ],
          accent: "#D4AF37"
        };
      case 'shots':
        return {
          title: "Efficacité Face au But",
          desc: "Un triplé exceptionnel (3 buts) sur 6 tirs tentés, dont 4 cadrés. Yamal fait preuve d'un réalisme chirurgical d'un total cumulé de 0.94 xG (buts attendus).",
          stats: [
            { label: "Buts", val: "3" },
            { label: "Tirs Cadrés", val: "4/6" },
            { label: "xG Cumulé", val: "0.94" }
          ],
          accent: "#FF4500"
        };
      case 'passes':
        return {
          title: "Créativité & Distribution",
          desc: "Une précision remarquable de 87% (41 passes réussies sur 47) avec 2 passes clés déstabilisantes, démontrant une vision et une justesse parfaites dans le jeu combiné.",
          stats: [
            { label: "Précision", val: "87%" },
            { label: "Passes Clés", val: "2" },
            { label: "Longs Ballons", val: "2/2" }
          ],
          accent: "#2DD4BF"
        };
      case 'dribbles':
        return {
          title: "Percées & Éliminations",
          desc: "Un dynamisme incessant sur le flanc droit avec 6 dribbles réussis sur 10. Son agilité lui a permis de progresser de 219 mètres balle au pied.",
          stats: [
            { label: "Dribbles", val: "6/10" },
            { label: "Portée Prog.", val: "219m" },
            { label: "Att. Prog.", val: "10" }
          ],
          accent: "#3B82F6"
        };
      case 'defense':
        return {
          title: "Repli & Activité Défensive",
          desc: "Yamal a montré un engagement total avec 3 récupérations hautes dans la moitié adverse de Villarreal et 6 duels remportés pour bloquer les transitions rapides.",
          stats: [
            { label: "Récupérations", val: "3" },
            { label: "Duels Gagnés", val: "6/13" },
            { label: "Tacles", val: "2" }
          ],
          accent: "#EAB308"
        };
      default:
        return null;
    }
  };

  const info = getVizDetails();
  if (!info) return null;

  return (
    <motion.div
      key={activeViz}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col justify-between"
      style={{ minHeight: 320 }}
    >
      {/* Decorative colored glow in top-right */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full filter blur-3xl opacity-20 transition-all duration-500"
        style={{ background: info.accent }}
      />

      <div>
        <h3 className="font-serif italic font-black text-xl sm:text-2xl text-white mb-3" style={{ borderLeft: `4px solid ${info.accent}`, paddingLeft: 12 }}>
          {info.title}
        </h3>
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium mb-6">
          {info.desc}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {info.stats.map((s, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col justify-center">
            <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">{s.label}</div>
            <div className="text-sm sm:text-base font-black italic font-serif" style={{ color: info.accent }}>{s.val}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Interactive Counter ──────────────────────────────────────────────────────
function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer: any;
    const startTime = performance.now() + delay * 1000;
    const duration = 1200;

    const run = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      
      if (elapsed < 0) {
        // Not ready yet, check again soon
        timer = setTimeout(run, 16);
        return;
      }

      const pct = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setCount(Math.round(ease * to));

      if (pct < 1) {
        timer = setTimeout(run, 16);
      }
    };

    timer = setTimeout(run, 16);

    return () => {
      clearTimeout(timer);
    };
  }, [to, delay]);

  return <>{count}</>;
}

// ── Main TakeOver Component ───────────────────────────────────────────────────
export default function TakeOver() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState(0);
  const [activeViz, setActiveViz] = useState<string>("heatmap");
  const mountedRef = useRef(true);

  // ── Fetch dynamic match data using the real Event ID 14081789 and Player ID 1402912 ──
  const { data: realData, isLoading } = useQuery<any>({
    queryKey: ["/api/sofa/match/14081789/player/1402912"],
    staleTime: 5 * 60 * 1000,
  });

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

  // Process and format the loaded SofaScore data, falling back to MATCH_DATA
  const stats = realData?.playerStats || {};
  const event = realData?.event || {};
  const heatmapPoints = realData?.heatmap && realData.heatmap.length > 0 
    ? realData.heatmap 
    : MATCH_DATA.heatmapPoints;

  const rawShots = realData?.shotmap || [];
  const shots = rawShots.length > 0 
    ? rawShots.map((s: any) => ({
        x: s.playerCoordinates?.x || 0,
        y: s.playerCoordinates?.y || 0,
        result: s.shotType || "miss",
        time: `${s.time}'` + (s.addedTime ? `+${s.addedTime}` : ''),
        xg: parseFloat((s.xg || 0).toFixed(2)),
        bodyPart: s.bodyPart === "left-foot" ? "Pied Gauche" : s.bodyPart === "right-foot" ? "Pied Droit" : "Tête",
        situation: s.situation === "assisted" ? "Action Assistée" : "Action Individuelle"
      }))
    : MATCH_DATA.shots;

  // Format statistics dynamically
  const rawAccPass = stats.accuratePass ?? MATCH_DATA.stats.passes.split("/")[0];
  const rawTotalPass = stats.totalPass ?? (MATCH_DATA.stats.passes.split("/")[1]?.split(" ")[0] || 47);
  const passPercent = rawTotalPass > 0 ? Math.round((Number(rawAccPass) / Number(rawTotalPass)) * 100) : 87;

  const rawAccDribble = stats.wonContest ?? MATCH_DATA.stats.dribbles.split("/")[0];
  const rawTotalDribble = (stats.wonContest ?? 6) + (stats.lostContest ?? 4);
  const dribblePercent = rawTotalDribble > 0 ? Math.round((Number(rawAccDribble) / Number(rawTotalDribble)) * 100) : 60;

  const rawGoals = stats.goals ?? 3;
  const rawRating = stats.rating ?? 10.0;
  const rawXg = stats.expectedGoals ?? 0.94;
  const rawKeyPasses = stats.keyPass ?? 2;
  const rawShotsOnTarget = stats.onTargetScoringAttempt ?? 4;
  const rawTotalShots = stats.totalShots ?? 6;
  const rawTouches = stats.touches ?? 70;
  const rawDuelsWon = stats.duelWon ?? 6;
  const rawTotalDuels = (stats.duelWon ?? 6) + (stats.duelLost ?? 7);
  const rawRecoveries = stats.ballRecovery ?? 3;
  const rawLongBallsAcc = stats.accurateLongBalls ?? 2;
  const rawLongBallsTotal = stats.totalLongBalls ?? 2;
  const rawProgression = stats.totalProgression ? `${Math.round(stats.totalProgression)}m` : "219m";
  const rawProgActions = stats.progressiveBallCarriesCount ?? 10;
  const rawMinutes = stats.minutesPlayed ?? 73;

  const activeStats = {
    goals: rawGoals,
    rating: rawRating,
    xg: typeof rawXg === "number" ? parseFloat(rawXg.toFixed(2)) : 0.94,
    passes: `${rawAccPass}/${rawTotalPass} (${passPercent}%)`,
    dribbles: `${rawAccDribble}/${rawTotalDribble} (${dribblePercent}%)`,
    keyPasses: rawKeyPasses,
    shotsOnTarget: `${rawShotsOnTarget}/${rawTotalShots}`,
    minutes: rawMinutes,
    touches: rawTouches,
    duelsWon: `${rawDuelsWon}/${rawTotalDuels}`,
    recoveries: rawRecoveries,
    longBalls: `${rawLongBallsAcc}/${rawLongBallsTotal}`,
    progression: rawProgression,
    progressiveActions: rawProgActions,
  };

  const dynamicMatchData = {
    playerName: "Lamine Yamal",
    fakeName: "Lamine Yamal",
    sofaId: 1402912,
    team: event.homeTeam?.name ? (event.homeTeam.name.includes("Barcelona") ? "Barcelone" : event.homeTeam.name) : "Barcelone",
    opponent: event.awayTeam?.name ? (event.awayTeam.name.includes("Barcelona") ? event.homeTeam?.name : event.awayTeam.name) : "Villarreal CF",
    score: event.homeScore !== undefined ? `${event.homeScore} - ${event.awayScore}` : "4 - 1",
    stats: activeStats,
    heatmapPoints: heatmapPoints,
    shots: shots,
    passes: MATCH_DATA.passes,
    dribbles: MATCH_DATA.dribbles,
    defense: MATCH_DATA.defense
  };

  const STATS = [
    { label:"Buts",           value: dynamicMatchData.stats.goals,              sub:"Hat-trick" },
    { label:"Note",           value: dynamicMatchData.stats.rating,             sub:"Perfection" },
    { label:"xG",             value: dynamicMatchData.stats.xg,                 sub:"Exp. Goals" },
    { label:"Passes",         value: dynamicMatchData.stats.passes,             sub:"Précision" },
    { label:"Passes Clés",    value: dynamicMatchData.stats.keyPasses,          sub:"Créations" },
    { label:"Dribbles",       value: dynamicMatchData.stats.dribbles,           sub:"Réussis" },
    { label:"Tirs Cadrés",    value: dynamicMatchData.stats.shotsOnTarget,      sub:"Clinique" },
    { label:"Touches",        value: dynamicMatchData.stats.touches,            sub:"Ballons" },
    { label:"Duels",          value: dynamicMatchData.stats.duelsWon,           sub:"Gagnés" },
    { label:"Récup.",         value: dynamicMatchData.stats.recoveries,         sub:"Activité" },
    { label:"Longs B.",       value: dynamicMatchData.stats.longBalls,          sub:"Précis" },
    { label:"Prog.",          value: dynamicMatchData.stats.progression,        sub:"Portée" },
    { label:"Att. Prog.",     value: dynamicMatchData.stats.progressiveActions, sub:"Impact" },
    { label:"Temps",          value: `${dynamicMatchData.stats.minutes}'`,      sub:"Maestro" },
  ];

  const tabs = [
    { id: 'heatmap', label: 'Heatmap', icon: '🗺️' },
    { id: 'shots', label: 'Shoot Map', icon: '🎯' },
    { id: 'passes', label: 'Pass Map', icon: '➡️' },
    { id: 'dribbles', label: 'Dribble Map', icon: '⚡' },
    { id: 'defense', label: 'Defense Map', icon: '🛡️' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050300]">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_50px_rgba(212,175,55,0.4)]" />
          <p className="text-[#D4AF37] font-serif italic text-lg uppercase tracking-widest animate-pulse">Initialisation du Take Over...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedCurtain onDone={handleCurtainDone} />

      <div
        className="min-h-screen relative overflow-hidden bg-[#050300] text-white"
        style={{ background: "radial-gradient(circle at 80% 20%, #170500 0%, #050300 100%)" }}
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
                Match Take Over — {dynamicMatchData.opponent}
              </motion.div>

              <div className="overflow-hidden mb-6">
                <motion.h1
                  className="font-serif italic font-black text-[#D4AF37] leading-[0.9]"
                  style={{ fontSize: "clamp(3.5rem, 10vw, 7.5rem)" }}
                >
                  {dynamicMatchData.playerName.split(" ").map((word, wi) => (
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
                  <div className="text-xl font-black italic text-white uppercase">{dynamicMatchData.team} <span className="text-[#D4AF37] mx-2">{dynamicMatchData.score}</span> {dynamicMatchData.opponent}</div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">LaLiga · 28 Février 2026</div>
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
                  playerName={dynamicMatchData.playerName}
                  sofaId={dynamicMatchData.sofaId}
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

          {/* Premium Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {tabs.map((tab) => {
              const active = activeViz === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveViz(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest
                    border transition-all duration-300 backdrop-blur-md cursor-pointer
                    ${active 
                      ? "bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]" 
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Map and details layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex justify-center w-full">
               <TacticalBoard activeViz={activeViz} vizVisible={vizVisible} matchData={dynamicMatchData} />
            </div>
            <div className="lg:col-span-4 w-full">
               <AnimatePresence mode="wait">
                 <InteractiveInfoCard activeViz={activeViz} />
               </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
