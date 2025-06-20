// Test file to verify dashboard fixes
import { checkEnvironmentVariables } from './envCheck';
import widgetServices from '../services/widgetServices';

export const testDashboardFixes = async () => {
  console.log('=== Testing Dashboard Fixes ===');
  
  // 1. Test environment variable check
  console.log('\n1. Testing Environment Variables:');
  const envCheck = checkEnvironmentVariables();
  console.log('Environment check result:', envCheck);
  
  // 2. Test widget service API URLs
  console.log('\n2. Testing Widget Service URLs:');
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
  
  // 3. Test widget service methods exist
  console.log('\n3. Testing Widget Services:');
  const services = [
    'lastOrders',
    'recentTransactions', 
    'todaysDeliveries',
    'assetsMaintenance',
    'overdueRentals',
    'fleetUtilization'
  ];
  
  services.forEach(service => {
    console.log(`- ${service}: ${widgetServices[service] ? '✓ Available' : '✗ Missing'}`);
  });
  
  // 4. Test error handler
  console.log('\n4. Testing Error Handler:');
  const testError = { 
    response: { 
      data: { message: 'Test error message' },
      status: 400 
    } 
  };
  const errorMessage = widgetServices.handleError(testError);
  console.log('Error handler result:', errorMessage);
  
  console.log('\n=== All Tests Complete ===');
};

// Run tests in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window !== 'undefined') {
    window.testDashboardFixes = testDashboardFixes;
    console.log('Dashboard fixes test available. Run window.testDashboardFixes() in console.');
  }
}