import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ParliamentariumBoard from './components/ParliamentariumBoard';
import MeetingRoom from './components/MeetingRoom';
import LoginPage from './components/LoginPage';
import DevDashboard from './components/DevDashboard';
import SubscriptionPage from './components/SubscriptionPage';
import { Toaster } from './hooks/use-toast';
import axios from 'axios';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Navigation component for authenticated users
  const Navigation = () => (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
      {user && (
        <>
          <div className="text-white text-sm bg-gray-800/80 px-3 py-2 rounded-lg backdrop-blur-sm">
            <span className="text-gray-300">Welcome,</span>{' '}
            <span className="font-semibold">{user.email}</span>
            {user.is_dev && (
              <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">DEV</span>
            )}
            {user.subscription_tier !== 'free' && (
              <span className="ml-2 text-xs bg-gold-600 px-2 py-1 rounded uppercase">
                {user.subscription_tier}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {user.is_dev && (
              <button
                onClick={() => window.location.href = '/dev-dashboard'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                🛠️ Dev Dashboard
              </button>
            )}
            <button
              onClick={() => window.location.href = '/subscription'}
              className="bg-gold-600 hover:bg-gold-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              💎 Upgrade
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading Parliamentarium...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          } />
          
          {/* Protected Routes */}
          <Route path="/" element={
            user ? <ParliamentariumBoard user={user} /> : <Navigate to="/login" replace />
          } />
          
          <Route path="/meeting" element={
            user ? <MeetingRoom user={user} /> : <Navigate to="/login" replace />
          } />
          
          <Route path="/subscription" element={
            user ? <SubscriptionPage user={user} /> : <Navigate to="/login" replace />
          } />
          
          {/* Dev-only Routes */}
          <Route path="/dev-dashboard" element={
            user && user.is_dev ? (
              <DevDashboard user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          {/* Public routes accessible without login */}
          <Route path="/public" element={<ParliamentariumBoard />} />
          
          {/* Subscription success/cancel pages */}
          <Route path="/subscription/success" element={
            <SubscriptionSuccess />
          } />
          
          <Route path="/subscription/cancel" element={
            <SubscriptionCancel />
          } />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

// Subscription success component
const SubscriptionSuccess = () => {
  const [status, setStatus] = useState('checking');
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/checkout/status/${sessionId}`);
        setSessionData(response.data);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
          // Refresh user data
          const userRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          localStorage.setItem('user', JSON.stringify(userRes.data.user));
        } else {
          setStatus('pending');
          // Continue polling
          setTimeout(checkPaymentStatus, 2000);
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
            <p className="text-gray-300">Please wait while we confirm your subscription.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Subscription Activated!</h2>
            <p className="text-gray-300 mb-6">Welcome to your enhanced Parliamentarium experience!</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Enter Parliament
            </button>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <div className="animate-pulse text-4xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Payment Pending</h2>
            <p className="text-gray-300">Your payment is being processed...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Payment Error</h2>
            <p className="text-gray-300 mb-6">There was an issue processing your payment.</p>
            <button
              onClick={() => window.location.href = '/subscription'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Subscription cancel component
const SubscriptionCancel = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="text-4xl mb-4">🤔</div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">Subscription Cancelled</h2>
      <p className="text-gray-300 mb-6">No worries! You can upgrade anytime to unlock advanced features.</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => window.location.href = '/subscription'}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
        >
          View Plans
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg"
        >
          Continue Free
        </button>
      </div>
    </div>
  </div>
);

export default App;