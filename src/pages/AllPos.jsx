import React, { useEffect, useState } from "react";
import { Container, PoCard } from "../components";
import service from "../appwrite/config";

const AllPos = () => {
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPos = async () => {
            setLoading(true);
            try {
                // Fetch all purchase orders without "status" filtering
                const response = await service.getPos();
                
                if (response && response.documents) {
                    const parsedPos = response.documents.map((po) => ({
                        ...po,
                        Items: po.Items ? JSON.parse(po.Items) : [],
                    }));
                    setPos(parsedPos);
                } else {
                    setPos([]);
                }
            } catch (error) {
                console.error("Error fetching pos:", error);
                setError("Failed to fetch purchase orders.");
                setPos([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPos();
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
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Purchase Orders</h2>
                    <div className="space-y-4 overflow-y-auto h-96">
                        {pos.map((po) => (
                            <div key={po.$id}>
                                <PoCard 
                                    id={po.$id}
                                    items={po.Items} 
                                    post={po.postId} 
                                    vendorname={po.VendorName}
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
