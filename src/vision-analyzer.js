/**
 * Vision-based Form Analyzer
 * Uses AI vision to analyze form screenshots (optional enhancement)
 */

import OpenAI from 'openai';
import fs from 'fs';

export class VisionAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.client = this.apiKey ? new OpenAI({ apiKey: this.apiKey }) : null;
  }

  /**
   * Analyze form screenshot using vision AI
   */
  async analyzeScreenshot(imagePath) {
    if (!this.client) {
      console.warn('⚠️  OpenAI API key not provided. Vision analysis disabled.');
      return null;
    }

    try {
      // Read image as base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this form and identify all input fields. For each field, provide:
1. Field label or placeholder text
2. Field type (text, email, password, etc.)
3. Whether it appears required
4. Any validation hints visible

Return as JSON array with format:
[
  {
    "label": "Email Address",
    "type": "email",
    "required": true,
    "hints": "Must be valid email"
  }
]`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0].message.content;
      
      // Try to parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    } catch (error) {
      console.error('Vision analysis error:', error.message);
      return null;
    }
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const mimeTypes = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext] || 'image/png';
  }

  /**
   * Enhance field detection with vision analysis
   */
  async enhanceFieldDetection(fields, screenshotPath) {
    const visionFields = await this.analyzeScreenshot(screenshotPath);
    
    if (!visionFields) return fields;

    // Match vision-detected fields with DOM fields
    return fields.map(field => {
      const match = visionFields.find(vf => 
        this.fieldsMatch(field, vf)
      );

      if (match) {
        return {
          ...field,
          visionEnhanced: true,
          visionType: match.type,
          visionRequired: match.required,
          visionHints: match.hints,
        };
      }

      return field;
    });
  }

  /**
   * Check if DOM field matches vision-detected field
   */
  fieldsMatch(domField, visionField) {
    const domText = [
      domField.label,
      domField.placeholder,
      domField.ariaLabel,
    ].filter(Boolean).join(' ').toLowerCase();

    const visionText = visionField.label.toLowerCase();

    return domText.includes(visionText) || visionText.includes(domText);
  }
}
