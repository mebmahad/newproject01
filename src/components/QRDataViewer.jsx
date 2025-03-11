import { useState } from 'react';
import { format } from 'date-fns';

const QRDataViewer = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleUpdate = () => {
    localStorage.setItem('applianceData', JSON.stringify(formData));
    onUpdate();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold mb-4">Appliance Details</h2>
        
        {!isEditing ? (
          <div className="space-y-3">
            <DetailItem label="Name" value={formData.name} />
            <DetailItem label="Model Number" value={formData.modelNo} />
            <DetailItem label="Purchase Date" value={format(new Date(formData.purchaseDate), 'PPP')} />
            <DetailItem label="Service Date" value={format(new Date(formData.serviceDate), 'PPP')} />
            
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Edit Details
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <EditField
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <EditField
              label="Model Number"
              name="modelNo"
              value={formData.modelNo}
              onChange={(e) => setFormData({...formData, modelNo: e.target.value})}
            />
            <EditField
              label="Purchase Date"
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
            />
            <EditField
              label="Service Date"
              type="date"
              name="serviceDate"
              value={formData.serviceDate}
              onChange={(e) => setFormData({...formData, serviceDate: e.target.value})}
            />
            
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center border-b pb-2">
    <span className="font-medium text-gray-700">{label}</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

const EditField = ({ label, type = 'text', name, value, onChange }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default QRDataViewer;