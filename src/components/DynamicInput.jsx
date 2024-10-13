// DynamicInput.jsx
import React from 'react';

const DynamicInput = ({ label, value, onChange }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-bold mb-1">{label}:</label>
            <input 
                type="text" 
                className="border rounded-lg p-2 w-full" 
                value={value}
                onChange={onChange}
                placeholder={`Enter ${label.toLowerCase()}`} 
            />
        </div>
    );
};

export default DynamicInput;
