import React from 'react';
import { Link } from 'react-router-dom';

function HeadCard({ $id, Headname, Budgteamount }) {
  return (
    <Link to={`/head/${$id}`} className="block hover:scale-105 transform transition duration-300">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg">
        {/* Head Info */}
        <h3 className="text-lg font-bold text-gray-800">{Headname}</h3>
        <p className="text-sm text-gray-700 mt-2">
          <span className="font-medium">Budget Amount:</span> ${Budgteamount}
        </p>
      </div>
    </Link>
  );
}

export default HeadCard;
