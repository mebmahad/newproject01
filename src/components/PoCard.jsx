import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import service from '../../appwrite/config';

const POCard = ({ poId }) => {
    const [poData, setPoData] = useState(null);
    const [vendorAddress, setVendorAddress] = useState('');

    useEffect(() => {
        const fetchPoData = async () => {
            const data = await service.getPo(poId);
            if (data) {
                setPoData(data);

                // Fetch vendor address using the vendor name if necessary
                if (data.VendorName) {
                    const vendors = await service.getVendors(); // Assuming getVendors() fetches all vendors
                    const vendor = vendors.documents.find(v => v.Name === data.VendorName);
                    if (vendor) setVendorAddress(vendor.Address || ''); // Set the address if available
                }
            }
        };
        fetchPoData();
    }, [poId]);

    if (!poData) return <Typography>Loading...</Typography>;

    return (
        <Paper elevation={3} className="p-6 po-card bg-gray-50">
            {/* Company Header */}
            <Typography variant="h5" className="text-center font-bold mb-2">Dawat Properties Trust</Typography>
            <Typography className="text-center">Mahad Al Zahra, Pakhti, Galiakot, Rajasthan</Typography>
            <Typography className="text-center mb-4">GST No: 1234567890</Typography>

            <Divider className="my-4" />

            {/* Vendor Details */}
            <Typography variant="h6" className="font-semibold">Vendor Details</Typography>
            <Typography>Name: {poData.VendorName}</Typography>
            <Typography>Address: {vendorAddress}</Typography>

            <Divider className="my-4" />

            {/* Item List */}
            <Typography variant="h6" className="font-semibold mb-2">Items</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {poData.Items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell align="right">{item.qty}</TableCell>
                                <TableCell align="right">{item.rate}</TableCell>
                                <TableCell align="right">{item.qty * item.rate}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider className="my-4" />

            {/* Total Amount and GST */}
            <div className="text-right mt-4">
                <Typography variant="body1" className="font-semibold">Total Amount: {poData.totalAmount}</Typography>
                <Typography variant="body1">GST/Tax: {poData.gst}%</Typography>
                <Typography variant="h6" className="font-bold mt-2">Total with GST/Tax: {poData.totalamountwithgst}</Typography>
            </div>
        </Paper>
    );
};

export default POCard;
