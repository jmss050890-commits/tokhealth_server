import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, BookOpen, Bell, Pill, Droplets, Phone, FileText } from 'lucide-react';
import BiometricsTracker from '@/pages/BiometricsTracker';
import NutritionLogger from '@/pages/NutritionLogger';
import TheLoop from '@/pages/TheLoop';
import WisdomVault from '@/pages/WisdomVault';
import EmergencyContacts from '@/pages/EmergencyContacts';
import PrescriptionTracker from '@/pages/PrescriptionTracker';
import HealthCoach from '@/pages/HealthCoach';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  if (currentView === 'coach') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <HealthCoach />
      </div>
    );
  }

  if (currentView === 'prescriptions') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <PrescriptionTracker />
      </div>
    );
  }

  if (currentView === 'emergency') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <EmergencyContacts />
      </div>
    );
  }

  if (currentView === 'wisdom') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <WisdomVault />
      </div>
    );
  }

  if (currentView === 'loop') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <TheLoop />
      </div>
    );
  }

  if (currentView === 'biometrics') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <BiometricsTracker />
      </div>
    );
  }

  if (currentView === 'nutrition') {
    return (
      <div>
        <div className="p-4">
          <Button 
            onClick={() => setCurrentView('dashboard')}
            variant="outline"
            className="mb-4 border-green-500/50 text-green-500"
          >
            &larr; Back to Dashboard
          </Button>
        </div>
        <NutritionLogger />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4" data-testid="dashboard">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold">
              <span className="text-green-500">TOK</span>
              <span className="text-white">HEALTH</span>
            </h1>
          </div>
          <div className="text-sm text-gray-400">Welcome back!</div>
        </div>
        <p className="text-gray-400 text-sm">Your AI-powered health companion</p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* The Loop Button - Prominent */}
        <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/50 shadow-2xl shadow-green-500/20" data-testid="loop-card">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                    <Activity className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="absolute inset-0 bg-green-500/10 blur-2xl rounded-full"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">THE LOOP</h2>
              <p className="text-gray-300">See your complete health status at a glance</p>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-green-500/50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Biometrics - NEW! */}
          <Card 
            className="bg-gray-900/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer" 
            data-testid="biometrics-card"
            onClick={() => setCurrentView('biometrics')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-red-500" />
                <span className="text-white">Biometrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Track vitals & health stats</p>
              <div className="space-y-1 mb-3 text-xs text-gray-500">
                <div>• Heart Rate</div>
                <div>• Blood Pressure</div>
                <div>• Blood Oxygen</div>
                <div>• Steps</div>
              </div>
              <Button variant="outline" className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10">
                Log Vitals
              </Button>
            </CardContent>
          </Card>

          {/* Nutrition */}
          <Card 
            className="bg-gray-900/50 border-gray-700 hover:border-green-500/50 transition-all cursor-pointer" 
            data-testid="nutrition-card"
            onClick={() => setCurrentView('nutrition')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-white">Nutrition</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Track your meals & nutrition</p>
              <Button variant="outline" className="w-full border-green-500/50 text-green-500 hover:bg-green-500/10">
                Log Meal
              </Button>
            </CardContent>
          </Card>

          {/* AI Coach */}
          <Card 
            className="bg-gray-900/50 border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer" 
            data-testid="coach-card"
            onClick={() => setCurrentView('coach')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-white">AI Coach</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Get personalized guidance</p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2 mb-2">
                <span className="text-blue-400 text-xs">1 New Message</span>
              </div>
              <Button variant="outline" className="w-full border-blue-500/50 text-blue-500 hover:bg-blue-500/10">
                View Coach
              </Button>
            </CardContent>
          </Card>

          {/* Wisdom Vault */}
          <Card 
            className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer" 
            data-testid="wisdom-card"
            onClick={() => setCurrentView('wisdom')}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <span className="text-white">Wisdom Vault</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Journal & mental wellness</p>
              <Button variant="outline" className="w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10">
                New Entry
              </Button>
            </CardContent>
          </Card>

          {/* Hydration */}
          <Card className="bg-gray-900/50 border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer" data-testid="hydration-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-cyan-500" />
                <span className="text-white">Hydration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Track water intake</p>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Today</span>
                  <span>0 / 2500ml</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
              </div>
              <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10">
                + Log Water
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Emergency Contacts */}
          <Card 
            className="bg-gray-900/50 border-gray-700"
            onClick={() => setCurrentView('emergency')}
            style={{cursor: 'pointer'}}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-white">Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Quick access to emergency contacts</p>
              <Button variant="outline" className="w-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                Manage Contacts
              </Button>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card 
            className="bg-gray-900/50 border-gray-700"
            onClick={() => setCurrentView('prescriptions')}
            style={{cursor: 'pointer'}}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-pink-500" />
                <span className="text-white">Prescriptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-3">Track medications & reminders</p>
              <Button variant="outline" className="w-full border-pink-500/50 text-pink-500 hover:bg-pink-500/10">
                View Medications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Today's Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Calories</div>
                <div className="text-2xl font-bold text-white">0 <span className="text-sm text-gray-500">/ 2000</span></div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Protein</div>
                <div className="text-2xl font-bold text-white">0g <span className="text-sm text-gray-500">/ 120g</span></div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Steps</div>
                <div className="text-2xl font-bold text-white">0 <span className="text-sm text-gray-500">/ 10k</span></div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Water</div>
                <div className="text-2xl font-bold text-white">0ml <span className="text-sm text-gray-500">/ 2.5L</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-8 text-center">
        <p className="text-xs text-gray-600 font-mono">
          TokHealth v1.0 | Built for wellness 💚
        </p>
      </div>
    </div>
  );
};

export default Dashboard;