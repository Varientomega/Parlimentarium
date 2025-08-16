import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Mic, FileText, Headphones, Sparkles, Download, ExternalLink } from 'lucide-react';

const ContentCreatorSection = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="cyber-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display heading-display flex items-center justify-center gap-3">
            <Mic className="w-8 h-8 text-neon-purple" />
            Content Creator's Dream Workflow
            <Sparkles className="w-8 h-8 text-neon-blue" />
          </CardTitle>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get complete podcast episodes with transcripts, multi-voice audio, and ready-to-publish content
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 glass-panel rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">AI Parliament Session</h3>
              <p className="text-sm text-gray-300">11 AI personas debate your content topic until consensus</p>
            </div>
            
            <div className="text-center p-4 glass-panel rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Auto-Generated Content</h3>
              <p className="text-sm text-gray-300">Get podcast audio + full transcript + talking points</p>
            </div>
            
            <div className="text-center p-4 glass-panel rounded-xl">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Polish with Kitt</h3>
              <p className="text-sm text-gray-300">One-click import to Kitt for final editing and distribution</p>
            </div>
          </div>

          {/* Content Types */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">What You Get:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Headphones className="w-5 h-5" />, label: 'Multi-Voice Podcast', desc: 'Different AI voices for each persona' },
                { icon: <FileText className="w-5 h-5" />, label: 'Full Transcript', desc: 'Word-for-word conversation text' },
                { icon: <Mic className="w-5 h-5" />, label: 'Talking Points', desc: 'Key insights and takeaways' },
                { icon: <Download className="w-5 h-5" />, label: 'Raw Materials', desc: 'All source content for editing' }
              ].map((item, index) => (
                <div key={index} className="p-3 glass-panel rounded-lg text-center">
                  <div className="text-purple-400 mb-2 flex justify-center">{item.icon}</div>
                  <h4 className="font-semibold text-sm">{item.label}</h4>
                  <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cyber-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                J
              </div>
              <div>
                <h3 className="font-semibold">Jessica Park</h3>
                <p className="text-sm text-muted-foreground">Content Creator & Podcaster</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3 italic">
              "This is insane - I got complete podcast episodes with transcripts and multi-voice audio. 
              Just needed Kitt to polish it. Like having the world's best content team brainstorm for hours."
            </p>
            <Badge className="cyber-badge bg-green-600/20 border-green-500/30 text-green-300">
              2.3M podcast downloads
            </Badge>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                D
              </div>
              <div>
                <h3 className="font-semibold">David Martinez</h3>
                <p className="text-sm text-muted-foreground">YouTube Creator (2.1M subs)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3 italic">
              "Holy shit - got complete video scripts, talking points, even podcast versions with different voices. 
              Better than hiring an entire creative team."
            </p>
            <Badge className="cyber-badge bg-blue-600/20 border-blue-500/30 text-blue-300">
              15M views, 400K new subs
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Kitt Integration */}
      <Card className="cyber-card border-2 border-cyan-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl glass-panel">
                <ExternalLink className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cyan-300">Perfect Kitt.ai Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Export your Parliament session directly to Kitt for professional podcast editing
                </p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              onClick={() => window.open('https://kitt.ai', '_blank')}
            >
              Learn About Kitt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentCreatorSection;