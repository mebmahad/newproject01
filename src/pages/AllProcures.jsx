import React, { useEffect, useState } from "react";
import { Container, ProcureCard, Button } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";

const AllProcures = () => {
    const [procures, setProcures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: "active" });

    useEffect(() => {
        const fetchProcures = async () => {
            setLoading(true); // Set loading state at the start of fetch
            try {
                // Add filter query if a status filter is applied
                const queries = filters.status ? [Query.equal("status", filters.status)] : [];

                // Pass queries to service.getProcures
                const response = await service.getProcures(queries); // Ensure getProcures accepts queries

                if (response && response.documents) {
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
    }, [filters]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Container>
            <div className="flex gap-4">
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Procurements</h2>
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                        <Button onClick={() => setFilters({ status: "active" })}>
                            Active
                        </Button>
                        <Button onClick={() => setFilters({ status: "inactive" })}>
                            Inactive
                        </Button>
                    </div>
                    <div className="space-y-4 overflow-y-auto h-96">
                        {procures.map((procure) => (
                            <div key={procure.$id}>
                                <ProcureCard 
                                    id={procure.$id}
                                    items={procure.Items} 
                                    post={procure.postId} 
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
