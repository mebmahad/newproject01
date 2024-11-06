import React from 'react'; 
import { Link } from 'react-router-dom';

function HeadCard({ $id, Headname, Budgteamount }) {
  return (
    <Link to={`/head/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          <span className="mx-2">{Headname}</span>
          <span className="mx-2">{Budgteamount}</span>
        </li>
      </div>
    </Link>
  );
}

export default HeadCard;
