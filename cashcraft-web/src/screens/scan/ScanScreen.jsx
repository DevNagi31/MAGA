import { useState, useRef, useEffect } from 'react';
import { Camera, Image, Zap, FileText, X, Circle } from 'lucide-react';
import { Colors } from '../../constants/theme';
import { useOCRStore } from '../../store';
import { getMockReceiptItems, runVisionOCR } from '../../utils/ocrParser';

export default function ScanScreen({ navigate }) {
  const { setScannedItems } = useOCRStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();
  const streamRef = useRef();
  const canvasRef = useRef();

  // Start camera stream
  useEffect(() => {
    if (!showCamera) return;
    let stopped = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        setShowCamera(false);
        setError('Camera access denied. Use Gallery to upload an image.');
      });
    return () => {
      stopped = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [showCamera]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    stopCamera();
    processBase64(base64);
  };

  const processBase64 = async (base64) => {
    setIsProcessing(true);
    setError('');
    for (let i = 0; i <= 80; i += 10) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(i);
    }
    try {
      const result = await runVisionOCR(base64);
      setProgress(100);
      setScannedItems(result.items, result.total);
      navigate('scanResults');
    } catch (err) {
      setError(err.message || 'Could not read receipt. Try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const processFile = async (file, useMock = false) => {
    setIsProcessing(true);
    setError('');
    for (let i = 0; i <= 80; i += 10) {
      await new Promise((r) => setTimeout(r, 60));
      setProgress(i);
    }
    try {
      let result;
      if (useMock) {
        result = getMockReceiptItems();
      } else {
        const base64 = await fileToBase64(file);
        result = await runVisionOCR(base64);
      }
      setProgress(100);
      setScannedItems(result.items, result.total);
      navigate('scanResults');
    } catch (err) {
      setError(err.message || 'Could not read receipt. Try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  // Camera viewfinder overlay
  if (showCamera) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', flex: 1, objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Corner marks */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 32, height: 32,
            [i < 2 ? 'top' : 'bottom']: '18%',
            [i % 2 === 0 ? 'left' : 'right']: '12%',
            borderTop: i < 2 ? `2px solid ${Colors.accent}` : 'none',
            borderBottom: i >= 2 ? `2px solid ${Colors.accent}` : 'none',
            borderLeft: i % 2 === 0 ? `2px solid ${Colors.accent}` : 'none',
            borderRight: i % 2 !== 0 ? `2px solid ${Colors.accent}` : 'none',
          }} />
        ))}

        {/* Close button */}
        <button
          onClick={stopCamera}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(0,0,0,0.5)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={18} color="#fff" />
        </button>

        {/* Capture button */}
        <div style={{ padding: '24px 20px 36px', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
          <button
            onClick={capturePhoto}
            style={{
              width: 72, height: 72, borderRadius: 36,
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              border: '4px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(52,211,153,0.5)',
            }}
          >
            <Circle size={28} color="#050505" fill="#050505" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: Colors.bg }}>
      {/* Scan area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#050505', position: 'relative', overflow: 'hidden',
      }}>
        {/* Corner marks */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 32, height: 32,
            [i < 2 ? 'top' : 'bottom']: 80,
            [i % 2 === 0 ? 'left' : 'right']: '20%',
            borderTop: i < 2 ? `2px solid ${Colors.accent}` : 'none',
            borderBottom: i >= 2 ? `2px solid ${Colors.accent}` : 'none',
            borderLeft: i % 2 === 0 ? `2px solid ${Colors.accent}` : 'none',
            borderRight: i % 2 !== 0 ? `2px solid ${Colors.accent}` : 'none',
          }} />
        ))}

        {isProcessing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '60%' }}>
            <div style={{ width: '100%', height: 4, background: Colors.border, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: Colors.accent, borderRadius: 2, transition: 'width 0.1s' }} />
            </div>
            <p style={{ fontSize: 14, color: Colors.textSecondary }}>Scanning receipt... {progress}%</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <FileText size={32} color={Colors.accent} style={{ opacity: 0.6 }} />
            <p style={{ fontSize: 15, color: Colors.textSecondary }}>Position receipt within frame</p>
          </div>
        )}

        {error && (
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.15)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)' }}>
            <p style={{ fontSize: 13, color: Colors.danger }}>{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isProcessing && (
        <div style={{
          background: Colors.bg, padding: '24px 20px 32px',
          borderTop: `1px solid ${Colors.border}`,
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            {/* Camera */}
            <button
              onClick={() => setShowCamera(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'linear-gradient(135deg, #34D399, #10B981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(52,211,153,0.35)',
              }}>
                <Camera size={22} color="#050505" />
              </div>
              <span style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Camera</span>
            </button>

            {/* Gallery */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: Colors.accentDim,
                border: `1px solid ${Colors.accent}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Image size={22} color={Colors.accent} />
              </div>
              <span style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Gallery</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>

          <button
            onClick={() => processFile(null, true)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <Zap size={14} color={Colors.accent} />
            <span style={{ fontSize: 13, color: Colors.accent, fontWeight: '500' }}>Demo scan (mock data)</span>
          </button>
        </div>
      )}
    </div>
  );
}
