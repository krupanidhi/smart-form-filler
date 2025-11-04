/**
 * PARS Login - Robust Version
 * Uses multiple strategies to find and click the toggle
 */

import { SmartFormFiller } from './src/form-filler.js';

async function parsLoginRobust() {
  console.log('🔐 PARS Login - Robust Toggle Handler\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
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
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    // ============================================
    // STEP 2: Wait for Agreement Page
    // ============================================
    console.log('📍 STEP 2: Waiting for agreement page...\n');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await filler.takeScreenshot('agreement-page');
    console.log('✅ Agreement page loaded\n');
    
    // ============================================
    // STEP 3: Find and Click Toggle (Multiple Strategies)
    // ============================================
    console.log('📍 STEP 3: Finding toggle button...\n');
    
    // Strategy 1: Find all buttons and look for toggle
    console.log('🔍 Strategy 1: Searching all buttons...');
    const allButtons = await filler.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .filter(btn => btn.offsetParent !== null)
        .map((btn, index) => ({
          index,
          text: btn.textContent?.trim(),
          role: btn.role,
          ariaPressed: btn.getAttribute('aria-pressed'),
          ariaLabel: btn.getAttribute('aria-label'),
          className: btn.className,
        }));
    });
    
    console.log(`Found ${allButtons.length} visible buttons:`);
    allButtons.forEach(btn => {
      console.log(`  ${btn.index}. "${btn.text}" (role: ${btn.role}, aria-pressed: ${btn.ariaPressed})`);
    });
    console.log('');
    
    // Find the toggle button
    const toggleButton = allButtons.find(btn => 
      btn.text?.toLowerCase().includes('disagree') ||
      btn.text?.toLowerCase().includes('agree') ||
      btn.role === 'switch' ||
      btn.ariaPressed !== null
    );
    
    if (toggleButton) {
      console.log(`✅ Found toggle button: "${toggleButton.text}"`);
      console.log(`   Current state: ${toggleButton.ariaPressed}\n`);
      
      // Click it using multiple methods
      let clicked = false;
      
      // Method 1: Click by text
      if (toggleButton.text) {
        try {
          console.log(`🔄 Method 1: Clicking by text "${toggleButton.text}"...`);
          await filler.page.click(`button:has-text("${toggleButton.text}")`);
          console.log('✅ Clicked using text selector\n');
          clicked = true;
        } catch (e) {
          console.log(`⚠️  Method 1 failed: ${e.message}\n`);
        }
      }
      
      // Method 2: Click by role
      if (!clicked && toggleButton.role === 'switch') {
        try {
          console.log('🔄 Method 2: Clicking by role="switch"...');
          await filler.page.click('button[role="switch"]');
          console.log('✅ Clicked using role selector\n');
          clicked = true;
        } catch (e) {
          console.log(`⚠️  Method 2 failed: ${e.message}\n`);
        }
      }
      
      // Method 3: Click by index (nth button)
      if (!clicked) {
        try {
          console.log(`🔄 Method 3: Clicking button at index ${toggleButton.index}...`);
          await filler.page.evaluate((idx) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const visibleButtons = buttons.filter(btn => btn.offsetParent !== null);
            if (visibleButtons[idx]) {
              visibleButtons[idx].click();
            }
          }, toggleButton.index);
          console.log('✅ Clicked using JavaScript\n');
          clicked = true;
        } catch (e) {
          console.log(`⚠️  Method 3 failed: ${e.message}\n`);
        }
      }
      
      if (clicked) {
        await filler.page.waitForTimeout(1500);
        await filler.takeScreenshot('after-toggle');
        
        // Verify the toggle changed
        const newState = await filler.page.evaluate(() => {
          const toggle = document.querySelector('button[role="switch"]');
          return toggle ? toggle.getAttribute('aria-pressed') : null;
        });
        console.log(`Toggle state after click: ${newState}\n`);
      }
      
    } else {
      console.log('❌ Toggle button not found in button list\n');
      
      // Fallback: Try clicking anything that looks like a toggle
      console.log('🔄 Fallback: Trying generic toggle selectors...');
      const fallbackSelectors = [
        'button[role="switch"]',
        'button[aria-pressed]',
        '.slds-checkbox_toggle',
        'lightning-input button',
      ];
      
      for (const selector of fallbackSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            await element.click();
            console.log(`✅ Clicked using fallback: ${selector}\n`);
            await filler.page.waitForTimeout(1500);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // ============================================
    // STEP 4: Click Next Button
    // ============================================
    console.log('📍 STEP 4: Finding Next button...\n');
    
    // Wait a bit after toggle for button to become enabled
    await filler.page.waitForTimeout(2000);
    
    const allButtonsAfterToggle = await filler.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"]'));
      return buttons
        .filter(btn => btn.offsetParent !== null)
        .map((btn, index) => ({
          index,
          text: btn.textContent?.trim() || btn.value,
          type: btn.type,
          disabled: btn.disabled,
          className: btn.className,
        }));
    });
    
    console.log(`Available buttons: ${allButtonsAfterToggle.length}`);
    allButtonsAfterToggle.forEach(btn => {
      console.log(`  ${btn.index}. "${btn.text}" (type: ${btn.type}, disabled: ${btn.disabled})`);
    });
    console.log('');
    
    // Find Next button
    const nextButton = allButtonsAfterToggle.find(btn =>
      btn.text?.toLowerCase().includes('next') ||
      btn.text?.toLowerCase().includes('continue') ||
      btn.text?.toLowerCase().includes('submit') ||
      btn.type === 'submit'
    );
    
    if (nextButton) {
      console.log(`✅ Found Next button: "${nextButton.text}"\n`);
      
      // Click Next button with multiple attempts
      let nextClicked = false;
      
      // Method 1: Click by text
      if (nextButton.text && !nextClicked) {
        try {
          console.log(`🔄 Method 1: Clicking by text "${nextButton.text}"...`);
          await filler.page.click(`text="${nextButton.text}"`);
          console.log('✅ Next clicked using text selector\n');
          nextClicked = true;
        } catch (e) {
          console.log(`⚠️  Method 1 failed: ${e.message}\n`);
        }
      }
      
      // Method 2: Click by type
      if (!nextClicked && nextButton.type === 'submit') {
        try {
          console.log('🔄 Method 2: Clicking by type="submit"...');
          await filler.page.click('button[type="submit"]');
          console.log('✅ Next clicked using type selector\n');
          nextClicked = true;
        } catch (e) {
          console.log(`⚠️  Method 2 failed: ${e.message}\n`);
        }
      }
      
      // Method 3: Click using JavaScript (always works!)
      if (!nextClicked) {
        try {
          console.log(`🔄 Method 3: Clicking using JavaScript at index ${nextButton.index}...`);
          await filler.page.evaluate((idx) => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
            const visibleButtons = buttons.filter(btn => btn.offsetParent !== null);
            if (visibleButtons[idx]) {
              visibleButtons[idx].click();
              return true;
            }
            return false;
          }, nextButton.index);
          console.log('✅ Next clicked using JavaScript\n');
          nextClicked = true;
        } catch (e) {
          console.log(`⚠️  Method 3 failed: ${e.message}\n`);
        }
      }
      
      if (!nextClicked) {
        console.log('❌ Failed to click Next button with all methods\n');
      }
      
      // Wait for navigation
      console.log('⏳ Waiting for next page...');
      await filler.page.waitForTimeout(5000);
      await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      
      await filler.takeScreenshot('after-next');
      
    } else {
      console.log('❌ Next button not found in list\n');
      
      // Fallback strategies
      console.log('🔄 Trying fallback methods...\n');
      
      // Fallback 1: Press Enter key
      try {
        console.log('🔄 Fallback 1: Pressing Enter key...');
        await filler.page.keyboard.press('Enter');
        console.log('✅ Enter pressed\n');
        await filler.page.waitForTimeout(3000);
      } catch (e) {
        console.log(`⚠️  Enter failed: ${e.message}\n`);
      }
      
      // Fallback 2: Click any submit button
      try {
        console.log('🔄 Fallback 2: Looking for any submit button...');
        await filler.page.click('button[type="submit"]', { timeout: 2000 });
        console.log('✅ Submit button clicked\n');
        await filler.page.waitForTimeout(3000);
      } catch (e) {
        console.log(`⚠️  No submit button: ${e.message}\n`);
      }
      
      // Fallback 3: Click using JavaScript on any button
      try {
        console.log('🔄 Fallback 3: Clicking first visible button with JavaScript...');
        const clicked = await filler.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
          const visibleButtons = buttons.filter(btn => btn.offsetParent !== null && !btn.disabled);
          if (visibleButtons.length > 0) {
            visibleButtons[0].click();
            return true;
          }
          return false;
        });
        if (clicked) {
          console.log('✅ Button clicked with JavaScript\n');
          await filler.page.waitForTimeout(3000);
        } else {
          console.log('⚠️  No clickable buttons found\n');
        }
      } catch (e) {
        console.log(`⚠️  JavaScript click failed: ${e.message}\n`);
      }
      
      await filler.takeScreenshot('after-fallback-attempts');
    }
    
    // ============================================
    // STEP 5: Final Status
    // ============================================
    console.log('📍 STEP 5: Complete!\n');
    
    const finalUrl = filler.page.url();
    console.log(`Final URL: ${finalUrl}\n`);
    
    await filler.takeScreenshot('final-page');
    
    if (finalUrl.includes('Agreement') || finalUrl.includes('login')) {
      console.log('⚠️  Still on agreement/login page - Check screenshots\n');
    } else {
      console.log('✅ Successfully completed login flow!\n');
    }
    
    console.log('⏸️  Browser will stay open for 2 minutes...\n');
    await filler.page.waitForTimeout(120000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

parsLoginRobust();
