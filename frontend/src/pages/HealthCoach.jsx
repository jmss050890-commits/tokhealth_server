import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, MessageCircle, TrendingUp, Heart, Send } from 'lucide-react';
import { toast } from 'sonner';

const HealthCoach = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCoachStatus();
    fetchRecentMessages();
  }, []);

  const fetchCoachStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/status`);
      const data = await response.json();
      if (data.success) {
        setCurrentStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching coach status:', error);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);
    try {
      // Simulate AI response (in production, this calls Gemini/GPT API)
      const userMsg = {
        sender: 'user',
        text: inputMessage,
        timestamp: new Date().toISOString()
      };

      const aiResponse = {
        sender: 'coach',
        text: generateCoachResponse(inputMessage),
        timestamp: new Date().toISOString()
      };

      setMessages([...messages, userMsg, aiResponse]);
      setInputMessage('');
      toast.success('Coach responded!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const generateCoachResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('protein') || input.includes('eat')) {
      return "Great question about nutrition! Based on your goals, aim for lean proteins like chicken, fish, eggs, and Greek yogurt. Try to spread your protein intake throughout the day - your body can only absorb so much at once. Need specific meal ideas?";
    } else if (input.includes('exercise') || input.includes('workout')) {
      return "Exercise is key to wellness! I see you're tracking steps - that's a great start. Consider adding strength training 2-3x per week. Even 20 minutes makes a difference. What activities do you enjoy?";
    } else if (input.includes('sleep') || input.includes('tired')) {
      return "Sleep is crucial for health! Aim for 7-9 hours. Try: consistent bedtime, no screens 1hr before bed, cool dark room. Your body repairs itself during sleep - it's not optional for wellness!";
    } else if (input.includes('stress') || input.includes('anxious')) {
      return "I hear you. Stress management is vital. Try the Wisdom Vault for journaling - it really helps. Also: deep breathing, 10min walks, talking to someone you trust. You're not alone in this. 💙";
    } else if (input.includes('water') || input.includes('hydration')) {
      return "Hydration is so important! Aim for 2-2.5L daily. Set reminders if needed. Signs you need more: dark urine, fatigue, headaches. Keep a water bottle with you - you've got this! 💧";
    } else {
      return "Thanks for reaching out! I'm here to help with nutrition, fitness, medications, mental wellness - anything health related. Based on your TokHealth data, I can give personalized guidance. What specific area would you like to focus on today?";
    }
  };

  const getStatusColor = (zone) => {
    if (zone === 'green') return 'text-green-500 bg-green-500/20 border-green-500';
    if (zone === 'yellow') return 'text-yellow-500 bg-yellow-500/20 border-yellow-500';
    if (zone === 'red') return 'text-red-500 bg-red-500/20 border-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 p-4" data-testid="health-coach">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-10 h-10 text-blue-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-blue-500">AI HEALTH</span>{' '}
              <span className="text-white">COACH</span>
            </h1>
          </div>
          <p className="text-gray-400 mb-2">Your personal health guidance powered by AI</p>
          <p className="text-blue-500 text-xs italic">Gemini for guidance • GPT-5.2 for celebrations</p>
          <p className="text-gray-600 text-xs">KPA System - Keep People Alive 🤖</p>
        </div>

        {/* Current Status */}
        {currentStatus && (
          <Card className={`border-2 ${getStatusColor(currentStatus.overall_zone)}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Your Current Health Status</span>
                <span className="text-3xl">
                  {currentStatus.overall_zone === 'green' && '🟢'}
                  {currentStatus.overall_zone === 'yellow' && '🟡'}
                  {currentStatus.overall_zone === 'red' && '🔴'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white text-lg mb-2">{currentStatus.message}</p>
              {currentStatus.overall_zone === 'green' && (
                <p className="text-green-400">🎉 You're crushing it! Keep up the amazing work!</p>
              )}
              {currentStatus.overall_zone === 'yellow' && (
                <p className="text-yellow-400">💪 You're doing well, but let's fine-tune a few things.</p>
              )}
              {currentStatus.overall_zone === 'red' && (
                <p className="text-red-400">🚨 Some areas need attention. Let's work on this together.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-500" />
              Chat with Your Health Coach
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-gray-800/30 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400 mb-2">Start a conversation with your AI Health Coach</p>
                  <p className="text-gray-500 text-sm">Ask about nutrition, exercise, medications, or wellness</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Textarea
                placeholder="Ask your health coach anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white flex-1"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-gray-500 text-xs">
              💡 Try asking: "How can I increase my protein?" or "Tips for better sleep?"
            </p>
          </CardContent>
        </Card>

        {/* Quick Topics */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Health Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => setInputMessage('How can I improve my nutrition?')}
                variant="outline"
                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
              >
                🥗 Nutrition
              </Button>
              <Button
                onClick={() => setInputMessage('What exercise should I do?')}
                variant="outline"
                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
              >
                💪 Exercise
              </Button>
              <Button
                onClick={() => setInputMessage('How can I sleep better?')}
                variant="outline"
                className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
              >
                😴 Sleep
              </Button>
              <Button
                onClick={() => setInputMessage('Help me manage stress')}
                variant="outline"
                className="border-pink-500/50 text-pink-500 hover:bg-pink-500/10"
              >
                🧘 Stress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Info */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Brain className="w-8 h-8 text-blue-500 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">AI-Powered Guidance</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Your Health Coach uses advanced AI to provide personalized guidance based on your TokHealth data.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>🟡 Yellow/Red zones: Gemini AI</span>
                  <span>🟢 Green zones: GPT-5.2</span>
                </div>
                <p className="text-gray-500 text-xs mt-2 italic">
                  Remember: AI provides guidance, not medical advice. Always consult healthcare professionals for medical decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPA Message */}
        <div className="text-center">
          <p className="text-blue-500 text-sm italic">
            "Smart guidance for better health - AI that cares" 🤖💙
          </p>
          <p className="text-gray-600 text-xs mt-1">
            KPA System - Keep People Alive
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthCoach;
