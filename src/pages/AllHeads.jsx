import React, { useEffect, useState } from "react";
import { Container, HeadCard } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllHeads = () => {
    const [heads, setHeads] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    const handleItemClick = () => {
        // Define your logic here, for example:
        navigate('/add-head'); // Redirect to the AddItem page
    };
    useEffect(() => {
        const fetchHeads = async () => {
            try {
                const response = await service.getHeads(); // Remove queries if not defined
    
                console.log("Fetched Head response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setHeads(response.documents); // Set Items if response contains documents
                } else {
                    setHeads([]); // Set to empty array if no documents
                }
            } catch (error) {
                setError("Failed to fetch Heads."); // Set error message
                setHeads([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchHeads();
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
                {/* Heads Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Heads</h2>
                    <div>
                    <button className="bg-green-500" onClick={handleItemClick}>
                                    Add Head
                                </button>
                    </div>
                    <div className="space-y-4">
                        {heads.map((head) => (
                            <div key={head.$id}>
                                <HeadCard 
                                    {...head} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllHeads;
