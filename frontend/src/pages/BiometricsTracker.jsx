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
      
      // Filter out empty values
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
        // Fetch zones
        const zonesResponse = await fetch(`${BACKEND_URL}/api/biometrics/zones`);
        const zonesData = await zonesResponse.json();
        setZones(zonesData.data);
        
        // Clear form
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
    <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4\" data-testid=\"biometrics-tracker\">
      <div className=\"max-w-4xl mx-auto space-y-6\">
        {/* Header */}
        <div className=\"flex items-center space-x-3 mb-6\">
          <Activity className=\"w-8 h-8 text-red-500\" />
          <h1 className=\"text-3xl font-bold text-white\">Biometric Tracker</h1>
        </div>

        {/* Input Form */}
        <Card className=\"bg-gray-900/50 border-gray-700\">
          <CardHeader>
            <CardTitle className=\"text-white\">Log Your Biometrics</CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              {/* Heart Rate */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"heart-rate\" className=\"text-gray-300 flex items-center\">
                  <Heart className=\"w-4 h-4 mr-2 text-red-500\" />
                  Heart Rate (BPM)
                </Label>
                <Input
                  id=\"heart-rate\"
                  type=\"number\"
                  placeholder=\"e.g., 72\"
                  value={biometrics.heart_rate_bpm}
                  onChange={(e) => handleInputChange('heart_rate_bpm', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"heart-rate-input\"
                />
                <p className=\"text-xs text-gray-500\">Normal: 60-100 BPM</p>
              </div>

              {/* Blood Pressure Systolic */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"bp-systolic\" className=\"text-gray-300 flex items-center\">
                  <Activity className=\"w-4 h-4 mr-2 text-blue-500\" />
                  Blood Pressure (Systolic)
                </Label>
                <Input
                  id=\"bp-systolic\"
                  type=\"number\"
                  placeholder=\"e.g., 120\"
                  value={biometrics.blood_pressure_systolic}
                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"bp-systolic-input\"
                />
                <p className=\"text-xs text-gray-500\">Normal: <120 mmHg</p>
              </div>

              {/* Blood Pressure Diastolic */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"bp-diastolic\" className=\"text-gray-300 flex items-center\">
                  <Activity className=\"w-4 h-4 mr-2 text-blue-500\" />
                  Blood Pressure (Diastolic)
                </Label>
                <Input
                  id=\"bp-diastolic\"
                  type=\"number\"
                  placeholder=\"e.g., 80\"
                  value={biometrics.blood_pressure_diastolic}
                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"bp-diastolic-input\"
                />
                <p className=\"text-xs text-gray-500\">Normal: <80 mmHg</p>
              </div>

              {/* Blood Oxygen */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"spo2\" className=\"text-gray-300 flex items-center\">
                  <Droplet className=\"w-4 h-4 mr-2 text-cyan-500\" />
                  Blood Oxygen (SpO2)
                </Label>
                <Input
                  id=\"spo2\"
                  type=\"number\"
                  placeholder=\"e.g., 98\"
                  value={biometrics.blood_oxygen_spo2}
                  onChange={(e) => handleInputChange('blood_oxygen_spo2', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"spo2-input\"
                />
                <p className=\"text-xs text-gray-500\">Normal: 95-100%</p>
              </div>

              {/* Body Temperature */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"temp\" className=\"text-gray-300 flex items-center\">
                  <Thermometer className=\"w-4 h-4 mr-2 text-orange-500\" />
                  Body Temperature (°C)
                </Label>
                <Input
                  id=\"temp\"
                  type=\"number\"
                  step=\"0.1\"
                  placeholder=\"e.g., 36.6\"
                  value={biometrics.body_temp_celsius}
                  onChange={(e) => handleInputChange('body_temp_celsius', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"temp-input\"
                />
                <p className=\"text-xs text-gray-500\">Normal: 36.1-37.2°C</p>
              </div>

              {/* Steps */}
              <div className=\"space-y-2\">
                <Label htmlFor=\"steps\" className=\"text-gray-300 flex items-center\">
                  <TrendingUp className=\"w-4 h-4 mr-2 text-green-500\" />
                  Steps Today
                </Label>
                <Input
                  id=\"steps\"
                  type=\"number\"
                  placeholder=\"e.g., 8500\"
                  value={biometrics.steps}
                  onChange={(e) => handleInputChange('steps', e.target.value)}
                  className=\"bg-gray-800 border-gray-700 text-white\"
                  data-testid=\"steps-input\"
                />
                <p className=\"text-xs text-gray-500\">Goal: 10,000 steps</p>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className=\"w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6\"
              data-testid=\"log-biometrics-button\"
            >
              {loading ? 'Logging...' : 'Log Biometrics'}
            </Button>
          </CardContent>
        </Card>

        {/* Zones Display */}
        {zones && zones.zones && (
          <Card className=\"bg-gray-900/50 border-gray-700\">
            <CardHeader>
              <CardTitle className=\"text-white flex items-center justify-between\">
                <span>Your Health Zones</span>
                <span className={`text-2xl`}>
                  {getZoneIcon(zones.overall)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                {Object.entries(zones.zones).map(([key, data]) => (
                  <div 
                    key={key}
                    className={`p-4 rounded-lg border ${getZoneColor(data.zone)}`}
                  >
                    <div className=\"flex items-center justify-between mb-2\">
                      <span className=\"text-sm font-semibold text-white capitalize\">
                        {key.replace('_', ' ')}
                      </span>
                      <span className=\"text-xl\">{getZoneIcon(data.zone)}</span>
                    </div>
                    {data.systolic ? (
                      <div className=\"text-lg font-bold text-white\">
                        {data.systolic}/{data.diastolic} mmHg
                      </div>
                    ) : (
                      <div className=\"text-lg font-bold text-white\">
                        {data.value} {key === 'blood_oxygen' ? '%' : ''}
                      </div>
                    )}
                    <div className=\"text-xs mt-1 opacity-80\">{data.status}</div>
                  </div>
                ))}
              </div>

              {zones.overall === 'red' && (
                <div className=\"mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg\">
                  <p className=\"text-red-400 text-sm font-semibold\">
                    ⚠️ Some readings are in the red zone. Please consult your healthcare provider.
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
