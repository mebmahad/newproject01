import React, { useEffect, useState } from "react";
import { Container, ProcureCard } from "../components";
import service from "../appwrite/config";

const AllProcures = () => {
    const [procures, setProcures] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    useEffect(() => {
        const fetchProcures = async () => {
            try {
                const response = await service.getProcures(); // Remove queries if not defined
    
                console.log("Fetched procure response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setProcures(response.documents); // Set procures if response contains documents
                } else {
                    setProcures([]); // Set to empty array if no documents
                }
            } catch (error) {
                console.error("Error fetching procures:", error);
                setError("Failed to fetch procures."); // Set error message
                setProcures([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchProcures();
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
                {/* Procurements Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Procurements</h2>
                    <div className="space-y-4">
                        {procures.map((procure) => (
                            <div key={procure.$id}>
                                <ProcureCard 
                                    {...procure} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllProcures;
