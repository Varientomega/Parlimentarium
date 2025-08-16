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
        content: `So I've been thinking a lot about "${topic}" and I've just had a breakthrough by utilizing an iterative multi-dimensional framework I've been perfecting.

It really helped me with my ${solution.substring(0, 80)}... project and the approach gave me ${confidence}% confidence in the direction.

The key insight was getting perspectives from multiple angles - historical, creative, analytical, and practical viewpoints simultaneously before making the final call.

I would really appreciate some feedback about this approach. You can find the full breakdown on my personal innovations page: ${window.location.origin}/showcase/${sessionResult.id}

Thanks! 🙏`,
        hashtags: '#innovation #problemsolving #feedback #breakthrough',
        platform_variants: {
          twitter: 'Just had a breakthrough on a complex challenge using an iterative multi-dimensional framework I\'ve been working on. Really helped with decision confidence. Would love feedback!',
          linkedin: 'I\'ve been working on a new decision-making framework and just had a breakthrough applying it to a real challenge. The multi-perspective approach significantly improved my confidence in the outcome. Would appreciate thoughts from the community.',
          casual: 'Been struggling with this problem and finally cracked it using a framework I developed. Pretty excited about the results - would love to get some feedback!'
        }
      },
      
      research: {
        title: `Research Methodology Share`,
        content: `I've been researching "${topic}" for a while and developed this systematic approach that's been really effective.

The breakthrough came from combining different analytical perspectives into what I'm calling an "iterative multi-dimensional framework" - basically getting input from historical, creative, analytical, and practical viewpoints before synthesizing the final approach.

Just applied it to ${solution.substring(0, 90)}... and got ${confidence}% confidence in the methodology.

Still refining the process, so would really value any feedback or thoughts. Full details on my research page: ${window.location.origin}/showcase/${sessionResult.id}

Always learning! 📚`,
        hashtags: '#research #methodology #feedback #learning',
        platform_variants: {
          twitter: 'Developed a new research methodology for complex problems. Just tested it and got promising results. Would love academic feedback!',
          linkedin: 'Sharing a systematic approach I\'ve developed for complex problem analysis. Early results are encouraging - would appreciate peer review.',
          casual: 'Been working on this research approach and finally got some solid results. Would love to hear what others think!'
        }
      },

      problem_solving: {
        title: `Problem-Solving Breakthrough`,
        content: `Quick update - I've been stuck on "${topic}" and finally made some progress using a structured approach I've been developing.

The method involves getting multiple perspectives (historical precedent, creative solutions, analytical breakdown, practical considerations) before making decisions. Kind of like having a diverse advisory board for every challenge.

Applied it to ${solution.substring(0, 85)}... and felt much more confident (${confidence}%) about the direction than my usual gut-check approach.

Still testing this framework, so would genuinely appreciate any thoughts or experiences with similar approaches. More details: ${window.location.origin}/showcase/${sessionResult.id}

Thanks for reading! 🤔`,
        hashtags: '#problemsolving #methodology #feedback #growth',
        platform_variants: {
          twitter: 'Finally solved a problem I was stuck on using a multi-perspective framework I developed. Much higher confidence than usual gut decisions!',
          linkedin: 'Sharing a systematic problem-solving approach that\'s been giving me better decision confidence. Would welcome thoughts from the community.',
          casual: 'Cracked a tough problem using this new approach I\'ve been trying. Actually feel confident about the solution for once!'
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