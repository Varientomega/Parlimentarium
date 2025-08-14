import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function DevDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [apiPerformance, setApiPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch all dashboard data
      const [metricsRes, healthRes, analyticsRes, performanceRes] = await Promise.all([
        axios.get(`${API}/api/dev/dashboard/metrics`, config),
        axios.get(`${API}/api/dev/dashboard/system-health`, config),
        axios.get(`${API}/api/dev/dashboard/user-analytics`, config),
        axios.get(`${API}/api/dev/dashboard/api-performance`, config)
      ]);

      setMetrics(metricsRes.data);
      setSystemHealth(healthRes.data);
      setUserAnalytics(analyticsRes.data);
      setApiPerformance(performanceRes.data);
      setError('');
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading Dev Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-red-400 font-bold mb-2">Dashboard Access Error</h3>
            <p className="text-gray-300">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            🛠️ Developer Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Advanced monitoring and analytics for Parliamentarium</p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live Data • Auto-refresh 30s</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          {[
            { id: 'overview', label: '📊 Overview', icon: '📊' },
            { id: 'system', label: '⚡ System Health', icon: '⚡' },
            { id: 'users', label: '👥 User Analytics', icon: '👥' },
            { id: 'api', label: '🔧 API Performance', icon: '🔧' }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={activeTab === tab.id ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-800/50 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-white">{metrics.total_users}</p>
                  </div>
                  <div className="text-blue-400 text-2xl">👥</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-white">{metrics.active_subscriptions}</p>
                  </div>
                  <div className="text-green-400 text-2xl">💎</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm font-medium">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">${metrics.revenue_monthly}</p>
                  </div>
                  <div className="text-yellow-400 text-2xl">💰</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm font-medium">API Requests Today</p>
                    <p className="text-2xl font-bold text-white">{metrics.api_requests_today}</p>
                  </div>
                  <div className="text-purple-400 text-2xl">🔧</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.cpu?.status)}`}></div>
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{systemHealth.cpu?.usage_percent}%</div>
                <div className="text-sm text-gray-400">
                  {systemHealth.cpu?.cores} cores available
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(systemHealth.cpu?.status)}`}
                    style={{ width: `${systemHealth.cpu?.usage_percent}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.memory?.status)}`}></div>
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{systemHealth.memory?.usage_percent}%</div>
                <div className="text-sm text-gray-400">
                  {systemHealth.memory?.available_gb}GB of {systemHealth.memory?.total_gb}GB available
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(systemHealth.memory?.status)}`}
                    style={{ width: `${systemHealth.memory?.usage_percent}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(systemHealth.disk?.status)}`}></div>
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{systemHealth.disk?.usage_percent}%</div>
                <div className="text-sm text-gray-400">
                  {systemHealth.disk?.free_gb}GB of {systemHealth.disk?.total_gb}GB free
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(systemHealth.disk?.status)}`}
                    style={{ width: `${systemHealth.disk?.usage_percent}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* System Anomalies */}
            {systemHealth.anomalies && systemHealth.anomalies.length > 0 && (
              <Card className="md:col-span-2 lg:col-span-3 bg-red-900/20 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400">🚨 System Anomalies Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  {systemHealth.anomalies.map((anomaly, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${anomaly.severity === 'critical' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                          {anomaly.severity}
                        </Badge>
                        <span className="font-semibold text-white">{anomaly.type}</span>
                      </div>
                      <p className="text-gray-300 mb-2">{anomaly.message}</p>
                      <p className="text-blue-300 text-sm">💡 {anomaly.suggested_action}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && userAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle>👥 User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Users:</span>
                    <span className="font-bold">{userAnalytics.user_stats?.total_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Today:</span>
                    <span className="font-bold text-green-400">{userAnalytics.user_stats?.active_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">New This Week:</span>
                    <span className="font-bold text-blue-400">{userAnalytics.user_stats?.new_users_this_week}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle>💎 Subscription Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userAnalytics.user_stats?.subscription_breakdown && Object.entries(userAnalytics.user_stats.subscription_breakdown).map(([tier, count]) => (
                    <div key={tier} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{tier}:</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600 md:col-span-2">
              <CardHeader>
                <CardTitle>📊 Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Recurring Revenue</p>
                    <p className="text-2xl font-bold text-green-400">${userAnalytics.revenue?.monthly_recurring_revenue}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Average Revenue Per User</p>
                    <p className="text-2xl font-bold text-blue-400">${userAnalytics.revenue?.average_revenue_per_user?.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Performance Tab */}
        {activeTab === 'api' && apiPerformance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle>🔧 API Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Requests Today:</span>
                    <span className="font-bold">{apiPerformance.requests_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Response Time:</span>
                    <span className="font-bold text-yellow-400">{apiPerformance.average_response_time}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error Rate:</span>
                    <span className={`font-bold ${apiPerformance.error_rate > 0.05 ? 'text-red-400' : 'text-green-400'}`}>
                      {(apiPerformance.error_rate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle>📈 Top Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {apiPerformance.top_endpoints?.map((endpoint, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300 truncate">{endpoint.endpoint}</span>
                        <span className="text-gray-400">{endpoint.requests}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg: {endpoint.avg_time}ms
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}