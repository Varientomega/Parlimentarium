import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";
import { useNavigate } from "react-router-dom";
import { mockMeetingData } from "../data/mockData";

export default function MeetingRoom() {
  const [meetingData, setMeetingData] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('opening');
  const [messages, setMessages] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [motionStatus, setMotionStatus] = useState(null);
  const [votes, setVotes] = useState({});
  const [progress, setProgress] = useState(0);
  const [userMessage, setUserMessage] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentMeeting');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMeetingData(parsed);
      initializeMeeting(parsed);
    } else {
      // Use mock data if no stored data
      setMeetingData(mockMeetingData);
      initializeMeeting(mockMeetingData);
    }
  }, []);

  const initializeMeeting = (topic) => {
    const openingMessage = {
      id: 1,
      speaker: "The EGO",
      role: "Mediator",
      content: `🏛️ The Parliamentarium is now in session. We convene to deliberate upon: "${topic.topic}". ${topic.description ? `The matter is described as: ${topic.description}` : ''} Let us proceed with sacred discourse.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    
    setMessages([openingMessage]);
    setCurrentSpeaker("The EGO");
    
    // Simulate meeting progression
    setTimeout(() => simulateMeetingFlow(topic), 2000);
  };

  const simulateMeetingFlow = (topic) => {
    let messageId = 2;
    const phases = ['opening', 'discussion', 'motion', 'voting', 'conclusion'];
    let currentPhaseIndex = 0;

    const speakers = [
      { name: "The Mouse", role: "Historian", persona: "historical" },
      { name: "The Dolphin", role: "Prognosticator", persona: "futuristic" },
      { name: "The Patternist", role: "Analyst", persona: "analytical" },
      { name: "The Contextualist", role: "Synthesizer", persona: "contextual" },
      { name: "The Superscholar", role: "Meta Agent", persona: "academic" },
      { name: "The Diviner", role: "Scryer", persona: "mystical" },
      { name: "The Naysayer", role: "7th Seat", persona: "contrarian" },
      { name: "The ID", role: "Primal Flame", persona: "impulsive" },
      { name: "The SUPEREGO", role: "Moral Sentinel", persona: "ethical" }
    ];

    const generateResponse = (speaker, topic, phase) => {
      const responses = {
        historical: [
          `In the annals of our discourse, similar matters have arisen. The precedent suggests...`,
          `History teaches us that such decisions require careful consideration of past outcomes...`,
          `The recursive nature of this topic echoes ancient deliberations...`
        ],
        futuristic: [
          `The emergent patterns suggest this decision will cascade through future scenarios...`,
          `My prognostications indicate three possible outcomes branching from this choice...`,
          `The temporal implications of this matter extend beyond our current horizon...`
        ],
        analytical: [
          `I observe systematic patterns in the data that suggest...`,
          `The energetic loops in this proposal create resonance with...`,
          `Cross-referencing symbolic structures reveals...`
        ],
        contextual: [
          `Grounding this in ecological reality, we must consider...`,
          `The emotional resonance of this choice affects...`,
          `Synthesizing these perspectives with real-world implications...`
        ],
        academic: [
          `From an epistemological standpoint, this matter intersects with...`,
          `The cybernetic implications translate through semiotic channels...`,
          `Meta-analysis reveals underlying structural considerations...`
        ],
        mystical: [
          `The symbols speak of hidden truths in this matter...`,
          `My intuitive sight reveals non-linear connections...`,
          `The sacred geometry of this decision suggests...`
        ],
        contrarian: [
          `I must challenge the assumptions underlying this proposal...`,
          `The sacred resistance emerges to question...`,
          `Before we proceed, consider the counterarguments...`
        ],
        impulsive: [
          `The immediate desire is clear - we must act now...`,
          `Pleasure principle demands we choose the path of...`,
          `Why hesitate? The instinct is obvious...`
        ],
        ethical: [
          `Moral imperatives require us to consider...`,
          `The highest standards demand we examine...`,
          `Justice and righteousness guide us toward...`
        ]
      };
      
      return responses[speaker.persona][Math.floor(Math.random() * responses[speaker.persona].length)] + 
             ` regarding "${topic.topic}".`;
    };

    const addMessage = (speaker, content, type = 'discussion') => {
      const message = {
        id: messageId++,
        speaker: speaker.name,
        role: speaker.role,
        content: content,
        timestamp: new Date().toISOString(),
        type: type
      };
      
      setMessages(prev => [...prev, message]);
      setCurrentSpeaker(speaker.name);
      setProgress(prev => Math.min(prev + 8, 100));
    };

    const progressMeeting = () => {
      if (currentPhaseIndex >= phases.length) return;
      
      const phase = phases[currentPhaseIndex];
      setCurrentPhase(phase);
      
      switch (phase) {
        case 'opening':
          setTimeout(() => {
            currentPhaseIndex++;
            progressMeeting();
          }, 3000);
          break;
          
        case 'discussion':
          speakers.forEach((speaker, index) => {
            setTimeout(() => {
              addMessage(speaker, generateResponse(speaker, topic, phase));
            }, index * 4000);
          });
          
          setTimeout(() => {
            currentPhaseIndex++;
            progressMeeting();
          }, speakers.length * 4000 + 2000);
          break;
          
        case 'motion':
          setTimeout(() => {
            addMessage(
              { name: "The EGO", role: "Mediator" },
              `I move to formalize our position on "${topic.topic}". Do I hear a second?`,
              'motion'
            );
            setMotionStatus('seconded');
          }, 1000);
          
          setTimeout(() => {
            addMessage(
              { name: "The Superscholar", role: "Meta Agent" },
              `I second the motion. Let us proceed to voting.`,
              'motion'
            );
            currentPhaseIndex++;
            progressMeeting();
          }, 3000);
          break;
          
        case 'voting':
          setTimeout(() => {
            addMessage(
              { name: "The EGO", role: "Mediator" },
              `The vote is now open. All in favor, signify by saying "Aye".`,
              'voting'
            );
            
            // Simulate voting
            const voteResults = {};
            speakers.forEach(speaker => {
              voteResults[speaker.name] = Math.random() > 0.3 ? 'aye' : 'nay';
            });
            setVotes(voteResults);
            
            setTimeout(() => {
              const ayes = Object.values(voteResults).filter(vote => vote === 'aye').length;
              const nays = Object.values(voteResults).filter(vote => vote === 'nay').length;
              
              addMessage(
                { name: "The EGO", role: "Mediator" },
                `The vote is complete. Ayes: ${ayes}, Nays: ${nays}. The motion ${ayes > nays ? 'passes' : 'fails'}.`,
                'voting'
              );
              
              currentPhaseIndex++;
              progressMeeting();
            }, 2000);
          }, 1000);
          break;
          
        case 'conclusion':
          setTimeout(() => {
            addMessage(
              { name: "The EGO", role: "Mediator" },
              `The Parliamentarium has reached its decision. The sacred discourse is concluded. May wisdom guide our actions.`,
              'conclusion'
            );
            setProgress(100);
          }, 1000);
          break;
      }
    };
    
    progressMeeting();
  };

  const handleUserMessage = () => {
    if (!userMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      speaker: "The Questioner",
      role: "Human Participant",
      content: userMessage,
      timestamp: new Date().toISOString(),
      type: 'user'
    };
    
    setMessages(prev => [...prev, message]);
    setUserMessage("");
    
    // Simulate response
    setTimeout(() => {
      const response = {
        id: messages.length + 2,
        speaker: "The EGO",
        role: "Mediator",
        content: `The Questioner raises an interesting point. The council acknowledges your contribution to our deliberations.`,
        timestamp: new Date().toISOString(),
        type: 'response'
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getMessageStyle = (type) => {
    const styles = {
      system: 'bg-purple-900/30 border-purple-500/30',
      discussion: 'bg-gray-800/50 border-gray-600/30',
      motion: 'bg-blue-900/30 border-blue-500/30',
      voting: 'bg-green-900/30 border-green-500/30',
      conclusion: 'bg-gold-900/30 border-gold-500/30',
      user: 'bg-amber-900/30 border-amber-500/30'
    };
    return styles[type] || styles.discussion;
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      opening: '🏛️',
      discussion: '💭',
      motion: '📜',
      voting: '🗳️',
      conclusion: '⚖️'
    };
    return icons[phase] || '🔮';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🏛️ The Parliamentarium Session</h1>
          <p className="text-gray-300">
            Topic: {meetingData?.topic || 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="border-purple-500 text-purple-300 hover:bg-purple-800"
          >
            📜 Return to Hall
          </Button>
        </div>
      </div>

      {/* Meeting Status */}
      <Card className="bg-gray-800/50 border-purple-500/30 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPhaseIcon(currentPhase)} 
            Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Meeting Progress</span>
                <span className="text-sm text-gray-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-700" />
            </div>
            
            {currentSpeaker && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Current Speaker:</span>
                <Badge className="bg-purple-600/20 text-purple-300">
                  {currentSpeaker}
                </Badge>
              </div>
            )}
            
            {motionStatus && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Motion Status:</span>
                <Badge className="bg-blue-600/20 text-blue-300">
                  {motionStatus}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="bg-gray-800/50 border-purple-500/30 mb-6">
        <CardHeader>
          <CardTitle>📜 Sacred Discourse</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 rounded-lg border ${getMessageStyle(message.type)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-300">{message.speaker}</span>
                      <Badge className="bg-gray-600/20 text-gray-300 text-xs">
                        {message.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-100">{message.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Voting Results */}
      {Object.keys(votes).length > 0 && (
        <Card className="bg-gray-800/50 border-green-500/30 mb-6">
          <CardHeader>
            <CardTitle>🗳️ Voting Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(votes).map(([speaker, vote]) => (
                <div key={speaker} className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                  <span className="text-sm">{speaker}</span>
                  <Badge className={vote === 'aye' ? 'bg-green-600/20 text-green-300' : 'bg-red-600/20 text-red-300'}>
                    {vote.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Input */}
      <Card className="bg-gray-800/50 border-amber-500/30">
        <CardHeader>
          <CardTitle>💬 Speak as The Questioner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Your question or observation..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
              className="bg-gray-700/50 border-gray-600"
            />
            <Button 
              onClick={handleUserMessage}
              className="bg-amber-600 hover:bg-amber-700"
            >
              🗣️ Speak
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}