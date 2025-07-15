import React, { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  History, Eye, Brain, Palette, Landmark, ScanLine, Wand2, 
  ShieldAlert, Flame, Scale, Shield, Crown, Users, Settings
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

export default function ParliamentariumBoard() {
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [newTopic, setNewTopic] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const handleStartMeeting = () => {
    if (!newTopic.trim()) return;
    
    const meetingData = {
      topic: newTopic,
      description: topicDescription,
      proposedBy: userName || "Anonymous",
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
              />
              <Input
                placeholder="Topic for discussion"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="bg-gray-700/50 border-gray-600"
              />
            </div>
            <Textarea
              placeholder="Describe the matter in detail..."
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              className="bg-gray-700/50 border-gray-600 min-h-24"
            />
            <Button 
              onClick={handleStartMeeting}
              disabled={!newTopic.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              🔮 Convene the Parliament
            </Button>
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