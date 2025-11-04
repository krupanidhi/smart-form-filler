/**
 * Test Login - Check if credentials work
 * Detects login errors and shows what's happening
 */

import { SmartFormFiller } from './src/form-filler.js';

async function testLogin() {
  console.log('🔐 Testing Login Credentials\n');
  
  // ⚠️ CHANGE THESE to your actual credentials
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    // Step 1: Load login page
    console.log('📍 Step 1: Loading login page...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    console.log('✅ Login page loaded');
    console.log(`URL: ${filler.page.url()}\n`);
    
    await filler.takeScreenshot('1-login-page');
    
    // Step 2: Fill credentials
    console.log('📍 Step 2: Filling credentials...\n');
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    console.log(`✅ Username filled: ${USERNAME}`);
    
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    console.log(`✅ Password filled: ${'*'.repeat(PASSWORD.length)}\n`);
    
    await filler.takeScreenshot('2-credentials-filled');
    
    // Step 3: Click login button
    console.log('📍 Step 3: Clicking login button...\n');
    
    const loginButton = await filler.page.locator('button:has-text("Log in")').first();
    await loginButton.click();
    console.log('✅ Login button clicked\n');
    
    // Step 4: Wait and check what happens
    console.log('📍 Step 4: Waiting for response...\n');
    
    // Wait a bit
    await filler.page.waitForTimeout(3000);
    
    // Check for error messages
    console.log('🔍 Checking for error messages...\n');
    
    const errorSelectors = [
      '.error',
      '.error-message',
      '[class*="error"]',
      '[class*="Error"]',
      '[role="alert"]',
      '.slds-notify',
      '.slds-notify--alert',
      '.forceFormValidationError',
    ];
    
    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          const errorText = await element.textContent();
          console.log(`❌ Error found: ${errorText}\n`);
          errorFound = true;
        }
      } catch (e) {
        // No error with this selector
      }
    }
    
    if (!errorFound) {
      console.log('✅ No error messages found\n');
    }
    
    // Wait for navigation or stay on page
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    
    await filler.takeScreenshot('3-after-login-click');
    
    // Step 5: Check current state
    console.log('📍 Step 5: Checking current state...\n');
    
    const currentUrl = filler.page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('⚠️  Still on login page - Login may have failed\n');
      
      // Get all visible text to see error messages
      const pageText = await filler.page.evaluate(() => {
        return document.body.innerText;
      });
      
      console.log('Page content:\n');
      console.log(pageText.substring(0, 1000));
      console.log('\n');
      
    } else {
      console.log('✅ Navigated away from login page - Login likely successful!\n');
      
      // Check for agree/disagree buttons
      console.log('🔍 Looking for next step buttons...\n');
      
      const buttons = await filler.page.evaluate(() => {
        const allButtons = Array.from(document.querySelectorAll('button'));
        return allButtons
          .filter(btn => btn.offsetParent !== null)
          .map(btn => btn.textContent?.trim());
      });
      
      console.log('Visible buttons:', buttons);
      console.log('\n');
    }
    
    // Keep browser open for inspection
    console.log('⏸️  Browser will stay open for 2 minutes...');
    console.log('Check the browser and screenshots to see what happened.');
    console.log('Press Ctrl+C to close immediately.\n');
    
    console.log('📸 Screenshots saved:');
    console.log('  - 1-login-page-*.png');
    console.log('  - 2-credentials-filled-*.png');
    console.log('  - 3-after-login-click-*.png\n');
    
    await filler.page.waitForTimeout(120000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    
    console.log('\n🐛 Keeping browser open...');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

testLogin();
