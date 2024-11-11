import React from 'react';
import { Link } from 'react-router-dom';

function PoCard({ id, items, vendorname }) {
  return (
    <Link to={`/po/${id}`}>
      {/* Po Info */}
      <div className="mb-8 bg-white shadow-md p-4 rounded">
        <ul className="list-disc pl-5">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="mb-2">
                <span className="font-semibold">VendorName:</span> {vendorname.VendorName}
                <span className="font-semibold">Item:</span> {item.Item}
                <span className="ml-4 font-semibold">Quantity:</span> {item.Quantity}
                <span className="ml-4 font-semibold">Rate:</span> {item.Rate}
                <span className="ml-4 font-semibold">Amount:</span> {item.Amount}
              </li>
            ))
          ) : (
            <li>No items specified</li>
          )}
        </ul>
      </div>
    </Link>
  );
}

export default PoCard;
