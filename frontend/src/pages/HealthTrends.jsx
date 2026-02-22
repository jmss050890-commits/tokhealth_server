import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Heart, Footprints, Activity, Droplets, Target, Lightbulb, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const HealthTrends = () => {
  const [period, setPeriod] = useState(7);
  const [trends, setTrends] = useState(null);
  const [insights, setInsights] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [trendsRes, insightsRes, goalsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/trends/summary?days=${period}`),
        fetch(`${BACKEND_URL}/api/trends/insights?days=${period}`),
        fetch(`${BACKEND_URL}/api/trends/goals`)
      ]);

      const trendsData = await trendsRes.json();
      const insightsData = await insightsRes.json();
      const goalsData = await goalsRes.json();

      if (trendsData.success) setTrends(trendsData.data);
      if (insightsData.success) setInsights(insightsData.data?.insights || []);
      if (goalsData.success) setGoals(goalsData.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getInsightColor = (type) => {
    if (type === 'positive') return 'bg-emerald-50 border-emerald-200 text-emerald-800';
    if (type === 'warning') return 'bg-red-50 border-red-200 text-red-800';
    if (type === 'attention') return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-sky-50 border-sky-200 text-sky-800';
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-emerald-500';
    if (pct >= 70) return 'bg-sky-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-red-400';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <Activity className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="health-trends">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Health Trends</h1>
          </div>
          <p className="text-slate-500 text-sm">See your progress over time</p>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center gap-2">
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              onClick={() => setPeriod(days)}
              variant={period === days ? 'default' : 'outline'}
              size="sm"
              className={period === days ? 'bg-sky-600' : 'border-sky-300 text-sky-600'}
            >
              {days}D
            </Button>
          ))}
        </div>

        {/* Today's Goals */}
        {goals && (
          <Card className="bg-gradient-to-r from-sky-50 to-cyan-50 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-sky-600" />
                  Today's Goals
                </span>
                <span className="text-sky-600 font-bold">{goals.overall_completion}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goals.goals?.map((goal, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{goal.name}</span>
                      <span className="text-slate-800 font-medium">
                        {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(goal.percentage)}`}
                        style={{ width: `${goal.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <p className="text-sm">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Metrics Summary */}
        {trends?.biometrics && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-sky-600" />
                {period}-Day Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {/* Heart Rate */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-slate-600 text-xs">Heart Rate</span>
                    </div>
                    {getTrendIcon(trends.biometrics.heart_rate?.trend)}
                  </div>
                  {trends.biometrics.heart_rate?.avg ? (
                    <div>
                      <div className="text-xl font-bold text-slate-800">
                        {trends.biometrics.heart_rate.avg} <span className="text-sm font-normal">BPM</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Range: {trends.biometrics.heart_rate.min}-{trends.biometrics.heart_rate.max}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">No data</div>
                  )}
                </div>

                {/* Steps */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Footprints className="w-4 h-4 text-sky-500" />
                      <span className="text-slate-600 text-xs">Steps</span>
                    </div>
                    {getTrendIcon(trends.biometrics.steps?.trend)}
                  </div>
                  {trends.biometrics.steps?.avg ? (
                    <div>
                      <div className="text-xl font-bold text-slate-800">
                        {Math.round(trends.biometrics.steps.avg).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        Best: {trends.biometrics.steps.max?.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">No data</div>
                  )}
                </div>

                {/* Blood Pressure */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-violet-500" />
                      <span className="text-slate-600 text-xs">Blood Pressure</span>
                    </div>
                    {getTrendIcon(trends.biometrics.blood_pressure_systolic?.trend)}
                  </div>
                  {trends.biometrics.blood_pressure_systolic?.avg ? (
                    <div>
                      <div className="text-xl font-bold text-slate-800">
                        {Math.round(trends.biometrics.blood_pressure_systolic.avg)}
                        <span className="text-sm font-normal text-slate-500">/</span>
                        <span className="text-lg">{Math.round(trends.biometrics.blood_pressure_systolic.min)}</span>
                      </div>
                      <div className="text-xs text-slate-400">Avg systolic</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">No data</div>
                  )}
                </div>

                {/* Blood Oxygen */}
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <Droplets className="w-4 h-4 text-cyan-500" />
                      <span className="text-slate-600 text-xs">SpO2</span>
                    </div>
                    {getTrendIcon(trends.biometrics.blood_oxygen?.trend)}
                  </div>
                  {trends.biometrics.blood_oxygen?.avg ? (
                    <div>
                      <div className="text-xl font-bold text-slate-800">
                        {trends.biometrics.blood_oxygen.avg}%
                      </div>
                      <div className="text-xs text-slate-400">
                        Range: {trends.biometrics.blood_oxygen.min}-{trends.biometrics.blood_oxygen.max}%
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">No data</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nutrition Summary */}
        {trends?.nutrition && (
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Nutrition ({period} days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Meals</div>
                  <div className="text-lg font-bold text-slate-800">{trends.nutrition.meals_logged}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Avg Cal/Day</div>
                  <div className="text-lg font-bold text-slate-800">{Math.round(trends.nutrition.avg_daily_calories)}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="text-slate-500 text-xs">Avg Protein</div>
                  <div className="text-lg font-bold text-slate-800">{Math.round(trends.nutrition.avg_daily_protein)}g</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - Track Progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthTrends;
