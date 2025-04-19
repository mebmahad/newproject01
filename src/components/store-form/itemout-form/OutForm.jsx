import React, { useState, useEffect } from 'react';
import {
    TextField,
    Paper,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import {Button, Container} from '../../../components';
import { Delete as DeleteIcon } from '@mui/icons-material';
import InOutservice from '../../../appwrite/storeEntriesConfig';
import { useNavigate } from "react-router-dom";

export default function OutForm() {
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newItem, setNewItem] = useState({ itemName: '', qtyChange: 0 });
    const [items, setItems] = useState([]);
    const [destinationLocation, setDestinationLocation] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    // Fetch all items on component load
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const fetchedItems = await service.getItems();
                console.log('Fetched Items:', fetchedItems);  // Debugging the fetched data
                if (Array.isArray(fetchedItems?.documents)) {
                    const itemList = fetchedItems.documents.map((item) => item.Item);
                    setAllItems(itemList);
                    setFilteredItems(itemList);  // Show all items initially
                } else {
                    console.error('Items are not in the expected format');
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);

    // Handle search term change
    const handleSearchChange = (e) => {
        const searchValue = e.target.value.trim().toLowerCase();  // Make it case-insensitive
        setSearchTerm(searchValue);

        if (searchValue === '') {
            setFilteredItems(allItems);  // If search is cleared, show all items
        } else {
            // Filter items based on the search term
            const results = allItems.filter((item) =>
                item.toLowerCase().includes(searchValue)  // Case-insensitive match
            );
            setFilteredItems(results);
        }
    };

    // Handle item selection from search
    const handleItemSelect = (selectedItem) => {
        setNewItem({ ...newItem, itemName: selectedItem });
        setFilteredItems([]);  // Clear search results after selection
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        setNewItem({ ...newItem, qtyChange: parseInt(e.target.value, 10) || 0 });
    };

    // Add selected item to the list
    const handleAddItem = () => {
        if (newItem.itemName && newItem.qtyChange > 0) {
            setItems([...items, newItem]);
            setNewItem({ itemName: '', qtyChange: 0 });
        } else {
            alert('Please select an item and specify the quantity.');
        }
    };

    // Remove item from the list
    const handleRemoveItem = (index) => {
        const updatedItems = items.filter((_, idx) => idx !== index);
        setItems(updatedItems);
    };

    // Submit the form
    const handleSubmit = async () => {
        try {
            const entryId = `out-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const timestamp = new Date().toISOString();
            const itemListString = JSON.stringify(items);

            await InOutservice.createOutForm({
                Items: itemListString,
                securelocation: destinationLocation,
                timestamp,
                id: entryId,
            });

            await Promise.all(
                items.map(async ({ itemName, qtyChange }) => {
                    try {
                        await service.updateItemQuantity(itemName, -qtyChange);
                    } catch (error) {
                        console.error(`Failed to update quantity for item: ${itemName}`, error);
                    }
                })
            );

            setItems([]);
            setDestinationLocation('');
        } catch (error) {
            console.error('Error submitting OutForm or updating items:', error);
        }
    };

    // Open and close the dialog for adding an item
    const handleDialogOpen = () => setOpenDialog(true);
    const handleDialogClose = () => setOpenDialog(false);

    return (
        <Container>
            <Button onClick={() => navigate('/store')} className="mb-4">
                ← Back to Store
            </Button>
        <div className="p-4 bg-gray-50 min-h-screen">
            <Typography variant="h5" className="mb-4">
                OutForm Entry
            </Typography>

            <Button onClick={handleDialogOpen} variant="outlined" color="primary" className="mb-4">
                Add Item
            </Button>

            {items.length > 0 && (
                <div className="mb-4">
                    <Typography variant="h6">Added Items</Typography>
                    {items.map((item, index) => (
                        <Paper
                            key={index}
                            className="p-3 mb-2 flex items-center justify-between border border-gray-300 rounded-lg"
                        >
                            <Typography>
                                {item.itemName} (Quantity: {item.qtyChange})
                            </Typography>
                            <IconButton onClick={() => handleRemoveItem(index)} color="secondary">
                                <DeleteIcon />
                            </IconButton>
                        </Paper>
                    ))}
                </div>
            )}

            <TextField
                label="Destination Location"
                value={destinationLocation}
                onChange={(e) => setDestinationLocation(e.target.value)}
                fullWidth
            />

            <Button onClick={handleSubmit} variant="contained" color="success" className="mt-4">
                Submit OutForm Entry
            </Button>

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

                    {/* Display search results */}
                    {filteredItems.length > 0 && (
                        <Paper elevation={3} className="max-h-64 overflow-y-auto mb-4 w-full">
                            {filteredItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleItemSelect(item)}
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
                        value={newItem.qtyChange}
                        onChange={handleQuantityChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddItem} color="primary">
                        Add Item
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
</Container>
    );
}
