import React from "react";
import { useNavigate } from 'react-router-dom';

function ManagestoreBtn() {
    const navigate = useNavigate();

    const handleManagestoreClick = () => {
        // Define your logic here, for example:
        navigate('/store-manage'); // Redirect to the procurement page
    };

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={handleManagestoreClick}
        >
            Manage Store
        </button>
    );
}

export default ManagestoreBtn;
