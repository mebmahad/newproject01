import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import service from '../appwrite/config';
import { useParams } from 'react-router-dom';
import { Query } from 'appwrite';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';
import { Edit, Delete } from '@mui/icons-material';
import { Link, useNavigate } from "react-router-dom";

const Po = () => {
    const { id } = useParams();
    const [poData, setPoData] = useState(null);
    const [vendorData, setVendorData] = useState(null);
    const [postDetails, setPostDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch PO Data
                const po = await service.getPo(id);
                if (!po) {
                    console.error("No PO data found for id:", id);
                    return;
                }
                setPoData(po);

                // Fetch Vendor Data based on VendorName from PO
                const vendorResponse = await service.getVendors([Query.search("Name", po.VendorName)]);
                if (vendorResponse.documents && vendorResponse.documents.length > 0) {
                    setVendorData(vendorResponse.documents[0]);
                } else {
                    console.error("No vendor data found for VendorName:", po.VendorName);
                }

                // Fetch Post Details using postId from PO if postId is present
                if (po.postId) {
                    const post = await service.getPost(po.postId);
                    setPostDetails(post || "Not Available");
                } else {
                    setPostDetails("Not Available");
                }
            } catch (error) {
                console.error("Error fetching PO data:", error);
            }
        };

        fetchData();
    }, [id]);

    // Ensure loading state is handled gracefully
    if (!poData || !vendorData || postDetails === null) {
        return <div>Loading...</div>;
    }

    const { VendorName, Items, totalAmount, gst, totalamountwithgst, postId, procureId, pono } = poData;
    let itemList = [];

    try {
        itemList = typeof Items === 'string' ? JSON.parse(Items) : Items;
    } catch (error) {
        console.error("Error parsing Items field:", error);
    }

    // Function to generate the PDF
    const generatePDF = () => {
        const content = document.getElementById("po-content");
        const poNumber = poData?.pono || 'purchase_order';

        if (window.innerWidth <= 768) {
            html2pdf()
                .from(content)
                .toPdf()
                .get('pdf')
                .then(function (pdf) {
                    const blob = pdf.output('blob');
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `po-${poNumber}.pdf`;
                    link.click();
                });
        } else {
            const options = {
                margin: [10, 10, 10, 10],
                filename: `po-${poNumber}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(options).from(content).save();
        }
    };

    const deletePo = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this PO?");
        if (confirmed) {
            const status = await service.deletePo(poData.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    const handleMaterialReceived = async () => {
        // Logic to handle "Material Received" action
        alert("Material Received action triggered");
    };

    return (
        <Paper className="p-6 po-card bg-white">
            <div id="po-content">
                {/* Organization Header */}
                <div className="text-center mb-4">
                    <Typography variant="h5" className="font-semibold">
                        Dawat Properties Trust
                    </Typography>
                    <Typography variant="body2">Mahad al Zahra, Pakhti, Galiakot, Dist-Dungarpur, Rajasthan</Typography>
                    <Typography variant="body2">GST No: 123456789</Typography>
                </div>

                <Divider />

                {/* Vendor and Date Information */}
                <div className="flex justify-between mt-4">
                    <div>
                        <Typography variant="h6" className="font-semibold">Vendor Details:</Typography>
                        <Typography variant="body2">Name: {vendorData?.Name || 'N/A'}</Typography>
                        <Typography variant="body2">Address: {vendorData?.Address || 'N/A'}</Typography>
                    </div>
                    <div>
                        <Typography variant="body2">Date: {new Date().toLocaleDateString()}</Typography>
                        <Typography variant="body2">Po No: {pono || 'N/A'}</Typography>
                    </div>
                </div>

                <Divider className="my-4" />

                {/* Item Table */}
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
                            {itemList.length > 0 ? (
                                itemList.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell align="right">{item.qty}</TableCell>
                                        <TableCell align="right">{item.rate}</TableCell>
                                        <TableCell align="right">{(item.qty * item.rate).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No items available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Summary */}
                <div className="mt-4">
                    <Typography variant="body2" className="text-right">Total Amount: ₹{parseFloat(totalAmount).toFixed(2)}</Typography>
                    <Typography variant="body2" className="text-right">GST ({gst}%): ₹{(totalAmount * (gst / 100)).toFixed(2)}</Typography>
                    <Typography variant="h6" className="text-right font-semibold">Total with GST: ₹{parseFloat(totalamountwithgst).toFixed(2)}</Typography>
                </div>

                <Divider className="my-4" />

                {/* Post Details */}
                <div>
                    <Typography variant="h6" className="font-semibold mt-4">Related Post Details:</Typography>
                    <Typography variant="body2">Post ID: {postId || "Not Available"}</Typography>
                    <Typography variant="body2">Description: {postDetails?.problem || postDetails}</Typography>
                </div>
            </div>

            {/* Buttons for Edit, Delete, Material Received, and PDF Generation */}
            <div className="flex justify-between mt-6">
                <div>
                    <IconButton component="a" color="primary">
                        <Link to={`/edit-po/${poData.$id}`}>
                            <Edit />
                        </Link>
                    </IconButton>
                    <IconButton className="bg-red-500" onClick={deletePo}>
                        <Delete />
                    </IconButton>
                </div>
                {!procureId && (
                    <button onClick={handleMaterialReceived} className="bg-green-500 text-white p-2 rounded">
                        Material Received
                    </button>
                )}
                <button onClick={generatePDF} className="bg-blue-500 text-white p-2 rounded">
                    Print to PDF
                </button>
            </div>
        </Paper>
    );
};

export default Po;
