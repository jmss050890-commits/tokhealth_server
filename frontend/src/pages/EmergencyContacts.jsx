import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, PhoneCall, AlertTriangle, User, Shield, Plus, 
  Trash2, FileText, Ambulance, Car, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

const EmergencyContacts = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [quickDialSlots, setQuickDialSlots] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [show911Dialog, setShow911Dialog] = useState(false);
  const [dialog911Step, setDialog911Step] = useState(1);
  const [emergencyType, setEmergencyType] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'family',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    medical_info: '',
    is_primary_contact: false,
    priority_order: 1
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchContacts();
    loadQuickDial();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/emergency-contacts/`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const loadQuickDial = () => {
    const saved = localStorage.getItem('tokhealth_quickdial');
    if (saved) {
      setQuickDialSlots(JSON.parse(saved));
    }
  };

  const saveQuickDial = (slots) => {
    localStorage.setItem('tokhealth_quickdial', JSON.stringify(slots));
    setQuickDialSlots(slots);
    toast.success('Quick dial saved!');
  };

  const updateQuickDial = (index, field, value) => {
    const newSlots = [...quickDialSlots];
    newSlots[index][field] = value;
    saveQuickDial(newSlots);
  };

  const handleAddContact = async () => {
    if (!formData.name || !formData.phone_primary) {
      toast.error('Name and phone number are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/emergency-contacts/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Emergency contact added!');
        setFormData({
          name: '',
          relationship: 'family',
          phone_primary: '',
          phone_secondary: '',
          email: '',
          medical_info: '',
          is_primary_contact: false,
          priority_order: 1
        });
        setShowAddForm(false);
        fetchContacts();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Remove this emergency contact?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/emergency-contacts/${contactId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Contact removed');
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  const handle911Click = () => {
    setShow911Dialog(true);
    setDialog911Step(1);
    setEmergencyType('');
  };

  const handleEmergencyTypeSelect = (type) => {
    setEmergencyType(type);
    setDialog911Step(3);
  };

  const handleConfirm911 = () => {
    window.location.href = 'tel:911';
    setShow911Dialog(false);
    toast.success(`Calling 911 for ${emergencyType.toUpperCase()}. Stay calm.`, {
      duration: 10000
    });
  };

  const generateMedicalReport = async () => {
    try {
      const [biometricsRes, nutritionRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/biometrics/today`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/nutrition/today`, { headers: getAuthHeaders() })
      ]);

      const biometrics = await biometricsRes.json();
      const nutrition = await nutritionRes.json();

      const report = `
EMERGENCY MEDICAL REPORT - TOKHEALTH
Generated: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PATIENT INFORMATION:
• Name: [User Name]
• Age: [Age]
• Blood Type: [If known]

CURRENT VITALS (Last Recorded):
• Heart Rate: ${biometrics.data?.heart_rate_bpm || 'N/A'} BPM
• Blood Pressure: ${biometrics.data?.blood_pressure_systolic || 'N/A'}/${biometrics.data?.blood_pressure_diastolic || 'N/A'} mmHg
• Blood Oxygen: ${biometrics.data?.blood_oxygen_spo2 || 'N/A'}%
• Recent Activity: ${biometrics.data?.steps || 0} steps today

NUTRITION (Today):
• Calories: ${Math.round(nutrition.data?.totals?.calories || 0)} kcal
• Meals Logged: ${nutrition.data?.meals?.length || 0}

ALLERGIES & CONDITIONS:
• [User to provide]

CURRENT MEDICATIONS:
• [From prescription tracker]

