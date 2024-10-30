import React, { useEffect, useState } from "react";
import { Container, LocationCard } from "../components";
import service from "../appwrite/config";
import { useNavigate } from "react-router-dom";

const AllLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await service.getLocations(); // Remove queries if not defined
    
                console.log("Fetched Location response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setLocations(response.documents); // Set Items if response contains documents
                } else {
                    setLocations([]); // Set to empty array if no documents
                }
            } catch (error) {
                setError("Failed to fetch items."); // Set error message
                setLocations([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchLocations();
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
                {/* Locations Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Locations</h2>
                    <div className="space-y-4">
                        {locations.map((location) => (
                            <div key={location.$id}>
                                <LocationCard 
                                    {...location} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllLocations;
