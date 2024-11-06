import React from "react";
import { useNavigate } from 'react-router-dom';

function HeadBtn() {
    const navigate = useNavigate();

    const handleHeadClick = () => {
        // Define your logic here, for example:
        navigate('/all-heads'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleHeadClick}
        >
            Head
        </button>
    );
}

export default HeadBtn;
