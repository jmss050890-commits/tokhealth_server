import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, BookOpen, Bell, Pill, Droplets, Phone, FileText, User, Users, BarChart3, LogOut, Upload, Sparkles } from 'lucide-react';
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

const Dashboard = ({ currentUser, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showSupport, setShowSupport] = useState(false);

  const BackButton = () => (
    <div className="bg-gradient-to-r from-sky-100 to-cyan-100 p-4 sticky top-0 z-10">
      <Button 
        onClick={() => setCurrentView('dashboard')}
        variant="outline"
        className="border-sky-400 text-sky-700 hover:bg-sky-100"
        data-testid="back-to-dashboard"
      >
        &larr; Back
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
      </div>
    );
  }

  if (currentView === 'loop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <TheLoop />
      </div>
    );
  }

  if (currentView === 'biometrics') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <BiometricsTracker />
      </div>
    );
  }

  if (currentView === 'nutrition') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <NutritionLogger />
      </div>
    );
  }

  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <UserProfile />
      </div>
    );
  }

  if (currentView === 'backtogreen') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <BackToGreen currentZone="yellow" onClose={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  if (currentView === 'export') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <MedicalExport />
      </div>
    );
  }

  if (currentView === 'hydration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100">
        <BackButton />
        <HydrationTracker />
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
              {currentUser?.name || 'Profile'}
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
        <p className="text-slate-600 text-sm">Your AI-powered health companion</p>
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
              <h2 className="text-2xl font-bold text-white">THE LOOP</h2>
              <p className="text-white/90">See your complete health status at a glance</p>
              <Button 
                className="bg-white hover:bg-sky-50 text-sky-700 font-semibold px-8 py-6 text-lg shadow-lg"
                data-testid="show-loop-button"
                onClick={() => setCurrentView('loop')}
              >
                <Activity className="mr-2 h-5 w-5" />
                SHOW THE LOOP
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Biometrics */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="biometrics-card"
            onClick={() => setCurrentView('biometrics')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Biometrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Track vitals</p>
              <Button variant="outline" className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 text-xs py-1">
                Log Vitals
              </Button>
            </CardContent>
          </Card>

          {/* Nutrition */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="nutrition-card"
            onClick={() => setCurrentView('nutrition')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Nutrition</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Track meals</p>
              <Button variant="outline" className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 text-xs py-1">
                Log Meal
              </Button>
            </CardContent>
          </Card>

          {/* AI Coach */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="coach-card"
            onClick={() => setCurrentView('coach')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-sky-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">AI Coach</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Get guidance</p>
              <Button variant="outline" className="w-full border-sky-300 text-sky-600 hover:bg-sky-50 text-xs py-1">
                View Coach
              </Button>
            </CardContent>
          </Card>

          {/* Wisdom Vault */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="wisdom-card"
            onClick={() => setCurrentView('wisdom')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Wisdom</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Journal & wellness</p>
              <Button variant="outline" className="w-full border-violet-300 text-violet-600 hover:bg-violet-50 text-xs py-1">
                New Entry
              </Button>
            </CardContent>
          </Card>

          {/* Hydration */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-cyan-400 hover:shadow-lg transition-all cursor-pointer" 
            data-testid="hydration-card"
            onClick={() => setCurrentView('hydration')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Hydration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Today</span>
                  <span>0 / 2.5L</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-cyan-300 text-cyan-600 hover:bg-cyan-50 text-xs py-1">
                + Log Water
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Emergency Contacts */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('emergency')}
            data-testid="emergency-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Emergency</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Quick contacts & 911</p>
              <Button variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 text-xs py-1">
                Manage
              </Button>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-pink-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('prescriptions')}
            data-testid="prescriptions-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-slate-800 text-sm font-semibold">Meds</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-slate-500 text-xs mb-2">Track medications</p>
              <Button variant="outline" className="w-full border-pink-300 text-pink-600 hover:bg-pink-50 text-xs py-1">
                View Meds
              </Button>
            </CardContent>
          </Card>

          {/* Medical Export */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-teal-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('export')}
            data-testid="export-card"
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <span className="text-slate-800 text-sm font-semibold">Medical Export</span>
                <p className="text-slate-500 text-xs">Print for doctor</p>
              </div>
            </CardContent>
          </Card>

          {/* Family */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-violet-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('family')}
            data-testid="family-card"
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <span className="text-slate-800 text-sm font-semibold">Family</span>
                <p className="text-slate-500 text-xs">Multi-user</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Trends */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('trends')}
            data-testid="trends-card"
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <span className="text-slate-800 text-sm font-semibold">Health Trends</span>
                <p className="text-slate-500 text-xs">Analytics & insights</p>
              </div>
            </CardContent>
          </Card>

          {/* Import Data */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-cyan-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('import')}
            data-testid="import-card"
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <span className="text-slate-800 text-sm font-semibold">Import Data</span>
                <p className="text-slate-500 text-xs">CSV & devices</p>
              </div>
            </CardContent>
          </Card>

          {/* Spiritual Vault */}
          <Card 
            className="bg-white/80 backdrop-blur border-sky-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setCurrentView('spiritual')}
            data-testid="spiritual-card"
          >
            <CardContent className="p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="text-slate-800 text-sm font-semibold">Spiritual Vault</span>
                <p className="text-slate-500 text-xs">Faith & gratitude</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="bg-white/80 backdrop-blur border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm">Today's Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Calories</div>
                <div className="text-lg font-bold text-slate-800">0</div>
                <div className="text-xs text-slate-400">/ 2000</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Protein</div>
                <div className="text-lg font-bold text-slate-800">0g</div>
                <div className="text-xs text-slate-400">/ 120g</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Steps</div>
                <div className="text-lg font-bold text-slate-800">0</div>
                <div className="text-xs text-slate-400">/ 10k</div>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-xs mb-1">Water</div>
                <div className="text-lg font-bold text-slate-800">0</div>
                <div className="text-xs text-slate-400">/ 2.5L</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-6 text-center">
        <p className="text-xs text-sky-600/70 font-medium">
          TokHealth v1.0 | Keep People Alive
        </p>
      </div>
    </div>
  );
};

export default Dashboard;