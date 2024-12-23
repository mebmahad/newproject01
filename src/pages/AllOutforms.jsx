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
