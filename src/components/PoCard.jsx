import React, { useEffect, useState } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import service from '../appwrite/config';
import uploadToCloudinary from '../cloudinary/config';

const POCard = () => {
    const { id } = useParams();
    const [poData, setPoData] = useState(null);
    const [vendorAddress, setVendorAddress] = useState('');

    useEffect(() => {
        const fetchPoData = async () => {
            try {
                const data = await service.getPo(id);
                if (data) {
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

    const totalAmount = parseFloat(poData.totalamountwithgst / ((poData.gst / 100) + 1)) || 0;
    const gst = poData.gst || 0;
    const totalAmountWithGST = poData.totalamountwithgst;

    // Function to generate PDF and upload it to Cloudinary
    const handleShareToWhatsApp = async () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Dawat Properties Trust", 20, 20);
            doc.setFontSize(12);
            doc.text("Mahad Al Zahra, Pakhti, Galiakot, Rajasthan", 20, 30);
            doc.text("GST No: 1234567890", 20, 40);

            doc.text(`Vendor Name: ${poData.VendorName}`, 20, 60);
            doc.text(`Vendor Address: ${vendorAddress}`, 20, 70);

            doc.text("Items", 20, 90);
            poData.Items.forEach((item, index) => {
                doc.text(`${item.name} - Qty: ${item.qty} Rate: ₹${item.rate} Amount: ₹${(item.qty * item.rate).toFixed(2)}`, 20, 100 + index * 10);
            });

            doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 20, 140);
            doc.text(`GST/Tax: ${gst}%`, 20, 150);
            doc.text(`Total with GST/Tax: ₹${totalAmountWithGST.toFixed(2)}`, 20, 160);

            const pdfBlob = doc.output('blob');
            const pdfFile = new File([pdfBlob], 'purchase_order.pdf', { type: 'application/pdf' });

            // Upload the PDF to Cloudinary
            const cloudinaryUrl = await uploadToCloudinary(pdfFile);

            // Generate WhatsApp share link
            const whatsappShareUrl = `https://wa.me/?text=Check out this Purchase Order: ${cloudinaryUrl}`;
            window.open(whatsappShareUrl, '_blank');
        } catch (error) {
            console.error("Error generating or uploading PDF:", error);
        }
    };

    return (
        <Paper elevation={3} className="p-6 po-card bg-gray-50">
            <Typography variant="h5" className="text-center font-bold mb-2">Dawat Properties Trust</Typography>
            <Typography className="text-center">Mahad Al Zahra, Pakhti, Galiakot, Rajasthan</Typography>
            <Typography className="text-center mb-4">GST No: 1234567890</Typography>

            <Divider className="my-4" />

            <Typography variant="h6" className="font-semibold">Vendor Details</Typography>
            <Typography>Name: {poData.VendorName}</Typography>
            <Typography>Address: {vendorAddress}</Typography>

            <Divider className="my-4" />

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
                                <TableCell align="right">{(item.qty * item.rate).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider className="my-4" />

            <div className="text-right mt-4">
                <Typography variant="body1" className="font-semibold">
                    Total Amount: ₹{totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body1">
                    GST/Tax: {gst}%
                </Typography>
                <Typography variant="h6" className="font-bold mt-2">
                    Total with GST/Tax: ₹{totalAmountWithGST.toFixed(2)}
                </Typography>
            </div>

            <Button variant="contained" color="primary" className="mt-4" onClick={handleShareToWhatsApp}>
                Share on WhatsApp
            </Button>
        </Paper>
    );
};

export default POCard;
