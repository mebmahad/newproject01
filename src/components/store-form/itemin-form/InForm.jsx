import React, { useState } from 'react';
import { Button, TextField, Paper, Typography } from '@mui/material';
import InOutservice from '../../../appwrite/storeEntriesConfig';

export default function InForm() {
    const [items, setItems] = useState([{ itemName: '', quantity: 0 }]);
    const [sourceLocation, setSourceLocation] = useState('');
    
    // Unique timestamp-based ID generation for each entry
    const generateUniqueId = () => `in-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const handleAddItem = () => {
        setItems([...items, { itemName: '', quantity: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleSubmit = async () => {
        try {
            const entryId = generateUniqueId();
            const timestamp = new Date().toISOString();
            const itemListString = JSON.stringify(items);

            await InOutservice.createInForm({
                Items: itemListString,
                securelocation: sourceLocation,
                timestamp,
                id: entryId
            });

            // Update the quantity in the store for each item
            items.forEach(async ({ itemName, quantity }) => {
                await service.updateItemQuantity(itemName, quantity);
            });

            // Reset form after submission
            setItems([{ itemName: '', quantity: 0 }]);
            setSourceLocation('');
        } catch (error) {
            console.error("Error submitting InForm:", error);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Typography variant="h5" className="mb-4">InForm Entry</Typography>
            {items.map((item, index) => (
                <Paper key={index} className="p-3 mb-3">
                    <TextField
                        label="Item Name"
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                        fullWidth
                    />
                </Paper>
            ))}
            <Button onClick={handleAddItem} variant="outlined" color="primary" className="mb-4">
                Add Another Item
            </Button>
            <TextField
                label="Source Location"
                value={sourceLocation}
                onChange={(e) => setSourceLocation(e.target.value)}
                fullWidth
            />
            <Button onClick={handleSubmit} variant="contained" color="success" className="mt-4">
                Submit InForm Entry
            </Button>
        </div>
    );
}
