import React, { useEffect, useState } from "react";
import { Container } from "../components";
import { Button } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";
import authService from "../appwrite/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AllOutForms = () => {
    const [outForms, setOutForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0); // Tracks the current offset for pagination
    const [hasMore, setHasMore] = useState(true); // Tracks if more data is available
    const limit = 100; // Number of entries to fetch per request
    const authStatus = useSelector((state) => state.auth.status);
    const navigate = useNavigate();

    const fetchOutForms = async () => {
        if (loading || !hasMore) return; // Prevent duplicate fetches or fetches when no more data
        setLoading(true);

        try {
            const response = await service.getOutForms([
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc("timestamp"),
            ]);

            if (response && response.documents) {
                const parsedOutForms = response.documents.map((outForm) => ({
                    ...outForm,
                    Items: (() => {
                        try {
                            return typeof outForm.Items === "string"
                                ? JSON.parse(outForm.Items)
                                : Array.isArray(outForm.Items)
                                ? outForm.Items
                                : [];
                        } catch (error) {
                            console.error(`Error parsing Items for ID: ${outForm.$id}`, error);
                            return [];
                        }
                    })(),
                }));

                setOutForms((prev) => [...prev, ...parsedOutForms]); // Append new data
                setOffset((prev) => prev + limit); // Update offset for the next batch

                if (response.documents.length < limit) {
                    setHasMore(false); // No more entries to fetch
                }
            } else {
                setHasMore(false); // No more data
            }
        } catch (error) {
            console.error("Error fetching OutForms:", error);
            setError("Failed to fetch out forms.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutForms(); // Initial fetch on component mount
    }, []);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <Container>
            <Button onClick={() => navigate('/store')} className="mb-4">
                ← Back to Store
            </Button>
            <div className="flex gap-4">
                <div className="w-full">
                    <h2 className="text-lg font-bold mb-2">All Out Forms</h2>
                    <div className="space-y-4 overflow-y-auto h-96 mt-6">
                        {outForms.map((outForm) => (
                            <div key={outForm.$id} className="p-4 border rounded-lg shadow-sm bg-white">
                                <h3 className="text-md font-semibold">ID: {outForm.id}</h3>
                                <p><strong>Location:</strong> {outForm.securelocation}</p>
                                <p><strong>Timestamp:</strong> {new Date(outForm.timestamp).toLocaleString()}</p>
                                <div>
                                    <strong>Items:</strong>
                                    <ul className="list-disc ml-5">
                                        {outForm.Items.map((item, index) => (
                                            <li key={index}>
                                                {item.itemName} - Quantity: {item.qtyChange ?? "N/A"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    {loading && <p>Loading...</p>}
                    {!loading && hasMore && (
                        <button
                            className="mt-4 p-2 bg-blue-500 text-white rounded"
                            onClick={fetchOutForms}
                        >
                            Load More
                        </button>
                    )}
                    {!hasMore && <p className="mt-4 text-gray-500">No more entries to load.</p>}
                </div>
            </div>
        </Container>
    );
};

export default AllOutForms;
