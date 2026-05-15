
import fetch from 'node-fetch';

async function checkPeriods() {
  const leagueId = 7;
  const seasonId = 76953; // Or whatever is latest
  try {
    const res = await fetch(`http://localhost:8001/unique-tournament/${leagueId}/season/${seasonId}/team-of-the-week/periods`);
    const data = await res.json();
    console.log('Periods:', data.periods?.map(p => ({ id: p.id, name: p.periodName })));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkPeriods();
