/**
 * HRSA Login - Working Example
 * Uses the exact field IDs discovered by debug script
 */

import { SmartFormFiller } from './src/form-filler.js';

async function loginToHRSA() {
  console.log('🔐 HRSA Login Automation\n');
  
  // ⚠️ CHANGE THESE to your actual credentials
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  
  const filler = new SmartFormFiller({
    headless: false,  // Show browser
    slowMo: 200,      // Slow down to see actions
    screenshot: true, // Save screenshots
  });

  try {
    console.log('🌐 Loading HRSA login page...');
    await filler.goto('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn');
    await filler.page.waitForLoadState('networkidle');
    await filler.page.waitForTimeout(2000); // Wait for page to fully load
    console.log('✅ Page loaded\n');
    
    // Fill using exact field IDs
    console.log('📝 Filling login form...');
    
    // Method 1: Using fillForm with exact IDs
    const result = await filler.fillForm({
      'UserName': USERNAME,  // Exact ID from the form
      'Password': PASSWORD,  // Exact ID from the form
    });
    
    console.log(`✅ Filled ${result.filled}/${result.total} fields\n`);
    
    // Take screenshot
    await filler.takeScreenshot('hrsa-login-filled');
    console.log('📸 Screenshot saved\n');
    
    // Option: Submit the form
    console.log('🚀 Ready to submit!');
    console.log('⚠️  Set SUBMIT_FORM to true when ready\n');
    
    const SUBMIT_FORM = false; // ← Change this to true to submit
    
    if (SUBMIT_FORM) {
      await filler.submit(); // Will automatically find the Login button
      await filler.page.waitForTimeout(2000);
      console.log('✅ Login submitted!');
    }
    
    // Keep browser open to review
    console.log('⏸️  Browser will stay open for 30 seconds...');
    console.log('Review the filled form in the browser window.\n');
    
    await filler.page.waitForTimeout(30000);
    
    console.log('👋 Closing browser...');
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('hrsa-login-error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(30000);
    await filler.close();
  }
}

// Alternative: Direct filling method
async function loginToHRSA_DirectMethod() {
  console.log('🔐 HRSA Login - Direct Method\n');
  
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  
  const filler = new SmartFormFiller({ headless: false, slowMo: 200 });

  try {
    await filler.goto('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn');
    await filler.page.waitForLoadState('networkidle');
    
    console.log('📝 Filling fields directly...');
    
    // Fill directly using IDs
    await filler.page.fill('#UserName', USERNAME);
    console.log('✅ Username filled');
    
    await filler.page.fill('#Password', PASSWORD);
    console.log('✅ Password filled');
    
    await filler.takeScreenshot('hrsa-direct-filled');
    
    // Uncomment to submit:
    // await filler.page.click('button[type="submit"]');
    
    console.log('\n⏸️  Browser will stay open for 30 seconds...');
    await filler.page.waitForTimeout(30000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.close();
  }
}

// Run the example
console.log('Choose method:');
console.log('1. Using fillForm (automatic)');
console.log('2. Direct filling\n');

const method = process.argv[2] || '1';

if (method === '2') {
  loginToHRSA_DirectMethod();
} else {
  loginToHRSA();
}
