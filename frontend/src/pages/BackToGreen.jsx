import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Wind, Droplet, Heart, Footprints, Eye, Pause, Utensils, Phone, Droplets, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const BackToGreen = ({ currentZone = 'yellow', onClose }) => {
  const [interventions, setInterventions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIntervention, setActiveIntervention] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('');
  const [breathingCount, setBreathingCount] = useState(0);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchInterventions();
  }, [currentZone]);

  const fetchInterventions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health-coach/back-to-green?current_zone=${currentZone}`);
      const data = await response.json();
      if (data.success) {
        setInterventions(data.data);
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      'wind': Wind,
      'droplet': Droplet,
      'droplets': Droplets,
      'heart': Heart,
      'footprints': Footprints,
      'activity': Activity,
      'eye': Eye,
      'pause': Pause,
      'utensils': Utensils,
      'phone': Phone
    };
    const IconComponent = icons[iconName] || Activity;
    return <IconComponent className="w-5 h-5" />;
  };

  const startBreathingExercise = () => {
    setBreathingActive(true);
    setBreathingCount(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let cycle = 0;
    const maxCycles = 4;

    const breatheCycle = () => {
      if (cycle >= maxCycles) {
        setBreathingActive(false);
        setBreathingPhase('');
        markCompleted('breathing_478');
        toast.success('Great job! Breathing exercise complete.');
        return;
      }

      // Inhale for 4 seconds
      setBreathingPhase('Breathe In...');
      setTimeout(() => {
        // Hold for 7 seconds
        setBreathingPhase('Hold...');
        setTimeout(() => {
          // Exhale for 8 seconds
          setBreathingPhase('Breathe Out...');
          setTimeout(() => {
            cycle++;
            setBreathingCount(cycle);
            breatheCycle();
          }, 8000);
        }, 7000);
      }, 4000);
    };

    breatheCycle();
  };

  const stopBreathing = () => {
    setBreathingActive(false);
    setBreathingPhase('');
  };

  const markCompleted = (id) => {
    if (!completed.includes(id)) {
      setCompleted([...completed, id]);
      toast.success('Great work! Keep going!');
    }
  };

  const startIntervention = (intervention) => {
    setActiveIntervention(intervention);
    
    if (intervention.type === 'breathing') {
      startBreathingExercise();
    }
  };

  const getZoneColor = (zone) => {
    if (zone === 'green') return 'text-emerald-600 bg-emerald-100';
    if (zone === 'yellow') return 'text-yellow-600 bg-yellow-100';
    if (zone === 'red') return 'text-red-600 bg-red-100';
    return 'text-slate-600 bg-slate-100';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="back-to-green">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center px-4 py-2 rounded-full ${getZoneColor(currentZone)} mb-2`}>
            <span className="text-2xl mr-2">
              {currentZone === 'green' && '🟢'}
              {currentZone === 'yellow' && '🟡'}
              {currentZone === 'red' && '🔴'}
            </span>
            <span className="font-semibold capitalize">{currentZone} Zone</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Back to Green</h1>
          <p className="text-slate-500 text-sm">{interventions?.message}</p>
        </div>

        {/* Breathing Exercise Modal */}
        {breathingActive && (
          <Card className="bg-gradient-to-br from-sky-500 to-cyan-500 border-none shadow-xl">
            <CardContent className="p-8 text-center text-white">
              <div className="text-6xl mb-4 animate-pulse">
                {breathingPhase === 'Breathe In...' && '🌬️'}
                {breathingPhase === 'Hold...' && '⏸️'}
                {breathingPhase === 'Breathe Out...' && '💨'}
              </div>
              <h2 className="text-3xl font-bold mb-2">{breathingPhase}</h2>
              <p className="text-white/80 mb-4">Cycle {breathingCount + 1} of 4</p>
              <Button
                onClick={stopBreathing}
                variant="outline"
                className="border-white text-white hover:bg-white/20"
              >
                Stop
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completed Counter */}
        {completed.length > 0 && (
          <div className="flex items-center justify-center space-x-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">{completed.length} intervention{completed.length > 1 ? 's' : ''} completed</span>
          </div>
        )}

        {/* Immediate Actions */}
        {interventions?.interventions?.immediate?.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Do This Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interventions.interventions.immediate.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${completed.includes(item.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => !completed.includes(item.id) && startIntervention(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-slate-500 text-xs">{item.duration_min} min</p>
                      </div>
                    </div>
                    {completed.includes(item.id) ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Mindfulness */}
        {interventions?.interventions?.mindfulness?.length > 0 && (
          <Card className="bg-white/90 border-violet-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Heart className="w-4 h-4 mr-2 text-violet-600" />
                Mindfulness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interventions.interventions.mindfulness.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${completed.includes(item.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => !completed.includes(item.id) && markCompleted(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-slate-500 text-xs">{item.duration_min} min</p>
                      </div>
                    </div>
                    {completed.includes(item.id) ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs border-violet-300 text-violet-600">
                        Start
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Physical */}
        {interventions?.interventions?.physical?.length > 0 && (
          <Card className="bg-white/90 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Activity className="w-4 h-4 mr-2 text-emerald-600" />
                Movement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interventions.interventions.physical.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${completed.includes(item.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => !completed.includes(item.id) && markCompleted(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-slate-500 text-xs">{item.duration_min} min</p>
                      </div>
                    </div>
                    {completed.includes(item.id) ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-600">
                        Do It
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Short Term */}
        {interventions?.interventions?.short_term?.length > 0 && (
          <Card className="bg-white/90 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Utensils className="w-4 h-4 mr-2 text-orange-600" />
                Self-Care
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {interventions.interventions.short_term.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border ${completed.includes(item.id) ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => !completed.includes(item.id) && markCompleted(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                        <p className="text-slate-500 text-xs">{item.duration_min} min</p>
                      </div>
                    </div>
                    {completed.includes(item.id) ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs border-orange-300 text-orange-600">
                        Start
                      </Button>
                    )}
                  </div>
                  <p className="text-slate-600 text-xs mt-2">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Motivational Footer */}
        <div className="text-center py-4">
          <p className="text-slate-600 text-sm font-medium">
            {completed.length >= 3 ? 
              "Amazing progress! You're on your way back to green. 💚" :
              "Every small step counts. You've got this. 💪"
            }
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Keep People Alive - One Breath at a Time
          </p>
        </div>

        {/* Close Button */}
        {onClose && (
          <Button
            onClick={onClose}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white"
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
};

export default BackToGreen;
