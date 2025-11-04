/**
 * PARS Complete Login Flow
 * Handles: Login -> Banner Agreement (checkbox + button)
 */

import { SmartFormFiller } from './src/form-filler.js';

async function parsCompleteLogin() {
  console.log('🔐 PARS Complete Login Flow\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  const AGREE_TO_TERMS = true; // Set to false to disagree
  
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
    // STEP 2: Wait for Banner Agreement Page
    // ============================================
    console.log('📍 STEP 2: Waiting for Banner Agreement page...\n');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    const url = filler.page.url();
    const title = await filler.page.title();
    console.log(`Current page: ${title}`);
    console.log(`URL: ${url}\n`);
    
    await filler.takeScreenshot('2-banner-agreement-page');
    
    // ============================================
    // STEP 3: Handle Banner Agreement
    // ============================================
    if (title.includes('Banner Agreement') || url.includes('Agreement')) {
      console.log('📍 STEP 3: Handling Banner Agreement...\n');
      
      // Find and toggle the agreement control
      console.log('🔍 Looking for agreement toggle/checkbox...');
      
      const toggleSelectors = [
        // Salesforce toggle buttons
        'button[role="switch"]',
        '[role="switch"]',
        'lightning-input[type="checkbox"]',
        '.slds-checkbox_toggle',
        '.slds-checkbox--toggle',
        
        // Standard checkboxes
        'input[type="checkbox"]',
        '[type="checkbox"]',
        
        // By name/id
        'input[name*="agree" i]',
        'input[name*="accept" i]',
        'input[name*="terms" i]',
        '[id*="agree" i]',
        '[id*="accept" i]',
        
        // Lightning components
        'lightning-input',
        'c-toggle',
      ];
      
      let toggleFound = false;
      for (const selector of toggleSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`✅ Found toggle/checkbox: ${selector}`);
            
            if (AGREE_TO_TERMS) {
              // Check if it's a toggle button (role="switch")
              const role = await element.getAttribute('role').catch(() => null);
              
              if (role === 'switch') {
                // It's a toggle button - click it
                const isPressed = await element.getAttribute('aria-pressed').catch(() => 'false');
                console.log(`   Current state: ${isPressed}`);
                
                if (isPressed === 'false') {
                  await element.click();
                  console.log('✅ Toggle clicked (Agreed to terms)\n');
                } else {
                  console.log('✅ Already toggled on\n');
                }
              } else {
                // It's a checkbox - check it
                const isChecked = await element.isChecked().catch(() => false);
                
                if (!isChecked) {
                  await element.check();
                  console.log('✅ Checkbox checked (Agreed to terms)\n');
                } else {
                  console.log('✅ Already checked\n');
                }
              }
            } else {
              console.log('⚠️  Not agreeing to terms\n');
            }
            
            toggleFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!toggleFound) {
        console.log('⚠️  Toggle/checkbox not found');
        console.log('🔄 Trying to click any visible toggle...\n');
        
        // Fallback: try to click any button that looks like a toggle
        try {
          await filler.page.click('button[role="switch"]', { timeout: 2000 });
          console.log('✅ Clicked toggle button\n');
          toggleFound = true;
        } catch (e) {
          console.log('⚠️  Could not find toggle\n');
        }
      }
      
      await filler.takeScreenshot('3-checkbox-checked');
      
      // Find and click the submit/continue button
      console.log('🔍 Looking for submit button...');
      
      const buttonSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Continue")',
        'button:has-text("Submit")',
        'button:has-text("Agree")',
        'button:has-text("I Agree")',
        'button:has-text("Accept")',
        'button:has-text("Proceed")',
        'button:has-text("Next")',
        'a:has-text("Continue")',
        '[value="Continue"]',
        '[value="Submit"]',
        '[value="Agree"]',
      ];
      
      let buttonClicked = false;
      for (const selector of buttonSelectors) {
        try {
          const button = await filler.page.locator(selector).first();
          const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (isVisible) {
            const text = await button.textContent().catch(() => '') || await button.getAttribute('value').catch(() => '');
            console.log(`✅ Found button: ${selector}`);
            console.log(`   Text: ${text}`);
            
            await button.click();
            console.log('✅ Button clicked\n');
            buttonClicked = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!buttonClicked) {
        console.log('⚠️  Submit button not found');
        console.log('💡 The page might auto-submit or use JavaScript\n');
        
        // Try pressing Enter as fallback
        console.log('🔄 Trying to press Enter...');
        await filler.page.keyboard.press('Enter');
        console.log('✅ Enter pressed\n');
      }
      
      // Wait for navigation
      console.log('⏳ Waiting for next page...');
      await filler.page.waitForTimeout(5000);
      await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      
      await filler.takeScreenshot('4-after-agreement');
      
    } else {
      console.log('ℹ️  Not on Banner Agreement page\n');
    }
    
    // ============================================
    // STEP 4: Final Status
    // ============================================
    console.log('📍 STEP 4: Login flow complete!\n');
    
    const finalUrl = filler.page.url();
    const finalTitle = await filler.page.title();
    
    console.log(`Final page: ${finalTitle}`);
    console.log(`Final URL: ${finalUrl}\n`);
    
    await filler.takeScreenshot('5-final-page');
    
    if (finalUrl.includes('Agreement') || finalUrl.includes('login')) {
      console.log('⚠️  Still on agreement/login page - May need manual intervention\n');
    } else {
      console.log('✅ Successfully logged in!\n');
    }
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 2 minutes...');
    console.log('You can now interact with the application.\n');
    
    await filler.page.waitForTimeout(120000);
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

parsCompleteLogin();
