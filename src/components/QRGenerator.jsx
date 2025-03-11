import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    modelNo: '',
    purchaseDate: '',
    serviceDate: ''
  });
  const [qrData, setQrData] = useState('');
  const [editMode, setEditMode] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('applianceData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
      setQrData(savedData);
      setEditMode(false);
      setQrVisible(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateQR = () => {
    const data = {
      ...formData,
      purchaseDate: format(new Date(formData.purchaseDate), 'yyyy-MM-dd'),
      serviceDate: format(new Date(formData.serviceDate), 'yyyy-MM-dd')
    };
    const jsonString = JSON.stringify(data);
    setQrData(jsonString);
    localStorage.setItem('applianceData', jsonString);
    setEditMode(false);
    setQrVisible(true);
  };

  const updateServiceDate = () => {
    setEditMode(true);
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
      
      {editMode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
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
            disabled={!formData.name || !formData.modelNo || !formData.purchaseDate || !formData.serviceDate}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            Generate QR Code
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {qrVisible && (
            <div className="flex flex-col items-center">
              <QRCodeSVG
                id="qr-code"
                value={qrData}
                size={256}
                level="H"
                className="border-4 border-white rounded-lg"
              />
              <div className="mt-4 space-x-4">
                <button
                  onClick={updateServiceDate}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Update Service Date
                </button>
                <button
                  onClick={downloadQR}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Download QR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QRGenerator;