import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Container, Box, Card, CardContent, TextField, Button, Typography, Grid,
  Paper, Divider, IconButton, InputAdornment, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { AddCircle, RemoveCircle, AttachMoney, Description } from '@mui/icons-material';
import service from '../../appwrite/config';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

export default function PoForm({ po }) {
  const { register, handleSubmit, control, setValue, watch } = useForm({
    defaultValues: {
      VendorName: po?.VendorName || '',
      procureId: po?.procureId || '',
      complaintIds: po?.complaintIds || [],
      Items: po?.Items || [],
      totalAmount: po?.totalAmount || '0',
      totalamountwithgst: po?.totalamountwithgst || '0',
      gst: po?.gst || '0',
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
          let parsedItems = [];
          try {
            parsedItems = Array.isArray(procure.Items) 
              ? procure.Items
              : JSON.parse(procure.Items || '[]');

            if (!parsedItems.every(item => 
              typeof item.Item === 'string' &&
              typeof item.Quantity === 'number'
            )) {
              throw new Error('Invalid Items structure in procurement');
            }

            parsedItems.forEach((item) => {
              append({
                name: item.Item,
                qty: item.Quantity,
                rate: 0,
              });
            });
          } catch (parseError) {
            console.error('Error parsing procurement items:', parseError);
            throw new Error('Invalid procurement data format');
          }

          setValue('procureId', procureId);
          let complaintIds = [];
try {
  if (typeof procure.complaintIds === 'string') {
    complaintIds = procure.complaintIds.trim() 
      ? JSON.parse(procure.complaintIds)
      : [];
  } else if (Array.isArray(procure.complaintIds)) {
    complaintIds = [...procure.complaintIds];
  }
  
  if (!Array.isArray(complaintIds)) {
    throw new Error('Invalid complaint IDs format');
  }
} catch (e) {
  console.error('Error parsing complaintIds:', e);
  complaintIds = [];
}
const validIds = complaintIds
  .map(id => String(id).trim())
  .filter(id => id.length > 0);
setValue('complaintIds', validIds);
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

  const [error, setError] = useState(null);

const submit = async (data) => {
  setError(null);
    try {
      const gstVal = Number(data.gst) || 0;
      const totalWithoutGST = Math.round(totalAmountWithoutGST);
      const totalWithGST = Math.round(totalAmountWithGST);

      const dataToSave = {
        ...data,
        Items: JSON.stringify(data.Items.map(item => ({
          name: item.name,
          qty: Number(item.qty || 0),
          rate: Number(item.rate || 0)
        }))),
        totalAmount: String(totalWithoutGST.toFixed(2)),
        totalamountwithgst: parseInt(totalWithGST.toFixed(2)),
        procureId,
        gst: gstVal,
        complaintIds: JSON.stringify(Array.isArray(data.complaintIds) ? data.complaintIds : [])
      };

      const dbPo = po
        ? await service.updatePo(po.$id, dataToSave)
        : await service.createPo({
            ...dataToSave,
            userId: userData?.$id,
            status: 'pending',
            complaintIds: dataToSave.complaintIds || '[]'
          });

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
      setError(error?.message || 'Failed to create PO. Please check your inputs');
    }
  };

  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      const currentProcureId = po?.procureId || procureId;
      if (currentProcureId) {
        try {
          const procure = await service.getProcure(po.procureId);
          if (procure?.complaintIds) {
            const ids = JSON.parse(procure.complaintIds);
            const fetchedComplaints = await Promise.all(
              ids.map(id => service.getPost(id))
            );
            setComplaints(fetchedComplaints.filter(c => c));
          } else if (procure?.postId) {
            const complaint = await service.getPost(procure.postId);
            if (complaint) setComplaints([complaint]);
          }
        } catch (error) {
          console.error('Error fetching complaints:', error);
        }
      }
    };

    fetchComplaints();
  }, [po?.procureId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {po ? 'Edit Purchase Order' : 'Create Purchase Order'}
        </Typography>
        
        <form onSubmit={handleSubmit(submit)} noValidate>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              Error: {error}
            </Typography>
          )}
          {/* Vendor and PO Info Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Vendor & PO Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vendor</InputLabel>
                    <Select
                      {...register('VendorName')}
                      defaultValue={po?.VendorName || ''}
                      label="Vendor"
                      required
                    >
                      {vendors.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.Name}>
                          {vendor.Name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="PO Number"
                    {...register('pono')}
                    fullWidth
                    defaultValue={po?.pono || ''}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Items</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddCircle />}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </Box>
              
              {fields.map((item, index) => {
                const currentItem = itemsWatch && itemsWatch[index] ? itemsWatch[index] : item;
                const computedAmount = (Number(currentItem.qty) || 0) * (Number(currentItem.rate) || 0);
                
                return (
                  <Paper key={item.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          {...register(`Items.${index}.name`)}
                          defaultValue={item.name}
                          fullWidth
                          label="Item Name"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Description color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          type="number"
                          {...register(`Items.${index}.qty`, { valueAsNumber: true })}
                          defaultValue={item.qty}
                          fullWidth
                          label="Quantity"
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
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          value={computedAmount.toFixed(2)}
                          fullWidth
                          label="Amount"
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={1}>
                        <IconButton 
                          color="error" 
                          onClick={() => remove(index)}
                          sx={{ ml: 'auto' }}
                        >
                          <RemoveCircle />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
            </CardContent>
          </Card>

          {/* Totals Section */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Totals
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="GST (%)"
                    {...register('gst', { valueAsNumber: true })}
                    type="number"
                    fullWidth
                    defaultValue={po?.gst || 0}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Subtotal:</Typography>
                      <Typography>₹{totalAmountWithoutGST.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>GST ({gstValue || 0}%):</Typography>
                      <Typography>₹{(totalAmountWithoutGST * (gstValue / 100)).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="bold">Total:</Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ₹{totalAmountWithGST.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box display="flex" justifyContent="flex-end">
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              {po ? 'Update Purchase Order' : 'Save Purchase Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
