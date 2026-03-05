import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Trophy, Star, Lock, Check } from 'lucide-react';
import { getAuthHeaders } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const BADGE_ICONS = {
  'utensils': '🍽',
  'droplets': '💧',
  'footprints': '👣',
  'heart-pulse': '❤',
  'flame': '🔥',
  'trophy': '🏆',
  'book-open': '📖',
  'sparkles': '✨',
  'chef-hat': '👨‍🍳',
  'crown': '👑',
};

const Gamification = () => {
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [streakRes, badgesRes] = await Promise.all([
        fetch(`${API_URL}/api/gamification/streaks`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/gamification/badges`, { headers: getAuthHeaders() }),
      ]);
      const streakJson = await streakRes.json();
      const badgesJson = await badgesRes.json();
      if (streakJson.success) setStreakData(streakJson.data);
      if (badgesJson.success) setBadges(badgesJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gamification/check-in`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setStreakData(prev => ({
          ...prev,
          current_streak: data.data.current_streak,
          best_streak: data.data.best_streak,
        }));
        if (data.data.new_badge) setNewBadge(data.data.new_badge);
      }

      // Also check for new badges
      const badgeCheck = await fetch(`${API_URL}/api/gamification/check-badges`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const badgeData = await badgeCheck.json();
      if (badgeData.success && badgeData.data.new_badges.length > 0) {
        setNewBadge(badgeData.data.new_badges[0]);
      }

      // Reload badges
      const badgesRes = await fetch(`${API_URL}/api/gamification/badges`, { headers: getAuthHeaders() });
      const badgesJson = await badgesRes.json();
      if (badgesJson.success) setBadges(badgesJson.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>;

  const earnedCount = badges.filter(b => b.earned).length;

  return (
    <div className="p-4 space-y-4" data-testid="gamification-page">
      {/* New Badge Popup */}
      {newBadge && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setNewBadge(null)}>
          <Card className="bg-gradient-to-br from-amber-400 to-yellow-500 border-0 max-w-xs w-full animate-bounce-slow" data-testid="new-badge-popup">
            <CardContent className="p-8 text-center text-white">
              <div className="text-5xl mb-3">{BADGE_ICONS[newBadge.icon] || '🏅'}</div>
              <h3 className="text-xl font-bold mb-1">Badge Earned!</h3>
              <p className="text-lg font-semibold">{newBadge.name}</p>
              <p className="text-sm opacity-80 mt-1">{newBadge.desc}</p>
              <Button className="mt-4 bg-white text-amber-600 hover:bg-amber-50" onClick={() => setNewBadge(null)}>
                Awesome!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Streak Section */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 border-0 shadow-lg">
        <CardContent className="p-6 text-white text-center">
          <Flame className="w-10 h-10 mx-auto mb-2" />
          <div className="text-4xl font-bold">{streakData?.current_streak || 0}</div>
          <div className="text-sm opacity-80 mb-3">Day Streak</div>
          <div className="flex justify-center gap-6 text-xs">
            <div>
              <div className="font-bold text-lg">{streakData?.best_streak || 0}</div>
              <div className="opacity-70">Best Streak</div>
            </div>
            <div>
              <div className="font-bold text-lg">{earnedCount}</div>
              <div className="opacity-70">Badges</div>
            </div>
          </div>
          <Button
            onClick={handleCheckIn}
            className="mt-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white"
            data-testid="check-in-button"
          >
            <Check className="w-4 h-4 mr-2" />
            Daily Check-In
          </Button>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Badges ({earnedCount}/{badges.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {badges.map(badge => (
            <Card
              key={badge.id}
              className={`border ${badge.earned ? 'bg-amber-50 border-amber-300 shadow-md' : 'bg-slate-50 border-slate-200 opacity-60'}`}
              data-testid={`badge-${badge.id}`}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">
                  {badge.earned ? (BADGE_ICONS[badge.icon] || '🏅') : <Lock className="w-6 h-6 mx-auto text-slate-400" />}
                </div>
                <div className={`text-xs font-bold ${badge.earned ? 'text-amber-700' : 'text-slate-500'}`}>
                  {badge.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{badge.desc}</div>
                {!badge.earned && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-amber-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((badge.progress / badge.threshold) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{badge.progress}/{badge.threshold}</div>
                  </div>
                )}
                {badge.earned && badge.earned_date && (
                  <div className="text-xs text-amber-500 mt-1">
                    <Star className="w-3 h-3 inline mr-0.5" />
                    Earned
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="text-xs text-center text-slate-400 pt-2">
        Keep People Alive - Every Day Counts
      </p>
    </div>
  );
};

export default Gamification;
