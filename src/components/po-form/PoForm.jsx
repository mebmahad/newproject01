import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, IconButton, Paper, Typography, Divider, Select, MenuItem } from '@mui/material';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import './PoForm.css';
import { parseInt } from 'lodash';

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
            pono: po?.pono || '',
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
        if (po && typeof po === 'string') {
            const fetchPo = async () => {
                try {
                    console.log("po data provided to form:", po);
                    const poData = await service.getPo(po);  // Assume `po` here is the PO ID
                    if (poData) {
                        setValue("VendorName", poData.VendorName || '');
                        setValue("procureId", poData.procureId || '');
                        setValue("postId", poData.postId || '');
                        setValue("Items", poData.Items ? JSON.parse(poData.Items) : [{ name: '', qty: 0, rate: 0 }]);
                        setValue("totalAmount", poData.totalAmount || 0);
                        setValue("gst", poData.gst || 0);
                        setValue("totalamountwithgst", poData.totalamountwithgst || 0);
                        setValue("pono", poData.pono || '');
                        setValue("id", poData.$id || `po-${Date.now()}-${Math.floor(Math.random() * 10000)}`);

                        setTotalAmount(poData.totalAmount || 0);
                    }
                } catch (error) {
                    console.error("Error fetching PO:", error);
                }
            };
            fetchPo();
        } else if (po && typeof po === 'object') {
            Object.keys(po).forEach(key => setValue(key, po[key]));
            setTotalAmount(po.totalAmount || 0);
        }
    }, [po, setValue]);

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
            // Ensure gst is an integer before using it
            const gstValue = parseInt(watch('gst'), 10) || 0;
    
            const totalWithGst = totalAmount * (1 + gstValue / 100);
            const dataToSave = {
                ...data,
                Items: JSON.stringify(data.Items),
                totalAmount: totalAmount.toFixed(2),
                totalamountwithgst: Math.round(totalWithGst),
                procureId: procureId,
                postId: postId,
                gst: gstValue,  // Ensure gst is an integer here
            };
    
            const dbPo = po
                ? await service.updatePo(po.$id, dataToSave)
                : await service.createPo({ ...dataToSave, userId: userData?.$id });
    
            if (dbPo) {
                // Update the budgets
                await updateBudgets(dbPo.totalAmount, dbPo.gst);
    
                // Update status for procureId and postId
                const updatedPost = await service.updatePost(postId, {
                    status: "active" // Update the status to "In Procure"
                });
                const updatedProcure = await service.updateProcure(procureId, {
                    status: "podone" // Update the status to "In Procure"
                });
    
                navigate(`/po/${dbPo.$id}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const updateBudgets = async (poTotalAmount, gstPercentage) => {
        try {
            // Calculate total with GST
            const totalWithGst = poTotalAmount * (1 + gstPercentage / 100);

            // Fetch the current year's budget
            const currentYear = string(new Date().getFullYear());
            const budget = await service.getBudget(currentYear);

            if (budget) {
                const yearlyBudget = budget.yearlyBudget;
                const monthsPassed = new Date().getMonth() + 1; // Current month (1-based)
                const monthlyBudget = yearlyBudget / 12; // Default to 12 months

                // Adjust for the number of months in the current year
                if (monthsPassed < 12) {
                    // Adjust the monthly budget if fewer months have passed
                    const adjustedMonthlyBudget = yearlyBudget / monthsPassed;

                    // Subtract from the yearly and monthly budgets
                    await service.updateBudget(currentYear, {
                        yearlyBudget: yearlyBudget - totalWithGst,
                        monthlyBudget: adjustedMonthlyBudget - totalWithGst,
                    });
                } else {
                    // Subtract from the full yearly budget
                    await service.updateBudget(currentYear, {
                        yearlyBudget: yearlyBudget - totalWithGst,
                    });
                }
            }
        } catch (error) {
            console.error('Error updating budgets:', error);
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
        const gstPercentage = parseInt(e.target.value, 10); // Use base 10 for integer parsing
        const validGstPercentage = isNaN(gstPercentage) ? 0 : gstPercentage; // Fallback to 0 if invalid
        setValue('gst', validGstPercentage);
    
        const totalWithGST = totalAmount * (1 + validGstPercentage / 100);
        setValue('totalamountwithgst', totalWithGST);
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit(submit)}>
                <div className="mb-4">
                    <Typography variant="h6">Vendor</Typography>
                    <Select
                        label="Vendor"
                        {...register('VendorName')}
                        fullWidth
                    >
                        {allVendors.map((vendor) => (
                            <MenuItem key={vendor.id} value={vendor.Name}>
                                {vendor.Name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>

                {/* Items Section */}
                <div className="mb-4">
                    <Typography variant="h6">Items</Typography>
                    {fields.map((item, index) => (
                        <div key={item.id} className="mb-2 flex">
                            <input
                                className="mr-2 p-2 border rounded"
                                {...register(`Items[${index}].name`)}
                                placeholder="Item"
                                list="itemList"
                            />
                            <TextField
                                {...register(`Items[${index}].qty`)}
                                type="number"
                                placeholder="Quantity"
                                fullWidth
                                className="mr-2"
                            />
                            <TextField
                                {...register(`Items[${index}].rate`)}
                                type="number"
                                placeholder="Rate"
                                fullWidth
                                className="mr-2"
                            />
                            <IconButton
                                onClick={() => remove(index)}
                                className="self-center"
                            >
                                <Close />
                            </IconButton>
                        </div>
                    ))}
                    <ItemList items={allItems} onSelect={handleItemSelect} />
                    <Button onClick={handleAddItem}>Add Item</Button>
                </div>

                {/* GST & Total Calculation */}
                <div className="mb-4">
                    <TextField
                        {...register('gst')}
                        label="GST Percentage"
                        type="number"
                        onChange={handleGstChange}
                        fullWidth
                    />
                    <div className="mt-2">
                        <Typography variant="body1">
                            Total Amount: {totalAmount}
                        </Typography>
                        <Typography variant="body1">
                            Total Amount with GST: {watch('totalamountwithgst')}
                        </Typography>
                    </div>
                </div>

                {/* Submit Button */}
                <Button variant="contained" color="primary" type="submit">
                    Submit Purchase Order
                </Button>
            </form>
        </div>
    );
}
