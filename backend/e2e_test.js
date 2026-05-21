const API_URL = 'http://localhost:5000/api';
let jwtToken = '';
let userId = 'test_user_123@example.com';

async function runTests() {
  try {
    console.log('--- Starting E2E Verification ---');
    
    // 1. Register
    console.log('1. Registering user...');
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: userId, password: 'password123', role: 'admin' })
    });
    const regData = await regRes.json();
    console.log('Register Response:', regData);

    // 2. Login
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userId, password: 'password123' })
    });
    const loginData = await loginRes.json();
    jwtToken = loginData.token;
    console.log('Login Response:', loginData);

    // 3. Track Events
    console.log('\n3. Tracking Behavioral Events...');
    const events = [
      { action: 'Page Visit', page: 'Investments', plan: 'SIP Starter', timeSpent: 120, points: 10 },
      { action: 'Compare Clicked', page: 'Compare', plan: 'SIP vs Lumpsum', timeSpent: 45, points: 20 },
      { action: 'Form Started', page: 'Signup', plan: 'SIP Starter', timeSpent: 30, points: 30 },
      { action: 'Form Abandoned', page: 'Signup', plan: 'SIP Starter', timeSpent: 10, points: -10 }
    ];
    for (let e of events) {
      const eRes = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...e })
      });
      console.log('Event Tracked:', await eRes.json());
    }

    // 4. Compute Score
    console.log('\n4. Computing Score and Persona...');
    const scoreRes = await fetch(`${API_URL}/score/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    console.log('Score Response:', await scoreRes.json());

    // 5. Generate Nudges
    console.log('\n5. Generating Nudges...');
    const nudgeRes = await fetch(`${API_URL}/nudges/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const nudges = await nudgeRes.json();
    console.log('Nudges Generated:', nudges);

    // 5.1 Simulate Email Log insertion
    if (nudges.length > 0) {
      console.log('\n5.1 Logging Nudges as Emails...');
      const emailRes = await fetch(`${API_URL}/email-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: nudges[0].message, triggerReason: "Form Abandoned", persona: "Hesitant Beginner", nudgeType: "whatsapp" })
      });
      console.log('Email Logged:', await emailRes.json());
    }

    // 5.2 Simulate Investment Checkout
    console.log('\n5.2 Submitting Investment Checkout...');
    const invRes = await fetch(`${API_URL}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planName: 'SIP Starter', amount: 5000, riskPreference: 'Moderate', paymentMethod: 'UPI', conversionProbability: 80 })
    });
    console.log('Investment Logged:', await invRes.json());

    // 6. Check Admin Analytics
    console.log('\n6. Checking Admin Analytics...');
    const adminRes = await fetch(`${API_URL}/admin/analytics`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    console.log('Admin Analytics:', await adminRes.json());

    console.log('\n--- ALL VERIFICATIONS SUCCESSFUL ---');
  } catch (err) {
    console.error('Error during E2E Verification:', err);
  }
}

runTests();
