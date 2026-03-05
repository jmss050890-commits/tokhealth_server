import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, BookOpen, Bell, Pill, Droplets, Phone, FileText, User, Users, BarChart3, LogOut, Upload, Sparkles, Shield, ScanLine, ChevronDown, ChevronUp, Share2, Flame, Trophy } from 'lucide-react';
import BiometricsTracker from '@/pages/BiometricsTracker';
import NutritionLogger from '@/pages/NutritionLogger';
import TheLoop from '@/pages/TheLoop';
import WisdomVault from '@/pages/WisdomVault';
import EmergencyContacts from '@/pages/EmergencyContacts';
import PrescriptionTracker from '@/pages/PrescriptionTracker';
import HealthCoach from '@/pages/HealthCoach';
import UserProfile from '@/pages/UserProfile';
import BackToGreen from '@/pages/BackToGreen';
import MedicalExport from '@/pages/MedicalExport';
import HydrationTracker from '@/pages/HydrationTracker';
import FamilyManager from '@/pages/FamilyManager';
import HealthTrends from '@/pages/HealthTrends';
import ImportData from '@/pages/ImportData';
import SpiritualVault from '@/pages/SpiritualVault';
import SupportTokHealth from '@/pages/SupportTokHealth';
import DataPrivacy from '@/pages/DataPrivacy';
import AppleHealthKit from '@/pages/AppleHealthKit';
import NotificationSettings from '@/pages/NotificationSettings';
import BarcodeScanner from '@/pages/BarcodeScanner';
import ShareProgress from '@/pages/ShareProgress';
import Gamification from '@/pages/Gamification';
import AskCoachButton from '@/components/AskCoachButton';
import { getAuthHeaders } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

