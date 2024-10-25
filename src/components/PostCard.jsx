import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PostCard({ $id, areas, subarea, feild, problem, createdAt }) {
  const [daysPassed, setDaysPassed] = useState(0); // Days since creation
  const [isChecked, setIsChecked] = useState(false); // Checkbox state for strikethrough effect

  useEffect(() => {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();

      // Calculate difference in days (accounting for UTC to avoid timezone issues)
      const differenceInTime = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        - Date.UTC(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
      setDaysPassed(differenceInDays);
    }
  }, [createdAt]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <Link to={`/post/${$id}`}>
      <div
        className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black ${
          isChecked ? 'line-through text-gray-500' : ''
        }`}
      >
        <li className="text-xl font-bold">
          {areas}
          <span className="mx-2">{subarea}</span>
          <span className="mx-2">{feild}</span>
          <span className="mx-2">{problem}</span>
        </li>
        <div className="text-sm text-gray-500 ml-auto">
          {/* Display number of days passed */}
          {daysPassed} {daysPassed === 1 ? "day" : "days"} ago
        </div>
      </div>
      <div className="flex items-center mt-2">
        {/* Checkbox for strikethrough */}
        <input
          type="checkbox"
          className="mr-2"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span>Mark as Complete</span>
      </div>
      {isChecked && (
        <button
          className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => alert("Request submitted for approval.")}
        >
          Submit for Approval
        </button>
      )}
    </Link>
  );
}

export default PostCard;
