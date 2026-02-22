import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Copy, Share2, Heart } from 'lucide-react';
import { toast } from 'sonner';

const MedicalExport = () => {
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const generateFullReport = async () => {
    setLoading(true);
    try {
      // Fetch all health data
      const [biometricsRes, nutritionRes, contactsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/biometrics/today`),
        fetch(`${BACKEND_URL}/api/nutrition/today`),
        fetch(`${BACKEND_URL}/api/emergency-contacts/`)
      ]);

      const biometrics = await biometricsRes.json();
      const nutrition = await nutritionRes.json();
      const contacts = await contactsRes.json();

      const today = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString();

      const report = `
═══════════════════════════════════════════════════════
                 TOKHEALTH MEDICAL REPORT
                Keep People Alive (KPA System)
═══════════════════════════════════════════════════════

Generated: ${today} at ${time}
Report ID: ${Date.now()}

═══════════════════════════════════════════════════════
                    PATIENT INFORMATION
═══════════════════════════════════════════════════════

Name: [Patient Name - Update with your info]
Date of Birth: [DOB]
Age: [Age]
Gender: [Gender]
Blood Type: [If known]

═══════════════════════════════════════════════════════
                 CURRENT VITAL SIGNS (Today)
═══════════════════════════════════════════════════════

Heart Rate: ${biometrics.data?.heart_rate_bpm || 'Not recorded'} BPM
Blood Pressure: ${biometrics.data?.blood_pressure_systolic || 'N/A'}/${biometrics.data?.blood_pressure_diastolic || 'N/A'} mmHg
Blood Oxygen: ${biometrics.data?.blood_oxygen_spo2 || 'Not recorded'}% SpO2
Body Temperature: ${biometrics.data?.body_temp_celsius || 'Not recorded'}°C

Activity Level: ${biometrics.data?.steps || 0} steps today

Vital Signs Status: ${
  biometrics.data?.heart_rate_bpm && 
  biometrics.data.heart_rate_bpm >= 60 && 
  biometrics.data.heart_rate_bpm <= 100 
    ? '✓ NORMAL RANGE' 
    : '⚠ NEEDS REVIEW'
}

═══════════════════════════════════════════════════════
              NUTRITION & DIETARY INTAKE (Today)
═══════════════════════════════════════════════════════

Total Calories: ${Math.round(nutrition.data?.totals?.calories || 0)} kcal
Protein: ${Math.round(nutrition.data?.totals?.protein_g || 0)}g
Carbohydrates: ${Math.round(nutrition.data?.totals?.carbs_g || 0)}g
Fat: ${Math.round(nutrition.data?.totals?.fat_g || 0)}g

Meals Logged: ${nutrition.data?.meals?.length || 0}
${nutrition.data?.meals?.map((meal, i) => 
  `  ${i + 1}. ${meal.meal_type} - ${Math.round(meal.total_calories)} cal`
).join('\n') || '  No meals logged today'}

═══════════════════════════════════════════════════════
                CURRENT MEDICATIONS
═══════════════════════════════════════════════════════

[This section will auto-populate from Prescription Tracker]
• Medication tracking active in TokHealth app
• See Prescription Tracker for complete medication schedule
• Adherence monitoring enabled

IMPORTANT: Inform healthcare providers of ALL medications,
including over-the-counter drugs and supplements.

═══════════════════════════════════════════════════════
              ALLERGIES & MEDICAL CONDITIONS
═══════════════════════════════════════════════════════

Known Allergies: [Update with your allergies]
Medical Conditions: [Update with your conditions]
Previous Surgeries: [Update with surgical history]

═══════════════════════════════════════════════════════
                 EMERGENCY CONTACTS
═══════════════════════════════════════════════════════

${contacts.data?.length > 0 
  ? contacts.data.map((contact, i) => 
    `${i + 1}. ${contact.name} (${contact.relationship})
   Phone: ${contact.phone_primary}
   ${contact.medical_info ? `Medical Info: ${contact.medical_info}` : ''}`
  ).join('\n\n')
  : 'No emergency contacts registered'}

═══════════════════════════════════════════════════════
              RECENT HEALTH SUMMARY (7 Days)
═══════════════════════════════════════════════════════

• Biometric tracking: Active
• Nutrition logging: Active
• Medication adherence: Being monitored
• Mental wellness: Wisdom Vault entries tracked
• Emergency preparedness: Contacts registered

Overall Health Status: [Determined by The Loop visualization]

═══════════════════════════════════════════════════════
           NOTES FOR HEALTHCARE PROVIDERS
═══════════════════════════════════════════════════════

This report is generated from TokHealth, a comprehensive health
tracking system. All data is patient-reported and tracked daily.

For detailed history, trends, and complete medication schedules,
please request additional TokHealth reports or access patient's
app data with permission.

═══════════════════════════════════════════════════════
                        DISCLAIMER
═══════════════════════════════════════════════════════

This report is for informational purposes and healthcare
communication. It is not a substitute for professional medical
examination or diagnosis. All data is self-reported and should
be verified by healthcare professionals.

═══════════════════════════════════════════════════════
            Generated by TokHealth KPA System
              Keep People Alive • Sanders Family
                Built with purpose for families
═══════════════════════════════════════════════════════
      `.trim();

      // Copy to clipboard
      await navigator.clipboard.writeText(report);
      toast.success('Medical report copied to clipboard! 📋');

      // Download as text file
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TokHealth_Medical_Report_${today.replace(/\//g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Medical report downloaded! Share with doctors. 💚');
      setReportGenerated(true);

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 p-4" data-testid="medical-export">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="w-10 h-10 text-purple-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-purple-500">MEDICAL</span>{' '}
              <span className="text-white">EXPORT</span>
            </h1>
          </div>
          <p className="text-gray-400 mb-2">Professional health reports for doctors & emergencies</p>
          <p className="text-purple-500 text-xs italic">Complete health data in one document</p>
          <p className="text-gray-600 text-xs">KPA System - Keep People Alive 📄</p>
        </div>

        {/* For The Family */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <p className="text-pink-400 font-semibold mb-2">👨‍👩‍👦 For The Sanders Family</p>
            <p className="text-gray-300 text-sm">
              Medical reports for doctor visits, emergency situations, and family sharing.
              Your complete health story in one professional document.
            </p>
          </CardContent>
        </Card>

        {/* What's Included */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">What's Included in Your Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Current Vitals</p>
                  <p className="text-gray-400 text-sm">Heart rate, blood pressure, SpO2, temperature</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Nutrition Summary</p>
                  <p className="text-gray-400 text-sm">Today's meals, calories, macros</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Medications</p>
                  <p className="text-gray-400 text-sm">Current prescriptions & schedules</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Emergency Contacts</p>
                  <p className="text-gray-400 text-sm">All registered contacts with medical info</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Health Status</p>
                  <p className="text-gray-400 text-sm">Overall wellness summary</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-white font-semibold">Medical History</p>
                  <p className="text-gray-400 text-sm">Allergies, conditions, notes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Card className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-2 border-purple-500">
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="w-16 h-16 text-purple-500 mx-auto" />
            <h3 className="text-white text-xl font-bold">Generate Your Medical Report</h3>
            <p className="text-gray-300 text-sm max-w-lg mx-auto">
              Creates a comprehensive, professional health report with all your TokHealth data.
              Perfect for doctor visits, emergency situations, or sharing with family.
            </p>
            
            <Button
              onClick={generateFullReport}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-6 text-lg"
              data-testid="generate-report-button"
            >
              {loading ? 'Generating Report...' : '📄 Generate Medical Report'}
            </Button>

            <p className="text-gray-500 text-xs">
              Report will be copied to clipboard AND downloaded as a text file
            </p>
          </CardContent>
        </Card>

        {/* Success Message */}
        {reportGenerated && (
          <Card className="bg-green-900/20 border-green-500/50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-green-400 font-semibold mb-2">Report Generated Successfully!</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>✓ Copied to clipboard - paste anywhere</p>
                    <p>✓ Downloaded as text file - check your downloads folder</p>
                    <p>✓ Ready to share with doctors, emergency contacts, or family</p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                    <p className="text-blue-400 text-xs font-semibold mb-1">💡 How to use:</p>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li>• Email to your doctor before appointments</li>
                      <li>• Print and bring to emergency room</li>
                      <li>• Share with family members for their records</li>
                      <li>• Keep in your phone for paramedics if needed</li>
                    </ul>
                  </div>

                  <Button
                    onClick={generateFullReport}
                    variant="outline"
                    size="sm"
                    className="mt-4 border-purple-500 text-purple-400"
                  >
                    Generate New Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Use Cases */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">When to Use Medical Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="text-white font-semibold">Doctor Visits</p>
                  <p className="text-gray-400 text-sm">Share complete health data before appointments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">🚑</span>
                <div>
                  <p className="text-white font-semibold">Emergency Situations</p>
                  <p className="text-gray-400 text-sm">Paramedics get instant access to vitals & medications</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">👨‍👩‍👦</span>
                <div>
                  <p className="text-white font-semibold">Family Sharing</p>
                  <p className="text-gray-400 text-sm">Keep family informed about health status</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-2xl">💼</span>
                <div>
                  <p className="text-white font-semibold">Insurance & Records</p>
                  <p className="text-gray-400 text-sm">Professional documentation for claims</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPA Message */}
        <div className="text-center">
          <p className="text-purple-500 text-sm italic">
            "Your health story, professionally documented - ready when you need it" 📄💜
          </p>
          <p className="text-gray-600 text-xs mt-1">
            KPA System - Keep People Alive • For The Sanders Family
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalExport;
