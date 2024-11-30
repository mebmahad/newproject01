import React, { useEffect, useState } from "react";
import { Container, ProcureCard, Button } from "../components";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Query } from "appwrite";
import { useSelector } from "react-redux";

const AllProcures = () => {
    const [procures, setProcures] = useState([]);
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
        const fetchProcures = async () => {
            setLoading(true); // Set loading state at the start of fetch
            try {
                const queries = filters.status ? [Query.equal("status", filters.status)] : [];

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
                    <h2 className="text-lg font-bold mb-2">Procurements</h2>

                    <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                        {(isAuthor === "Procurement" || isAuthor === "Admin") && (
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
