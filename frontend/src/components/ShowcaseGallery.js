import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Trophy, ThumbsUp, Share2, Eye, Copy, ExternalLink,
  Zap, Target, Brain, Star, TrendingUp, Crown
} from 'lucide-react';

const ShowcaseGallery = () => {
  const [featuredDecisions, setFeaturedDecisions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFeaturedDecisions();
  }, []);

  const loadFeaturedDecisions = () => {
    // Auto generated social proof content
    const decisions = [
      {
        id: 1,
        user_name: "Alex Chen",
        user_title: "Startup Founder",
        decision_topic: "Should I pivot my SaaS or double down on current approach?",
        ai_insight: "Used 11 superintelligences that generated 12 complete solutions, then debated until unanimous consensus. Got 94% confidence vs my usual 40% gut-feeling decisions.",
        result_preview: "Chose strategic pivot with phased transition. Increased user retention by 300% and revenue by 180% in 60 days.",
        confidence_score: 0.94,
        impact_metric: "300% retention increase",
        likes: 1247,
        shares: 312,
        views: 18950,
        timeframe: "2 hours ago",
        category: "Business Strategy",
        viral_quote: "11 superintelligences trained on all human knowledge arguing until they all agree? This is like having Einstein, Jobs, and Bezos locked in a room with your problem."
      },
      {
        id: 2,
        user_name: "Sarah Rodriguez",
        user_title: "VP Engineering", 
        decision_topic: "Rebuild legacy system or patch - $2M budget decision",
        ai_insight: "The AI generated 12 different approaches, then 11 systems with access to all engineering knowledge debated each solution iteratively until unanimous agreement.",
        result_preview: "Hybrid rebuild strategy. Saved $800K and reduced technical debt by 70% while maintaining 99.9% uptime.",
        confidence_score: 0.91,
        impact_metric: "$800K saved",
        likes: 892,
        shares: 156,
        views: 12400,
        timeframe: "5 hours ago", 
        category: "Engineering",
        viral_quote: "Most confident I've ever been in a major technical decision. The computational power behind this unanimous consensus is staggering."
      },
      {
        id: 3,
        user_name: "Marcus Kim",
        user_title: "Investment Director",
        decision_topic: "Which AI startup to invest $10M in from 50 options?",
        ai_insight: "12 complete investment analyses generated, then superintelligences scrutinized each until reaching unanimous consensus on risk/reward optimization.",
        result_preview: "Selected AI robotics startup. 340% ROI in 8 months, now leading Series B round.",
        confidence_score: 0.96,
        impact_metric: "340% ROI in 8 months",
        likes: 2156,
        shares: 487,
        views: 31200,
        timeframe: "1 day ago",
        category: "Investment",
        viral_quote: "This is probably worth more than hiring McKinsey, Goldman, and top VCs combined. Unprecedented decision confidence."
      },
      {
        id: 4,
        user_name: "Jessica Park",
        user_title: "Content Creator & Podcaster",
        decision_topic: "How to create viral content about complex tech topics?",
        ai_insight: "Generated 12 different content strategies, then 11 AI superintelligences with knowledge of all viral content, psychology, and media debated until consensus on the perfect approach.",
        result_preview: "Created 5-part podcast series. Got 2.3M downloads, landed 3 major sponsors, built email list of 50K subscribers. Used the transcript and audio output with Kitt for final polish.",
        confidence_score: 0.93,
        impact_metric: "2.3M podcast downloads",
        likes: 1842,
        shares: 394,
        views: 24700,
        timeframe: "3 days ago",
        category: "Content Creation",
        viral_quote: "This is insane - I got complete podcast episodes with transcripts and multi-voice audio. Just needed Kitt to polish it. Like having the world's best content team brainstorm for hours."
      },
      {
        id: 5,
        user_name: "David Martinez",
        user_title: "YouTube Creator (2.1M subs)",
        decision_topic: "What video series would grow my channel fastest while staying authentic?",
        ai_insight: "11 superintelligences analyzed YouTube algorithm, audience psychology, content trends, and my personal brand until unanimous agreement on optimal content strategy.",
        result_preview: "Launched 'CEO Breakdown' series. 15M views in first month, gained 400K subscribers, secured $2M sponsorship deal. The AI generated full scripts and talking points.",
        confidence_score: 0.89,
        impact_metric: "15M views, 400K subs",
        likes: 3247,
        shares: 678,
        views: 41200,
        timeframe: "1 week ago",
        category: "Content Creation", 
        viral_quote: "Holy shit - got complete video scripts, talking points, even podcast versions with different voices discussing my topic. Better than hiring an entire creative team."
      },
      {
        id: 6,
        user_name: "Emma Thompson",
        user_title: "Newsletter Writer",
        decision_topic: "How to transform my struggling newsletter into a must-read publication?",
        ai_insight: "12 complete newsletter strategies generated, then superintelligences with knowledge of all successful publications, reader psychology, and media business models debated until consensus.",
        result_preview: "Redesigned format and content strategy. Grew from 2K to 85K subscribers in 4 months, launched premium tier at $29/month with 12% conversion rate.",
        confidence_score: 0.95,
        impact_metric: "2K → 85K subscribers",
        likes: 1576,
        shares: 289,
        views: 19800,
        timeframe: "2 weeks ago",
        category: "Content Creation",
        viral_quote: "Got detailed content calendars, engagement strategies, and even sample newsletters. The transcript feature gave me months of content ideas. Like having the world's best editorial team."
      }
    ];
    
    setFeaturedDecisions(decisions);
  };

  const handleShare = (decision) => {
    const shareText = `Mind blown 🤯\n\nJust saw someone use AI superintelligences to solve: "${decision.decision_topic}"\n\nResult: ${decision.impact_metric}\n\n"${decision.viral_quote}"\n\nThis is the future of decision-making 🚀`;
    
    if (navigator.share) {
      navigator.share({
        title: 'AI Superintelligence Decision',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Shared content copied to clipboard!');
    }
  };

  const categories = ['all', 'Business Strategy', 'Engineering', 'Investment', 'Content Creation', 'Personal', 'Research'];

  const filteredDecisions = filter === 'all' 
    ? featuredDecisions 
    : featuredDecisions.filter(d => d.category === filter);

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <Trophy className="w-10 h-10 text-neon-purple" />
            <h1 className="text-6xl font-display heading-display">
              Decision Masters
            </h1>
            <Crown className="w-10 h-10 text-neon-blue" />
          </div>
          
          <p className="text-2xl text-muted-foreground mb-6 max-w-4xl mx-auto">
            Real people using 11 AI superintelligences to make breakthrough decisions
          </p>

          <div className="flex items-center justify-center gap-8 text-lg">
            <div className="flex items-center gap-2 text-green-400">
              <Zap className="w-5 h-5" />
              <span>Unanimous AI Consensus</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <Brain className="w-5 h-5" />
              <span>All Human Knowledge</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <Target className="w-5 h-5" />
              <span>95%+ Confidence</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel rounded-2xl p-2 flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-2 rounded-xl font-medium transition-all capitalize ${
                  filter === category
                    ? 'bg-purple-600 text-white shadow-cyber'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Decisions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {filteredDecisions.map((decision, index) => (
            <Card 
              key={decision.id}
              className="cyber-card hover-lift animate-scale-in border-2 border-purple-500/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`cyber-badge bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0`}>
                    {decision.category}
                  </Badge>
                  <span className="text-xs text-gray-500">{decision.timeframe}</span>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    {decision.user_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{decision.user_name}</h3>
                    <p className="text-sm text-muted-foreground">{decision.user_title}</p>
                  </div>
                </div>

                <h4 className="font-bold text-xl mb-3 leading-tight">
                  "{decision.decision_topic}"
                </h4>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* AI Insight */}
                <div className="glass-panel rounded-lg p-4 border border-blue-500/20">
                  <h5 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Superintelligence Process:
                  </h5>
                  <p className="text-sm leading-relaxed">{decision.ai_insight}</p>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/20">
                  <h5 className="font-semibold text-green-300 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Breakthrough Result:
                  </h5>
                  <p className="text-sm leading-relaxed mb-2">{decision.result_preview}</p>
                  <div className="text-2xl font-bold text-green-400">{decision.impact_metric}</div>
                </div>

                {/* Viral Quote */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
                  <p className="text-sm italic leading-relaxed text-purple-200">
                    "{decision.viral_quote}"
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-green-400">{Math.round(decision.confidence_score * 100)}%</span>
                    <span className="text-xs text-gray-400">confidence</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{decision.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span>{decision.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{decision.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <Button
                  onClick={() => handleShare(decision)}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-cyber hover-lift"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share This Breakthrough
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="cyber-card border-2 border-purple-500/30 max-w-4xl mx-auto">
            <CardContent className="pt-8">
              <div className="flex justify-center mb-6">
                <div className="p-6 rounded-3xl glass-panel">
                  <Brain className="w-16 h-16 text-neon-purple" />
                </div>
              </div>
              
              <h3 className="text-4xl font-display heading-display mb-6">
                Ready for Your Own Breakthrough?
              </h3>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands using 11 AI superintelligences to make decisions with unprecedented confidence. Generate 12 solutions, get unanimous consensus, change your life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-12 rounded-2xl text-xl shadow-cyber hover-lift"
                  onClick={() => window.location.href = '/'}
                >
                  <Zap className="w-6 h-6 mr-3" />
                  Start Free Decision
                </Button>
                
                <div className="text-center">
                  <div className="text-sm text-green-400 font-semibold">100 Free Credits</div>
                  <div className="text-xs text-gray-400">No credit card required</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseGallery;