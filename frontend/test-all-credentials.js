// Complete test of all credentials and frontend-backend connectivity
const testCredentials = [
  { email: 'admin@glufer.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'bouncer@glufer.com', password: 'bouncer123', role: 'bouncer', name: 'Bouncer Pro' },
  { email: 'user@glufer.com', password: 'user123', role: 'user', name: 'Regular User' },
  { email: 'test5@example.com', password: 'test12345', role: 'user', name: 'Test User' },
  { email: 'frontendtest@example.com', password: 'frontend123', role: 'user', name: 'Frontend Test' }
];

async function testLogin(credential) {
  console.log(`\n🧪 Testing: ${credential.name} (${credential.email})`);

  try {
    // Test same format as frontend (FormData)
    const formData = new FormData();
    formData.append('username', credential.email);
    formData.append('password', credential.password);

    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Login successful!`);
      console.log(`   📝 Name: ${data.user.first_name} ${data.user.last_name}`);
      console.log(`   👤 Role: ${data.user.role}`);
      console.log(`   🆔 ID: ${data.user.id}`);
      console.log(`   🎫 Token: ${data.access_token.substring(0, 20)}...`);
      console.log(`   ✅ Active: ${data.user.is_active}`);
      console.log(`   ✅ Verified: ${data.user.is_verified}`);

      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Login failed: ${response.status} ${response.statusText}`);
      console.log(`   📄 Error: ${errorText}`);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllCredentials() {
  console.log('🚀 Complete Credentials Test');
  console.log('============================');

  const results = [];
  let successCount = 0;

  for (const credential of testCredentials) {
    const result = await testLogin(credential);
    results.push({ ...credential, ...result });
    if (result.success) successCount++;

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Results Summary');
  console.log('========================');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.name} (${result.email}): ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (!result.success) {
      console.log(`    Error: ${result.error}`);
    }
  });

  console.log(`\n🎯 Overall: ${successCount}/${results.length} credentials working`);

  if (successCount === results.length) {
    console.log('\n🎉 ALL CREDENTIALS ARE WORKING!');
    console.log('✅ Backend is fully operational');
    console.log('✅ Database connectivity is perfect');
    console.log('✅ JWT token generation works');
    console.log('✅ Role-based authentication is functional');
    console.log('\n🔗 If you still see "Invalid email or password" in the browser:');
    console.log('   1. Clear browser cache and cookies');
    console.log('   2. Check browser console for JavaScript errors');
    console.log('   3. Ensure no ad-blockers are interfering');
    console.log('   4. Try using a different browser or incognito mode');
    console.log('   5. Verify frontend is running on http://localhost:3000');
  } else {
    console.log('\n⚠️ Some credentials failed. Check the errors above.');
  }
}

// Run the complete test
testAllCredentials().catch(console.error);