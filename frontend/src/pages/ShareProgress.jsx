import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Droplets, Footprints, Share2, Download, Flame } from 'lucide-react';
import { getAuthHeaders } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ShareProgress = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/api/share/health-summary`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const text = summary
      ? `My TokHealth Progress Today!\n` +
        `Calories: ${summary.nutrition.calories} | Protein: ${summary.nutrition.protein_g}g\n` +
        `Water: ${(summary.hydration_ml / 1000).toFixed(1)}L | Steps: ${summary.steps}\n` +
        `Streak: ${summary.streak_days} days\n` +
        `#TokHealth #KeepPeopleAlive`
      : 'Check out TokHealth - Keep People Alive!';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My TokHealth Progress', text });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Progress copied to clipboard!');
    }
  };

  const zoneColors = {
    green: { bg: 'from-emerald-500 to-green-600', text: 'text-emerald-100', label: 'Green Zone' },
    yellow: { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-100', label: 'Yellow Zone' },
    red: { bg: 'from-red-500 to-rose-600', text: 'text-red-100', label: 'Red Zone' },
    grey: { bg: 'from-slate-400 to-slate-500', text: 'text-slate-200', label: 'Start Tracking!' },
  };

  if (loading) return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;

  const zone = zoneColors[summary?.zone || 'grey'];

  return (
    <div className="p-4 space-y-4" data-testid="share-progress">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Share My Progress</h2>
        <p className="text-slate-500 text-sm">Show the world your health journey</p>
      </div>

      {/* Shareable Card */}
      <div ref={cardRef}>
        <Card className={`bg-gradient-to-br ${zone.bg} border-0 shadow-xl overflow-hidden`}>
          <CardContent className="p-6 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6" />
                <span className="font-bold text-lg">TOKHEALTH</span>
              </div>
              <div className="text-xs opacity-80">{summary?.date}</div>
            </div>

            {/* Name & Zone */}
            <div className="text-center mb-5">
              <div className="text-2xl font-bold mb-1">{summary?.name || 'Health Warrior'}</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur`}>
                {zone.label}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <Heart className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <div className="text-xl font-bold">{summary?.nutrition?.calories || 0}</div>
                <div className="text-xs opacity-70">Calories</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <Activity className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <div className="text-xl font-bold">{summary?.nutrition?.protein_g || 0}g</div>
                <div className="text-xs opacity-70">Protein</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <Droplets className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <div className="text-xl font-bold">{((summary?.hydration_ml || 0) / 1000).toFixed(1)}L</div>
                <div className="text-xs opacity-70">Water</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <Footprints className="w-5 h-5 mx-auto mb-1 opacity-80" />
                <div className="text-xl font-bold">{summary?.steps || 0}</div>
                <div className="text-xs opacity-70">Steps</div>
              </div>
            </div>

            {/* Streak */}
            {summary?.streak_days > 0 && (
              <div className="text-center bg-white/10 rounded-xl py-2">
                <Flame className="w-5 h-5 inline mr-1" />
                <span className="font-bold text-lg">{summary.streak_days}</span>
                <span className="text-sm ml-1 opacity-80">day streak</span>
              </div>
            )}

            {/* Footer */}
            <div className="text-center mt-4 text-xs opacity-60">
              Keep People Alive | tokhealth.com
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleShare}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
          data-testid="share-button"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Progress
        </Button>
      </div>

      <p className="text-xs text-center text-slate-400">
        Keep People Alive - Share your journey, inspire others
      </p>
    </div>
  );
};

export default ShareProgress;
