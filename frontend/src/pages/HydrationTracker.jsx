import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, TrendingUp, Target, Bell, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const HydrationTracker = () => {
  const [todayIntake, setTodayIntake] = useState(0);
  const [logs, setLogs] = useState([]);
  const [target] = useState(2500); // 2.5L in ml
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchTodayHydration();
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`tokhealth_hydration_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setTodayIntake(data.total || 0);
      setLogs(data.logs || []);
    }
  };

  const saveLocalData = (total, newLogs) => {
    const today = new Date().toDateString();
    localStorage.setItem(`tokhealth_hydration_${today}`, JSON.stringify({
      total,
      logs: newLogs
    }));
  };

  const fetchTodayHydration = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/hydration/today`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success && data.data) {
        setTodayIntake(data.data.total_ml || 0);
      }
    } catch (error) {
      console.error('Error fetching hydration:', error);
    }
  };

  const quickLog = async (amount) => {
    const newTotal = todayIntake + amount;
    const newLog = {
      amount,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    const newLogs = [...logs, newLog];
    
    setTodayIntake(newTotal);
    setLogs(newLogs);
    saveLocalData(newTotal, newLogs);

    try {
      await fetch(`${BACKEND_URL}/api/hydration/log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount_ml: amount })
      });
    } catch (error) {
      console.error('Error logging hydration:', error);
    }

    const remaining = Math.max(0, target - newTotal);
    if (newTotal >= target) {
      toast.success('Goal reached! Excellent hydration today! 💧');
    } else {
      toast.success(`+${amount}ml logged! ${Math.round(remaining)}ml to go`);
    }
  };

  const getProgressPercentage = () => {
    return Math.min((todayIntake / target) * 100, 100);
  };

  const getProgressColor = () => {
    const pct = getProgressPercentage();
    if (pct < 50) return 'bg-red-400';
    if (pct < 80) return 'bg-yellow-400';
    return 'bg-emerald-500';
  };

  const getMotivationalMessage = () => {
    const pct = getProgressPercentage();
    if (pct === 0) return "Start your hydration journey!";
    if (pct < 25) return "Keep drinking! You've got this.";
    if (pct < 50) return "Good progress! Stay consistent.";
    if (pct < 75) return "Over halfway there! Keep going!";
    if (pct < 100) return "Almost at your goal! Finish strong!";
    return "Goal achieved! Amazing work!";
  };

  const quickAmounts = [
    { ml: 250, label: '1 Glass', icon: '🥛' },
    { ml: 500, label: 'Bottle', icon: '🍶' },
    { ml: 350, label: 'Mug', icon: '☕' },
    { ml: 150, label: 'Small', icon: '🥤' }
  ];

  return (
    <div className="p-4" data-testid="hydration-tracker">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Hydration</h1>
          </div>
          <p className="text-slate-500 text-sm">Stay hydrated, stay healthy</p>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-cyan-50 to-sky-50 border-cyan-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-cyan-600">
                {(todayIntake / 1000).toFixed(1)}L
              </div>
              <div className="text-slate-500 text-sm">of {(target / 1000).toFixed(1)}L goal</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-4 mb-3">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{Math.round(getProgressPercentage())}% complete</span>
              <span className="text-cyan-600 font-medium">
                {Math.max(0, Math.round((target - todayIntake) / 1000 * 10) / 10)}L remaining
              </span>
            </div>

            <p className="text-center text-slate-600 text-sm mt-3 italic">
              {getMotivationalMessage()}
            </p>
          </CardContent>
        </Card>

        {/* Quick Log Buttons */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <Plus className="w-4 h-4 mr-2 text-cyan-600" />
              Quick Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((item) => (
                <Button
                  key={item.ml}
                  onClick={() => quickLog(item.ml)}
                  variant="outline"
                  className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 flex flex-col h-auto py-3"
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.ml}ml</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Log */}
        {logs.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-sky-600" />
                Today's Log ({logs.length} entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.slice().reverse().map((log, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 rounded p-2 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      <span className="text-slate-700">+{log.amount}ml</span>
                    </div>
                    <span className="text-slate-400 text-xs">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm">Hydration Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-slate-600">
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                Drink a glass of water when you wake up
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                Keep a water bottle nearby at all times
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                Drink before you feel thirsty
              </li>
              <li className="flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                Set regular reminders throughout the day
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - Hydration is Life
          </p>
        </div>
      </div>
    </div>
  );
};

export default HydrationTracker;
