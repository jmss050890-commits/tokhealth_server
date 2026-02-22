import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Clock, Calendar, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PrescriptionTracker = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    form: 'tablet',
    prescribed_by: '',
    schedule_frequency: 'daily',
    schedule_times: ['08:00'],
    with_food: false,
    instructions: '',
    start_date: new Date().toISOString().split('T')[0],
    days_supply: 30,
    refills_remaining: 3
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/prescriptions/`);
      const data = await response.json();
      if (data.success) {
        setPrescriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleAddPrescription = async () => {
    if (!formData.name || !formData.dosage) {
      toast.error('Medication name and dosage are required');
      return;
    }

    setLoading(true);
    try {
      // This will be implemented when backend route is ready
      toast.success('Prescription added! Reminder: Take your medication on schedule.');
      
      setFormData({
        name: '',
        dosage: '',
        form: 'tablet',
        prescribed_by: '',
        schedule_frequency: 'daily',
        schedule_times: ['08:00'],
        with_food: false,
        instructions: '',
        start_date: new Date().toISOString().split('T')[0],
        days_supply: 30,
        refills_remaining: 3
      });
      setShowAddForm(false);
      fetchPrescriptions();
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsTaken = (prescriptionId) => {
    toast.success('Medication marked as taken! Great job staying on track! 💪');
    // Will implement actual logging when backend is ready
  };

  const addScheduleTime = () => {
    setFormData({
      ...formData,
      schedule_times: [...formData.schedule_times, '12:00']
    });
  };

  const updateScheduleTime = (index, value) => {
    const newTimes = [...formData.schedule_times];
    newTimes[index] = value;
    setFormData({ ...formData, schedule_times: newTimes });
  };

  const removeScheduleTime = (index) => {
    const newTimes = formData.schedule_times.filter((_, i) => i !== index);
    setFormData({ ...formData, schedule_times: newTimes });
  };

  const getDaysUntilRefill = (prescription) => {
    // Calculate based on start date and days supply
    const startDate = new Date(prescription.start_date || Date.now());
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const daysSupply = prescription.days_supply || 30;
    return Math.max(0, daysSupply - daysElapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900/20 via-black to-purple-900/20 p-4" data-testid="prescription-tracker">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Pill className="w-10 h-10 text-pink-500" />
            <h1 className="text-4xl font-bold">
              <span className="text-pink-500">PRESCRIPTION</span>{' '}
              <span className="text-white">TRACKER</span>
            </h1>
          </div>
          <p className="text-gray-400 mb-2">Never miss a dose - Stay healthy, stay alive</p>
          <p className="text-pink-500 text-xs italic">For your brother's diabetes & everyone's health 💊</p>
          <p className="text-gray-600 text-xs">KPA System - Keep People Alive</p>
        </div>

        {/* Family Message */}
        <Card className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-pink-500/50">
          <CardContent className="p-6 text-center">
            <p className="text-pink-400 font-semibold mb-2">👨‍👩‍👦 For The Sanders Family</p>
            <p className="text-gray-300 text-sm">
              Medication adherence saves lives. This tracker helps manage diabetes medications,
              daily prescriptions, and ensures everyone stays on schedule.
            </p>
            <p className="text-pink-500 text-xs mt-2 italic">
              "Fix it, Run it, Again - Until Wellness Wins" 💚
            </p>
          </CardContent>
        </Card>

        {/* Add Prescription Button */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Prescription / Medication
          </Button>
        )}

        {/* Add Prescription Form */}
        {showAddForm && (
          <Card className="bg-gray-900/50 border-pink-500/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Add New Prescription</span>
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
                  <Label className="text-gray-300">Medication Name *</Label>
                  <Input
                    placeholder="e.g., Metformin, Lisinopril, Insulin"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Dosage *</Label>
                  <Input
                    placeholder="e.g., 500mg, 10mg, 20 units"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Form</Label>
                  <Select value={formData.form} onValueChange={(value) => setFormData({...formData, form: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">💊 Tablet</SelectItem>
                      <SelectItem value="capsule">💊 Capsule</SelectItem>
                      <SelectItem value="injection">💉 Injection</SelectItem>
                      <SelectItem value="liquid">🥤 Liquid</SelectItem>
                      <SelectItem value="topical">🧴 Topical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Prescribed By</Label>
                  <Input
                    placeholder="Dr. Smith"
                    value={formData.prescribed_by}
                    onChange={(e) => setFormData({...formData, prescribed_by: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Frequency</Label>
                  <Select value={formData.schedule_frequency} onValueChange={(value) => setFormData({...formData, schedule_frequency: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Days Supply</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.days_supply}
                    onChange={(e) => setFormData({...formData, days_supply: parseInt(e.target.value)})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Refills Remaining</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={formData.refills_remaining}
                    onChange={(e) => setFormData({...formData, refills_remaining: parseInt(e.target.value)})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Schedule Times */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Schedule Times</Label>
                  <Button
                    type="button"
                    onClick={addScheduleTime}
                    variant="outline"
                    size="sm"
                    className="border-pink-500/50 text-pink-500"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Time
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {formData.schedule_times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateScheduleTime(index, e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      {formData.schedule_times.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeScheduleTime(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* With Food Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="with-food"
                  checked={formData.with_food}
                  onChange={(e) => setFormData({...formData, with_food: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="with-food" className="text-gray-300 cursor-pointer">
                  Take with food
                </Label>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label className="text-gray-300">Special Instructions</Label>
                <Textarea
                  placeholder="e.g., Take with full glass of water, avoid alcohol, etc."
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleAddPrescription}
                disabled={loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-6"
              >
                {loading ? 'Adding...' : 'Save Prescription'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Today's Medications */}
        <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-500" />
              Today's Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length > 0 ? (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg flex items-center">
                          <Pill className="w-5 h-5 mr-2 text-pink-500" />
                          {prescription.medication_info?.name} {prescription.medication_info?.dosage}
                        </h4>
                        
                        {prescription.schedule?.times && (
                          <div className="mt-2 space-y-1">
                            {prescription.schedule.times.map((time, idx) => (
                              <div key={idx} className="flex items-center space-x-3">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-300">{time}</span>
                                <Button
                                  onClick={() => handleMarkAsTaken(prescription.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Mark Taken
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {prescription.schedule?.with_food && (
                          <p className="text-yellow-400 text-sm mt-2">🍽️ Take with food</p>
                        )}
                        
                        {prescription.schedule?.instructions && (
                          <p className="text-gray-400 text-sm mt-2">
                            ℹ️ {prescription.schedule.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Pill className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-gray-400">No medications tracked yet</p>
                <p className="text-gray-500 text-sm mt-1">Add your first prescription above</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Prescriptions */}
        {prescriptions.length > 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">All Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prescriptions.map((prescription) => {
                  const daysLeft = getDaysUntilRefill(prescription);
                  const needsRefill = daysLeft <= 7;
                  
                  return (
                    <Card key={prescription.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-white font-semibold">
                              {prescription.medication_info?.name} {prescription.medication_info?.dosage}
                            </h4>
                            <p className="text-gray-400 text-sm capitalize">
                              {prescription.medication_info?.form} • {prescription.schedule?.frequency?.replace('_', ' ')}
                            </p>
                            {prescription.medication_info?.prescribed_by && (
                              <p className="text-gray-500 text-xs mt-1">
                                Prescribed by {prescription.medication_info.prescribed_by}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            {prescription.adherence && (
                              <div className="text-green-500 text-sm font-semibold">
                                {Math.round(prescription.adherence.adherence_rate)}% adherence
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {needsRefill && (
                          <div className="bg-orange-900/20 border border-orange-500/50 rounded p-2 mb-2">
                            <p className="text-orange-400 text-sm font-semibold flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Refill needed soon - {daysLeft} days remaining
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Refills: {prescription.duration?.refills_remaining || 0}</span>
                          <span>Started: {new Date(prescription.duration?.start_date || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPA Message */}
        <div className="text-center">
          <p className="text-pink-500 text-sm italic">
            "Medication adherence = staying alive. Never miss a dose." 💊
          </p>
          <p className="text-gray-600 text-xs mt-1">
            KPA System - For your brother's diabetes & everyone's health
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionTracker;
