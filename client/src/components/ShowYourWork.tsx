import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, X, BookOpen, Database } from "lucide-react";

interface MethodoProps {
  statLabel: string;
  statValue: string | number;
  children?: React.ReactNode;
}

// ── Stat definitions — shown when user clicks "?" ──────────
const STAT_DOCS: Record<string, { formula: string; code: string; source: string; interpretation: string }> = {
  "xG": {
    formula: "Σ P(goal | shot_i)",
    source: "FBRef / StatsBomb",
    interpretation: "Somme des probabilités de but de chaque tir. Un xG > buts réels = finisseur chanceux ou médiocrité. Un xG < buts = talent de finition.",
    code: `# Calcul xG simplifié
def shot_xG(shot):
    # Features: distance, angle, type, bodypart, situation
    distance = shot['distance']      # mètres
    angle = shot['angle']            # degrés
    header = shot['bodypart'] == 'head'
    
    # Régression logistique entraînée sur 300k+ tirs
    base = 0.04
    dist_factor = max(0, 1 - distance/40)
    angle_factor = abs(angle) / 90
    header_penalty = 0.6 if header else 1.0
    
    xG = base * dist_factor * angle_factor * header_penalty
    return min(xG, 0.99)  # Cap à 99%

player_xG = sum(shot_xG(s) for s in player_shots)`,
  },
  "PERCENTILE": {
    formula: "rank(v, peers) / len(peers) × 100",
    source: "Calculé en interne — CSV 2025/26",
    interpretation: "Position relative dans le groupe de pairs du même poste avec 200+ minutes jouées. Percentile 90 = meilleur que 90% des joueurs à ce poste.",
    code: `# Percentile réel par poste (TypeScript)
const computeRealPercentile = (
  playerVal: number,
  column: string,
  per90: boolean = false
): number => {
  const mins = player.Min;
  const pVal = per90 
    ? playerVal / (mins / 90) 
    : playerVal;
  
  // Peers = même poste, 200+ min (Top 5 EU)
  const peerValues = posPeers
    .map(p => {
      const v = Number(p[column]) || 0;
      const m = Number(p.Min) || 1;
      return per90 ? v / (m / 90) : v;
    })
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);
  
  const rank = peerValues.filter(v => v < pVal).length;
  return Math.round((rank / peerValues.length) * 100);
};`,
  },
  "SIMILARITE": {
    formula: "cos(A,B) = A·B / (|A| × |B|)",
    source: "Calculé en interne — 6 features normalisées",
    interpretation: "Distance cosinus entre vecteurs de statistiques per-90. Score de 1.0 = profil identique. Utilisé pour trouver des remplaçants ou des équivalents de marché.",
    code: `# Cosine Similarity — Joueurs similaires (Python)
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import numpy as np

FEATURES = [
  'Gls_90', 'Ast_90', 'xG_90', 
  'PrgC_90', 'Tkl_90', 'Int_90'
]

def find_similar_players(target_player, all_players, n=5):
    df = pd.DataFrame(all_players)
    
    # Normalisation Z-score (même poste uniquement)
    same_pos = df[df['Pos'] == target_player['Pos']]
    scaler = StandardScaler()
    X = scaler.fit_transform(same_pos[FEATURES].fillna(0))
    
    target_idx = same_pos.index.get_loc(target_player.name)
    sims = cosine_similarity([X[target_idx]], X)[0]
    
    top_idx = np.argsort(sims)[::-1][1:n+1]
    return same_pos.iloc[top_idx], sims[top_idx]`,
  },
  "xAG": {
    formula: "Σ P(assist | pass_i)",
    source: "FBRef / StatsBomb",
    interpretation: "Expected Assisted Goals — probabilité que chaque passe crée un but. Mesure la qualité des passes de dernière passe, indépendamment de la finition du partenaire.",
    code: `# xAG — Expected Assisted Goals
def compute_xAG(passes):
    """
    Chaque passe de dernière main reçoit un score
    basé sur la qualité de la situation de tir créée
    """
    total_xAG = 0
    for pass_ in passes:
        if pass_['key_pass']:
            # Le xAG = le xG du tir qui a suivi
            resulting_shot_xG = pass_.get('resulting_shot_xG', 0)
            total_xAG += resulting_shot_xG
    return round(total_xAG, 2)`,
  },
  "RATING": {
    formula: "Algorithme SofaScore (propriétaire)",
    source: "SofaScore API v1",
    interpretation: "Note moyenne pondérée sur l'ensemble des matchs de la saison. > 7.5 = joueur élite. La note tient compte de toutes les actions positives et négatives par rapport au rôle.",
    code: `// Récupération rating SofaScore — TypeScript
async function getPlayerRating(sofaId: number, tournamentId: number) {
  const resp = await axios.get(
    \`/api/v1/player/\${sofaId}/unique-tournament/\${tournamentId}/season/\${SEASON_ID}/statistics/overall\`,
    { headers: { 'User-Agent': 'PlayerStats/1.0' } }
  );
  
  const stats = resp.data.statistics;
  return {
    rating: stats.rating,           // Note moyenne saison
    matches: stats.appearances,     // Matchs joués
    goals: stats.goals,             // Buts (all compets)
    assists: stats.goalAssists,     // Passes D.
  };
}`,
  },
};

