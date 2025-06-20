'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileDownload, FaSpinner, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';
import './signature-page.css';

// Dynamically import SignatureCanvas to avoid SSR issues
const SignatureCanvas = dynamic(() => import('react-signature-canvas'), {
  ssr: false,
});

export default function SignAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const signatureRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [error, setError] = useState(null);
  const [geolocation, setGeolocation] = useState(null);

  useEffect(() => {
    fetchAgreementDetails();
    requestGeolocation();
  }, [params.token]);

  const fetchAgreementDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/agreements/${params.token}`
      );
      
      if (response.data.success) {
        setAgreement(response.data.agreement);
        setOrder(response.data.order);
        setCustomer(response.data.customer);
        setSignatureName(response.data.customer.name || '');
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

  const requestGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const isSignatureEmpty = () => {
    return signatureRef.current ? signatureRef.current.isEmpty() : true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    if (!signatureName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!signatureRole.trim()) {
      toast.error('Please enter your role/title');
      return;
    }
    
    if (isSignatureEmpty()) {
      toast.error('Please provide your signature');
      return;
    }
    
    setSigning(true);
    
    try {
      const signatureData = signatureRef.current.toDataURL();
      
      const payload = {
        signatureName,
        signatureRole,
        signatureData,
        termsAccepted,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      if (geolocation) {
        payload.geolocation = geolocation;
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/agreements/${params.token}/sign`,
        payload
      );
      
      if (response.data.success) {
        toast.success('Agreement signed successfully!');
        
        // Show success page
        setAgreement({
          ...agreement,
          status: 'signed',
          signedAt: new Date().toISOString()
        });
      } else {
        toast.error(response.data.message || 'Failed to sign agreement');
      }
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast.error(error.response?.data?.message || 'Failed to sign agreement');
    } finally {
      setSigning(false);
    }
  };

  const downloadAgreement = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/agreements/${params.token}/download`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hire-agreement-${order?.orderNumber || 'document'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading agreement:', error);
      toast.error('Failed to download agreement');
    }
  };

  if (loading) {
    return (
      <div className="signature-page-loading">
        <FaSpinner className="spinner" />
        <p>Loading agreement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="signature-page-error">
        <FaTimes className="error-icon" />
        <h2>Unable to Load Agreement</h2>
        <p>{error}</p>
        <p className="error-help">
          If you believe this is an error, please contact support with your order reference.
        </p>
      </div>
    );
  }

  if (agreement?.status === 'signed') {
    return (
      <div className="signature-page-success">
        <div className="success-content">
          <FaCheck className="success-icon" />
          <h1>Agreement Successfully Signed</h1>
          <p>Thank you for signing the hire agreement.</p>
          <p className="success-details">
            Order Number: <strong>{order?.orderNumber}</strong><br />
            Signed on: <strong>{new Date(agreement.signedAt).toLocaleString()}</strong>
          </p>
          <button onClick={downloadAgreement} className="download-button">
            <FaFileDownload /> Download Signed Agreement
          </button>
          <p className="success-note">
            A copy of the signed agreement has been sent to your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="signature-page">
      <div className="signature-container">
        <div className="signature-header">
          <h1>Sign Hire Agreement</h1>
          <p className="order-info">
            Order #{order?.orderNumber} - {customer?.name}
          </p>
        </div>

        <div className="agreement-preview">
          <h2>Agreement Details</h2>
          <div className="agreement-summary">
            <div className="summary-row">
              <span className="label">Hire Period:</span>
              <span className="value">
                {new Date(order?.hireStartDate).toLocaleDateString()} - {new Date(order?.hireEndDate).toLocaleDateString()}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Total Value:</span>
              <span className="value">£{order?.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Delivery Address:</span>
              <span className="value">{order?.deliveryAddress?.address1}, {order?.deliveryAddress?.city}</span>
            </div>
          </div>
          
          <button onClick={downloadAgreement} className="view-agreement-button">
            <FaFileDownload /> View Full Agreement
          </button>
        </div>

        <form onSubmit={handleSubmit} className="signature-form">
          <div className="form-section">
            <h3>Your Details</h3>
            <div className="form-group">
              <label htmlFor="signatureName">Full Name *</label>
              <input
                type="text"
                id="signatureName"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="signatureRole">Role/Title *</label>
              <input
                type="text"
                id="signatureRole"
                value={signatureRole}
                onChange={(e) => setSignatureRole(e.target.value)}
                placeholder="e.g., Director, Manager, Authorized Signatory"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Electronic Signature *</h3>
            <p className="signature-instructions">
              Please sign in the box below using your mouse or finger (on touch devices)
            </p>
            <div className="signature-canvas-container">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'signature-canvas',
                  width: 500,
                  height: 200
                }}
              />
              <button type="button" onClick={clearSignature} className="clear-signature-button">
                <FaUndo /> Clear Signature
              </button>
            </div>
          </div>

          <div className="form-section">
            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <span>
                  I confirm that I have read and understood the hire agreement terms and conditions. 
                  I am authorized to sign this agreement on behalf of {customer?.name} and agree to 
                  be bound by its terms. *
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={signing || !termsAccepted || !signatureName || !signatureRole}
            >
              {signing ? (
                <>
                  <FaSpinner className="spinner" /> Signing Agreement...
                </>
              ) : (
                'Sign Agreement'
              )}
            </button>
          </div>

          <div className="legal-notice">
            <p>
              By signing this agreement electronically, you agree that your electronic signature 
              is the legal equivalent of your manual signature on this agreement.
            </p>
            <p className="ip-notice">
              Your IP address and location (if permitted) will be recorded for security purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}