import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function PostCard({ $id, areas, subarea, feild, problem, createdAt }) {
  const [daysPassed, setDaysPassed] = useState(0);

  useEffect(() => {
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const currentDate = new Date();
      const differenceInTime = currentDate - createdDate;
      const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert to days
      setDaysPassed(differenceInDays);
    }
  }, [createdAt]);

  return (
    <Link to={`/post/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          {areas}
          <span className="mx-2">{subarea}</span>
          <span className="mx-2">{feild}</span>
          <span className="mx-2">{problem}</span>
        </li>
        <div className="text-sm text-gray-500 ml-auto">
          {daysPassed} days ago
        </div>
      </div>
    </Link>
  );
}

export default PostCard;

