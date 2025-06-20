'use client';

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FaUndo, FaCheck } from 'react-icons/fa';

export default function TestSignaturePage() {
  const signatureRef = useRef();
  const [signatureData, setSignatureData] = useState('');

  const clearSignature = () => {
    signatureRef.current.clear();
    setSignatureData('');
  };

  const saveSignature = () => {
    if (!signatureRef.current.isEmpty()) {
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
      <h1 style={{ marginBottom: '20px' }}>Test Signature Canvas</h1>
      
      <div style={{ 
        border: '2px dashed #ccc', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <p style={{ marginBottom: '10px' }}>Sign below:</p>
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            style: {
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              height: '200px',
              backgroundColor: 'white'
            }
          }}
        />
        
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