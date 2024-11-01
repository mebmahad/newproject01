import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CloseIcon from '@mui/icons-material/Close';

// Input component
const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

// VendorList component
const VendorList = ({ vendors, onSelect }) => (
    <Paper elevation={3} style={{ maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
        {vendors.map((vendor, index) => (
            <Box key={index} onClick={() => onSelect(vendor.Name)} sx={{ padding: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                {vendor.Name}
            </Box>
        ))}
    </Paper>
);

// ItemList component
const ItemList = ({ items, onSelect, index }) => (
    <Paper elevation={3} style={{ maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
        {items.map((item, idx) => (
            <Box key={idx} onClick={() => onSelect(index, item.Item)} sx={{ padding: 1, cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
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

    const { fields, append, remove } = useFieldArray({ control, name: 'Items' });
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
        setValue(`Items.${index}.name`, itemName, { shouldValidate: true });
    };

    const filteredVendors = allVendors.filter(vendor =>
        vendor.Name.toLowerCase().includes(vendorFilter.toLowerCase())
    );

    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    return (
        <Box sx={{ padding: '1rem' }}>
            <Typography variant="h4" gutterBottom>Purchase Order Form</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSubmit(submit)}>
                        <TextField
                            label="Vendor Name"
                            value={watch('VendorName')}
                            disabled
                            fullWidth
                            className="mb-4"
                        />
                        {fields.map((item, index) => (
                            <Box key={item.id} display="flex" alignItems="center" className="mb-4">
                                <Box flexGrow={1}>
                                    <TextField
                                        label="Item Name"
                                        value={item.name}
                                        disabled
                                        fullWidth
                                    />
                                </Box>
                                <Box ml={2}>
                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                                        fullWidth
                                    />
                                </Box>
                                <Box ml={2}>
                                    <TextField
                                        label="Rate"
                                        type="number"
                                        {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
                                        fullWidth
                                    />
                                </Box>
                                <Box ml={2}>
                                    <IconButton onClick={() => remove(index)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                        <Button variant="contained" color="primary" onClick={() => append({ name: '', qty: 0, rate: 0 })}>
                            Add Item
                        </Button>
                        <TextField label="Total Amount" value={totalAmount} disabled fullWidth className="mb-4" />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {po ? 'Update PO' : 'Submit PO'}
                        </Button>
                    </form>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        label="Vendor Filter"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        fullWidth
                    />
                    <VendorList vendors={filteredVendors} onSelect={handleVendorSelect} />
                    <TextField
                        label="Item Filter"
                        value={itemFilter}
                        onChange={(e) => setItemFilter(e.target.value)}
                        fullWidth
                    />
                    <ItemList items={filteredItems} onSelect={handleItemSelect} index={0} />
                </Grid>
            </Grid>
        </Box>
    );
}
