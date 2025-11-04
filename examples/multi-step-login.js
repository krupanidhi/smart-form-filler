/**
 * Multi-Step Login Example
 * Handles login flows with multiple steps (login -> agree -> continue, etc.)
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function multiStepLogin() {
  console.log('🔐 Multi-Step Login Flow\n');
  
  const config = {
    url: 'https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/',
    username: 'your_username_here',
    password: 'your_password_here',
    
    // Post-login steps
    steps: [
      {
        name: 'Agree/Disagree',
        buttonText: 'Agree',  // Change to 'Disagree' if needed
        waitAfter: 3000,
      },
      // Add more steps here if needed
      // {
      //   name: 'Continue',
      //   buttonText: 'Continue',
      //   waitAfter: 2000,
      // },
    ],
  };
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 300,
    screenshot: true,
  });

  try {
    // Step 1: Login
    console.log('📍 Step 1: Logging in...\n');
    await filler.goto(config.url);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    // Fill credentials
    await filler.page.fill('[placeholder="Username"]', config.username);
    await filler.page.fill('[placeholder="Password"]', config.password);
    console.log('✅ Credentials filled');
    
    // Submit
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    await filler.page.waitForTimeout(5000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Step 2+: Handle post-login steps
    for (let i = 0; i < config.steps.length; i++) {
      const step = config.steps[i];
      console.log(`📍 Step ${i + 2}: ${step.name}...\n`);
      
      // Check if button exists
      const buttonExists = await filler.page
        .locator(`button:has-text("${step.buttonText}")`)
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      
      if (buttonExists) {
        console.log(`✅ Found "${step.buttonText}" button`);
        await filler.takeScreenshot(`step-${i + 2}-${step.name.toLowerCase().replace(/\s+/g, '-')}`);
        
        await filler.page.click(`button:has-text("${step.buttonText}")`);
        console.log(`✅ Clicked "${step.buttonText}"\n`);
        
        if (step.waitAfter) {
          await filler.page.waitForTimeout(step.waitAfter);
          await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
        }
      } else {
        console.log(`ℹ️  "${step.buttonText}" button not found, skipping...\n`);
      }
    }
    
    // Final
    console.log('✅ All steps completed!');
    console.log(`Current URL: ${filler.page.url()}\n`);
    
    await filler.takeScreenshot('final-complete');
    
    console.log('⏸️  Browser will stay open for 60 seconds...\n');
    await filler.page.waitForTimeout(60000);
    
    await filler.close();
    console.log('✅ Done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    await filler.page.waitForTimeout(60000);
    await filler.close();
  }
}

multiStepLogin();
