import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, IconButton, Paper, Typography, Divider } from '@mui/material';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './PoForm.css';

const VendorList = ({ vendors, onSelect }) => (
    <Paper elevation={3} className="max-h-52 overflow-y-auto mb-4 w-full">
        {vendors.map((vendor, index) => (
            <div
                key={index}
                onClick={() => onSelect(vendor.Name)}
                className="p-2 cursor-pointer hover:bg-gray-200 text-center"
            >
                {vendor.Name}
            </div>
        ))}
    </Paper>
);

const ItemList = ({ items, onSelect }) => (
    <Paper elevation={3} className="max-h-52 overflow-y-auto mb-4 w-full">
        {items.map((item, idx) => (
            <div
                key={idx}
                onClick={() => onSelect(item.Item)}
                className="p-2 cursor-pointer hover:bg-gray-200 text-center"
            >
                {item.Item}
            </div>
        ))}
    </Paper>
);

export default function PoForm({ po }) {
    const { register, handleSubmit, control, setValue, watch } = useForm({
        defaultValues: {
            VendorName: po?.VendorName || '',
            Items: po?.Items || [{ name: '', qty: 0, rate: 0 }],
            totalAmount: po?.totalAmount || 0,
            gst: 0,
            totalamountwithgst: 0,
            id: po?.$id || `po-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        },
    });

    const { fields, append, remove, update } = useFieldArray({ control, name: 'Items' });
    const [allVendors, setAllVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [vendorFilter, setVendorFilter] = useState('');
    const [itemFilter, setItemFilter] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [lockedItems, setLockedItems] = useState([]);
    const didMountRef = useRef(false);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await service.getVendors();
                setAllVendors(response.documents);
            } catch (error) {
                console.error("Error fetching vendors:", error);
                setAllVendors([]);
            }
        };

        const fetchItems = async () => {
            try {
                const response = await service.getItems();
                setAllItems(response.documents);
            } catch (error) {
                console.error("Error fetching items:", error);
                setAllItems([]);
            }
        };

        fetchVendors();
        fetchItems();
    }, []);

    useEffect(() => {
        if (didMountRef.current) {
            const subscription = watch((value) => {
                const calculatedTotal = value.Items.reduce((acc, item) => {
                    const itemAmount = (item.qty || 0) * (item.rate || 0);
                    return acc + itemAmount; // Sum amounts of items
                }, 0);
                setTotalAmount(calculatedTotal);
                setValue('totalAmount', calculatedTotal); // Save the total amount in form state
                console.log('Calculated Total Amount:', calculatedTotal);
            });
            return () => subscription.unsubscribe();
        } else {
            didMountRef.current = true;
        }
    }, [watch, setValue]);

    const submit = async (data) => {
        try {
            const totalWithGst = totalAmount * (1 + (watch('gst') || 0) / 100); // Calculate total with GST
            console.log('Total Amount:', totalAmount);
            console.log('GST:', watch('gst'));
            console.log('Total Amount with GST:', totalWithGst);

            const dataToSave = {
                ...data,
                Items: JSON.stringify(data.Items),
                totalAmount: totalAmount.toFixed(2), // Save as string for Appwrite
                totalamountwithgst: Math.round(totalWithGst), // Save as integer for Appwrite
            };

            const dbPo = po
                ? await service.updatePo(po.$id, dataToSave)
                : await service.createPo({ ...dataToSave, userId: userData?.$id });

            if (dbPo) navigate(`/pocard/${dbPo.$id}`);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleVendorSelect = (vendorName) => {
        setValue('VendorName', vendorName, { shouldValidate: true });
    };

    const handleItemSelect = (itemName) => {
        const newIndex = fields.length - 1; // Get the index of the last added item
        update(newIndex, { ...fields[newIndex], name: itemName });
        setLockedItems((prevLocked) => [...prevLocked, newIndex]); // Lock the item input after selection
    };

    const handleAddItem = () => {
        append({ name: '', qty: 0, rate: 0 });
        // Recalculate total amount after adding a new item
        const calculatedTotal = fields.reduce((acc, item, index) => {
            const itemQty = watch(`Items.${index}.qty`) || 0;
            const itemRate = watch(`Items.${index}.rate`) || 0;
            return acc + (itemQty * itemRate);
        }, 0);
        setTotalAmount(calculatedTotal);
    };

    const handleGstChange = (e) => {
        const gstPercentage = parseFloat(e.target.value) || 0; // Get the GST value
        setValue('gst', gstPercentage); // Update GST in the form state
        const totalWithGST = totalAmount * (1 + gstPercentage / 100); // Calculate Total with GST
        setValue('totalamountwithgst', totalWithGST); // Update TotalWithGST in the form state
        console.log('GST Percentage:', gstPercentage);
        console.log('Total with GST:', totalWithGST);
    };

    const filteredVendors = allVendors.filter(vendor =>
        vendor.Name.toLowerCase().includes(vendorFilter.toLowerCase())
    );

    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    return (
        <div className="p-4 po-form bg-gray-50 min-h-screen">
            <Typography variant="h4" className="text-center mb-8">Purchase Order Form</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-md">
                    <form onSubmit={handleSubmit(submit)} className="space-y-4">
                        <TextField
                            label="Vendor Name"
                            value={watch('VendorName')}
                            disabled
                            fullWidth
                        />
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <TextField
                                    label="Item Name"
                                    value={watch(`Items.${index}.name`)}
                                    disabled={lockedItems.includes(index)} // Disable if the item is locked
                                    fullWidth
                                />
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                                    className="w-1/4"
                                />
                                <TextField
                                    label="Rate"
                                    type="number"
                                    {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
                                    className="w-1/4"
                                />
                                <TextField
                                    label="Amount"
                                    value={(watch(`Items.${index}.qty`) || 0) * (watch(`Items.${index}.rate`) || 0)}
                                    disabled
                                    className="w-1/4"
                                />
                                <IconButton onClick={() => remove(index)} className="ml-2">
                                    <Close />
                                </IconButton>
                            </div>
                        ))}
                        <Button type="button" onClick={handleAddItem} variant="contained">
                            Add Item
                        </Button>
                        <Divider className="my-4" />
                        <TextField
                            label="GST/Tax (%)"
                            type="number"
                            onChange={handleGstChange}
                            fullWidth
                        />
                        <TextField
                            label="Total Amount"
                            value={totalAmount.toFixed(2) || '0.00'}
                            disabled
                            fullWidth
                        />
                        <TextField
                            label="Total with GST/Tax"
                            value={watch('totalamountwithgst').toFixed(2) || '0.00'}
                            disabled
                            fullWidth
                        />
                        <Button type="submit" variant="contained" color="success" className="w-full mt-6">
                            {po ? 'Update PO' : 'Create PO'}
                        </Button>
                    </form>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                    <Typography variant="h6" className="font-semibold mb-2">Select Vendor</Typography>
                    <TextField
                        label="Filter Vendor"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        fullWidth
                    />
                    <VendorList vendors={filteredVendors} onSelect={handleVendorSelect} />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                    <Typography variant="h6" className="font-semibold mb-2">Select Item</Typography>
                    <TextField
                        label="Filter Item"
                        value={itemFilter}
                        onChange={(e) => setItemFilter(e.target.value)}
                        fullWidth
                    />
                    <ItemList items={filteredItems} onSelect={handleItemSelect} />
                </div>
            </div>
        </div>
    );
}
