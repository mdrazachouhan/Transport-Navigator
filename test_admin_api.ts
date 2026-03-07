
import "dotenv/config";

async function testApi() {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9999999999', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('Login failed:', loginData);
        return;
    }
    const token = loginData.token;
    console.log('Login successful, token retrieved.');

    const driversRes = await fetch('http://127.0.0.1:5000/api/admin/drivers/online', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const driversData = await driversRes.json();
    console.log('Online Drivers API Response:', JSON.stringify(driversData, null, 2));
}

testApi();
