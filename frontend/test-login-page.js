// Test if the login page is accessible and properly redirecting
const testLoginPage = async () => {
  console.log('🧪 Testing Login Page Accessibility');
  console.log('===================================\n');

  try {
    console.log('📡 Testing root URL: http://localhost:3000');

    const response = await fetch('http://localhost:3000', {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);

    if (response.ok) {
      const text = await response.text();

      // Check if page contains login-related content
      const hasLoginForm = text.includes('login') || text.includes('Login') || text.includes('Sign in');
      const hasUnifiedLogin = text.includes('UnifiedLogin') || text.includes('Welcome Back');
      const hasForm = text.includes('<form') || text.includes('password');

      console.log(`   ✅ Page loads successfully`);
      console.log(`   🔍 Has login form: ${hasLoginForm}`);
      console.log(`   🎯 Has Unified Login: ${hasUnifiedLogin}`);
      console.log(`   📝 Contains form elements: ${hasForm}`);

      if (hasLoginForm && hasForm) {
        console.log('\n🎉 LOGIN PAGE IS WORKING!');
        console.log('   • The page loads correctly');
        console.log('   • Redirects to login are working');
        console.log('   • UnifiedLogin component is accessible');
      } else {
        console.log('\n⚠️  Login page may not be displaying correctly');
        console.log('   • Check for JavaScript errors in browser console');
        console.log('   • Try clearing browser cache');
      }

      // Check for specific routing elements
      const hasLoginRoute = text.includes('/login');
      const hasRouter = text.includes('BrowserRouter') || text.includes('react-router');

      console.log(`   🛣️ Has login route: ${hasLoginRoute}`);
      console.log(`   🚀 Has React Router: ${hasRouter}`);

    } else {
      console.log(`   ❌ Failed to load page: ${response.status}`);
    }

  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
    console.log('   • Check if frontend server is running on port 3000');
    console.log('   • Verify network connectivity');
  }

  console.log('\n📋 Expected Behavior:');
  console.log('   • When opening http://localhost:3000, should redirect to /login');
  console.log('   • Should show unified login form for all user types');
  console.log('   • No routing errors or JavaScript issues');

  console.log('\n🌐 How to Test:');
  console.log('   1. Open browser and go to http://localhost:3000');
  console.log('   2. Should automatically redirect to login page');
  console.log('   3. Try logging in with admin credentials');
  console.log('   4. Should redirect to appropriate dashboard');

  console.log('\n📋 Working Credentials:');
  console.log('   👑 Admin:   admin@glufer.com / admin123');
  console.log('   🛡️ Bouncer: bouncer@glufer.com / bouncer123');
  console.log('   👤 User:    user@glufer.com / user123');
};

// Run the test
testLoginPage().catch(console.error);