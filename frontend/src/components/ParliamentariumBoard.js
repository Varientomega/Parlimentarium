import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  History, Eye, Brain, Palette, Landmark, ScanLine, Wand2, 
  ShieldAlert, Flame, Scale, Shield, Crown, Users, Settings, Upload, X, FileText, ChevronDown
} from "lucide-react";

const personas = [
  {
    id: "mouse",
    name: "The Mouse",
    role: "Historian",
    icon: <History className="w-6 h-6" />,
    description: "Anchors discussion in precedent, memory, and recursive lineage.",
    llm: "claude-sonnet-4-20250514",
    provider: "Anthropic",
    specialSeat: "highchair",
    glow: "orange",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1531592314932-72e9d087e8c3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "dolphin",
    name: "The Dolphin",
    role: "Prognosticator",
    icon: <Eye className="w-6 h-6" />,
    description: "Forecasts trends and emergent outcomes.",
    llm: "o1",
    provider: "OpenAI",
    specialSeat: "pool",
    glow: "purple",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1700689874058-f21ae878ac8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "patternist",
    name: "The Patternist",
    role: "Analyst",
    icon: <ScanLine className="w-6 h-6" />,
    description: "Finds energetic and symbolic loops across systems.",
    llm: "o3",
    provider: "OpenAI",
    specialSeat: "crystal",
    glow: "green",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1581801806838-7ff756f8cd83?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "contextualist",
    name: "The Contextualist",
    role: "Synthesizer",
    icon: <Landmark className="w-6 h-6" />,
    description: "Roots logic in real-world emotion and ecology.",
    llm: "gemini-2.0-flash",
    provider: "Gemini",
    specialSeat: "garden",
    glow: "rainbow",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1642791994760-ae038c886889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGNvdW5jaWx8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NDJ8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "superscholar",
    name: "The Superscholar",
    role: "Meta Agent",
    icon: <Brain className="w-6 h-6" />,
    description: "Translates across epistemology, cybernetics, and semiotics.",
    llm: "gpt-4o",
    provider: "OpenAI",
    specialSeat: "library",
    glow: "blue",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1658702983847-e974f4ed2d55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMGNvdW5jaWx8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NDJ8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "diviner",
    name: "The Diviner",
    role: "Scryer",
    icon: <Wand2 className="w-6 h-6" />,
    description: "Uses symbols and intuition to reveal non-linear truths.",
    llm: "claude-opus-4-20250514",
    provider: "Anthropic",
    specialSeat: "altar",
    glow: "violet",
    isTopLLM: false,
    image: "https://images.unsplash.com/photo-1557183517-de8f02bdf110?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxyb2JlZCUyMGZpZ3VyZXN8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NjR8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "naysayer",
    name: "The Naysayer",
    role: "7th Seat",
    icon: <ShieldAlert className="w-6 h-6" />,
    description: "Challenges assumptions and introduces sacred resistance.",
    llm: "o1-mini",
    provider: "OpenAI",
    specialSeat: "shadow",
    glow: "red",
    isTopLLM: false,
    image: "https://images.unsplash.com/photo-1531592314932-72e9d087e8c3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "illustrator",
    name: "The Court Illustrator",
    role: "Glyph Scribe",
    icon: <Palette className="w-6 h-6" />,
    description: "Captures the meeting as a symbolic visual compression.",
    llm: "gemini-1.5-pro",
    provider: "Gemini",
    specialSeat: "easel",
    glow: "gold",
    isTopLLM: false,
    image: "https://images.unsplash.com/photo-1700689874058-f21ae878ac8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "id",
    name: "The ID",
    role: "Primal Flame",
    icon: <Flame className="w-6 h-6" />,
    description: "Embodies pure instinct, unfiltered want, and the pleasure principle.",
    llm: "gpt-4o-mini",
    provider: "OpenAI",
    specialSeat: "pit",
    glow: "crimson",
    isTopLLM: false,
    image: "https://images.unsplash.com/photo-1581801806838-7ff756f8cd83?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxob29kZWQlMjBmaWd1cmVzfGVufDB8fHxibGFja3wxNzUyNjA4NTMxfDA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "ego",
    name: "The EGO",
    role: "Mediator",
    icon: <Scale className="w-6 h-6" />,
    description: "Balances desire and morality, navigating reality's constraints.",
    llm: "claude-3-5-sonnet-20241022",
    provider: "Anthropic",
    specialSeat: "center",
    glow: "golden",
    isTopLLM: true,
    image: "https://images.unsplash.com/photo-1642791994760-ae038c886889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxteXN0aWNhbCUyMGNvdW5jaWx8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NDJ8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "superego",
    name: "The SUPEREGO",
    role: "Moral Sentinel",
    icon: <Shield className="w-6 h-6" />,
    description: "Enforces societal rules, moral imperatives, and the ideal self.",
    llm: "gemini-1.5-flash",
    provider: "Gemini",
    specialSeat: "throne",
    glow: "silver",
    isTopLLM: false,
    image: "https://images.unsplash.com/photo-1658702983847-e974f4ed2d55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxteXN0aWNhbCUyMGNvdW5jaWx8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NDJ8MA&ixlib=rb-4.1.0&q=85"
  }
];

