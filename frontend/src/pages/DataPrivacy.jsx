import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Download, Trash2, Database, Eye, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const DataPrivacy = () => {
  const [dataInfo, setDataInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDataSummary();
  }, []);

  const fetchDataSummary = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/privacy/my-data`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setDataInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching data summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/privacy/export`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tokhealth-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully!');
      }
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeleting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/privacy/delete-account`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Account deleted. Goodbye.');
        localStorage.clear();
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const totalRecords = dataInfo?.data_categories?.reduce((sum, cat) => sum + cat.records, 0) || 0;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="text-center space-y-1">
        <Shield className="w-10 h-10 text-sky-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">Data Privacy Dashboard</h1>
        <p className="text-slate-500 text-sm">Your data, your control</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
        </div>
      ) : (
        <>
          {/* Data Overview */}
          <Card className="bg-white/90 border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-800 text-sm flex items-center">
                <Database className="w-4 h-4 mr-2 text-sky-600" />
                Your Stored Data ({totalRecords} total records)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dataInfo?.data_categories?.map((cat, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-2">
                    {cat.has_data ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="text-slate-700 text-sm">{cat.name}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    cat.has_data ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {cat.records} records
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Profile Summary */}
          {dataInfo?.profile_summary && (
            <Card className="bg-white/90 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-slate-800 text-sm flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-green-600" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-slate-600"><span className="font-medium">Name:</span> {dataInfo.profile_summary.name}</p>
                {dataInfo.profile_summary.allergies.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-600">Allergies: </span>
                    {dataInfo.profile_summary.allergies.map((a, i) => (
                      <span key={i} className="inline-block bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full mr-1">{a}</span>
                    ))}
                  </div>
                )}
                {dataInfo.profile_summary.food_tolerances.length > 0 && (
                  <div>
                    <span className="font-medium text-slate-600">Food Sensitivities: </span>
                    {dataInfo.profile_summary.food_tolerances.map((f, i) => (
                      <span key={i} className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full mr-1">{f}</span>
                    ))}
                  </div>
                )}
                {dataInfo.profile_summary.spiritual_preference && (
                  <p className="text-slate-600"><span className="font-medium">Spiritual:</span> {dataInfo.profile_summary.spiritual_preference}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Export Data */}
          <Card className="bg-white/90 border-blue-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Download className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-medium text-slate-800">Export Your Data</h3>
                  <p className="text-slate-500 text-xs">Download all your data as a JSON file</p>
                </div>
              </div>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="export-data-btn"
              >
                {exporting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Exporting...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" />Download All My Data</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Privacy Info */}
          <Card className="bg-sky-50/80 border-sky-200">
            <CardContent className="p-4 space-y-2">
              <h3 className="font-medium text-sky-800 text-sm">Privacy Commitment</h3>
              <ul className="text-sky-700 text-xs space-y-1">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-sky-600 shrink-0" />
                  <span>All your data is encrypted and private to your account</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-sky-600 shrink-0" />
                  <span>No data is shared with third parties</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-sky-600 shrink-0" />
                  <span>You can export or delete your data at any time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-sky-600 shrink-0" />
                  <span>AI analysis is used solely for your health insights</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="bg-white/90 border-red-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="font-medium text-red-700">Delete Account</h3>
                  <p className="text-slate-500 text-xs">Permanently delete your account and all associated data</p>
                </div>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  data-testid="show-delete-btn"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              ) : (
                <div className="bg-red-50 rounded-lg p-3 space-y-3">
                  <p className="text-red-700 text-sm font-medium">This action cannot be undone!</p>
                  <p className="text-red-600 text-xs">Type DELETE to confirm:</p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="w-full p-2 border border-red-300 rounded text-sm"
                    placeholder="Type DELETE"
                    data-testid="delete-confirm-input"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || deleting}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      data-testid="confirm-delete-btn"
                    >
                      {deleting ? 'Deleting...' : 'Delete Forever'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataPrivacy;
