import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Heart, Brain, Lightbulb, Lock, Plus, Calendar, Sparkles, ChevronDown, ChevronUp, Camera, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const WisdomVault = () => {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [labResults, setLabResults] = useState([]);
  const [analyzingLab, setAnalyzingLab] = useState(false);
  const labFileRef = useRef(null);
  const journalPhotoRef = useRef(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [drugSearch, setDrugSearch] = useState('');
  const [drugResults, setDrugResults] = useState([]);
  const [searchingDrug, setSearchingDrug] = useState(false);
  const [expandedDrug, setExpandedDrug] = useState(null);

  const [formData, setFormData] = useState({
    entry_type: 'journal',
    title: '',
    body: '',
    mood_before: 'neutral',
    mood_after: '',
    tags: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const searchDrugs = async () => {
    if (!drugSearch.trim() || drugSearch.length < 2) return;
    setSearchingDrug(true);
    setDrugResults([]);
    try {
      const response = await fetch(`${BACKEND_URL}/api/medication/lookup/${encodeURIComponent(drugSearch)}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDrugResults(data.data || []);
        if (data.data.length === 0) {
          toast.info('No results found. Try a different name.');
        }
      }
    } catch {
      toast.error('Drug lookup unavailable');
    } finally {
      setSearchingDrug(false);
    }
  };

  const moods = [
    { value: 'great', emoji: '😊', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'low', emoji: '😔', label: 'Low' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
    { value: 'anxious', emoji: '😟', label: 'Anxious' }
  ];

  const journalPrompts = [
    "What are you grateful for today?",
    "What's one thing you accomplished recently?",
    "How are you feeling right now, and why?",
    "What's something that made you smile today?",
    "What challenge are you facing, and how might you overcome it?",
    "Describe a moment of peace you experienced recently.",
    "What would make tomorrow a great day?",
    "Write a letter to your future self."
  ];

  useEffect(() => {
    fetchEntries();
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/lab-results`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setLabResults(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching lab results:', error);
    }
  };

  const handleLabUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.');
      return;
    }

    setAnalyzingLab(true);
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
        toast.success('Lab result analyzed! Check results below.');
        fetchLabResults();
      } else {
        toast.error('Failed to analyze lab result');
      }
    } catch (error) {
      console.error('Error uploading lab result:', error);
      toast.error('Failed to upload lab result');
    } finally {
      setAnalyzingLab(false);
      if (labFileRef.current) labFileRef.current.value = '';
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/entries?days=30`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setEntries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const getRandomPrompt = () => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setFormData({ ...formData, title: randomPrompt });
    toast.success('Prompt added! Start writing your thoughts.');
  };

  const getAiSuggestion = async () => {
    if (!formData.body || formData.body.length < 20) {
      toast.error('Write a bit more first so I can give helpful suggestions');
      return;
    }

    setLoadingSuggestion(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: `Based on this journal entry, provide one brief, compassionate wellness suggestion (2-3 sentences max): "${formData.body.substring(0, 500)}"`,
          session_id: 'wisdom_vault'
        })
      });

      const data = await response.json();
      if (data.success) {
        setAiSuggestion(data.data.response);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast.error('Could not get AI suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error('Please add a title and write your thoughts');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        entry_type: formData.entry_type,
        title: formData.title.trim(),
        body: formData.body.trim(),
        mood_before: formData.mood_before,
        mood_after: formData.mood_after || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        ai_suggestion: aiSuggestion
      };

      const response = await fetch(`${BACKEND_URL}/api/wisdom-vault/entries`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entryData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Entry saved to your Wisdom Vault! 🔒');
        setFormData({
          entry_type: 'journal',
          title: '',
          body: '',
          mood_before: 'neutral',
          mood_after: '',
          tags: ''
        });
        setAiSuggestion(null);
        setShowNewEntry(false);
        fetchEntries();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const found = moods.find(m => m.value === mood);
    return found ? found.emoji : '😐';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4" data-testid="wisdom-vault">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Wisdom Vault</h1>
            <Lock className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-slate-500 text-sm">Your private space for reflection & growth</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => setActiveTab('journal')}
            variant={activeTab === 'journal' ? 'default' : 'outline'}
            size="sm"
            className={activeTab === 'journal' ? 'bg-violet-600 text-white' : 'border-violet-300 text-violet-600'}
            data-testid="wisdom-tab-journal"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Journal
          </Button>
          <Button
            onClick={() => setActiveTab('lab')}
            variant={activeTab === 'lab' ? 'default' : 'outline'}
            size="sm"
            className={activeTab === 'lab' ? 'bg-violet-600 text-white' : 'border-violet-300 text-violet-600'}
            data-testid="wisdom-tab-lab"
          >
            <FileText className="w-4 h-4 mr-1" />
            Lab Results
          </Button>
        </div>

        {activeTab === 'lab' && (
          <>
            {/* Lab Upload Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center space-y-3">
                <Camera className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="text-blue-800 font-medium">Upload Lab Results</p>
                <p className="text-slate-500 text-xs">Take a photo or upload an image of your lab results for AI analysis</p>
                <input
                  ref={labFileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleLabUpload}
                  className="hidden"
                  data-testid="lab-file-input"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => labFileRef.current?.click()}
                    disabled={analyzingLab}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    data-testid="lab-upload-btn"
                  >
                    {analyzingLab ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                    ) : (
                      <><Camera className="w-4 h-4 mr-2" />Upload / Take Photo</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lab Results List */}
            {labResults.length > 0 && (
              <Card className="bg-white/90 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-800 text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    Your Lab Results ({labResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {labResults.map((result, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedEntry(expandedEntry === `lab-${index}` ? null : `lab-${index}`)}
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <h3 className="font-medium text-slate-800 text-sm">{result.filename || 'Lab Result'}</h3>
                            <p className="text-slate-400 text-xs">{new Date(result.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {expandedEntry === `lab-${index}` ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      {expandedEntry === `lab-${index}` && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-800 font-medium text-sm">AI Analysis</span>
                            </div>
                            <p className="text-slate-700 text-sm whitespace-pre-wrap">{result.analysis}</p>
                          </div>
                          <p className="text-slate-400 text-xs mt-2 italic">
                            This is AI-generated. Always discuss results with your healthcare provider.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {labResults.length === 0 && !analyzingLab && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No lab results uploaded yet</p>
                <p className="text-slate-400 text-xs">Upload an image to get AI-powered analysis</p>
              </div>
            )}

            {/* Drug / Medication Lookup */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
                  Drug & Medication Lookup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-500 text-xs">Search the FDA database for drug information, side effects, and warnings</p>
                <div className="flex gap-2">
                  <input
                    value={drugSearch}
                    onChange={(e) => setDrugSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDrugs()}
                    placeholder="e.g., Metformin, Lisinopril..."
                    className="flex-1 text-sm p-2 rounded-lg border border-emerald-200 focus:border-emerald-400 focus:outline-none"
                    data-testid="drug-lookup-input"
                  />
                  <Button
                    onClick={searchDrugs}
                    disabled={searchingDrug || drugSearch.length < 2}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4"
                    data-testid="drug-lookup-btn"
                  >
                    {searchingDrug ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>

                {drugResults.map((drug, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-emerald-200">
                    <div
                      className="cursor-pointer"
                      onClick={() => setExpandedDrug(expandedDrug === i ? null : i)}
                    >
                      <h4 className="font-medium text-slate-800 text-sm">{drug.brand_name}</h4>
                      <p className="text-emerald-600 text-xs">{drug.generic_name}</p>
                      <p className="text-slate-400 text-xs">{drug.drug_class}</p>
                    </div>
                    {expandedDrug === i && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 text-xs">
                        {drug.purpose && drug.purpose !== 'N/A' && (
                          <div><span className="font-medium text-slate-600">Purpose:</span> <span className="text-slate-500">{drug.purpose}</span></div>
                        )}
                        {drug.dosage && drug.dosage !== 'N/A' && (
                          <div><span className="font-medium text-slate-600">Dosage:</span> <span className="text-slate-500">{drug.dosage}</span></div>
                        )}
                        {drug.side_effects && drug.side_effects !== 'N/A' && (
                          <div><span className="font-medium text-amber-600">Side Effects:</span> <span className="text-slate-500">{drug.side_effects}</span></div>
                        )}
                        {drug.warnings && drug.warnings !== 'N/A' && (
                          <div><span className="font-medium text-red-600">Warnings:</span> <span className="text-slate-500">{drug.warnings}</span></div>
                        )}
                        <p className="text-slate-400 italic">Manufacturer: {drug.manufacturer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'journal' && (
          <>
        {/* Mood Check-In */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="p-4">
            <p className="text-violet-800 font-medium mb-3 text-center">How are you feeling?</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  onClick={() => {
                    setFormData({ ...formData, mood_before: mood.value });
                    setShowNewEntry(true);
                  }}
                  variant="outline"
                  className={`border-violet-200 hover:bg-violet-100 ${
                    formData.mood_before === mood.value && showNewEntry ? 'bg-violet-100 border-violet-400' : ''
                  }`}
                >
                  <span className="text-xl mr-1">{mood.emoji}</span>
                  <span className="text-xs text-slate-600">{mood.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Entry Button */}
        {!showNewEntry && (
          <Button
            onClick={() => setShowNewEntry(true)}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-5"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Journal Entry
          </Button>
        )}

        {/* New Entry Form */}
        {showNewEntry && (
          <Card className="bg-white/90 border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center justify-between">
                <span className="flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-violet-600" />
                  Write Your Thoughts
                </span>
                <Button
                  onClick={() => setShowNewEntry(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400"
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Entry Type */}
              <div className="flex gap-2">
                {['journal', 'gratitude', 'reflection'].map((type) => (
                  <Button
                    key={type}
                    onClick={() => setFormData({ ...formData, entry_type: type })}
                    variant={formData.entry_type === type ? 'default' : 'outline'}
                    size="sm"
                    className={formData.entry_type === type 
                      ? 'bg-violet-600 text-white' 
                      : 'border-violet-300 text-violet-600'
                    }
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Title with Prompt Generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600 text-sm">Title / Prompt</Label>
                  <Button
                    onClick={getRandomPrompt}
                    variant="ghost"
                    size="sm"
                    className="text-violet-600 text-xs"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Get Prompt
                  </Button>
                </div>
                <Input
                  placeholder="What's on your mind?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                />
              </div>

              {/* Body */}
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Your Thoughts</Label>
                <Textarea
                  placeholder="Write freely... this is your safe space."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800 min-h-[150px]"
                />
              </div>

              {/* AI Wellness Suggestion */}
              <Button
                onClick={getAiSuggestion}
                disabled={loadingSuggestion}
                variant="outline"
                className="w-full border-violet-300 text-violet-600 hover:bg-violet-50"
              >
                {loadingSuggestion ? (
                  'Getting suggestion...'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Wellness Suggestion
                  </>
                )}
              </Button>

              {aiSuggestion && (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    <span className="text-violet-800 font-medium text-sm">AI Suggestion</span>
                  </div>
                  <p className="text-slate-700 text-sm">{aiSuggestion}</p>
                </div>
              )}

              {/* Mood After */}
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">How do you feel after writing?</Label>
                <Select 
                  value={formData.mood_after} 
                  onValueChange={(v) => setFormData({ ...formData, mood_after: v })}
                >
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue placeholder="Select mood after" />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((mood) => (
                      <SelectItem key={mood.value} value={mood.value}>
                        {mood.emoji} {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Tags (optional, comma-separated)</Label>
                <Input
                  placeholder="e.g., work, family, health"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="bg-white border-slate-200 text-slate-800"
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-5"
              >
                {loading ? 'Saving...' : 'Save to Vault'}
                <Lock className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Past Entries */}
        {entries.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                Your Entries ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {entries.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedEntry(expandedEntry === index ? null : index)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getMoodEmoji(entry.mood_before)}</span>
                      <div>
                        <h3 className="font-medium text-slate-800 text-sm">{entry.title}</h3>
                        <p className="text-slate-400 text-xs">{formatDate(entry.created_at)}</p>
                      </div>
                    </div>
                    {expandedEntry === index ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {expandedEntry === index && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-slate-600 text-sm whitespace-pre-wrap">{entry.body}</p>
                      {entry.ai_suggestion && (
                        <div className="mt-2 bg-violet-50 rounded p-2">
                          <p className="text-violet-700 text-xs">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {entry.ai_suggestion}
                          </p>
                        </div>
                      )}
                      {entry.mood_after && (
                        <p className="text-slate-400 text-xs mt-2">
                          Mood after: {getMoodEmoji(entry.mood_after)} {entry.mood_after}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

          </>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Your entries are private and encrypted
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Keep People Alive - Mind Matters
          </p>
        </div>
      </div>
    </div>
  );
};

export default WisdomVault;
