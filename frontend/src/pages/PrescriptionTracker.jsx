import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill, Clock, Calendar, CheckCircle, AlertCircle, Plus, Trash2, Bell, BellRing, X, Search, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const PrescriptionTracker = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [takenToday, setTakenToday] = useState({});
  
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '3x_daily',
    times: ['08:00', '14:00', '20:00'],
    with_food: true,
    instructions: '',
    prescriber: ''
  });

  const [drugSearchResults, setDrugSearchResults] = useState([]);
  const [searchingDrugs, setSearchingDrugs] = useState(false);
  const [interactionResult, setInteractionResult] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const searchTimeoutRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const searchDrugs = async (query) => {
    if (!query || query.length < 2) {
      setDrugSearchResults([]);
      return;
    }
    setSearchingDrugs(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/medication/search?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDrugSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Drug search error:', error);
    } finally {
      setSearchingDrugs(false);
    }
  };

  const handleMedNameChange = (value) => {
    setFormData({...formData, medication_name: value});
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchDrugs(value), 400);
  };

  const selectDrug = (drug) => {
    setFormData({...formData, medication_name: drug.name});
    setDrugSearchResults([]);
  };

  const checkInteractions = async () => {
    if (prescriptions.length < 2) {
      toast.error('Need at least 2 medications to check interactions');
      return;
    }

    setCheckingInteractions(true);
    setInteractionResult(null);
    try {
      const medNames = prescriptions.map(p => p.medication_name);
      const response = await fetch(`${BACKEND_URL}/api/medication/check-interactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ medication_names: medNames })
      });

      const data = await response.json();
      if (data.success) {
        setInteractionResult(data.data);
        toast.success('Interaction check complete');
      } else {
        toast.error('Failed to check interactions');
      }
    } catch (error) {
      console.error('Interaction check error:', error);
      toast.error('Failed to check interactions');
    } finally {
      setCheckingInteractions(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    checkNotificationPermission();
    loadTakenToday();
    
    // Set up reminder check interval (every minute)
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        toast.success('Notifications enabled! You\'ll get reminders 3x daily.');
        scheduleReminders();
      } else {
        toast.error('Notifications blocked. Please enable in browser settings.');
      }
    } else {
      toast.error('Your browser doesn\'t support notifications');
    }
  };

  const loadTakenToday = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`tokhealth_meds_${today}`);
    if (saved) {
      setTakenToday(JSON.parse(saved));
    }
  };

  const saveTakenToday = (newTaken) => {
    const today = new Date().toDateString();
    localStorage.setItem(`tokhealth_meds_${today}`, JSON.stringify(newTaken));
  };

  const scheduleReminders = () => {
    // Store reminder times in localStorage
    const reminderTimes = ['08:00', '14:00', '20:00'];
    localStorage.setItem('tokhealth_reminder_times', JSON.stringify(reminderTimes));
    toast.success('Reminders set for 8 AM, 2 PM, and 8 PM');
  };

  const checkReminders = () => {
    if (!notificationsEnabled) return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const reminderTimes = JSON.parse(localStorage.getItem('tokhealth_reminder_times') || '[]');
    
    if (reminderTimes.includes(currentTime)) {
      // Check if we haven't already sent notification this minute
      const lastNotification = localStorage.getItem('tokhealth_last_notification');
      if (lastNotification !== currentTime) {
        sendNotification();
        localStorage.setItem('tokhealth_last_notification', currentTime);
      }
    }
  };

  const sendNotification = () => {
    if (Notification.permission === 'granted') {
      const notification = new Notification('TokHealth - Medication Reminder', {
        body: 'Time to take your medication! Stay healthy, stay alive. 💊',
        icon: '/favicon.ico',
        tag: 'medication-reminder',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const testNotification = () => {
    if (notificationsEnabled) {
      sendNotification();
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable notifications first');
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescriptions/`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleAddPrescription = async () => {
    if (!formData.medication_name || !formData.dosage) {
      toast.error('Medication name and dosage are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescriptions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Medication added! Reminders will help you stay on track.');
        setFormData({
          medication_name: '',
          dosage: '',
          frequency: '3x_daily',
          times: ['08:00', '14:00', '20:00'],
          with_food: true,
          instructions: '',
          prescriber: ''
        });
        setShowAddForm(false);
        fetchPrescriptions();
      }
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = (medId, timeSlot) => {
    const key = `${medId}_${timeSlot}`;
    const newTaken = { ...takenToday, [key]: true };
    setTakenToday(newTaken);
    saveTakenToday(newTaken);
    toast.success('Marked as taken! Great job staying on track! 💪');
  };

  const isTaken = (medId, timeSlot) => {
    return takenToday[`${medId}_${timeSlot}`] === true;
  };

  const getTimeLabel = (time) => {
    const [hours] = time.split(':');
    const h = parseInt(hours);
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="p-4" data-testid="prescription-tracker">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
              <Pill className="w-5 h-5 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Prescription Tracker</h1>
          </div>
          <p className="text-slate-500 text-sm">Never miss a dose - 3x daily reminders</p>
        </div>

        {/* Notification Setup */}
        <Card className={`border-2 ${notificationsEnabled ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notificationsEnabled ? (
                  <BellRing className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Bell className="w-6 h-6 text-amber-600" />
                )}
                <div>
                  <p className={`font-medium ${notificationsEnabled ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {notificationsEnabled ? 'Reminders Active' : 'Enable Reminders'}
                  </p>
                  <p className="text-slate-600 text-xs">
                    {notificationsEnabled ? '8 AM, 2 PM, 8 PM daily' : 'Get notified 3 times a day'}
                  </p>
                </div>
              </div>
              
              {notificationsEnabled ? (
                <Button
                  onClick={testNotification}
                  variant="outline"
                  size="sm"
                  className="border-emerald-400 text-emerald-700 text-xs"
                >
                  Test
                </Button>
              ) : (
                <Button
                  onClick={requestNotificationPermission}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  Enable
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2 text-sky-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {['08:00', '14:00', '20:00'].map((time, idx) => {
                const labels = ['Morning', 'Afternoon', 'Evening'];
                const allTaken = prescriptions.every(med => isTaken(med.id || med.medication_name, time));
                
                return (
                  <div
                    key={time}
                    className={`p-3 rounded-lg text-center border ${
                      allTaken ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-xs text-slate-500">{labels[idx]}</div>
                    <div className="text-sm font-bold text-slate-800">{time}</div>
                    {allTaken && <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Medications List */}
        {prescriptions.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Your Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {prescriptions.map((med, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{med.medication_name}</h3>
                      <p className="text-slate-500 text-sm">{med.dosage}</p>
                      {med.with_food && (
                        <span className="text-xs text-amber-600">Take with food</span>
                      )}
                    </div>
                    <Pill className="w-5 h-5 text-pink-500" />
                  </div>
                  
                  {/* Dose Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {['08:00', '14:00', '20:00'].map((time) => {
                      const taken = isTaken(med.id || med.medication_name, time);
                      return (
                        <Button
                          key={time}
                          onClick={() => !taken && handleMarkAsTaken(med.id || med.medication_name, time)}
                          disabled={taken}
                          variant={taken ? 'default' : 'outline'}
                          size="sm"
                          className={taken 
                            ? 'bg-emerald-500 text-white text-xs' 
                            : 'border-pink-300 text-pink-600 text-xs'
                          }
                        >
                          {taken ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Done</>
                          ) : (
                            <>{getTimeLabel(time)}</>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Interaction Checker */}
        {prescriptions.length >= 2 && (
          <Card className="bg-white/90 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Shield className="w-4 h-4 mr-2 text-amber-600" />
                Drug Interaction Checker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-500 text-xs">
                Check for potential interactions between your {prescriptions.length} medications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prescriptions.map((med, i) => (
                  <span key={i} className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                    {med.medication_name}
                  </span>
                ))}
              </div>
              <Button
                onClick={checkInteractions}
                disabled={checkingInteractions}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                data-testid="check-interactions-btn"
              >
                {checkingInteractions ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking Interactions...</>
                ) : (
                  <><Shield className="w-4 h-4 mr-2" />Check Interactions</>
                )}
              </Button>

              {interactionResult && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{interactionResult.analysis}</p>
                  <p className="text-amber-600 text-xs mt-2 italic">{interactionResult.disclaimer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-5"
            data-testid="add-medication-btn"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Medication
          </Button>
        )}

        {/* Add Form */}
        {showAddForm && (
          <Card className="bg-white/90 border-pink-200">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm">Add Medication</CardTitle>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 relative">
                  <Label className="text-slate-600 text-sm">Medication Name *</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search medication..."
                      value={formData.medication_name}
                      onChange={(e) => handleMedNameChange(e.target.value)}
                      className="bg-white border-slate-200 text-slate-800"
                      data-testid="med-name-input"
                    />
                    {searchingDrugs && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3 text-slate-400" />
                    )}
                  </div>
                  {drugSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                      {drugSearchResults.slice(0, 8).map((drug, i) => (
                        <button
                          key={i}
                          onClick={() => selectDrug(drug)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-pink-50 text-slate-700 border-b border-slate-100 last:border-0"
                          data-testid={`drug-result-${i}`}
                        >
                          {drug.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Dosage *</Label>
                  <Input
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="bg-white border-slate-200 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1x_daily">Once daily</SelectItem>
                    <SelectItem value="2x_daily">Twice daily</SelectItem>
                    <SelectItem value="3x_daily">Three times daily</SelectItem>
                    <SelectItem value="as_needed">As needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="with-food"
                  checked={formData.with_food}
                  onCheckedChange={(checked) => setFormData({...formData, with_food: checked})}
                />
                <Label htmlFor="with-food" className="text-slate-600 text-sm">Take with food</Label>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Special Instructions</Label>
                <Textarea
                  placeholder="Any special instructions..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="bg-white border-slate-200 text-slate-800 min-h-[60px]"
                />
              </div>

              <Button
                onClick={handleAddPrescription}
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              >
                {loading ? 'Adding...' : 'Add Medication'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - Never Miss a Dose
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTracker;
