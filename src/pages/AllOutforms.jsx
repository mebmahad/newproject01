import React, { useEffect, useState } from "react";
import { Container, OutformCard, Button } from "../components";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Query } from "appwrite";
import { useSelector } from "react-redux";

const AllOutforms = () => {
    const [outforms, setOutforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ status: "active" });
    const [currentUser, setCurrentUser] = useState(null);
    const authStatus = useSelector((state) => state.auth.status);
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setCurrentUser(user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchCurrentUser();
    }, [authStatus]);

    const isAuthor = currentUser?.name;

    useEffect(() => {
        const fetchOutforms = async () => {
            setLoading(true); // Set loading state at the start of fetch
            try {
                const queries = filters.status ? [Query.equal("status", filters.status)] : [];

                const response = await service.getOutforms(queries); // Ensure getProcures accepts queries

                if (response && response.documents) {
                    const parsedOutforms = response.documents.map((ouform) => ({
                        ...outform,
                        Items: outform.Items ? JSON.parse(outform.Items) : [],
                    }));
                    setOutforms(parsedOutforms);
                } else {
                    setOutforms([]);
                }
            } catch (error) {
                console.error("Error fetching Outforms:", error);
                setError("Failed to fetch Outforms.");
                setOutforms([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOutforms();
    }, [filters]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Function to dynamically set active tab and color
    const getTabClass = (status) => {
        return activeTab === status
            ? "bg-blue-500 text-white"
            : "bg-gray-300 text-black hover:bg-blue-200";
    };

    return (
        <Container>
            <div className="flex gap-4">
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Out Stock</h2>

                    <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                        {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                            <Button
                                className={`p-2 rounded-lg ${getTabClass("active")}`}
                                onClick={() => { setFilters({ status: "active" }); setActiveTab("active"); }}
                            >
                                Active
                            </Button>
                        )}

                        {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                            <Button
                                className={`p-2 rounded-lg ${getTabClass("podone")}`}
                                onClick={() => { setFilters({ status: "podone" }); setActiveTab("podone"); }}
                            >
                                Po Done
                            </Button>
                        )}

                        {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Store") && (
                            <Button
                                className={`p-2 rounded-lg ${getTabClass("inactive")}`}
                                onClick={() => { setFilters({ status: "inactive" }); setActiveTab("inactive"); }}
                            >
                                Material Received
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4 overflow-y-auto h-96 mt-6">
                        {outforms.map((outform) => (
                            <div key={outform.$id}>
                                <OutformCard
                                    id={outform.$id}
                                    items={outform.Items}
                                    post={outform.postId}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllOutforms;
