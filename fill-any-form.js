#!/usr/bin/env node
/**
 * Universal Form Filler - Works with ANY webpage
 * Usage: node fill-any-form.js <url> [options]
 */

import { SmartFormFiller } from './src/form-filler.js';
import { SmartNavigator } from './src/smart-navigator.js';

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
🤖 Universal Form Filler - Fill ANY form automatically

Usage:
  node fill-any-form.js <url> [options]

Examples:
  # Basic - just fill the form
  node fill-any-form.js https://example.com/form

  # With custom data
  node fill-any-form.js https://example.com/form --data "email=test@example.com,name=John Doe"

  # Analyze only (don't fill)
  node fill-any-form.js https://example.com/form --analyze-only

  # Fill and submit
  node fill-any-form.js https://example.com/form --submit

  # Headless mode (no browser window)
  node fill-any-form.js https://example.com/form --headless

  # Keep browser open after filling
  node fill-any-form.js https://example.com/form --keep-open

Options:
  --data <pairs>        Custom data (format: "field1=value1,field2=value2")
  --submit              Submit the form after filling
  --submit-selector <s> Custom submit button selector (e.g., "#login-btn")
  --auto-navigate       Intelligently navigate multi-step flows (toggles, Next, Finish, etc.)
  --analyze-only        Only analyze the form, don't fill
  --headless            Run in headless mode (no browser window)
  --keep-open           Keep browser open after completion
  --slow                Slow down actions for visibility
  --help, -h            Show this help message

Examples with data:
  node fill-any-form.js https://example.com/contact --data "email=test@example.com,name=John,message=Hello"
  node fill-any-form.js https://example.com/login --data "username=myuser,password=mypass" --submit
  `);
  process.exit(0);
}

const url = args[0];
const options = {
  submit: args.includes('--submit'),
  analyzeOnly: args.includes('--analyze-only'),
  headless: args.includes('--headless'),
  keepOpen: args.includes('--keep-open'),
  slow: args.includes('--slow'),
  autoNavigate: args.includes('--auto-navigate'),
  customData: {},
  submitSelector: null,
};

// Parse custom data
const dataIndex = args.indexOf('--data');
if (dataIndex !== -1 && args[dataIndex + 1]) {
  const dataPairs = args[dataIndex + 1].split(',');
  dataPairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      options.customData[key.trim()] = value.trim();
    }
  });
}

// Parse submit selector
const submitSelectorIndex = args.indexOf('--submit-selector');
if (submitSelectorIndex !== -1 && args[submitSelectorIndex + 1]) {
  options.submitSelector = args[submitSelectorIndex + 1];
}

async function fillAnyForm() {
  console.log('🤖 Universal Form Filler\n');
  console.log(`🌐 Target URL: ${url}`);
  
  if (Object.keys(options.customData).length > 0) {
    console.log('📋 Custom Data:', options.customData);
  }
  
  const filler = new SmartFormFiller({
    headless: options.headless,
    slowMo: options.slow ? 200 : 50,
    screenshot: true,
  });

  try {
    console.log('\n🔄 Loading page...');
    await filler.goto(url);
    await filler.page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded\n');
    
    // Analyze form
    console.log('🔍 Analyzing form structure...\n');
    const analysis = await filler.analyzeForm();
    
    console.log('📊 Form Analysis:');
    console.log(`   Total Fields: ${analysis.totalFields}`);
    console.log(`   Required Fields: ${analysis.requiredFields}`);
    console.log(`   Optional Fields: ${analysis.optionalFields}`);
    console.log('\n📋 Field Types:', analysis.fieldTypes);
    
    console.log('\n📝 Detected Fields:');
    analysis.fields.forEach((field, index) => {
      const name = field.name || field.label || `field-${index}`;
      const type = field.type;
      const required = field.required ? '(required)' : '';
      console.log(`   ${index + 1}. ${name} - ${type} ${required}`);
    });
    
    if (options.analyzeOnly) {
      console.log('\n✅ Analysis complete (analyze-only mode)');
      await filler.takeScreenshot('form-analysis');
      
      if (!options.keepOpen) {
        await filler.close();
      } else {
        console.log('\n⏸️  Browser will stay open. Press Ctrl+C to close.');
        await new Promise(() => {}); // Keep open indefinitely
      }
      return;
    }
    
    // Fill form
    console.log('\n📝 Filling form...\n');
    const result = await filler.fillForm(options.customData);
    
    console.log(`\n✅ Successfully filled ${result.filled}/${result.total} fields`);
    
    if (result.filled === 0) {
      console.log('\n⚠️  No fields were filled. Possible reasons:');
      console.log('   - Fields might be hidden or disabled');
      console.log('   - Page might need more time to load');
      console.log('   - Try using --data to specify field names manually');
    }
    
    // Take screenshot
    await filler.takeScreenshot('form-filled');
    console.log('📸 Screenshot saved to screenshots/ folder');
    
    // Submit if requested
    if (options.submit) {
      const submitted = await filler.submit(options.submitSelector);
      
      if (submitted) {
        await filler.page.waitForTimeout(2000);
        await filler.takeScreenshot('form-submitted');
      }
    } else {
      console.log('\n💡 Tip: Add --submit flag to submit the form automatically');
    }
    
    // Auto-navigate if requested
    if (options.autoNavigate) {
      console.log('\n🤖 Starting intelligent auto-navigation...\n');
      const navigator = new SmartNavigator(filler.page);
      const steps = await navigator.autoNavigate(10);
      console.log(`✅ Auto-navigation complete (${steps} steps)\n`);
      
      const finalUrl = filler.page.url();
      console.log(`Final URL: ${finalUrl}\n`);
    }
    
    // Keep open or close
    if (options.keepOpen) {
      console.log('\n⏸️  Browser will stay open for review. Press Ctrl+C to close.');
      await new Promise(() => {}); // Keep open indefinitely
    } else {
      console.log('\n⏸️  Browser will close in 5 seconds...');
      await filler.page.waitForTimeout(5000);
      await filler.close();
    }
    
    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await filler.takeScreenshot('error');
    
    console.log('\n🐛 Debug info:');
    console.log(`   URL: ${filler.page.url()}`);
    console.log(`   Screenshot saved to screenshots/error-*.png`);
    
    if (!options.keepOpen) {
      await filler.close();
    }
    
    process.exit(1);
  }
}

fillAnyForm();
