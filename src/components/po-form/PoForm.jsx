import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button, TextField, Typography } from '@mui/material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function PoForm({ po }) {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: {
      VendorName: po?.VendorName || '',
      procureId: po?.procureId || '',
      postId: po?.postId || '',
      Items: po?.Items || [],
      totalAmount: po?.totalAmount || '0',
      totalamountwithgst: po?.totalamountwithgst || '0',
      gst: po?.gst || 0,
      pono: po?.pono || '',
      id: po?.$id || `po-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'Items' });
  const [vendors, setVendors] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [totalAmountWithoutGST, setTotalAmountWithoutGST] = useState(0);
  const [totalAmountWithGST, setTotalAmountWithGST] = useState(0);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const procureId = params.get('procureId');
  const postId = params.get('postId');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await service.getVendors();
        setVendors(response.documents);
      } catch (error) {
        console.error("Error fetching vendors:", error);
        setVendors([]);
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
    const fetchProcureDetails = async () => {
      if (procureId) {
        try {
          const procure = await service.getProcure(procureId);
          const parsedItems = Array.isArray(procure.Items)
            ? procure.Items
            : JSON.parse(procure.Items || '[]');

          parsedItems.forEach((item) => {
            append({
              name: item.Item,
              qty: item.Quantity,
              rate: 0,
            });
          });

          setValue('procureId', procureId);
          setValue('postId', procure.postId);
        } catch (error) {
          console.error('Error fetching procurement details:', error);
        }
      }
    };

    fetchProcureDetails();
  }, [procureId, append, setValue]);

  const itemsWatch = watch('Items');
  const gstValue = watch('gst');

  useEffect(() => {
    const totalWithoutGST = itemsWatch?.reduce((total, item) => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      return total + qty * rate;
    }, 0) || 0;
    setTotalAmountWithoutGST(totalWithoutGST);
    setValue('totalAmount', totalWithoutGST);

    const gstPercentage = Number(gstValue) || 0;
    const totalWithGST = totalWithoutGST * (1 + gstPercentage / 100);
    setTotalAmountWithGST(totalWithGST);
    setValue('totalamountwithgst', totalWithGST);
  }, [itemsWatch, gstValue, setValue]);

  const addItem = () => {
    append({
      name: '',
      qty: 0,
      rate: 0,
    });
  };

  const submit = async (data) => {
    try {
      const gstVal = Number(data.gst) || 0;
      const totalWithoutGST = Math.round(totalAmountWithoutGST);
      const totalWithGST = Math.round(totalAmountWithGST);

      const dataToSave = {
        ...data,
        Items: JSON.stringify(data.Items),
        totalAmount: totalWithoutGST.toString(),
        totalamountwithgst: totalWithGST,
        procureId,
        postId,
        gst: gstVal,
      };

      const dbPo = po
        ? await service.updatePo(po.$id, dataToSave)
        : await service.createPo({ ...dataToSave, userId: userData?.$id });

      const newItems = data.Items.filter((item) => item.isNew);
      await Promise.all(
        newItems.map((item) =>
          service.createItem({
            name: item.name,
            quantity: 0,
            createdBy: userData?.$id,
          })
        )
      );

      if (procureId) {
        await service.updateProcure(procureId, { status: 'podone' });
      }
      if (postId) {
        await service.updatePost(postId, { status: 'active' });
      }

      if (dbPo) {
        navigate(`/po/${dbPo.$id}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(submit)}>
        <Typography variant="h6" className="mb-2">Vendor</Typography>
        <TextField
          select
          label="Vendor"
          {...register('VendorName')}
          fullWidth
          defaultValue={po?.VendorName || ''}
          SelectProps={{ native: true }}
          className="mb-4"
        >
          <option value="" disabled>Select a Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.Name}>
              {vendor.Name}
            </option>
          ))}
        </TextField>

        <TextField 
          label="PO Number" 
          {...register('pono')} 
          fullWidth 
          className="mb-4" 
          defaultValue={po?.pono || ''} 
        />

        <Typography variant="h6" className="mb-4">Items</Typography>
        {fields.map((item, index) => {
          const currentItem = itemsWatch && itemsWatch[index] ? itemsWatch[index] : item;
          const computedAmount = (Number(currentItem.qty) || 0) * (Number(currentItem.rate) || 0);
          return (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center mb-2">
              <TextField
                {...register(`Items.${index}.name`)}
                defaultValue={item.name}
                fullWidth
                label="Item Name"
              />
              <TextField
                type="number"
                {...register(`Items.${index}.qty`, { valueAsNumber: true })}
                defaultValue={item.qty}
                fullWidth
                label="Quantity"
              />
              <TextField
                type="number"
                {...register(`Items.${index}.rate`, { valueAsNumber: true })}
                defaultValue={item.rate}
                fullWidth
                label="Rate"
              />
              <Typography className="text-center md:col-span-1">
                {computedAmount.toFixed(2)}
              </Typography>
              <Button variant="contained" color="secondary" onClick={() => remove(index)}>
                Remove
              </Button>
            </div>
          );
        })}

        <Button variant="contained" color="primary" onClick={addItem} className="mb-4">
          Add Item
        </Button>
        <Typography variant="h6" className="mb-2">
          Total Without GST: {totalAmountWithoutGST.toFixed(2)}
        </Typography>
        <TextField
          label="GST (%)"
          {...register('gst', { valueAsNumber: true })}
          type="number"
          fullWidth
          defaultValue={po?.gst || 0}
          className="mb-4"
        />
        <Typography variant="h6" className="mb-4">
          Total With GST: {totalAmountWithGST.toFixed(2)}
        </Typography>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Save PO
        </Button>
      </form>
    </div>
  );
}
