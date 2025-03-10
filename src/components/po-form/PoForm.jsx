import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Container, Box, Card, CardContent, TextField, Button, Typography, Grid } from '@mui/material';
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
    <Container maxWidth="md">
      <Box my={4}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              {po ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </Typography>
            <form onSubmit={handleSubmit(submit)} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Vendor"
                    {...register('VendorName')}
                    fullWidth
                    defaultValue={po?.VendorName || ''}
                    SelectProps={{ native: true }}
                    variant="outlined"
                    required
                  >
                    <option value="" disabled>
                      Select a Vendor
                    </option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.Name}>
                        {vendor.Name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="PO Number"
                    {...register('pono')}
                    fullWidth
                    defaultValue={po?.pono || ''}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Items
                  </Typography>
                  {fields.map((item, index) => {
                    const currentItem = itemsWatch && itemsWatch[index] ? itemsWatch[index] : item;
                    const computedAmount = (Number(currentItem.qty) || 0) * (Number(currentItem.rate) || 0);
                    return (
                      <Grid container spacing={2} key={item.id} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            {...register(`Items.${index}.name`)}
                            defaultValue={item.name}
                            fullWidth
                            label="Item Name"
                            variant="outlined"
                            required
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            type="number"
                            {...register(`Items.${index}.qty`, { valueAsNumber: true })}
                            defaultValue={item.qty}
                            fullWidth
                            label="Quantity"
                            variant="outlined"
                            required
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            type="number"
                            {...register(`Items.${index}.rate`, { valueAsNumber: true })}
                            defaultValue={item.rate}
                            fullWidth
                            label="Rate"
                            variant="outlined"
                            required
                          />
                        </Grid>
                        <Grid item xs={6} sm={2}>
                          <TextField
                            value={computedAmount.toFixed(2)}
                            fullWidth
                            label="Amount"
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                            }}
                          />
                        </Grid>
                        <Grid item xs={6} sm={1}>
                          <Button variant="contained" color="secondary" onClick={() => remove(index)}>
                            Remove
                          </Button>
                        </Grid>
                      </Grid>
                    );
                  })}
                  <Box mt={2}>
                    <Button variant="contained" color="primary" onClick={addItem}>
                      Add Item
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Total Without GST: {totalAmountWithoutGST.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="GST (%)"
                    {...register('gst', { valueAsNumber: true })}
                    type="number"
                    fullWidth
                    defaultValue={po?.gst || 0}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    Total With GST: {totalAmountWithGST.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Box mt={4}>
                <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                  {po ? 'Update Purchase Order' : 'Save Purchase Order'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
