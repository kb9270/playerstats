import axios from 'axios';

async function test() {
  try {
    console.log("Fetching live rankings from local API...");
    const url = 'http://localhost:5002/api/csv/leagues/eng%20Premier%20League/rankings';
    const response = await axios.get(url);
    console.log("SUCCESS! Response keys:", Object.keys(response.data));
    console.log("\n--- SCORERS ---");
    console.log(response.data.scorers.slice(0, 5));
    console.log("\n--- ASSISTS ---");
    console.log(response.data.assists.slice(0, 5));
    console.log("\n--- RATINGS ---");
    console.log(response.data.ratings.slice(0, 5));
  } catch (error: any) {
    console.error("FAILED!", error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

test();
