import React from 'react';
import { Link } from 'react-router-dom';

function PoCard({ id, items, vendorname }) {
  return (
    <Link to={`/po/${id}`}>
      <div className="mb-8 bg-white shadow-md p-4 rounded">
        {/* Vendor Name */}
        <p className="font-bold">Vendor Name: {vendorname || 'No vendor specified'}</p>

        {/* Items */}
        <ul className="list-disc pl-5 mt-2">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="mt-2">
                <p>Quantity: <span className="font-bold">{item.Quantity}</span></p>
                <p>Rate: <span className="font-bold">{item.Rate}</span></p>
                <p>Amount: <span className="font-bold">{item.Amount}</span></p>
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
