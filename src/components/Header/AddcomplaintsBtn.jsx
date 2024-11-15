import React from "react";
import { useNavigate } from 'react-router-dom';

function AddcomplaintsBtn() {
    const navigate = useNavigate();

    const handleAddcomplaintsClick = () => {
        // Define your logic here, for example:
        navigate('/add-post'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleAddcomplaintsClick}
        >
            Add Complaints
        </button>
    );
}

export default AddcomplaintsBtn;
