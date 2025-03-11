import { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import QRDataViewer from './QRDataViewer';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');

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
    setError('Error scanning QR code');
    setTimeout(() => setError(''), 2000);
  };

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
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={previewStyle}
            constraints={{
              facingMode: 'environment',
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
          onUpdate={() => setScanResult(null)}
        />
      )}
    </div>
  );
};

export default QRScanner;