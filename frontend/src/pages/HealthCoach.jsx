import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, MessageCircle, Send, Volume2, VolumeX, Loader2, Mic, MicOff, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const HealthCoach = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [coachName, setCoachName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  
  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCoachStatus();
    
    // Load saved coach name
    const savedName = localStorage.getItem('tokhealth_coach_name');
    if (savedName) {
      setCoachName(savedName);
    } else {
      setCoachName('Health Coach');
    }
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      setVoiceEnabled(false);
    }
    
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in browser settings.');
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!speechSupported) {
      toast.error('Voice input not supported in this browser');
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... speak now');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const saveCoachName = () => {
    const newName = tempName.trim() || 'Health Coach';
    setCoachName(newName);
    localStorage.setItem('tokhealth_coach_name', newName);
    setIsEditingName(false);
    toast.success(`Your coach is now named "${newName}"!`);
  };

  const fetchCoachStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/status`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setCurrentStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching coach status:', error);
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handlePhotoAnalysis = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setAnalyzingPhoto(true);
    const userMsg = {
      sender: 'user',
      text: `[Sent a photo: ${file.name}]`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('tokhealth_token');
      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/analyze-lab`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        const coachMsg = {
          sender: 'coach',
          text: `Here's what I see in your photo:\n\n${data.data.analysis}\n\nWould you like me to explain anything further?`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, coachMsg]);
        if (voiceEnabled) speakText(coachMsg.text);
      } else {
        setMessages(prev => [...prev, { sender: 'coach', text: 'I had trouble analyzing that image. Could you try again with a clearer photo?', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'coach', text: 'Sorry, I couldn\'t process that photo right now. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setAnalyzingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: inputMessage,
          session_id: sessionId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const coachMsg = {
          sender: 'coach',
          text: data.data.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, coachMsg]);
        
        // Auto-speak coach response if voice enabled
        if (voiceEnabled) {
          setTimeout(() => speakText(data.data.response), 300);
        }
      } else {
        toast.error('Coach is unavailable right now');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Could not reach the coach');
      
      // Add a fallback response
      setMessages(prev => [...prev, {
        sender: 'coach',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBorder = (zone) => {
    if (zone === 'green') return 'border-green-400';
    if (zone === 'yellow') return 'border-yellow-400';
    if (zone === 'red') return 'border-red-400';
    return 'border-slate-300';
  };

  return (
    <div className="p-4" data-testid="health-coach">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Brain className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{coachName}</h1>
            {voiceEnabled && <Volume2 className="w-4 h-4 text-emerald-500" />}
          </div>
          <Button
            onClick={() => {
              setIsEditingName(true);
              setTempName(coachName === 'Health Coach' ? '' : coachName);
            }}
            variant="ghost"
            size="sm"
            className="text-slate-500 text-xs"
          >
            Rename Coach
          </Button>
          <p className="text-slate-500 text-sm">AI-Powered • Voice + Text</p>
        </div>

        {/* Name Your Coach Dialog */}
        {isEditingName && (
          <Card className="bg-white border-2 border-sky-400 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Name Your Coach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="e.g., Hope, Dr. Sarah, Coach Mike..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-white border-slate-200 text-slate-800"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') saveCoachName();
                }}
              />
              <div className="flex space-x-2">
                <Button onClick={saveCoachName} className="flex-1 bg-sky-600 hover:bg-sky-700 text-sm">
                  Save
                </Button>
                <Button onClick={() => setIsEditingName(false)} variant="outline" className="border-slate-300 text-sm">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Voice Control */}
        <div className="flex items-center justify-between bg-white/80 rounded-lg p-3 border border-sky-200">
          <div className="flex items-center space-x-2">
            {voiceEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-slate-700 text-sm">Voice: {voiceEnabled ? 'ON' : 'OFF'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <Button onClick={stopSpeaking} variant="outline" size="sm" className="border-rose-300 text-rose-600 text-xs">
                Stop
              </Button>
            )}
            <Button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              variant="outline"
              size="sm"
              className={voiceEnabled ? 'border-emerald-300 text-emerald-600 text-xs' : 'border-slate-300 text-slate-500 text-xs'}
            >
              {voiceEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>

        {/* Current Status */}
        {currentStatus && (
          <Card className={`bg-white/90 border-2 ${getStatusBorder(currentStatus.overall_zone)}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-slate-700 font-medium">{currentStatus.message}</p>
              </div>
              <span className="text-2xl">
                {currentStatus.overall_zone === 'green' && '🟢'}
                {currentStatus.overall_zone === 'yellow' && '🟡'}
                {currentStatus.overall_zone === 'red' && '🔴'}
                {currentStatus.overall_zone === 'gray' && '⚪'}
              </span>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 flex items-center text-sm">
              <MessageCircle className="w-4 h-4 mr-2 text-sky-600" />
              Chat with {coachName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Messages */}
            <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <Brain className="w-10 h-10 text-sky-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Start a conversation</p>
                  <p className="text-slate-400 text-xs">Ask anything about health!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex flex-col max-w-[85%]">
                      <div
                        className={`p-3 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-sky-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      {msg.sender === 'coach' && voiceEnabled && (
                        <Button
                          onClick={() => speakText(msg.text)}
                          variant="ghost"
                          size="sm"
                          className="text-sky-600 text-xs mt-1 self-start p-1 h-auto"
                        >
                          <Volume2 className="w-3 h-3 mr-1" />
                          Speak
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 p-3 rounded-lg border border-slate-200 flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              {/* Camera Button */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoAnalysis}
                className="hidden"
                data-testid="coach-photo-input"
              />
              <Button
                onClick={() => photoInputRef.current?.click()}
                variant="outline"
                className="border-sky-300 text-sky-600 hover:bg-sky-50"
                disabled={loading || analyzingPhoto}
                data-testid="coach-camera-btn"
              >
                {analyzingPhoto ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              </Button>

              {/* Microphone Button */}
              {speechSupported && (
                <Button
                  onClick={toggleListening}
                  variant={isListening ? 'default' : 'outline'}
                  className={isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'border-sky-300 text-sky-600 hover:bg-sky-50'
                  }
                  disabled={loading}
                  data-testid="voice-input-btn"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              )}
              
              <Textarea
                placeholder={isListening ? 'Listening...' : `Ask ${coachName} anything...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-white border-slate-200 text-slate-800 flex-1 text-sm"
                rows={2}
                disabled={loading || isListening}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Topics */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm">Quick Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setInputMessage('How can I improve my nutrition?')}
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs py-2"
                disabled={loading}
              >
                Nutrition
              </Button>
              <Button
                onClick={() => setInputMessage('What exercise should I do?')}
                variant="outline"
                className="border-sky-300 text-sky-700 hover:bg-sky-50 text-xs py-2"
                disabled={loading}
              >
                Exercise
              </Button>
              <Button
                onClick={() => setInputMessage('Help me manage stress')}
                variant="outline"
                className="border-violet-300 text-violet-700 hover:bg-violet-50 text-xs py-2"
                disabled={loading}
              >
                Stress
              </Button>
              <Button
                onClick={() => setInputMessage('Tips for better sleep')}
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-xs py-2"
                disabled={loading}
              >
                Sleep
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - AI Health Guidance
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthCoach;
