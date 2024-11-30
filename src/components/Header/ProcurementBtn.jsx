import React from "react";
import { useNavigate } from 'react-router-dom';

function ProcurementBtn() {
    const navigate = useNavigate();

    const handleProcurementClick = () => {
        // Define your logic here, for example:
        navigate('/procurement'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleProcurementClick}
        >
            Procurement
        </button>
    );
}

export default ProcurementBtn;
