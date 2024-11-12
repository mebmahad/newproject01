import React, { useEffect, useState, useCallback } from "react";
import { Container, PoCard } from "../components";
import service from "../appwrite/config";

const AllPos = () => {
    const [pos, setPos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPos = useCallback(async () => {
        if (!hasMore) return;

        setLoading(true);
        try {
            const response = await service.getPos({ page, limit: 10 });
            
            if (response && response.documents.length > 0) {
                const parsedPos = response.documents.map((po) => ({
                    ...po,
                    Items: typeof po.Items === "string" ? JSON.parse(po.Items) : po.Items || [],
                }));
                setPos((prevPos) => [...prevPos, ...parsedPos]);
                setHasMore(response.documents.length === 10);  // Check if we have more data
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching pos:", error);
            setError("Failed to fetch purchase orders.");
        } finally {
            setLoading(false);
        }
    }, [page, hasMore]);

    useEffect(() => {
        fetchPos();
    }, [page, fetchPos]);

    // Handle scroll event
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading && hasMore) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    if (loading && pos.length === 0) {
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
                    <div 
                        className="space-y-4 overflow-y-auto h-96"
                        onScroll={handleScroll}
                    >
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
                        {loading && <div>Loading more...</div>}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllPos;
