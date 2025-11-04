# 🌐 Fill ANY Form on ANY Page

You can now fill **any form** on **any webpage** with this tool!

## 🚀 Three Simple Ways

### 1️⃣ Command Line (Fastest)

```bash
# Fill any form
node fill-any-form.js https://example.com/form

# With your data
node fill-any-form.js https://example.com/form --data "email=test@example.com,name=John"

# Fill and submit
node fill-any-form.js https://example.com/form --submit

# Your HRSA login
node fill-any-form.js https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn --data "username=YOUR_USER,password=YOUR_PASS" --keep-open
```

### 2️⃣ One-Line Code

```javascript
import { quickFill } from './src/universal-filler.js';

// That's it!
await quickFill('https://example.com/form', {
  'email': 'test@example.com',
  'name': 'John Doe',
});
```

### 3️⃣ Full Control

```javascript
import { fillAnyForm } from './src/universal-filler.js';

const result = await fillAnyForm('https://example.com/form', {
  customData: {
    'email': 'test@example.com',
    'name': 'John Doe',
  },
  submit: true,
  analyze: true,
  keepOpen: true,
});

console.log(`Filled ${result.filled}/${result.total} fields`);
```

## 📋 Common Commands

```bash
# Analyze form (see what fields exist)
node fill-any-form.js YOUR_URL --analyze-only

# Fill with custom data
node fill-any-form.js YOUR_URL --data "field1=value1,field2=value2"

# Fill and submit
node fill-any-form.js YOUR_URL --submit

# Keep browser open to review
node fill-any-form.js YOUR_URL --keep-open

# Slow down to see what's happening
node fill-any-form.js YOUR_URL --slow

# Run in background (no browser window)
node fill-any-form.js YOUR_URL --headless
```

## 🎯 Your Use Cases

### Login Pages
```bash
node fill-any-form.js https://your-site.com/login --data "username=user,password=pass" --submit
```

### Contact Forms
```bash
node fill-any-form.js https://your-site.com/contact --data "name=John,email=john@example.com,message=Hello"
```

### Registration Forms
```bash
node fill-any-form.js https://your-site.com/register --data "email=test@example.com,password=Pass123"
```

### Survey Forms
```bash
node fill-any-form.js https://your-site.com/survey --slow --keep-open
```

### Any Other Form
```bash
node fill-any-form.js YOUR_URL --analyze-only  # See what fields exist
node fill-any-form.js YOUR_URL --data "field=value"  # Fill them
```

## 📚 Documentation

- **[FILL_ANY_PAGE.md](FILL_ANY_PAGE.md)** - Complete guide with examples
- **[examples/fill-any-page.js](examples/fill-any-page.js)** - 8 working examples
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Detailed usage guide
- **[README.md](README.md)** - Full documentation

## 🎓 Examples

Run the examples:

```bash
node examples/fill-any-page.js 1  # Quick fill
node examples/fill-any-page.js 2  # With options
node examples/fill-any-page.js 3  # Fill and submit
node examples/fill-any-page.js 4  # Analyze only
node examples/fill-any-page.js 5  # Multiple forms
node examples/fill-any-page.js 6  # Custom logic
node examples/fill-any-page.js 7  # Login flow
node examples/fill-any-page.js 8  # HRSA login
```

## 💡 Quick Tips

1. **Always analyze first** to see what fields are detected:
   ```bash
   node fill-any-form.js YOUR_URL --analyze-only
   ```

2. **Keep browser open** to review before submitting:
   ```bash
   node fill-any-form.js YOUR_URL --keep-open
   ```

3. **Check screenshots** in the `screenshots/` folder

4. **Start without --submit** until you're confident

5. **Use --slow** to see the automation in action

## 🔧 Create Your Own Script

Create `my-form.js`:

```javascript
import { quickFill } from './src/universal-filler.js';

await quickFill('YOUR_URL_HERE', {
  'fieldName1': 'value1',
  'fieldName2': 'value2',
});
```

Run it:
```bash
node my-form.js
```

## 🎉 You're Ready!

**Fill ANY form on ANY page with just one command:**

```bash
node fill-any-form.js YOUR_URL
```

That's it! The tool will:
- ✅ Detect all form fields automatically
- ✅ Generate realistic data
- ✅ Fill everything
- ✅ Take screenshots
- ✅ Work with any website

---

**Need help?** Read [FILL_ANY_PAGE.md](FILL_ANY_PAGE.md) for complete documentation.
