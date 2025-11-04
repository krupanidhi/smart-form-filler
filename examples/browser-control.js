/**
 * Browser Control Examples
 * Shows different ways to control browser closing behavior
 */

import { SmartFormFiller } from '../src/form-filler.js';
import { fillAnyForm } from '../src/universal-filler.js';

// ============================================
// Example 1: Simple Close Control
// ============================================
async function example1_SimpleControl() {
  console.log('Example 1: Simple Close Control\n');
  
  const CLOSE_BROWSER = false; // ← Change this
  
  const filler = new SmartFormFiller({ headless: false });
  
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  await filler.fillForm();
  
  if (CLOSE_BROWSER) {
    console.log('Closing browser...');
    await filler.close();
  } else {
    console.log('Browser will stay open. Press Ctrl+C to close.');
  }
}

// ============================================
// Example 2: Timed Close
// ============================================
async function example2_TimedClose() {
  console.log('Example 2: Timed Close\n');
  
  const WAIT_SECONDS = 10; // Wait 10 seconds before closing
  
  const filler = new SmartFormFiller({ headless: false });
  
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  await filler.fillForm();
  
  console.log(`Browser will close in ${WAIT_SECONDS} seconds...`);
  await filler.page.waitForTimeout(WAIT_SECONDS * 1000);
  await filler.close();
}

// ============================================
// Example 3: Conditional Close (based on result)
// ============================================
async function example3_ConditionalClose() {
  console.log('Example 3: Conditional Close\n');
  
  const filler = new SmartFormFiller({ headless: false });
  
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  const result = await filler.fillForm();
  
  if (result.filled === 0) {
    console.log('No fields filled. Keeping browser open for debugging...');
    await filler.page.waitForTimeout(30000);
  } else {
    console.log('Success! Closing browser...');
    await filler.page.waitForTimeout(3000);
  }
  
  await filler.close();
}

// ============================================
// Example 4: User Prompt
// ============================================
async function example4_UserPrompt() {
  console.log('Example 4: User Prompt\n');
  
  const filler = new SmartFormFiller({ headless: false });
  
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  await filler.fillForm();
  
  console.log('\nForm filled! Review the browser window.');
  console.log('Press Enter to close the browser...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
  
  await filler.close();
  console.log('Browser closed.');
}

// ============================================
// Example 5: Environment Variable Control
// ============================================
async function example5_EnvControl() {
  console.log('Example 5: Environment Variable Control\n');
  
  const KEEP_OPEN = process.env.KEEP_OPEN === 'true';
  
  const filler = new SmartFormFiller({ headless: false });
  
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  await filler.fillForm();
  
  if (KEEP_OPEN) {
    console.log('KEEP_OPEN=true: Browser will stay open');
  } else {
    console.log('KEEP_OPEN not set: Closing browser in 3 seconds...');
    await filler.page.waitForTimeout(3000);
    await filler.close();
  }
}

// ============================================
// Example 6: Using fillAnyForm with keepOpen
// ============================================
async function example6_FillAnyFormKeepOpen() {
  console.log('Example 6: fillAnyForm with keepOpen\n');
  
  const result = await fillAnyForm('https://www.w3schools.com/html/html_forms.asp', {
    keepOpen: true, // ← Browser stays open
    customData: {
      'firstname': 'John',
      'lastname': 'Doe',
    },
  });
  
  console.log('Browser is still open!');
  console.log('You can access it via result.filler');
  
  // You can continue using the browser
  if (result.filler) {
    await result.filler.page.waitForTimeout(5000);
    await result.filler.close();
  }
}

// ============================================
// Example 7: Close on Success, Keep on Error
// ============================================
async function example7_SmartClose() {
  console.log('Example 7: Smart Close\n');
  
  const filler = new SmartFormFiller({ headless: false });
  
  try {
    await filler.goto('https://www.w3schools.com/html/html_forms.asp');
    const result = await filler.fillForm();
    
    if (result.filled > 0) {
      console.log('✅ Success! Closing in 3 seconds...');
      await filler.page.waitForTimeout(3000);
      await filler.close();
    } else {
      console.log('⚠️ No fields filled. Keeping open for debugging...');
      await filler.page.waitForTimeout(30000);
      await filler.close();
    }
    
  } catch (error) {
    console.error('❌ Error occurred. Keeping browser open...');
    console.log('Press Ctrl+C to close');
    await new Promise(() => {}); // Keep open indefinitely
  }
}

// ============================================
// Example 8: Multiple Pages with Control
// ============================================
async function example8_MultiplePagesControl() {
  console.log('Example 8: Multiple Pages\n');
  
  const CLOSE_BETWEEN_PAGES = false;
  const CLOSE_AT_END = true;
  
  const filler = new SmartFormFiller({ headless: false });
  
  // Page 1
  await filler.goto('https://www.w3schools.com/html/html_forms.asp');
  await filler.fillForm();
  console.log('Page 1 filled');
  
  if (CLOSE_BETWEEN_PAGES) {
    await filler.close();
    // Would need to create new instance for next page
  } else {
    await filler.page.waitForTimeout(2000);
  }
  
  // Page 2 (if browser still open)
  if (!CLOSE_BETWEEN_PAGES) {
    await filler.goto('https://www.w3schools.com/html/html_forms.asp');
    await filler.fillForm();
    console.log('Page 2 filled');
  }
  
  // Final close
  if (CLOSE_AT_END) {
    console.log('Closing browser...');
    await filler.close();
  } else {
    console.log('Browser will stay open');
  }
}

// ============================================
// Run Examples
// ============================================

const exampleNumber = process.argv[2] || '1';

console.log('🎮 Browser Control Examples\n');
console.log('Usage: node examples/browser-control.js [1-8]\n');

switch (exampleNumber) {
  case '1':
    example1_SimpleControl();
    break;
  case '2':
    example2_TimedClose();
    break;
  case '3':
    example3_ConditionalClose();
    break;
  case '4':
    example4_UserPrompt();
    break;
  case '5':
    example5_EnvControl();
    break;
  case '6':
    example6_FillAnyFormKeepOpen();
    break;
  case '7':
    example7_SmartClose();
    break;
  case '8':
    example8_MultiplePagesControl();
    break;
  default:
    console.log('Available examples:');
    console.log('  1 - Simple Close Control');
    console.log('  2 - Timed Close');
    console.log('  3 - Conditional Close');
    console.log('  4 - User Prompt');
    console.log('  5 - Environment Variable');
    console.log('  6 - fillAnyForm keepOpen');
    console.log('  7 - Smart Close (success/error)');
    console.log('  8 - Multiple Pages Control');
}
