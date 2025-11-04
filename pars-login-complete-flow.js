/**
 * PARS Complete Login Flow
 * Login → Agreement (Toggle) → Next → Finish
 */

import { SmartFormFiller } from './src/form-filler.js';

async function parsCompleteFlow() {
  console.log('🔐 PARS Complete Login Flow\n');
  console.log('Steps: Login → Toggle → Next → Finish\n');
  
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
    console.log('📍 STEP 1: Login\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    await filler.takeScreenshot('1-login');
    
    // ============================================
    // STEP 2: Toggle Agreement
    // ============================================
    console.log('📍 STEP 2: Toggle Agreement (I disagree → I agree)\n');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await filler.page.click('.slds-checkbox_toggle');
    console.log('✅ Toggle clicked\n');
    await filler.page.waitForTimeout(2000);
    
    await filler.takeScreenshot('2-toggle');
    
    // ============================================
    // STEP 3: Click Next Button
    // ============================================
    console.log('📍 STEP 3: Click Next button\n');
    
    let nextClicked = false;
    
    const nextStrategies = [
      { name: 'text=Next', action: () => filler.page.locator('text=Next').click({ timeout: 5000 }) },
      { name: 'getByRole', action: () => filler.page.getByRole('button', { name: /next/i }).click({ timeout: 5000 }) },
      { name: 'button:has-text', action: () => filler.page.locator('button:has-text("Next")').click({ timeout: 5000 }) },
    ];
    
    for (const strategy of nextStrategies) {
      if (!nextClicked) {
        try {
          console.log(`🔄 Trying: ${strategy.name}...`);
          await strategy.action();
          console.log(`✅ Next clicked using ${strategy.name}\n`);
          nextClicked = true;
          await filler.page.waitForTimeout(5000);
          await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        } catch (e) {
          console.log(`⚠️  ${strategy.name} failed\n`);
        }
      }
    }
    
    if (!nextClicked) {
      console.log('❌ Failed to click Next\n');
    }
    
    await filler.takeScreenshot('3-next');
    
    // ============================================
    // STEP 4: Click Finish Button
    // ============================================
    console.log('📍 STEP 4: Click Finish button\n');
    
    // Wait for Finish button to appear
    await filler.page.waitForTimeout(3000);
    
    let finishClicked = false;
    
    const finishStrategies = [
      { name: 'text=Finish', action: () => filler.page.locator('text=Finish').click({ timeout: 5000 }) },
      { name: 'getByRole', action: () => filler.page.getByRole('button', { name: /finish/i }).click({ timeout: 5000 }) },
      { name: 'button:has-text', action: () => filler.page.locator('button:has-text("Finish")').click({ timeout: 5000 }) },
      { name: 'text=Done', action: () => filler.page.locator('text=Done').click({ timeout: 5000 }) },
      { name: 'text=Complete', action: () => filler.page.locator('text=Complete').click({ timeout: 5000 }) },
      { name: 'submit button', action: () => filler.page.click('button[type="submit"]', { timeout: 5000 }) },
    ];
    
    for (const strategy of finishStrategies) {
      if (!finishClicked) {
        try {
          console.log(`🔄 Trying: ${strategy.name}...`);
          await strategy.action();
          console.log(`✅ Finish clicked using ${strategy.name}\n`);
          finishClicked = true;
          await filler.page.waitForTimeout(5000);
          await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        } catch (e) {
          console.log(`⚠️  ${strategy.name} failed\n`);
        }
      }
    }
    
    if (!finishClicked) {
      console.log('❌ Failed to click Finish\n');
    }
    
    await filler.takeScreenshot('4-finish');
    
    // ============================================
    // STEP 5: Final Status
    // ============================================
    console.log('📍 STEP 5: Complete!\n');
    
    const finalUrl = filler.page.url();
    const finalTitle = await filler.page.title();
    
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Final Title: ${finalTitle}\n`);
    
    await filler.takeScreenshot('5-final');
    
    if (finalUrl.includes('Agreement') || finalUrl.includes('login')) {
      console.log('⚠️  Still on agreement/login page\n');
    } else {
      console.log('✅ Successfully completed login flow!\n');
      console.log('🎉 You are now logged in to PARS!\n');
    }
    
    console.log('📸 Screenshots saved:');
    console.log('  1-login-*.png');
    console.log('  2-toggle-*.png');
    console.log('  3-next-*.png');
    console.log('  4-finish-*.png');
    console.log('  5-final-*.png\n');
    
    console.log('⏸️  Browser will stay open for 2 minutes...\n');
    await filler.page.waitForTimeout(120000);
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

parsCompleteFlow();
