'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CSSEditor = ({ css, onChange }) => {
  const [localCSS, setLocalCSS] = useState(css || '');
  const [errors, setErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setLocalCSS(css || '');
  }, [css]);

  const validateCSS = (cssText) => {
    const errors = [];
    
    // Basic CSS validation
    const lines = cssText.split('\n');
    let inComment = false;
    let braceCount = 0;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for comment blocks
      if (line.includes('/*')) inComment = true;
      if (line.includes('*/')) inComment = false;
      
      if (!inComment) {
        // Count braces
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        // Check for common CSS errors
        if (line.includes(':') && !line.includes(';') && !line.includes('{')) {
          if (line.trim() && !line.trim().endsWith(',')) {
            errors.push({
              line: lineNum,
              message: 'Missing semicolon'
            });
          }
        }
        
        // Check for invalid selectors
        if (line.includes('{') && !line.includes(':')) {
          const selector = line.split('{')[0].trim();
          if (selector && !/^[a-zA-Z0-9\s\-_#.\[\]:,>+~*="'\(\)]+$/.test(selector)) {
            errors.push({
              line: lineNum,
              message: 'Invalid selector syntax'
            });
          }
        }
      }
    });
    
    if (braceCount !== 0) {
      errors.push({
        line: lines.length,
        message: `Unmatched braces (${braceCount > 0 ? 'missing closing' : 'extra closing'} brace)`
      });
    }
    
    return errors;
  };

  const handleChange = (value) => {
    setLocalCSS(value);
    
    // Debounced validation
    if (isValidating) return;
    
    setIsValidating(true);
    setTimeout(() => {
      const validationErrors = validateCSS(value);
      setErrors(validationErrors);
      setIsValidating(false);
      
      if (validationErrors.length === 0) {
        onChange(value);
      }
    }, 500);
  };

  const insertSnippet = (snippet) => {
    const newCSS = localCSS + (localCSS ? '\n\n' : '') + snippet;
    handleChange(newCSS);
  };

  const cssSnippets = [
    {
      name: 'Page Break',
      code: `.page-break {
  page-break-after: always;
}`
    },
    {
      name: 'Hide Element',
      code: `.no-print {
  display: none !important;
}`
    },
    {
      name: 'Custom Header',
      code: `.document-header {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--primary-color);
}`
    },
    {
      name: 'Table Styling',
      code: `table {
  width: 100%;
  border-collapse: collapse;
}

table th {
  background-color: var(--primary-color);
  color: white;
  padding: 10px;
  text-align: left;
}

table td {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}`
    },
    {
      name: 'Watermark',
      code: `.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 120px;
  color: rgba(0, 0, 0, 0.1);
  z-index: -1;
}`
    },
    {
      name: 'Custom Footer',
      code: `.document-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  padding: 10px;
  border-top: 1px solid #ddd;
}`
    }
  ];

  return (
    <div className="css-editor">
      <div className="editor-header">
        <h3>Custom CSS</h3>
        <p>Add custom styles to further customize your document appearance</p>
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-section">
          <label>Quick Snippets:</label>
          <div className="snippet-buttons">
            {cssSnippets.map((snippet, index) => (
              <button
                key={index}
                className="snippet-button"
                onClick={() => insertSnippet(snippet.code)}
                title={snippet.code}
              >
                {snippet.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="editor-container">
        <div className="line-numbers">
          {localCSS.split('\n').map((_, index) => (
            <div key={index} className="line-number">
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          className="css-textarea"
          value={localCSS}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="/* Enter your custom CSS here */
          
/* Available CSS variables:
   --primary-color
   --secondary-color
   --accent-color
   --text-color
   --background-color
*/

.custom-class {
  /* Your styles here */
}"
          spellCheck="false"
        />
      </div>

      {errors.length > 0 && (
        <div className="validation-errors">
          <h4>
            <i className="pi pi-exclamation-triangle"></i>
            CSS Validation Errors
          </h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>
                Line {error.line}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-info">
        <div className="info-item">
          <i className="pi pi-info-circle"></i>
          <span>CSS variables are automatically applied based on your theme and color settings</span>
        </div>
        <div className="info-item">
          <i className="pi pi-lightbulb"></i>
          <span>Use the snippets above for common styling patterns</span>
        </div>
      </div>
    </div>
  );
};

export default CSSEditor;