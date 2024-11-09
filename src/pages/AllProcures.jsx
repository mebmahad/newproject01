import React, { useEffect, useState } from "react";
import { Container, ProcureCard } from "../components";
import service from "../appwrite/config";

const AllProcures = () => {
    const [procures, setProcures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProcures = async () => {
            try {
                const response = await service.getProcures();
                console.log("Fetched procure response:", response);

                if (response && response.documents) {
                    // Parse each procure's Items field if it's in JSON format
                    const parsedProcures = response.documents.map((procure) => ({
                        ...procure,
                        Items: procure.Items ? JSON.parse(procure.Items) : [],
                    }));
                    setProcures(parsedProcures);
                } else {
                    setProcures([]);
                }
            } catch (error) {
                console.error("Error fetching procures:", error);
                setError("Failed to fetch procurements.");
                setProcures([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProcures();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Container>
            <div className="flex gap-4">
                {/* Procurements Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Procurements</h2>
                    <div className="space-y-4 overflow-y-auto h-96">
                        {procures.map((procure) => (
                            <div key={procure.$id}>
                                <ProcureCard 
                                    id={procure.$id}
                                    items={procure.Items} // Pass the parsed items data
                                    post={procure.postId} // Pass the associated post ID
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