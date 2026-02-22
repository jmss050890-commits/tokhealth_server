import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Heart, Brain, Lightbulb, Lock, Plus } from 'lucide-react';
import { toast } from 'sonner';

const WisdomVault = () => {
  const [entryType, setEntryType] = useState('journal');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [moodBefore, setMoodBefore] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/entries?days=30`);
      const data = await response.json();
      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please provide a title and write your thoughts');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        entry_type: entryType,
        title: title.trim(),
        body: body.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        mood_before: moodBefore || null,
        ai_analysis_enabled: true
      };

      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Your thoughts are safely stored 💚');
        
        // Reset form
        setTitle('');
        setBody('');
        setTags('');
        setMoodBefore('');
        setShowNewEntry(false);
        
        // Refresh entries
        fetchEntries();
      } else {
        toast.error('Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Error saving entry');
    } finally {
      setLoading(false);
    }
  };

  const getEntryIcon = (type) => {
    switch(type) {
      case 'journal': return '📔';
      case 'thought_dump': return '💭';
      case 'gratitude': return '🙏';
      case 'worry': return '😟';
      case 'reflection': return '🤔';
      default: return '📝';
    }
  };

  const getMoodColor = (mood) => {
    if (!mood) return 'text-gray-500';
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes('happy') || lowerMood.includes('good') || lowerMood.includes('great')) return 'text-green-500';
    if (lowerMood.includes('calm') || lowerMood.includes('peaceful')) return 'text-blue-500';
    if (lowerMood.includes('anxious') || lowerMood.includes('stressed') || lowerMood.includes('worried')) return 'text-yellow-500';
    if (lowerMood.includes('sad') || lowerMood.includes('down') || lowerMood.includes('depressed')) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 p-4" data-testid="wisdom-vault">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <BookOpen className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-purple-500">WISDOM</span>{' '}
              <span className="text-white">VAULT</span>
            </h1>
            <Lock className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-gray-400 mb-2">Your safe space for thoughts, feelings, and reflections</p>
          <p className="text-gray-600 text-sm">🔒 100% Private & Encrypted - Your mental wellness matters</p>
          <p className="text-purple-500 text-xs italic mt-2">Part of the KPA System - Keep People Alive 💜</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-purple-900/20 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer"
                onClick={() => setShowNewEntry(true)}>
            <CardContent className="p-6 text-center">
              <Brain className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">New Entry</h3>
              <p className="text-gray-400 text-sm">Journal your thoughts</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-900/20 border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer"
                onClick={() => { setEntryType('thought_dump'); setShowNewEntry(true); }}>
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Quick Dump</h3>
              <p className="text-gray-400 text-sm">Get it off your mind</p>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-500/30 hover:border-green-500/60 transition-all cursor-pointer"
                onClick={() => { setEntryType('gratitude'); setShowNewEntry(true); }}>
            <CardContent className="p-6 text-center">
              <Lightbulb className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Gratitude</h3>
              <p className="text-gray-400 text-sm">What went well today</p>
            </CardContent>
          </Card>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <Card className="bg-gray-900/50 border-purple-500/50 shadow-xl shadow-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>New Wisdom Vault Entry</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewEntry(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Entry Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">What would you like to write about?</Label>
                <Select value={entryType} onValueChange={setEntryType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">📔 Journal Entry</SelectItem>
                    <SelectItem value="thought_dump">💭 Thought Dump (Quick)</SelectItem>
                    <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                    <SelectItem value="worry">😟 Worry / Concern</SelectItem>
                    <SelectItem value="reflection">🤔 Reflection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mood Before */}
              <div className="space-y-2">
                <Label className="text-gray-300">How are you feeling right now?</Label>
                <Select value={moodBefore} onValueChange={setMoodBefore}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select your mood (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">😊 Great</SelectItem>
                    <SelectItem value="good">🙂 Good</SelectItem>
                    <SelectItem value="calm">😌 Calm</SelectItem>
                    <SelectItem value="neutral">😐 Neutral</SelectItem>
                    <SelectItem value="anxious">😰 Anxious</SelectItem>
                    <SelectItem value="stressed">😣 Stressed</SelectItem>
                    <SelectItem value="sad">😢 Sad</SelectItem>
                    <SelectItem value="overwhelmed">😵 Overwhelmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-gray-300">Title *</Label>
                <Input
                  placeholder="Give your entry a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label className="text-gray-300">Your Thoughts *</Label>
                <Textarea
                  placeholder="Write freely... This is your safe space. No judgment, just support."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                />
                <p className="text-gray-500 text-xs">
                  🔒 This is encrypted and private. Only you can see this.
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-gray-300">Tags (Optional)</Label>
                <Input
                  placeholder="work, family, health (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* AI Support Notice */}
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-purple-300 text-sm font-semibold mb-1">AI Wellness Support</p>
                    <p className="text-gray-400 text-xs">
                      Our AI will read your entry and provide gentle, supportive wellness suggestions.
                      This helps you process thoughts and find healthy coping strategies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
              >
                {loading ? 'Saving Safely...' : '🔒 Save to Wisdom Vault'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* New Entry Button (when form hidden) */}
        {!showNewEntry && (
          <Button
            onClick={() => setShowNewEntry(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Wisdom Vault Entry
          </Button>
        )}

        {/* Entries List */}
        {entries.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Your Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entries.map((entry, index) => (
                  <Card key={index} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getEntryIcon(entry.entry_type)}</span>
                          <div>
                            <h4 className="text-white font-semibold">{entry.content?.title}</h4>
                            <p className="text-gray-500 text-xs">
                              {new Date(entry.created_at).toLocaleDateString()} at{' '}
                              {new Date(entry.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                          </div>
                        </div>
                        {entry.mood?.before && (
                          <span className={`text-sm ${getMoodColor(entry.mood.before)}`}>
                            Mood: {entry.mood.before}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {entry.content?.body}
                      </p>
                      
                      {entry.content?.tags && entry.content.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entry.content.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {entry.ai_response?.message && (
                        <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded">
                          <p className="text-purple-300 text-xs font-semibold mb-1">💜 AI Support:</p>
                          <p className="text-gray-300 text-sm">{entry.ai_response.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {entries.length === 0 && !showNewEntry && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-white text-xl mb-2">Your Wisdom Vault is Empty</h3>
              <p className="text-gray-400 mb-6">
                Start journaling your thoughts, feelings, and reflections.
                <br />
                This is your safe space for mental wellness.
              </p>
              <Button
                onClick={() => setShowNewEntry(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPA System Message */}
        <div className="text-center mt-8">
          <p className="text-purple-500 text-sm italic">
            "Your mental health matters. You matter. This vault keeps your thoughts safe." 💜
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Part of the KPA System - Keep People Alive
          </p>
        </div>
      </div>
    </div>
  );
};

export default WisdomVault;
