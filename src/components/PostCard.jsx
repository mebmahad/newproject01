import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import service from '../appwrite/config'; // Import your service for updating status

function PostCard({ $id, areas, subarea, feild, problem, createdAt, status }) {
  const [daysPassed, setDaysPassed] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();

      const differenceInTime = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) -
        Date.UTC(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());

      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
      setDaysPassed(differenceInDays);
    }
  }, [createdAt]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleApprovalSubmit = async () => {
    try {
      // Use the existing updatePost method to update only the status field
      await service.updatePost($id, { status: "approval" });
      // Update local status
      setCurrentStatus("approval");
      alert("Request submitted for approval.");
    } catch (error) {
      console.error("Failed to submit approval request:", error);
      alert("An error occurred while submitting the request.");
    }
  };

  return (
    <div className="flex flex-col border border-black/10 rounded-lg p-3 shadow-sm shadow-white/50 text-black">
      {/* Link to the post details */}
      <Link to={`/post/${$id}`} className="flex flex-row gap-x-3 text-xl font-bold">
        <li>
          {areas} <span className="mx-2">{subarea}</span> <span className="mx-2">{feild}</span>{" "}
          <span className="mx-2">{problem}</span>
        </li>
        <div className="text-sm text-gray-500 ml-auto">
          {daysPassed} {daysPassed === 1 ? "day" : "days"} ago
        </div>
      </Link>

      {/* Show current status */}
      <div className="mt-1 text-sm">
        Status: <span className={`font-bold ${currentStatus === "approval" ? "text-blue-500" : ""}`}>{currentStatus}</span>
      </div>

      {/* Checkbox and button outside the Link component */}
      <div className="flex items-center mt-2">
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
          onClick={handleApprovalSubmit}
        >
          Submit for Approval
        </button>
      )}
    </div>
  );
}

export default PostCard;
