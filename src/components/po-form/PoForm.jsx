import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Input = React.forwardRef(({ label, id, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} className="border p-2 w-full" />
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'Items',
    });

    const [vendorList, setVendorList] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [filteredVendors, setFilteredVendors] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await service.getVendors();
                setVendorList(response.documents);
                setFilteredVendors(response.documents);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        };

        const fetchItems = async () => {
            try {
                const response = await service.getItems();
                setItemList(response.documents);
                setFilteredItems(response.documents);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchVendors();
        fetchItems();
    }, []);

    const handleVendorFilterChange = (e) => {
        const inputValue = e.target.value.toLowerCase();
        setFilteredVendors(vendorList.filter(vendor => vendor.Name.toLowerCase().includes(inputValue)));
        setValue('VendorName', inputValue);
    };

    const handleItemFilterChange = (index, e) => {
        const inputValue = e.target.value.toLowerCase();
        setFilteredItems(itemList.filter(item => item.Item.toLowerCase().includes(inputValue)));
        setValue(`Items.${index}.name`, inputValue);
    };

    const handleVendorSelect = (vendor) => {
        setValue('VendorName', vendor.Name);
        setFilteredVendors([]); // Clear suggestions
    };

    const handleItemSelect = (index, item) => {
        setValue(`Items.${index}.name`, item.Item);
        setFilteredItems([]); // Clear suggestions
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
                <Input
                    label="Vendor Name:"
                    id="vendorName"
                    placeholder="Vendor Name"
                    {...register('VendorName', { required: true })}
                    onChange={handleVendorFilterChange}
                />
                <div className="vendor-suggestions">
                    {filteredVendors.map((vendor, index) => (
                        <div key={index} onClick={() => handleVendorSelect(vendor)} className="p-2 hover:bg-gray-200 cursor-pointer">
                            {vendor.Name}
                        </div>
                    ))}
                </div>

                {fields.map((item, index) => (
                    <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
                        <Input
                            label={`Item ${index + 1}`}
                            id={`item-${index}`}
                            placeholder="Item name"
                            {...register(`Items.${index}.name`, { required: true })}
                            onChange={(e) => handleItemFilterChange(index, e)}
                        />
                        <div className="item-suggestions">
                            {filteredItems.map((item, idx) => (
                                <div key={idx} onClick={() => handleItemSelect(index, item)} className="p-2 hover:bg-gray-200 cursor-pointer">
                                    {item.Item}
                                </div>
                            ))}
                        </div>
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
