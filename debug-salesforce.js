/**
 * Debug Salesforce/Community Login
 * Special handling for Salesforce Community pages
 */

import { SmartFormFiller } from './src/form-filler.js';

async function debugSalesforceLogin() {
  const URL = 'https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/';
  
  console.log('🔍 Debug Mode - Salesforce Community Login\n');
  console.log(`Target URL: ${URL}\n`);
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    console.log('📡 Loading page...');
    await filler.goto(URL);
    
    // Wait longer for Salesforce to load (it's slow)
    console.log('⏳ Waiting for Salesforce to load (this can take a while)...');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(5000); // Extra wait for dynamic content
    console.log('✅ Page loaded\n');
    
    // Take initial screenshot
    await filler.takeScreenshot('salesforce-initial');
    
    // Check if we're in an iframe
    console.log('🔍 Checking for iframes...');
    const frames = filler.page.frames();
    console.log(`Found ${frames.length} frames\n`);
    
    frames.forEach((frame, index) => {
      console.log(`Frame ${index}:`);
      console.log(`  URL: ${frame.url()}`);
      console.log(`  Name: ${frame.name()}`);
    });
    console.log('');
    
    // Step 1: Get all input fields (including in iframes)
    console.log('🔍 STEP 1: Looking for input fields in main page...\n');
    
    const mainInputs = await filler.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, button'));
      return inputs.map((input, index) => ({
        index,
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        className: input.className,
        value: input.value,
        textContent: input.textContent?.substring(0, 50),
        visible: input.offsetParent !== null,
      }));
    });
    
    console.log(`Main page inputs: ${mainInputs.length}\n`);
    mainInputs.forEach(input => {
      if (input.visible) {
        console.log(`Input ${input.index}:`);
        console.log(`  ID: ${input.id || 'N/A'}`);
        console.log(`  Name: ${input.name || 'N/A'}`);
        console.log(`  Type: ${input.type}`);
        console.log(`  Placeholder: ${input.placeholder || 'N/A'}`);
        console.log(`  Class: ${input.className || 'N/A'}`);
        if (input.textContent) console.log(`  Text: ${input.textContent}`);
        console.log('');
      }
    });
    
    // Step 2: Check iframes for login form
    console.log('🔍 STEP 2: Checking iframes for login form...\n');
    
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (frame.url() === 'about:blank') continue;
      
      console.log(`Checking frame ${i}: ${frame.url()}\n`);
      
      try {
        const frameInputs = await frame.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input, button'));
          return inputs.map((input, index) => ({
            index,
            id: input.id,
            name: input.name,
            type: input.type,
            placeholder: input.placeholder,
            className: input.className,
            visible: input.offsetParent !== null,
          }));
        });
        
        console.log(`  Found ${frameInputs.length} inputs in this frame\n`);
        
        frameInputs.forEach(input => {
          if (input.visible) {
            console.log(`  Input ${input.index}:`);
            console.log(`    ID: ${input.id || 'N/A'}`);
            console.log(`    Name: ${input.name || 'N/A'}`);
            console.log(`    Type: ${input.type}`);
            console.log(`    Placeholder: ${input.placeholder || 'N/A'}`);
            console.log('');
          }
        });
      } catch (e) {
        console.log(`  Could not access frame: ${e.message}\n`);
      }
    }
    
    // Step 3: Try to detect fields using our detector
    console.log('🔍 STEP 3: Using field detector...\n');
    
    const fields = await filler.detectFields();
    console.log(`Detected ${fields.length} fields:\n`);
    
    fields.forEach((field, index) => {
      console.log(`Field ${index + 1}:`);
      console.log(`  Name: ${field.name || 'N/A'}`);
      console.log(`  ID: ${field.id || 'N/A'}`);
      console.log(`  Type: ${field.type}`);
      console.log(`  Detected Type: ${field.detectedType || 'N/A'}`);
      console.log(`  Label: ${field.label || 'N/A'}`);
      console.log(`  Placeholder: ${field.placeholder || 'N/A'}`);
      console.log('');
    });
    
    // Step 4: Try common Salesforce selectors
    console.log('🔍 STEP 4: Trying common Salesforce selectors...\n');
    
    const salesforceSelectors = [
      // Salesforce Community specific
      'input[name="username"]',
      'input[name="password"]',
      'input[type="email"]',
      'input[type="password"]',
      '#username',
      '#password',
      '#input-email',
      '#input-password',
      '.username',
      '.password',
      '[placeholder*="email" i]',
      '[placeholder*="username" i]',
      '[placeholder*="password" i]',
    ];
    
    for (const selector of salesforceSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`✅ Found element: ${selector}`);
          const attrs = await element.evaluate(el => ({
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder,
          }));
          console.log(`   Attributes:`, attrs);
        }
      } catch (e) {
        // Try next
      }
    }
    
    console.log('');
    
    // Step 5: Look for login button
    console.log('🔍 STEP 5: Looking for login/submit button...\n');
    
    const buttonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Log In")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      '.login-button',
      '.submit-button',
      '#login-button',
      '[name="login"]',
    ];
    
    for (const selector of buttonSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`✅ Found button: ${selector}`);
          const text = await element.textContent().catch(() => '');
          console.log(`   Text: ${text}`);
        }
      } catch (e) {
        // Try next
      }
    }
    
    console.log('');
    
    // Step 6: Try automatic filling
    console.log('🔍 STEP 6: Attempting automatic fill...\n');
    
    const result = await filler.fillForm({
      'username': 'test_user',
      'password': 'test_pass',
      'email': 'test@example.com',
    });
    
    console.log(`Result: Filled ${result.filled}/${result.total} fields\n`);
    
    // Take final screenshot
    await filler.takeScreenshot('salesforce-filled');
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 2 minutes for inspection...');
    console.log('Check the browser to see the page structure.');
    console.log('Press Ctrl+C to close immediately.\n');
    
    await filler.page.waitForTimeout(120000);
    await filler.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    await filler.takeScreenshot('salesforce-error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(120000);
    await filler.close();
  }
}

debugSalesforceLogin();
