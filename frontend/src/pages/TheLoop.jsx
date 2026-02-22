import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Droplets, Moon, TrendingUp, Brain, Utensils, Footprints, ThermometerSun } from 'lucide-react';

const TheLoop = () => {
  const [loopData, setLoopData] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchLoopData();
  }, []);

  const fetchLoopData = async () => {
    try {
      setLoading(true);
      
      // Fetch all health data
      const [biometricsRes, nutritionRes, loopStatusRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/biometrics/today`),
        fetch(`${BACKEND_URL}/api/nutrition/today`),
        fetch(`${BACKEND_URL}/api/loop/status`)
      ]);

      const biometrics = await biometricsRes.json();
      const nutrition = await nutritionRes.json();
      const loopStatus = await loopStatusRes.json();

      // Combine all data
      setLoopData({
        biometrics: biometrics.data,
        nutrition: nutrition.data,
        status: loopStatus.data
      });
    } catch (error) {
      console.error('Error fetching Loop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getZoneColor = (zone) => {
    if (zone === 'green') return 'bg-green-500';
    if (zone === 'yellow') return 'bg-yellow-500';
    if (zone === 'red') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getZoneBorder = (zone) => {
    if (zone === 'green') return 'border-green-500';
    if (zone === 'yellow') return 'border-yellow-500';
    if (zone === 'red') return 'border-red-500';
    return 'border-gray-500';
  };

  const getZoneGlow = (zone) => {
    if (zone === 'green') return 'shadow-green-500/50';
    if (zone === 'yellow') return 'shadow-yellow-500/50';
    if (zone === 'red') return 'shadow-red-500/50';
    return 'shadow-gray-500/50';
  };

  const getZoneText = (zone) => {
    if (zone === 'green') return 'text-green-500';
    if (zone === 'yellow') return 'text-yellow-500';
    if (zone === 'red') return 'text-red-500';
    return 'text-gray-500';
  };

  const calculateMetricZone = (value, target, type = 'calories') => {
    if (!value || !target) return 'gray';
    
    const percentage = (value / target) * 100;
    
    if (type === 'calories' || type === 'protein' || type === 'water') {
      if (percentage >= 80 && percentage <= 110) return 'green';
      if (percentage >= 60 && percentage <= 130) return 'yellow';
      return 'red';
    }
    
    if (type === 'steps') {
      if (percentage >= 80) return 'green';
      if (percentage >= 50) return 'yellow';
      return 'yellow';
    }
    
    return 'gray';
  };

  const getOverallZone = () => {
    if (!loopData) return 'gray';
    
    const metrics = [];
    
    // Nutrition zones
    if (loopData.nutrition?.totals) {
      metrics.push(calculateMetricZone(loopData.nutrition.totals.calories, 2000, 'calories'));
      metrics.push(calculateMetricZone(loopData.nutrition.totals.protein_g, 120, 'protein'));
    }
    
    // Biometrics zones
    if (loopData.biometrics) {
      const hr = loopData.biometrics.heart_rate_bpm;
      if (hr) {
        if (hr >= 60 && hr <= 100) metrics.push('green');
        else if (hr >= 50 && hr <= 120) metrics.push('yellow');
        else metrics.push('red');
      }
      
      const steps = loopData.biometrics.steps;
      if (steps) {
        metrics.push(calculateMetricZone(steps, 10000, 'steps'));
      }
    }
    
    // Determine overall
    if (metrics.includes('red')) return 'red';
    if (metrics.includes('yellow')) return 'yellow';
    if (metrics.length > 0) return 'green';
    return 'gray';
  };

  const overallZone = getOverallZone();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading The Loop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4" data-testid="the-loop">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-green-500">THE</span>{' '}
            <span className="text-white">LOOP</span>
          </h1>
          <p className="text-gray-400">Your complete health status at a glance</p>
          <p className="text-gray-600 text-sm italic mt-1">For Jerome Jr. & Wade - The Full Circle 🔄</p>
        </div>

        {/* Central Loop Status */}
        <div className="flex justify-center mb-8">
          <div className={`relative w-64 h-64 rounded-full border-8 ${getZoneBorder(overallZone)} ${getZoneGlow(overallZone)} shadow-2xl flex items-center justify-center bg-gradient-to-br from-gray-900 to-black`}>
            <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{
              background: overallZone === 'green' ? 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)' :
                         overallZone === 'yellow' ? 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, transparent 70%)' :
                         overallZone === 'red' ? 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)' :
                         'radial-gradient(circle, rgba(107,114,128,0.3) 0%, transparent 70%)'
            }}></div>
            
            <div className="text-center z-10">
              <div className={`text-7xl font-bold ${getZoneText(overallZone)} mb-2`}>
                {overallZone === 'green' && '🟢'}
                {overallZone === 'yellow' && '🟡'}
                {overallZone === 'red' && '🔴'}
                {overallZone === 'gray' && '⚪'}
              </div>
              <div className="text-white text-2xl font-bold uppercase tracking-wider">
                {overallZone === 'gray' ? 'No Data' : overallZone}
              </div>
              <div className="text-gray-400 text-sm mt-2">
                {overallZone === 'green' && 'Keep Going!'}
                {overallZone === 'yellow' && 'Stay Focused'}
                {overallZone === 'red' && 'Take Action'}
                {overallZone === 'gray' && 'Start Tracking'}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Message */}
        {overallZone !== 'gray' && (
          <Card className={`border-2 ${getZoneBorder(overallZone)} ${getZoneGlow(overallZone)} shadow-xl`}>
            <CardContent className="p-6 text-center">
              {overallZone === 'green' && (
                <div>
                  <p className="text-green-400 text-xl font-semibold mb-2">Excellent Work! You're In The Green Zone! 🎉</p>
                  <p className="text-gray-300">Your health metrics are on target. Keep up the great work and maintain this momentum!</p>
                </div>
              )}
              {overallZone === 'yellow' && (
                <div>
                  <p className="text-yellow-400 text-xl font-semibold mb-2">Stay Focused - Yellow Zone 💪</p>
                  <p className="text-gray-300">Some metrics need attention. Review the details below and make adjustments today.</p>
                </div>
              )}
              {overallZone === 'red' && (
                <div>
                  <p className="text-red-400 text-xl font-semibold mb-2">Action Required - Red Zone ⚠️</p>
                  <p className="text-gray-300">Important health metrics need immediate attention. Review your plan and consider consulting your healthcare provider.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nutrition */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-green-500" />
                Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loopData?.nutrition?.totals ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Calories</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{Math.round(loopData.nutrition.totals.calories)}/2000</span>
                      <span className="text-xl">
                        {calculateMetricZone(loopData.nutrition.totals.calories, 2000) === 'green' && '🟢'}
                        {calculateMetricZone(loopData.nutrition.totals.calories, 2000) === 'yellow' && '🟡'}
                        {calculateMetricZone(loopData.nutrition.totals.calories, 2000) === 'red' && '🔴'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Protein</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{Math.round(loopData.nutrition.totals.protein_g)}g/120g</span>
                      <span className="text-xl">
                        {calculateMetricZone(loopData.nutrition.totals.protein_g, 120) === 'green' && '🟢'}
                        {calculateMetricZone(loopData.nutrition.totals.protein_g, 120) === 'yellow' && '🟡'}
                        {calculateMetricZone(loopData.nutrition.totals.protein_g, 120) === 'red' && '🔴'}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    {loopData.nutrition.meals.length} meals logged today
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No meals logged today</p>
              )}
            </CardContent>
          </Card>

          {/* Heart & Vitals */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Heart & Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loopData?.biometrics ? (
                <div className="space-y-2">
                  {loopData.biometrics.heart_rate_bpm && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Heart Rate</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{loopData.biometrics.heart_rate_bpm} BPM</span>
                        <span className="text-xl">
                          {loopData.biometrics.heart_rate_bpm >= 60 && loopData.biometrics.heart_rate_bpm <= 100 ? '🟢' :
                           loopData.biometrics.heart_rate_bpm >= 50 && loopData.biometrics.heart_rate_bpm <= 120 ? '🟡' : '🔴'}
                        </span>
                      </div>
                    </div>
                  )}
                  {loopData.biometrics.blood_pressure_systolic && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Blood Pressure</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">
                          {loopData.biometrics.blood_pressure_systolic}/{loopData.biometrics.blood_pressure_diastolic}
                        </span>
                        <span className="text-xl">
                          {loopData.biometrics.blood_pressure_systolic < 120 && loopData.biometrics.blood_pressure_diastolic < 80 ? '🟢' :
                           loopData.biometrics.blood_pressure_systolic < 140 ? '🟡' : '🔴'}
                        </span>
                      </div>
                    </div>
                  )}
                  {loopData.biometrics.blood_oxygen_spo2 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Blood Oxygen</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{loopData.biometrics.blood_oxygen_spo2}%</span>
                        <span className="text-xl">
                          {loopData.biometrics.blood_oxygen_spo2 >= 95 ? '🟢' :
                           loopData.biometrics.blood_oxygen_spo2 >= 90 ? '🟡' : '🔴'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No vitals logged today</p>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Footprints className="w-5 h-5 mr-2 text-blue-500" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loopData?.biometrics?.steps ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Steps</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{loopData.biometrics.steps.toLocaleString()}/10,000</span>
                      <span className="text-xl">
                        {calculateMetricZone(loopData.biometrics.steps, 10000, 'steps') === 'green' && '🟢'}
                        {calculateMetricZone(loopData.biometrics.steps, 10000, 'steps') === 'yellow' && '🟡'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getZoneColor(calculateMetricZone(loopData.biometrics.steps, 10000, 'steps'))}`}
                      style={{width: `${Math.min((loopData.biometrics.steps / 10000) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No activity logged today</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={fetchLoopData}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-6"
          >
            <Activity className="w-5 h-5 mr-2" />
            Refresh The Loop
          </Button>
          
          <Button 
            variant="outline"
            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10 py-6"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Trends
          </Button>
          
          <Button 
            variant="outline"
            className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10 py-6"
          >
            <Brain className="w-5 h-5 mr-2" />
            Health Coach
          </Button>
        </div>

        {/* Family Motto */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm italic">
            "Fix it, Run it, Again - Until Wellness Wins" 💚
          </p>
          <p className="text-gray-600 text-xs mt-1">
            For families everywhere - Jerome Jr. & Wade, this is your legacy 🔄
          </p>
        </div>
      </div>
    </div>
  );
};

export default TheLoop;
