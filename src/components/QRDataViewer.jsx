import { useState, useEffect } from 'react';
import service from '../appwrite/config';

const QRDataViewer = ({ data, onUpdate, onClose }) => {
  const [formData, setFormData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.modelNo || !formData.purchaseDate || !formData.serviceDate) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const updatedData = await service.updateQr(data.uniqueId, formData);
      onUpdate(updatedData);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4">Appliance Details</h2>
        {!isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Name</span>
              <span className="text-gray-600">{formData.name}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Model No</span>
              <span className="text-gray-600">{formData.modelNo}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Purchase Date</span>
              <span className="text-gray-600">{formData.purchaseDate}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium text-gray-700">Service Date</span>
              <span className="text-gray-600">{formData.serviceDate}</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Edit Details
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model No</label>
              <input
                type="text"
                name="modelNo"
                value={formData.modelNo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
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
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Close
      </button>
    </div>
  );
};

export default QRDataViewer;
