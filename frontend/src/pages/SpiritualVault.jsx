import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Heart, BookOpen, Sun, Plus, Check, Trash2, Activity, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const SpiritualVault = () => {
  const [entries, setEntries] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  
  // AI Coach state
  const [showCoach, setShowCoach] = useState(false);
  const [coachMessage, setCoachMessage] = useState('');
  const [coachContext, setCoachContext] = useState('general');
  const [coachResponse, setCoachResponse] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    entry_type: 'gratitude',
    title: '',
    content: '',
    mood: 'peaceful'
  });
  
  const [newPrayer, setNewPrayer] = useState({
    request: '',
    for_whom: 'self'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [entriesRes, prayersRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/spiritual/entries`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/spiritual/prayers`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/spiritual/stats`, { headers: getAuthHeaders() })
      ]);

      const entriesData = await entriesRes.json();
      const prayersData = await prayersRes.json();
      const statsData = await statsRes.json();

      if (entriesData.success) setEntries(entriesData.data || []);
      if (prayersData.success) setPrayers(prayersData.data || []);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async () => {
    if (!newEntry.content) {
      toast.error('Please write something');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/spiritual/entry`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newEntry)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Entry saved to your Spiritual Vault');
        setNewEntry({ entry_type: 'gratitude', title: '', content: '', mood: 'peaceful' });
        setShowNewEntry(false);
        fetchData();
      } else {
        toast.error(data.detail || 'Failed to save entry');
      }
    } catch (error) {
      toast.error('Failed to save entry');
    }
  };

  const createPrayer = async () => {
    if (!newPrayer.request) {
      toast.error('Please enter your prayer request');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/spiritual/prayer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newPrayer)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Prayer request added');
        setNewPrayer({ request: '', for_whom: 'self' });
        setShowNewPrayer(false);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to add prayer');
    }
  };

  const markPrayerAnswered = async (prayerId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/spiritual/prayer/${prayerId}/answered`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Prayer marked as answered! 🙏');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update prayer');
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/spiritual/entry/${entryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Entry deleted');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const askCoach = async () => {
    if (!coachMessage.trim()) {
      toast.error('Please enter your question or thought');
      return;
    }

    setCoachLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/spiritual/guidance`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: coachMessage,
          context: coachContext
        })
      });

      const data = await response.json();
      if (data.success) {
        setCoachResponse(data.data.response);
      } else {
        toast.error('Failed to get guidance');
      }
    } catch (error) {
      console.error('Error getting guidance:', error);
      toast.error('Failed to connect to spiritual guide');
    } finally {
      setCoachLoading(false);
    }
  };

  const getEntryIcon = (type) => {
    switch (type) {
      case 'gratitude': return '🙏';
      case 'prayer': return '✝️';
      case 'reflection': return '💭';
      case 'scripture': return '📖';
      case 'meditation': return '🧘';
      default: return '✨';
    }
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'peaceful': return 'bg-blue-100 text-blue-700';
      case 'grateful': return 'bg-amber-100 text-amber-700';
      case 'seeking': return 'bg-purple-100 text-purple-700';
      case 'troubled': return 'bg-slate-100 text-slate-700';
      case 'joyful': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <Activity className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="spiritual-vault">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Spiritual Vault</h1>
          </div>
          <p className="text-slate-500 text-sm">Nurture your soul, track your spiritual journey</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-700">{stats.total_entries || 0}</div>
                <div className="text-xs text-purple-600">Entries</div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-amber-700">{stats.total_prayers || 0}</div>
                <div className="text-xs text-amber-600">Prayers</div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">{stats.answered_prayers || 0}</div>
                <div className="text-xs text-emerald-600">Answered</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'journal' ? 'default' : 'outline'}
            onClick={() => setActiveTab('journal')}
            className={activeTab === 'journal' ? 'bg-purple-600' : 'border-purple-300 text-purple-700'}
            size="sm"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Journal
          </Button>
          <Button
            variant={activeTab === 'prayers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('prayers')}
            className={activeTab === 'prayers' ? 'bg-purple-600' : 'border-purple-300 text-purple-700'}
            size="sm"
          >
            <Heart className="w-4 h-4 mr-1" />
            Prayers
          </Button>
        </div>

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <>
            <Button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="new-entry-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>

            {showNewEntry && (
              <Card className="bg-white border-purple-300">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-slate-600">Type</Label>
                      <Select value={newEntry.entry_type} onValueChange={(v) => setNewEntry({...newEntry, entry_type: v})}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                          <SelectItem value="prayer">✝️ Prayer</SelectItem>
                          <SelectItem value="reflection">💭 Reflection</SelectItem>
                          <SelectItem value="scripture">📖 Scripture</SelectItem>
                          <SelectItem value="meditation">🧘 Meditation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600">Mood</Label>
                      <Select value={newEntry.mood} onValueChange={(v) => setNewEntry({...newEntry, mood: v})}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="peaceful">Peaceful</SelectItem>
                          <SelectItem value="grateful">Grateful</SelectItem>
                          <SelectItem value="seeking">Seeking</SelectItem>
                          <SelectItem value="troubled">Troubled</SelectItem>
                          <SelectItem value="joyful">Joyful</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Input
                    placeholder="Title (optional)"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                    className="border-slate-200"
                  />
                  <Textarea
                    placeholder="Pour out your heart..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                    className="border-slate-200 min-h-[100px]"
                    data-testid="entry-content"
                  />
                  <Button onClick={createEntry} className="w-full bg-purple-600 hover:bg-purple-700">
                    Save Entry
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Entries List */}
            <div className="space-y-2">
              {entries.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">Your spiritual journal awaits</p>
                    <p className="text-slate-400 text-sm">Start writing to nurture your soul</p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry) => (
                  <Card key={entry.id} className="bg-white border-slate-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          <span className="text-xl">{getEntryIcon(entry.entry_type)}</span>
                          <div>
                            <div className="font-medium text-slate-800">
                              {entry.title || entry.entry_type.charAt(0).toUpperCase() + entry.entry_type.slice(1)}
                            </div>
                            <p className="text-slate-600 text-sm line-clamp-2">{entry.content}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getMoodColor(entry.mood)}`}>
                                {entry.mood}
                              </span>
                              <span className="text-xs text-slate-400">{entry.date}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Prayers Tab */}
        {activeTab === 'prayers' && (
          <>
            <Button
              onClick={() => setShowNewPrayer(!showNewPrayer)}
              className="w-full bg-amber-600 hover:bg-amber-700"
              data-testid="new-prayer-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Prayer Request
            </Button>

            {showNewPrayer && (
              <Card className="bg-white border-amber-300">
                <CardContent className="p-4 space-y-3">
                  <Textarea
                    placeholder="What would you like to pray for?"
                    value={newPrayer.request}
                    onChange={(e) => setNewPrayer({...newPrayer, request: e.target.value})}
                    className="border-slate-200 min-h-[80px]"
                    data-testid="prayer-content"
                  />
                  <div>
                    <Label className="text-xs text-slate-600">For whom?</Label>
                    <Select value={newPrayer.for_whom} onValueChange={(v) => setNewPrayer({...newPrayer, for_whom: v})}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Myself</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friend">A Friend</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="world">The World</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createPrayer} className="w-full bg-amber-600 hover:bg-amber-700">
                    Add Prayer
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Prayers List */}
            <div className="space-y-2">
              {prayers.length === 0 ? (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No prayer requests yet</p>
                    <p className="text-slate-400 text-sm">Add prayers to track God's faithfulness</p>
                  </CardContent>
                </Card>
              ) : (
                prayers.map((prayer) => (
                  <Card key={prayer.id} className={`border ${prayer.answered ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm ${prayer.answered ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {prayer.request}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-slate-400">For: {prayer.for_whom}</span>
                            {prayer.answered && (
                              <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                                ✓ Answered
                              </span>
                            )}
                          </div>
                        </div>
                        {!prayer.answered && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markPrayerAnswered(prayer.id)}
                            className="border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Answered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpiritualVault;
