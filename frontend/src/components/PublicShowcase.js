import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Trophy, Brain, Lightbulb, Target, Users, Eye, ThumbsUp, 
  Share2, Crown, Star, Zap, TrendingUp, Award, Sparkles
} from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PublicShowcase = () => {
  const [featuredDecisions, setFeaturedDecisions] = useState([]);
  const [todaysHighlight, setTodaysHighlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowcaseContent();
  }, []);

  const fetchShowcaseContent = async () => {
    try {
      // Mock data for now - replace with real API calls
      const mockFeaturedDecisions = [
        {
          id: 1,
          user_name: "Sarah Chen",
          user_title: "VP Engineering at TechCorp", 
          decision_topic: "Should we rebuild our legacy system or patch it?",
          insight_summary: "Used multi-perspective analysis to balance technical debt vs business continuity. The breakthrough was considering user impact alongside development velocity.",
          solution_preview: "Hybrid approach: incremental rebuilding while maintaining service reliability...",
          confidence_score: 0.92,
          creativity_score: 0.85,
          impact_level: "High",
          personas_used: ["mouse", "contextualist", "patternist", "ego"],
          likes: 847,
          shares: 156,
          views: 12500,
          achievement_badges: ["Strategic Thinker", "Innovation Pioneer", "Risk Assessor"],
          timeframe: "2 hours ago",
          industry: "Technology"
        },
        {
          id: 2,
          user_name: "Marcus Rodriguez", 
          user_title: "Startup Founder",
          decision_topic: "Pivot our product strategy or double down on current approach?",
          insight_summary: "Applied systematic decision analysis using historical precedent and future trend projection. Key insight: market timing vs product-market fit tension.",
          solution_preview: "Strategic pivot with phased transition, maintaining core user base while expanding...",
          confidence_score: 0.88,
          creativity_score: 0.91,
          impact_level: "Critical",
          personas_used: ["dolphin", "diviner", "naysayer", "superscholar"],
          likes: 623,
          shares: 89,
          views: 8900,
          achievement_badges: ["Visionary Leader", "Risk Navigator", "Market Strategist"],
          timeframe: "5 hours ago",
          industry: "Startup"
        },
        {
          id: 3,
          user_name: "Dr. Jennifer Park",
          user_title: "Research Director", 
          decision_topic: "Which AI research direction should we prioritize with limited resources?",
          insight_summary: "Leveraged collective intelligence to evaluate research pathways. The game-changer was incorporating ethical considerations alongside technical feasibility.",
          solution_preview: "Focus on interpretable AI with practical applications, establishing ethical framework first...",
          confidence_score: 0.95,
          creativity_score: 0.78,
          impact_level: "High",
          personas_used: ["superscholar", "superego", "contextualist", "patternist"],
          likes: 1205,
          shares: 234,
          views: 18700,
          achievement_badges: ["Research Pioneer", "Ethical Leader", "Systems Thinker"],
          timeframe: "1 day ago",
          industry: "Research"
        }
      ];

      setFeaturedDecisions(mockFeaturedDecisions);
      setTodaysHighlight(mockFeaturedDecisions[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching showcase content:', error);
      setLoading(false);
    }
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'from-blue-500 to-cyan-500',
      'Startup': 'from-green-500 to-emerald-500',
      'Research': 'from-purple-500 to-pink-500',
      'Finance': 'from-yellow-500 to-orange-500',
      'Healthcare': 'from-red-500 to-rose-500'
    };
    return colors[industry] || 'from-gray-500 to-gray-600';
  };

  const getImpactIcon = (level) => {
    switch (level) {
      case 'Critical': return <Zap className="w-4 h-4 text-red-400" />;
      case 'High': return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'Medium': return <Target className="w-4 h-4 text-yellow-400" />;
      default: return <Brain className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark bg-noise flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading decision showcase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl glass-panel">
              <Trophy className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-5xl font-display heading-display">
              Decision Masters Showcase
            </h1>
            <div className="p-3 rounded-2xl glass-panel">
              <Crown className="w-8 h-8 text-neon-blue" />
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto text-balance">
            Discover breakthrough decision-making approaches from innovators, leaders, and visionaries
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-neon-purple" />
              <span>Strategic Thinking</span>
            </div>
            <div className="w-1 h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-neon-blue" />
              <span>Innovation</span>
            </div>
            <div className="w-1 h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-neon-green" />
              <span>Excellence</span>
            </div>
          </div>
        </div>

        {/* Today's Highlight */}
        {todaysHighlight && (
          <Card className="cyber-card border-2 border-yellow-500/30 mb-12 hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <CardTitle className="text-xl gradient-primary bg-clip-text text-transparent">
                    Today's Featured Decision
                  </CardTitle>
                </div>
                <Badge className="cyber-badge bg-yellow-600/20 border-yellow-500/30 text-yellow-300">
                  <Crown className="w-3 h-3 mr-1" />
                  Spotlight
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="glass-panel rounded-lg p-6 border border-yellow-500/20">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {todaysHighlight.user_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{todaysHighlight.user_name}</h3>
                    <p className="text-sm text-muted-foreground">{todaysHighlight.user_title}</p>
                  </div>
                </div>

                {/* Decision Topic */}
                <h4 className="text-xl font-bold mb-3 text-yellow-100">
                  "{todaysHighlight.decision_topic}"
                </h4>

                {/* Insight Summary */}
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-yellow-300 mb-2">💡 Strategic Insight:</h5>
                  <p className="text-sm leading-relaxed">{todaysHighlight.insight_summary}</p>
                </div>

                {/* Solution Preview */}
                <p className="text-sm text-gray-300 mb-4 italic">
                  "{todaysHighlight.solution_preview}"
                </p>

                {/* Metrics & Badges */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-green-400" />
                      <span>{Math.round(todaysHighlight.confidence_score * 100)}% Confidence</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-blue-400" />
                      <span>{Math.round(todaysHighlight.creativity_score * 100)}% Innovation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getImpactIcon(todaysHighlight.impact_level)}
                      <span>{todaysHighlight.impact_level} Impact</span>
                    </div>
                  </div>
                </div>

                {/* Achievement Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {todaysHighlight.achievement_badges.map((badge, index) => (
                    <Badge key={index} className="cyber-badge bg-yellow-600/20 border-yellow-500/30 text-yellow-300">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{todaysHighlight.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Share2 className="w-4 h-4" />
                    <span>{todaysHighlight.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{todaysHighlight.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Decisions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-display heading-display text-center mb-8">
            Recent Decision Breakthroughs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDecisions.slice(1).map((decision, index) => (
              <Card 
                key={decision.id}
                className="cyber-card hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`cyber-badge bg-gradient-to-r ${getIndustryColor(decision.industry)} text-white border-0`}>
                      {decision.industry}
                    </Badge>
                    <span className="text-xs text-gray-500">{decision.timeframe}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {decision.user_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{decision.user_name}</h3>
                      <p className="text-xs text-muted-foreground">{decision.user_title}</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm mb-2 line-clamp-2">
                    "{decision.decision_topic}"
                  </h4>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Insight Preview */}
                  <p className="text-xs text-gray-300 line-clamp-3">
                    {decision.insight_summary}
                  </p>

                  {/* Metrics */}
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span>{Math.round(decision.confidence_score * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-blue-400" />
                      <span>{Math.round(decision.creativity_score * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getImpactIcon(decision.impact_level)}
                      <span>{decision.impact_level}</span>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="flex flex-wrap gap-1">
                    {decision.achievement_badges.slice(0, 2).map((badge, badgeIndex) => (
                      <Badge key={badgeIndex} className="text-xs cyber-badge bg-purple-600/20 border-purple-500/30 text-purple-300">
                        {badge}
                      </Badge>
                    ))}
                    {decision.achievement_badges.length > 2 && (
                      <Badge className="text-xs cyber-badge bg-gray-600/20 border-gray-500/30 text-gray-300">
                        +{decision.achievement_badges.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{decision.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Share2 className="w-3 h-3" />
                      <span>{decision.shares}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye className="w-3 h-3" />
                      <span>{decision.views}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="cyber-card border-2 border-purple-500/30 max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl glass-panel">
                  <Sparkles className="w-8 h-8 text-neon-purple" />
                </div>
              </div>
              
              <h3 className="text-2xl font-display heading-display mb-4">
                Ready to Showcase Your Strategic Brilliance?
              </h3>
              
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Join the elite decision makers using collective intelligence to solve complex challenges. 
                Your next breakthrough could be featured here.
              </p>
              
              <Button 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-cyber hover-lift"
                onClick={() => window.location.href = '/'}
              >
                <Brain className="w-5 h-5 mr-2" />
                Start Your Decision Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicShowcase;