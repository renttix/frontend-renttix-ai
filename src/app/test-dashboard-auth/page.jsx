'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '../../services/apiService';

export default function TestDashboardAuth() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setStatus('Logging in...');
    
    try {
      // Login with test credentials
      const loginResponse = await api.post('/vender-login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (loginResponse.data.token) {
        setStatus('Login successful! Token: Present');
        
        // Set the token in cookie
        Cookies.set('xpdx', loginResponse.data.token, { expires: 7 });
        setStatus(prev => prev + '\nToken set in cookie');
        
        // Store user data in Redux if needed
        if (loginResponse.data.user) {
          // You might want to dispatch user data to Redux here
          console.log('User data:', loginResponse.data.user);
        }
        
        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          setStatus(prev => prev + '\nRedirecting to dashboard...');
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('Login failed: ' + (loginResponse.data.message || 'No token received'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('Login error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setLoading(true);
    setStatus('Testing dashboard API...');
    
    try {
      const token = Cookies.get('xpdx');
      setStatus(prev => prev + '\nToken from cookie: ' + (token ? 'Present' : 'Missing'));
      
      // Test dashboard layouts API
      const response = await api.get('/api/dashboard/layouts');
      
      setStatus(prev => prev + '\nAPI Response: Success');
      setStatus(prev => prev + '\nLayouts count: ' + (response.data.data?.length || 0));
      
      console.log('Dashboard layouts:', response.data);
    } catch (error) {
      console.error('API error:', error);
      setStatus(prev => prev + '\nAPI error: ' + (error.response?.status || 'Unknown') + ' - ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Dashboard Authentication Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Login as Test User
        </button>
        
        <button 
          onClick={handleTestAPI} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          Test Dashboard API
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '14px',
        minHeight: '200px'
      }}>
        {status || 'Click a button to start testing...'}
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Test Credentials:</strong></p>
        <p>Email: test@example.com</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
}