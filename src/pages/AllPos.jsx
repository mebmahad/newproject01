import React, { useEffect, useState } from "react";
import { Container, PoCard, Button } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";

const AllPos = () => {
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: "active" });

    useEffect(() => {
        const fetchPos = async () => {
            setLoading(true); // Set loading state at the start of fetch
            try {
                // Add filter query if a status filter is applied
                const queries = filters.status ? [Query.equal("status", filters.status)] : [];

                // Pass queries to service.getProcures
                const response = await service.getPos(queries); // Ensure getProcures accepts queries

                if (response && response.documents) {
                    const parsedPos = response.documents.map((pos) => ({
                        ...po,
                        Items: po.Items ? JSON.parse(po.Items) : [],
                    }));
                    setPos(parsedPos);
                } else {
                    setPos([]);
                }
            } catch (error) {
                console.error("Error fetching pos:", error);
                setError("Failed to fetch pos.");
                setPos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPos();
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
                    <h2 className="text-lg font-bold mb-2">Purchase Orders</h2>
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                        <Button onClick={() => setFilters({ status: "active" })}>
                            Active
                        </Button>
                        <Button onClick={() => setFilters({ status: "inactive" })}>
                            Invoiced
                        </Button>
                    </div>
                    <div className="space-y-4 overflow-y-auto h-96">
                        {pos.map((po) => (
                            <div key={po.$id}>
                                <PoCard 
                                    id={po.$id}
                                    items={po.Items} 
                                    post={po.postId} 
                                    vendorname={po.vendorname}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllPos;
