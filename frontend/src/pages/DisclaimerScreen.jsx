import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Heart, Brain, Activity } from 'lucide-react';

const DisclaimerScreen = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleEnter = () => {
    if (accepted) {
      localStorage.setItem('tokhealth_disclaimer_accepted', 'true');
      onAccept();
    } else {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4" data-testid="disclaimer-screen">
      {/* Soft wave background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-sky-300/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-300/50 to-transparent"></div>
      </div>

      <Card className="w-full max-w-3xl bg-white/95 border-sky-300 shadow-2xl shadow-sky-500/20 backdrop-blur-sm relative z-10" data-testid="disclaimer-card">
        <CardHeader className="border-b border-sky-200">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Activity className="w-16 h-16 text-sky-600 animate-pulse" />
              <div className="absolute inset-0 bg-sky-400/20 blur-xl rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className="text-sky-600">TOK</span>
              <span className="text-slate-800">HEALTH</span>
            </div>
            <div className="text-sm text-sky-500 font-medium">HEALTH TRACKING SYSTEM v1.0</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome to TokHealth</h2>
            <p className="text-slate-600 text-sm">Please review and accept the following terms</p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {/* Medical Disclaimer */}
            <Alert className="bg-rose-50 border-rose-300" data-testid="medical-disclaimer">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              <AlertDescription className="text-slate-700">
                <div className="font-semibold text-rose-700 mb-1">NOT MEDICAL ADVICE</div>
                <p className="text-sm">
                  TokHealth is a wellness tracking tool, NOT a medical device or substitute for professional
                  medical advice, diagnosis, or treatment. Always seek the advice of your physician or other
                  qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </AlertDescription>
            </Alert>

            {/* Emergency Situations */}
            <Alert className="bg-amber-50 border-amber-300">
              <Heart className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-slate-700">
                <div className="font-semibold text-amber-700 mb-1">EMERGENCY SITUATIONS</div>
                <p className="text-sm">
                  In case of a medical emergency, call 911 (or your local emergency number) immediately.
                  Do NOT rely on TokHealth for emergency medical assistance.
                </p>
              </AlertDescription>
            </Alert>

            {/* AI-Generated Content */}
            <Alert className="bg-sky-50 border-sky-300">
              <Brain className="h-5 w-5 text-sky-600" />
              <AlertDescription className="text-slate-700">
                <div className="font-semibold text-sky-700 mb-1">AI-POWERED INSIGHTS</div>
                <p className="text-sm">
                  TokHealth uses AI (Gemini & GPT-5.2) to provide health insights and coaching.
                  These are suggestions, not medical recommendations. AI can make mistakes.
                  Always verify important health decisions with qualified healthcare professionals.
                </p>
              </AlertDescription>
            </Alert>

            {/* Data Privacy */}
            <Alert className="bg-violet-50 border-violet-300">
              <Shield className="h-5 w-5 text-violet-600" />
              <AlertDescription className="text-slate-700">
                <div className="font-semibold text-violet-700 mb-1">DATA & PRIVACY</div>
                <p className="text-sm">
                  Your health data is stored securely. Wisdom Vault entries are encrypted.
                  We do not share your personal health information without your explicit consent.
                  You control what data is exported for medical visits.
                </p>
              </AlertDescription>
            </Alert>

            {/* User Responsibility */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-sky-700 font-semibold mb-2">YOUR RESPONSIBILITIES</h3>
              <ul className="text-slate-600 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  <span>Provide accurate health information to the best of your ability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  <span>Consult healthcare providers before making significant health changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  <span>Keep your account secure and do not share sensitive health data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-sky-500 mr-2">•</span>
                  <span>Use TokHealth as a wellness tracking tool, not a medical diagnostic tool</span>
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-sky-700 font-semibold mb-2">TERMS OF USE</h3>
              <p className="text-slate-600 text-sm">
                By using TokHealth, you agree to use this platform responsibly and understand that
                it is provided "as is" without warranties. You acknowledge that the creators and operators
                of TokHealth are not liable for any health decisions made based on the information provided.
              </p>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mt-6 pt-6 border-t border-sky-200">
            <div className="flex items-start space-x-3 mb-4">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={setAccepted}
                className="mt-1 border-sky-500 data-[state=checked]:bg-sky-600"
                data-testid="accept-checkbox"
              />
              <label
                htmlFor="accept-terms"
                className="text-sm text-slate-600 cursor-pointer leading-relaxed"
              >
                I have read and understand the disclaimers above. I acknowledge that TokHealth is not
                a substitute for professional medical advice. I agree to consult healthcare providers
                for medical decisions and will call emergency services in urgent situations.
              </label>
            </div>

            {showWarning && (
              <Alert className="bg-amber-50 border-amber-300 mb-4">
                <AlertDescription className="text-amber-700 text-sm">
                  Please accept the terms to continue.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleEnter}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-6 text-lg shadow-lg shadow-sky-500/30 transition-all duration-300"
              data-testid="enter-button"
            >
              <Activity className="mr-2 h-5 w-5" />
              ENTER TOKHEALTH
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-slate-500">
              TokHealth v1.0 | Keep People Alive
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(14, 165, 233, 0.1);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(14, 165, 233, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(14, 165, 233, 0.5);
        }
      `}</style>
    </div>
  );
};

export default DisclaimerScreen;