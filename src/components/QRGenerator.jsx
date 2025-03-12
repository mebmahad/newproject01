import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ID } from 'appwrite';
import service from '../appwrite/config';
import { uniqueId } from 'lodash';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    modelNo: '',
    purchaseDate: '',
    serviceDate: ''
  });
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateQR = async () => {
    if (!formData.name || !formData.modelNo || !formData.purchaseDate || !formData.serviceDate) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const uniqueId = ID.unique();
      const documentData = {
        ...formData,
        uniqueId,
        createdAt: new Date().toISOString()
      };
      await service.createQr({
        ...documentData,
        id: uniqueId,
      });
      setQrData(JSON.stringify({ 
        uniqueId,
        type: 'appliance'
      }));
    } catch (err) {
      setError('Failed to create entry. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${formData.name}_qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Appliance QR Generator</h1>
      {!qrData ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Enter appliance name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model Number</label>
            <input
              type="text"
              name="modelNo"
              value={formData.modelNo}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Enter model number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Date</label>
            <input
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              required
            />
          </div>
          <button
            onClick={generateQR}
            disabled={loading || !formData.name || !formData.modelNo || !formData.purchaseDate || !formData.serviceDate}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG
            id="qr-code"
            value={qrData}
            size={256}
            level="H"
            className="border-4 border-white rounded-lg"
          />
          <button
            onClick={downloadQR}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download QR
          </button>
          <button
            onClick={() => setFormData({
              name: '',
              modelNo: '',
              purchaseDate: '',
              serviceDate: ''
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Create New Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;
