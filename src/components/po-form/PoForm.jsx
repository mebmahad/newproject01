import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

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
    const [vendorSuggestions, setVendorSuggestions] = useState([]);
    const [itemSuggestions, setItemSuggestions] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [filters, setFilters] = useState({ Item: '', Name: '' });

    // Fetch vendor and item suggestions based on filters
    const fetchSuggestions = useCallback(async () => {
        try {
            const vendorQueries = filters.Name ? [Query.equal("Name", filters.Name)] : [];
            const itemQueries = filters.Item ? [Query.equal("Item", filters.Item)] : [];

            const vendorResponse = await service.getVendors(vendorQueries);
            setVendorSuggestions(vendorResponse.documents || []);

            const itemResponse = await service.getItems(itemQueries);
            setItemSuggestions(itemResponse.documents || []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setVendorSuggestions([]);
            setItemSuggestions([]);
        }
    }, [filters]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    // Debounce function
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const handleVendorInputChange = useCallback(debounce((e) => {
        setFilters((prevFilters) => ({ ...prevFilters, Name: e.target.value }));
    }, 300), []);

    const handleItemInputChange = useCallback((index) => debounce((e) => {
        setFilters((prevFilters) => ({ ...prevFilters, Item: e.target.value }));
        setValue(`Items.${index}.name`, e.target.value);
    }, 300), [setValue]);

    const handleItemSuggestionClick = (index, itemName) => {
        setItemSuggestions([]);
        setValue(`Items.${index}.name`, itemName);
    };

    // Calculate total amount
    useEffect(() => {
        const subscription = watch((value) => {
            const calculatedTotal = value.Items.reduce((acc, item) => acc + (item.qty || 0) * (item.rate || 0), 0);
            setTotalAmount(calculatedTotal);
            setValue('Amount', calculatedTotal);
        });
        return () => subscription.unsubscribe();
    }, [watch, setValue]);

    // Handle form submission
    const submit = async (data) => {
        try {
            const dbPo = po
                ? await service.updatePo(po.$id, data)
                : await service.createPo({ ...data, userId: userData?.$id });
            if (dbPo) navigate(`/po/${dbPo.$id}`);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleAddVendor = () => {
        navigate('/add-vendor');
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4">
            <div className="w-full">
                <Input
                    label="Vendor Name:"
                    id="vendorName"
                    placeholder="Vendor Name"
                    {...register('VendorName', { required: true })}
                    onInput={handleVendorInputChange}
                />
                {vendorSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {vendorSuggestions.map((vendor, index) => (
                            <li
                                key={index}
                                onClick={() => setValue('VendorName', vendor.Name)}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {vendor.Name}
                            </li>
                        ))}
                    </ul>
                )}
                <Button type="button" onClick={handleAddVendor} className="mb-4">
                    Add Vendor
                </Button>

                {fields.map((item, index) => (
                    <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
                        <Input
                            label={`Item ${index + 1}`}
                            id={`item-${index}`}
                            placeholder="Item name"
                            {...register(`Items.${index}.name`, { required: true })}
                            onInput={handleItemInputChange(index)}
                        />
                        {itemSuggestions.length > 0 && (
                            <ul className="absolute bg-white border border-gray-300 w-full z-10">
                                {itemSuggestions.map((item, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleItemSuggestionClick(index, item.Item)}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                    >
                                        {item.Item}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Input
                            label="Quantity"
                            type="number"
                            {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                        />
                        <Input
                            label="Rate"
                            type="number"
                            {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
                        />
                        <Button variant="outlined" color="secondary" onClick={() => remove(index)}>
                            Remove Item
                        </Button>
                    </div>
                ))}
                <Button variant="contained" color="primary" onClick={() => append({ name: '', qty: 0, rate: 0 })}>
                    Add Item
                </Button>

                <TextField label="Total Amount" value={totalAmount} disabled fullWidth className="mb-4" />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    {po ? 'Update PO' : 'Submit PO'}
                </Button>
            </div>
        </form>
    );
}
