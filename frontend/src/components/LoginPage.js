import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email: email.trim()
      });

      const { access_token, user, message } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Call parent login handler
      if (onLogin) {
        onLogin(user);
      }

      // Show dev access message if applicable
      if (user.is_dev && message.includes('Dev access')) {
        alert('🎉 Congratulations! You have been granted Developer Access! You can now access the advanced dev dashboard.');
      }

      // Navigate to main app
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/80 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
            🏛️ Parliamentarium
          </CardTitle>
          <p className="text-gray-300 mt-2">
            Enter the world's most advanced AI Parliament
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-gold-600 hover:from-purple-700 hover:to-gold-700"
            >
              {isLoading ? 'Signing In...' : 'Enter Parliament'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-400">
              <p className="mb-2">🎁 <strong>Special Launch Offer</strong></p>
              <p>First 5 users get automatic <span className="text-purple-400 font-semibold">Developer Access</span></p>
              <p>Access the world's most advanced AI dev dashboard!</p>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>✨ Free: Basic parliamentary sessions</p>
              <p>🥇 Gold ($50/mo): Marketplace + Custom personas</p>
              <p>💎 VIP ($100/mo): API access + Emergent services</p>
              <p>🏢 Enterprise ($200/mo): Full dev dashboard access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}