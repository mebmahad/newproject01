import React from "react";
import { useNavigate } from 'react-router-dom';

function AllposBtn() {
    const navigate = useNavigate();

    const handleAllposClick = () => {
        // Define your logic here, for example:
        navigate('/all-pos'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleAllposClick}
        >
            All POs
        </button>
    );
}

export default AllposBtn;
