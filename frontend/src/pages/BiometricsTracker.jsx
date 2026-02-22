import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Activity, Droplet, Thermometer, TrendingUp } from 'lucide-react';

const BiometricsTracker = () => {
  const [biometrics, setBiometrics] = useState({
    heart_rate_bpm: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_oxygen_spo2: '',
    body_temp_celsius: '',
    steps: ''
  });

  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setBiometrics(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      const dataToSubmit = {};
      Object.keys(biometrics).forEach(key => {
        if (biometrics[key] !== '') {
          dataToSubmit[key] = Number(biometrics[key]);
        }
      });

      const response = await fetch(`${BACKEND_URL}/api/biometrics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit)
      });

      if (response.ok) {
        const zonesResponse = await fetch(`${BACKEND_URL}/api/biometrics/zones`);
        const zonesData = await zonesResponse.json();
        setZones(zonesData.data);
        
        setBiometrics({
          heart_rate_bpm: '',
          blood_pressure_systolic: '',
          blood_pressure_diastolic: '',
          blood_oxygen_spo2: '',
          body_temp_celsius: '',
          steps: ''
        });
      }
    } catch (error) {
      console.error('Error logging biometrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone) => {
    if (zone === 'green') return 'text-green-500 bg-green-500/20 border-green-500';
    if (zone === 'yellow') return 'text-yellow-500 bg-yellow-500/20 border-yellow-500';
    if (zone === 'red') return 'text-red-500 bg-red-500/20 border-red-500';
    return 'text-gray-500';
  };

  const getZoneIcon = (zone) => {
    if (zone === 'green') return '🟢';
    if (zone === 'yellow') return '🟡';
    if (zone === 'red') return '🔴';
    return '⚪';
  };

  return (
    <div className="p-4" data-testid="biometrics-tracker">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Biometric Tracker</h1>
        </div>

        <Card className="bg-white/90 border-sky-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Log Your Biometrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="heart-rate" className="text-slate-600 flex items-center text-sm">
                  <Heart className="w-3 h-3 mr-1 text-rose-500" />
                  Heart Rate (BPM)
                </Label>
                <Input
                  id="heart-rate"
                  type="number"
                  placeholder="e.g., 72"
                  value={biometrics.heart_rate_bpm}
                  onChange={(e) => handleInputChange('heart_rate_bpm', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="heart-rate-input"
                />
                <p className="text-xs text-slate-400">Normal: 60-100</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bp-systolic" className="text-slate-600 flex items-center text-sm">
                  <Activity className="w-3 h-3 mr-1 text-sky-500" />
                  BP Systolic
                </Label>
                <Input
                  id="bp-systolic"
                  type="number"
                  placeholder="e.g., 120"
                  value={biometrics.blood_pressure_systolic}
                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="bp-systolic-input"
                />
                <p className="text-xs text-slate-400">Normal: &lt;120</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="bp-diastolic" className="text-slate-600 flex items-center text-sm">
                  <Activity className="w-3 h-3 mr-1 text-sky-500" />
                  BP Diastolic
                </Label>
                <Input
                  id="bp-diastolic"
                  type="number"
                  placeholder="e.g., 80"
                  value={biometrics.blood_pressure_diastolic}
                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="bp-diastolic-input"
                />
                <p className="text-xs text-slate-400">Normal: &lt;80</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="spo2" className="text-slate-600 flex items-center text-sm">
                  <Droplet className="w-3 h-3 mr-1 text-cyan-500" />
                  SpO2 (%)
                </Label>
                <Input
                  id="spo2"
                  type="number"
                  placeholder="e.g., 98"
                  value={biometrics.blood_oxygen_spo2}
                  onChange={(e) => handleInputChange('blood_oxygen_spo2', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="spo2-input"
                />
                <p className="text-xs text-slate-400">Normal: 95-100%</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="temp" className="text-slate-600 flex items-center text-sm">
                  <Thermometer className="w-3 h-3 mr-1 text-orange-500" />
                  Temp (°C)
                </Label>
                <Input
                  id="temp"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 36.6"
                  value={biometrics.body_temp_celsius}
                  onChange={(e) => handleInputChange('body_temp_celsius', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="temp-input"
                />
                <p className="text-xs text-slate-400">Normal: 36.1-37.2</p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="steps" className="text-slate-600 flex items-center text-sm">
                  <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                  Steps Today
                </Label>
                <Input
                  id="steps"
                  type="number"
                  placeholder="e.g., 8500"
                  value={biometrics.steps}
                  onChange={(e) => handleInputChange('steps', e.target.value)}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="steps-input"
                />
                <p className="text-xs text-slate-400">Goal: 10,000</p>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-5"
              data-testid="log-biometrics-button"
            >
              {loading ? 'Logging...' : 'Log Biometrics'}
            </Button>
          </CardContent>
        </Card>

        {zones && zones.zones && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center justify-between">
                <span>Your Health Zones</span>
                <span className="text-2xl">
                  {getZoneIcon(zones.overall)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(zones.zones).map(([key, data]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg border ${getZoneColor(data.zone)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-lg">{getZoneIcon(data.zone)}</span>
                    </div>
                    {data.systolic ? (
                      <div className="text-sm font-bold text-slate-800">
                        {data.systolic}/{data.diastolic} mmHg
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-slate-800">
                        {data.value} {key === 'blood_oxygen' ? '%' : ''}
                      </div>
                    )}
                    <div className="text-xs mt-1 text-slate-500">{data.status}</div>
                  </div>
                ))}
              </div>

              {zones.overall === 'red' && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-300 rounded-lg">
                  <p className="text-rose-700 text-sm font-semibold">
                    Warning: Some readings are in the red zone. Please consult your healthcare provider.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BiometricsTracker;
