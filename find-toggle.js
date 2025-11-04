/**
 * Find Toggle Element - No XPath
 * Shows all interactive elements on the agreement page
 */

import { SmartFormFiller } from './src/form-filler.js';

async function findToggle() {
  console.log('🔍 Finding Toggle Element (No XPath)\n');
  
  const USERNAME = 'sarokiasamy2@dmigs.com.dcp.dcpuat';
  const PASSWORD = 'Grantee@123';
  
  const filler = new SmartFormFiller({
    headless: false,
    slowMo: 500,
    screenshot: true,
  });

  try {
    // Login
    console.log('📍 Logging in...\n');
    await filler.goto('https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/');
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    await filler.page.waitForTimeout(3000);
    
    await filler.page.fill('[placeholder="Username"]', USERNAME);
    await filler.page.fill('[placeholder="Password"]', PASSWORD);
    await filler.page.click('button:has-text("Log in")');
    console.log('✅ Login submitted\n');
    
    // Wait for agreement page
    console.log('⏳ Waiting for agreement page...');
    await filler.page.waitForTimeout(8000);
    await filler.page.waitForLoadState('networkidle', { timeout: 30000 });
    console.log('✅ Page loaded\n');
    
    await filler.takeScreenshot('agreement-page');
    
    // Get ALL interactive elements
    console.log('🔍 Finding ALL interactive elements (NO XPATH):\n');
    
    const elements = await filler.page.evaluate(() => {
      const results = [];
      
      // Get all elements
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((el, index) => {
        // Only visible elements
        if (el.offsetParent === null) return;
        
        // Check if it's interactive
        const isInteractive = 
          el.tagName === 'BUTTON' ||
          el.tagName === 'INPUT' ||
          el.tagName === 'A' ||
          el.tagName === 'SELECT' ||
          el.tagName === 'TEXTAREA' ||
          el.role === 'button' ||
          el.role === 'switch' ||
          el.role === 'checkbox' ||
          el.type === 'checkbox' ||
          el.type === 'button' ||
          el.type === 'submit' ||
          el.className?.includes('toggle') ||
          el.className?.includes('switch') ||
          el.className?.includes('checkbox') ||
          el.tagName?.includes('LIGHTNING');
        
        if (isInteractive) {
          results.push({
            index,
            tag: el.tagName,
            type: el.type || 'N/A',
            role: el.role || 'N/A',
            id: el.id || 'N/A',
            name: el.name || 'N/A',
            className: el.className || 'N/A',
            ariaLabel: el.getAttribute('aria-label') || 'N/A',
            ariaPressed: el.getAttribute('aria-pressed') || 'N/A',
            ariaChecked: el.getAttribute('aria-checked') || 'N/A',
            text: el.textContent?.trim().substring(0, 100) || 'N/A',
            value: el.value || 'N/A',
            checked: el.checked || false,
          });
        }
      });
      
      return results;
    });
    
    console.log(`Found ${elements.length} interactive elements:\n`);
    
    elements.forEach(el => {
      console.log(`Element ${el.index}:`);
      console.log(`  Tag: ${el.tag}`);
      console.log(`  Type: ${el.type}`);
      console.log(`  Role: ${el.role}`);
      console.log(`  ID: ${el.id}`);
      console.log(`  Name: ${el.name}`);
      console.log(`  Class: ${el.className}`);
      console.log(`  ARIA Label: ${el.ariaLabel}`);
      console.log(`  ARIA Pressed: ${el.ariaPressed}`);
      console.log(`  ARIA Checked: ${el.ariaChecked}`);
      console.log(`  Text: ${el.text}`);
      console.log(`  Value: ${el.value}`);
      console.log(`  Checked: ${el.checked}`);
      console.log('');
    });
    
    // Now try to click each one and see what happens
    console.log('🔍 Testing which element to click:\n');
    
    for (const el of elements) {
      if (el.role === 'switch' || el.type === 'checkbox' || el.className.includes('toggle')) {
        console.log(`\n📍 Testing element ${el.index}:`);
        console.log(`   Tag: ${el.tag}, Class: ${el.className}`);
        
        // Build a CSS selector (NO XPATH!)
        let selector = '';
        
        if (el.id && el.id !== 'N/A') {
          selector = `#${el.id}`;
        } else if (el.role !== 'N/A') {
          selector = `[role="${el.role}"]`;
        } else if (el.className && el.className !== 'N/A') {
          const firstClass = el.className.split(' ')[0];
          selector = `.${firstClass}`;
        } else {
          selector = el.tag.toLowerCase();
        }
        
        console.log(`   Selector (NO XPATH): ${selector}`);
        
        try {
          const element = await filler.page.locator(selector).first();
          const isVisible = await element.isVisible({ timeout: 1000 }).catch(() => false);
          
          if (isVisible) {
            console.log(`   ✅ Element is visible and clickable!`);
            console.log(`   💡 Use this selector: ${selector}\n`);
            
            // Ask if you want to click it
            console.log(`   Would click: await filler.page.click('${selector}')`);
          }
        } catch (e) {
          console.log(`   ❌ Could not locate with selector: ${e.message}`);
        }
      }
    }
    
    console.log('\n📸 Screenshot saved: agreement-page-*.png');
    console.log('Check the screenshot to see the page.\n');
    
    // Keep browser open
    console.log('⏸️  Browser will stay open for 5 minutes...');
    console.log('Look at the page and tell me:');
    console.log('  1. What does the toggle look like?');
    console.log('  2. What text is near it?');
    console.log('  3. What button do you click after toggling?\n');
    
    await filler.page.waitForTimeout(300000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await filler.takeScreenshot('error');
    await filler.page.waitForTimeout(300000);
    await filler.close();
  }
}

findToggle();
