import React from 'react'; 
import { Link } from 'react-router-dom';

function ItemCard({ $id, Item, Head, Price, Quantity, Location }) {
  return (
    <Link to={`/item/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          {Item}
          <span className="mx-2">{Head}</span>
          <span className="mx-2">{Price}</span>
          <span className="mx-2">{Quantity}</span>
          <span className="mx-2">{Location}</span>
        </li>
      </div>
    </Link>
  );
}

export default ItemCard;
