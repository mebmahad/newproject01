import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import { Link, useNavigate } from "react-router-dom";
import service from "../appwrite/config";
import { Query } from "appwrite";
import DynamicInput from "../components/DynamicInput";
import { Button } from "../components";
import { useSelector } from "react-redux";
import authService from "../appwrite/auth";

const AllPosts = () => {
    const authStatus = useSelector((state) => state.auth.status);
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState({ areas: "", feild: "", status: "active" });
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('incomplete'); // Manage active tab

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
                if (filters.areas) queries.push(Query.search("areas", filters.areas));
                if (filters.feild) queries.push(Query.search("feild", filters.feild));

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
    const handlecomplaintClick = () => navigate('/add-post');

    return (
        <Container className="bg-gray-100 min-h-screen py-6 px-4 md:px-8">
            <div className="flex flex-col-reverse md:flex-row gap-6">
                {/* Complaints Section */}
                <div className="w-full md:w-3/4 bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">Complaints</h2>

                    {/* Tab Navigation */}
                    <div className="flex gap-3 mb-6">
                        {/* Tab buttons */}
                        {isAuthor && (
                        <Button
                            className={`px-4 py-2 rounded ${activeTab === 'incomplete' ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}
                            onClick={() => { setActiveTab('incomplete'); setFilters({ ...filters, status: "active" }); }}
                        >
                            Incomplete
                        </Button>
                        )}
                        {(isAuthor==='Admin'||isAuthor==='Procurement'||isAuthor==='Store') && (
                        <Button
                            className={`px-4 py-2 rounded ${activeTab === 'approval' ? 'bg-yellow-600 text-white' : 'bg-yellow-100'}`}
                            onClick={() => { setActiveTab('approval'); setFilters({ ...filters, status: "approval" }); }}
                        >
                            InApproval
                        </Button>
                        )}
                        {(isAuthor==='Admin'||isAuthor==='Procurement'||isAuthor==='Technician'||isAuthor==='Store') && (
                        <Button
                            className={`px-4 py-2 rounded ${activeTab === 'complete' ? 'bg-green-600 text-white' : 'bg-green-100'}`}
                            onClick={() => { setActiveTab('complete'); setFilters({ ...filters, status: "inactive" }); }}
                        >
                            Complete
                        </Button>
                        )}
                        {(isAuthor==='Admin'||isAuthor==='Procurement') && (
                        <Button
                            className={`px-4 py-2 rounded ${activeTab === 'inprocure' ? 'bg-purple-600 text-white' : 'bg-purple-100'}`}
                            onClick={() => { setActiveTab('inprocure'); setFilters({ ...filters, status: "In Procure" }); }}
                        >
                            In Procure
                        </Button>
                        )}
                    </div>

                    {/* Display posts based on active tab */}
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
                    <br />
                    <br />
                    <Button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handlecomplaintClick}>
                        Register Complaints
                    </Button>
                    <br />
                    <br />
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
