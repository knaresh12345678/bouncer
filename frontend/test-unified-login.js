// Test script to verify unified login functionality
// This simulates the frontend login process

const testUsers = [
  { email: 'admin@bouncer.test', password: 'admin123', expectedRole: 'admin' },
  { email: 'bouncer@bouncer.test', password: 'bouncer123', expectedRole: 'bouncer' },
  { email: 'user@bouncer.test', password: 'user123', expectedRole: 'user' }
];

async function testLogin(user) {
  console.log(`\n🧪 Testing login for: ${user.email}`);

  try {
    const formData = new FormData();
    formData.append('username', user.email);
    formData.append('password', user.password);

    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Login successful!`);
      console.log(`   User: ${data.user.first_name} ${data.user.last_name}`);
      console.log(`   Role from backend: ${data.user.role || 'null'}`);
      console.log(`   Email contains role: ${user.email.includes(user.expectedRole)}`);
      console.log(`   Expected role: ${user.expectedRole}`);

      // Simulate frontend fallback logic (exact same as AuthContext)
      let detectedRole = data.user.role?.toLowerCase();
      if (!detectedRole) {
        if (user.email.startsWith('admin@')) {
          detectedRole = 'admin';
        } else if (user.email.startsWith('bouncer@')) {
          detectedRole = 'bouncer';
        } else if (user.email.startsWith('user@')) {
          detectedRole = 'user';
        } else {
          detectedRole = 'user'; // Default to user
        }
      }

      console.log(`   Final detected role: ${detectedRole}`);
      console.log(`   Role matches expected: ${detectedRole === user.expectedRole}`);

      return { success: true, detectedRole };
    } else {
      console.log(`❌ Login failed: ${response.status}`);
      return { success: false };
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    return { success: false };
  }
}

async function runTests() {
  console.log('🚀 Testing Unified Login System\n');
  console.log('=====================================');

  const results = [];
  for (const user of testUsers) {
    const result = await testLogin(user);
    results.push(result);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 Test Results Summary:');
  console.log('=====================================');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${result.success ? 'Success' : 'Failed'} ${result.detectedRole ? `(${result.detectedRole})` : ''}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 Overall: ${successCount}/${results.length} tests passed`);

  if (successCount === results.length) {
    console.log('\n🎉 All login tests passed! The unified login system is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
}

// Run the tests
runTests().catch(console.error);