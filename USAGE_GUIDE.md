# 📚 Complete Usage Guide

## Table of Contents
1. [Installation](#installation)
2. [Basic Concepts](#basic-concepts)
3. [Field Detection](#field-detection)
4. [Data Generation](#data-generation)
5. [Advanced Usage](#advanced-usage)
6. [Integration Examples](#integration-examples)
7. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites
- Node.js 16+ installed
- Windows, macOS, or Linux

### Setup Steps

```bash
# Navigate to project
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run setup script (Windows)
.\setup.ps1
```

## Basic Concepts

### How It Works

The Smart Form Filler uses a **three-phase approach**:

1. **Detection Phase**
   - Scans the DOM for form elements
   - Extracts metadata (labels, placeholders, attributes)
   - Identifies field relationships

2. **Classification Phase**
   - Analyzes field context
   - Matches against known patterns
   - Assigns field types with confidence scores

3. **Filling Phase**
   - Generates appropriate test data
   - Uses robust selectors (no XPath)
   - Fills fields with realistic values

### Why No XPath?

XPath selectors are **brittle** and break when:
- HTML structure changes
- Classes are renamed
- Elements are reordered

Instead, we use:
- **Semantic selectors** (ID, name, ARIA labels)
- **Content-based selectors** (label text)
- **Relationship selectors** (label associations)

## Field Detection

### Automatic Detection

```javascript
const filler = new SmartFormFiller();
await filler.goto('https://example.com/form');

// Detect all fields
const fields = await filler.detectFields();

// Each field contains:
// - id, name, type
// - label, placeholder, ariaLabel
// - detectedType (email, phone, etc.)
// - confidence (high, medium, low)
// - position, context
```

### Supported Field Types

**Input Types:**
- `text`, `email`, `password`, `tel`, `url`
- `number`, `date`, `time`, `datetime-local`
- `checkbox`, `radio`, `color`, `range`

**Other Elements:**
- `textarea` - Multi-line text
- `select` - Dropdowns
- `[contenteditable]` - Rich text editors
- `[role="textbox"]` - ARIA textboxes

### Field Classification

Fields are classified using multiple strategies:

```javascript
// 1. HTML5 type attribute
<input type="email"> // → detectedType: 'email'

// 2. Name/ID patterns
<input name="user_email"> // → detectedType: 'email'

// 3. Label text
<label>Email Address</label>
<input type="text"> // → detectedType: 'email'

// 4. Placeholder text
<input placeholder="Enter your email"> // → detectedType: 'email'

// 5. ARIA labels
<input aria-label="Email"> // → detectedType: 'email'
```

## Data Generation

### Automatic Data

The tool generates realistic data based on field type:

```javascript
await filler.fillForm();

// Generates:
// - Email: john.doe@example.com
// - Name: Jane Smith
// - Phone: +1-555-0123
// - Address: 123 Main Street
// - Company: Acme Corporation
// - etc.
```

### Custom Data

Override specific fields:

```javascript
await filler.fillForm({
  'email': 'custom@example.com',
  'firstName': 'John',
  'lastName': 'Doe',
  'company': 'My Company',
});
```

### Data Generator Options

```javascript
const filler = new SmartFormFiller({
  locale: 'en',  // Data generation locale
  customData: {
    // Default values for all forms
    'email': 'test@example.com',
  },
});
```

### Supported Locales

- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- And 50+ more via Faker.js

## Advanced Usage

### Form Analysis

Get detailed form structure:

```javascript
const analysis = await filler.analyzeForm();

console.log(analysis);
// {
//   totalFields: 12,
//   requiredFields: 5,
//   optionalFields: 7,
//   fieldTypes: {
//     email: 1,
//     text: 6,
//     tel: 1,
//     select: 2,
//     textarea: 2
//   },
//   fields: [...]
// }
```

### Selective Filling

Fill specific fields only:

```javascript
const fields = await filler.detectFields();

// Fill only email fields
for (const field of fields) {
  if (field.detectedType === 'email') {
    await filler.fillField(field, 'test@example.com');
  }
}
```

### Custom Field Filling

```javascript
// Fill with custom logic
const fields = await filler.detectFields();

for (const field of fields) {
  let value;
  
  if (field.required) {
    value = 'REQUIRED_' + filler.generator.generateData(field);
  } else {
    value = filler.generator.generateData(field);
  }
  
  await filler.fillField(field, value);
}
```

### Screenshot Capture

```javascript
// Automatic screenshots
const filler = new SmartFormFiller({ screenshot: true });

// Manual screenshots
await filler.takeScreenshot('before-fill');
await filler.fillForm();
await filler.takeScreenshot('after-fill');
```

### Form Submission

```javascript
// Submit with default selector
await filler.submit();

// Submit with custom selector
await filler.submit('#submit-button');

// Submit and wait for navigation
await filler.submit();
await filler.page.waitForNavigation();
```

### Complete Automation

```javascript
const result = await filler.automate('https://example.com/form', {
  analyze: true,           // Analyze form first
  submit: true,            // Submit after filling
  submitSelector: '#btn',  // Custom submit button
  keepOpen: false,         // Close when done
  waitFor: '.form-ready',  // Wait for element
  customData: {
    'email': 'test@example.com',
  },
});
```

## Integration Examples

### Playwright Test Integration

```javascript
import { test, expect } from '@playwright/test';
import { SmartFormFiller } from './src/form-filler.js';

test.describe('Form Tests', () => {
  test('should fill registration form', async ({ page }) => {
    const filler = new SmartFormFiller({ headless: true });
    
    await filler.goto('https://example.com/register');
    const result = await filler.fillForm();
    
    expect(result.filled).toBeGreaterThan(0);
    expect(result.success).toBe(true);
    
    await filler.close();
  });
});
```

### Jest Integration

```javascript
import { SmartFormFiller } from './src/form-filler.js';

describe('Form Automation', () => {
  let filler;
  
  beforeAll(async () => {
    filler = new SmartFormFiller({ headless: true });
  });
  
  afterAll(async () => {
    await filler.close();
  });
  
  test('fills contact form', async () => {
    await filler.goto('https://example.com/contact');
    const result = await filler.fillForm();
    
    expect(result.filled).toBeGreaterThan(0);
  });
});
```

### CI/CD Integration

```javascript
// ci-test.js
import { SmartFormFiller } from './src/form-filler.js';

async function runTests() {
  const filler = new SmartFormFiller({
    headless: true,
    screenshot: true,  // Capture on failure
  });

  try {
    await filler.goto(process.env.FORM_URL);
    const result = await filler.fillForm();
    
    if (result.filled === 0) {
      throw new Error('No fields filled');
    }
    
    await filler.submit();
    await filler.page.waitForSelector('.success');
    
    console.log('✅ Tests passed');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Tests failed:', error);
    await filler.takeScreenshot('failure');
    process.exit(1);
  } finally {
    await filler.close();
  }
}

runTests();
```

### API Testing

```javascript
// Combine with API calls
import { SmartFormFiller } from './src/form-filler.js';

async function testFormWithAPI() {
  const filler = new SmartFormFiller();
  
  // Fill form
  await filler.goto('https://example.com/form');
  await filler.fillForm({
    'email': 'api-test@example.com',
  });
  
  await filler.submit();
  
  // Verify via API
  const response = await fetch('https://api.example.com/users/api-test@example.com');
  const user = await response.json();
  
  console.log('User created:', user);
  
  await filler.close();
}
```

## Troubleshooting

### Fields Not Detected

**Problem:** `detectFields()` returns empty array

**Solutions:**
1. Check if fields are visible (not `display: none`)
2. Wait for dynamic content to load
3. Verify fields are standard HTML elements

```javascript
// Wait for form to load
await filler.page.waitForSelector('form');
await filler.page.waitForTimeout(1000);

// Then detect
const fields = await filler.detectFields();
```

### Wrong Field Type Detected

**Problem:** Field classified incorrectly

**Solutions:**
1. Use custom data to override
2. Check field has proper labels/attributes
3. Add custom classification logic

```javascript
// Override detection
await filler.fillForm({
  'field-name': 'custom-value',
});
```

### Fill Fails for Specific Field

**Problem:** `fillField()` throws error

**Solutions:**
1. Check field is not disabled/readonly
2. Verify field is visible
3. Try different selector strategy

```javascript
// Debug field
const fields = await filler.detectFields();
console.log(fields.find(f => f.name === 'problematic-field'));

// Manual fill
await filler.page.fill('#field-id', 'value');
```

### Form Submission Fails

**Problem:** `submit()` doesn't work

**Solutions:**
1. Verify submit button selector
2. Check for form validation
3. Wait for button to be enabled

```javascript
// Wait for button
await filler.page.waitForSelector('button[type="submit"]:not([disabled])');

// Then submit
await filler.submit();
```

### Browser Doesn't Open

**Problem:** Browser launch fails

**Solutions:**
```bash
# Reinstall browsers
npx playwright install chromium

# Check permissions
# Run as administrator if needed
```

### Performance Issues

**Problem:** Slow execution

**Solutions:**
```javascript
// Reduce delays
const filler = new SmartFormFiller({
  slowMo: 0,  // Remove artificial delay
  headless: true,  // Faster without UI
});

// Disable screenshots
const filler = new SmartFormFiller({
  screenshot: false,
});
```

## Best Practices

### 1. Always Use Try-Catch

```javascript
try {
  await filler.fillForm();
} catch (error) {
  await filler.takeScreenshot('error');
  console.error(error);
} finally {
  await filler.close();
}
```

### 2. Analyze Before Filling

```javascript
// Understand form structure first
const analysis = await filler.analyzeForm();
console.log(analysis);

// Then fill
await filler.fillForm();
```

### 3. Use Custom Data for Critical Fields

```javascript
// Don't rely on random data for important fields
await filler.fillForm({
  'email': 'known-test-email@example.com',
  'password': 'KnownPassword123!',
});
```

### 4. Verify After Filling

```javascript
await filler.fillForm();

// Verify values
const email = await filler.page.inputValue('#email');
expect(email).toContain('@');
```

### 5. Keep Browser Open for Debugging

```javascript
const filler = new SmartFormFiller({
  headless: false,
  slowMo: 100,  // See what's happening
});

// Don't close immediately
await filler.fillForm();
await filler.page.waitForTimeout(10000);  // Inspect
await filler.close();
```

## Tips & Tricks

### Reuse Browser Instance

```javascript
const filler = new SmartFormFiller();
await filler.init();

// Fill multiple forms
await filler.goto('https://example.com/form1');
await filler.fillForm();

await filler.goto('https://example.com/form2');
await filler.fillForm();

await filler.close();
```

### Conditional Filling

```javascript
const fields = await filler.detectFields();

for (const field of fields) {
  // Skip optional fields
  if (!field.required) continue;
  
  const value = filler.generator.generateData(field);
  await filler.fillField(field, value);
}
```

### Export Field Data

```javascript
const fields = await filler.detectFields();
const data = filler.generator.generateDataSet(fields);

// Save for later use
import fs from 'fs';
fs.writeFileSync('form-data.json', JSON.stringify(data, null, 2));
```

---

**Need more help?** Check the [README.md](README.md) or examples in `examples/` folder.
