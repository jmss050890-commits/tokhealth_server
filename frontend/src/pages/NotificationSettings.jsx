import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Plus, Trash2, Clock, Pill, Droplets, Activity, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const NotificationSettings = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    type: 'medication',
    title: '',
    time: '08:00',
    days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    setPushSupported('Notification' in window && 'serviceWorker' in navigator);
    setPushEnabled(Notification.permission === 'granted');
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/status`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.data);
        setReminders(data.data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching notification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);

        // Register with backend
        await fetch(`${BACKEND_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            endpoint: 'browser-push-' + Date.now(),
            keys: { browser: navigator.userAgent }
          })
        });

        toast.success('Notifications enabled!');

        // Schedule notifications using the Notification API
        scheduleLocalNotifications();
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      toast.error('Failed to enable notifications');
    }
  };

  const scheduleLocalNotifications = () => {
    // Use setInterval for browser-based reminders (works when tab is open)
    reminders.forEach(reminder => {
      if (reminder.enabled) {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);

        if (target <= now) target.setDate(target.getDate() + 1);

        const delay = target - now;
        setTimeout(() => {
          new Notification('TokHealth Reminder', {
            body: reminder.title,
            icon: '/icons/icon-192x192.png',
            tag: reminder.id
          });
        }, delay);
      }
    });
  };

  const addReminder = async () => {
    if (!newReminder.title.trim()) {
      toast.error('Please enter a reminder title');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/reminders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newReminder)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Reminder created!');
        setReminders([...reminders, data.data]);
        setNewReminder({ type: 'medication', title: '', time: '08:00', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] });
        setShowAddReminder(false);

        if (pushEnabled) scheduleLocalNotifications();
      }
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        setReminders(reminders.filter(r => r.id !== reminderId));
        toast.success('Reminder deleted');
      }
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const REMINDER_TYPES = [
    { value: 'medication', label: 'Medication', icon: Pill, color: 'text-pink-600' },
    { value: 'hydration', label: 'Hydration', icon: Droplets, color: 'text-cyan-600' },
    { value: 'exercise', label: 'Exercise', icon: Activity, color: 'text-green-600' },
    { value: 'custom', label: 'Custom', icon: Bell, color: 'text-violet-600' }
  ];

  const DAY_OPTIONS = [
    { value: 'mon', label: 'M' }, { value: 'tue', label: 'T' }, { value: 'wed', label: 'W' },
    { value: 'thu', label: 'T' }, { value: 'fri', label: 'F' }, { value: 'sat', label: 'S' }, { value: 'sun', label: 'S' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center space-y-1">
        <Bell className="w-10 h-10 text-amber-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Notifications & Reminders</h1>
        <p className="text-slate-500 text-sm">Never miss a medication or health check</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
        </div>
      ) : (
        <>
          {/* Push Status */}
          <Card className={`border-${pushEnabled ? 'green' : 'amber'}-200 bg-white/90`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {pushEnabled ? (
                    <Bell className="w-8 h-8 text-green-500" />
                  ) : (
                    <BellOff className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <p className={`font-medium text-sm ${pushEnabled ? 'text-green-700' : 'text-amber-700'}`}>
                      {pushEnabled ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {pushSupported ? (pushEnabled ? 'You will receive reminders' : 'Enable to get health reminders') : 'Not supported in this browser'}
                    </p>
                  </div>
                </div>
                {!pushEnabled && pushSupported && (
                  <Button onClick={enableNotifications} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" data-testid="enable-notifications-btn">
                    Enable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reminders List */}
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-sky-600" />
                  Your Reminders ({reminders.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reminders.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No reminders yet. Add one below!</p>
              ) : (
                reminders.map((reminder, i) => {
                  const typeInfo = REMINDER_TYPES.find(t => t.value === reminder.type) || REMINDER_TYPES[3];
                  const TypeIcon = typeInfo.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                        <div>
                          <p className="text-slate-800 text-sm font-medium">{reminder.title}</p>
                          <p className="text-slate-400 text-xs">{reminder.time} daily</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        data-testid={`delete-reminder-${i}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Add Reminder */}
          {!showAddReminder ? (
            <Button
              onClick={() => setShowAddReminder(true)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-5"
              data-testid="add-reminder-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          ) : (
            <Card className="bg-white/90 border-sky-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-sm">New Reminder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Type</Label>
                  <Select value={newReminder.type} onValueChange={(v) => setNewReminder({...newReminder, type: v})}>
                    <SelectTrigger className="bg-white" data-testid="reminder-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Title</Label>
                  <Input
                    placeholder="e.g., Take morning vitamins"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({...newReminder, title: e.target.value})}
                    className="bg-white"
                    data-testid="reminder-title-input"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Time</Label>
                  <Input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({...newReminder, time: e.target.value})}
                    className="bg-white"
                    data-testid="reminder-time-input"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Days</Label>
                  <div className="flex gap-1">
                    {DAY_OPTIONS.map((day, i) => (
                      <button
                        key={day.value}
                        onClick={() => {
                          const days = newReminder.days.includes(day.value)
                            ? newReminder.days.filter(d => d !== day.value)
                            : [...newReminder.days, day.value];
                          setNewReminder({...newReminder, days});
                        }}
                        className={`w-8 h-8 rounded-full text-xs font-medium ${
                          newReminder.days.includes(day.value)
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setShowAddReminder(false)} variant="outline" className="flex-1">Cancel</Button>
                  <Button onClick={addReminder} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white" data-testid="save-reminder-btn">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Save Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
