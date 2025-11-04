/**
 * Debug Form Filling
 * Use this to diagnose why fields aren't filling
 */

import { SmartFormFiller } from './src/form-filler.js';

async function debugForm() {
  // CHANGE THIS to your URL
  const URL = 'https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn';
  
  // CHANGE THIS to your data
  const YOUR_DATA = {
    'username': 'test_user',
    'password': 'test_pass',
  };
  
  console.log('🔍 Debug Mode - Form Filling Diagnostics\n');
  console.log(`Target URL: ${URL}\n`);
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500, // Slow down to see what's happening
    screenshot: true,
  });

  try {
    console.log('📡 Loading page...');
    await filler.goto(URL);
    await filler.page.waitForLoadState('networkidle');
    await filler.page.waitForTimeout(2000); // Extra wait
    console.log('✅ Page loaded\n');
    
    // Step 1: Detect all fields
    console.log('🔍 STEP 1: Detecting all form fields...\n');
    const fields = await filler.detectFields();
    
    console.log(`Found ${fields.length} fields:\n`);
    fields.forEach((field, index) => {
      console.log(`Field ${index + 1}:`);
      console.log(`  Name: ${field.name || 'N/A'}`);
      console.log(`  ID: ${field.id || 'N/A'}`);
      console.log(`  Type: ${field.type}`);
      console.log(`  Detected Type: ${field.detectedType || 'N/A'}`);
      console.log(`  Label: ${field.label || 'N/A'}`);
      console.log(`  Placeholder: ${field.placeholder || 'N/A'}`);
      console.log(`  ARIA Label: ${field.ariaLabel || 'N/A'}`);
      console.log(`  Required: ${field.required}`);
      console.log('');
    });
    
    // Step 2: Try to find username field manually
    console.log('🔍 STEP 2: Looking for username field...\n');
    
    const usernameSelectors = [
      '#username',
      '#user',
      '#email',
      '#login',
      '[name="username"]',
      '[name="user"]',
      '[name="email"]',
      '[name="login"]',
      'input[type="text"]',
      'input[type="email"]',
    ];
    
    let usernameFound = false;
    for (const selector of usernameSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`✅ Found username field: ${selector}`);
          const attrs = await element.evaluate(el => ({
            id: el.id,
            name: el.name,
            type: el.type,
            placeholder: el.placeholder,
          }));
          console.log(`   Attributes:`, attrs);
          usernameFound = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!usernameFound) {
      console.log('❌ Username field not found with common selectors');
    }
    
    console.log('');
    
    // Step 3: Try to find password field
    console.log('🔍 STEP 3: Looking for password field...\n');
    
    const passwordSelectors = [
      '#password',
      '#pass',
      '#pwd',
      '[name="password"]',
      '[name="pass"]',
      '[name="pwd"]',
      'input[type="password"]',
    ];
    
    let passwordFound = false;
    for (const selector of passwordSelectors) {
      try {
        const element = await filler.page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`✅ Found password field: ${selector}`);
          const attrs = await element.evaluate(el => ({
            id: el.id,
            name: el.name,
            type: el.type,
          }));
          console.log(`   Attributes:`, attrs);
          passwordFound = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!passwordFound) {
      console.log('❌ Password field not found with common selectors');
    }
    
    console.log('');
    
    // Step 4: Get all input fields on page
    console.log('🔍 STEP 4: All input fields on page...\n');
    
    const allInputs = await filler.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
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
    
    console.log(`Total input fields: ${allInputs.length}\n`);
    allInputs.forEach(input => {
      console.log(`Input ${input.index}:`);
      console.log(`  ID: ${input.id || 'N/A'}`);
      console.log(`  Name: ${input.name || 'N/A'}`);
      console.log(`  Type: ${input.type}`);
      console.log(`  Placeholder: ${input.placeholder || 'N/A'}`);
      console.log(`  Visible: ${input.visible}`);
      console.log('');
    });
    
    // Step 5: Try automatic filling
    console.log('🔍 STEP 5: Attempting automatic fill...\n');
    
    const result = await filler.fillForm(YOUR_DATA);
    
    console.log(`Result: Filled ${result.filled}/${result.total} fields`);
    
    if (result.filled === 0) {
      console.log('\n⚠️ AUTOMATIC FILLING FAILED\n');
      console.log('Trying manual approach...\n');
      
      // Step 6: Manual filling attempt
      console.log('🔍 STEP 6: Manual filling attempt...\n');
      
      // Try each username selector
      for (const selector of usernameSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          if (await element.isVisible().catch(() => false)) {
            await element.fill(YOUR_DATA.username || 'test_user');
            console.log(`✅ Manually filled username using: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next
        }
      }
      
      // Try each password selector
      for (const selector of passwordSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          if (await element.isVisible().catch(() => false)) {
            await element.fill(YOUR_DATA.password || 'test_pass');
            console.log(`✅ Manually filled password using: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next
        }
      }
    } else {
      console.log('\n✅ AUTOMATIC FILLING SUCCEEDED\n');
    }
    
    // Take screenshot
    await filler.takeScreenshot('debug-form');
    console.log('\n📸 Screenshot saved to screenshots/debug-form-*.png');
    
    // Keep browser open for inspection
    console.log('\n⏸️  Browser will stay open for 60 seconds for inspection...');
    console.log('Check the browser to see if fields are filled.');
    console.log('Press Ctrl+C to close immediately.\n');
    
    await filler.page.waitForTimeout(60000);
    await filler.close();
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    await filler.takeScreenshot('debug-error');
    
    console.log('\n🐛 Keeping browser open for debugging...');
    await filler.page.waitForTimeout(60000);
    await filler.close();
  }
}

debugForm();
