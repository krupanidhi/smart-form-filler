/**
 * PARS Login - Final Version
 * Handles: Login -> Toggle "I disagree" to "I agree" -> Click Next
 */

import { SmartFormFiller } from './src/form-filler.js';

async function parsLoginFinal() {
  console.log('🔐 PARS Complete Login Flow\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  const AGREE = true; // Set to false to leave as "I disagree"
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 300,
    screenshot: true,
  });

  try {
    // ============================================
    // STEP 1: Login
    // ============================================
    console.log('📍 STEP 1: Logging in...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    console.log('✅ Credentials filled');
    
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    await filler.takeScreenshot('1-login-submitted');
    
    // ============================================
    // STEP 2: Wait for Agreement Page
    // ============================================
    console.log('📍 STEP 2: Waiting for agreement page...\n');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    const url = filler.page.url();
    const title = await filler.page.title();
    console.log(`Page: ${title}`);
    console.log(`URL: ${url}\n`);
    
    await filler.takeScreenshot('2-agreement-page');
    
    // ============================================
    // STEP 3: Toggle Agreement
    // ============================================
    console.log('📍 STEP 3: Handling agreement toggle...\n');
    
    if (AGREE) {
      console.log('🔄 Looking for toggle button (I disagree -> I agree)...');
      
      // Try multiple selectors for the toggle (NO XPATH!)
      const toggleSelectors = [
        // By text content
        'button:has-text("I disagree")',
        'button:has-text("I Disagree")',
        'button:has-text("disagree")',
        
        // By role
        'button[role="switch"]',
        '[role="switch"]',
        
        // By class
        '.slds-checkbox_toggle button',
        '.slds-checkbox--toggle button',
        'button.slds-button',
        
        // Lightning components
        'lightning-input button',
        'c-toggle button',
        
        // Generic toggle
        'button[aria-pressed]',
        'button[aria-checked]',
      ];
      
      let toggleClicked = false;
      
      for (const selector of toggleSelectors) {
        try {
          const toggle = await filler.page.locator(selector).first();
          const isVisible = await toggle.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            const text = await toggle.textContent().catch(() => '');
            const ariaPressed = await toggle.getAttribute('aria-pressed').catch(() => null);
            
            console.log(`✅ Found toggle: ${selector}`);
            console.log(`   Text: "${text}"`);
            console.log(`   Aria-pressed: ${ariaPressed}`);
            
            // Click to toggle from "I disagree" to "I agree"
            await toggle.click();
            console.log('✅ Toggle clicked - Changed to "I agree"\n');
            
            await filler.page.waitForTimeout(1000);
            toggleClicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!toggleClicked) {
        console.log('⚠️  Toggle button not found, trying alternative approach...\n');
        
        // Fallback: Click anything with "disagree" text
        try {
          await filler.page.click('text="I disagree"', { timeout: 2000 });
          console.log('✅ Clicked "I disagree" text\n');
          toggleClicked = true;
        } catch (e) {
          console.log('❌ Could not find toggle button\n');
        }
      }
      
      await filler.takeScreenshot('3-after-toggle');
      
    } else {
      console.log('ℹ️  Leaving as "I disagree" (not toggling)\n');
    }
    
    // ============================================
    // STEP 4: Click Next Button
    // ============================================
    console.log('📍 STEP 4: Clicking Next button...\n');
    
    const nextSelectors = [
      // By text
      'button:has-text("Next")',
      'button:has-text("next")',
      'button:has-text("Continue")',
      'button:has-text("Proceed")',
      'button:has-text("Submit")',
      
      // By type
      'button[type="submit"]',
      'input[type="submit"]',
      
      // By value
      '[value="Next"]',
      '[value="Continue"]',
      
      // By class
      '.next-button',
      '.continue-button',
      '.submit-button',
    ];
    
    let nextClicked = false;
    
    for (const selector of nextSelectors) {
      try {
        const button = await filler.page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          const text = await button.textContent().catch(() => '') || await button.getAttribute('value').catch(() => '');
          
          console.log(`✅ Found Next button: ${selector}`);
          console.log(`   Text: "${text}"`);
          
          await button.click();
          console.log('✅ Next button clicked\n');
          
          nextClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!nextClicked) {
      console.log('⚠️  Next button not found\n');
    }
    
    // Wait for navigation
    console.log('⏳ Waiting for next page...');
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    
    await filler.takeScreenshot('4-after-next');
    
    // ============================================
    // STEP 5: Final Status
    // ============================================
    console.log('📍 STEP 5: Login complete!\n');
    
    const finalUrl = filler.page.url();
    const finalTitle = await filler.page.title();
    
    console.log(`Final page: ${finalTitle}`);
    console.log(`Final URL: ${finalUrl}\n`);
    
    await filler.takeScreenshot('5-logged-in');
    
    if (finalUrl.includes('Agreement') || finalUrl.includes('login')) {
      console.log('⚠️  Still on agreement/login page\n');
    } else {
      console.log('✅ Successfully logged in!\n');
    }
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 2 minutes...');
    console.log('You are now logged in and can use the application.\n');
    
    console.log('📸 Screenshots saved:');
    console.log('  1-login-submitted-*.png');
    console.log('  2-agreement-page-*.png');
    console.log('  3-after-toggle-*.png');
    console.log('  4-after-next-*.png');
    console.log('  5-logged-in-*.png\n');
    
    await filler.page.waitForTimeout(120000);
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    await filler.takeScreenshot('error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

parsLoginFinal();