EMERGENCY CONTACTS:
${contacts.map((c, i) => `${i + 1}. ${c.name} (${c.relationship}): ${c.phone_primary}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by TokHealth KPA System
Keep People Alive
      `.trim();

      // Copy to clipboard
      navigator.clipboard.writeText(report);
      toast.success('Medical report copied to clipboard! Share with emergency contacts or paramedics.');
      
      // Also offer to download
      const blob = new Blob([report], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tokhealth_emergency_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleQuickCall = (phone) => {
    if (!phone) {
      toast.error('No phone number set');
      return;
    }
    window.location.href = `tel:${phone}`;
    toast.success('Calling...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-black to-orange-900/20 p-4" data-testid="emergency-contacts">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Phone className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-red-500">EMERGENCY</span>{' '}
              <span className="text-white">SYSTEM</span>
            </h1>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-400">When seconds matter - KPA System 🚨</p>
        </div>

        {/* Quick Dial Slots */}
        <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Phone className="w-5 h-5 mr-2 text-orange-500" />
              Quick Dial (3-5 Emergency Contacts)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickDialSlots.map((slot, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    placeholder={`Name ${index + 1}`}
                    value={slot.name}
                    onChange={(e) => updateQuickDial(index, 'name', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                  />
                  <Input
                    placeholder="Phone number"
                    value={slot.phone}
                    onChange={(e) => updateQuickDial(index, 'phone', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white text-sm"
                  />
                  {slot.phone && (
                    <Button
                      onClick={() => handleQuickCall(slot.phone)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Call {slot.name || `#${index + 1}`}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-3">
              💡 Set your most important contacts here for instant access
            </p>
          </CardContent>
        </Card>

        {/* 911 Emergency Button */}
        <Card className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500 shadow-2xl shadow-red-500/50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
              <h2 className="text-white text-2xl font-bold">MEDICAL EMERGENCY?</h2>
              <p className="text-gray-300 text-sm">AI will guide you through emergency type selection</p>
              <Button
                onClick={handle911Click}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl py-8 px-12 shadow-xl"
              >
                <PhoneCall className="w-8 h-8 mr-3" />
                CALL 911
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced 911 Dialog */}
        {show911Dialog && (
          <Card className="bg-gray-900 border-2 border-red-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>🚨 Emergency Assistance</span>
                <Button variant="ghost" onClick={() => setShow911Dialog(false)} className="text-gray-400">
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Confirm Need */}
              {dialog911Step === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-white text-xl font-bold mb-2">
                      Do you need emergency assistance?
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Choose YES if this is a life-threatening emergency
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShow911Dialog(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 py-8 text-lg"
                    >
                      NO
                    </Button>
                    <Button
                      onClick={() => setDialog911Step(2)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-8 text-lg"
                    >
                      YES
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Select Emergency Type */}
              {dialog911Step === 2 && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-white text-xl font-bold mb-2">
                      What type of emergency?
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Select the service you need
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleEmergencyTypeSelect('ambulance')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-8 text-lg flex items-center justify-center"
                    >
                      <Ambulance className="w-8 h-8 mr-3" />
                      AMBULANCE (Medical)
                    </Button>
                    
                    <Button
                      onClick={() => handleEmergencyTypeSelect('police')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-8 text-lg flex items-center justify-center"
                    >
                      <Shield className="w-8 h-8 mr-3" />
                      POLICE
                    </Button>
                    
                    <Button
                      onClick={() => handleEmergencyTypeSelect('fire')}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-8 text-lg flex items-center justify-center"
                    >
                      <Flame className="w-8 h-8 mr-3" />
                      FIRE DEPARTMENT
                    </Button>
                  </div>

                  <Button
                    onClick={() => setDialog911Step(1)}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400"
                  >
                    Back
                  </Button>
                </div>
              )}

              {/* Step 3: Confirm Call */}
              {dialog911Step === 3 && emergencyType && (
                <div className="space-y-4">
                  <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
                    {emergencyType === 'ambulance' && <Ambulance className="w-16 h-16 text-red-500 mx-auto mb-4" />}
                    {emergencyType === 'police' && <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />}
                    {emergencyType === 'fire' && <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />}
                    
                    <h3 className="text-white text-xl font-bold mb-2">
                      Calling 911 for {emergencyType.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      When connected, tell them you need {emergencyType === 'ambulance' ? 'an ambulance' : emergencyType === 'police' ? 'police' : 'the fire department'}
                    </p>
                    
                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-3 text-left mb-4">
                      <p className="text-yellow-400 text-xs font-semibold mb-1">IMPORTANT:</p>
                      <ul className="text-gray-300 text-xs space-y-1">
                        <li>• Stay calm and speak clearly</li>
                        <li>• Provide your exact location</li>
                        <li>• Answer all questions from dispatcher</li>
                        <li>• Don't hang up until told to do so</li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setDialog911Step(2)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 py-6"
                    >
                      Go Back
                    </Button>
                    <Button
                      onClick={handleConfirm911}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-6"
                    >
                      <PhoneCall className="w-5 h-5 mr-2" />
                      CALL 911 NOW
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Medical Report Button */}
        <Button
          onClick={generateMedicalReport}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generate Emergency Medical Report
        </Button>

        {/* Add Contact Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Full Emergency Contact
          </Button>
        )}

        {/* Add Contact Form */}
        {showAddForm && (
          <Card className="bg-gray-900/50 border-orange-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Add Emergency Contact</span>
                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-gray-400">
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Name *</Label>
                  <Input
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={(value) => setFormData({...formData, relationship: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Primary Phone *</Label>
                  <Input
                    placeholder="+1-555-0123"
                    value={formData.phone_primary}
                    onChange={(e) => setFormData({...formData, phone_primary: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Secondary Phone</Label>
                  <Input
                    placeholder="+1-555-0124"
                    value={formData.phone_secondary}
                    onChange={(e) => setFormData({...formData, phone_secondary: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Medical Info</Label>
                <Textarea
                  placeholder="Blood type, conditions, medications..."
                  value={formData.medical_info}
                  onChange={(e) => setFormData({...formData, medical_info: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={handleAddContact}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
              >
                {loading ? 'Adding...' : 'Save Emergency Contact'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        {contacts.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Full Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Card key={contact.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-5 h-5 text-orange-500" />
                            <h4 className="text-white font-semibold">{contact.name}</h4>
                            <span className="text-gray-400 text-sm capitalize">({contact.relationship})</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-1">
                            <Phone className="w-4 h-4 text-green-500" />
                            <a href={`tel:${contact.phone_primary}`} className="text-green-400 hover:text-green-300">
                              {contact.phone_primary}
                            </a>
                          </div>
                          
                          {contact.medical_info && (
                            <p className="text-gray-400 text-xs mt-2">📋 {contact.medical_info}</p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleQuickCall(contact.phone_primary)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteContact(contact.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPA Message */}
        <div className="text-center">
          <p className="text-red-500 text-sm italic">"When seconds matter, TokHealth is ready." 🚨</p>
          <p className="text-gray-600 text-xs mt-1">KPA System - Keep People Alive</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
