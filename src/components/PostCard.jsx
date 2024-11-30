import React, { useEffect, useState } from 'react';

function PostCard({ $id, areas, subarea, feild, problem, createdAt, status, isSelectable, onSelect }) {
  const [daysPassed, setDaysPassed] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();

      const differenceInTime =
        Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) -
        Date.UTC(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
      setDaysPassed(differenceInDays);
    }
  }, [createdAt]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    onSelect($id, !isChecked);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-blue-600"; // Incomplete - blue
      case "approval":
        return "text-yellow-600"; // InApproval - yellow
      case "inactive":
        return "text-green-600"; // Complete - green
      case "In Procure":
        return "text-purple-600"; // In Procure - purple
      default:
        return "text-gray-500"; // Default color for unknown status
    }
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition transform hover:scale-105">
      {/* Selectable Checkbox */}
      {isSelectable && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            className="mr-2 accent-blue-600"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <span className="text-gray-600 text-sm">Select this post</span>
        </div>
      )}
      
      {/* Content Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">
          {areas} - {subarea} - {feild}
        </h3>
        <p className="text-sm text-gray-500">{daysPassed} days ago</p>
      </div>

      {/* Problem Description */}
      <p className="text-gray-700 mt-2">
        <span className="font-medium">Problem:</span> {problem}
      </p>

      {/* Status Section */}
      <div className="mt-3">
        <span className="text-sm text-gray-600">Status: </span>
        <span className={`text-sm font-bold ${getStatusColor(status)}`}>{status}</span>
      </div>
    </div>
  );
}

export default PostCard;
