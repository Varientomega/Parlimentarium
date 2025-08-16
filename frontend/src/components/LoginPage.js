import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Mail, Lock, Crown, Sparkles, Eye, EyeOff, 
  Zap, Globe, Users, ArrowRight, Shield 
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}/api${endpoint}`, {
        email,
        password
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        onLogin(response.data.user);
        navigate('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Crown className="w-5 h-5" />,
      title: 'AI Parliament',
      description: '11 unique AI personas deliberate on your topics',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Real-time Processing',
      description: 'Live streaming AI conversations and decisions',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Marketplace',
      description: 'Create and trade custom AI personas & workflows',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Collaborative Creation',
      description: 'Build documents and projects together with AI',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="space-y-8 animate-fade-in">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl glass-panel">
                  <Crown className="w-8 h-8 text-neon-purple" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-display heading-display">
                  Parliamentarium
                </h1>
                <div className="p-3 rounded-2xl glass-panel">
                  <Sparkles className="w-8 h-8 text-neon-blue" />
                </div>
              </div>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Experience the future of AI collaboration. Convene mystical AI councils, 
                create together, and explore the marketplace of intelligence.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="cyber-card p-4 hover-lift animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-neon flex-shrink-0`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">11</div>
                <div className="text-xs text-gray-400">AI Personas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-blue">∞</div>
                <div className="text-xs text-gray-400">Possibilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">24/7</div>
                <div className="text-xs text-gray-400">Available</div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="animate-slide-up">
            <Card className="cyber-card border-2 border-purple-500/20 shadow-cyber max-w-md mx-auto">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-display gradient-primary bg-clip-text text-transparent">
                  {isLogin ? 'Welcome Back' : 'Join the Parliament'}
                </CardTitle>
                <p className="text-muted-foreground">
                  {isLogin 
                    ? 'Enter your credentials to access the AI council' 
                    : 'Create your account to begin your AI journey'
                  }
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="cyber-input h-12"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="cyber-input h-12 pr-10"
                        required
                        minLength="6"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-cyber hover-lift"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isLogin ? <Shield className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>

                  {/* Mode Toggle */}
                  <div className="text-center pt-4 border-t border-gray-700/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                      }}
                      className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      {isLogin ? 'Create new account' : 'Sign in instead'}
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-xs text-gray-400">
                By joining, you agree to our terms and privacy policy
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>🔒 Secure Authentication</span>
                <span>•</span>
                <span>🌟 Free Tier Available</span>
                <span>•</span>
                <span>⚡ Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}