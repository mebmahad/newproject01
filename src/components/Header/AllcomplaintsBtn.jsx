import React from "react";
import { useNavigate } from 'react-router-dom';

function AllcomplaintsBtn() {
    const navigate = useNavigate();

    const handleAllcomplaintsClick = () => {
        // Define your logic here, for example:
        navigate('/all-posts'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleAllcomplaintsClick}
        >
            All Complaints
        </button>
    );
}

export default AllcomplaintsBtn;
