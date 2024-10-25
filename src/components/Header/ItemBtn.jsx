import React from "react";
import { useNavigate } from 'react-router-dom';

function ItemBtn() {
    const navigate = useNavigate();

    const handleItemClick = () => {
        // Define your logic here, for example:
        navigate('/all-items'); // Redirect to the items page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleItemClick}
        >
            Item
        </button>
    );
}

export default ItemBtn;