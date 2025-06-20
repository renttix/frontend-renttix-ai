'use client';

import React, { useState, useEffect, useRef } from 'react';

const LivePreview = ({ templateData }) => {
  const [previewType, setPreviewType] = useState('invoice');
  const [zoom, setZoom] = useState(100);
  const previewRef = useRef(null);

  const sampleData = {
    invoice: {
      title: 'INVOICE',
      number: 'INV-2024-001',
      date: new Date().toLocaleDateString(),
      customer: {
        name: 'John Smith',
        address: '123 Main Street',
        city: 'London, UK',
        phone: '+44 20 1234 5678'
      },
      items: [
        { description: 'Scaffold Tower - 4m', quantity: 2, rate: 150, total: 300 },
        { description: 'Safety Harness', quantity: 4, rate: 25, total: 100 },
        { description: 'Delivery Charge', quantity: 1, rate: 50, total: 50 }
      ],
      subtotal: 450,
      tax: 90,
      total: 540
    },
    quote: {
      title: 'QUOTATION',
      number: 'QUO-2024-001',
      date: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: {
        name: 'Jane Doe',
        address: '456 High Street',
        city: 'Manchester, UK',
        phone: '+44 161 1234 5678'
      },
      items: [
        { description: 'Concrete Mixer', quantity: 1, rate: 200, total: 200 },
        { description: 'Wheelbarrow', quantity: 3, rate: 30, total: 90 },
        { description: 'Setup & Collection', quantity: 1, rate: 75, total: 75 }
      ],
      subtotal: 365,
      tax: 73,
      total: 438
    }
  };

  const generatePreviewHTML = () => {
    const data = sampleData[previewType] || sampleData.invoice;
    const { settings } = templateData;
    
    const cssVariables = `
      :root {
        --primary-color: ${settings.colors.primary};
        --secondary-color: ${settings.colors.secondary};
        --accent-color: ${settings.colors.accent};
        --text-color: ${settings.colors.text};
        --background-color: ${settings.colors.background};
      }
    `;

    const baseStyles = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: ${settings.fonts.body}, sans-serif;
        color: var(--text-color);
        background-color: var(--background-color);
        padding: ${settings.margins.top} ${settings.margins.right} ${settings.margins.bottom} ${settings.margins.left};
        line-height: 1.6;
      }
      
      .document-header {
        margin-bottom: 30px;
        ${settings.header.alignment ? `text-align: ${settings.header.alignment};` : ''}
      }
      
      .company-logo {
        width: 120px;
        height: 40px;
        background-color: var(--primary-color);
        margin-bottom: 10px;
        ${settings.header.showLogo ? '' : 'display: none;'}
      }
      
      .company-details {
        font-size: ${settings.fonts.size.small};
        color: var(--secondary-color);
        ${settings.header.showCompanyDetails ? '' : 'display: none;'}
      }
      
      h1 {
        font-family: ${settings.fonts.heading}, sans-serif;
        font-size: ${settings.fonts.size.heading};
        color: var(--primary-color);
        margin-bottom: 20px;
      }
      
      h2 {
        font-family: ${settings.fonts.heading}, sans-serif;
        font-size: ${settings.fonts.size.subheading};
        color: var(--primary-color);
        margin-bottom: 15px;
      }
      
      .document-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .customer-details {
        flex: 1;
      }
      
      .document-meta {
        text-align: right;
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      th {
        background-color: var(--primary-color);
        color: white;
        padding: 10px;
        text-align: left;
        font-size: ${settings.fonts.size.body};
      }
      
      td {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
        font-size: ${settings.fonts.size.body};
      }
      
      .totals {
        text-align: right;
        margin-top: 20px;
      }
      
      .total-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 5px;
      }
      
      .total-label {
        margin-right: 20px;
        color: var(--secondary-color);
      }
      
      .total-value {
        min-width: 100px;
        text-align: right;
      }
      
      .grand-total {
        font-size: ${settings.fonts.size.subheading};
        font-weight: bold;
        color: var(--accent-color);
        border-top: 2px solid var(--primary-color);
        padding-top: 10px;
        margin-top: 10px;
      }
      
      .document-footer {
        position: fixed;
        bottom: 20px;
        left: ${settings.margins.left};
        right: ${settings.margins.right};
        text-align: center;
        font-size: ${settings.fonts.size.small};
        color: var(--secondary-color);
      }
      
      .page-number {
        ${settings.footer.showPageNumbers ? '' : 'display: none;'}
      }
      
      .footer-text {
        ${settings.footer.showFooterText ? '' : 'display: none;'}
      }
    `;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${cssVariables}
            ${baseStyles}
            ${templateData.customCSS || ''}
          </style>
        </head>
        <body>
          <div class="document-header">
            <div class="company-logo"></div>
            <div class="company-details">
              <div>Your Company Name</div>
              <div>123 Business Street, London, UK</div>
              <div>Tel: +44 20 1234 5678 | Email: info@company.com</div>
            </div>
          </div>
          
          <h1>${data.title}</h1>
          
          <div class="document-info">
            <div class="customer-details">
              <h2>Bill To:</h2>
              <div><strong>${data.customer.name}</strong></div>
              <div>${data.customer.address}</div>
              <div>${data.customer.city}</div>
              <div>${data.customer.phone}</div>
            </div>
            <div class="document-meta">
              <div><strong>Document #:</strong> ${data.number}</div>
              <div><strong>Date:</strong> ${data.date}</div>
              ${data.validUntil ? `<div><strong>Valid Until:</strong> ${data.validUntil}</div>` : ''}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="width: 100px; text-align: center;">Quantity</th>
                <th style="width: 100px; text-align: right;">Rate</th>
                <th style="width: 100px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">£${item.rate.toFixed(2)}</td>
                  <td style="text-align: right;">£${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">£${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">VAT (20%):</span>
              <span class="total-value">£${data.tax.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total:</span>
              <span class="total-value">£${data.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="document-footer">
            <div class="page-number">Page 1 of 1</div>
            <div class="footer-text">${settings.footer.footerText || 'Thank you for your business!'}</div>
          </div>
        </body>
      </html>
    `;
    
    return html;
  };

  useEffect(() => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(generatePreviewHTML());
      doc.close();
    }
  }, [templateData, previewType]);

  return (
    <div className="live-preview">
      <div className="preview-header">
        <div className="preview-controls">
          <label>Preview Type:</label>
          <select
            value={previewType}
            onChange={(e) => setPreviewType(e.target.value)}
            className="preview-type-select"
          >
            <option value="invoice">Invoice</option>
            <option value="quote">Quote</option>
          </select>
          
          <div className="zoom-controls">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="zoom-button"
              title="Zoom Out"
            >
              <i className="pi pi-minus"></i>
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="zoom-button"
              title="Zoom In"
            >
              <i className="pi pi-plus"></i>
            </button>
            <button
              onClick={() => setZoom(100)}
              className="zoom-button"
              title="Reset Zoom"
            >
              <i className="pi pi-refresh"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="preview-container">
        <div className="preview-paper" style={{ transform: `scale(${zoom / 100})` }}>
          <iframe
            ref={previewRef}
            className="preview-iframe"
            title="Document Preview"
          />
        </div>
      </div>

      <div className="preview-info">
        <i className="pi pi-info-circle"></i>
        <span>This is a live preview of your document template with sample data</span>
      </div>
    </div>
  );
};

export default LivePreview;