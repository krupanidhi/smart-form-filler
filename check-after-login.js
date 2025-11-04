/**
 * Check what page appears after login
 * Use this to see if there's an agreement page or if you're already logged in
 */

import { SmartFormFiller } from './src/form-filler.js';

async function checkAfterLogin() {
  console.log('🔍 Checking Post-Login Page\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    // Login
    console.log('📍 Logging in...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    // Wait for next page
    console.log('⏳ Waiting for page to load...');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Page loaded\n');
    
    // Get page info
    const url = filler.page.url();
    const title = await filler.page.title();
    
    console.log('📍 Current Page Info:');
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}\n`);
    
    // Check if we're logged in successfully
    if (url.includes('/login')) {
      console.log('⚠️  Still on login page - Login may have failed\n');
    } else {
      console.log('✅ Successfully navigated away from login page!\n');
    }
    
    // Get all buttons on the page
    console.log('🔍 All buttons on this page:\n');
    const buttons = await filler.page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));
      return allButtons
        .filter(btn => btn.offsetParent !== null)
        .map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || btn.value || 'No text',
          tag: btn.tagName,
          id: btn.id || 'N/A',
          className: btn.className || 'N/A',
        }));
    });
    
    if (buttons.length === 0) {
      console.log('   No buttons found on this page\n');
    } else {
      buttons.forEach(btn => {
        console.log(`   ${btn.index}. "${btn.text}"`);
        console.log(`      Tag: ${btn.tag}, ID: ${btn.id}`);
        console.log('');
      });
    }
    
    // Get page text (first 1000 chars)
    console.log('📄 Page content (first 500 chars):\n');
    const pageText = await filler.page.evaluate(() => {
      return document.body.innerText?.substring(0, 500);
    });
    console.log(pageText);
    console.log('\n');
    
    // Take screenshot
    await filler.takeScreenshot('after-login-analysis');
    console.log('📸 Screenshot saved\n');
    
    // Check for common post-login elements
    console.log('🔍 Checking for common elements:\n');
    
    const checks = [
      { name: 'Agree button', selector: 'button:has-text("Agree")' },
      { name: 'I Agree button', selector: 'button:has-text("I Agree")' },
      { name: 'Accept button', selector: 'button:has-text("Accept")' },
      { name: 'Continue button', selector: 'button:has-text("Continue")' },
      { name: 'Disagree button', selector: 'button:has-text("Disagree")' },
      { name: 'Terms checkbox', selector: 'input[type="checkbox"]' },
      { name: 'Navigation menu', selector: 'nav' },
      { name: 'User profile', selector: '[class*="profile"], [class*="user"]' },
    ];
    
    for (const check of checks) {
      const exists = await filler.page.locator(check.selector).isVisible({ timeout: 1000 }).catch(() => false);
      console.log(`   ${exists ? '✅' : '❌'} ${check.name}`);
    }
    
    console.log('\n');
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 3 minutes...');
    console.log('Review the browser to see what page you\'re on.');
    console.log('Press Ctrl+C to close immediately.\n');
    
    await filler.page.waitForTimeout(180000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    await filler.page.waitForTimeout(180000);
    await filler.close();
  }
}

checkAfterLogin();
