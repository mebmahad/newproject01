import React, { useState, useEffect } from 'react';
import { Button, TextField, Paper, Typography, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import service from '../../../appwrite/config';

export default function OutForm() {
    const [allItems, setAllItems] = useState([]); // Complete list of items fetched from the service
    const [filteredItems, setFilteredItems] = useState([]); // Filtered items based on search
    const [searchTerm, setSearchTerm] = useState(''); // Search input
    const [newItem, setNewItem] = useState({ itemName: '', quantity: 0 }); // New item being added
    const [items, setItems] = useState([]); // List of items in the form
    const [destinationLocation, setDestinationLocation] = useState('');
    const [openDialog, setOpenDialog] = useState(false); // For opening the add item dialog

    // Fetch all items when component mounts
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const fetchedItems = await service.getItems();
                console.log("Fetched Items:", fetchedItems); // Debugging fetched data

                if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
                    // Extract only the "Item" property from each document
                    const itemList = fetchedItems.map((item) => item.Item);
                    setAllItems(itemList);
                }
            } catch (error) {
                console.error("Error fetching items:", error);
            }
        };
        fetchItems();
    }, []);

    // Handle search input change
    const handleSearchChange = async (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim() === '') {
            setFilteredItems([]); // If the search input is empty, clear filtered items
            return;
        }

        // Call searchItems function to filter items
        const results = await service.searchItems(e.target.value);
        setFilteredItems(results.map((item) => item.Item)); // Assuming "Item" is the name field
    };

    // Handle selecting an item from the search results
    const handleItemSelect = (selectedItem) => {
        setNewItem({ ...newItem, itemName: selectedItem });
        setFilteredItems([]); // Clear filtered items after selection
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 });
    };

    // Handle adding the item to the list
    const handleAddItem = () => {
        if (newItem.itemName && newItem.quantity > 0) {
            setItems([...items, newItem]);
            setNewItem({ itemName: '', quantity: 0 }); // Reset new item
        } else {
            alert('Please select an item and specify the quantity.');
        }
    };

    // Handle removing an item from the list
    const handleRemoveItem = (index) => {
        const updatedItems = items.filter((_, idx) => idx !== index);
        setItems(updatedItems);
    };

    const handleSubmit = async () => {
        try {
            const entryId = `out-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const timestamp = new Date().toISOString();
            const itemListString = JSON.stringify(items);

            await service.createOutForm({
                Items: itemListString,
                securelocation: destinationLocation,
                timestamp,
                id: entryId,
            });

            items.forEach(async ({ itemName, quantity }) => {
                await service.updateItemQuantity(itemName, -quantity);
            });

            setItems([]); // Clear all items after submission
            setDestinationLocation('');
        } catch (error) {
            console.error("Error submitting OutForm:", error);
        }
    };

    // Handle dialog open and close
    const handleDialogOpen = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Typography variant="h5" className="mb-4">OutForm Entry</Typography>

            {/* Add Item Button */}
            <Button onClick={handleDialogOpen} variant="outlined" color="primary" className="mb-4">
                Add Item
            </Button>

            {/* Display added items */}
            {items.length > 0 && (
                <div className="mb-4">
                    <Typography variant="h6">Added Items</Typography>
                    <div>
                        {items.map((item, index) => (
                            <Paper key={index} className="p-3 mb-2 flex items-center justify-between border border-gray-300 rounded-lg">
                                <div>
                                    <Typography>{item.itemName} (Quantity: {item.quantity})</Typography>
                                </div>
                                <IconButton onClick={() => handleRemoveItem(index)} color="secondary">
                                    <DeleteIcon />
                                </IconButton>
                            </Paper>
                        ))}
                    </div>
                </div>
            )}

            {/* Destination Location */}
            <TextField
                label="Destination Location"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                fullWidth
            />

            {/* Submit Button */}
            <Button onClick={handleSubmit} variant="contained" color="success" className="mt-4">
                Submit OutForm Entry
            </Button>

            {/* Add Item Dialog */}
            <Dialog open={openDialog} onClose={handleDialogClose}>
                <DialogTitle>Add Item</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Search Item"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        fullWidth
                        className="mb-2"
                    />

                    {/* Display filtered items based on search */}
                    {filteredItems.length > 0 && (
                        <Paper elevation={3} className="max-h-64 overflow-y-auto mb-4 w-full">
                            {filteredItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleItemSelect(item)} // Select the item
                                    className="p-2 cursor-pointer hover:bg-gray-200 text-center"
                                >
                                    {item}
                                </div>
                            ))}
                        </Paper>
                    )}

                    <TextField
                        label="Quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={handleQuantityChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
                    <Button onClick={handleAddItem} color="primary">Add Item</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
