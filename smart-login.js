/**
 * Smart Login - Intelligent Auto-Navigation
 * Automatically handles: Login → Agreements → Next → Finish → Home
 * No need to specify each step!
 */

import { SmartFormFiller } from './src/form-filler.js';
import { SmartNavigator } from './src/smart-navigator.js';

async function smartLogin() {
  console.log('🤖 Smart Login - Intelligent Auto-Navigation\n');
  
  const URL = 'https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/';
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 300,
    screenshot: true,
  });

  try {
    // ============================================
    // STEP 1: Navigate and Login
    // ============================================
    console.log('📍 STEP 1: Login\n');
    await filler.goto(URL);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    // Fill login form
    await filler.fillForm({
      'Username': USERNAME,
      'Password': PASSWORD,
    });
    
    console.log('✅ Credentials filled');
    
    // Submit login
    await filler.submit();
    console.log('✅ Login submitted\n');
    
    await filler.takeScreenshot('1-login');
    
    // Wait for page to load
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    
    // ============================================
    // STEP 2: Intelligent Auto-Navigation
    // ============================================
    console.log('📍 STEP 2: Auto-Navigation (Intelligent)\n');
    console.log('The tool will now automatically:');
    console.log('  - Detect and click agreement toggles');
    console.log('  - Click Next/Continue/Finish buttons');
    console.log('  - Navigate until reaching the home page\n');
    
    const navigator = new SmartNavigator(filler.page);
    const steps = await navigator.autoNavigate(10);
    
    // ============================================
    // STEP 3: Final Status
    // ============================================
    console.log('📍 STEP 3: Complete!\n');
    
    const finalUrl = filler.page.url();
    const finalTitle = await filler.page.title();
    
    console.log(`Final URL: ${finalUrl}`);
    console.log(`Final Title: ${finalTitle}`);
    console.log(`Total Steps: ${steps + 1}\n`);
    
    await filler.takeScreenshot('final');
    
    if (finalUrl.includes('login') || finalUrl.includes('Agreement')) {
      console.log('⚠️  Still on login/agreement page\n');
    } else {
      console.log('✅ Successfully logged in!\n');
      console.log('🎉 You are now on the home page!\n');
    }
    
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

smartLogin();
