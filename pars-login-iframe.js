/**
 * PARS Login - Iframe Handler
 * Searches for buttons in iframes and shadow DOM
 */

import { SmartFormFiller } from './src/form-filler.js';

async function parsLoginIframe() {
  console.log('🔐 PARS Login - Iframe/Shadow DOM Handler\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    // Login
    console.log('📍 STEP 1: Logging in...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    // Wait for agreement page
    console.log('📍 STEP 2: Waiting for agreement page...\n');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.takeScreenshot('agreement-page');
    console.log('✅ Agreement page loaded\n');
    
    // Click toggle
    console.log('📍 STEP 3: Clicking toggle...\n');
    await filler.page.click('.slds-checkbox_toggle');
    console.log('✅ Toggle clicked\n');
    await filler.page.waitForTimeout(2000);
    await filler.takeScreenshot('after-toggle');
    
    // Search in all frames
    console.log('📍 STEP 4: Searching for Next button in all frames...\n');
    
    const frames = filler.page.frames();
    console.log(`Found ${frames.length} frames\n`);
    
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      console.log(`Checking frame ${i}: ${frame.url()}`);
      
      try {
        const buttons = await frame.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
          return btns
            .filter(btn => btn.offsetParent !== null)
            .map(btn => ({
              text: btn.textContent?.trim() || btn.value,
              type: btn.type,
              disabled: btn.disabled,
            }));
        });
        
        if (buttons.length > 0) {
          console.log(`  Found ${buttons.length} buttons in this frame:`);
          buttons.forEach((btn, idx) => {
            console.log(`    ${idx}. "${btn.text}" (type: ${btn.type}, disabled: ${btn.disabled})`);
          });
          
          // Try to click Next button in this frame
          const nextButton = buttons.find(btn =>
            btn.text?.toLowerCase().includes('next') ||
            btn.text?.toLowerCase().includes('continue') ||
            btn.type === 'submit'
          );
          
          if (nextButton) {
            console.log(`\n  ✅ Found Next button in frame ${i}: "${nextButton.text}"`);
            
            try {
              await frame.click(`text="${nextButton.text}"`);
              console.log('  ✅ Next button clicked!\n');
              
              await filler.page.waitForTimeout(5000);
              await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
              break;
            } catch (e) {
              console.log(`  ⚠️  Click failed: ${e.message}\n`);
            }
          }
        } else {
          console.log('  No buttons in this frame\n');
        }
      } catch (e) {
        console.log(`  Could not access frame: ${e.message}\n`);
      }
    }
    
    // Click the Next button using multiple strategies
    console.log('📍 STEP 5: Clicking Next button...\n');
    
    let nextClicked = false;
    
    // Strategy 1: Playwright text locator (works across frames)
    try {
      console.log('🔄 Strategy 1: Using text locator...');
      await filler.page.locator('text=Next').click({ timeout: 5000 });
      console.log('✅ Next button clicked!\n');
      nextClicked = true;
      await filler.page.waitForTimeout(5000);
      await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    } catch (e) {
      console.log(`⚠️  Strategy 1 failed: ${e.message}\n`);
    }
    
    // Strategy 2: Case-insensitive text match
    if (!nextClicked) {
      try {
        console.log('🔄 Strategy 2: Case-insensitive match...');
        await filler.page.getByRole('button', { name: /next/i }).click({ timeout: 5000 });
        console.log('✅ Next button clicked!\n');
        nextClicked = true;
        await filler.page.waitForTimeout(5000);
        await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      } catch (e) {
        console.log(`⚠️  Strategy 2 failed: ${e.message}\n`);
      }
    }
    
    // Strategy 3: Click button containing "Next"
    if (!nextClicked) {
      try {
        console.log('🔄 Strategy 3: Button containing "Next"...');
        await filler.page.locator('button:has-text("Next")').click({ timeout: 5000 });
        console.log('✅ Next button clicked!\n');
        nextClicked = true;
        await filler.page.waitForTimeout(5000);
        await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      } catch (e) {
        console.log(`⚠️  Strategy 3 failed: ${e.message}\n`);
      }
    }
    
    // Strategy 4: JavaScript click on blue button
    if (!nextClicked) {
      try {
        console.log('🔄 Strategy 4: JavaScript click on button with "Next"...');
        const clicked = await filler.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
          const allButtons = buttons.concat(
            ...Array.from(document.querySelectorAll('iframe')).map(iframe => {
              try {
                return Array.from(iframe.contentDocument?.querySelectorAll('button, input[type="submit"]') || []);
              } catch {
                return [];
              }
            }).flat()
          );
          
          const nextBtn = allButtons.find(btn => 
            btn.textContent?.toLowerCase().includes('next') ||
            btn.value?.toLowerCase().includes('next')
          );
          
          if (nextBtn) {
            nextBtn.click();
            return true;
          }
          return false;
        });
        
        if (clicked) {
          console.log('✅ Next button clicked with JavaScript!\n');
          nextClicked = true;
          await filler.page.waitForTimeout(5000);
          await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        } else {
          console.log('⚠️  No Next button found in JavaScript\n');
        }
      } catch (e) {
        console.log(`⚠️  Strategy 4 failed: ${e.message}\n`);
      }
    }
    
    if (!nextClicked) {
      console.log('❌ Failed to click Next button with all strategies\n');
    }
    
    await filler.takeScreenshot('after-click-attempts');
    
    // Final status
    console.log('📍 STEP 6: Final status\n');
    const finalUrl = filler.page.url();
    console.log(`Final URL: ${finalUrl}\n`);
    
    if (finalUrl.includes('Agreement') || finalUrl.includes('login')) {
      console.log('⚠️  Still on agreement/login page\n');
      console.log('💡 The Next button might be:');
      console.log('   - Inside a shadow DOM (not accessible)');
      console.log('   - Disabled until some condition is met');
      console.log('   - Using a different text/selector\n');
      console.log('Check the screenshots to see what\'s on the page.\n');
    } else {
      console.log('✅ Successfully navigated away from agreement page!\n');
    }
    
    await filler.takeScreenshot('final');
    
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

parsLoginIframe();
