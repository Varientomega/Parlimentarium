import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  History, Eye, Brain, Palette, Landmark, ScanLine, Wand2, 
  ShieldAlert, Flame, Scale, Shield, Crown, Users, Settings, Upload, X, FileText, ChevronDown,
  Sparkles, Zap, Globe, Cpu, Radio, Volume2, FileAudio, Headphones
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ParliamentariumBoard({ user }) {
  const [newTopic, setNewTopic] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [audioMode, setAudioMode] = useState('none');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [personaApiKeys, setPersonaApiKeys] = useState({});

  const navigate = useNavigate();

  // Available API keys for dropdown selection
  const availableKeys = [
    { id: 'gemini_1', name: 'Gemini Key 1', description: 'Primary Gemini API Key' },
    { id: 'gemini_2', name: 'Gemini Key 2', description: 'Secondary Gemini API Key' },
    { id: 'gemini_3', name: 'Gemini Key 3', description: 'Tertiary Gemini API Key' },
    { id: 'gemini_4', name: 'Gemini Key 4', description: 'Quaternary Gemini API Key' },
    { id: 'gemini_5', name: 'Gemini Key 5', description: 'Quinary Gemini API Key' },
    { id: 'emergent_llm', name: 'Emergent LLM Key', description: 'Universal Emergent API Key' }
  ];

  // State for persona image generation
  const [isGeneratingImage, setIsGeneratingImage] = useState({});

  // Generate custom image for persona
  const generatePersonaImage = async (personaId, personaName) => {
    if (!user || !['gold', 'vip', 'enterprise'].includes(user.subscription_tier)) {
      alert('Gold subscription or higher required for persona image generation');
      return;
    }

    try {
      setIsGeneratingImage(prev => ({...prev, [personaId]: true}));
      
      const prompt = `${personaName} - mystical AI parliament member, futuristic cyborg design, ethereal and powerful presence, digital art masterpiece`;
      
      const response = await axios.post(`${API}/api/generate-persona-image`, {
        persona_name: personaName,
        prompt: prompt
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        alert(`✨ Custom image generated for ${personaName}!\nImage URL: ${response.data.image_url}`);
        // Optionally update persona display with new image
      } else {
        alert(`Failed to generate image: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error generating persona image:', error);
      alert('Failed to generate persona image. Please try again.');
    } finally {
      setIsGeneratingImage(prev => ({...prev, [personaId]: false}));
    }
  };

  // Default persona key assignments with fallback order
  const defaultKeyAssignments = {
    "mouse": { primary: 'gemini_1', fallback: ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "dolphin": { primary: 'gemini_2', fallback: ['gemini_1', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "patternist": { primary: 'gemini_3', fallback: ['gemini_1', 'gemini_2', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "contextualist": { primary: 'gemini_4', fallback: ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_5', 'emergent_llm'] },
    "superscholar": { primary: 'gemini_5', fallback: ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_4', 'emergent_llm'] },
    "diviner": { primary: 'gemini_1', fallback: ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "naysayer": { primary: 'gemini_2', fallback: ['gemini_1', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "illustrator": { primary: 'gemini_3', fallback: ['gemini_1', 'gemini_2', 'gemini_4', 'gemini_5', 'emergent_llm'] },
    "id": { primary: 'gemini_4', fallback: ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_5', 'emergent_llm'] },
    "ego": { primary: 'gemini_5', fallback: ['gemini_1', 'gemini_2', 'gemini_3', 'gemini_4', 'emergent_llm'] },
    "superego": { primary: 'gemini_1', fallback: ['gemini_2', 'gemini_3', 'gemini_4', 'gemini_5', 'emergent_llm'] }
  };

  // Initialize persona API key assignments
  useEffect(() => {
    setPersonaApiKeys(defaultKeyAssignments);
  }, []);

  const updatePersonaKey = (personaId, newPrimaryKey) => {
    setPersonaApiKeys(prev => ({
      ...prev,
      [personaId]: {
        primary: newPrimaryKey,
        fallback: defaultKeyAssignments[personaId].fallback.filter(key => key !== newPrimaryKey)
      }
    }));
  };

  // Enhanced personas with modern futuristic design
  const personas = [
    {
      id: "mouse",
      name: "The Mouse",
      role: "Historian",
      description: "Anchors discussions in precedent, memory, and recursive lineage. The keeper of institutional wisdom.",
      image: "https://images.unsplash.com/photo-1564865878688-9a244444042a?w=300&h=200&fit=crop",
      icon: <History className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "amber",
      specialSeat: "Ancient oak throne with carved chronicles",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/5 border-amber-500/20"
    },
    {
      id: "dolphin",
      name: "The Dolphin",
      role: "Prognosticator",
      description: "Forecasts trends and emergent outcomes. Navigates temporal streams with fluid intelligence.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop",
      icon: <Eye className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "cyan",
      specialSeat: "Crystalline wave-form chair",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/5 border-cyan-500/20"
    },
    {
      id: "patternist",
      name: "The Patternist",
      role: "Analyst",
      description: "Finds energetic and symbolic loops across systems. Masters the hidden geometries of reality.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      icon: <Brain className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "emerald",
      specialSeat: "Fractal matrix throne of living algorithms",
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-500/5 border-emerald-500/20"
    },
    {
      id: "contextualist",
      name: "The Contextualist",
      role: "Integration Master",
      description: "Roots logic in real-world emotion and ecology. The final voice that integrates all perspectives.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      icon: <Palette className="w-5 h-5" />,
      llm: "Gemini 2.0 Flash Exp",
      provider: "Google AI",
      isTopLLM: true,
      glow: "purple",
      specialSeat: "Living tree throne with flowing roots",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/5 border-purple-500/20"
    },
    {
      id: "superscholar",
      name: "The Superscholar",
      role: "Meta Agent", 
      description: "Translates across epistemology, cybernetics, and semiotics. The ultimate interdisciplinary mind.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
      icon: <Landmark className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "violet",
      specialSeat: "Floating library sphere with orbiting books",
      color: "from-violet-500 to-indigo-500",
      bgColor: "bg-violet-500/5 border-violet-500/20"
    },
    {
      id: "diviner",
      name: "The Diviner",
      role: "Scryer",
      description: "Uses symbols and intuition to reveal non-linear truths. Channels mystical wisdom from beyond.",
      image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=300&h=200&fit=crop",
      icon: <ScanLine className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "ethereal",
      specialSeat: "Misty crystal cave with floating runes",
      color: "from-indigo-500 to-blue-500",
      bgColor: "bg-indigo-500/5 border-indigo-500/20"
    },
    {
      id: "naysayer",
      name: "The Naysayer",
      role: "7th Seat",
      description: "Challenges assumptions and introduces sacred resistance. The necessary voice of productive dissent.",
      image: "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=300&h=200&fit=crop",
      icon: <ShieldAlert className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "red",
      specialSeat: "Obsidian spike chair wreathed in shadows",
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-500/5 border-red-500/20"
    },
    {
      id: "illustrator",
      name: "The Court Illustrator",
      role: "Glyph Scribe",
      description: "Captures meetings as symbolic visual compression. Transforms words into living art.",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      icon: <Wand2 className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "gold",
      specialSeat: "Easel throne surrounded by floating brushes",
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-500/5 border-yellow-500/20"
    },
    {
      id: "id",
      name: "The ID",
      role: "Primal Flame",
      description: "Embodies pure instinct and unfiltered want. The raw authentic voice beneath civilization.",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop",
      icon: <Flame className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "crimson",
      specialSeat: "Primal stone throne with eternal flames",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/5 border-orange-500/20"
    },
    {
      id: "ego",
      name: "The EGO",
      role: "Mediator",
      description: "Balances desire and morality, navigating reality's constraints. The pragmatic voice of possibility.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      icon: <Scale className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "golden",
      specialSeat: "Balanced scales throne of polished bronze",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500/5 border-amber-500/20"
    },
    {
      id: "superego",
      name: "The SUPEREGO",
      role: "Moral Sentinel",
      description: "Enforces societal rules and moral imperatives. The unwavering guardian of ethical standards.",
      image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=200&fit=crop",
      icon: <Shield className="w-5 h-5" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "silver",
      specialSeat: "Marble pillar seat with golden scales",
      color: "from-gray-400 to-gray-500",
      bgColor: "bg-gray-500/5 border-gray-500/20"
    }
  ];

  const audioModes = [
    {
      id: 'none',
      name: 'Text Only',
      icon: <FileText className="w-4 h-4" />,
      description: 'Pure text discussion with no audio',
      color: 'bg-gray-600'
    },
    {
      id: 'streaming', 
      name: 'Live Stream',
      icon: <Radio className="w-4 h-4" />,
      description: 'Real-time audio streaming as personas speak',
      color: 'bg-red-600'
    },
    {
      id: 'podcast',
      name: 'Podcast Mode',
      icon: <Headphones className="w-4 h-4" />,
      description: 'Generated summary podcast after completion',
      color: 'bg-purple-600'
    }
  ];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (uploadedFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: e.target.result.split(',')[1], // Remove data:mime;base64, prefix
          preview: file.type.startsWith('image/') ? e.target.result : null
        };
        setUploadedFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleStartMeeting = async () => {
    if (!newTopic.trim()) return;

    try {
      const payload = {
        topic: newTopic,
        description: topicDescription || '',
        proposer: user?.email || 'Anonymous',
        is_creation_task: isCreationMode,
        persona_api_keys: personaApiKeys,
        audio_mode: audioMode,
        uploaded_files: uploadedFiles.map(file => ({
          filename: file.name,
          content: file.content,
          file_type: file.type,
          size: file.size
        }))
      };

      const response = await fetch(`${API}/api/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/meeting/${data.id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to create meeting: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark bg-noise">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl glass-panel">
              <Crown className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-5xl font-display heading-display">
              The Parliamentarium
            </h1>
            <div className="p-3 rounded-2xl glass-panel">
              <Sparkles className="w-8 h-8 text-neon-blue" />
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-2 max-w-3xl mx-auto text-balance">
            Convene an AI Parliament where 11 distinct personas deliberate, create, and decide through mystical discourse
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
              <span>13 AI Personas Active</span>
            </div>
            <div className="w-1 h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-blue" />
              <span>Real-time Processing</span>
            </div>
            <div className="w-1 h-4 bg-border"></div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-neon-purple" />
              <span>Multi-LLM Integration</span>
            </div>
          </div>
        </div>

        {/* Main Configuration Panel */}
        <div className="max-w-6xl mx-auto mb-12">
          <Card className="cyber-card border-2 border-purple-500/20 shadow-cyber">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-display gradient-primary bg-clip-text text-transparent">
                Configure Parliamentary Session
              </CardTitle>
              <p className="text-muted-foreground">
                Set the stage for mystical AI deliberation
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Session Mode Toggle */}
              <div className="flex justify-center">
                <div className="glass-panel rounded-full p-1 flex">
                  <button
                    onClick={() => setIsCreationMode(false)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      !isCreationMode 
                        ? 'bg-purple-600 text-white shadow-neon' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    🏛️ Deliberation
                  </button>
                  <button
                    onClick={() => setIsCreationMode(true)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isCreationMode 
                        ? 'bg-cyan-600 text-white shadow-neon' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ✨ Creation
                  </button>
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  {isCreationMode ? 'Creation Project' : 'Discussion Topic'}
                </label>
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder={isCreationMode ? "What should the parliament create together?" : "What should the parliament discuss?"}
                  className="cyber-input text-lg h-14"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Additional Context
                </label>
                <Textarea
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Provide additional context, requirements, or background information..."
                  className="cyber-input resize-none"
                  rows={3}
                />
              </div>

              {/* Audio Mode Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-green-300 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Audio Experience
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {audioModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setAudioMode(mode.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        audioMode === mode.id
                          ? 'border-purple-500 bg-purple-500/10 shadow-cyber'
                          : 'border-gray-600 glass-panel hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${mode.color} text-white`}>
                          {mode.icon}
                        </div>
                        <h3 className="font-medium">{mode.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-orange-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Reference Materials ({uploadedFiles.length}/5)
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 mb-1">Drop files here or click to upload</p>
                    <p className="text-xs text-gray-500">PDF, DOC, TXT, Images (Max 5 files)</p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {uploadedFiles.length > 0 && (
                    <ScrollArea className="max-h-32">
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-2 glass-panel rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              <span className="text-sm truncate max-w-32">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6 border-t border-gray-700">
                <Button 
                  onClick={handleStartMeeting}
                  disabled={!newTopic.trim()}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-12 rounded-2xl text-lg shadow-cyber hover-lift"
                  title="undo - Summon the parliament to deliberate and create solutions"
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6" />
                    🏛️ Convene the Parliament
                    <Sparkles className="w-6 h-6" />
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parliament Members Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-display heading-display text-center mb-8">
            The Parliamentary Council
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <Card 
                key={persona.id} 
                className={`cyber-card group hover-lift ${persona.bgColor} animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="relative">
                    <img 
                      src={persona.image} 
                      alt={persona.name}
                      className="w-full h-32 object-cover rounded-lg opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg"></div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${persona.color} text-white shadow-neon`}>
                        {persona.icon}
                      </div>
                      {persona.isTopLLM && (
                        <Badge className="cyber-badge text-xs">
                          <Cpu className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{persona.name}</h3>
                    <Badge className={`mb-2 bg-gradient-to-r ${persona.color} text-white border-0`}>
                      {persona.role}
                    </Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">{persona.description}</p>
                  </div>
                  
                  {/* API Key Selection */}
                  <div className="space-y-2 p-3 glass-panel rounded-lg">
                    <label className="text-xs font-medium text-blue-300 flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      Primary API Key
                    </label>
                    <div className="relative">
                      <select
                        value={personaApiKeys[persona.id]?.primary || 'gemini_1'}
                        onChange={(e) => updatePersonaKey(persona.id, e.target.value)}
                        className="w-full bg-cyber-accent border border-gray-600 rounded-lg px-3 py-2 text-xs text-foreground appearance-none cursor-pointer hover:border-purple-500/50 transition-colors"
                      >
                        {availableKeys.map(key => (
                          <option key={key.id} value={key.id} className="bg-cyber-accent">
                            {key.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="text-xs text-blue-200/70">
                      Fallbacks: {personaApiKeys[persona.id]?.fallback.slice(0, 2).map(id => 
                        availableKeys.find(k => k.id === id)?.name
                      ).join(', ')}...
                    </div>
                  </div>

                  {/* Persona Image Generation (Gold+ Only) */}
                  {user && ['gold', 'vip', 'enterprise'].includes(user.subscription_tier) && (
                    <div className="p-3 glass-panel rounded-lg border border-green-500/20">
                      <label className="text-xs font-medium text-green-300 mb-2 block flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Generate Custom Image
                      </label>
                      <Button
                        onClick={() => generatePersonaImage(persona.id, persona.name)}
                        className="w-full text-xs bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-8 rounded-lg shadow-neon"
                        title="Generate a custom image for this persona that ships with them"
                        disabled={isGeneratingImage[persona.id]}
                      >
                        {isGeneratingImage[persona.id] ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            Generating...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Create Image
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-700/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Engine:</span>
                      <span className="text-cyan-300 font-mono">{persona.llm}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-purple-300 font-mono">{persona.provider}</span>
                    </div>
                    <div className="text-xs text-gray-500 italic mt-2">
                      {persona.specialSeat}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center space-y-6">
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              className="glass-button border-purple-500/30 text-purple-300 hover:border-purple-500"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Subscription
            </Button>
            <Button
              onClick={() => navigate('/marketplace')}
              variant="outline"
              className="glass-button border-cyan-500/30 text-cyan-300 hover:border-cyan-500"
            >
              <Users className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            {user?.is_dev && (
              <Button
                onClick={() => navigate('/dev-dashboard')}
                variant="outline"
                className="glass-button border-green-500/30 text-green-300 hover:border-green-500"
              >
                <Settings className="w-4 h-4 mr-2" />
                Dev Dashboard
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-gray-400 space-y-2">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse"></div>
                <span>AI-Powered Deliberation</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-blue" />
                <span>Visual Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-neon-green" />
                <span>Real-time Audio</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Experience the future of collaborative AI decision-making • Powered by advanced language models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}