import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ID } from 'appwrite';
import service from '../appwrite/config';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Container } from '../components';

const MultipleQRGenerator = () => {
  const [appliances, setAppliances] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    modelNo: '',
    purchaseDate: '',
    serviceDate: '',
    location: '' // Added location field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create a ref for each QR code
  const qrRefs = useRef([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addAppliance = async () => {
    // Name, modelNo, and location are required
    if (!formData.name || !formData.modelNo || !formData.location) {
      setError('Name, Model No, and Location are required');
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

      // Store in Appwrite
      await service.createQr({
        ...documentData,
        id: uniqueId,
      });

      // Generate QR with unique ID and type
      const qrContent = JSON.stringify({
        uniqueId,
        type: 'appliance',
        location: formData.location // Include location in QR data
      });

      setAppliances([...appliances, { ...documentData, qrContent }]);
      setFormData({ name: '', modelNo: '', purchaseDate: '', serviceDate: '', location: '' });
    } catch (err) {
      setError('Failed to create entry. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    // Create a PDF in landscape mode
    const doc = new jsPDF({
      orientation: 'landscape', // Set orientation to landscape
      unit: 'mm',
      format: 'a4'
    });

    const qrSize = 20; // QR code size in mm
    const margin = 10; // Page margins
    const spacing = 2; // Space between QRs
    const textHeight = 5; // Space for text

    // Calculate positions for grid layout (12 columns x 7 rows = 84 per page)
    const cols = 12; // Increased columns for landscape mode
    const rows = 7; // Reduced rows for landscape mode

    for (let i = 0; i < appliances.length; i++) {
      if (i > 0 && i % (cols * rows) === 0) {
        doc.addPage(); // Add a new page after every 84 QR codes
      }

      const appliance = appliances[i];
      const col = i % cols;
      const row = Math.floor((i % (cols * rows)) / cols);

      // Calculate positions
      const x = margin + (col * (qrSize + spacing));
      const y = margin + (row * (qrSize + spacing + textHeight));

      // Get QR code element
      const qrCodeElement = qrRefs.current[i];
      if (qrCodeElement) {
        // Convert to PNG
        const canvas = await html2canvas(qrCodeElement, {
          scale: 3, // Higher scale for small QR clarity
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/png');

        // Add QR code
        doc.addImage(
          imgData,
          'PNG',
          x,
          y,
          qrSize,
          qrSize
        );

        // Add "name-location" text below the QR code
        doc.setFontSize(8);
        const text = `${appliance.name.substring(0, 15)}-${appliance.location.substring(0, 15)}`; // Truncate long names/locations
        doc.text(
          text,
          x + qrSize / 2,
          y + qrSize + 3,
          { align: 'center' }
        );
      }
    }

    doc.save('appliance_qrs.pdf');
  };

  return (
    <Container>
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Multiple Appliance QR Generator</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
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
            <label className="block text-sm font-medium text-gray-700">Model Number *</label>
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              placeholder="Enter location"
              required
            />
          </div>
          <button
            onClick={addAppliance}
            disabled={loading || !formData.name || !formData.modelNo || !formData.location}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Adding...' : 'Add Appliance'}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {appliances.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Generated QR Codes</h2>
            <div className="grid grid-cols-10 gap-1">
              {appliances.map((appliance, index) => (
                <div key={appliance.uniqueId} className="relative">
                  <div ref={(el) => (qrRefs.current[index] = el)}>
                    <QRCodeSVG
                      value={appliance.qrContent}
                      size={80} // Smaller size for preview
                      level="H"
                      className="border border-gray-200"
                    />
                  </div>
                  <div className="text-center text-xs p-1 truncate">
                    {appliance.name} - {appliance.location}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={generatePDF}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Export All as PDF
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default MultipleQRGenerator;