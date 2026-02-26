import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload, Loader2 } from 'lucide-react';

const CameraCapture = ({ onCapture, label = 'Take Photo', context = '', disabled = false }) => {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    if (onCapture) {
      setProcessing(true);
      try {
        await onCapture(file, context);
      } finally {
        setProcessing(false);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
      }
    }
  };

  return (
    <div className="inline-flex items-center" data-testid="camera-capture">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        data-testid="camera-file-input"
      />

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
          {processing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
          <button
            onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || processing}
          variant="outline"
          size="sm"
          className="border-sky-300 text-sky-600 hover:bg-sky-50"
          data-testid="camera-btn"
        >
          <Camera className="w-4 h-4 mr-1" />
          {label}
        </Button>
      )}
    </div>
  );
};

export default CameraCapture;
