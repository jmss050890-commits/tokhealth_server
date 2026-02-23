import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="mb-4 border-sky-400 text-sky-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-white/90 border-sky-200">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800">
              <Shield className="w-6 h-6 mr-2 text-sky-600" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm text-slate-600 space-y-4">
            <p><strong>Last Updated:</strong> February 2026</p>
            
            <h3 className="text-slate-800 font-semibold">1. Information We Collect</h3>
            <p>TokHealth collects health and wellness data that you voluntarily provide, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account information (name, email)</li>
              <li>Health metrics (steps, heart rate, blood pressure)</li>
              <li>Nutrition data (meals, calories, hydration)</li>
              <li>Wellness journal entries</li>
              <li>Data synced from connected services (Fitbit)</li>
            </ul>

            <h3 className="text-slate-800 font-semibold">2. How We Use Your Information</h3>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Display your health dashboard and trends</li>
              <li>Provide AI-powered health insights</li>
              <li>Enable family health status sharing (with your consent)</li>
              <li>Generate health reports</li>
            </ul>

            <h3 className="text-slate-800 font-semibold">3. Data Storage & Security</h3>
            <p>Your health data is stored securely and encrypted. We do not sell your personal health information to third parties.</p>

            <h3 className="text-slate-800 font-semibold">4. Third-Party Services</h3>
            <p>When you connect Fitbit or other services, their privacy policies also apply. We only access data you authorize.</p>

            <h3 className="text-slate-800 font-semibold">5. Your Rights</h3>
            <p>You can:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and export your data</li>
              <li>Delete your account and all associated data</li>
              <li>Revoke third-party service connections</li>
            </ul>

            <h3 className="text-slate-800 font-semibold">6. Contact</h3>
            <p>For privacy questions, contact us through the app.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
