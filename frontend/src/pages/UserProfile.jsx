import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Activity, Heart, Scale, Ruler, Calendar, Target, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const UserProfile = ({ onProfileSaved }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate',
    blood_type: '',
    health_goals: [],
    medical_conditions: []
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setFormData({
          name: data.data.name || '',
          age: data.data.age || '',
          gender: data.data.gender || 'male',
          height_cm: data.data.height_cm || '',
          weight_kg: data.data.weight_kg || '',
          activity_level: data.data.activity_level || 'moderate',
          blood_type: data.data.blood_type || '',
          health_goals: data.data.health_goals || [],
          medical_conditions: data.data.medical_conditions || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.age || !formData.height_cm || !formData.weight_kg) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
          height_cm: parseFloat(formData.height_cm),
          weight_kg: parseFloat(formData.weight_kg)
        })
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        toast.success('Profile saved! Your targets are now personalized.');
        if (onProfileSaved) onProfileSaved(data.data);
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="user-profile">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <User className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Your Baseline</h1>
          </div>
          <p className="text-slate-500 text-sm">This data personalizes your health targets</p>
        </div>

        {/* Profile Form */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <User className="w-4 h-4 mr-2 text-sky-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-slate-600 text-sm">Name *</Label>
              <Input
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-white border-slate-200 text-slate-800"
                data-testid="profile-name"
              />
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  Age *
                </Label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="profile-age"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Sex *</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800" data-testid="profile-gender">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm flex items-center">
                  <Ruler className="w-3 h-3 mr-1" />
                  Height (cm) *
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 175"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({...formData, height_cm: e.target.value})}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="profile-height"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-600 text-sm flex items-center">
                  <Scale className="w-3 h-3 mr-1" />
                  Weight (kg) *
                </Label>
                <Input
                  type="number"
                  placeholder="e.g., 75"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                  className="bg-white border-slate-200 text-slate-800"
                  data-testid="profile-weight"
                />
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-1">
              <Label className="text-slate-600 text-sm flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Activity Level
              </Label>
              <Select value={formData.activity_level} onValueChange={(v) => setFormData({...formData, activity_level: v})}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800" data-testid="profile-activity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (2x/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blood Type */}
            <div className="space-y-1">
              <Label className="text-slate-600 text-sm flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                Blood Type (optional)
              </Label>
              <Select value={formData.blood_type || ''} onValueChange={(v) => setFormData({...formData, blood_type: v})}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-5"
              data-testid="save-profile-button"
            >
              {saving ? 'Saving...' : (profile ? 'Update Profile' : 'Save Profile')}
            </Button>
          </CardContent>
        </Card>

        {/* Calculated Targets (show if profile exists) */}
        {profile && profile.targets && (
          <Card className="bg-white/90 border-emerald-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Target className="w-4 h-4 mr-2 text-emerald-600" />
                Your Personalized Targets
                <CheckCircle className="w-4 h-4 ml-2 text-emerald-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">Daily Calories</div>
                  <div className="text-slate-800 font-bold">{profile.targets.recommended_calories} kcal</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">Protein</div>
                  <div className="text-slate-800 font-bold">{profile.targets.recommended_protein_g}g</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">Daily Steps</div>
                  <div className="text-slate-800 font-bold">{profile.targets.recommended_steps?.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">Water</div>
                  <div className="text-slate-800 font-bold">{(profile.targets.recommended_water_ml / 1000).toFixed(1)}L</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">BMI</div>
                  <div className="text-slate-800 font-bold">{profile.targets.bmi} ({profile.targets.bmi_category})</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 text-xs">Max Heart Rate</div>
                  <div className="text-slate-800 font-bold">{profile.targets.max_heart_rate} BPM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Your baseline data is used to calculate personalized targets in The Loop
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
