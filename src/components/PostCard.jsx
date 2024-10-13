import React from 'react'; 
import { Link } from 'react-router-dom';

function PostCard({ $id, areas, subarea, feild, problem }) {
  return (
    <Link to={`/post/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          {areas}
          <span className="mx-2">{subarea}</span>
          <span className="mx-2">{feild}</span>
          <span className="mx-2">{problem}</span>
        </li>
      </div>
    </Link>
  );
}

export default PostCard;
