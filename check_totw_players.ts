import axios from 'axios';

async function checkTotwPlayers() {
  const tournamentId = 7;
  const seasonId = 76953;
  const periodId = 26649;
  const url = `https://api.sofascore.app/api/v1/unique-tournament/${tournamentId}/season/${seasonId}/team-of-the-week/${periodId}`;
  
  try {
    const resp = await axios.get(url);
    const players = resp.data.players || [];
    console.log(`Players found: ${players.length}`);
    players.forEach((p: any) => {
      console.log(`${p.player.name} (${p.team.name}) - Rating: ${p.rating}`);
    });
  } catch (err) {
    console.error(err);
  }
}

checkTotwPlayers();
