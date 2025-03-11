import { useState, useRef, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import QRDataViewer from './QRDataViewer';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const scannerRef = useRef(null);

  const handleScan = (result) => {
    if (result) {
      try {
        const data = JSON.parse(result.text);
        if (data.name && data.modelNo) {
          setScanResult(data);
          setError('');
        }
      } catch (err) {
        setError('Invalid QR Code');
        setTimeout(() => setError(''), 2000);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera');
    setHasCameraAccess(false);
  };

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasCameraAccess(true);
    } catch (err) {
      setError('Camera access denied');
      setHasCameraAccess(false);
    }
  };

  useEffect(() => {
    checkCameraAccess();
  }, []);

  const previewStyle = {
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Scan Appliance QR</h1>
      
      {!scanResult ? (
        <div className="relative overflow-hidden rounded-lg" style={{ paddingTop: '100%' }}>
          {hasCameraAccess ? (
            <QrScanner
              ref={scannerRef}
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={previewStyle}
              constraints={{
                video: {
                  facingMode: 'environment',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {error || 'Camera access required'}
              </span>
            </div>
          )}
          {error && hasCameraAccess && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <QRDataViewer 
          data={scanResult} 
          onUpdate={() => setScanResult(null)}
        />
      )}
    </div>
  );
};

export default QRScanner;