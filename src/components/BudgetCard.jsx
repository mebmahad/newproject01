import React from 'react'; 
import { Link } from 'react-router-dom';

function BudgetCard({ $id, yearlyBudget, monthlyBudget, fiscalYear }) {
  return (
    <Link to={`/budget/${$id}`}>
      <div className="flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black">
        <li className="text-xl font-bold">
          <span className="mx-2">{yearlyBudget}</span>
          <span className="mx-2">{monthlyBudget}</span>
          <span className="mx-2">{fiscalYear}</span>
        </li>
      </div>
    </Link>
  );
}

export default BudgetCard;
