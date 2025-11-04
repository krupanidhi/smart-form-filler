/**
 * HRSA Login Page Example
 * Fill the HRSA login form automatically
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function fillHRSALogin() {
  // Create filler instance
  const filler = new SmartFormFiller({
    headless: false,  // Show browser so you can see what's happening
    slowMo: 200,      // Slow down to see the automation
    screenshot: true, // Save screenshots
  });

  try {
    console.log('🌐 Navigating to HRSA login page...');
    
    // Navigate to the login page
    await filler.goto('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn');
    
    // Wait for the page to fully load
    await filler.page.waitForLoadState('networkidle');
    
    // Optional: Analyze the form first to see what fields are detected
    console.log('\n📊 Analyzing login form...');
    const analysis = await filler.analyzeForm();
    console.log(JSON.stringify(analysis, null, 2));
    
    // Fill the form with custom credentials
    console.log('\n📝 Filling login form...');
    const result = await filler.fillForm({
      // Use the exact field IDs from the page
      'UserName': 'your_username_here',  // ← Exact ID from the form
      'Password': 'your_password_here',  // ← Exact ID from the form
    });
    
    console.log(`\n✅ Filled ${result.filled} out of ${result.total} fields`);
    
    // Take a screenshot before submitting
    await filler.takeScreenshot('hrsa-login-filled');
    
    // IMPORTANT: Uncomment the line below to actually submit the form
    // await filler.submit();
    
    // Keep browser open so you can review
    console.log('\n⏸️  Browser will stay open for 30 seconds for review...');
    await filler.page.waitForTimeout(30000);
    
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await filler.takeScreenshot('hrsa-login-error');
    await filler.close();
  }
}

fillHRSALogin();
