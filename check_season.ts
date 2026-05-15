import axios from 'axios';

async function checkLatestSeason() {
  const tournamentId = 7;
  const url = `https://api.sofascore.app/api/v1/unique-tournament/${tournamentId}/seasons`;
  
  try {
    const resp = await axios.get(url);
    console.log("Seasons[0]:", JSON.stringify(resp.data.seasons[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}

checkLatestSeason();
