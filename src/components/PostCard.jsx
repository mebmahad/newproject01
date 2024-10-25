import React, { useEffect, useState } from 'react';

function PostCard({ $id, areas, subarea, feild, problem, createdAt, status, isSelectable, onSelect }) {
  const [daysPassed, setDaysPassed] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

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
    onSelect($id, !isChecked);
  };

  return (
    <div className={`flex flex-col border border-black/10 rounded-lg p-3 shadow-sm ${status === "approval" ? "text-blue-500" : "text-black"}`}>
      <div className="flex flex-row items-center gap-x-3">
        {isSelectable && (
          <input
            type="checkbox"
            className="mr-2"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        )}
        <div className="text-xl font-bold">{areas} - {subarea} - {feild} - {problem}</div>
        <div className="text-sm text-gray-500 ml-auto">{daysPassed} days ago</div>
      </div>
      <div className="mt-1 text-sm">
        Status: <span className="font-bold">{status}</span>
      </div>
    </div>
  );
}

export default PostCard;
