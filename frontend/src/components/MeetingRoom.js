import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Progress } from "../components/ui/progress";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MeetingRoom() {
  const [meetingData, setMeetingData] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('creating');
  const [messages, setMessages] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [currentIdeaIndex, setCurrentIdeaIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [progress, setProgress] = useState(0);
  const [userMessage, setUserMessage] = useState("");
  const [isCreationTask, setIsCreationTask] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentMeeting');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMeetingData(parsed);
      setIsCreationTask(parsed.isCreationTask || false);
      setUploadedFiles(parsed.uploadedFiles || []);
      createMeeting(parsed);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const createMeeting = async (topicData) => {
    try {
      setIsProcessing(true);
      setCurrentPhase('creating');
      
      const response = await axios.post(`${API}/meetings`, {
        topic: topicData.topic,
        description: topicData.description,
        proposer: topicData.proposedBy,
        is_creation_task: topicData.isCreationTask || false
      });
      
      setMeetingId(response.data.id);
      addMessage("System", "🏛️ The Parliamentarium is now in session. Initializing sacred discourse...", "system");
      
      // If creation task with files, upload them first
      if (topicData.isCreationTask && topicData.uploadedFiles && topicData.uploadedFiles.length > 0) {
        await uploadFiles(response.data.id, topicData.uploadedFiles);
      }
      
      // Start deliberation
      await startDeliberation(response.data.id);
    } catch (error) {
      console.error('Error creating meeting:', error);
      addMessage("System", "❌ Failed to convene the parliament. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadFiles = async (sessionId, files) => {
    try {
      addMessage("System", `📁 Uploading ${files.length} reference files for the creation task...`, "system");
      
      const fileContents = files.map(file => file.content);
      await axios.post(`${API}/meetings/${sessionId}/upload-files`, fileContents);
      
      addMessage("System", `✅ Successfully uploaded ${files.length} files for council reference.`, "system");
    } catch (error) {
      console.error('Error uploading files:', error);
      addMessage("System", "⚠️ Some files failed to upload, but proceeding with deliberation.", "error");
    }
  };

  const startDeliberation = async (sessionId) => {
    try {
      setIsProcessing(true);
      setCurrentPhase('inspiration');
      setProgress(10);
      
      addMessage("The EGO", "🔮 Gathering inspiration from all council members...", "system");
      
      const response = await axios.post(`${API}/meetings/${sessionId}/start-deliberation`);
      setIdeas(response.data.ideas);
      
      addMessage("The EGO", `✨ ${response.data.ideas.length} unique ideas have been gathered from the council. Now begins the sacred analysis...`, "system");
      setProgress(25);
      
      // Start analyzing ideas
      await analyzeAllIdeas(sessionId, response.data.ideas);
    } catch (error) {
      console.error('Error starting deliberation:', error);
      addMessage("System", "❌ Failed to gather council wisdom. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeAllIdeas = async (sessionId, ideasList) => {
    try {
      setCurrentPhase('analysis');
      
      for (let i = 0; i < ideasList.length; i++) {
        const idea = ideasList[i];
        setCurrentIdeaIndex(i);
        
        addMessage("The EGO", `🔍 Now analyzing: "${idea.idea}" (proposed by ${idea.persona_name})`, "motion");
        
        const response = await axios.post(`${API}/meetings/${sessionId}/analyze-idea/${i}`);
        const analyzedIdea = response.data.analyzed_idea;
        
        // Update ideas state
        setIdeas(prev => {
          const updated = [...prev];
          updated[i] = analyzedIdea;
          return updated;
        });
        
        // Show analysis results
        addMessage("The EGO", `📊 Analysis complete! Average score: ${analyzedIdea.average_score}/10`, "voting");
        
        // Show some persona responses
        if (analyzedIdea.scores && analyzedIdea.scores.length > 0) {
          const sampleResponses = analyzedIdea.scores.slice(0, 3);
          sampleResponses.forEach(score => {
            addMessage(score.persona_name, `${score.analysis} (Score: ${score.score}/10)`, "discussion");
          });
        }
        
        setProgress(25 + (i + 1) * (50 / ideasList.length));
        
        // Small delay between analyses
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Finalize meeting
      await finalizeMeeting(sessionId);
    } catch (error) {
      console.error('Error analyzing ideas:', error);
      addMessage("System", "❌ Error during analysis phase. Please try again.", "error");
    }
  };

  const finalizeMeeting = async (sessionId) => {
    try {
      setCurrentPhase('finalization');
      setProgress(80);
      
      addMessage("The EGO", "⚖️ Selecting the champion idea and preparing final report...", "system");
      
      const response = await axios.post(`${API}/meetings/${sessionId}/finalize`);
      setFinalReport(response.data.final_report);
      
      const winner = response.data.final_report.winning_idea;
      addMessage("The EGO", `🏆 The council has spoken! Winner: "${winner.idea}" (${winner.persona_name}) - Score: ${winner.average_score}/10`, "conclusion");
      
      setCurrentPhase('completed');
      setProgress(100);
      
    } catch (error) {
      console.error('Error finalizing meeting:', error);
      addMessage("System", "❌ Error during finalization. Please try again.", "error");
    }
  };

  const addMessage = (speaker, content, type = 'discussion') => {
    const message = {
      id: Date.now(),
      speaker,
      content,
      timestamp: new Date().toISOString(),
      type
    };
    setMessages(prev => [...prev, message]);
  };

  const handleUserMessage = () => {
    if (!userMessage.trim()) return;
    
    addMessage("The Questioner", userMessage, "user");
    setUserMessage("");
    
    // Simple acknowledgment for now
    setTimeout(() => {
      addMessage("The EGO", "The council acknowledges your input, mortal observer.", "response");
    }, 1000);
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
      conclusion: 'bg-yellow-900/30 border-yellow-500/30',
      user: 'bg-amber-900/30 border-amber-500/30',
      error: 'bg-red-900/30 border-red-500/30'
    };
    return styles[type] || styles.discussion;
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      creating: '🏗️',
      inspiration: '💡',
      analysis: '🔍',
      main_improvements: '✨',
      scaffolding: '🏗️',
      section_assignment: '📋',
      section_creation: '✍️',
      main_document: '📘',
      supplemental_creation: '📑',
      finalization: '⚖️',
      final_integration: '🔮',
      completed: '✅',
      deliverable_ready: '📦'
    };
    return icons[phase] || '🔮';
  };

  const getPhaseTitle = (phase) => {
    const titles = {
      creating: 'Convening Parliament',
      inspiration: 'Gathering Ideas',
      analysis: 'Sacred Analysis',
      main_improvements: 'Enhancing Main Idea',
      scaffolding: 'Creating Project Structure',
      section_assignment: 'Assigning Work Sections',
      section_creation: 'Collaborative Creation',
      main_document: 'Document Integration',
      supplemental_creation: 'Supplemental Works',
      finalization: 'Final Deliberation',
      final_integration: 'Master Integration',
      completed: 'Session Complete',
      deliverable_ready: 'Deliverable Ready'
    };
    return titles[phase] || 'Processing';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isCreationTask ? '🎨 The Parliamentarium Creation Studio' : '🏛️ The Parliamentarium Session'}
          </h1>
          <p className="text-gray-300">
            Topic: {meetingData?.topic || 'Loading...'}
            {isCreationTask && (
              <span className="ml-2 px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                Creation Task
              </span>
            )}
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

      {/* Creation Task Info */}
      {isCreationTask && uploadedFiles.length > 0 && (
        <Card className="bg-gray-800/50 border-blue-500/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📁 Reference Materials ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-3">
                  <div className="text-blue-400">📄</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meeting Status */}
      <Card className="bg-gray-800/50 border-purple-500/30 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPhaseIcon(currentPhase)} 
            Current Phase: {getPhaseTitle(currentPhase)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {isCreationTask ? 'Creation Progress' : 'Meeting Progress'}
                </span>
                <span className="text-sm text-gray-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-700" />
            </div>
            
            {isCreationTask && (
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/30">
                <h4 className="text-sm font-medium text-blue-300 mb-2">🎨 Creation Workflow Active</h4>
                <div className="text-xs text-blue-200 space-y-1">
                  <div>• Parliament will first deliberate and select the best approach</div>
                  <div>• Contextualist will create project scaffolding and assign sections</div>
                  <div>• Each persona will contribute their expertise to create sections</div>
                  <div>• All work will be integrated into a comprehensive deliverable</div>
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                <span className="text-sm text-gray-400">Processing...</span>
              </div>
            )}
            
            {currentPhase === 'analysis' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Analyzing Idea:</span>
                <Badge className="bg-blue-600/20 text-blue-300">
                  {currentIdeaIndex + 1} of {ideas.length}
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

      {/* Ideas Summary */}
      {ideas.length > 0 && (
        <Card className="bg-gray-800/50 border-green-500/30 mb-6">
          <CardHeader>
            <CardTitle>💡 Council Ideas & Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ideas.map((idea, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
                  <div className="flex-1">
                    <div className="font-semibold text-purple-300">{idea.persona_name}</div>
                    <div className="text-sm text-gray-300 mt-1">{idea.idea}</div>
                  </div>
                  <div className="text-right">
                    <Badge className={`ml-2 ${idea.average_score >= 7 ? 'bg-green-600/20 text-green-300' : 
                      idea.average_score >= 5 ? 'bg-yellow-600/20 text-yellow-300' : 
                      'bg-red-600/20 text-red-300'}`}>
                      {idea.average_score > 0 ? `${idea.average_score}/10` : 'Analyzing...'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Report */}
      {finalReport && (
        <Card className="bg-gray-800/50 border-gold-500/30 mb-6">
          <CardHeader>
            <CardTitle>🏆 Final Parliamentary Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">Winning Idea</h3>
                <div className="bg-yellow-900/20 p-3 rounded">
                  <div className="font-bold">{finalReport.winning_idea.persona_name}</div>
                  <div className="text-sm mt-1">{finalReport.winning_idea.idea}</div>
                  <div className="text-xs text-yellow-400 mt-2">Score: {finalReport.winning_idea.average_score}/10</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">Implementation Plan</h3>
                <div className="bg-blue-900/20 p-3 rounded text-sm whitespace-pre-wrap">
                  {finalReport.implementation_plan}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-green-400 mb-2">Follow-up Questions</h3>
                <div className="bg-green-900/20 p-3 rounded text-sm whitespace-pre-wrap">
                  {finalReport.follow_up_questions}
                </div>
              </div>
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