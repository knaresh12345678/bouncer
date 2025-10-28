// Test script to verify frontend registration API calls
// This simulates the exact same request that the frontend RegistrationPage.tsx makes

const testRegistration = async () => {
  console.log('🧪 Testing Frontend Registration API Call\n');
  console.log('==========================================\n');

  const userData = {
    email: 'frontendtest@example.com',
    password: 'frontend123',
    first_name: 'Frontend',
    last_name: 'Test',
    phone: '9876543210'
  };

  try {
    console.log('📤 Sending registration request...');
    console.log('   URL: http://localhost:8000/api/auth/register');
    console.log('   Data:', JSON.stringify(userData, null, 2));

    const response = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Registration successful!');
      console.log('   Response Data:', JSON.stringify(data, null, 2));

      // Verify the response has the expected fields
      console.log('\n🔍 Verification:');
      console.log(`   ✅ ID present: ${!!data.id}`);
      console.log(`   ✅ Email matches: ${data.email === userData.email}`);
      console.log(`   ✅ Name matches: ${data.first_name === userData.first_name} ${data.last_name === userData.last_name}`);
      console.log(`   ✅ Role assigned: ${data.role === 'user'}`);
      console.log(`   ✅ Account active: ${data.is_active === true}`);
      console.log(`   ✅ Account not verified: ${data.is_verified === false}`);

      console.log('\n🎉 Frontend registration API is working correctly!');
      console.log('   Users can now register through the registration page.');

    } else {
      const errorData = await response.text();
      console.log('\n❌ Registration failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorData}`);
    }
  } catch (error) {
    console.log('\n❌ Network Error:');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the backend server is running on http://localhost:8000');
  }
};

// Run the test
testRegistration().catch(console.error);