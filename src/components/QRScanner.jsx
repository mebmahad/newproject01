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
        const parsedData = JSON.parse(result.data);
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

  // Update handled via QRDataViewer; simply update local state here.
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
        <div className="relative overflow-hidden rounded-lg" style={{ paddingTop: '100%' }}>
          <QrScanner
            delay={300}
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
            <div className="absolute inset-0 bg-red-100 flex items-center justify-center">
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
