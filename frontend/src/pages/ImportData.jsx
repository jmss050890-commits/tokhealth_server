import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Activity, Watch } from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/utils/auth';

const ImportData = () => {
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/import/template`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        // Create downloadable file
        const blob = new Blob([data.data.template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tokhealth_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Template downloaded!');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('tokhealth_token');
      const response = await fetch(`${BACKEND_URL}/api/import/import/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setImportResult(data.data);
        if (data.data.imported_count > 0) {
          toast.success(`Imported ${data.data.imported_count} records!`);
        }
        if (data.data.errors && data.data.errors.length > 0) {
          toast.warning(`${data.data.errors.length} rows had errors`);
        }
      } else {
        toast.error(data.detail || 'Import failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-4" data-testid="import-data">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Upload className="w-5 h-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Import Data</h1>
          </div>
          <p className="text-slate-500 text-sm">Import health data from files or connect devices</p>
        </div>

        {/* CSV Import */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2 text-sky-600" />
              CSV File Import
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-500 text-sm">
              Upload a CSV file with your health data. You can export data from other apps or create your own spreadsheet.
            </p>

            {/* Download Template */}
            <Button
              onClick={downloadTemplate}
              variant="outline"
              className="w-full border-sky-300 text-sky-700 hover:bg-sky-50"
              data-testid="download-template-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-slate-600 text-sm">Upload CSV File</Label>
              <div className="border-2 border-dashed border-sky-200 rounded-lg p-6 text-center hover:border-sky-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  data-testid="csv-file-input"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">
                    {uploading ? 'Uploading...' : 'Click to select CSV file'}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Supports: steps, heart rate, blood pressure, sleep, weight, calories, water
                  </p>
                </label>
              </div>
            </div>

            {/* Import Result */}
            {importResult && (
              <div className={`p-3 rounded-lg ${importResult.errors?.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <div className="flex items-center space-x-2">
                  {importResult.errors?.length > 0 ? (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                  <span className={`font-medium ${importResult.errors?.length > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    Imported {importResult.imported_count} records
                  </span>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2 text-xs text-amber-700">
                    <p className="font-medium">Errors:</p>
                    <ul className="list-disc pl-4 mt-1">
                      {importResult.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...and {importResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Connections */}
        <Card className="bg-white/90 border-sky-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-800 text-sm flex items-center">
              <Watch className="w-4 h-4 mr-2 text-sky-600" />
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Fitbit */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Fitbit</p>
                  <p className="text-slate-500 text-xs">Steps, heart rate, sleep</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-teal-400 text-teal-700 hover:bg-teal-50"
                data-testid="connect-fitbit-btn"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            {/* Apple Health */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">Apple Health</p>
                  <p className="text-slate-500 text-xs">iPhone health data</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-400 text-red-700 hover:bg-red-50"
                disabled
              >
                Coming Soon
              </Button>
            </div>

            <p className="text-slate-400 text-xs text-center pt-2">
              Device integrations coming soon! For now, export data from your device app and import via CSV.
            </p>
          </CardContent>
        </Card>

        {/* CSV Format Help */}
        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-700 text-sm">CSV Format Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-slate-600 space-y-2">
              <p><strong>Required column:</strong> date (YYYY-MM-DD format)</p>
              <p><strong>Optional columns:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>steps - Daily step count</li>
                <li>heart_rate - Heart rate in BPM</li>
                <li>blood_pressure_systolic - Systolic BP</li>
                <li>blood_pressure_diastolic - Diastolic BP</li>
                <li>sleep_hours - Hours of sleep</li>
                <li>weight_kg - Weight in kilograms</li>
                <li>calories - Calories consumed</li>
                <li>water_ml - Water intake in ml</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;
