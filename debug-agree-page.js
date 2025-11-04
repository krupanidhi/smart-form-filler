/**
 * Debug Agree/Disagree Page
 * Find out what buttons exist on the agreement page
 */

import { SmartFormFiller } from './src/form-filler.js';

async function debugAgreePage() {
  console.log('🔍 Debug Agree/Disagree Page\n');
  
  // ⚠️ CHANGE THESE
  const USERNAME = 'your_username_here';
  const PASSWORD = 'your_password_here';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    // Login first
    console.log('📍 Step 1: Logging in...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    console.log('✅ Credentials filled');
    
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    // Wait for next page
    console.log('⏳ Waiting for next page...');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Page loaded\n');
    
    await filler.takeScreenshot('after-login-page');
    
    // Debug: Get current URL
    console.log(`Current URL: ${filler.page.url()}\n`);
    
    // Debug: Find ALL buttons on the page
    console.log('🔍 Finding all buttons on the page...\n');
    
    const buttons = await filler.page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.button, [role="button"]'));
      return allButtons.map((btn, index) => ({
        index,
        tagName: btn.tagName,
        type: btn.type || 'N/A',
        id: btn.id || 'N/A',
        className: btn.className || 'N/A',
        textContent: btn.textContent?.trim().substring(0, 100) || 'N/A',
        value: btn.value || 'N/A',
        visible: btn.offsetParent !== null,
        ariaLabel: btn.getAttribute('aria-label') || 'N/A',
      }));
    });
    
    console.log(`Found ${buttons.length} buttons:\n`);
    
    buttons.forEach(btn => {
      if (btn.visible) {
        console.log(`Button ${btn.index}:`);
        console.log(`  Tag: ${btn.tagName}`);
        console.log(`  Type: ${btn.type}`);
        console.log(`  ID: ${btn.id}`);
        console.log(`  Class: ${btn.className}`);
        console.log(`  Text: ${btn.textContent}`);
        console.log(`  Value: ${btn.value}`);
        console.log(`  ARIA Label: ${btn.ariaLabel}`);
        console.log('');
      }
    });
    
    // Debug: Get page title
    const title = await filler.page.title();
    console.log(`Page Title: ${title}\n`);
    
    // Debug: Get all text on page
    console.log('🔍 Page text content (first 500 chars):\n');
    const pageText = await filler.page.evaluate(() => document.body.textContent?.trim().substring(0, 500));
    console.log(pageText);
    console.log('\n');
    
    // Try to find agree/disagree buttons with different selectors
    console.log('🔍 Testing different button selectors...\n');
    
    const selectors = [
      'button:has-text("Agree")',
      'button:has-text("agree")',
      'button:has-text("I Agree")',
      'button:has-text("Accept")',
      'button:has-text("Continue")',
      'button:has-text("Disagree")',
      'button:has-text("disagree")',
      'button:has-text("I Disagree")',
      'button:has-text("Decline")',
      '[aria-label*="agree" i]',
      '[aria-label*="accept" i]',
      'input[value*="Agree" i]',
      'input[value*="Accept" i]',
      '.agree-button',
      '.accept-button',
      '#agree',
      '#accept',
    ];
    
    for (const selector of selectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          const text = await element.textContent().catch(() => '');
          console.log(`✅ Found: ${selector}`);
          console.log(`   Text: ${text}\n`);
        }
      } catch (e) {
        // Not found
      }
    }
    
    // Keep browser open for manual inspection
    console.log('⏸️  Browser will stay open for 5 minutes for inspection...');
    console.log('Check the browser to see the page.');
    console.log('Look at the screenshots in screenshots/ folder.');
    console.log('Press Ctrl+C to close immediately.\n');
    
    await filler.page.waitForTimeout(300000); // 5 minutes
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('debug-error');
    
    console.log('\n🐛 Keeping browser open...');
    await filler.page.waitForTimeout(300000);
    await filler.close();
  }
}

debugAgreePage();
