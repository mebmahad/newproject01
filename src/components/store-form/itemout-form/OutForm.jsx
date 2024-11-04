import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, TextField, Typography } from '@mui/material';
import service from '../../appwrite/config';

export default function OutForm() {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        const { itemName, qty } = data;
        try {
            const updatedQuantity = await service.updateItemQuantity(itemName, -qty); // Subtract the quantity
            alert(`New quantity for ${itemName} is ${updatedQuantity}`);
            reset(); // Reset the form after submission
        } catch (error) {
            alert(error.message); // Show the error message
        }
    };

    return (
        <div className="p-4">
            <Typography variant="h5" className="mb-4">Remove Items from Stock</Typography>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <TextField
                    label="Item Name"
                    {...register("itemName", { required: true })}
                    fullWidth
                />
                <TextField
                    label="Quantity to Remove"
                    type="number"
                    {...register("qty", { required: true, valueAsNumber: true })}
                    fullWidth
                />
                <Button type="submit" variant="contained" color="primary">
                    Remove Item
                </Button>
            </form>
        </div>
    );
}
