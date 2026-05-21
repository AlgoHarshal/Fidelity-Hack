const runTests = async () => {
  let token;
  let userId;
  
  console.log('--- Testing Auth APIs ---');
  // Register
  try {
    const res = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Investor',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'investor'
      })
    });
    const data = await res.json();
    console.log('Register status:', res.status, data.token ? 'Success' : 'Fail');
    
    // Quick trick to get userId out of JWT token locally (or just assume we have it via login)
    // Normally frontend handles this
  } catch (err) {
    console.error('Register failed:', err.message);
  }

  // We need userId for further tests, let's just make one up for events test
  userId = 'testUser123';

  console.log('\n--- Testing Events APIs ---');
  try {
    const res = await fetch('http://localhost:5000/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'Page Visit',
        page: '/investments',
        plan: 'SIP Investment',
        timeSpent: 120,
        points: 10
      })
    });
    console.log('Log Event status:', res.status);
    
    const getRes = await fetch(`http://localhost:5000/events/${userId}`);
    const events = await getRes.json();
    console.log('Get Events count:', events.length);
  } catch (err) {
    console.error('Events failed:', err.message);
  }

  console.log('\n--- Testing Score APIs ---');
  try {
    const res = await fetch('http://localhost:5000/score/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    console.log('Compute Score output:', data);
  } catch (err) {
    console.error('Score failed:', err.message);
  }

  console.log('\n--- Testing Nudge APIs ---');
  try {
    const res = await fetch('http://localhost:5000/nudges/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    console.log('Generate Nudge output (keys):', Object.keys(data));
  } catch (err) {
    console.error('Nudge failed:', err.message);
  }

  console.log('\n--- Testing Email Logs API ---');
  try {
    const res = await fetch('http://localhost:5000/email-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        message: 'This is a test nudge',
        triggerReason: 'High score'
      })
    });
    console.log('Log Email status:', res.status);
    
    const getRes = await fetch('http://localhost:5000/email-logs');
    const logs = await getRes.json();
    console.log('Total Email logs:', logs.length);
  } catch (err) {
    console.error('Email logs failed:', err.message);
  }
};

runTests();
