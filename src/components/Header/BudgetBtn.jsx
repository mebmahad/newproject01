import React from "react";
import { useNavigate } from 'react-router-dom';

function BudgetBtn() {
    const navigate = useNavigate();

    const handleBudgetClick = () => {
        // Define your logic here, for example:
        navigate('/all-budgets'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleBudgetClick}
        >
            Budget
        </button>
    );
}

export default BudgetBtn;
