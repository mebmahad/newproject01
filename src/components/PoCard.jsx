import React from "react";
import { Link } from "react-router-dom";

function PoCard({ id, pono, vendorname, totalamountwithgst }) {
  return (
    <Link to={`/po/${id}`}>
      <div className="mb-4 bg-gray-100 shadow-lg p-6 rounded-lg hover:shadow-xl transition-shadow duration-300">
        {/* PONO */}
        <p className="text-gray-700 text-sm uppercase tracking-wide font-semibold">
          PONO: <span className="text-blue-600">{pono || "N/A"}</span>
        </p>

        {/* Vendor Name */}
        <p className="text-lg font-bold text-gray-800 mt-2">
          Vendor: <span className="text-indigo-600">{vendorname || "Unknown"}</span>
        </p>

        {/* Total Amount with GST */}
        <p className="text-sm text-gray-600 mt-2">
          <span className="font-medium text-green-500">Total (with GST):</span> ₹
          {totalamountwithgst || "0.00"}
        </p>
      </div>
    </Link>
  );
}

export default PoCard;