const Dashboard = ({ currentUser, onLogout }) => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSupport, setShowSupport] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [quickStats, setQuickStats] = useState({
    calories: 0,
    caloriesTarget: 2000,
    protein: 0,
    proteinTarget: 120,
    steps: 0,
    stepsTarget: 10000,
    water: 0,
    waterTarget: 2500
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch quick stats on load
  React.useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const token = localStorage.getItem('tokhealth_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const [nutritionRes, biometricsRes, hydrationRes, targetsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/nutrition/today`, { headers }),
          fetch(`${BACKEND_URL}/api/biometrics/today`, { headers }),
          fetch(`${BACKEND_URL}/api/hydration/today`, { headers }),
          fetch(`${BACKEND_URL}/api/profile/targets`, { headers })
        ]);

        const nutrition = await nutritionRes.json();
        const biometrics = await biometricsRes.json();
        const hydration = await hydrationRes.json();
        const targets = await targetsRes.json();

        setQuickStats({
          calories: nutrition.data?.totals?.calories || 0,
          caloriesTarget: targets.data?.recommended_calories || 2000,
          protein: nutrition.data?.totals?.protein_g || 0,
          proteinTarget: targets.data?.recommended_protein_g || 120,
          steps: biometrics.data?.steps || 0,
          stepsTarget: targets.data?.recommended_steps || 10000,
          water: hydration.data?.total_ml || 0,
          waterTarget: targets.data?.recommended_water_ml || 2500
        });
      } catch (error) {
        console.error('Error fetching quick stats:', error);
      }
    };

    fetchQuickStats();
    // Auto daily check-in for streaks
    fetch(`${BACKEND_URL}/api/gamification/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});
  }, [BACKEND_URL]);

  const BackButton = () => (
    <div className="bg-gradient-to-r from-sky-100 to-cyan-100 p-4 sticky top-0 z-10">
      <Button 
        onClick={() => setCurrentView('dashboard')}
        variant="outline"
        className="border-sky-400 text-sky-700 hover:bg-sky-100"
        data-testid="back-to-dashboard"
      >
        &larr; {t('common.back')}
      </Button>
    </div>
  );

  if (currentView === 'coach') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <HealthCoach />
      </div>
    );
  }

  if (currentView === 'prescriptions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <PrescriptionTracker />
        <AskCoachButton context="User is managing their prescriptions and medications" pageTitle="Prescriptions" />
      </div>
    );
  }

  if (currentView === 'emergency') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <EmergencyContacts />
      </div>
    );
  }

  if (currentView === 'wisdom') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <WisdomVault />
        <AskCoachButton context="User is in their Wisdom Vault for health journaling and lab results" pageTitle="Wisdom Vault" />
      </div>
    );
  }

  if (currentView === 'loop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <TheLoop />
        <AskCoachButton context="User is viewing The Loop health status dashboard with zones" pageTitle="The Loop" />
      </div>
    );
  }

  if (currentView === 'biometrics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <BiometricsTracker />
        <AskCoachButton context="User is tracking biometric readings like heart rate and blood pressure" pageTitle="Biometrics" />
      </div>
    );
  }

  if (currentView === 'nutrition') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <NutritionLogger />
        <AskCoachButton context="User is logging meals and tracking nutrition" pageTitle="Nutrition" />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <UserProfile />
        <AskCoachButton context="User is editing their health profile and baseline information" pageTitle="Profile" />
      </div>
    );
  }

  if (currentView === 'backtogreen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <BackToGreen currentZone="yellow" onClose={() => setCurrentView('dashboard')} />
        <AskCoachButton context="User needs help getting back to the green health zone" pageTitle="Back to Green" />
      </div>
    );
  }

  if (currentView === 'export') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <MedicalExport />
        <AskCoachButton context="User is exporting their medical data report" pageTitle="Medical Export" />
      </div>
    );
  }

  if (currentView === 'hydration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <HydrationTracker />
        <AskCoachButton context="User is tracking their water and hydration intake" pageTitle="Hydration" />
      </div>
    );
  }

  if (currentView === 'family') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <FamilyManager />
      </div>
    );
  }

  if (currentView === 'trends') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <HealthTrends />
        <AskCoachButton context="User is reviewing their health trends and analytics" pageTitle="Health Trends" />
      </div>
    );
  }

  if (currentView === 'import') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <ImportData />
      </div>
    );
  }

  if (currentView === 'spiritual') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <SpiritualVault />
        <AskCoachButton context="User is viewing their spiritual journal and prayers" pageTitle="Spiritual Vault" />
      </div>
    );
  }

  if (currentView === 'privacy') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <DataPrivacy />
      </div>
    );
  }

  if (currentView === 'healthkit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <AppleHealthKit />
        <AskCoachButton context="User is setting up Apple HealthKit sync" pageTitle="Apple HealthKit" />
      </div>
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <NotificationSettings />
        <AskCoachButton context="User is setting up health reminders and notifications" pageTitle="Notifications" />
      </div>
    );
  }

  if (currentView === 'barcode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <BarcodeScanner />
        <AskCoachButton context="User is scanning food barcodes for nutrition info" pageTitle="Barcode Scanner" />
      </div>
    );
  }

  if (currentView === 'share') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <ShareProgress />
      </div>
    );
  }

  if (currentView === 'gamification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <Gamification />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 p-4" data-testid="dashboard">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-sky-600" />
            <h1 className="text-3xl font-bold">
              <span className="text-sky-600">TOK</span>
              <span className="text-slate-800">HEALTH</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentView('profile')}
              variant="outline"
              size="sm"
              className="border-sky-400 text-sky-700 hover:bg-sky-100"
              data-testid="profile-button"
            >
              <User className="w-4 h-4 mr-1" />
              {t('profile.title')}
            </Button>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-slate-600 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* The Loop Button - Prominent */}
        <Card className="bg-gradient-to-r from-sky-500/90 to-cyan-500/90 border-white/50 shadow-2xl shadow-sky-500/30" data-testid="loop-card">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                    <Activity className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">{t('cards.loop').toUpperCase()}</h2>
              <p className="text-white/90">{t('dashboard.loop_subtitle')}</p>
              <Button 
                className="bg-white hover:bg-sky-50 text-sky-700 font-semibold px-8 py-6 text-lg shadow-lg"
                data-testid="show-loop-button"
                onClick={() => setCurrentView('loop')}
              >
                <Activity className="mr-2 h-5 w-5" />
                {t('dashboard.show_loop')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Features Grid - Daily Essentials */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'biometrics', icon: Activity, color: 'rose', testId: 'biometrics-card' },
            { key: 'nutrition', icon: Heart, color: 'emerald', testId: 'nutrition-card' },
            { key: 'coach', icon: Activity, color: 'sky', testId: 'coach-card' },
            { key: 'prescriptions', icon: Pill, color: 'pink', testId: 'prescriptions-card' },
            { key: 'hydration', icon: Droplets, color: 'cyan', testId: 'hydration-card' },
            { key: 'wisdom', icon: BookOpen, color: 'violet', testId: 'wisdom-card' },
          ].map(item => (
            <Card
              key={item.key}
              className={`bg-white/80 backdrop-blur border-sky-200 hover:border-${item.color}-400 hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => setCurrentView(item.key === 'coach' ? 'coach' : item.key)}
              data-testid={item.testId}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={`w-10 h-10 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <span className="text-slate-800 text-sm font-semibold">{t(`cards.${item.key}`)}</span>
                <p className="text-slate-500 text-xs">{t(`cards.${item.key}_desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* More Features - Expandable */}
        <div className="space-y-2">
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sky-600 text-sm font-medium hover:text-sky-700"
            data-testid="show-more-btn"
          >
            {showMore ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t('dashboard.show_less')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t('dashboard.more_features')}
              </>
            )}
          </button>

          {showMore && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'spiritual', view: 'spiritual', icon: Sparkles, color: 'purple', testId: 'spiritual-card' },
                { key: 'emergency', view: 'emergency', icon: Phone, color: 'orange', testId: 'emergency-card' },
                { key: 'barcode', view: 'barcode', icon: ScanLine, color: 'emerald', testId: 'barcode-card' },
                { key: 'trends', view: 'trends', icon: BarChart3, color: 'amber', testId: 'trends-card' },
                { key: 'export', view: 'export', icon: FileText, color: 'teal', testId: 'export-card' },
                { key: 'family', view: 'family', icon: Users, color: 'violet', testId: 'family-card' },
                { key: 'import', view: 'import', icon: Upload, color: 'cyan', testId: 'import-card' },
                { key: 'privacy', view: 'privacy', icon: Shield, color: 'sky', testId: 'privacy-card' },
                { key: 'healthkit', view: 'healthkit', icon: Heart, color: 'rose', testId: 'healthkit-card' },
                { key: 'notifications', view: 'notifications', icon: Bell, color: 'amber', testId: 'notifications-card' },
                { key: 'share', view: 'share', icon: Share2, color: 'sky', testId: 'share-card' },
                { key: 'gamification', view: 'gamification', icon: Trophy, color: 'amber', testId: 'gamification-card' },
              ].map(item => (
                <Card
                  key={item.key}
                  className="bg-white/80 backdrop-blur border-slate-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setCurrentView(item.view)}
                  data-testid={item.testId}
                >
                  <CardContent className="p-3 flex flex-col items-center text-center space-y-1">
                    <div className={`w-8 h-8 rounded-full bg-${item.color}-100 flex items-center justify-center`}>
                      <item.icon className={`w-4 h-4 text-${item.color}-600`} />
                    </div>
                    <span className="text-slate-700 text-xs font-medium">{t(`cards.${item.key}`)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <Card className="bg-white/80 backdrop-blur border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm">{t('dashboard.today_stats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">{t('dashboard.calories')}</div>
                <div className="text-lg font-bold text-slate-800">{quickStats.calories}</div>
                <div className="text-xs text-slate-400">/ {quickStats.caloriesTarget}</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">{t('dashboard.protein')}</div>
                <div className="text-lg font-bold text-slate-800">{quickStats.protein}g</div>
                <div className="text-xs text-slate-400">/ {quickStats.proteinTarget}g</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">{t('dashboard.steps')}</div>
                <div className="text-lg font-bold text-slate-800">{quickStats.steps}</div>
                <div className="text-xs text-slate-400">/ {(quickStats.stepsTarget/1000).toFixed(0)}k</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">{t('dashboard.water')}</div>
                <div className="text-lg font-bold text-slate-800">{(quickStats.water/1000).toFixed(1)}</div>
                <div className="text-xs text-slate-400">/ {(quickStats.waterTarget/1000).toFixed(1)}L</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Modal */}
      {showSupport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <SupportTokHealth onClose={() => setShowSupport(false)} />
          </div>
        </div>
      )}

      {/* Floating AI Coach */}
      <AskCoachButton context="User is on the main dashboard viewing their health overview" pageTitle="Dashboard" />

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-6 text-center space-y-2">
        <button 
          onClick={() => setShowSupport(true)}
          className="text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors"
        >
          <Heart className="w-3 h-3 inline mr-1" />
          {t('dashboard.support')}
        </button>
        <p className="text-xs text-sky-600/70 font-medium">
          TokHealth v1.0 | {t('tagline')}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;