/**
 * Salesforce Community Login - Working Example
 * For: https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/
 */

import { SmartFormFiller } from './src/form-filler.js';

async function loginToSalesforce() {
  console.log('🔐 Salesforce Community Login\n');
  
  // ⚠️ CHANGE THESE to your actual credentials
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  const SUBMIT = false; // Change to true when ready to submit
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 300,
    screenshot: true,
  });

  try {
    console.log('🌐 Loading Salesforce Community page...');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    
    // Wait for Salesforce to load (it's slow)
    console.log('⏳ Waiting for page to load...');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(5000);
    console.log('✅ Page loaded\n');
    
    // Method 1: Using fillForm with placeholders
    console.log('📝 Filling login form...');
    
    const result = await filler.fillForm({
      'Username': USERNAME,  // Uses placeholder
      'Password': PASSWORD,  // Uses placeholder
    });
    
    console.log(`✅ Filled ${result.filled}/${result.total} fields\n`);
    
    if (result.filled === 0) {
      console.log('⚠️  Automatic filling failed. Trying direct method...\n');
      
      // Method 2: Direct filling using placeholders
      await filler.page.fill('[placeholder="Username"]', USERNAME);
      console.log('✅ Username filled');
      
      await filler.page.fill('[placeholder="Password"]', PASSWORD);
      console.log('✅ Password filled\n');
    }
    
    // Take screenshot
    await filler.takeScreenshot('salesforce-filled');
    console.log('📸 Screenshot saved\n');
    
    // Submit if requested
    if (SUBMIT) {
      console.log('🚀 Submitting login...');
      
      // Click the "Log in" button
      await filler.page.click('button:has-text("Log in")');
      await filler.page.waitForTimeout(3000);
      
      console.log('✅ Login submitted!');
      await filler.takeScreenshot('salesforce-after-login');
    } else {
      console.log('💡 Set SUBMIT = true to submit the form\n');
    }
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 30 seconds...');
    console.log('Review the filled form in the browser window.\n');
    
    await filler.page.waitForTimeout(30000);
    
    console.log('👋 Closing browser...');
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('salesforce-error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(30000);
    await filler.close();
  }
}

loginToSalesforce();
