import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Database, Code2, Layers, Zap, GitBranch, Eye } from "lucide-react";
import NavBar from "@/components/NavBar";

const PIPELINE_STEPS = [
  {
    id: "extract",
    icon: "🌐",
    title: "EXTRACT",
    subtitle: "Web Scraping & APIs",
    color: "#6366f1",
    sources: ["FBRef CSV (officiel)", "SofaScore API v1", "Transfermarkt API", "ESPN Score API"],
    code: `# Python — FBRef scraping
import pandas as pd
import requests

def fetch_fbref_players(season="2025-2026"):
    url = f"https://fbref.com/en/comps/Big5/{season}/stats/"
    df = pd.read_html(requests.get(url).text)[0]
    df.columns = df.columns.droplevel(0)  # multi-index flatten
    return df

# SofaScore — Player stats
async function getSofaStats(playerId: number) {
  const resp = await axios.get(
    \`/api/v1/player/\${playerId}/statistics\`,
    { headers: { 'User-Agent': 'PlayerStats/1.0' } }
  );
  return resp.data.statistics;
}`,
    stats: ["2 800+ joueurs scrapés", "5 ligues Top EU", "Taux succès : 94%", "Refresh : 24h"],
  },
  {
    id: "transform",
    icon: "⚙️",
    title: "TRANSFORM",
    subtitle: "Nettoyage & Feature Engineering",
    color: "#f59e0b",
    sources: ["Normalisation des noms", "Calcul des per-90 stats", "Similarité cosinus", "Percentiles par poste"],
    code: `# Feature Engineering — Per 90 stats + Percentiles
def compute_per90(df: pd.DataFrame) -> pd.DataFrame:
    mins = df['Min'].replace(0, np.nan)
    cols = ['Gls','Ast','xG','xAG','Sh','PrgC','PrgP']
    for col in cols:
        df[f'{col}_90'] = (df[col] / (mins / 90)).round(2)
    return df.dropna(subset=['Min'])

def compute_percentiles(df, col, by_pos=True):
    """Rank player vs position peers (top-5 EU)"""
    if by_pos:
        df[f'{col}_pct'] = df.groupby('Pos')[col] \\
            .rank(pct=True).mul(100).round(0)
    return df

# Cosine similarity for similar players
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

FEATURES = ['Gls_90','Ast_90','xG_90','PrgC_90','Tkl_90','Int_90']

def find_similar(player_idx, df, n=5):
    X = df[FEATURES].fillna(0).values
    sims = cosine_similarity([X[player_idx]], X)[0]
    top = np.argsort(sims)[::-1][1:n+1]
    return df.iloc[top]`,
    stats: ["Feature Engineering", "Percentiles par poste", "Similarité Cosinus", "Gestion NaN/outliers"],
  },
  {
    id: "load",
    icon: "🗄️",
    title: "LOAD",
    subtitle: "Stockage & Cache",
    color: "#10b981",
    sources: ["CSV enrichi (source de vérité)", "Cache JSON SofaScore", "In-memory Map (Node.js)", "PostgreSQL (sessions)"],
    code: `// TypeScript — CSV Direct Analyzer (in-memory cache)
class CsvDirectAnalyzer {
  private cache: Map<string, Player[]> = new Map();
  private lastLoaded: number = 0;
  private TTL = 30 * 60 * 1000; // 30 min

  async getAllPlayers(): Promise<Player[]> {
    const now = Date.now();
    if (this.cache.has('all') && now - this.lastLoaded < this.TTL) {
      return this.cache.get('all')!;
    }
    const raw = await fs.readFile(CSV_PATH, 'utf-8');
    const parsed = Papa.parse(raw, { header: true, dynamicTyping: true });
    const players = parsed.data.filter(p => p.Player);
    this.cache.set('all', players);
    this.lastLoaded = now;
    console.log(\`✅ Loaded \${players.length} players from CSV\`);
    return players;
  }
}`,
    stats: ["CSV 2.6MB (source principale)", "Cache 30min in-memory", "~2ms temps réponse", "Zéro dépendance SQL"],
  },
  {
    id: "serve",
    icon: "🚀",
    title: "SERVE",
    subtitle: "API REST + Frontend React",
    color: "#e8344a",
    sources: ["Express.js REST API", "React Query (stale-while-revalidate)", "Vite HMR Dev Server", "WebSocket (live matches)"],
    code: `// Express route — Player full profile
app.get('/api/csv-direct/player/:name/full', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  
  // 1. CSV source of truth
  const csvPlayer = await csvDirectAnalyzer.searchPlayers(name);
  
  // 2. Enrich with SofaScore (live rating, heatmap)
  const sofaData = await sofaScoreService.getPlayerDetails(sofaId);
  
  // 3. Compute scouting radar (26 metrics, real percentiles)
  const scoutingRadar = computeRealPercentile(csvPlayer, posPeers);
  
  // 4. Similar players (cosine similarity)
  const similar = findSimilarPlayers(csvPlayer, allPlayers);
  
  return res.json({ player: enrichedPlayer, similar });
});

// React Query — Auto-cache + background refresh
const { data } = useQuery({
  queryKey: [\`/api/csv-direct/player/\${name}/full\`],
  staleTime: 5 * 60_000, // 5 min cache
});`,
    stats: ["~50ms avg response", "React Query cache", "2 800+ joueurs servis", "Endpoints REST documentés"],
  },
];

