import React from 'react'; 
import { Link } from 'react-router-dom';

function ProcureCard({ $id, Items}) {

  
  return (
    <Link to={`/procure/${$id}`}>
      {/* Procurement Info */}
      <div className="mb-8">
                        <ul className="list-disc pl-5">
                            {procure.items && procure.items.length > 0 ? (
                                procure.items.map((item, index) => (
                                    <li key={index} className="mb-2">
                                        <span className="font-semibold">Item:</span> {item.Item}
                                        <span className="ml-4 font-semibold">Quantity:</span> {item.Quantity}
                                        <span className="ml-4 font-semibold">Budget:</span> {item.BudgetAmount}
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

export default ProcureCard;