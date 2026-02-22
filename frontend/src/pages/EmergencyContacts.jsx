import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, PhoneCall, AlertTriangle, User, Heart, 
  Plus, Edit2, Trash2, Shield, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [show911Dialog, setShow911Dialog] = useState(false);
  const [emergencyConfirmed, setEmergencyConfirmed] = useState(false);
  const [aiAssessment, setAiAssessment] = useState('');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'family',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    address: '',
    medical_info: '',
    is_primary_contact: false,
    priority_order: 1
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/emergency-contacts/`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Emergency contact added! 🚨');
        setFormData({
          name: '',
          relationship: 'family',
          phone_primary: '',
          phone_secondary: '',
          email: '',
          address: '',
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
        method: 'DELETE'
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
    setEmergencyConfirmed(false);
    setAiAssessment('');
    setEmergencyDescription('');
  };

  const handleAIAssessment = async () => {
    if (!emergencyDescription.trim()) {
      toast.error('Please describe the emergency');
      return;
    }

    setLoading(true);
    try {
      // Simulate AI assessment (in production, this would call Gemini API)
      // For now, provide immediate guidance
      
      const keywords = emergencyDescription.toLowerCase();
      let assessment = '';
      
      if (keywords.includes('chest pain') || keywords.includes('heart attack') || 
          keywords.includes('stroke') || keywords.includes('breathing')) {
        assessment = '🚨 CALL 911 IMMEDIATELY - These symptoms require emergency medical attention right now. Do not wait.';
        setEmergencyConfirmed(true);
      } else if (keywords.includes('fall') || keywords.includes('injury') || 
                 keywords.includes('bleeding') || keywords.includes('unconscious')) {
        assessment = '⚠️ This sounds serious. Call 911 if: person is unconscious, heavy bleeding, severe pain, or confusion. Otherwise, contact your doctor immediately.';
      } else if (keywords.includes('fever') || keywords.includes('pain') || 
                 keywords.includes('sick')) {
        assessment = '💙 For non-emergency medical concerns, try calling your doctor first. Call 911 if symptoms worsen rapidly or person becomes unresponsive.';
      } else {
        assessment = '🤔 Based on your description, consider: Is the person conscious? Breathing normally? In severe pain? If YES to severe symptoms, call 911. If manageable, contact your doctor or emergency contact first.';
      }
      
      setAiAssessment(assessment);
    } catch (error) {
      console.error('Error with AI assessment:', error);
      setAiAssessment('⚠️ Unable to assess. If this is a medical emergency, call 911 immediately. Trust your instinct.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm911 = () => {
    // On mobile, this will trigger phone dialer
    window.location.href = 'tel:911';
    setShow911Dialog(false);
    toast.success('Calling 911... Stay calm and provide your location.', {
      duration: 10000
    });
  };

  const handleQuickCall = (phone) => {
    window.location.href = `tel:${phone}`;
    toast.success('Calling emergency contact...');
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
              <span className="text-white">CONTACTS</span>
            </h1>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-400 mb-2">Quick access when seconds matter</p>
          <p className="text-red-500 text-xs italic">KPA System - Keep People Alive 🚨</p>
        </div>

        {/* 911 Emergency Button */}
        <Card className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-2 border-red-500 shadow-2xl shadow-red-500/50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
              <h2 className="text-white text-2xl font-bold">MEDICAL EMERGENCY?</h2>
              <p className="text-gray-300 text-sm">
                AI Health Coach will help assess and confirm before calling
              </p>
              <Button
                onClick={handle911Click}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-2xl py-8 px-12 shadow-xl"
                data-testid="call-911-button"
              >
                <PhoneCall className="w-8 h-8 mr-3" />
                CALL 911
              </Button>
              <p className="text-red-400 text-xs">
                ⚠️ Protected with AI confirmation - prevents accidental calls
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 911 Confirmation Dialog */}
        {show911Dialog && (
          <Card className="bg-gray-900 border-2 border-red-500 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                  911 Emergency Assessment
                </span>
                <Button 
                  variant="ghost" 
                  onClick={() => setShow911Dialog(false)}
                  className="text-gray-400"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <p className="text-red-400 text-sm font-semibold mb-2">
                  ⚠️ 911 is for MEDICAL EMERGENCIES ONLY
                </p>
                <p className="text-gray-400 text-xs">
                  Examples: Chest pain, difficulty breathing, severe bleeding, unconscious person, stroke symptoms, severe allergic reaction
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Describe the emergency:</Label>
                <Textarea
                  placeholder="What is happening? (e.g., 'Chest pain and shortness of breath')"
                  value={emergencyDescription}
                  onChange={(e) => setEmergencyDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleAIAssessment}
                disabled={loading || !emergencyDescription.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'AI Assessing...' : '🤖 Get AI Health Coach Assessment'}
              </Button>

              {aiAssessment && (
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-semibold mb-2">
                    🤖 AI Health Coach Assessment:
                  </p>
                  <p className="text-white text-sm">{aiAssessment}</p>
                </div>
              )}

              {aiAssessment && (
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <p className="text-white font-semibold text-center">
                    Do you need to call 911 now?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setShow911Dialog(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      No, I'm Okay
                    </Button>
                    
                    <Button
                      onClick={handleConfirm911}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                      data-testid="confirm-911-button"
                    >
                      <PhoneCall className="w-5 h-5 mr-2" />
                      YES, CALL 911
                    </Button>
                  </div>

                  <p className="text-gray-500 text-xs text-center">
                    By clicking "YES, CALL 911", you confirm this is a medical emergency
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Contact Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Emergency Contact
          </Button>
        )}

        {/* Add Contact Form */}
        {showAddForm && (
          <Card className="bg-gray-900/50 border-orange-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Add Emergency Contact</span>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400"
                >
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
                  <Select 
                    value={formData.relationship} 
                    onValueChange={(value) => setFormData({...formData, relationship: value})}
                  >
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

                <div className="space-y-2">
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Priority (1 = first)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.priority_order}
                    onChange={(e) => setFormData({...formData, priority_order: parseInt(e.target.value)})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Medical Info (optional)</Label>
                <Textarea
                  placeholder="Blood type, allergies, medications, conditions..."
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
              <CardTitle className="text-white">Your Emergency Contacts</CardTitle>
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
                            <h4 className="text-white font-semibold text-lg">{contact.name}</h4>
                            {contact.is_primary_contact && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
                                PRIMARY
                              </span>
                            )}
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                              Priority {contact.priority_order}
                            </span>
                          </div>
                          
                          <p className="text-gray-400 text-sm mb-2 capitalize">
                            {contact.relationship}
                          </p>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-green-500" />
                              <a 
                                href={`tel:${contact.phone_primary}`}
                                className="text-green-400 hover:text-green-300"
                              >
                                {contact.phone_primary}
                              </a>
                            </div>
                            
                            {contact.phone_secondary && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-green-500" />
                                <a 
                                  href={`tel:${contact.phone_secondary}`}
                                  className="text-green-400 hover:text-green-300"
                                >
                                  {contact.phone_secondary}
                                </a>
                              </div>
                            )}
                            
                            {contact.medical_info && (
                              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
                                <p className="text-blue-400 text-xs font-semibold">Medical Info:</p>
                                <p className="text-gray-300 text-xs">{contact.medical_info}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
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

        {/* Empty State */}
        {contacts.length === 0 && !showAddForm && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="p-12 text-center">
              <Phone className="w-16 h-16 text-orange-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-white text-xl mb-2">No Emergency Contacts Yet</h3>
              <p className="text-gray-400 mb-6">
                Add your family, friends, or healthcare providers for quick access in emergencies.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPA Message */}
        <div className="text-center mt-8">
          <p className="text-red-500 text-sm italic">
            "When seconds matter, TokHealth is ready." 🚨
          </p>
          <p className="text-gray-600 text-xs mt-1">
            KPA System - Keep People Alive
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;
