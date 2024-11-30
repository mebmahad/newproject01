import React from 'react';
import { Link } from 'react-router-dom';

function ProcureCard({ id, items }) {
  return (
    <Link to={`/procure/${id}`} className="block hover:scale-105 transform transition duration-300">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg">
        {/* Procurement Info */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">Procurement Details</h3>
        <ul className="space-y-3">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-800">Item:</span> {item.Item}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Quantity:</span> {item.Quantity}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Budget:</span> ${item.BudgetAmount}
                </p>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No items specified</li>
          )}
        </ul>
      </div>
    </Link>
  );
}

export default ProcureCard;
