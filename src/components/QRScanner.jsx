import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner'; // Use the base qr-scanner library
import QRDataViewer from './QRDataViewer';
import service from '../appwrite/config';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Initialize QR Scanner
  useEffect(() => {
    if (videoRef.current && !qrScannerRef.current) {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      );

      // Start the scanner when the component mounts
      qrScannerRef.current.start().then(() => {
        setCameraActive(true);
      }).catch((err) => {
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        console.error(err);
      });
    }

    // Cleanup on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, []);

  const handleScan = async (result) => {
    if (!result || loading) return;

    setLoading(true);
    setError('');

    try {
      // Parse the QR code content
      const qrContent = JSON.parse(result);
  
      // Validate the QR code content
      if (!qrContent.uniqueId || qrContent.type !== 'appliance') {
        setError('Invalid QR code format.');
        return;
      }

      // Fetch data from Appwrite
      const document = await service.getQr(qrContent.uniqueId);

      if (document) {
        setScanResult(document);
        qrScannerRef.current.stop(); // Stop the scanner after successful scan
        setCameraActive(false);
      } else {
        setError('Data not found for this QR code.');
      }
    } catch (err) {
      setError('Invalid QR code or data format.');
      console.error('Scan Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (updatedData) => {
    try {
      // Update data in Appwrite
      const updatedDocument = await service.updateQr(updatedData.$id, updatedData);

      // Update the local state with the new data
      setScanResult(updatedDocument);
    } catch (err) {
      setError('Failed to update data.');
      console.error(err);
    }
  };

  const restartScanner = () => {
    setScanResult(null);
    setError('');
    if (qrScannerRef.current) {
      qrScannerRef.current.start().then(() => {
        setCameraActive(true);
      }).catch((err) => {
        setError('Failed to restart camera.');
        console.error(err);
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Scan Appliance QR</h1>
      
      {!scanResult ? (
        <div className="relative overflow-hidden rounded-lg" style={{ paddingTop: '100%' }}>
          <video
            ref={videoRef}
            className="w-full h-auto"
            playsInline
          ></video>

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium">Loading...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}

          {/* Camera Status */}
          {!cameraActive && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {error || 'Starting camera...'}
              </span>
            </div>
          )}
        </div>
      ) : (
        <QRDataViewer 
          data={scanResult} 
          onUpdate={updateData}
          onClose={restartScanner}
        />
      )}
    </div>
  );
};

export default QRScanner;