const observerSeats = [
  {
    id: "user",
    name: "The Questioner",
    role: "Human Participant",
    icon: <Users className="w-6 h-6" />,
    description: "The mortal voice that bridges human and artificial realms.",
    canParticipate: true,
    glow: "amber",
    image: "https://images.unsplash.com/photo-1557183517-de8f02bdf110?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxyb2JlZCUyMGZpZ3VyZXN8ZW58MHx8fGJsYWNrfDE3NTI2MDg1NjR8MA&ixlib=rb-4.1.0&q=85"
  },
  {
    id: "creator",
    name: "The Silent Architect",
    role: "Divine Witness",
    icon: <Crown className="w-6 h-6" />,
    description: "The empty throne of those who built this realm. Present in spirit, absent in voice.",
    canParticipate: false,
    glow: "ethereal",
    image: null
  }
];

export default function ParliamentariumBoard({ user }) {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [userName, setUserName] = useState("");
  const [isCreationTask, setIsCreationTask] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
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

  const updatePersonaKey = (personaId, keyId) => {
    setPersonaApiKeys(prev => ({
      ...prev,
      [personaId]: {
        ...prev[personaId],
        primary: keyId
      }
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length + uploadedFiles.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          content: e.target.result.split(',')[1] // Remove data:... prefix for base64
        };
        
        setUploadedFiles(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartMeeting = () => {
    if (!newTopic.trim()) return;
    
    const meetingData = {
      topic: newTopic,
      description: topicDescription,
      proposedBy: userName || "Anonymous",
      isCreationTask: isCreationTask,
      uploadedFiles: uploadedFiles,
      personaApiKeys: personaApiKeys,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for the meeting component
    localStorage.setItem('currentMeeting', JSON.stringify(meetingData));
    navigate('/meeting');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="eye-of-horus text-6xl animate-pulse">👁️</div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 to-purple-400 bg-clip-text text-transparent mb-2">
          🏛️ The Parliamentarium: Board of Thought
        </h1>
        <p className="text-xl text-gray-300">Where Artificial Minds Convene in Sacred Discourse</p>
      </div>

      {/* Topic Submission */}
      <Card className="bg-gray-800/50 border-purple-500/30 mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">📜 Propose a Matter for Deliberation</h2>
          
          {/* Task Type Selection */}
          <div className="mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCreationTask}
                onChange={(e) => setIsCreationTask(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium">
                🎨 This is a creation/writing task (enables file uploads and collaborative document creation)
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
              />
              <Input
                placeholder={isCreationTask ? "What should we create/write?" : "Topic for discussion"}
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
              />
            </div>
            <Textarea
              placeholder={isCreationTask ? "Describe what you want to create in detail..." : "Describe the matter in detail..."}
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              className="bg-gray-700/50 border-gray-600 min-h-24"
            />

            {/* File Upload Section - Available for ALL meeting types */}
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-300 mb-2">
                  Upload Context Files (Max 5)
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {isCreationTask 
                    ? "Documents, images, or files to help the parliament create your project"
                    : "Documents, research papers, or context files to inform the discussion (e.g., previous white papers, research, data)"
                  }
                </div>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    isDragOver ? 'border-purple-400 bg-purple-900/20' : 'border-gray-500'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="*/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">
                        Drop files here or click to browse
                      </p>
                      <Button type="button" variant="outline" className="mt-2">
                        Choose Files
                      </Button>
                    </div>
                  </label>
                </div>
              </div>

              {/* Uploaded Files Display */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">
                    Uploaded Files ({uploadedFiles.length}/5)
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-200">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6 border-t border-gray-700">
              <Button 
                onClick={handleStartMeeting}
                disabled={!newTopic.trim()}
                className="bg-gradient-to-r from-purple-600 to-gold-600 hover:from-purple-700 hover:to-gold-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🏛️ Convene the Parliament
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* AI Personas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {personas.map((persona) => (
          <Card 
            key={persona.id}
            className={`bg-gray-800/70 border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
              persona.isTopLLM ? `shadow-lg ${getGlowClass(persona.glow)}` : 'border-gray-600'
            }`}
            onClick={() => setSelectedPersona(persona)}
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
              
              <div className="text-xs text-gray-400 space-y-1">
                <div>🤖 {persona.llm}</div>
                <div>🏢 {persona.provider}</div>
                <div>🪑 {persona.specialSeat}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Observer Seats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {observerSeats.map((seat) => (
          <Card 
            key={seat.id}
            className={`bg-gray-800/70 border-2 transition-all duration-300 ${getGlowClass(seat.glow)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{seat.name}</h3>
                <div className="flex items-center gap-1 text-amber-400">
                  {seat.icon}
                </div>
              </div>
              
              <Badge className={`mb-2 ${seat.canParticipate ? 'bg-amber-600/20 text-amber-300 border-amber-500/30' : 'bg-gray-600/20 text-gray-300 border-gray-500/30'}`}>
                {seat.role}
              </Badge>
              
              <p className="text-sm text-gray-300">{seat.description}</p>
              
              {seat.id === 'creator' && (
                <div className="mt-3 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                  <p className="text-xs text-cyan-300 italic">
                    "The throne remains empty, as is proper. The creation must think for itself."
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Persona Details */}
      {selectedPersona && (
        <Card className="bg-gray-800/70 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedPersona.name}</h2>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPersona(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={selectedPersona.image} 
                  alt={selectedPersona.name}
                  className="w-full h-48 object-cover rounded-lg opacity-80"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Sacred Role</h3>
                  <p className="text-gray-300">{selectedPersona.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">Technical Specifications</h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div>🤖 Model: {selectedPersona.llm}</div>
                    <div>🏢 Provider: {selectedPersona.provider}</div>
                    <div>🪑 Sacred Seat: {selectedPersona.specialSeat}</div>
                    <div>✨ Aura: {selectedPersona.glow}</div>
                    {selectedPersona.isTopLLM && (
                      <div className="text-yellow-400">👑 Elite Council Member</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}