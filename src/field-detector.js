/**
 * Intelligent Form Field Detector
 * Analyzes DOM elements to identify form fields without XPath
 */

export class FieldDetector {
  constructor() {
    this.fieldPatterns = {
      email: /email|e-mail|correo/i,
      password: /password|passwd|pwd|contraseña/i,
      phone: /phone|tel|mobile|celular/i,
      name: /name|nombre|nom/i,
      firstName: /first.*name|fname|given.*name|nombre.*pila/i,
      lastName: /last.*name|lname|surname|family.*name|apellido/i,
      address: /address|direccion|street|calle/i,
      city: /city|ciudad|town/i,
      state: /state|province|provincia|region/i,
      zip: /zip|postal|codigo.*postal/i,
      country: /country|pais|nation/i,
      company: /company|organization|empresa|organizacion/i,
      website: /website|url|web.*site|sitio.*web/i,
      date: /date|fecha|birthday|birth.*date|dob/i,
      age: /age|edad/i,
      gender: /gender|sex|genero|sexo/i,
      username: /username|user.*name|login|usuario/i,
      message: /message|comment|mensaje|comentario|description/i,
      subject: /subject|asunto|topic/i,
      card: /card.*number|credit.*card|tarjeta/i,
      cvv: /cvv|cvc|security.*code/i,
      ssn: /ssn|social.*security/i,
    };
  }

  /**
   * Detect all form fields on a page
   * @param {Page} page - Playwright page object
   * @returns {Promise<Array>} Array of detected fields
   */
  async detectFields(page) {
    const fields = await page.evaluate(() => {
      const results = [];
      
      // Helper function: Check if element is visible
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetParent !== null;
      };
      
      // Helper function: Find associated label
      const findLabel = (element) => {
        if (element.id) {
          const label = document.querySelector(`label[for="${element.id}"]`);
          if (label) return label.textContent.trim();
        }
        
        const parentLabel = element.closest('label');
        if (parentLabel) {
          return parentLabel.textContent.replace(element.value || '', '').trim();
        }
        
        let sibling = element.previousElementSibling;
        while (sibling) {
          if (sibling.tagName === 'LABEL') {
            return sibling.textContent.trim();
          }
          if (sibling.tagName === 'SPAN' || sibling.tagName === 'DIV') {
            const text = sibling.textContent.trim();
            if (text.length < 100) return text;
          }
          sibling = sibling.previousElementSibling;
        }
        
        return '';
      };
      
      // Helper function: Get nearby text
      const getNearbyText = (element) => {
        const parent = element.parentElement;
        if (!parent) return '';
        
        const text = parent.textContent.trim();
        return text.length < 200 ? text : text.substring(0, 200);
      };
      
      // Helper function: Analyze element
      const analyzeElement = (element, index) => {
        const rect = element.getBoundingClientRect();
        
        return {
          index,
          tagName: element.tagName.toLowerCase(),
          type: element.type || 'text',
          id: element.id || '',
          name: element.name || '',
          placeholder: element.placeholder || '',
          ariaLabel: element.getAttribute('aria-label') || '',
          className: element.className || '',
          value: element.value || '',
          required: element.required || false,
          disabled: element.disabled || false,
          readonly: element.readOnly || false,
          maxLength: element.maxLength || null,
          pattern: element.pattern || '',
          autocomplete: element.autocomplete || '',
          label: findLabel(element),
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
          context: getNearbyText(element),
        };
      };
      
      // Find all interactive form elements
      const selectors = [
        'input:not([type="hidden"]):not([type="submit"]):not([type="button"])',
        'textarea',
        'select',
        '[contenteditable="true"]',
        '[role="textbox"]',
        '[role="combobox"]',
      ];
      
      const elements = document.querySelectorAll(selectors.join(','));
      
      elements.forEach((element, index) => {
        if (!isVisible(element)) return;
        
        const fieldInfo = analyzeElement(element, index);
        if (fieldInfo) {
          results.push(fieldInfo);
        }
      });
      
      return results;
    });
    
    // Enhance with AI classification
    return fields.map(field => this.classifyField(field));
  }

  /**
   * Classify field type using pattern matching and context
   */
  classifyField(field) {
    const searchText = [
      field.id,
      field.name,
      field.placeholder,
      field.label,
      field.ariaLabel,
      field.autocomplete,
      field.context,
    ].join(' ').toLowerCase();

    // Check HTML5 input type first
    if (field.type && field.type !== 'text') {
      field.detectedType = field.type;
    }
    
    // Pattern matching
    for (const [type, pattern] of Object.entries(this.fieldPatterns)) {
      if (pattern.test(searchText)) {
        field.detectedType = type;
        field.confidence = 'high';
        return field;
      }
    }
    
    // Fallback based on element characteristics
    if (field.tagName === 'textarea') {
      field.detectedType = 'message';
      field.confidence = 'medium';
    } else if (field.tagName === 'select') {
      field.detectedType = 'select';
      field.confidence = 'high';
    } else {
      field.detectedType = 'text';
      field.confidence = 'low';
    }
    
    return field;
  }

  /**
   * Get selector for a field (without XPath)
   */
  getSelector(field) {
    // Priority order for selector generation
    if (field.id) {
      return `#${field.id}`;
    }
    
    if (field.name) {
      return `[name="${field.name}"]`;
    }
    
    if (field.placeholder) {
      return `[placeholder="${field.placeholder}"]`;
    }
    
    if (field.ariaLabel) {
      return `[aria-label="${field.ariaLabel}"]`;
    }
    
    // Use label text
    if (field.label) {
      return `text=${field.label}`;
    }
    
    // Fallback to nth-of-type
    return `${field.tagName}:nth-of-type(${field.index + 1})`;
  }
}
