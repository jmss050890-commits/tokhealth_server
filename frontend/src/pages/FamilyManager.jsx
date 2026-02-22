import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, UserCircle, Heart, Activity, CheckCircle, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const FamilyManager = ({ onMemberSwitch }) => {
  const [members, setMembers] = useState([]);
  const [activeMember, setActiveMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    relationship: 'self',
    avatar_color: '#0ea5e9'
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const avatarColors = [
    { color: '#0ea5e9', name: 'Sky' },
    { color: '#8b5cf6', name: 'Purple' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#10b981', name: 'Green' },
    { color: '#f59e0b', name: 'Orange' },
    { color: '#ef4444', name: 'Red' }
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const [membersRes, activeRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/family/members`),
        fetch(`${BACKEND_URL}/api/family/active`)
      ]);
      
      const membersData = await membersRes.json();
      const activeData = await activeRes.json();
      
      if (membersData.success) {
        setMembers(membersData.data || []);
      }
      if (activeData.success) {
        setActiveMember(activeData.data);
      }
    } catch (error) {
      console.error('Error fetching family:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.age) {
      toast.error('Name and age are required');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/family/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`${formData.name} added to family!`);
        setFormData({
          name: '',
          age: '',
          gender: 'male',
          relationship: 'self',
          avatar_color: '#0ea5e9'
        });
        setShowAddForm(false);
        fetchMembers();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add family member');
    }
  };

  const switchToMember = async (memberId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/family/members/${memberId}/activate`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        setActiveMember(data.data);
        toast.success(`Now tracking ${data.data.name}`);
        if (onMemberSwitch) onMemberSwitch(data.data);
      }
    } catch (error) {
      console.error('Error switching member:', error);
      toast.error('Failed to switch member');
    }
  };

  const getZoneColor = (zone) => {
    if (zone === 'green') return 'bg-emerald-500';
    if (zone === 'yellow') return 'bg-yellow-500';
    if (zone === 'red') return 'bg-red-500';
    return 'bg-slate-300';
  };

  const getZoneEmoji = (zone) => {
    if (zone === 'green') return '🟢';
    if (zone === 'yellow') return '🟡';
    if (zone === 'red') return '🔴';
    return '⚪';
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="family-manager">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Family</h1>
          </div>
          <p className="text-slate-500 text-sm">Track health for your whole family</p>
        </div>

        {/* Active Member Banner */}
        {activeMember && (
          <Card className="bg-gradient-to-r from-sky-500 to-cyan-500 border-none text-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: activeMember.avatar_color || '#0ea5e9' }}
                >
                  {activeMember.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activeMember.name}</h3>
                  <p className="text-white/80 text-sm">Currently tracking</p>
                </div>
              </div>
              <CheckCircle className="w-6 h-6" />
            </CardContent>
          </Card>
        )}

        {/* Family Members */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center justify-between">
              <span>Family Members ({members.length})</span>
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No family members yet</p>
                <p className="text-slate-400 text-sm">Add yourself and your family</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.member_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    activeMember?.member_id === member.member_id
                      ? 'bg-sky-50 border-sky-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                  onClick={() => switchToMember(member.member_id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: member.avatar_color || '#0ea5e9' }}
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{member.name}</h3>
                        <p className="text-slate-500 text-xs">
                          {member.age} years • {member.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {activeMember?.member_id === member.member_id && (
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">Active</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="bg-white border-2 border-sky-400">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm">Add Family Member</CardTitle>
              <Button onClick={() => setShowAddForm(false)} variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Name *</Label>
                  <Input
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Age *</Label>
                  <Input
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="bg-white border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-600 text-sm">Relationship</Label>
                  <Select value={formData.relationship} onValueChange={(v) => setFormData({...formData, relationship: v})}>
                    <SelectTrigger className="bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-slate-600 text-sm">Avatar Color</Label>
                <div className="flex gap-2">
                  {avatarColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setFormData({...formData, avatar_color: c.color})}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.avatar_color === c.color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>

              <Button onClick={handleAddMember} className="w-full bg-sky-600 hover:bg-sky-700">
                Add to Family
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Keep People Alive - Family First
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyManager;
