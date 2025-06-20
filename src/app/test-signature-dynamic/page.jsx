'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { FaUndo, FaCheck } from 'react-icons/fa';

// Dynamically import SignatureCanvas to avoid SSR issues
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
  ssr: false,
});

export default function TestSignatureDynamicPage() {
  const signatureRef = useRef();
  const [signatureData, setSignatureData] = useState('');

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData('');
    }
  };

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const data = signatureRef.current.toDataURL();
      setSignatureData(data);
      alert('Signature saved! Check console for data.');
      console.log('Signature Data:', data);
    } else {
      alert('Please provide a signature first.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Test Signature Canvas (Dynamic Import)</h1>
      
      <div style={{ 
        border: '2px dashed #ccc', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <p style={{ marginBottom: '10px' }}>Sign below:</p>
        <div style={{ 
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          minHeight: '200px'
        }}>
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              style: {
                width: '100%',
                height: '200px'
              }
            }}
          />
        </div>
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={clearSignature}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaUndo /> Clear
          </button>
          
          <button 
            onClick={saveSignature}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FaCheck /> Save
          </button>
        </div>
      </div>

      {signatureData && (
        <div>
          <h3>Saved Signature:</h3>
          <img 
            src={signatureData} 
            alt="Saved signature" 
            style={{ 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              maxWidth: '100%'
            }} 
          />
        </div>
      )}
    </div>
  );
}