import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, TextField, Autocomplete } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PoForm({ po }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      VendorName: po?.VendorName || '',
      Items: po?.Items || '',
      Amount: po?.Amount || '',
      id: po?.$id || '',
    },
  });

  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await service.getVendors().Name;
        setVendors(response.vendors);
        console.log(setVendors)
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await service.getItems().Item;
        setItems(response.items);
        console.log(setItems)
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchVendors();
    fetchItems();
  }, []);

  const submit = async (data) => {
    try {
      let dbPo;
      if (po) {
        if (!po.$id) {
          throw new Error('Po ID is not available');
        }
        dbPo = await service.updatePo(po.$id, { ...data });
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

  const idTransfrorm = useCallback((value) => {
    if (value && typeof value === 'string')
      return value.trim().replace(/[^a-zA-Z\d\s]+/g, '-').replace(/\s/g, '-');
    return '';
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'VendorName') {
        setValue('id', idTransfrorm(value.VendorName), { shouldValidate: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, idTransfrorm, setValue]);

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <TextField
          label="Id"
          placeholder="id"
          className="mb-4"
          {...register('id', { required: true })}
          onInput={(e) => {
            setValue('id', idTransfrorm(e.currentTarget.value), { shouldValidate: true });
          }}
        />

        <Autocomplete
          options={vendors}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="VendorName" />}
          onChange={(event, value) => setValue('VendorName', value?.name || '')}
          className="mb-4"
        />

        <Autocomplete
          options={items}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => <TextField {...params} label="Items" />}
          onChange={(event, value) => setValue('Items', value?.name || '')}
          className="mb-4"
        />

        <TextField
          label="Amount"
          placeholder="Amount"
          className="mb-4"
          {...register('Amount', { required: true })}
        />

        <Button type="submit" variant="contained" color={po ? 'primary' : 'secondary'}>
          {po ? 'Update' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
