'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { FaFileDownload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

export default function SimpleSignAgreementPage() {
  const params = useParams();
  
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [error, setError] = useState(null);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    fetchAgreementDetails();
  }, [params.token]);

  const fetchAgreementDetails = async () => {
    try {
      console.log('Fetching agreement with token:', params.token);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/agreements/${params.token}`
      );
      
      console.log('Agreement response:', response.data);
      
      if (response.data.success) {
        setAgreement(response.data.agreement);
        setSignatureName(response.data.customer?.name || '');
      } else {
        setError(response.data.message || 'Agreement not found');
      }
    } catch (error) {
      console.error('Error fetching agreement:', error);
      setError(error.response?.data?.message || 'Failed to load agreement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }
    
    if (!signatureName.trim() || !signatureRole.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSigning(true);
    
    try {
      // For now, use a simple text signature
      const payload = {
        signatureName,
        signatureRole,
        signatureData: `Signed by: ${signatureName}`,
        termsAccepted,
        userAgent: navigator.userAgent
      };
      
      console.log('Submitting signature:', payload);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/agreements/${params.token}/sign`,
        payload
      );
      
      if (response.data.success) {
        alert('Agreement signed successfully!');
        setAgreement({
          ...agreement,
          signatureStatus: 'signed'
        });
      } else {
        alert(response.data.message || 'Failed to sign agreement');
      }
    } catch (error) {
      console.error('Error signing agreement:', error);
      alert(error.response?.data?.message || 'Failed to sign agreement');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <FaSpinner style={{ fontSize: '48px', animation: 'spin 1s linear infinite' }} />
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <FaTimes style={{ fontSize: '48px', color: 'red' }} />
        <h2>Unable to Load Agreement</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (agreement?.signatureStatus === 'signed') {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <FaCheck style={{ fontSize: '48px', color: 'green' }} />
        <h1>Agreement Already Signed</h1>
        <p>This agreement has already been signed.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sign Hire Agreement</h1>
      <p>Token: {params.token}</p>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Agreement Details</h2>
        <p>Agreement ID: {agreement?._id}</p>
        <p>Status: {agreement?.signatureStatus}</p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Full Name *
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label>
            Role/Title *
            <input
              type="text"
              value={signatureRole}
              onChange={(e) => setSignatureRole(e.target.value)}
              placeholder="e.g., Director, Manager"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              style={{ marginRight: '10px' }}
            />
            I accept the terms and conditions *
          </label>
        </div>

        <button 
          type="submit" 
          disabled={signing || !termsAccepted}
          style={{
            padding: '12px 30px',
            backgroundColor: signing || !termsAccepted ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: signing || !termsAccepted ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {signing ? 'Signing...' : 'Sign Agreement'}
        </button>
      </form>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}