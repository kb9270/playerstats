
import fetch from 'node-fetch';

async function testEndpoint() {
  try {
    const res = await fetch('http://localhost:5002/api/ucl/rankings');
    const data = await res.json();
    console.log('Data Keys:', Object.keys(data));
    console.log('Raw Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testEndpoint();
