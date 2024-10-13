import React, { useEffect, useState } from "react";
import { Container, VendorCard } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    const handleItemClick = () => {
        // Define your logic here, for example:
        navigate('/add-vendor'); // Redirect to the AddItem page
    };
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await service.getVendors(); // Remove queries if not defined
    
                console.log("Fetched vendor response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setVendors(response.documents); // Set Items if response contains documents
                } else {
                    setVendors([]); // Set to empty array if no documents
                }
            } catch (error) {
                setError("Failed to fetch vendors."); // Set error message
                setVendors([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchVendors();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    if (error) {
        return <div>{error}</div>; // Show error message
    }

    return (
        <Container>
            <div className="flex gap-4">
                {/* Vendors Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Items</h2>
                    <div>
                    <button className="bg-green-500" onClick={handleItemClick}>
                                    Add Vendor
                                </button>
                    </div>
                    <div className="space-y-4">
                        {vendors.map((vendor) => (
                            <div key={vendor.$id}>
                                <VendorCard 
                                    {...vendor} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllVendors;
