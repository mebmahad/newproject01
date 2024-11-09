import React, { useEffect, useState } from "react";
import { Container, ProcureCard } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";
import { Button } from "../components";

const AllProcures = () => {
    const [procures, setProcures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: "active" });

    useEffect(() => {
        const fetchProcures = async () => {
            try {
                const queries = [];
                if (filters.status) queries.push(Query.equal("status", filters.status));    

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
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                            {/* Buttons for status filters in a horizontal scrollable div */}
                            <Button onClick={() => setFilters({ ...filters, status: "active" })}>
                                Active
                            </Button>
                            <Button onClick={() => setFilters({ ...filters, status: "inactive" })}>
                                Inactive
                            </Button>
                        </div>
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