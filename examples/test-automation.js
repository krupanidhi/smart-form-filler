/**
 * Test Automation Example
 * Use in automated testing scenarios
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function automatedTest() {
  const filler = new SmartFormFiller({
    headless: true,  // Run headless for CI/CD
    screenshot: true,
  });

  try {
    // Test Scenario 1: Registration Form
    console.log('🧪 Test 1: Registration Form');
    await filler.goto('https://example.com/register');
    
    const result1 = await filler.fillForm({
      'username': 'testuser123',
      'email': 'test@example.com',
      'password': 'SecurePass123!',
    });
    
    await filler.submit();
    
    // Wait for success message
    await filler.page.waitForSelector('.success-message', { timeout: 5000 });
    console.log('✅ Test 1 Passed');
    
    // Test Scenario 2: Login Form
    console.log('\n🧪 Test 2: Login Form');
    await filler.goto('https://example.com/login');
    
    await filler.fillForm({
      'username': 'testuser123',
      'password': 'SecurePass123!',
    });
    
    await filler.submit();
    
    // Verify login
    await filler.page.waitForSelector('.dashboard', { timeout: 5000 });
    console.log('✅ Test 2 Passed');
    
    console.log('\n✅ All tests passed!');
    
    await filler.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await filler.takeScreenshot('test-failure');
    await filler.close();
    process.exit(1);
  }
}

automatedTest();
