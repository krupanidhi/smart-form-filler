# 🚀 Quick Start Guide

Get started with Smart Form Filler in 5 minutes!

## Step 1: Install Dependencies

```bash
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler
npm install
```

This will install:
- Playwright (browser automation)
- Faker.js (test data generation)
- OpenAI SDK (optional, for vision AI)

## Step 2: Install Playwright Browsers

```bash
npx playwright install chromium
```

## Step 3: Create Your First Script

Create a file `my-first-fill.js`:

```javascript
import { SmartFormFiller } from './src/form-filler.js';

async function fillMyForm() {
  const filler = new SmartFormFiller({
    headless: false,  // See what's happening
  });

  try {
    // Replace with your form URL
    await filler.goto('https://www.w3schools.com/html/html_forms.asp');
    
    // Magic happens here!
    await filler.fillForm();
    
    console.log('✅ Form filled successfully!');
    
    // Keep browser open to see results
    await filler.page.waitForTimeout(5000);
    await filler.close();
    
  } catch (error) {
    console.error('Error:', error);
    await filler.close();
  }
}

fillMyForm();
```

## Step 4: Run It!

```bash
node my-first-fill.js
```

Watch as the tool:
1. 🔍 Detects all form fields
2. 🧠 Identifies field types
3. 📝 Generates realistic data
4. ✏️ Fills the form automatically

## Next Steps

### Customize Data

```javascript
await filler.fillForm({
  'email': 'myemail@example.com',
  'name': 'John Doe',
});
```

### Analyze Form First

```javascript
const analysis = await filler.analyzeForm();
console.log(analysis);
```

### Submit Form

```javascript
await filler.fillForm();
await filler.submit();
```

### Use in Tests

```javascript
import { test } from '@playwright/test';
import { SmartFormFiller } from './src/form-filler.js';

test('fill registration form', async () => {
  const filler = new SmartFormFiller({ headless: true });
  await filler.goto('https://example.com/register');
  const result = await filler.fillForm();
  expect(result.filled).toBeGreaterThan(0);
  await filler.close();
});
```

## Common Issues

### Browser doesn't open
- Run `npx playwright install chromium`
- Check if port 3000 is available

### Fields not detected
- Check if fields are visible (not hidden)
- Try `analyzeForm()` to see what's detected
- Add custom selectors if needed

### Wrong data generated
- Use `customData` option to specify exact values
- Check field type detection with `analyzeForm()`

## Examples

Check the `examples/` folder for:
- ✅ Simple usage
- ✅ Custom data
- ✅ Form analysis
- ✅ Test automation

## Need Help?

1. Read the full [README.md](README.md)
2. Check [examples/](examples/)
3. Run the demo: `npm run demo`

Happy automating! 🎉
