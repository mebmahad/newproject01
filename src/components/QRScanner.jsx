import { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import service from '../appwrite/config';
import QRDataViewer from './QRDataViewer';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async (result) => {
    if (result && result.data && !loading) {
      try {
        setLoading(true);
        const parsedData = JSON.parse(result.text);
        if (!parsedData.uniqueId) {
          throw new Error("QR code data invalid");
        }
        const document = await service.getQr(parsedData.uniqueId);
        if (!document) {
          throw new Error("Data not found for QR code");
        }
        setScanResult(document);
        setError('');
      } catch (err) {
        setError('Invalid QR Code or Data Not Found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera');
  };

  // Update handled via QRDataViewer; update local state when needed.
  const updateData = (updatedData) => {
    setScanResult(updatedData);
  };

  const restartScanner = () => {
    setScanResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Scan Appliance QR</h1>
      {!scanResult ? (
        // Adjusted container styling for better video view
        <div style={{ width: '100%', height: '400px', position: 'relative' }}>
          <QrScanner
            delay={300}
            style={{ width: '100%', height: '100%' }}
            onError={handleError}
            onScan={handleScan}
            constraints={{
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            }}
          />
          {error && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="text-red-600 font-medium">{error}</span>
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
