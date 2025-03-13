import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import QRDataViewer from './QRDataViewer';
import service from '../appwrite/config';
import { Container } from "../components";
import { useNavigate } from "react-router-dom";

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const navigate = useNavigate();

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

      qrScannerRef.current.start().then(() => {
        setCameraActive(true);
      }).catch((err) => {
        setError('Failed to access camera. Please ensure camera permissions are granted.');
        console.error(err);
      });
    }

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
      const qrContent = JSON.parse(result);
      if (!qrContent.uniqueId || qrContent.type !== 'appliance' || !qrContent.location) {
        setError('Invalid QR code format.');
        return;
      }

      const document = await service.getQr(qrContent.uniqueId);
      if (document) {
        setScanResult(document);
        qrScannerRef.current.stop();
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
      const updatedDocument = await service.updateQr(updatedData.$id, updatedData);
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
    <Container>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Scan Appliance QR</h1>
        {!scanResult ? (
          <div className="relative overflow-hidden rounded-lg" style={{ paddingTop: '100%' }}>
            <video
              ref={videoRef}
              className="w-full h-auto"
              playsInline
            ></video>
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-medium">Loading...</span>
              </div>
            )}
            {error && (
              <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
                <span className="text-red-600 font-medium">{error}</span>
              </div>
            )}
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
    </Container>
  );
};

export default QRScanner;