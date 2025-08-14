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
  // Podcast states
  const [podcastStatus, setPodcastStatus] = useState('not_started');
  const [podcastProgress, setPodcastProgress] = useState(0);
  const [podcastInfo, setPodcastInfo] = useState(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  
  // Audio mode states
  const [audioMode, setAudioMode] = useState('none'); // 'streaming', 'none', 'podcast'
  const [isStreamingAudio, setIsStreamingAudio] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState(0);
  const [speakerWeights, setSpeakerWeights] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [conversationQueue, setConversationQueue] = useState([]);
  
  // Audio streaming states
  const [audioContext, setAudioContext] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
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

  const createMeeting = async (topicData, selectedAudioMode = 'none') => {
    try {
      setIsProcessing(true);
      setCurrentPhase('creating');
      setAudioMode(selectedAudioMode);
      
      const response = await axios.post(`${API}/meetings`, {
        topic: topicData.topic,
        description: topicData.description,
        proposer: topicData.proposedBy,
        is_creation_task: topicData.isCreationTask || false,
        persona_api_keys: topicData.personaApiKeys,
        audio_mode: selectedAudioMode
      });
      
      setMeetingId(response.data.id);
      
      // Show different messages based on audio mode
      if (selectedAudioMode === 'streaming') {
        addMessage("System", "🏛️🎵 The Parliamentarium is now in session with real-time audio streaming...", "system");
        setIsStreamingAudio(true);
      } else if (selectedAudioMode === 'podcast') {
        addMessage("System", "🏛️🎙️ The Parliamentarium is now in session. Podcast will be ready when conversation finishes...", "system");
      } else {
        addMessage("System", "🏛️ The Parliamentarium is now in session. Initializing sacred discourse...", "system");
      }
      
      // Show persona API key configuration if provided
      if (topicData.personaApiKeys) {
        addMessage("System", "⚙️ Custom persona API key assignments loaded for enhanced reliability.", "system");
      }
      
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
      // Start analysis automatically for non-streaming modes
      if (audioMode !== 'streaming') {
        setTimeout(() => analyzeIdea(0), 2000);
      }
      
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

  const analyzeIdea = async (ideaIndex) => {
    try {
      setIsProcessing(true);
      setCurrentPhase('analysis');
      setCurrentIdeaIndex(ideaIndex);
      
      addMessage("The EGO", `🔍 Initiating analysis of idea ${ideaIndex + 1}...`, "system");
      
      let response;
      
      // Use weighted analysis if in streaming mode with speaker weights
      if (audioMode === 'streaming' && Object.keys(speakerWeights).length > 0) {
        response = await axios.post(`${API}/meetings/${meetingId}/analyze-idea-weighted/${ideaIndex}`, {
          speaker_weights: speakerWeights
        });
      } else {
        // Use traditional analysis
        response = await axios.post(`${API}/meetings/${meetingId}/analyze-idea/${ideaIndex}`);
      }
      
      const updatedIdeas = response.data.ideas;
      setIdeas(updatedIdeas);
      
      // Add analysis messages
      const analyzedIdea = updatedIdeas[ideaIndex];
      if (analyzedIdea.analyses) {
        analyzedIdea.analyses.forEach(analysis => {
          const weightIndicator = audioMode === 'streaming' && analysis.weight !== 0 
            ? ` (Weight: ${analysis.weight > 0 ? '+' : ''}${analysis.weight})` 
            : '';
          addMessage(
            analysis.persona_name, 
            `Score: ${analysis.score}/10${weightIndicator} - ${analysis.reasoning}`, 
            "analysis"
          );
        });
      }
      
      addMessage("System", `✅ Analysis complete! Average score: ${analyzedIdea.average_score}/10`, "system");
      
      // Auto-proceed to next idea or finalization
      if (ideaIndex < ideas.length - 1) {
        setTimeout(() => analyzeIdea(ideaIndex + 1), 2000);
      } else {
        setTimeout(() => finalizeMeeting(meetingId), 2000);
      }
      
    } catch (error) {
      console.error('Error analyzing idea:', error);
      addMessage("System", "❌ Analysis failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
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

  const startPodcastGeneration = async () => {
    if (!meetingId) return;
    
    try {
      setIsGeneratingPodcast(true);
      setPodcastStatus('generating');
      setPodcastProgress(0);
      
      addMessage("System", "🎙️ Starting podcast generation with AI voices...", "system");
      
      const response = await axios.post(`${API}/meetings/${meetingId}/generate-podcast`);
      
      if (response.data.success) {
        // Start polling for progress
        pollPodcastProgress();
      } else {
        throw new Error(response.data.error || "Unknown error");
      }
    } catch (error) {
      console.error('Error starting podcast generation:', error);
      setPodcastStatus('failed');
      addMessage("System", "❌ Failed to start podcast generation. Please try again.", "error");
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  const pollPodcastProgress = () => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API}/meetings/${meetingId}/podcast-status`);
        const { generation_progress, generation_status, podcast_info } = response.data;
        
        setPodcastProgress(generation_progress || 0);
        
        if (generation_status === 'completed') {
          setPodcastStatus('completed');
          setPodcastInfo(podcast_info);
          clearInterval(interval);
          addMessage("System", "✅ Podcast generation completed! Ready for download.", "system");
        } else if (generation_status === 'failed') {
          setPodcastStatus('failed');
          clearInterval(interval);
          addMessage("System", "❌ Podcast generation failed.", "error");
        }
      } catch (error) {
        console.error('Error polling podcast progress:', error);
        clearInterval(interval);
        setPodcastStatus('failed');
      }
    }, 2000);
    
    return interval;
  };

  const streamPodcast = async () => {
    if (!meetingId || !podcastInfo) return;
    
    try {
      const response = await axios.get(`${API}/meetings/${meetingId}/stream-podcast`, {
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create and play audio with streaming
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      audio.play();
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        console.error('Error playing streamed audio');
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };
      
    } catch (error) {
      console.error('Error streaming podcast:', error);
      addMessage("System", "❌ Failed to stream podcast audio.", "error");
    }
  };

  const startNewMeetingFromWinner = () => {
    if (!finalReport?.winning_idea) return;
    
    const newMeetingData = {
      topic: `Follow-up: ${finalReport.winning_idea.idea}`,
      description: `Previous winning idea: "${finalReport.winning_idea.idea}"\n\nFollow-up questions from last session:\n${finalReport.follow_up_questions}`,
      proposedBy: "Parliament Continuation",
      isCreationTask: false,
      uploadedFiles: [],
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentMeeting', JSON.stringify(newMeetingData));
    navigate('/');
  };

  const toggleStreamingMode = () => {
    if (audioMode === 'streaming') {
      setAudioMode('none');
      setIsStreamingAudio(false);
    } else {
      setAudioMode('streaming');
      setIsStreamingAudio(true);
      // Initialize conversation queue with personas
      const personas = [
        "mouse", "dolphin", "patternist", "superscholar", "diviner", 
        "naysayer", "illustrator", "id", "ego", "superego", "contextualist"
      ];
      setConversationQueue(personas);
      setCurrentSpeaker(0);
      // Initialize weights to 0
      const initialWeights = {};
      personas.forEach(persona => {
        initialWeights[persona] = 0;
      });
      setSpeakerWeights(initialWeights);
    }
  };

  const updateSpeakerWeight = (personaId, weight) => {
    setSpeakerWeights(prev => ({
      ...prev,
      [personaId]: weight
    }));
  };

  const nextSpeaker = () => {
    if (currentSpeaker < conversationQueue.length - 1) {
      setCurrentSpeaker(currentSpeaker + 1);
    } else {
      setCurrentSpeaker(0); // Loop back to first speaker
    }
    setIsPlaying(false);
  };

  const playCurrentSpeaker = async () => {
    if (!conversationQueue[currentSpeaker]) return;
    
    setIsPlaying(true);
    const personaId = conversationQueue[currentSpeaker];
    
    try {
      // Generate speech for current speaker with weight influence
      const response = await axios.post(`${API}/meetings/${meetingId}/generate-speaker-audio`, {
        persona_id: personaId,
        weight: speakerWeights[personaId] || 0,
        context: meetingData?.topic || "Current discussion"
      });
      
      if (response.data.audio_url) {
        // Play audio
        const audio = new Audio(response.data.audio_url);
        setCurrentAudio(audio);
        audio.play();
        audio.onended = () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        };
      }
    } catch (error) {
      console.error('Error playing speaker audio:', error);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  const downloadPodcast = async () => {
    if (!meetingId) return;
    
    try {
      const response = await axios.get(`${API}/meetings/${meetingId}/download-podcast`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parliamentarium_podcast_${meetingId}.mp3`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      addMessage("System", "📥 Podcast download started!", "system");
    } catch (error) {
      console.error('Error downloading podcast:', error);
      addMessage("System", "❌ Failed to download podcast.", "error");
    }
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
                  <div className="text-gray-100">
                    {/* Parse and display content with images */}
                    {message.content.split('\n').map((line, lineIndex) => {
                      // Check if line contains an image URL
                      if (line.includes('🎨 **Generated Illustration**:')) {
                        const imageUrl = line.split('🎨 **Generated Illustration**: ')[1];
                        return (
                          <div key={lineIndex} className="my-3">
                            <div className="text-purple-300 font-semibold mb-2">🎨 Generated Illustration:</div>
                            <img 
                              src={imageUrl} 
                              alt="Generated illustration" 
                              className="max-w-full h-auto rounded-lg border border-purple-500/30 shadow-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={{display: 'none'}} className="text-red-400 text-sm">
                              [Image failed to load]
                            </div>
                          </div>
                        );
                      } else if (line.includes('*Image prompt:')) {
                        return (
                          <div key={lineIndex} className="text-xs text-gray-400 italic mt-1">
                            {line}
                          </div>
                        );
                      } else {
                        return <div key={lineIndex}>{line}</div>;
                      }
                    })}
                  </div>
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
              
              {/* Summary Image */}
              {finalReport.summary_image && (
                <div>
                  <h3 className="font-semibold text-purple-400 mb-2">🎨 Project Summary Visualization</h3>
                  <div className="bg-purple-900/20 p-3 rounded">
                    <img 
                      src={finalReport.summary_image.url} 
                      alt="Project Summary Visualization" 
                      className="w-full max-w-2xl h-auto rounded-lg border border-purple-500/30 shadow-lg mx-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{display: 'none'}} className="text-red-400 text-sm text-center">
                      [Summary image failed to load]
                    </div>
                    <div className="text-xs text-purple-300 mt-2 text-center">
                      Generated from: {finalReport.summary_image.prompt}
                    </div>
                  </div>
                </div>
              )}
              
              {/* New Meeting Button */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <Button
                  onClick={startNewMeetingFromWinner}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  🔄 Start New Meeting with This Idea
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Mode Selection */}
      {!meetingId && (
        <Card className="bg-gray-800/50 border-cyan-500/30 mb-6">
          <CardHeader>
            <CardTitle>🎵 Choose Conversation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Streaming Audio Mode */}
              <div className="group relative">
                <Button
                  onClick={() => {
                    const meetingData = JSON.parse(localStorage.getItem('currentMeeting') || '{}');
                    createMeeting(meetingData, 'streaming');
                  }}
                  className="w-full h-16 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex flex-col items-center justify-center"
                  disabled={isProcessing}
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
                  onClick={() => {
                    const meetingData = JSON.parse(localStorage.getItem('currentMeeting') || '{}');
                    createMeeting(meetingData, 'none');
                  }}
                  className="w-full h-16 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 flex flex-col items-center justify-center"
                  disabled={isProcessing}
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
                  onClick={() => {
                    const meetingData = JSON.parse(localStorage.getItem('currentMeeting') || '{}');
                    createMeeting(meetingData, 'podcast');
                  }}
                  className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex flex-col items-center justify-center"
                  disabled={isProcessing}
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
      )}

      {/* Streaming Audio Controls */}
      {audioMode === 'streaming' && meetingId && (
        <Card className="bg-gray-800/50 border-cyan-500/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎛️ Streaming Audio Control
              <Button
                onClick={toggleStreamingMode}
                variant="destructive"
                size="sm"
              >
                Exit Streaming
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Speaker Display */}
              <div className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-cyan-300">
                    🗣️ Current Speaker: {conversationQueue[currentSpeaker]?.toUpperCase() || "None"}
                  </h3>
                  <Badge className="bg-cyan-600/20 text-cyan-300">
                    {currentSpeaker + 1} of {conversationQueue.length}
                  </Badge>
                </div>
                
                {/* Speaker Weight Control */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm text-cyan-200 min-w-[100px]">
                    Influence Weight:
                  </label>
                  <select
                    value={speakerWeights[conversationQueue[currentSpeaker]] || 0}
                    onChange={(e) => updateSpeakerWeight(conversationQueue[currentSpeaker], parseInt(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white"
                  >
                    {Array.from({length: 23}, (_, i) => i - 11).map(weight => (
                      <option key={weight} value={weight}>
                        {weight > 0 ? '+' : ''}{weight} ({weight === -11 ? '-20' : weight === 11 ? '+20' : weight < 0 ? weight * 1.8 : weight * 1.8})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-400">
                    (-11 = -20 influence, +11 = +20 influence)
                  </span>
                </div>
                
                {/* Audio Controls */}
                <div className="flex gap-3">
                  <Button
                    onClick={playCurrentSpeaker}
                    disabled={isPlaying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isPlaying ? "🔊 Playing..." : "▶️ Play Speaker"}
                  </Button>
                  <Button
                    onClick={stopAudio}
                    disabled={!isPlaying}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    ⏹️ Stop
                  </Button>
                  <Button
                    onClick={nextSpeaker}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    ⏭️ Next Speaker
                  </Button>
                </div>
              </div>
              
              {/* Speaker Weights Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {conversationQueue.map((personaId, index) => (
                  <div
                    key={personaId}
                    className={`p-2 rounded text-xs ${
                      index === currentSpeaker 
                        ? 'bg-cyan-600/30 border border-cyan-400' 
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="font-medium">{personaId.toUpperCase()}</div>
                    <div className="text-gray-400">
                      Weight: {speakerWeights[personaId] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podcast Generation Section */}
      {(currentPhase === 'completed' || finalReport) && (
        <Card className="bg-gray-800/50 border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎙️ Generate Parliamentary Podcast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="text-sm font-medium text-purple-300 mb-3">🎧 Immersive Audio Experience</h4>
                <div className="text-xs text-purple-200 space-y-2">
                  <div>• Each AI persona speaks with their own unique voice</div>
                  <div>• Complete summary of the parliamentary session</div>
                  <div>• Professional podcast format with segments</div>
                  <div>• Download as MP3 file for offline listening</div>
                </div>
              </div>

              {podcastStatus === 'not_started' && (
                <Button
                  onClick={startPodcastGeneration}
                  disabled={isGeneratingPodcast}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  🎙️ Generate Podcast with AI Voices
                </Button>
              )}

              {podcastStatus === 'generating' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Generating Podcast Audio...</span>
                    <span className="text-sm text-gray-400">{podcastProgress}%</span>
                  </div>
                  <Progress value={podcastProgress} className="h-3 bg-gray-700">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" 
                         style={{width: `${podcastProgress}%`}} />
                  </Progress>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>🔊 Generating unique voices for each persona...</div>
                    <div>🎵 Combining audio segments into podcast...</div>
                    <div>📦 Preparing final audio file...</div>
                  </div>
                </div>
              )}

              {podcastStatus === 'completed' && podcastInfo && (
                <div className="space-y-4">
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
                    <h4 className="text-green-300 font-medium mb-2">✅ Podcast Ready!</h4>
                    <div className="text-sm text-green-200 space-y-1">
                      <div>🎧 <strong>{podcastInfo.title}</strong></div>
                      <div>⏱️ Duration: ~{podcastInfo.estimated_duration} minutes</div>
                      <div>📁 File Size: {podcastInfo.file_size}</div>
                      <div>🗣️ {podcastInfo.total_segments} unique voice segments</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      onClick={streamPodcast}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      🎵 Stream Now
                    </Button>
                    <Button
                      onClick={downloadPodcast}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      📥 Download MP3
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Show podcast details
                        alert(`Podcast Segments:\n${podcastInfo.script.script_segments.map(s => `• ${s.segment_title} (${s.persona_name})`).join('\n')}`);
                      }}
                      className="border-purple-500 text-purple-300 hover:bg-purple-800"
                    >
                      📋 Show Segments
                    </Button>
                    {currentAudio && (
                      <Button
                        onClick={stopAudio}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        ⏹️ Stop Audio
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {podcastStatus === 'failed' && (
                <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                  <div className="text-red-300 text-sm">
                    ❌ Podcast generation failed. Please try again.
                  </div>
                  <Button
                    onClick={startPodcastGeneration}
                    className="mt-3 bg-red-600 hover:bg-red-700"
                  >
                    🔄 Retry Podcast Generation
                  </Button>
                </div>
              )}
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