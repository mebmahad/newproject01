import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, Autocomplete } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // Fetch vendors and items with default empty string input for initial list
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await service.searchVendor("");
        setVendors(response || []);  // Default to empty array if undefined
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]); // Set to empty array on error
      }
    };

    const fetchItems = async () => {
      try {
        const response = await service.searchItems("");
        setItems(response || []);  // Default to empty array if undefined
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]); // Set to empty array on error
      }
    };

    fetchVendors();
    fetchItems();
  }, []);

  useEffect(() => {
    const subscription = watch((value) => {
      const calculatedTotal = value.Items.reduce((acc, item) => {
        return acc + item.qty * item.rate;
      }, 0);
      setTotalAmount(calculatedTotal);
      setValue('Amount', calculatedTotal);
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const submit = async (data) => {
    try {
      let dbPo;
      if (po) {
        dbPo = await service.updatePo(po.$id, data);
      } else {
        dbPo = await service.createPo({ ...data, userId: userData?.$id });
      }
      if (dbPo) {
        navigate(`/po/${dbPo.$id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addItem = () => {
    append({ name: '', qty: 0, rate: 0 });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4">
      <div className="w-full">
        <TextField
          label="ID"
          placeholder="Auto-generated ID"
          className="mb-4"
          {...register('id')}
          disabled
          fullWidth
        />

        <Autocomplete
          options={vendors || []}
          getOptionLabel={(option) => option.Name || ''}
          renderInput={(params) => <TextField {...params} label="Vendor Name" />}
          onChange={(event, value) => setValue('VendorName', value?.Name || '')}
          className="mb-4"
          fullWidth
        />

        {fields.map((item, index) => (
          <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
            <Autocomplete
              options={items || []}
              getOptionLabel={(option) => option.Item || ''}
              renderInput={(params) => <TextField {...params} label={`Item ${index + 1}`} />}
              onChange={(event, value) =>
                setValue(`Items.${index}.name`, value?.Item || '')
              }
              fullWidth
              className="mb-2"
            />
            <TextField
              label="Quantity"
              type="number"
              placeholder="Quantity"
              {...register(`Items.${index}.qty`, { required: true, valueAsNumber: true })}
              fullWidth
              className="mb-2"
            />
            <TextField
              label="Rate"
              type="number"
              placeholder="Rate"
              {...register(`Items.${index}.rate`, { required: true, valueAsNumber: true })}
              fullWidth
              className="mb-2"
            />
            <Button variant="outlined" color="secondary" onClick={() => remove(index)}>
              Remove Item
            </Button>
          </div>
        ))}

        <Button variant="contained" color="primary" onClick={addItem} className="mb-4">
          Add Item
        </Button>

        <TextField
          label="Total Amount"
          placeholder="Total Amount"
          value={totalAmount}
          disabled
          fullWidth
          className="mb-4"
        />

        <Button type="submit" variant="contained" color={po ? 'primary' : 'secondary'} fullWidth>
          {po ? 'Update PO' : 'Submit PO'}
        </Button>
      </div>
    </form>
  );
}
