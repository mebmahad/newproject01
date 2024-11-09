import React, { useEffect, useState, useRef } from 'react'; 
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, IconButton, Paper, Typography, Divider, Select, MenuItem } from '@mui/material';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import './PoForm.css';

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
            procureId: po?.procureId || '',
            postId: po?.postId || '',
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
    const [itemFilter, setItemFilter] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [lockedItems, setLockedItems] = useState([]);
    const didMountRef = useRef(false);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const procureId = params.get('procureId');
    const postId = params.get('postId');

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
                    return acc + itemAmount;
                }, 0);
                setTotalAmount(calculatedTotal);
                setValue('totalAmount', calculatedTotal);
            });
            return () => subscription.unsubscribe();
        } else {
            didMountRef.current = true;
        }
    }, [watch, setValue]);

    const submit = async (data) => {
        try {
            const totalWithGst = totalAmount * (1 + (watch('gst') || 0) / 100);
            const dataToSave = {
                ...data,
                Items: JSON.stringify(data.Items),
                totalAmount: totalAmount.toFixed(2),
                totalamountwithgst: Math.round(totalWithGst),
                procureId: procureId,
                postId: postId,
            };

            const dbPo = po
                ? await service.updatePo(po.$id, dataToSave)
                : await service.createPo({ ...dataToSave, userId: userData?.$id });

            if (dbPo) {
                // Update status for procureId and postId
                await service.updateProcure(procureId, 'inactive');
                await service.updatePost(postId, 'active');

                navigate(`/pocard/${dbPo.$id}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleItemSelect = (itemName) => {
        const newIndex = fields.length - 1;
        update(newIndex, { ...fields[newIndex], name: itemName });
        setLockedItems((prevLocked) => [...prevLocked, newIndex]);
    };

    const handleAddItem = () => {
        append({ name: '', qty: 0, rate: 0 });
        const calculatedTotal = fields.reduce((acc, item, index) => {
            const itemQty = watch(`Items.${index}.qty`) || 0;
            const itemRate = watch(`Items.${index}.rate`) || 0;
            return acc + (itemQty * itemRate);
        }, 0);
        setTotalAmount(calculatedTotal);
    };

    const handleGstChange = (e) => {
        const gstPercentage = parseFloat(e.target.value) || 0;
        setValue('gst', gstPercentage);
        const totalWithGST = totalAmount * (1 + gstPercentage / 100);
        setValue('totalamountwithgst', totalWithGST);
    };

    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    return (
        <div className="p-4 po-form bg-gray-50 min-h-screen text-sm">
            <Typography variant="h4" className="text-center mb-8">Purchase Order Form</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 shadow-md">
                    <form onSubmit={handleSubmit(submit)} className="space-y-4">
                        <Select
                            label="Vendor Name"
                            value={watch('VendorName')}
                            onChange={(e) => setValue('VendorName', e.target.value, { shouldValidate: true })}
                            fullWidth
                        >
                            {allVendors.map((vendor) => (
                                <MenuItem key={vendor.$id} value={vendor.Name}>
                                    {vendor.Name}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <TextField
                                    label="Item Name"
                                    value={watch(`Items.${index}.name`)}
                                    disabled={lockedItems.includes(index)}
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
                    <Typography variant="h6" className="font-semibold mb-2">Select Item</Typography>
                    <TextField
                        label="Filter Item"
                        value={itemFilter}
                        onChange={(e) => setItemFilter(e.target.value)}
                        fullWidth
                    />
                    <div className="max-h-52 overflow-y-auto">
                        <ItemList items={filteredItems} onSelect={handleItemSelect} />
                    </div>
                </div>
            </div>
        </div>
    );
}
