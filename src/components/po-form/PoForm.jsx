import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import _ from 'lodash';

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
    const [filters, setFilters] = useState({ vendor: "", item: "" });

    // Debounced fetch functions to limit calls
    const debouncedFetchVendorSuggestions = useCallback(
        _.debounce(async (input) => {
            try {
                const results = await service.searchVendor(input);
                setVendorSuggestions(results.documents.map((vendor) => vendor.Name));
            } catch (error) {
                console.error("Error fetching vendor suggestions:", error);
                setVendorSuggestions([]);
            }
        }, 300),
        []
    );

    const debouncedFetchItemSuggestions = useCallback(
        _.debounce(async (input) => {
            try {
                const results = await service.searchItems(input);
                setItemSuggestions(results.documents.map((item) => item.Item));
            } catch (error) {
                console.error("Error fetching item suggestions:", error);
                setItemSuggestions([]);
            }
        }, 300),
        []
    );

    // Handle Vendor and Item input changes with debounce
    const handleVendorInputChange = (e) => {
        const inputValue = e.currentTarget.value;
        setFilters((prevFilters) => ({ ...prevFilters, vendor: inputValue }));
        setValue('VendorName', inputValue, { shouldValidate: true });
        debouncedFetchVendorSuggestions(inputValue);
    };

    const handleItemInputChange = (index, e) => {
        const inputValue = e.currentTarget.value;
        setFilters((prevFilters) => ({ ...prevFilters, item: inputValue }));
        setValue(`Items.${index}.name`, inputValue, { shouldValidate: true });
        debouncedFetchItemSuggestions(inputValue);
    };

    useEffect(() => {
        const subscription = watch((value) => {
            const calculatedTotal = value.Items.reduce(
                (acc, item) => acc + (item.qty || 0) * (item.rate || 0),
                0
            );
            setTotalAmount(calculatedTotal);
            setValue('Amount', calculatedTotal);
        });
        return () => subscription.unsubscribe();
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

    const handleAddVendor = () => {
        navigate('/add-vendor');
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4">
            <div className="w-full">
                {/* Vendor Section */}
                <TextField
                    label="Vendor Name"
                    value={filters.vendor}
                    onChange={handleVendorInputChange}
                    placeholder="Type to search vendors"
                    fullWidth
                />
                <Button type="button" onClick={handleAddVendor} className="mb-4">
                    Add Vendor
                </Button>
                {vendorSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {vendorSuggestions.map((vendor, index) => (
                            <li
                                key={index}
                                onClick={() => setValue('VendorName', vendor, { shouldValidate: true })}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {vendor}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Items Section */}
                {fields.map((item, index) => (
                    <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
                        <TextField
                            label={`Item ${index + 1}`}
                            placeholder="Type to search items"
                            fullWidth
                            onChange={(e) => handleItemInputChange(index, e)}
                        />
                        {itemSuggestions.length > 0 && (
                            <ul className="absolute bg-white border border-gray-300 w-full z-10">
                                {itemSuggestions.map((itemName, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => setValue(`Items.${index}.name`, itemName, { shouldValidate: true })}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                    >
                                        {itemName}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <TextField
                            label="Quantity"
                            type="number"
                            fullWidth
                            {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
                        />
                        <TextField
                            label="Rate"
                            type="number"
                            fullWidth
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
