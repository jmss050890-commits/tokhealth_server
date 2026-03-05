import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Activity, Heart, Pill, AlertTriangle, User, Calendar, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

const MedicalExport = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [biometrics, setBiometrics] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [profileRes, biometricsRes, prescriptionsRes, emergencyRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/profile/`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/biometrics/today`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/prescriptions/`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/emergency-contacts/`, { headers: getAuthHeaders() })
      ]);

      const profileData = await profileRes.json();
      const biometricsData = await biometricsRes.json();
      const prescriptionsData = await prescriptionsRes.json();
      const emergencyData = await emergencyRes.json();

      if (profileData.success) setProfile(profileData.data);
      if (biometricsData.success) setBiometrics(biometricsData.data);
      if (prescriptionsData.success) setPrescriptions(prescriptionsData.data || []);
      if (emergencyData.success) setEmergencyContacts(emergencyData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    setGenerating(true);
    
    const now = new Date();
    const reportDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    const reportContent = `
<!DOCTYPE html>
<html>
<head>
  <title>TokHealth Medical Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { color: #0ea5e9; margin: 0; }
    .section { margin-bottom: 25px; page-break-inside: avoid; }
    .section-title { background: #f0f9ff; padding: 10px; border-left: 4px solid #0ea5e9; font-weight: bold; margin-bottom: 10px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .item { padding: 8px; background: #f8fafc; border-radius: 4px; }
    .label { color: #64748b; font-size: 12px; }
    .value { color: #1e293b; font-weight: 500; }
    .alert { background: #fef2f2; border: 1px solid #fca5a5; padding: 10px; border-radius: 4px; }
    .alert-title { color: #dc2626; font-weight: bold; }
    .medication { background: #fdf4ff; padding: 10px; border-radius: 4px; margin-bottom: 8px; }
    .contact { background: #f0fdf4; padding: 10px; border-radius: 4px; margin-bottom: 8px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>TokHealth Medical Report</h1>
    <p>Generated: ${reportDate}</p>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="grid">
      <div class="item">
        <div class="label">Name</div>
        <div class="value">${profile?.name || 'Not provided'}</div>
      </div>
      <div class="item">
        <div class="label">Age</div>
        <div class="value">${profile?.age || 'Not provided'} years</div>
      </div>
      <div class="item">
        <div class="label">Gender</div>
        <div class="value">${profile?.gender || 'Not provided'}</div>
      </div>
      <div class="item">
        <div class="label">Blood Type</div>
        <div class="value">${profile?.blood_type || 'Not provided'}</div>
      </div>
      <div class="item">
        <div class="label">Height</div>
        <div class="value">${profile?.height_cm ? profile.height_cm + ' cm' : 'Not provided'}</div>
      </div>
      <div class="item">
        <div class="label">Weight</div>
        <div class="value">${profile?.weight_kg ? profile.weight_kg + ' kg' : 'Not provided'}</div>
      </div>
      <div class="item">
        <div class="label">BMI</div>
        <div class="value">${profile?.targets?.bmi || 'Not calculated'} ${profile?.targets?.bmi_category ? '(' + profile.targets.bmi_category + ')' : ''}</div>
      </div>
      <div class="item">
        <div class="label">Activity Level</div>
        <div class="value">${profile?.activity_level || 'Not provided'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Current Vital Signs (Latest Reading)</div>
    <div class="grid">
      <div class="item">
        <div class="label">Heart Rate</div>
        <div class="value">${biometrics?.heart_rate_bpm ? biometrics.heart_rate_bpm + ' BPM' : 'No data'}</div>
      </div>
      <div class="item">
        <div class="label">Blood Pressure</div>
        <div class="value">${biometrics?.blood_pressure_systolic ? biometrics.blood_pressure_systolic + '/' + biometrics.blood_pressure_diastolic + ' mmHg' : 'No data'}</div>
      </div>
      <div class="item">
        <div class="label">Blood Oxygen (SpO2)</div>
        <div class="value">${biometrics?.blood_oxygen_spo2 ? biometrics.blood_oxygen_spo2 + '%' : 'No data'}</div>
      </div>
      <div class="item">
        <div class="label">Temperature</div>
        <div class="value">${biometrics?.body_temp_celsius ? biometrics.body_temp_celsius + ' C' : 'No data'}</div>
      </div>
      <div class="item">
        <div class="label">Steps Today</div>
        <div class="value">${biometrics?.steps ? biometrics.steps.toLocaleString() : 'No data'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Current Medications</div>
    ${prescriptions.length > 0 ? prescriptions.map(med => `
      <div class="medication">
        <strong>${med.medication_name}</strong> - ${med.dosage}<br>
        <small>Schedule: ${med.frequency || 'As needed'}</small>
      </div>
    `).join('') : '<p>No medications recorded</p>'}
  </div>

  <div class="section">
    <div class="section-title">Emergency Contacts</div>
    ${emergencyContacts.length > 0 ? emergencyContacts.map(contact => `
      <div class="contact">
        <strong>${contact.name}</strong> (${contact.relationship})<br>
        Phone: ${contact.phone}
      </div>
    `).join('') : '<p>No emergency contacts recorded</p>'}
  </div>

  ${profile?.medical_conditions?.length > 0 ? `
  <div class="section">
    <div class="alert">
      <div class="alert-title">Medical Conditions / Allergies</div>
      <ul>
        ${profile.medical_conditions.map(condition => `<li>${condition}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>This report was generated by TokHealth - Keep People Alive (KPA) System</p>
    <p>This is NOT a substitute for professional medical records. Please verify all information with the patient.</p>
    <p>Report ID: TH-${Date.now()}</p>
  </div>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    setTimeout(() => {
      setGenerating(false);
      toast.success('Report generated! You can print it from the new window.');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="medical-export">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Medical Export</h1>
          </div>
          <p className="text-slate-500 text-sm">Generate a report for your doctor visit</p>
        </div>

        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <User className="w-4 h-4 mr-2 text-sky-600" />
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-50 rounded p-3">
              <div className="text-xs text-slate-500 mb-1">Patient</div>
              <div className="text-slate-800 font-medium">{profile?.name || 'No profile set up'}</div>
              {profile && (
                <div className="text-slate-500 text-sm">
                  {profile.age} years - {profile.gender} - {profile.blood_type || 'Blood type unknown'}
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded p-3">
              <div className="text-xs text-slate-500 mb-1 flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                Latest Vitals
              </div>
              {biometrics ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>HR: {biometrics.heart_rate_bpm || '-'} BPM</div>
                  <div>BP: {biometrics.blood_pressure_systolic || '-'}/{biometrics.blood_pressure_diastolic || '-'}</div>
                  <div>SpO2: {biometrics.blood_oxygen_spo2 || '-'}%</div>
                  <div>Temp: {biometrics.body_temp_celsius || '-'}C</div>
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No vitals recorded</div>
              )}
            </div>

            <div className="bg-slate-50 rounded p-3">
              <div className="text-xs text-slate-500 mb-1 flex items-center">
                <Pill className="w-3 h-3 mr-1" />
                Medications ({prescriptions.length})
              </div>
              {prescriptions.length > 0 ? (
                <div className="text-sm text-slate-700">
                  {prescriptions.slice(0, 3).map((med, i) => (
                    <div key={i}>{med.medication_name} - {med.dosage}</div>
                  ))}
                  {prescriptions.length > 3 && <div className="text-slate-400">+{prescriptions.length - 3} more</div>}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No medications recorded</div>
              )}
            </div>

            <div className="bg-slate-50 rounded p-3">
              <div className="text-xs text-slate-500 mb-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Emergency Contacts ({emergencyContacts.length})
              </div>
              {emergencyContacts.length > 0 ? (
                <div className="text-sm text-slate-700">
                  {emergencyContacts.slice(0, 2).map((contact, i) => (
                    <div key={i}>{contact.name} ({contact.relationship})</div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No emergency contacts</div>
              )}
            </div>
          </CardContent>
        </Card>

        {!profile && (
          <Card className="bg-amber-50 border-amber-300">
            <CardContent className="p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-medium text-amber-800">Profile Not Set Up</div>
                <div className="text-amber-700 text-sm">Set up your baseline profile first for a complete report.</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={generateReport}
          disabled={generating}
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-5"
          data-testid="generate-report-button"
        >
          {generating ? (
            <>
              <Activity className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Printer className="w-5 h-5 mr-2" />
              Generate Printable Report
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-slate-500 text-xs">
            The report will open in a new window ready for printing
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalExport;
