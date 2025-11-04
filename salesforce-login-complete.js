/**
 * Salesforce Community Login - Complete Flow
 * Handles login + Agree/Disagree page automatically
 */

import { SmartFormFiller } from './src/form-filler.js';

async function loginToSalesforceComplete() {
  console.log('🔐 Salesforce Community Login - Complete Flow\n');
  
  // ⚠️ CHANGE THESE to your actual credentials
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  const AUTO_AGREE = true; // Set to false if you want to click "Disagree"
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 300,
    screenshot: true,
  });

  try {
    // ============================================
    // STEP 1: Navigate to Login Page
    // ============================================
    console.log('📍 STEP 1: Loading login page...');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    console.log('✅ Login page loaded\n');
    
    await filler.takeScreenshot('step1-login-page');
    
    // ============================================
    // STEP 2: Fill Login Form
    // ============================================
    console.log('📍 STEP 2: Filling login credentials...');
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    console.log('✅ Username filled');
    
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    console.log('✅ Password filled\n');
    
    await filler.takeScreenshot('step2-credentials-filled');
    
    // ============================================
    // STEP 3: Submit Login
    // ============================================
    console.log('📍 STEP 3: Submitting login...');
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login button clicked');
    
    // Wait for navigation
    console.log('⏳ Waiting for page to load...');
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Page loaded\n');
    
    await filler.takeScreenshot('step3-after-login');
    
    // ============================================
    // STEP 4: Handle Agree/Disagree Page
    // ============================================
    console.log('📍 STEP 4: Checking for Agree/Disagree page...');
    
    // Check if we're on the agreement page
    const agreeButtonExists = await filler.page.locator('button:has-text("Agree")').isVisible({ timeout: 5000 }).catch(() => false);
    const disagreeButtonExists = await filler.page.locator('button:has-text("Disagree")').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (agreeButtonExists || disagreeButtonExists) {
      console.log('✅ Found Agree/Disagree page\n');
      
      await filler.takeScreenshot('step4-agree-disagree-page');
      
      if (AUTO_AGREE) {
        console.log('🔘 Clicking "Agree" button...');
        await filler.page.click('button:has-text("Agree")');
        console.log('✅ Clicked Agree\n');
      } else {
        console.log('🔘 Clicking "Disagree" button...');
        await filler.page.click('button:has-text("Disagree")');
        console.log('✅ Clicked Disagree\n');
      }
      
      // Wait for next page
      console.log('⏳ Waiting for next page...');
      await filler.page.waitForTimeout(3000);
      await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
      console.log('✅ Navigation complete\n');
      
      await filler.takeScreenshot('step5-after-agreement');
    } else {
      console.log('ℹ️  No Agree/Disagree page found (might have already agreed)\n');
    }
    
    // ============================================
    // STEP 5: Final Status
    // ============================================
    console.log('📍 STEP 5: Login flow complete!');
    console.log(`Current URL: ${filler.page.url()}\n`);
    
    await filler.takeScreenshot('final-logged-in');
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 60 seconds...');
    console.log('You can now interact with the logged-in page.\n');
    
    await filler.page.waitForTimeout(60000);
    
    console.log('👋 Closing browser...');
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(60000);
    await filler.close();
  }
}

loginToSalesforceComplete();
