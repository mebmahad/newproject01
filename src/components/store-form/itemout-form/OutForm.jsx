import React, { useState } from 'react';
import { Button, TextField, Paper, Typography } from '@mui/material';
import service from '../../appwrite/config';

export default function OutForm() {
    const [items, setItems] = useState([{ itemName: '', quantity: 0 }]);
    const [destinationLocation, setDestinationLocation] = useState('');

    // Unique timestamp-based ID generation for each entry
    const generateUniqueId = () => `out-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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

            await service.createOutForm({
                Items: itemListString,
                securelocation: destinationLocation,
                timestamp,
                id: entryId
            });

            // Update the quantity in the store for each item
            items.forEach(async ({ itemName, quantity }) => {
                await service.updateItemQuantity(itemName, -quantity);
            });

            // Reset form after submission
            setItems([{ itemName: '', quantity: 0 }]);
            setDestinationLocation('');
        } catch (error) {
            console.error("Error submitting OutForm:", error);
        }
    };

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Typography variant="h5" className="mb-4">OutForm Entry</Typography>
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
                label="Destination Location"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                fullWidth
            />
            <Button onClick={handleSubmit} variant="contained" color="success" className="mt-4">
                Submit OutForm Entry
            </Button>
        </div>
    );
}
