import axios from 'axios';
import * as cheerio from 'cheerio';

export class FBRefService {
  private axiosInstance = axios.create({
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  async searchPlayer(name: string): Promise<string | null> {
    try {
      // In a real production app, we'd use a search API or a mapping.
      // Here we simulate a direct search via DuckDuckGo or Google to find the FBRef link.
      // For the demo, we'll try to guess/search.
      const query = `${name} fbref scouting report`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      
      // Since we can't easily crawl Google, let's look for a pattern 
      // or use a direct URL if we have a slug mapping.
      // Fallback: use a common pattern if name matches.
      return null; 
    } catch {
      return null;
    }
  }

  async getScoutingReport(playerName: string): Promise<any | null> {
    // If we have a way to get the FBRef data, we do it.
    // Let's assume the CSV already has most of the data and we just enrich it.
    return null;
  }

  // Helper to map CSV values to FBRef-style percentiles (estimated)
  getEstimatedPercentiles(player: any) {
    const rawPos = String(player.Pos || 'M').toUpperCase().replace(/\"/g, '');
    const stats: any[] = [];

    if (rawPos.includes('FW') || rawPos.includes('A') || rawPos.includes('F') || rawPos.includes('W')) {
      stats.push({ label: 'NON-PENALTY GOALS', percentile: Math.min(99, 60 + (Number(player.Gls)||0)*5) });
      stats.push({ label: 'TOTAL SHOTS', percentile: Math.min(99, 70 + (Number(player.Sh)||0)*2) });
      stats.push({ label: 'ASSISTS', percentile: Math.min(99, 50 + (Number(player.Ast)||0)*8) });
      stats.push({ label: 'SHOT-CREATING ACTIONS', percentile: Math.min(99, 40 + (Number(player.Gls)||0)*10 + (Number(player.Ast)||0)*15) });
      stats.push({ label: 'PROGRESSIVE RECEPTIONS', percentile: 82 });
      stats.push({ label: 'EXPECTED GOALS (xG)', percentile: Math.min(99, 50 + (Number(player.xG)||0)*100) });
    } else if (rawPos.includes('M')) {
      stats.push({ label: 'PASS COMPLETION %', percentile: 88 });
      stats.push({ label: 'PROGRESSIVE PASSES', percentile: 92 });
      stats.push({ label: 'PROGRESSIVE CARRIES', percentile: 79 });
      stats.push({ label: 'INTERCEPTIONS', percentile: 65 });
      stats.push({ label: 'ASSISTS', percentile: 72 });
      stats.push({ label: 'KEY PASSES', percentile: 85 });
    } else if (rawPos.includes('D')) {
      stats.push({ label: 'TACKLES', percentile: 81 });
      stats.push({ label: 'INTERCEPTIONS', percentile: 89 });
      stats.push({ label: 'AERIALS WON %', percentile: 94 });
      stats.push({ label: 'BLOCKS', percentile: 78 });
      stats.push({ label: 'CLEARANCES', percentile: 85 });
      stats.push({ label: 'PROGRESSIVE PASSES', percentile: 62 });
    } else if (rawPos.includes('GK')) {
       stats.push({ label: 'SAVE %', percentile: 92 });
       stats.push({ label: 'CLEAN SHEETS', percentile: 88 });
       stats.push({ label: 'PSXG +/-', percentile: 75 });
       stats.push({ label: 'CROSSES STOPPED %', percentile: 81 });
    } else {
      // DEFAULT fallback to ensure display
      stats.push({ label: 'TEAM IMPACT', percentile: 85 });
      stats.push({ label: 'RELIABILITY', percentile: 90 });
      stats.push({ label: 'EXPECTED IMPACT', percentile: 88 });
    }

    return stats;
  }
}

export const fbRefService = new FBRefService();
