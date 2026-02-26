import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Smartphone, CheckCircle, AlertCircle, Loader2, Activity, Footprints } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const AppleHealthKit = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/healthkit/status`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) setStatus(data.data);
    } catch (error) {
      console.error('HealthKit status error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!isIOS) {
      toast.error('HealthKit is only available on iOS devices');
      return;
    }

    setSyncing(true);
    try {
      // On iOS Safari, we'd use the HealthKit JS API
      // For now, show instructions
      toast.info('HealthKit sync requires the TokHealth app on your iPhone. Feature coming soon!');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center space-y-1">
        <Heart className="w-10 h-10 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Apple HealthKit</h1>
        <p className="text-slate-500 text-sm">Sync health data from your iPhone</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
        </div>
      ) : (
        <>
          {/* Status Card */}
          <Card className="bg-white/90 border-rose-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-rose-600" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                {status?.connected ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-green-700 font-medium text-sm">Connected</p>
                      <p className="text-slate-500 text-xs">Last sync: {status?.last_sync ? new Date(status.last_sync).toLocaleString() : 'Never'}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-amber-700 font-medium text-sm">Not Connected</p>
                      <p className="text-slate-500 text-xs">{isIOS ? 'Ready to connect' : 'Requires iOS device'}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Types */}
          <Card className="bg-white/90 border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm">Available Data Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Steps', icon: Footprints, color: 'text-emerald-600' },
                { name: 'Heart Rate', icon: Heart, color: 'text-rose-600' },
                { name: 'Active Calories', icon: Activity, color: 'text-orange-600' },
                { name: 'Sleep Hours', icon: Activity, color: 'text-indigo-600' },
                { name: 'Blood Oxygen', icon: Activity, color: 'text-sky-600' },
              ].map((type, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center space-x-2">
                    <type.icon className={`w-4 h-4 ${type.color}`} />
                    <span className="text-slate-700 text-sm">{type.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status?.connected
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {status?.connected ? 'Syncing' : 'Available'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sync Button */}
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5"
            data-testid="healthkit-sync-btn"
          >
            {syncing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Syncing...</>
            ) : (
              <><Heart className="w-4 h-4 mr-2" />{isIOS ? 'Connect HealthKit' : 'Open on iPhone to Connect'}</>
            )}
          </Button>

          {/* Instructions */}
          {!isIOS && (
            <Card className="bg-amber-50/80 border-amber-200">
              <CardContent className="p-4 space-y-2">
                <p className="text-amber-800 font-medium text-sm">How to connect Apple HealthKit:</p>
                <ol className="text-amber-700 text-xs space-y-1 list-decimal list-inside">
                  <li>Open this app on your iPhone using Safari</li>
                  <li>Add TokHealth to your home screen (Share &gt; Add to Home Screen)</li>
                  <li>Open the app and navigate to this page</li>
                  <li>Tap "Connect HealthKit" and grant permissions</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AppleHealthKit;
