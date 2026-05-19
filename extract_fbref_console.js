/**
 * EXTRACTEUR FBREF — Collez ce script dans la console Chrome (F12 > Console)
 * sur chaque page Big 5 de FBref.
 * 
 * Pages à visiter (une par une) :
 * 1. https://fbref.com/en/comps/Big5/stats/players/Big-5-European-Leagues-Stats
 * 2. https://fbref.com/en/comps/Big5/shooting/players/Big-5-European-Leagues-Stats
 * 3. https://fbref.com/en/comps/Big5/passing/players/Big-5-European-Leagues-Stats
 * 4. https://fbref.com/en/comps/Big5/possession/players/Big-5-European-Leagues-Stats
 * 5. https://fbref.com/en/comps/Big5/defense/players/Big-5-European-Leagues-Stats
 * 6. https://fbref.com/en/comps/Big5/misc/players/Big-5-European-Leagues-Stats
 * 7. https://fbref.com/en/comps/Big5/playingtime/players/Big-5-European-Leagues-Stats
 * 8. https://fbref.com/en/comps/Big5/keepers/players/Big-5-European-Leagues-Stats
 */
(() => {
  const table = document.querySelector('table[id^="stats_"]');
  if (!table) { alert("❌ Aucun tableau trouvé sur cette page !"); return; }

  const slug = location.pathname.split("/")[4] || "stats";
  const headRows = table.querySelectorAll("thead tr");
  const lastHead = headRows[headRows.length - 1];
  const headers = Array.from(lastHead.querySelectorAll("th,td")).map(
    th => th.dataset.stat || th.textContent.trim()
  );

  const rows = [];
  table.querySelectorAll("tbody tr").forEach(tr => {
    if (tr.classList.contains("spacer") || tr.classList.contains("thead") || tr.classList.contains("partial_table")) return;
    const cells = Array.from(tr.querySelectorAll("th,td"));
    const row = {};
    cells.forEach((td, i) => { if (headers[i]) row[headers[i]] = td.textContent.trim(); });
    if (row.player && row.player !== "Player") rows.push(row);
  });

  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fbref_${slug}.json`;
  a.click();

  console.log(`✅ ${rows.length} joueurs extraits → fbref_${slug}.json`);
  alert(`✅ ${rows.length} joueurs extraits !\nFichier téléchargé : fbref_${slug}.json`);
})();
