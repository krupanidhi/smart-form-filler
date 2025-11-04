/**
 * Universal Form Filler - Reusable Functions
 * Import and use in your own scripts
 */

import { SmartFormFiller } from './form-filler.js';

/**
 * Fill any form with one function call
 * @param {string} url - URL of the page with form
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Result with filled fields info
 */
export async function fillAnyForm(url, options = {}) {
  const {
    customData = {},
    submit = false,
    analyze = false,
    headless = false,
    keepOpen = false,
    slowMo = 50,
    waitForSelector = null,
    submitSelector = null,
    beforeFill = null,
    afterFill = null,
  } = options;

  const filler = new SmartFormFiller({
    headless,
    slowMo,
    screenshot: true,
  });

  try {
    // Navigate
    await filler.goto(url);
    await filler.page.waitForLoadState('networkidle');

    // Wait for specific element if requested
    if (waitForSelector) {
      await filler.page.waitForSelector(waitForSelector);
    }

    // Run custom code before filling
    if (beforeFill) {
      await beforeFill(filler.page);
    }

    // Analyze if requested
    let analysis = null;
    if (analyze) {
      analysis = await filler.analyzeForm();
    }

    // Fill form
    const result = await filler.fillForm(customData);

    // Run custom code after filling
    if (afterFill) {
      await afterFill(filler.page);
    }

    // Submit if requested
    if (submit) {
      if (submitSelector) {
        await filler.page.click(submitSelector);
      } else {
        await filler.submit();
      }
      await filler.page.waitForTimeout(1000);
    }

    // Close or keep open
    if (!keepOpen) {
      await filler.close();
    }

    return {
      success: true,
      filled: result.filled,
      total: result.total,
      analysis,
      filler: keepOpen ? filler : null,
    };

  } catch (error) {
    await filler.takeScreenshot('error');
    if (!keepOpen) {
      await filler.close();
    }
    
    return {
      success: false,
      error: error.message,
      filler: keepOpen ? filler : null,
    };
  }
}

/**
 * Fill multiple forms in sequence
 * @param {Array} forms - Array of {url, customData} objects
 * @param {object} options - Global options
 * @returns {Promise<Array>} Results for each form
 */
export async function fillMultipleForms(forms, options = {}) {
  const results = [];
  
  for (const form of forms) {
    console.log(`\n📝 Filling form: ${form.url}`);
    
    const result = await fillAnyForm(form.url, {
      ...options,
      customData: form.customData || {},
    });
    
    results.push({
      url: form.url,
      ...result,
    });
    
    console.log(result.success ? '✅ Success' : '❌ Failed');
  }
  
  return results;
}

/**
 * Quick fill - simplest possible usage
 * @param {string} url - URL to fill
 * @param {object} data - Field data
 */
export async function quickFill(url, data = {}) {
  return await fillAnyForm(url, {
    customData: data,
    headless: false,
    keepOpen: false,
  });
}

/**
 * Analyze form without filling
 * @param {string} url - URL to analyze
 * @returns {Promise<object>} Form analysis
 */
export async function analyzeFormOnly(url) {
  const result = await fillAnyForm(url, {
    analyze: true,
    submit: false,
    headless: false,
  });
  
  return result.analysis;
}

/**
 * Fill and submit form
 * @param {string} url - URL to fill
 * @param {object} data - Field data
 * @param {string} submitSelector - Optional submit button selector
 */
export async function fillAndSubmit(url, data = {}, submitSelector = null) {
  return await fillAnyForm(url, {
    customData: data,
    submit: true,
    submitSelector,
    headless: false,
  });
}

/**
 * Fill form with custom logic
 * @param {string} url - URL to fill
 * @param {Function} customFillLogic - Function that receives page and fields
 */
export async function fillWithCustomLogic(url, customFillLogic) {
  const filler = new SmartFormFiller({ headless: false });
  
  try {
    await filler.goto(url);
    await filler.page.waitForLoadState('networkidle');
    
    const fields = await filler.detectFields();
    
    // Let user implement custom logic
    await customFillLogic(filler.page, fields, filler);
    
    await filler.takeScreenshot('custom-fill');
    await filler.close();
    
    return { success: true };
    
  } catch (error) {
    await filler.close();
    return { success: false, error: error.message };
  }
}
