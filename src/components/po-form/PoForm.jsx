import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, IconButton, Typography } from '@mui/material';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function PoForm({ po }) {
    const { register, handleSubmit, control, setValue, watch } = useForm({
        defaultValues: {
            VendorName: po?.VendorName || '',
            procureId: po?.procureId || '',
            postId: po?.postId || '',
            Items: po?.Items || [], // No default empty item
            totalAmount: po?.totalAmount || 0,
            totalamountwithgst: po?.totalamountwithgst || 0,
            gst: po?.gst || 0,
            pono: po?.pono || '',
            id: po?.$id || `po-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'Items' });
    const [allVendors, setAllVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [itemFilter, setItemFilter] = useState('');
    const [totalAmountWithoutGST, setTotalAmountWithoutGST] = useState(0);
    const [totalAmountWithGST, setTotalAmountWithGST] = useState(0);
    const [openItemPopup, setOpenItemPopup] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemQty, setItemQty] = useState(0);
    const [itemRate, setItemRate] = useState(0);

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
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

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const handleAddItem = () => {
        if (selectedItem && itemQty > 0 && itemRate > 0) {
            const newItem = {
                name: selectedItem.Item,
                qty: Number(itemQty),
                rate: Number(itemRate),
                amount: Number(itemQty) * Number(itemRate),
            };

            append(newItem);

            // Update totals
            const newTotalWithoutGST = [...fields, newItem].reduce(
                (total, item) => total + item.amount,
                0
            );
            setTotalAmountWithoutGST(newTotalWithoutGST);

            const gstPercentage = watch('gst') || 0;
            const newTotalWithGST = newTotalWithoutGST * (1 + gstPercentage / 100);
            setTotalAmountWithGST(newTotalWithGST);

            // Reset fields and close popup
            setItemQty(0);
            setItemRate(0);
            setSelectedItem(null);
            setOpenItemPopup(false);
        }
    };

    const handleGstChange = (e) => {
        const gstPercentage = parseInt(e.target.value, 10) || 0;
        setValue('gst', gstPercentage);

        const newTotalWithGST = totalAmountWithoutGST * (1 + gstPercentage / 100);
        setTotalAmountWithGST(newTotalWithGST);
    };

    const submit = async (data) => {
        try {
            const gstValue = parseInt(watch('gst'), 10) || 0;
            const totalWithGst = totalAmountWithoutGST * (1 + gstValue / 100);
            const dataToSave = {
                ...data,
                Items: JSON.stringify(data.Items),
                totalAmount: totalAmountWithoutGST.toFixed(2),
                totalamountwithgst: parseInt(totalAmountWithGST.toFixed(2)),
                procureId: procureId,
                postId: postId,
                gst: gstValue,
            };
    
            // Update the PO
            const dbPo = po
                ? await service.updatePo(po.$id, dataToSave)
                : await service.createPo({ ...dataToSave, userId: userData?.$id });
    
            // Update statuses if IDs are present
            if (procureId) {
                await service.updateProcure(procureId, { status: 'podone' });
            }
            if (postId) {
                await service.updatePost(postId, { status: 'active' });
            }
    
            if (dbPo) {
                navigate(`/po/${dbPo.$id}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(submit)}>
                <div className="mb-4">
                    <Typography variant="h6">PO Number</Typography>
                    <TextField
                        label="PO Number"
                        {...register('pono')}
                        fullWidth
                    />
                </div>

                <div className="mb-4">
                    <Typography variant="h6">Vendor</Typography>
                    <TextField
                        select
                        label="Vendor"
                        {...register('VendorName')}
                        fullWidth
                        value={watch('VendorName') || ''}
                        SelectProps={{
                            native: true,
                        }}
                    >
                        <option value="" disabled>Select a Vendor</option>
                        {allVendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.Name}>
                                {vendor.Name}
                            </option>
                        ))}
                    </TextField>
                </div>

                <div className="mb-4">
                    <Typography variant="h6">Items</Typography>
                    {fields.length === 0 && (
                        <Typography className="text-center text-gray-500">
                            No items added yet. Use "Add Item List" to include items.
                        </Typography>
                    )}
                    {fields.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-4 gap-2 items-center mb-2">
                            <input
                                className="p-2 border rounded"
                                {...register(`Items[${index}].name`)}
                                placeholder="Item"
                                readOnly
                            />
                            <TextField
                                {...register(`Items[${index}].qty`)}
                                placeholder="Qty"
                                type="number"
                                className="p-2 border rounded"
                            />
                            <TextField
                                {...register(`Items[${index}].rate`)}
                                placeholder="Rate"
                                type="number"
                                className="p-2 border rounded"
                            />
                            <Typography className="text-center">
                                {(item.qty * item.rate).toFixed(2)}
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => remove(index)}
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpenItemPopup(true)}
                    >
                        Add Item List
                    </Button>
                </div>

                <Typography variant="h6">
                    Total Amount Without GST: {totalAmountWithoutGST.toFixed(2) || "0.00"}
                </Typography>

                <div className="mb-4">
                    <Typography variant="h6">GST (%)</Typography>
                    <TextField
                        {...register('gst')}
                        type="number"
                        fullWidth
                        onChange={handleGstChange}
                    />
                </div>

                <Typography variant="h6">
                    Total Amount With GST: {totalAmountWithGST.toFixed(2) || "0.00"}
                </Typography>

                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Save PO
                </Button>
            </form>

            {openItemPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-96 relative">
                        <input
                            type="text"
                            placeholder="Search item..."
                            value={itemFilter}
                            onChange={(e) => setItemFilter(e.target.value)}
                            className="w-full p-2 border rounded mb-2"
                        />
                        {allItems
                            .filter((item) => item.Item.toLowerCase().includes(itemFilter.toLowerCase()))
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="cursor-pointer p-2 border-b"
                                    onClick={() => handleItemSelect(item)}
                                >
                                    {item.Item}
                                </div>
                            ))}
                        {selectedItem && (
                            <div className="mt-4">
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={itemQty}
                                    onChange={(e) => setItemQty(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Rate"
                                    type="number"
                                    value={itemRate}
                                    onChange={(e) => setItemRate(e.target.value)}
                                    fullWidth
                                    className="mt-2"
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    className="mt-2"
                                    onClick={handleAddItem}
                                >
                                    Add Item
                                </Button>
                            </div>
                        )}
                        <IconButton
                            onClick={() => setOpenItemPopup(false)}
                            className="absolute top-2 right-2"
                        >
                            <Close />
                        </IconButton>
                    </div>
                </div>
            )}
        </div>
    );
}
