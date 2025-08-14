import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlansAndUser();
    fetchReferralStats();
  }, []);

  const fetchPlansAndUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const [plansRes, userRes] = await Promise.all([
        axios.get(`${API}/api/subscriptions/plans`),
        token ? axios.get(`${API}/api/auth/me`, config) : Promise.resolve(null)
      ]);

      setPlans(plansRes.data.plans);
      if (userRes) {
        setCurrentUser(userRes.data.user);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API}/api/referrals/my-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralStats(response.data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const handleSubscribe = async (tier) => {
    if (!currentUser) {
      alert('Please login first to subscribe');
      navigate('/login');
      return;
    }

    setProcessingPlan(tier);
    try {
      const response = await axios.post(`${API}/api/subscriptions/checkout`, {
        tier: tier,
        origin_url: window.location.origin
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Redirect to Stripe checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleUseReferralCode = async () => {
    if (!referralCode.trim()) return;

    try {
      await axios.post(`${API}/api/referrals/use-code/${referralCode}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Referral code applied successfully! 🎉');
      setReferralCode('');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to apply referral code');
    }
  };

  const getPlanIcon = (tier) => {
    switch (tier) {
      case 'gold': return '🥇';
      case 'vip': return '💎';
      case 'enterprise': return '🏢';
      default: return '⭐';
    }
  };

  const isCurrentPlan = (tier) => {
    return currentUser?.subscription_tier === tier;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent mb-4">
            🚀 Upgrade Your Parliament
          </h1>
          <p className="text-gray-300 text-lg">
            Unlock advanced features and join the AI collaboration revolution
          </p>
          {currentUser && (
            <div className="mt-4">
              <Badge className="bg-purple-600 text-white">
                Current Plan: {currentUser.subscription_tier.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {/* Referral Section */}
        {currentUser && (
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-center">🎁 Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-blue-300 mb-2">Your Referral Code</h3>
                    <div className="flex gap-2">
                      <Input
                        value={referralStats?.referral_code || ''}
                        readOnly
                        className="bg-gray-700 border-gray-600"
                      />
                      <Button
                        onClick={() => navigator.clipboard.writeText(referralStats?.referral_code || '')}
                        variant="outline"
                        className="border-blue-500 text-blue-300"
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Tokens earned: <span className="text-green-400 font-bold">{referralStats?.tokens_earned || 0}</span>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-300 mb-2">Use Referral Code</h3>
                    <div className="flex gap-2">
                      <Input
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder="Enter referral code"
                        className="bg-gray-700 border-gray-600"
                      />
                      <Button
                        onClick={handleUseReferralCode}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Get bonus tokens when referred users subscribe!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative bg-gray-800/50 border-2 transition-all duration-300 hover:scale-105 ${
                plan.tier === 'vip' 
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                  : 'border-gray-600 hover:border-purple-500/30'
              }`}
            >
              {plan.tier === 'vip' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{getPlanIcon(plan.tier)}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-purple-400">
                  ${plan.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleSubscribe(plan.tier)}
                  disabled={processingPlan === plan.tier || isCurrentPlan(plan.tier)}
                  className={`w-full ${
                    isCurrentPlan(plan.tier)
                      ? 'bg-green-600 cursor-not-allowed'
                      : plan.tier === 'vip'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                  }`}
                >
                  {processingPlan === plan.tier
                    ? 'Processing...'
                    : isCurrentPlan(plan.tier)
                      ? '✅ Current Plan'
                      : `Upgrade to ${plan.name}`
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <Card className="bg-gray-800/30 border-gray-600">
            <CardHeader>
              <CardTitle className="text-center text-2xl">🎯 Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4">Free</th>
                      <th className="text-center py-3 px-4">🥇 Gold</th>
                      <th className="text-center py-3 px-4">💎 VIP</th>
                      <th className="text-center py-3 px-4">🏢 Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Parliamentary Sessions</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Custom Personas</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Marketplace Access</td>
                      <td className="text-center py-3 px-4">👁️</td>
                      <td className="text-center py-3 px-4">🛒</td>
                      <td className="text-center py-3 px-4">🛒</td>
                      <td className="text-center py-3 px-4">🛒</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">API Access</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅ Unlimited</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-3 px-4">Session History</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Dev Dashboard</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">❌</td>
                      <td className="text-center py-3 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Parliament */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-purple-500 text-purple-300 hover:bg-purple-800"
          >
            ← Back to Parliament
          </Button>
        </div>
      </div>
    </div>
  );
}