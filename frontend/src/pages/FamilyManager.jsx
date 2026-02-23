import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, UserCircle, Heart, Activity, CheckCircle, X, ChevronRight, Mail, UserPlus, Clock, Check, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FamilyManager = () => {
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState({ received: [], sent: [] });
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('tokhealth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const user = localStorage.getItem('tokhealth_user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, invitesRes, dashboardRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/family/members`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/family/invites/pending`, { headers: getAuthHeaders() }),
        fetch(`${BACKEND_URL}/api/family/dashboard`, { headers: getAuthHeaders() })
      ]);

      const membersData = await membersRes.json();
      const invitesData = await invitesRes.json();
      const dashboardData = await dashboardRes.json();

      if (dashboardData.success) {
        setMembers(dashboardData.data?.members || []);
      }
      if (invitesData.success) {
        setPendingInvites(invitesData.data || { received: [], sent: [] });
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
      toast.error('Failed to load family data');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/family/invite`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setInviteEmail('');
        setShowInviteForm(false);
        fetchData();
      } else {
        toast.error(data.detail || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
    }
  };

  const respondToInvite = async (linkId, action) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/family/invites/${linkId}/respond`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(data.detail || 'Failed to respond to invitation');
      }
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast.error('Failed to respond');
    }
  };

  const removeMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this family member?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/family/members/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Family member removed');
        fetchData();
      } else {
        toast.error(data.detail || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  const getZoneColor = (zone) => {
    if (zone === 'green') return 'bg-emerald-500';
    if (zone === 'yellow') return 'bg-yellow-500';
    if (zone === 'red') return 'bg-red-500';
    return 'bg-slate-300';
  };

  const getZoneBadge = (zone) => {
    const colors = {
      green: 'bg-emerald-100 text-emerald-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-slate-100 text-slate-500'
    };
    const labels = {
      green: 'Healthy',
      yellow: 'Caution',
      red: 'Alert',
      gray: 'No Data'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[zone] || colors.gray}`}>
        {labels[zone] || labels.gray}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
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
          <p className="text-slate-500 text-sm">Link with family to see each other's health status</p>
        </div>

        {/* Pending Invitations Received */}
        {pendingInvites.received.length > 0 && (
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-800 text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingInvites.received.map((invite) => (
                <div key={invite.link_id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <p className="font-medium text-slate-800">{invite.from_user_name}</p>
                    <p className="text-slate-500 text-xs">{invite.from_user_email}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => respondToInvite(invite.link_id, 'accept')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                      data-testid={`accept-invite-${invite.link_id}`}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInvite(invite.link_id, 'decline')}
                      className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                      data-testid={`decline-invite-${invite.link_id}`}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Family Dashboard */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center justify-between">
              <span>Family Health Status ({members.length})</span>
              <Button
                onClick={() => setShowInviteForm(true)}
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-xs"
                data-testid="invite-family-button"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Invite Family
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No family members linked yet</p>
                <p className="text-slate-400 text-sm">Invite family by email to see their health status</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.user_id}
                  className={`p-3 rounded-lg border transition-all ${
                    member.is_self
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                  data-testid={`family-member-${member.user_id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getZoneColor(member.health_zone)}`} />
                      <div>
                        <h3 className="font-semibold text-slate-800">{member.name}</h3>
                        <p className="text-slate-500 text-xs">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getZoneBadge(member.health_zone)}
                      {!member.is_self && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeMember(member.user_id)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          data-testid={`remove-member-${member.user_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sent Invitations */}
        {pendingInvites.sent.length > 0 && (
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-600 text-sm flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Sent Invitations (Pending)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingInvites.sent.map((invite) => (
                <div key={invite.link_id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="font-medium text-slate-800">{invite.to_user_name}</p>
                    <p className="text-slate-500 text-xs">{invite.to_user_email}</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    Waiting...
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Invite Form Modal */}
        {showInviteForm && (
          <Card className="bg-white border-2 border-sky-400 shadow-lg">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-800 text-sm">Invite Family Member</CardTitle>
              <Button onClick={() => setShowInviteForm(false)} variant="ghost" size="icon" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-500 text-sm">
                Enter the email address of a family member. They must have a TokHealth account.
              </p>
              <div className="space-y-2">
                <Label className="text-slate-600 text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="family@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10 bg-white border-slate-200"
                    data-testid="invite-email-input"
                  />
                </div>
              </div>
              <Button 
                onClick={sendInvite} 
                className="w-full bg-sky-600 hover:bg-sky-700"
                data-testid="send-invite-button"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            Each person has their own account. Link to share health status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FamilyManager;
