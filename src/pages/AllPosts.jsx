import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import { Link } from "react-router-dom";
import service from "../appwrite/config";
import { Query } from "appwrite";
import DynamicInput from "../components/DynamicInput";
import { Button } from "../components";
import { useSelector } from "react-redux";
import authService from "../appwrite/auth";

const AllPosts = () => {
    const authStatus = useSelector((state) => state.auth.status);
    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState({ areas: "", feild: "", status: "active" });
    const [currentUser, setCurrentUser] = useState(null);

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
        const fetchPosts = async () => {
            try {
                const queries = [];
                if (filters.status) queries.push(Query.equal("status", filters.status));
                if (filters.areas) queries.push(Query.equal("areas", filters.areas));
                if (filters.feild) queries.push(Query.equal("feild", filters.feild));

                const response = await service.getPosts(queries);
                setPosts(response?.documents || []);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]);
            }
        };

        fetchPosts();
    }, [filters]);

    // Function to get smart color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "text-blue-600"; // Incomplete - blue
            case "approval":
                return "text-yellow-600"; // InApproval - yellow
            case "inactive":
                return "text-green-600"; // Complete - green
            case "In Procure":
                return "text-purple-600"; // In Procure - purple
            default:
                return "text-gray-500"; // Default color for unknown status
        }
    };

    return (
        <Container className="bg-gray-100 min-h-screen py-6 px-4 md:px-8">
            <div className="flex flex-col-reverse md:flex-row gap-6">
                {/* Complaints Section */}
                <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Complaints</h2>
                    <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                        {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Technician") && (
                            <Button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => setFilters({ ...filters, status: "active" })}
                            >
                                Incomplete
                            </Button>
                        )}
                        {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                            <Button
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                onClick={() => setFilters({ ...filters, status: "approval" })}
                            >
                                InApproval
                            </Button>
                        )}
                        {(isAuthor === "Procurement" || isAuthor === "Admin" || isAuthor === "Technician") && (
                            <Button
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={() => setFilters({ ...filters, status: "inactive" })}
                            >
                                Complete
                            </Button>
                        )}
                        {(isAuthor === "Procurement" || isAuthor === "Admin") && (
                            <Button
                                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                                onClick={() => setFilters({ ...filters, status: "In Procure" })}
                            >
                                In Procure
                            </Button>
                        )}
                    </div>
                    {posts.length ? (
                        posts.map((post) => (
                            <Link key={post.$id} to={`/post/${post.$id}`}>
                                <PostCard
                                    {...post}
                                    className="mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-500">
                                        {post.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">{post.description}</p>
                                    <p className="text-xs mt-2 capitalize">
                                        <span className={`${getStatusColor(post.status)}`}>{post.status}</span>
                                    </p>
                                </PostCard>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">No posts available</p>
                    )}
                </div>

                {/* Filters Section */}
                <div className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>
                    <DynamicInput
                        label="Areas"
                        value={filters.areas}
                        onChange={(e) => setFilters({ ...filters, areas: e.target.value })}
                        className="mb-4"
                    />
                    <DynamicInput
                        label="Field"
                        value={filters.feild}
                        onChange={(e) => setFilters({ ...filters, feild: e.target.value })}
                    />
                </div>
            </div>
        </Container>
    );
};

export default AllPosts;