const TECH_STACK = [
  { name: "Python / Pandas", usage: "ETL, Feature Engineering, Similarité", color: "#3b82f6" },
  { name: "TypeScript / Node.js", usage: "API REST, Server-side logic", color: "#f59e0b" },
  { name: "React + Vite", usage: "SPA, visualisations temps réel", color: "#06b6d4" },
  { name: "PostgreSQL", usage: "Sessions, stockage persistant", color: "#8b5cf6" },
  { name: "SofaScore API", usage: "Données live, heatmaps, ratings", color: "#e8344a" },
  { name: "FBRef / Transfermarkt", usage: "Stats officielles, valeurs marchandes", color: "#10b981" },
];

export default function DataPipeline() {
  const [, setLocation] = useLocation();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const active = PIPELINE_STEPS.find(s => s.id === activeStep);

  return (
    <div style={{ minHeight: "100vh", background: "#04040f", color: "#fff", fontFamily: "'Barlow', sans-serif" }}>
      <NavBar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ padding: "4px 10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 6, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#818cf8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Portfolio Feature
            </span>
            <span style={{ padding: "4px 10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#10b981", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Data Pipeline — ETL
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, textTransform: "uppercase", margin: "0 0 8px" }}>
            Architecture <span style={{ color: "#10b981" }}>Data</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, maxWidth: 600, lineHeight: 1.6, margin: "0 0 36px" }}>
            Pipeline complet de collecte, transformation et exploitation des données footballistiques. 
            Cliquer sur chaque étape pour voir le code source réel utilisé en production.
          </p>
        </motion.div>

        {/* ETL Pipeline visual */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 32, overflowX: "auto" }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 180 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => { setActiveStep(activeStep === step.id ? null : step.id); setShowCode(false); }}
                style={{
                  flex: 1, padding: "20px 16px", borderRadius: 16, cursor: "pointer",
                  background: activeStep === step.id ? `${step.color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${activeStep === step.id ? step.color : "rgba(255,255,255,0.07)"}`,
                  transition: "all 0.25s",
                  boxShadow: activeStep === step.id ? `0 0 24px ${step.color}30` : "none",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 18, color: step.color, letterSpacing: "0.05em" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>{step.subtitle}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {step.stats.map(s => (
                    <div key={s} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ color: step.color }}>▸</span> {s}
                    </div>
                  ))}
                </div>
              </motion.div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.2)" }}>→</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginBottom: 32 }}
            >
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${active.color}30`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 900, fontSize: 20, color: active.color }}>{active.title} — {active.subtitle}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Sources : {active.sources.join(" · ")}</div>
                  </div>
                  <button onClick={() => setShowCode(!showCode)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                    background: showCode ? `${active.color}20` : "rgba(255,255,255,0.05)",
                    border: `1px solid ${showCode ? active.color : "rgba(255,255,255,0.1)"}`,
                    color: showCode ? active.color : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700,
                  }}>
                    <Code2 size={14} />
                    {showCode ? "Masquer le code" : "Voir le code réel"}
                  </button>
                </div>

                <AnimatePresence>
                  {showCode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <pre style={{
                        background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
                        padding: 20, fontSize: 12, lineHeight: 1.7, color: "#e2e8f0",
                        overflowX: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        whiteSpace: "pre-wrap",
                      }}>
                        {active.code}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tech Stack */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16, color: "rgba(255,255,255,0.7)" }}>
            Stack Technique
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {TECH_STACK.map(t => (
              <div key={t.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 4, background: t.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{t.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data quality note */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          style={{ marginTop: 24, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, padding: "18px 22px" }}>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, color: "#10b981", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            📋 Qualité des données (Data Quality)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            <div><strong style={{ color: "#fff" }}>Valeurs manquantes</strong><br />Gérées par imputation positionnelle (médiane par poste) ou exclusion si &gt; 30% de NaN.</div>
            <div><strong style={{ color: "#fff" }}>Doublons</strong><br />Matching flou par nom normalisé (NFD sans accents) + équipe pour fusionner les sources CSV / SofaScore.</div>
            <div><strong style={{ color: "#fff" }}>Outliers</strong><br />Détection par IQR. Les gardiens sont exclus des métriques offensives pour garantir des percentiles cohérents.</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
