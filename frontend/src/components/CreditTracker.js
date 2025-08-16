import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Zap, TrendingUp, AlertTriangle, Crown, 
  DollarSign, BarChart3, Clock, Sparkles
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CreditTracker = ({ user, onUpgradeNeeded }) => {
  const [credits, setCredits] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCreditData();
    }
  }, [user]);

  const fetchCreditData = async () => {
    try {
      const [creditsRes, usageRes] = await Promise.all([
        axios.get(`${API}/api/credits/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API}/api/credits/usage?days=30`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setCredits(creditsRes.data);
      setUsage(usageRes.data);
      
      // Check if upgrade prompt needed
      if (creditsRes.data.remaining_credits <= 5 && creditsRes.data.subscription_tier === 'free') {
        setShowUpgradePrompt(true);
      }
      
    } catch (error) {
      console.error('Error fetching credit data:', error);
      // Mock data for development
      setCredits({
        total_credits: 100,
        used_credits: 73.5,
        remaining_credits: 26.5,
        subscription_tier: 'free',
        billing_cycle_start: new Date().toISOString()
      });
      setUsage({
        total_cost: 73.5,
        total_actions: 147,
        usage_by_type: [
          { _id: 'meeting_creation', total_cost: 45.2, count: 32 },
          { _id: 'persona_response', total_cost: 18.3, count: 89 },
          { _id: 'image_generation', total_cost: 10.0, count: 15 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = () => {
    if (!credits) return 0;
    return (credits.used_credits / credits.total_credits) * 100;
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'gold': return 'from-yellow-500 to-orange-500';
      case 'vip': return 'from-purple-500 to-pink-500';
      case 'enterprise': return 'from-cyan-500 to-blue-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTierName = (tier) => {
    switch (tier) {
      case 'gold': return 'Gold';
      case 'vip': return 'VIP';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  if (loading) {
    return (
      <Card className="cyber-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading credits...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <Card className="cyber-card border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-300">Credits Running Low!</h3>
                <p className="text-sm text-yellow-200">Only {credits?.remaining_credits?.toFixed(1)} credits left</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit Status */}
      <Card className="cyber-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Credit Balance
            </CardTitle>
            <Badge className={`cyber-badge bg-gradient-to-r ${getTierColor(credits?.subscription_tier)} text-white border-0`}>
              {getTierName(credits?.subscription_tier)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {credits?.subscription_tier === 'free' ? (
            <>
              {/* Free Tier Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Credits Used</span>
                  <span>{credits?.used_credits?.toFixed(1)} / {credits?.total_credits}</span>
                </div>
                <Progress 
                  value={getUsagePercentage()} 
                  className="w-full bg-gray-700"
                />
                <div className="text-xs text-gray-400 text-center">
                  {credits?.remaining_credits?.toFixed(1)} credits remaining this month
                </div>
              </div>

              {/* Usage Warning */}
              {getUsagePercentage() > 80 && (
                <div className="glass-panel rounded-lg p-3 border border-yellow-500/20 bg-yellow-900/10">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold text-sm">High Usage Alert</span>
                  </div>
                  <p className="text-xs text-yellow-200">
                    You've used {getUsagePercentage().toFixed(0)}% of your monthly credits. 
                    Consider upgrading to Gold for unlimited usage.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Paid Tier Status */
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full border border-green-500/30">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-semibold">Unlimited Credits</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                No usage limits • Premium features unlocked
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            {credits?.subscription_tier === 'free' && (
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 glass-button border-gray-600 text-gray-300 hover:border-purple-500"
              onClick={() => setShowUsageDetails(!showUsageDetails)}
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Usage Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      {usage && (
        <Card className="cyber-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Usage Analytics
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{usage.total_actions}</div>
                <div className="text-xs text-gray-400">Total Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">${usage.total_cost?.toFixed(2)}</div>
                <div className="text-xs text-gray-400">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{usage.average_cost_per_action?.toFixed(3)}</div>
                <div className="text-xs text-gray-400">Avg per Action</div>
              </div>
            </div>

            {/* Usage by Type */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-300">Usage by Feature:</h4>
              {usage.usage_by_type?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 glass-panel rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                      item._id.includes('meeting') ? 'from-purple-400 to-pink-400' :
                      item._id.includes('image') ? 'from-green-400 to-emerald-400' :
                      'from-blue-400 to-cyan-400'
                    }`}></div>
                    <span className="text-sm capitalize">{item._id.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">${item.total_cost?.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">{item.count} uses</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings Calculation for Free Users */}
            {credits?.subscription_tier === 'free' && usage.total_cost > 25 && (
              <div className="glass-panel rounded-lg p-3 border border-green-500/20 bg-green-900/10">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold text-sm">Savings Opportunity</span>
                </div>
                <p className="text-xs text-green-200">
                  You've spent ${usage.total_cost?.toFixed(2)} this month. 
                  Gold subscription ($50/month) would save you money and give unlimited usage!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditTracker;