import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, Box, Grid, Paper, Typography, IconButton, Divider, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Close from '@mui/icons-material/Close';
import service from '../../appwrite/config';
import './PoForm.css'; // Your custom styles

// Input component with MUI InputBase for custom styling
const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id} className="block mb-1">{label}</label>
        <InputBase ref={ref} id={id} {...props} onInput={onInput} className="border rounded p-2 w-full" />
    </div>
));

// VendorList component with filtering
const VendorList = ({ vendors, onSelect }) => (
    <Paper elevation={3} className="max-h-52 overflow-y-auto mb-4">
        {vendors.map((vendor, index) => (
            <Box
                key={index}
                onClick={() => onSelect(vendor.Name)}
                className="p-2 cursor-pointer hover:bg-gray-200 border-b last:border-none"
            >
                {vendor.Name}
            </Box>
        ))}
    </Paper>
);

// ItemList component with filtering and exclusion of selected items
const ItemList = ({ items, selectedItems, onSelect, index }) => {
    const filteredItems = items.filter(item => !selectedItems.includes(item.Item));
    return (
        <Paper elevation={3} className="max-h-52 overflow-y-auto mb-4">
            {filteredItems.map((item, idx) => (
                <Box
                    key={idx}
                    onClick={() => onSelect(index, item.Item)}
                    className="p-2 cursor-pointer hover:bg-gray-200 border-b last:border-none"
                >
                    {item.Item}
                </Box>
            ))}
        </Paper>
    );
};

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

    const selectedItems = fields.map(field => field.name);
    const filteredVendors = allVendors.filter(vendor =>
        vendor.Name.toLowerCase().includes(vendorFilter.toLowerCase())
    );
    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    return (
        <Box className="p-4 po-form space-y-6">
            <Typography variant="h4" className="text-center font-bold">Purchase Order Form</Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <form onSubmit={handleSubmit(submit)} className="space-y-4">
                        <TextField
                            label="Vendor Name"
                            value={watch('VendorName')}
                            disabled
                            fullWidth
                            variant="outlined"
                        />
                        {fields.map((item, index) => (
                            <Box key={item.id} className="flex items-center gap-4">
                                <TextField
                                    label="Item Name"
                                    value={watch(`Items.${index}.name`)}
                                    disabled
                                    fullWidth
                                    variant="outlined"
                                />
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                                    variant="outlined"
                                    className="w-24"
                                />
                                <TextField
                                    label="Rate"
                                    type="number"
                                    {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
                                    variant="outlined"
                                    className="w-24"
                                />
                                <TextField
                                    label="Amount"
                                    value={(watch(`Items.${index}.qty`) || 0) * (watch(`Items.${index}.rate`) || 0)}
                                    disabled
                                    variant="outlined"
                                    className="w-24"
                                />
                                <IconButton onClick={() => remove(index)} color="error">
                                    <Close />
                                </IconButton>
                            </Box>
                        ))}
                        <Button variant="contained" color="primary" onClick={() => append({ name: '', qty: 0, rate: 0 })}>
                            Add Item
                        </Button>
                        <TextField label="Total Amount" value={totalAmount} disabled fullWidth variant="outlined" />
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            {po ? 'Update PO' : 'Submit PO'}
                        </Button>
                    </form>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item xs={12} md={5} className="flex flex-col items-center">
                    <TextField
                        label="Vendor Filter"
                        value={vendorFilter}
                        onChange={(e) => setVendorFilter(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="mb-4"
                    />
                    <VendorList vendors={filteredVendors} onSelect={handleVendorSelect} />
                    <TextField
                        label="Item Filter"
                        value={itemFilter}
                        onChange={(e) => setItemFilter(e.target.value)}
                        fullWidth
                        variant="outlined"
                        className="mb-4"
                    />
                    <ItemList items={filteredItems} selectedItems={selectedItems} onSelect={handleItemSelect} index={0} />
                </Grid>
            </Grid>
        </Box>
    );
}
