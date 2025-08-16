import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  History, Eye, Brain, Palette, Landmark, ScanLine, Wand2, 
  ShieldAlert, Flame, Scale, Shield, Crown, Users, Settings, Upload, X, FileText, ChevronDown
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ParliamentariumBoard({ user }) {
  const [newTopic, setNewTopic] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [userName, setUserName] = useState(user?.email || "");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreationTask, setIsCreationTask] = useState(false);
  const [personaApiKeys, setPersonaApiKeys] = useState({});
  
  const navigate = useNavigate();

  // Available API key options
  const availableKeys = [
    { id: 'gemini_1', name: 'Gemini Key 1', description: 'Primary Gemini API Key' },
    { id: 'gemini_2', name: 'Gemini Key 2', description: 'Secondary Gemini API Key' },
    { id: 'gemini_3', name: 'Gemini Key 3', description: 'Tertiary Gemini API Key' },
    { id: 'gemini_4', name: 'Gemini Key 4', description: 'Quaternary Gemini API Key' },
    { id: 'gemini_5', name: 'Gemini Key 5', description: 'Quintenary Gemini API Key' },
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

  useEffect(() => {
    // Initialize with default assignments
    setPersonaApiKeys(defaultKeyAssignments);
  }, []);

  const personas = [
    {
      id: "mouse",
      name: "The Mouse",
      role: "Historian",
      description: "Anchors discussions in precedent, memory, and recursive lineage. Speaks from the wisdom of ages.",
      image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&h=200&fit=crop",
      icon: <History className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "orange",
      specialSeat: "Antique wooden chair with scrolls"
    },
    {
      id: "dolphin", 
      name: "The Dolphin",
      role: "Prognosticator",
      description: "Forecasts trends and emergent outcomes. Navigates temporal streams with fluid intelligence.",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop",
      icon: <Eye className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI", 
      isTopLLM: true,
      glow: "blue",
      specialSeat: "Flowing water pool with crystal platform"
    },
    {
      id: "patternist",
      name: "The Patternist", 
      role: "Analyst",
      description: "Finds energetic and symbolic loops across systems. Maps the hidden architecture of reality.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
      icon: <Brain className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "purple",
      specialSeat: "Geometric crystalline formation seat"
    },
    {
      id: "contextualist",
      name: "The Contextualist",
      role: "Synthesizer",
      description: "Roots logic in real-world emotion and ecology. The final voice that integrates all perspectives.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      icon: <Palette className="w-4 h-4" />,
      llm: "Gemini 2.0 Flash Exp",
      provider: "Google AI",
      isTopLLM: true,
      glow: "green",
      specialSeat: "Living tree throne with flowing roots"
    },
    {
      id: "superscholar",
      name: "The Superscholar",
      role: "Meta Agent", 
      description: "Translates across epistemology, cybernetics, and semiotics. The ultimate interdisciplinary mind.",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
      icon: <Landmark className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: true,
      glow: "violet",
      specialSeat: "Floating library sphere with orbiting books"
    },
    {
      id: "diviner",
      name: "The Diviner",
      role: "Scryer",
      description: "Uses symbols and intuition to reveal non-linear truths. Channels mystical wisdom from beyond.",
      image: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=300&h=200&fit=crop",
      icon: <ScanLine className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "ethereal",
      specialSeat: "Misty crystal cave with floating runes"
    },
    {
      id: "naysayer",
      name: "The Naysayer",
      role: "7th Seat",
      description: "Challenges assumptions and introduces sacred resistance. The necessary voice of productive dissent.",
      image: "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=300&h=200&fit=crop",
      icon: <ShieldAlert className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "red",
      specialSeat: "Obsidian spike chair wreathed in shadows"
    },
    {
      id: "illustrator",
      name: "The Court Illustrator",
      role: "Glyph Scribe",
      description: "Captures meetings as symbolic visual compression. Transforms words into living art.",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
      icon: <Wand2 className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "gold",
      specialSeat: "Easel throne surrounded by floating brushes"
    },
    {
      id: "id",
      name: "The ID",
      role: "Primal Flame",
      description: "Embodies pure instinct and unfiltered want. The raw authentic voice beneath civilization.",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop",
      icon: <Flame className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "crimson",
      specialSeat: "Primal stone throne with eternal flames"
    },
    {
      id: "ego",
      name: "The EGO",
      role: "Mediator",
      description: "Balances desire and morality, navigating reality's constraints. The pragmatic voice of possibility.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
      icon: <Scale className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "golden",
      specialSeat: "Balanced scales throne of polished bronze"
    },
    {
      id: "superego",
      name: "The SUPEREGO",
      role: "Moral Sentinel",
      description: "Enforces societal rules and moral imperatives. The unwavering guardian of ethical standards.",
      image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=300&h=200&fit=crop",
      icon: <Shield className="w-4 h-4" />,
      llm: "Gemini 1.5 Flash",
      provider: "Google AI",
      isTopLLM: false,
      glow: "silver",
      specialSeat: "Marble pillar seat with golden scales"
    }
  ];

  const updatePersonaKey = (personaId, keyId) => {
    setPersonaApiKeys(prev => ({
      ...prev,
      [personaId]: {
        ...prev[personaId],
        primary: keyId
      }
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartMeetingWithMode = (audioMode) => {
    if (!newTopic.trim()) return;
    
    const meetingData = {
      topic: newTopic,
      description: topicDescription,
      proposedBy: userName || "Anonymous",
      isCreationTask: isCreationTask,
      uploadedFiles: uploadedFiles,
      personaApiKeys: personaApiKeys,
      audioMode: audioMode,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for the meeting component
    localStorage.setItem('currentMeeting', JSON.stringify(meetingData));
    navigate('/meeting');
  };

  const handleStartMeeting = () => {
    handleStartMeetingWithMode('none'); // Default to no audio mode
  };

  const getGlowClass = (glow) => {
    const glowMap = {
      orange: 'shadow-orange-500/50 border-orange-400',
      purple: 'shadow-purple-500/50 border-purple-400',
      green: 'shadow-green-500/50 border-green-400',
      rainbow: 'shadow-purple-500/50 border-purple-400 animate-pulse',
      blue: 'shadow-blue-500/50 border-blue-400',
      violet: 'shadow-violet-500/50 border-violet-400',
      red: 'shadow-red-500/50 border-red-400',
      gold: 'shadow-yellow-500/50 border-yellow-400',
      crimson: 'shadow-red-600/50 border-red-600',
      golden: 'shadow-yellow-400/50 border-yellow-300',
      silver: 'shadow-gray-300/50 border-gray-300',
      amber: 'shadow-amber-500/50 border-amber-400',
      ethereal: 'shadow-cyan-300/30 border-cyan-200 opacity-60'
    };
    return glowMap[glow] || '';
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    if (uploadedFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target.result.split(',')[1], // Remove data URL prefix
          summary: `File: ${file.name} (${formatFileSize(file.size)})`
        };
        
        setUploadedFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-gold-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            🏛️ The Parliamentarium
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2">
            Where AI Minds Convene in Democratic Discourse
          </p>
          <p className="text-sm text-purple-300">
            13 Unique Personas • Advanced Deliberation • Visual Intelligence • Audio Streaming
          </p>
        </div>

        {/* Meeting Setup */}
        <div className="mb-8">
          <Card className="bg-gray-800/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Topic Input */}
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-purple-300 mb-2">
                    Parliamentary Topic *
                  </label>
                  <Input
                    id="topic"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="What shall the parliament deliberate upon?"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {/* Proposer Name */}
                <div>
                  <label htmlFor="proposer" className="block text-sm font-medium text-purple-300 mb-2">
                    Proposed By
                  </label>
                  <Input
                    id="proposer"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your name or organization"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium text-purple-300 mb-2">
                  Detailed Description
                </label>
                <Textarea
                  id="description"
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Provide context, background, or specific questions for the parliament to consider..."
                  className="bg-gray-700 border-gray-600 text-white min-h-20"
                  rows={3}
                />
              </div>

              {/* Creation Task Toggle */}
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="creation-task"
                  checked={isCreationTask}
                  onChange={(e) => setIsCreationTask(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="creation-task" className="text-sm font-medium text-purple-300">
                  🎨 Creation Task Mode
                </label>
                <span className="text-xs text-gray-400">
                  (Transform discussion into collaborative document creation)
                </span>
              </div>

              {/* File Upload Area */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  📁 Context Files (Optional, max 5 files)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver 
                      ? 'border-purple-400 bg-purple-900/20' 
                      : 'border-gray-600 hover:border-purple-500'
                  }`}
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-300 mb-2">
                    Drag & drop files here, or{' '}
                    <label className="text-purple-400 hover:text-purple-300 cursor-pointer underline">
                      browse
                      <input
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        accept=".txt,.pdf,.doc,.docx,.md,.json"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports: TXT, PDF, DOC, MD, JSON (Max 10MB each)
                  </p>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-purple-300">Uploaded Files:</h4>
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-300">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          onClick={() => removeFile(file.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6 border-t border-gray-700">
                <Button 
                  onClick={handleStartMeeting}
                  disabled={!newTopic.trim()}
                  className="bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-700 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  title="undo - Summon the parliament to deliberate and create solutions"
                >
                  🏛️ Convene the Parliament
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Mode Selection */}
        <Card className="bg-gray-800/50 border-cyan-500/30 mb-6">
          <CardHeader>
            <CardTitle>🎵 Choose Conversation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Streaming Audio Mode */}
              <div className="group relative">
                <Button
                  onClick={() => handleStartMeetingWithMode('streaming')}
                  disabled={!newTopic.trim()}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex flex-col items-center justify-center"
                >
                  🎵 Stream
                </Button>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Real-time audio streaming with individual speaker control and influence weights
                </div>
              </div>

              {/* No Audio Mode */}
              <div className="group relative">
                <Button
                  onClick={() => handleStartMeetingWithMode('none')}
                  disabled={!newTopic.trim()}
                  className="w-full h-16 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex flex-col items-center justify-center"
                >
                  💬 Text Only
                </Button>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Traditional text-based discussion without audio features
                </div>
              </div>

              {/* Podcast Mode */}
              <div className="group relative">
                <Button
                  onClick={() => handleStartMeetingWithMode('podcast')}
                  disabled={!newTopic.trim()}
                  className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex flex-col items-center justify-center"
                >
                  🎙️ Podcast
                </Button>
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Generate complete podcast automatically - ready when conversation finishes
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <Card 
              key={persona.id}
              className={`bg-gray-800/50 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${getGlowClass(persona.glow)}`}
            >
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src={persona.image} 
                    alt={persona.name}
                    className="w-full h-32 object-cover rounded-lg mb-3 opacity-80"
                  />
                  {persona.isTopLLM && (
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getGlowClass(persona.glow).includes('shadow') ? 'bg-current' : 'bg-gray-400'} animate-pulse`} />
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{persona.name}</h3>
                  <div className="flex items-center gap-1 text-purple-400">
                    {persona.icon}
                  </div>
                </div>
                
                <Badge className="mb-2 bg-purple-600/20 text-purple-300 border-purple-500/30">
                  {persona.role}
                </Badge>
                
                <p className="text-sm text-gray-300 mb-3">{persona.description}</p>
                
                {/* API Key Selection Dropdown */}
                <div className="mb-3 border-2 border-blue-500/30 rounded-lg p-2 bg-blue-900/10">
                  <label className="text-xs text-blue-300 font-medium mb-1 block">
                    🔑 Primary API Key
                  </label>
                  <div className="relative">
                    <select
                      value={personaApiKeys[persona.id]?.primary || 'gemini_1'}
                      onChange={(e) => updatePersonaKey(persona.id, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 appearance-none cursor-pointer hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableKeys.map(key => (
                        <option key={key.id} value={key.id} className="bg-gray-700">
                          {key.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="text-xs text-blue-200/70 mt-1">
                    Fallbacks: {personaApiKeys[persona.id]?.fallback.slice(0, 2).map(id => 
                      availableKeys.find(k => k.id === id)?.name
                    ).join(', ')}...
                  </div>
                </div>

                {/* Persona Image Generation (Gold+ Only) */}
                {user && ['gold', 'vip', 'enterprise'].includes(user.subscription_tier) && (
                  <div className="mb-3 border-2 border-green-500/30 rounded-lg p-2 bg-green-900/10">
                    <label className="text-xs text-green-300 font-medium mb-1 block">
                      🎨 Generate Custom Image
                    </label>
                    <Button
                      onClick={() => generatePersonaImage(persona.id, persona.name)}
                      className="w-full text-xs bg-green-600 hover:bg-green-700 h-7"
                      title="Generate a custom image for this persona that ships with them"
                      disabled={isGeneratingImage[persona.id]}
                    >
                      {isGeneratingImage[persona.id] ? '⏳ Generating...' : '✨ Create Image'}
                    </Button>
                  </div>
                )}
                
                <div className="text-xs text-gray-400 space-y-1">
                  <div>🤖 {persona.llm}</div>
                  <div>🏢 {persona.provider}</div>
                  <div>🪑 {persona.specialSeat}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">
            Powered by AI • Enhanced with Visual Intelligence • Real-time Audio Streaming
          </p>
          <p className="text-xs mt-2">
            Experience the future of collaborative AI decision-making
          </p>
        </div>
      </div>
    </div>
  );
}