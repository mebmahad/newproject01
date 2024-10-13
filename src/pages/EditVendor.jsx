import React, { useEffect, useState } from 'react';
import { Container, VendorForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditVendor() {
    const [vendor, setVendor] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchVendor = async () => {
            if (id) {
                try {
                    const vendor = await service.getVendor(id);
                    if (vendor) {
                        // Check if the user is the author
                        if (vendor.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setVendor(vendor);
                        }
                    } else {
                        navigate('/all-vendors'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch vendor:", error);
                    navigate('/all-vendors'); // Redirect on error
                }
            } else {
                navigate('/all-vendors');
            }
        };

        fetchVendor();
    }, [id, navigate, userData]);

    return vendor ? (
        <div className='py-8'>
            <Container>
                <VendorForm vendor={vendor} />
            </Container>
        </div>
    ) : null;
}

export default EditVendor;
