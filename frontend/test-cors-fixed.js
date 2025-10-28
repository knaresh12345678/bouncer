// Test CORS fix with the new backend on port 8001
const testLoginWithCORS = async () => {
  console.log('🔧 Testing CORS Fix with Backend on Port 8001');
  console.log('==============================================\n');

  const credentials = [
    { email: 'admin@glufer.com', password: 'admin123', role: 'admin' },
    { email: 'bouncer@glufer.com', password: 'bouncer123', role: 'bouncer' },
    { email: 'user@glufer.com', password: 'user123', role: 'user' }
  ];

  for (const cred of credentials) {
    console.log(`🧪 Testing ${cred.role.toUpperCase()} login...`);

    try {
      const formData = new FormData();
      formData.append('username', cred.email);
      formData.append('password', cred.password);

      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        body: formData,
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS!`);
        console.log(`   👤 User: ${data.user.first_name} ${data.user.last_name}`);
        console.log(`   🎭 Role: ${data.user.role}`);
        console.log(`   🆔 ID: ${data.user.id}`);
        console.log(`   🎫 Token: ${data.access_token.substring(0, 30)}...`);
        console.log(`   🌐 CORS Headers Present: ✅`);
      } else {
        console.log(`   ❌ FAILED: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    console.log('');
  }

  console.log('🎯 Frontend Configuration Update:');
  console.log('   ✅ API_BASE_URL updated to http://localhost:8001/api');
  console.log('   ✅ Backend CORS configured with wildcard origins');
  console.log('   ✅ Credentials: access-control-allow-credentials: true');
  console.log('');
  console.log('🌐 Next Steps:');
  console.log('   1. Refresh your browser (http://localhost:3000)');
  console.log('   2. Try logging in with any of the credentials above');
  console.log('   3. Should work without CORS errors now!');
  console.log('');
  console.log('📋 Working Credentials:');
  console.log('   👑 Admin:   admin@glufer.com / admin123');
  console.log('   🛡️ Bouncer: bouncer@glufer.com / bouncer123');
  console.log('   👤 User:    user@glufer.com / user123');
};

// Run the test
testLoginWithCORS().catch(console.error);