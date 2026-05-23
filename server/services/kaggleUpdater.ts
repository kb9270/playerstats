import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { csvDirectAnalyzer } from './csvDirectAnalyzer';

export class KaggleUpdater {
  // Config
  private kaggleUsername = process.env.KAGGLE_USERNAME || 'khalilbakoukou92';
  private kaggleToken = process.env.KAGGLE_API_TOKEN || 'KGAT_f9ec83ec55097f007d6cc174c41c3368';
  private datasetOwner = 'hubertsidorowicz';
  private datasetName = 'football-players-stats-2025-2026';
  
  private csvDestinationPath = path.join(process.cwd(), 'players_data_2025_2026.csv');
  private zipDownloadPath = path.join(process.cwd(), 'kaggle_temp.zip');

  constructor() {}

  public async updateDataset(): Promise<boolean> {
    console.log(`[KaggleUpdater] Démarrage de la mise à jour depuis Kaggle...`);
    
    try {
      const url = `https://www.kaggle.com/api/v1/datasets/download/${this.datasetOwner}/${this.datasetName}`;
      
      // Basic Auth for Kaggle API
      const auth = Buffer.from(`${this.kaggleUsername}:${this.kaggleToken}`).toString('base64');
      
      console.log(`[KaggleUpdater] Téléchargement de l'archive ZIP...`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });

      if (!response.ok) {
        console.error(`[KaggleUpdater] Échec du téléchargement. HTTP ${response.status}`);
        return false;
      }

      // Save ZIP to disk
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(this.zipDownloadPath, buffer);
      console.log(`[KaggleUpdater] Archive ZIP téléchargée avec succès (${buffer.length} octets).`);

      // Extract ZIP
      console.log(`[KaggleUpdater] Extraction de l'archive...`);
      const zip = new AdmZip(this.zipDownloadPath);
      const zipEntries = zip.getEntries();
      
      let csvFound = false;
      for (const entry of zipEntries) {
        if (entry.entryName.endsWith('.csv')) {
          console.log(`[KaggleUpdater] Fichier CSV trouvé : ${entry.entryName}`);
          
          // Read content and overwrite the local dataset
          const csvContent = entry.getData().toString('utf8');
          fs.writeFileSync(this.csvDestinationPath, csvContent);
          csvFound = true;
          console.log(`[KaggleUpdater] Fichier CSV sauvegardé vers ${this.csvDestinationPath}`);
          break;
        }
      }

      // Cleanup
      if (fs.existsSync(this.zipDownloadPath)) {
        fs.unlinkSync(this.zipDownloadPath);
      }

      if (!csvFound) {
        console.error(`[KaggleUpdater] Aucun fichier CSV trouvé dans l'archive ZIP.`);
        return false;
      }

      // Reload Data in Memory
      console.log(`[KaggleUpdater] Rechargement des données en mémoire...`);
      await csvDirectAnalyzer.reloadData();
      console.log(`[KaggleUpdater] Mise à jour terminée avec succès ! ✅`);
      
      return true;

    } catch (error) {
      console.error(`[KaggleUpdater] Erreur lors de la mise à jour:`, error);
      return false;
    }
  }
}

export const kaggleUpdater = new KaggleUpdater();
