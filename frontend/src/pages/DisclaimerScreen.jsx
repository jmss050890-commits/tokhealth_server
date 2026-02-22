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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-green-950 flex items-center justify-center p-4" data-testid="disclaimer-screen">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="matrix-rain">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="text-green-500 text-xs font-mono"
              style={{
                position: 'absolute',
                left: `${i * 5}%`,
                animation: `fall ${3 + Math.random() * 3}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              {Array(20).fill('01').join(' ')}
            </div>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-3xl bg-black/90 border-green-500/50 shadow-2xl shadow-green-500/20 backdrop-blur-sm relative z-10" data-testid="disclaimer-card">
        <CardHeader className="border-b border-green-500/30">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Activity className="w-16 h-16 text-green-500 animate-pulse" />
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-center">
            <div className="text-3xl font-bold mb-2">
              <span className="text-green-500">TOK</span>
              <span className="text-white">HEALTH</span>
            </div>
            <div className="text-sm text-green-400 font-mono">HEALTH TRACKING SYSTEM v1.0</div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to the Matrix</h2>
            <p className="text-gray-400 text-sm">Please review and accept the following terms</p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {/* Medical Disclaimer */}
            <Alert className="bg-red-950/50 border-red-500/50" data-testid="medical-disclaimer">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDescription className="text-gray-200">
                <div className="font-semibold text-red-400 mb-1">NOT MEDICAL ADVICE</div>
                <p className="text-sm">
                  TokHealth is a wellness tracking tool, NOT a medical device or substitute for professional
                  medical advice, diagnosis, or treatment. Always seek the advice of your physician or other
                  qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </AlertDescription>
            </Alert>

            {/* Emergency Situations */}
            <Alert className="bg-orange-950/50 border-orange-500/50">
              <Heart className="h-5 w-5 text-orange-500" />
              <AlertDescription className="text-gray-200">
                <div className="font-semibold text-orange-400 mb-1">EMERGENCY SITUATIONS</div>
                <p className="text-sm">
                  In case of a medical emergency, call 911 (or your local emergency number) immediately.
                  Do NOT rely on TokHealth for emergency medical assistance.
                </p>
              </AlertDescription>
            </Alert>

            {/* AI-Generated Content */}
            <Alert className="bg-blue-950/50 border-blue-500/50">
              <Brain className="h-5 w-5 text-blue-500" />
              <AlertDescription className="text-gray-200">
                <div className="font-semibold text-blue-400 mb-1">AI-POWERED INSIGHTS</div>
                <p className="text-sm">
                  TokHealth uses AI (Gemini & GPT-5.2) to provide health insights and coaching.
                  These are suggestions, not medical recommendations. AI can make mistakes.
                  Always verify important health decisions with qualified healthcare professionals.
                </p>
              </AlertDescription>
            </Alert>

            {/* Data Privacy */}
            <Alert className="bg-purple-950/50 border-purple-500/50">
              <Shield className="h-5 w-5 text-purple-500" />
              <AlertDescription className="text-gray-200">
                <div className="font-semibold text-purple-400 mb-1">DATA & PRIVACY</div>
                <p className="text-sm">
                  Your health data is stored securely. Wisdom Vault entries are encrypted.
                  We do not share your personal health information without your explicit consent.
                  You control what data is exported for medical visits.
                </p>
              </AlertDescription>
            </Alert>

            {/* User Responsibility */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">YOUR RESPONSIBILITIES</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Provide accurate health information to the best of your ability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Consult healthcare providers before making significant health changes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Keep your account secure and do not share sensitive health data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Use TokHealth as a wellness tracking tool, not a medical diagnostic tool</span>
                </li>
              </ul>
            </div>

            {/* Terms */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-2">TERMS OF USE</h3>
              <p className="text-gray-300 text-sm">
                By using TokHealth, you agree to use this platform responsibly and understand that
                it is provided "as is" without warranties. You acknowledge that the creators and operators
                of TokHealth are not liable for any health decisions made based on the information provided.
              </p>
            </div>
          </div>

          {/* Acceptance Checkbox */}
          <div className="mt-6 pt-6 border-t border-green-500/30">
            <div className="flex items-start space-x-3 mb-4">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={setAccepted}
                className="mt-1 border-green-500 data-[state=checked]:bg-green-500"
                data-testid="accept-checkbox"
              />
              <label
                htmlFor="accept-terms"
                className="text-sm text-gray-300 cursor-pointer leading-relaxed"
              >
                I have read and understand the disclaimers above. I acknowledge that TokHealth is not
                a substitute for professional medical advice. I agree to consult healthcare providers
                for medical decisions and will call emergency services in urgent situations.
              </label>
            </div>

            {showWarning && (
              <Alert className="bg-yellow-950/50 border-yellow-500/50 mb-4">
                <AlertDescription className="text-yellow-200 text-sm">
                  Please accept the terms to continue.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleEnter}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg shadow-green-500/50 transition-all duration-300 hover:shadow-green-500/70"
              data-testid="enter-button"
            >
              <Activity className="mr-2 h-5 w-5" />
              ENTER THE MATRIX
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 font-mono">
              TokHealth v1.0 | QA-Professional Grade | Built with ❤️ for your wellness
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.7);
        }
      `}</style>
    </div>
  );
};

export default DisclaimerScreen;