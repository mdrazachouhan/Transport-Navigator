
import fetch from 'node-fetch';

async function testStats() {
    try {
        const url = 'http://127.0.0.1:5000/api/admin/stats';
        console.log(`Testing ${url}...`);
        const res = await fetch(url);
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testStats();
