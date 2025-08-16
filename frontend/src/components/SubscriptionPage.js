import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Check, Zap, Users, Globe, Sparkles, 
  ArrowLeft, Star, Rocket, Shield, Infinity,
  Brain, Palette, Volume2, Package
} from 'lucide-react';

export default function SubscriptionPage({ user }) {
  const [isLoading, setIsLoading] = useState({});
  const navigate = useNavigate();

  const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      price: 0,
      period: 'forever',
      description: 'Experience the power of AI collaboration',
      icon: <Users className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-500/20',
      popular: false,
      features: [
        'Access to 11 AI personas',
        'Basic deliberation sessions',
        'Text-only discussions',
        'Community support',
        'Browse marketplace'
      ],
      limitations: [
        'No audio streaming',
        'Cannot create marketplace items',
        'Limited session history',
        'Basic export options'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 50,
      period: 'month',
      description: 'Unlock advanced features and marketplace creation',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      borderColor: 'border-yellow-500/30',
      popular: true,
      features: [
        'Everything in Free',
        'Real-time audio streaming',
        'Podcast generation',
        'Create & sell marketplace items',
        'Custom persona images',
        'Extended session history',
        'Advanced export formats',
        'Priority support'
      ],
      limitations: []
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 100,
      period: 'month',
      description: 'Premium experience with exclusive features',
      icon: <Star className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500/30',
      popular: false,
      features: [
        'Everything in Gold',
        'Custom API integrations',
        'Advanced analytics',
        'Bulk operations',
        'White-label options',
        'Dedicated account manager',
        'Custom training sessions',
        'Beta feature access'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 200,
      period: 'month',
      description: 'Ultimate power for organizations and teams',
      icon: <Rocket className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      borderColor: 'border-cyan-500/30',
      popular: false,
      features: [
        'Everything in VIP',
        'Unlimited team members',
        'Custom deployment options',
        'SLA guarantees',
        'Advanced security features',
        'Custom integrations',
        'Training & onboarding',
        '24/7 premium support'
      ],
      limitations: []
    }
  ];

  const handleSubscribe = async (planId) => {
    setIsLoading(prev => ({ ...prev, [planId]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (planId === 'free') {
        alert('You are already on the free tier!');
      } else {
        alert(`Subscription to ${planId} plan initiated! (Demo mode - no actual payment processed)`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setIsLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const getCurrentPlanName = () => {
    if (!user) return 'Free';
    const tier = user.subscription_tier || 'free';
    return plans.find(p => p.id === tier)?.name || 'Free';
  };

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl glass-panel">
              <Crown className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-5xl font-display heading-display">
              Choose Your Power Level
            </h1>
            <div className="p-3 rounded-2xl glass-panel">
              <Sparkles className="w-8 h-8 text-neon-blue" />
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto text-balance">
            Unlock the full potential of AI collaboration with premium features, 
            marketplace creation, and advanced capabilities.
          </p>

          {user && (
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full border border-green-500/30">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm">
                Current Plan: <span className="font-semibold">{getCurrentPlanName()}</span>
              </span>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { icon: <Brain className="w-5 h-5" />, text: '11 AI Personas', color: 'from-purple-500 to-pink-500' },
            { icon: <Volume2 className="w-5 h-5" />, text: 'Audio Streaming', color: 'from-cyan-500 to-blue-500' },
            { icon: <Palette className="w-5 h-5" />, text: 'Image Generation', color: 'from-green-500 to-emerald-500' },
            { icon: <Package className="w-5 h-5" />, text: 'Marketplace', color: 'from-orange-500 to-red-500' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="text-center p-4 glass-panel rounded-xl hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${feature.color} text-white mb-2`}>
                {feature.icon}
              </div>
              <div className="text-sm font-medium">{feature.text}</div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id}
              className={`cyber-card relative overflow-hidden hover-lift animate-scale-in ${
                plan.popular ? 'border-2 border-yellow-500/50 shadow-cyber' : plan.borderColor ? `border-2 ${plan.borderColor}` : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              )}
              
              <CardHeader className="text-center pb-4">
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${plan.color} text-white shadow-neon mb-4`}>
                  {plan.icon}
                </div>
                
                <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                
                <div className="mb-3">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.period !== 'forever' && (
                      <span className="text-sm text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  {plan.period === 'forever' && (
                    <div className="text-sm text-green-400 font-medium">Forever Free</div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-700/50">
                    <div className="text-xs text-gray-400 font-medium">Limitations:</div>
                    {plan.limitations.map((limitation, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1 h-1 bg-gray-500 rounded-full flex-shrink-0"></div>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading[plan.id] || (user?.subscription_tier === plan.id)}
                  className={`w-full font-semibold py-3 rounded-xl shadow-cyber hover-lift ${
                    plan.popular
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                      : `bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`
                  } ${user?.subscription_tier === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading[plan.id] ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : user?.subscription_tier === plan.id ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Current Plan
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {plan.price === 0 ? <Users className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16 space-y-6">
          <h2 className="text-2xl font-display text-center heading-display mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                question: "Can I change my plan anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "What happens to my marketplace items if I downgrade?",
                answer: "Your existing items remain active, but you won't be able to create new ones on the Free tier."
              },
              {
                question: "Is there a refund policy?",
                answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
              },
              {
                question: "Do you offer enterprise discounts?",
                answer: "Yes! Contact us for volume discounts and custom enterprise solutions."
              }
            ].map((faq, index) => (
              <div key={index} className="cyber-card p-6 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-16">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="glass-button border-purple-500/30 text-purple-300 hover:border-purple-500 px-8 py-3 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Parliament
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 space-y-2">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Infinity className="w-4 h-4" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Available Worldwide</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            All plans include access to our growing library of AI personas and features
          </p>
        </div>
      </div>
    </div>
  );
}