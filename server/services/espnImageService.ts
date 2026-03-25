
// ── ESPN Image Service ─────────────────────────────────────────────────────
// Fetches team logos and player headshots from the ESPN public API.
// Logos are pre-cached at startup (fast synchronous lookup forever after).
// Headshots are fetched lazily and cached in-memory.

const LEAGUES = ['eng.1', 'esp.1', 'fra.1', 'ger.1', 'ita.1', 'ned.1', 'por.1'];

// Normalise a team name for fuzzy matching
function norm(s: string): string {
  return s.toLowerCase()
    .replace(/\bfc\b|\baf\b|\bac\b|\bsc\b|\bcd\b|\brc\b|\bfk\b|\bsk\b|\bsv\b|\bas\b|\bssc\b/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// CSV team names that differ from ESPN display names
const ALIAS: Record<string, string[]> = {
  "manchester city":    ["man city", "manchester city", "man. city"],
  "manchester united":  ["man united", "manchester utd", "man. utd"],
  "tottenham hotspur":  ["tottenham", "spurs"],
  "newcastle united":   ["newcastle"],
  "aston villa":        ["villa"],
  "wolverhampton wanderers": ["wolves", "wolverhampton"],
  "west ham united":    ["west ham"],
  "leicester city":     ["leicester"],
  "nottingham forest":  ["nottm forest", "nott'm forest"],
  "brighton & hove albion": ["brighton"],
  "atletico madrid":    ["atl. madrid", "atletico"],
  "real sociedad":      ["real sociedad"],
  "athletic bilbao":    ["ath bilbao", "athletic"],
  "deportivo alavés":   ["alaves"],
  "rayo vallecano":     ["rayo"],
  "olympique lyonnais": ["lyon"],
  "olympique marseille":["marseille"],
  "paris saint-germain":["psg", "paris sg"],
  "internazionale":     ["inter milan", "inter"],
  "juventus":           ["juve"],
  "ac milan":           ["milan"],
  "ss lazio":           ["lazio"],
  "as roma":            ["roma"],
  "hellas verona":      ["verona"],
  "borussia dortmund":  ["dortmund", "bvb"],
  "borussia mönchengladbach": ["gladbach", "m'gladbach"],
  "bayer leverkusen":   ["leverkusen"],
  "rb leipzig":         ["leipzig"],
  "eintracht frankfurt":["frankfurt"],
  "vfb stuttgart":      ["stuttgart"],
  "werder bremen":      ["bremen"],
  "sc freiburg":        ["freiburg"],
  "fc augsburg":        ["augsburg"],
  "vfl bochum":         ["bochum"],
  "1. fc union berlin": ["union berlin"],
  "1. fc köln":         ["koln", "köln"],
  "tsg hoffenheim":     ["hoffenheim"],
  "sport lisbon":       ["sporting cp", "sporting"],
  "sl benfica":         ["benfica"],
  "porto":              ["fc porto"],
  "braga":              ["sc braga"],
  "ajax":               ["afc ajax"],
  "psv":                ["psv eindhoven"],
  "feyenoord":          ["feyenoord"],
  "az":                 ["az alkmaar"],
  "twente":             ["fc twente"],
};

export class ESPNImageService {
  private teamLogoCache: Record<string, string> = {};
  private playerHeadshotCache: Record<string, string> = {};
  private initialized = false;

  async init() {
    if (this.initialized) return;
    console.log('[ESPN Service] Initializing team logo cache…');
    try {
      for (const league of LEAGUES) {
        try {
          const url = `http://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams`;
          const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
          if (!response.ok) continue;
          const data: any = await response.json();
          const teams = data.sports?.[0]?.leagues?.[0]?.teams || [];
          for (const t of teams) {
            const team = t.team;
            const logo = team.logos?.[0]?.href;
            if (!logo) continue;
            // Store under multiple keys for fuzzy matching
            const names = [
              team.displayName,
              team.name,
              team.shortDisplayName,
              team.abbreviation,
            ].filter(Boolean) as string[];
            for (const n of names) {
              this.teamLogoCache[n.toLowerCase()] = logo;
              this.teamLogoCache[norm(n)] = logo;
            }
          }
        } catch {/* skip league on timeout */}
      }

      // Also pre-seed alias entries so CSV names resolve
      for (const [espnName, csvNames] of Object.entries(ALIAS)) {
        const logoCandidate = this.teamLogoCache[espnName] || this.teamLogoCache[norm(espnName)];
        if (logoCandidate) {
          for (const alias of csvNames) {
            this.teamLogoCache[alias] = logoCandidate;
            this.teamLogoCache[norm(alias)] = logoCandidate;
          }
        }
      }

      this.initialized = true;
      console.log(`[ESPN Service] Cached logos for ${Object.keys(this.teamLogoCache).length} team name variants`);
    } catch (error) {
      console.error('[ESPN Service] Failed to initialize team logo cache:', error);
    }
  }

  getTeamLogo(teamName: string): string | null {
    if (!teamName) return null;
    const lower = teamName.toLowerCase();
    const normalised = norm(teamName);

    // 1. Exact match (lowercase)
    if (this.teamLogoCache[lower]) return this.teamLogoCache[lower];
    // 2. Normalised match
    if (this.teamLogoCache[normalised]) return this.teamLogoCache[normalised];
    // 3. Partial match: cached key contains the query or vice-versa
    for (const [key, value] of Object.entries(this.teamLogoCache)) {
      if (lower.includes(key) || key.includes(lower)) return value;
      if (normalised.length > 3 && (normalised.includes(key) || key.includes(normalised))) return value;
    }
    return null;
  }

  getCachedPlayerHeadshot(playerName: string, teamName?: string): string | null {
    if (!playerName) return null;
    const key = `${playerName.toLowerCase()}_${(teamName || '').toLowerCase()}`;
    return this.playerHeadshotCache[key] || null;
  }

  async getPlayerHeadshot(playerName: string, teamName?: string): Promise<string | null> {
    const key = `${playerName.toLowerCase()}_${(teamName || '').toLowerCase()}`;
    const cached = this.playerHeadshotCache[key];
    if (cached) return cached;

    try {
      const query = encodeURIComponent(`${playerName} ${teamName || ''}`.trim());
      const searchUrl = `https://site.web.api.espn.com/apis/search/v2?query=${query}&limit=5&type=player`;

      const response = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) return null;

      const data: any = await response.json();
      const results = data.results?.[0]?.contents || [];

      // Prefer soccer players
      const soccerPlayer = results.find((item: any) =>
        item.type === 'player' &&
        (item.sport === 'soccer' || item.subtitle?.toLowerCase().includes('madrid') || item.url?.includes('/soccer/'))
      ) || results.find((item: any) => item.type === 'player');

      if (soccerPlayer?.uid) {
        // uid looks like "s:600~a:231388", we want the last part
        const idParts = soccerPlayer.uid.split(':');
        const realId = idParts[idParts.length - 1];
        const headshotUrl = `https://a.espncdn.com/i/headshots/soccer/players/full/${realId}.png`;
        this.playerHeadshotCache[key] = headshotUrl;
        return headshotUrl;
      }
    } catch {
      // Silently fail – headshot is non-critical
    }

    return null;
  }
}

export const espnImageService = new ESPNImageService();
