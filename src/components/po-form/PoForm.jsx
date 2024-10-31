import React, { useEffect, useState } from 'react';
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
    const [allVendors, setAllVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [vendorFilter, setVendorFilter] = useState('');
    const [itemFilter, setItemFilter] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

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

    const filteredVendors = allVendors.filter(vendor =>
        vendor.Name.toLowerCase().includes(vendorFilter.toLowerCase())
    );

    const filteredItems = allItems.filter(item =>
        item.Item.toLowerCase().includes(itemFilter.toLowerCase())
    );

    const handleVendorSelect = (vendorName) => {
        setValue('VendorName', vendorName, { shouldValidate: true });
    };

    const handleItemSelect = (index, itemName) => {
        setValue(`Items.${index}.name`, itemName, { shouldValidate: true });
    };

    useEffect(() => {
        const subscription = watch((value) => {
            const calculatedTotal = value.Items.reduce((acc, item) => acc + (item.qty || 0) * (item.rate || 0), 0);
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

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4">
            <div className="w-full">
                <TextField
                    label="Vendor Filter"
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    fullWidth
                    className="mb-4"
                />
                <ul className="bg-white border border-gray-300 w-full z-10 mb-4">
                    {filteredVendors.map((vendor, index) => (
                        <li
                            key={index}
                            onClick={() => handleVendorSelect(vendor.Name)}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                        >
                            {vendor.Name}
                        </li>
                    ))}
                </ul>

                {fields.map((item, index) => (
                    <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
                        <TextField
                            label="Item Filter"
                            value={itemFilter}
                            onChange={(e) => setItemFilter(e.target.value)}
                            fullWidth
                            className="mb-4"
                        />
                        <ul className="bg-white border border-gray-300 w-full z-10 mb-4">
                            {filteredItems.map((itemObj, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => handleItemSelect(index, itemObj.Item)}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                >
                                    {itemObj.Item}
                                </li>
                            ))}
                        </ul>

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
