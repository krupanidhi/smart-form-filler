/**
 * Examples: Fill ANY page you want
 * Copy and modify these examples for your needs
 */

import { fillAnyForm, quickFill, fillAndSubmit, analyzeFormOnly, fillMultipleForms } from '../src/universal-filler.js';

// ============================================
// Example 1: Quick Fill (Simplest)
// ============================================
async function example1_QuickFill() {
  console.log('Example 1: Quick Fill\n');
  
  const result = await quickFill('https://www.w3schools.com/html/html_forms.asp', {
    'firstname': 'John',
    'lastname': 'Doe',
  });
  
  console.log('Result:', result);
}

// ============================================
// Example 2: Fill Any Form with Options
// ============================================
async function example2_WithOptions() {
  console.log('Example 2: Fill with Options\n');
  
  const result = await fillAnyForm('https://example.com/contact', {
    customData: {
      'name': 'John Doe',
      'email': 'john@example.com',
      'message': 'Hello from automation!',
    },
    analyze: true,      // Get form analysis
    submit: false,      // Don't submit
    headless: false,    // Show browser
    keepOpen: true,     // Keep browser open
  });
  
  console.log('Analysis:', result.analysis);
  console.log(`Filled ${result.filled}/${result.total} fields`);
}

// ============================================
// Example 3: Fill and Submit
// ============================================
async function example3_FillAndSubmit() {
  console.log('Example 3: Fill and Submit\n');
  
  const result = await fillAndSubmit(
    'https://example.com/login',
    {
      'username': 'myuser',
      'password': 'mypass',
    },
    '#login-button' // Optional: specific submit button
  );
  
  console.log('Submitted:', result.success);
}

// ============================================
// Example 4: Analyze Form Only
// ============================================
async function example4_AnalyzeOnly() {
  console.log('Example 4: Analyze Form\n');
  
  const analysis = await analyzeFormOnly('https://example.com/form');
  
  console.log('Total Fields:', analysis.totalFields);
  console.log('Required Fields:', analysis.requiredFields);
  console.log('Field Types:', analysis.fieldTypes);
  console.log('\nFields:', analysis.fields);
}

// ============================================
// Example 5: Fill Multiple Forms
// ============================================
async function example5_MultipleForms() {
  console.log('Example 5: Fill Multiple Forms\n');
  
  const forms = [
    {
      url: 'https://example.com/form1',
      customData: { 'name': 'John', 'email': 'john@example.com' },
    },
    {
      url: 'https://example.com/form2',
      customData: { 'username': 'john123', 'password': 'pass123' },
    },
    {
      url: 'https://example.com/form3',
      customData: { 'company': 'Acme Corp' },
    },
  ];
  
  const results = await fillMultipleForms(forms, {
    headless: true,
    submit: false,
  });
  
  results.forEach((result, index) => {
    console.log(`Form ${index + 1}: ${result.success ? '✅' : '❌'}`);
  });
}

// ============================================
// Example 6: Advanced - Custom Logic
// ============================================
async function example6_CustomLogic() {
  console.log('Example 6: Custom Logic\n');
  
  const result = await fillAnyForm('https://example.com/form', {
    customData: { 'email': 'test@example.com' },
    
    // Run code before filling
    beforeFill: async (page) => {
      console.log('Before fill: Clicking accept cookies...');
      await page.click('#accept-cookies').catch(() => {});
    },
    
    // Run code after filling
    afterFill: async (page) => {
      console.log('After fill: Checking checkbox...');
      await page.check('#terms').catch(() => {});
    },
    
    // Wait for specific element
    waitForSelector: '#email-field',
    
    // Custom submit button
    submitSelector: '#custom-submit-btn',
  });
  
  console.log('Result:', result);
}

// ============================================
// Example 7: Real-World - Login Flow
// ============================================
async function example7_LoginFlow() {
  console.log('Example 7: Login Flow\n');
  
  const result = await fillAnyForm('https://your-app.com/login', {
    customData: {
      'username': 'testuser',
      'password': 'testpass123',
    },
    
    beforeFill: async (page) => {
      // Handle cookie banner
      await page.click('#accept-cookies').catch(() => {});
      
      // Wait for login form
      await page.waitForSelector('#username');
    },
    
    afterFill: async (page) => {
      // Check "Remember me"
      await page.check('#remember-me').catch(() => {});
    },
    
    submit: true,
    keepOpen: true, // Keep open to see result
  });
  
  if (result.success) {
    console.log('✅ Login successful!');
    
    // Continue using the browser
    const page = result.filler.page;
    await page.waitForTimeout(5000);
    await result.filler.close();
  }
}

// ============================================
// Example 8: Your HRSA Login
// ============================================
async function example8_HRSALogin() {
  console.log('Example 8: HRSA Login\n');
  
  const result = await fillAnyForm('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn', {
    customData: {
      'username': 'your_username',
      'password': 'your_password',
    },
    analyze: true,
    submit: false, // Set to true when ready
    keepOpen: true,
  });
  
  console.log('Analysis:', result.analysis);
  console.log(`Filled ${result.filled}/${result.total} fields`);
}

// ============================================
// Run Examples
// ============================================

// Choose which example to run
const exampleNumber = process.argv[2] || '1';

switch (exampleNumber) {
  case '1':
    example1_QuickFill();
    break;
  case '2':
    example2_WithOptions();
    break;
  case '3':
    example3_FillAndSubmit();
    break;
  case '4':
    example4_AnalyzeOnly();
    break;
  case '5':
    example5_MultipleForms();
    break;
  case '6':
    example6_CustomLogic();
    break;
  case '7':
    example7_LoginFlow();
    break;
  case '8':
    example8_HRSALogin();
    break;
  default:
    console.log('Usage: node examples/fill-any-page.js [1-8]');
    console.log('Examples:');
    console.log('  1 - Quick Fill');
    console.log('  2 - Fill with Options');
    console.log('  3 - Fill and Submit');
    console.log('  4 - Analyze Only');
    console.log('  5 - Multiple Forms');
    console.log('  6 - Custom Logic');
    console.log('  7 - Login Flow');
    console.log('  8 - HRSA Login');
}
