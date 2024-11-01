import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, Box, Grid, Paper, Typography, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import './PoForm.css'; // Import CSS for additional styling

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="input-group">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="input-field" />
    </div>
));

const VendorList = ({ vendors, onSelect }) => (
    <Paper elevation={2} className="list-container">
        {vendors.map((vendor, index) => (
            <Box key={index} onClick={() => onSelect(vendor.Name)} className="list-item">
                {vendor.Name}
            </Box>
        ))}
    </Paper>
);

const ItemList = ({ items, onSelect, index }) => (
    <Paper elevation={2} className="list-container">
        {items.map((item, idx) => (
            <Box key={idx} onClick={() => onSelect(index, item.Item)} className="list-item">
                {item.Item}
            </Box>
        ))}
    </Paper>
);

export default function PoForm({ po }) {
    const { register, handleSubmit, control, setValue, watch } = useForm({
        defaultValues: {
            VendorName: po?.VendorName || '',
            Items: po?.Items || [{ name: '', qty: 0, rate: 0 }],
            Amount: po?.Amount || '',
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
                const calculatedTotal = value.Items.reduce((acc, item) => acc + (item.qty || 0) * (item.rate || 0), 0);
                setTotalAmount(calculatedTotal);
                setValue('Amount', calculatedTotal);
            });
            return () => subscription.unsubscribe();
        } else {
            didMountRef.current = true;
        }
    }, [watch, setValue]);

    const submit = async (data) => {
        try {
            const dbPo = po
                ? await service.updatePo(po.$id, data)
                : await service.createPo({ ...data, userId: userData?.$id });
            if (dbPo) navigate(`/po/${dbPo.$id}`);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleVendorSelect = (vendorName) => {
        setValue('VendorName', vendorName, { shouldValidate: true });
    };

    const handleItemSelect = (index, itemName) => {
        update(index, { ...fields[index], name: itemName });
    };

    const filteredVendors = allVendors.filter(vendor =>
        vendor.Name.toLowerCase().includes(vendorFilter.toLowerCase())
    );

    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    return (
        <Box className="po-form-container">
            <Typography variant="h4" gutterBottom>Purchase Order Form</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSubmit(submit)} className="po-form">
                        <TextField
                            label="Vendor Name"
                            value={watch('VendorName')}
                            disabled
                            fullWidth
                            className="mb-3"
                        />
                        {fields.map((item, index) => (
                            <Box key={item.id} className="item-row">
                                <TextField
                                    label="Item Name"
                                    value={watch(`Items.${index}.name`)}
                                    disabled
                                    fullWidth
                                />
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                                    fullWidth
                                />
                                <TextField
                                    label="Rate"
                                    type="number"
                                    {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
                                    fullWidth
                                />
                                <TextField
                                    label="Amount"
                                    value={(watch(`Items.${index}.qty`) || 0) * (watch(`Items.${index}.rate`) || 0)}
                                    disabled
                                    fullWidth
                                />
                                <IconButton onClick={() => remove(index)}>
                                    <Close />
                                </IconButton>
                            </Box>
                        ))}
                        <Button variant="contained" color="primary" onClick={() => append({ name: '', qty: 0, rate: 0 })}>
                            Add Item
                        </Button>
                        <TextField label="Total Amount" value={totalAmount} disabled fullWidth className="mt-3" />
                        <Button type="submit" variant="contained" color="primary" fullWidth className="mt-3">
                            {po ? 'Update PO' : 'Submit PO'}
                        </Button>
                    </form>
                </Grid>

                <Grid item xs={12} md={5} className="list-side-panel">
                    <TextField
                        label="Vendor Filter"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        fullWidth
                        className="filter-input"
                    />
                    <VendorList vendors={filteredVendors} onSelect={handleVendorSelect} />
                    <Divider className="divider" />
                    <TextField
                        label="Item Filter"
                        value={itemFilter}
                        onChange={(e) => setItemFilter(e.target.value)}
                        fullWidth
                        className="filter-input"
                    />
                    <ItemList items={filteredItems} onSelect={handleItemSelect} index={0} />
                </Grid>
            </Grid>
        </Box>
    );
}