// ── Component ──────────────────────────────────────────────
export default function ShowYourWork({ statLabel, statValue, children }: MethodoProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const doc = STAT_DOCS[statLabel.toUpperCase()] || STAT_DOCS["PERCENTILE"];

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {children}
        <button
          onClick={() => setOpen(!open)}
          title="Voir la méthodologie"
          style={{
            width: 18, height: 18, borderRadius: "50%",
            background: open ? "rgba(129,140,248,0.3)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${open ? "rgba(129,140,248,0.6)" : "rgba(255,255,255,0.15)"}`,
            color: open ? "#818cf8" : "rgba(255,255,255,0.4)",
            fontSize: 10, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", flexShrink: 0,
          }}
        >?</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200,
              width: 420, background: "rgba(6,6,20,0.98)",
              border: "1px solid rgba(129,140,248,0.3)", borderRadius: 16,
              boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(129,140,248,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Code2 size={14} style={{ color: "#818cf8" }} />
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 13, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {statLabel} — Méthodologie
                </span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 2 }}>
                <X size={14} />
              </button>
            </div>

            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Valeur actuelle */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Valeur du joueur</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#fff", fontSize: 16, background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 6 }}>
                  {statValue}
                </span>
              </div>

              {/* Formule */}
              <div>
                <div style={{ fontSize: 10, color: "rgba(129,140,248,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Database size={10} /> Formule
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#e2e8f0", background: "rgba(129,140,248,0.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(129,140,248,0.15)" }}>
                  {doc.formula}
                </div>
              </div>

              {/* Source */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                <span style={{ color: "rgba(255,255,255,0.25)", marginRight: 4 }}>Source :</span>
                {doc.source}
              </div>

              {/* Interpretation */}
              <div>
                <div style={{ fontSize: 10, color: "rgba(250,204,21,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <BookOpen size={10} /> Interprétation
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>{doc.interpretation}</p>
              </div>

              {/* Code */}
              <div>
                <div style={{ fontSize: 10, color: "rgba(74,222,128,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Code2 size={10} /> Code réel utilisé
                </div>
                <pre style={{
                  margin: 0, fontSize: 10, lineHeight: 1.7,
                  background: "#0a0a1a", padding: "12px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#a5f3fc", fontFamily: "'JetBrains Mono', monospace",
                  overflowX: "auto", whiteSpace: "pre-wrap",
                  maxHeight: 200, overflowY: "auto",
                }}>
                  {doc.code}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
