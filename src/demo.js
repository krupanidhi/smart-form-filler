/**
 * Demo: Smart Form Filler
 * Shows various usage examples
 */

import { SmartFormFiller } from './form-filler.js';

async function demo() {
  console.log('🤖 Smart Form Filler Demo\n');

  // Example 1: Basic form filling
  console.log('📋 Example 1: Basic Form Filling\n');
  
  const filler = new SmartFormFiller({
    headless: false,  // Show browser
    slowMo: 100,      // Slow down for visibility
    screenshot: true, // Take screenshots
  });

  try {
    // Navigate to a demo form
    await filler.goto('https://www.w3schools.com/html/html_forms.asp');
    
    // Analyze the form
    console.log('\n📊 Analyzing form...\n');
    const analysis = await filler.analyzeForm();
    console.log(JSON.stringify(analysis, null, 2));
    
    // Fill the form
    console.log('\n📝 Filling form...\n');
    await filler.fillForm();
    
    // Keep browser open for inspection
    console.log('\n✅ Demo complete! Browser will stay open for 10 seconds...\n');
    await filler.page.waitForTimeout(10000);
    
    await filler.close();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    await filler.close();
  }
}

async function demoWithCustomData() {
  console.log('\n📋 Example 2: Form Filling with Custom Data\n');
  
  const filler = new SmartFormFiller({
    headless: false,
    customData: {
      'firstname': 'John',
      'lastname': 'Doe',
      'email': 'john.doe@example.com',
    },
  });

  try {
    await filler.goto('https://www.w3schools.com/html/html_forms.asp');
    await filler.fillForm();
    
    await filler.page.waitForTimeout(5000);
    await filler.close();
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    await filler.close();
  }
}

async function demoQuickFill() {
  console.log('\n📋 Example 3: Quick Fill (One-liner)\n');
  
  const { quickFill } = await import('./index.js');
  
  await quickFill('https://www.w3schools.com/html/html_forms.asp', {
    customData: {
      'email': 'test@example.com',
    },
  });
}

// Run demos
const demoType = process.argv[2] || 'basic';

switch (demoType) {
  case 'basic':
    demo();
    break;
  case 'custom':
    demoWithCustomData();
    break;
  case 'quick':
    demoQuickFill();
    break;
  default:
    console.log('Usage: npm run demo [basic|custom|quick]');
}
