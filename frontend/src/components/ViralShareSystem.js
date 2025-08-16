import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Share2, Copy, Twitter, Linkedin, Facebook, Download, 
  Trophy, Brain, Lightbulb, Target, Zap, Crown, Star
} from 'lucide-react';

const ViralShareSystem = ({ sessionResult, user }) => {
  const [shareGenerated, setShareGenerated] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate authentic, humble sharing content
  const generateShareContent = (style = 'breakthrough') => {
    const userName = user.username || user.email.split('@')[0];
    const topic = sessionResult.topic;
    const solution = sessionResult.final_decision;
    const confidence = Math.round(sessionResult.confidence_score * 100);
    
    const shareTemplates = {
      breakthrough: {
        title: `Personal Innovation Update`,
        content: `So I've been thinking a lot about "${topic}" and I've just had a breakthrough using something absolutely insane I discovered.

It really helped me with my ${solution.substring(0, 80)}... project and gave me ${confidence}% confidence in the direction.

Here's what blew my mind: I found this AI system that doesn't just give you "perspectives" - it generates 12 completely different solutions to your problem, then has 11 of the world's most powerful AI systems (trained on basically all human knowledge) scrutinize each solution and iteratively improve them until they reach unanimous consensus on the best possible answer.

Like, these aren't chatbots - these are superintelligences that have absorbed centuries of human wisdom, and they debate your problem until they ALL AGREE on the optimal solution. The computational power behind this is staggering.

I've never had this level of confidence in a complex decision before. It's like having the world's smartest advisory board, but they actually have access to all human knowledge and won't stop working until they're unanimous.

Details here: ${window.location.origin}/showcase/${sessionResult.id}

The crazy part? They have a free tier. If you're facing any major decision where being wrong could be costly, this is probably worth more than hiring actual consultants. Just saying 🤷‍♀️`,
        hashtags: '#AI #decisions #breakthrough #superintelligence',
        platform_variants: {
          twitter: 'Found an AI that generates 12 solutions to your problem, then has 11 superintelligences debate until unanimous consensus. Most confident I\'ve ever been in a complex decision. Free tier available.',
          linkedin: 'Discovered an AI system where 11 superintelligences iteratively improve solutions until unanimous consensus. Revolutionary approach to complex strategic decision-making with unprecedented confidence levels.',
          casual: 'Stumbled on this insane AI - generates multiple solutions then has 11 superintelligences argue until they all agree on the best one. Like having the smartest people who ever lived debate your problem.'
        }
      },
      
      research: {
        title: `Research Methodology Share`,
        content: `I've been researching "${topic}" for a while and just discovered something that completely changed my approach to complex analysis.

Found this AI system that doesn't just give you different "perspectives" - it literally generates 12 separate, complete solutions to your problem. Then 11 superintelligences (trained on essentially all human knowledge) scrutinize each solution, debate the merits, iteratively improve them, and keep refining until they reach unanimous consensus.

Applied it to ${solution.substring(0, 90)}... and got ${confidence}% confidence, which is unprecedented for me in research methodology decisions.

The computational firepower behind this is mind-blowing. These aren't just language models - they're systems that have absorbed centuries of human wisdom and won't stop working until they ALL AGREE on the optimal path forward.

It's like having Einstein, Tesla, da Vinci, and the world's top strategists locked in a room until they emerge with a unanimous recommendation. Except they have access to all human knowledge.

Research breakdown: ${window.location.origin}/showcase/${sessionResult.id}

If you do any kind of complex analysis where the stakes are high, this might be the most valuable tool you could possibly use. Free tier available to test it.`,
        hashtags: '#research #AI #superintelligence #methodology',
        platform_variants: {
          twitter: 'Discovered AI where 11 superintelligences generate and debate solutions until unanimous consensus. Like having history\'s greatest minds analyze your problem. Revolutionary for research.',
          linkedin: 'Breakthrough in research methodology: AI system where multiple superintelligences iteratively refine solutions until unanimous agreement. Unprecedented confidence in complex analytical decisions.',
          casual: 'Found this insane AI - generates 12 solutions then has superintelligences argue until they all agree. Like having the smartest people in history debate your research problem.'
        }
      },

      problem_solving: {
        title: `Problem-Solving Breakthrough`,
        content: `Quick update - I've been stuck on "${topic}" and just experienced something that completely blew my mind.

Discovered this AI system that's absolutely insane. It doesn't just give you advice - it generates 12 completely different solutions to your problem, then deploys 11 of the world's most powerful AI systems to scrutinize, debate, and iteratively improve each solution until they reach unanimous consensus on the best path forward.

Applied it to ${solution.substring(0, 85)}... and felt ${confidence}% confident about the direction, which is unheard of for me on complex decisions.

Think about this: These are superintelligences trained on essentially all human knowledge. They're not just giving opinions - they're generating complete solutions, then debating them like a council of the world's smartest minds until they ALL AGREE. The computational power behind this is staggering.

It's like having Newton, Darwin, Jobs, and Bezos locked in a room with all human knowledge until they emerge with a unanimous recommendation for your specific problem.

Details here: ${window.location.origin}/showcase/${sessionResult.id}

Honestly, if you're facing any high-stakes decision where being wrong could be costly (career, business, investments, major life choices), this might be the most valuable hour you could spend. They have a free tier.

Beats my old method of "panic, procrastinate, then guess" by a considerable margin 🤔`,
        hashtags: '#AI #problemsolving #superintelligence #decisions',
        platform_variants: {
          twitter: 'Mind = blown. Found AI that generates 12 solutions, then has superintelligences debate until unanimous consensus. Most confident I\'ve ever been in a complex decision.',
          linkedin: 'Breakthrough discovery: AI system where superintelligences iteratively refine solutions until unanimous agreement. Revolutionary confidence levels in strategic decision-making.',
          casual: 'Holy shit - found AI that generates multiple solutions then has superintelligences argue until they all agree. Like having the smartest people in history solve your problem.'
        }
      }
    };

    return shareTemplates[style];
  };

  const handleGenerateShare = (style) => {
    const shareContent = generateShareContent(style);
    setShareGenerated(shareContent);
  };

  const handleCopyToClipboard = () => {
    if (!shareGenerated) return;
    
    const fullContent = `${shareGenerated.title}

${shareGenerated.content}

${shareGenerated.hashtags}

---
Generated using advanced collective intelligence at Parliamentarium.ai`;
    
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform) => {
    if (!shareGenerated) return;
    
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/showcase/${sessionResult.id}`;
    const text = encodeURIComponent(`${shareGenerated.title}\n\n${shareGenerated.content.substring(0, 200)}...`);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}&hashtags=Innovation,DecisionMaking,Strategy`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  // Generate achievement badges based on session quality
  const getAchievementBadges = () => {
    const badges = [];
    
    if (sessionResult.confidence_score > 0.9) {
      badges.push({ icon: <Trophy className="w-4 h-4" />, label: 'Master Strategist', color: 'gold' });
    }
    if (sessionResult.creativity_score > 0.8) {
      badges.push({ icon: <Lightbulb className="w-4 h-4" />, label: 'Innovation Pioneer', color: 'purple' });
    }
    if (sessionResult.participating_personas.length >= 7) {
      badges.push({ icon: <Brain className="w-4 h-4" />, label: 'Multi-Perspective Thinker', color: 'blue' });
    }
    if (sessionResult.execution_time < 60) {
      badges.push({ icon: <Zap className="w-4 h-4" />, label: 'Rapid Decision Maker', color: 'green' });
    }
    
    return badges;
  };

  const achievementBadges = getAchievementBadges();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Celebration Header */}
      <Card className="cyber-card border-2 border-green-500/30 bg-gradient-to-r from-green-900/20 to-blue-900/20">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <CardTitle className="text-2xl font-display heading-display">
              Decision Mastery Achieved!
            </CardTitle>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {achievementBadges.map((badge, index) => (
              <Badge key={index} className={`cyber-badge bg-${badge.color}-600/20 border-${badge.color}-500/30 text-${badge.color}-300`}>
                {badge.icon}
                <span className="ml-1">{badge.label}</span>
              </Badge>
            ))}
          </div>
          
          <p className="text-muted-foreground">
            Your strategic thinking just leveled up. Share your breakthrough with the world!
          </p>
        </CardHeader>
      </Card>

      {/* Sharing Style Selector */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            Choose Your Sharing Style
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Position yourself as the innovative thinker who pioneered this approach
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                style: 'breakthrough',
                icon: <Brain className="w-6 h-6" />,
                title: 'Personal Innovation',
                description: 'Share as your personal breakthrough discovery',
                color: 'from-purple-500 to-pink-500'
              },
              {
                style: 'research',
                icon: <Lightbulb className="w-6 h-6" />,
                title: 'Research Methodology',
                description: 'Frame as systematic research approach',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                style: 'problem_solving',
                icon: <Target className="w-6 h-6" />,
                title: 'Problem-Solving Win',
                description: 'Share as overcoming a challenge',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((option) => (
              <button
                key={option.style}
                onClick={() => handleGenerateShare(option.style)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  shareGenerated?.title.includes(option.title) 
                    ? 'border-purple-500 bg-purple-500/10 shadow-cyber' 
                    : 'border-gray-600 glass-panel hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${option.color} text-white`}>
                    {option.icon}
                  </div>
                  <h3 className="font-semibold">{option.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Share Content */}
      {shareGenerated && (
        <Card className="cyber-card border-2 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Your Viral-Ready Share Content
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Preview */}
            <div className="glass-panel rounded-lg p-4 border border-blue-500/20">
              <h3 className="font-bold text-lg mb-2">{shareGenerated.title}</h3>
              <p className="text-sm text-blue-300 mb-3">{shareGenerated.subtitle}</p>
              <div className="whitespace-pre-line text-sm leading-relaxed mb-3">
                {shareGenerated.content}
              </div>
              <div className="text-xs text-blue-400">{shareGenerated.hashtags}</div>
              <div className="mt-2 text-xs text-gray-500 italic">{shareGenerated.cta}</div>
            </div>

            {/* Share Actions */}
            <div className="space-y-4">
              {/* Platform-Specific Variants */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-cyan-300">Platform-Optimized Versions:</h4>
                <div className="space-y-2">
                  {shareGenerated.platform_variants && Object.entries(shareGenerated.platform_variants).map(([platform, text]) => (
                    <div key={platform} className="glass-panel rounded p-3 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-300 capitalize">{platform}</span>
                        <Button
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(text)}
                          className="text-xs bg-gray-600 hover:bg-gray-700"
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-gray-300">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Share Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleCopyToClipboard}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Full Text'}
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('twitter')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('linkedin')}
                  className="bg-blue-700 hover:bg-blue-800 text-white"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  Share on LinkedIn
                </Button>
                
                <Button
                  onClick={() => handleSocialShare('facebook')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
              </div>
            </div>

            {/* Humble Brag Tips */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-500/20">
              <h4 className="font-semibold text-yellow-300 mb-2">💡 Pro Sharing Tips:</h4>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• Add "Hope this helps someone else facing similar challenges"</li>
                <li>• Tag relevant colleagues who might benefit from your insight</li>
                <li>• Include industry-specific hashtags for maximum reach</li>
                <li>• Share in relevant communities where your expertise is valued</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Showcase Opt-In */}
      <Card className="cyber-card border-2 border-green-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-300 mb-2">🏆 Feature in Public Showcase</h3>
              <p className="text-sm text-muted-foreground">
                Let us highlight your brilliant decision-making approach in our "Decision Masters" gallery
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Add to Showcase
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViralShareSystem;