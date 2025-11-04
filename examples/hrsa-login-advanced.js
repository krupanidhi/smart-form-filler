/**
 * HRSA Login Page - Advanced Example
 * With manual field detection fallback and better error handling
 */

import { SmartFormFiller } from '../src/form-filler.js';

async function fillHRSALoginAdvanced() {
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 200,
    screenshot: true,
  });

  try {
    console.log('🌐 Navigating to HRSA login page...');
    await filler.goto('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn');
    
    // Wait for form to be ready
    await filler.page.waitForLoadState('networkidle');
    await filler.page.waitForTimeout(2000); // Extra wait for dynamic content
    
    // Detect fields
    console.log('\n🔍 Detecting form fields...');
    const fields = await filler.detectFields();
    
    console.log(`\n📋 Found ${fields.length} fields:`);
    fields.forEach(field => {
      console.log(`  - ${field.name || field.id || 'unnamed'} (${field.detectedType || field.type})`);
      if (field.label) console.log(`    Label: "${field.label}"`);
      if (field.placeholder) console.log(`    Placeholder: "${field.placeholder}"`);
    });
    
    // Method 1: Try automatic filling
    console.log('\n📝 Method 1: Automatic filling...');
    const result = await filler.fillForm({
      'username': 'test_user',
      'password': 'Test@1234',
    });
    
    if (result.filled === 0) {
      console.log('\n⚠️  Automatic filling failed. Trying manual approach...');
      
      // Method 2: Manual field filling
      console.log('\n📝 Method 2: Manual field filling...');
      
      // Try common username field selectors
      const usernameSelectors = [
        '#username',
        '#user',
        '#email',
        '[name="username"]',
        '[name="user"]',
        '[name="email"]',
        'input[type="text"]',
        'input[type="email"]',
      ];
      
      for (const selector of usernameSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.fill('test_user');
            console.log(`✅ Filled username using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      // Try common password field selectors
      const passwordSelectors = [
        '#password',
        '#pass',
        '#pwd',
        '[name="password"]',
        '[name="pass"]',
        '[name="pwd"]',
        'input[type="password"]',
      ];
      
      for (const selector of passwordSelectors) {
        try {
          const element = await filler.page.locator(selector).first();
          if (await element.isVisible()) {
            await element.fill('Test@1234');
            console.log(`✅ Filled password using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
    } else {
      console.log(`\n✅ Successfully filled ${result.filled} fields automatically`);
    }
    
    // Take screenshot
    await filler.takeScreenshot('hrsa-login-filled');
    
    // Optional: Submit the form
    console.log('\n🚀 To submit, uncomment the submit line in the code');
    // await filler.submit();
    // await filler.page.waitForNavigation();
    
    // Keep browser open for review
    console.log('\n⏸️  Review the filled form. Browser will close in 30 seconds...');
    await filler.page.waitForTimeout(30000);
    
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('hrsa-login-error');
    
    // Keep browser open to debug
    console.log('\n🐛 Error occurred. Browser will stay open for 60 seconds for debugging...');
    await filler.page.waitForTimeout(60000);
    
    await filler.close();
  }
}

fillHRSALoginAdvanced();
