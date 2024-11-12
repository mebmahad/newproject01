import React, { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import service from '../appwrite/config';
import { useParams } from 'react-router-dom';
import { Query } from 'appwrite';

const Po = () => {
    const { id } = useParams();
    const [poData, setPoData] = useState(null);
    const [vendorData, setVendorData] = useState(null);
    const [postDetails, setPostDetails] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch PO Data
                const po = await service.getPo(id);
                if (!po) {
                    console.log(po.postId)
                    console.error("No PO data found for id:", id);
                    return;
                }
                setPoData(po);

                // Fetch Vendor Data based on VendorName from PO
                const vendor = await service.searchVendor(po.VendorName);
                if (!vendor) {
                    console.error("No vendor data found for VendorName:", po.VendorName);
                    return;
                }
                setVendorData(vendor);

                // Fetch Post Details using postId from PO
                const post = await service.getPost(po.postId);
                if (!post) {
                    console.error("No post data found for postId:", po.postId);
                    return;
                }
                setPostDetails(post);
            } catch (error) {
                console.error("Error fetching PO data:", error);
            }
        };

        fetchData();
    }, [id]);

    // Ensure loading state is handled gracefully
    if (!poData || !vendorData || !postDetails) {
        return <div>Loading...</div>;
    }

    const { VendorName, Items, totalAmount, gst, totalamountwithgst, postId } = poData;
    let itemList = [];
    try {
       const itemliststring = JSON.stringify(Items);
        itemList = JSON.parse(itemliststring);
    } catch (error) {
        console.error("Error parsing Items field:", error);
    }

    return (
        <Paper className="p-6 po-card bg-white">
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
            {postDetails && (
                <div>
                    <Typography variant="h6" className="font-semibold mt-4">Related Post Details:</Typography>
                    <Typography variant="body2">Post ID: {postId}</Typography>
                    <Typography variant="body2">Description: {postDetails.problem || 'N/A'}</Typography>
                    {/* Add more post details as needed */}
                </div>
            )}
        </Paper>
    );
};

export default Po;
