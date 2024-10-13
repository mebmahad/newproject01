import React from 'react'; 
import { Link } from 'react-router-dom';

function VendorCard({ $id, Name, Address, GSTNo }) {
  return (
    <Link to={`/vendor/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          {Name}
          <span className="mx-2">{Address}</span>
          <span className="mx-2">{GSTNo}</span>
        </li>
      </div>
    </Link>
  );
}

export default VendorCard;