// StorePage.js
import React, { useState } from 'react';
import { Button, Typography } from '@mui/material';
import InForm from '../components';
import OutForm from '../components';

export default function StorePage() {
    const [showInForm, setShowInForm] = useState(false);
    const [showOutForm, setShowOutForm] = useState(false);

    const handleInFormClick = () => {
        setShowInForm(true);
        setShowOutForm(false);
    };

    const handleOutFormClick = () => {
        setShowInForm(false);
        setShowOutForm(true);
    };

    return (
        <div className="p-4">
            <Typography variant="h4" className="mb-4 text-center">Manage Store Items</Typography>
            <div className="flex justify-center space-x-4 mb-4">
                <Button variant="contained" color="primary" onClick={handleInFormClick}>
                    Add Items
                </Button>
                <Button variant="contained" color="secondary" onClick={handleOutFormClick}>
                    Remove Items
                </Button>
            </div>
            {showInForm && <InForm />}
            {showOutForm && <OutForm />}
        </div>
    );
}
