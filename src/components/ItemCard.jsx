import React from 'react'; 
import { Link } from 'react-router-dom';

function ItemCard({ $id, Item, Head, Price, Quantity, Location }) {
  return (
    <Link to={`/item/${$id}`} className="block hover:scale-105 transform transition duration-300">
      <div className="flex flex-col bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg gap-y-2">
        {/* Item Name */}
        <h3 className="text-lg font-bold text-gray-800">
          {Item}
        </h3>
        {/* Details */}
        <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-700">Head:</span> {Head}
          </p>
          <p>
            <span className="font-medium text-gray-700">Price:</span> ${Price}
          </p>
          <p>
            <span className="font-medium text-gray-700">Quantity:</span> {Quantity}
          </p>
          <p>
            <span className="font-medium text-gray-700">Location:</span> {Location}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default ItemCard;
