import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService = ({ onBack }) => {
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
              <FileText className="w-6 h-6 mr-2 text-sky-600" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm text-slate-600 space-y-4">
            <p><strong>Last Updated:</strong> February 2026</p>
            
            <h3 className="text-slate-800 font-semibold">1. Acceptance of Terms</h3>
            <p>By using TokHealth, you agree to these Terms of Service. If you do not agree, please do not use the application.</p>

            <h3 className="text-slate-800 font-semibold">2. Medical Disclaimer</h3>
            <p><strong>IMPORTANT:</strong> TokHealth is a wellness tracking tool, NOT a medical device. It does not provide medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions. In emergencies, call 911 or your local emergency number.</p>

            <h3 className="text-slate-800 font-semibold">3. User Accounts</h3>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Maintaining the security of your account</li>
              <li>All activities under your account</li>
              <li>Providing accurate information</li>
            </ul>

            <h3 className="text-slate-800 font-semibold">4. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the service for unlawful purposes</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Interfere with the service's operation</li>
              <li>Share false health information</li>
            </ul>

            <h3 className="text-slate-800 font-semibold">5. Third-Party Services</h3>
            <p>TokHealth may integrate with third-party services like Fitbit. Your use of these services is subject to their respective terms and policies.</p>

            <h3 className="text-slate-800 font-semibold">6. Data & Privacy</h3>
            <p>Your use of TokHealth is also governed by our Privacy Policy. By using the service, you consent to our data practices.</p>

            <h3 className="text-slate-800 font-semibold">7. Limitation of Liability</h3>
            <p>TokHealth is provided "as is" without warranties. We are not liable for any health decisions made based on information from this app.</p>

            <h3 className="text-slate-800 font-semibold">8. Changes to Terms</h3>
            <p>We may update these terms. Continued use after changes constitutes acceptance.</p>

            <h3 className="text-slate-800 font-semibold">9. Contact</h3>
            <p>For questions about these terms, contact us through the app.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
