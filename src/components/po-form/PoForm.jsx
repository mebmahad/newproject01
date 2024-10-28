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
      Amount: po?.Amount || 0,
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

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await service.getVendors();
        console.log("Fetched Vendors:", response.documents); // Log to inspect
        setVendors(response.documents || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setVendors([]);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await service.getItems();
        console.log("Fetched Items:", response.documents); // Log to inspect
        setItems(response.documents || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]);
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

  const handleItemSearch = async (event, value, index) => {
    if (value) {
      const searchResults = await service.searchItems(value);
      console.log("Search Results for Items:", searchResults); // Log to inspect
      setItems(searchResults.documents || []);
    }
  };

  const handleVendorSearch = async (event, value) => {
    if (value) {
      const searchResults = await service.searchVendor(value);
      console.log("Search Results for Vendors:", searchResults); // Log to inspect
      setVendors(searchResults.documents || []);
    }
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
          options={vendors}
          getOptionLabel={(option) => option.name || ''} // Ensure 'name' is correct
          renderInput={(params) => <TextField {...params} label="Vendor Name" />}
          onChange={(event, value) => setValue('VendorName', value?.name || '')}
          onInputChange={handleVendorSearch} // Trigger vendor search
          className="mb-4"
          fullWidth
          noOptionsText="No vendors found" // Informative message
        />

        {fields.map((item, index) => (
          <div key={item.id} className="mb-4 p-2 border border-gray-300 rounded">
            <Autocomplete
              options={items}
              getOptionLabel={(option) => option.name || ''} // Ensure 'name' is correct
              renderInput={(params) => <TextField {...params} label={`Item ${index + 1}`} />}
              onChange={(event, value) => {
                setValue(`Items.${index}.name`, value?.name || '');
                setValue(`Items.${index}.rate`, value?.rate || 0); // Set rate from selected item
              }}
              onInputChange={(event, value) => handleItemSearch(event, value, index)} // Trigger item search
              className="mb-2"
              fullWidth
              noOptionsText="No items found" // Informative message
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
