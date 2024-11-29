import React, { useEffect, useState } from "react";
import { Container, ItemCard, Button } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    const handleItemClick = () => {
        // Define your logic here, for example:
        navigate('/add-item'); // Redirect to the AddItem page
    };
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await service.getItems(); // Remove queries if not defined
    
                console.log("Fetched item response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setItems(response.documents); // Set Items if response contains documents
                } else {
                    setItems([]); // Set to empty array if no documents
                }
            } catch (error) {
                setError("Failed to fetch items."); // Set error message
                setItems([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchItems();
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
                {/* Items Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Items</h2>
                    <div>
                    <Button className="bg-green-500" onClick={handleItemClick}>
                                    Add Item
                                </Button>
                    </div>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.$id}>
                                <ItemCard 
                                    {...item} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllItems;
