import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom'; 
import service from '../appwrite/config';
import html2pdf from 'html2pdf.js';

const POCard = () => {
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    const [poData, setPoData] = useState(null);
    const [vendorAddress, setVendorAddress] = useState('');

    useEffect(() => {
        const fetchPoData = async () => {
            try {
                const data = await service.getPo(id);
                if (data) {
                    console.log("Fetched PO Data:", data); 
                    setPoData(data);

                    if (data.VendorName) {
                        const vendors = await service.getVendors();
                        const vendor = vendors.documents.find(v => v.Name === data.VendorName);
                        if (vendor) setVendorAddress(vendor.Address || ''); 
                    }
                }
            } catch (error) {
                console.error("Error fetching PO data:", error);
            }
        };
        fetchPoData();
    }, [id]);

    if (!poData) return <Typography>Loading...</Typography>;

    // Ensure amounts are valid numbers
    const totalAmountWithGST = parseFloat(poData.totalamountwithgst) || 0;
    const gst = parseFloat(poData.gst) || 0; 
    const totalAmount = parseFloat(poData.totalAmount) || 0;

    const formatCurrency = (amount) => {
        return isNaN(amount) ? '0.00' : amount.toFixed(2);
    };

    const generatePDF = async () => {
        const element = document.getElementById('pocard');
        const options = {
            margin: 1,
            filename: 'PurchaseOrder.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const pdf = await html2pdf().from(element).set(options).toPdf();
        const blob = await pdf.output('blob');

        const formData = new FormData();
        formData.append('file', blob, 'PurchaseOrder.pdf');

        try {
            const response = await fetch('YOUR_UPLOAD_URL', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.url) {
                const whatsappShareUrl = `https://wa.me/?text=Check out this Purchase Order: ${result.url}`;
                window.open(whatsappShareUrl, '_blank');
            } else {
                console.error("File upload failed:", result);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <Paper elevation={3} className="p-6 po-card bg-gray-50" id="pocard">
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
                                <TableCell align="right">{formatCurrency(item.qty * item.rate)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider className="my-4" />

            {/* Total Amount and GST */}
            <div className="text-right mt-4">
                <Typography variant="body1" className="font-semibold">
                    Total Amount: ₹{formatCurrency(totalAmount)}
                </Typography>
                <Typography variant="body1">
                    GST/Tax: {gst}%
                </Typography>
                <Typography variant="h6" className="font-bold mt-2">
                    Total with GST/Tax: ₹{formatCurrency(totalAmountWithGST)}
                </Typography>
            </div>

            {/* Button to Generate and Share PDF */}
            <Button variant="contained" color="primary" onClick={generatePDF} className="mt-4">
                Share as PDF on WhatsApp
            </Button>
        </Paper>
    );
};

export default POCard;
