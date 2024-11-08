import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import { Link } from "react-router-dom";
import service from "../appwrite/config";
import { Query } from "appwrite";
import DynamicInput from "../components/DynamicInput";
import { Button } from "../components";

const AllPosts = () => {
    const [posts, setPosts] = useState([]);
    const [filters, setFilters] = useState({ areas: "", feild: "", status: "active" });

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const queries = [];
                if (filters.status) queries.push(Query.equal("status", filters.status));
                if (filters.areas) queries.push(Query.equal("areas", filters.areas));
                if (filters.feild) queries.push(Query.equal("feild", filters.feild));

                const response = await service.getPosts(queries);
                console.log("Fetched posts response:", response);

                if (response && response.documents) {
                    setPosts(response.documents);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]);
            }
        };

        fetchPosts();
    }, [filters]);

    return (
        <Container>
            <div className="flex flex-col-reverse md:flex-row gap-4">
                {/* Complaints Section */}
                <div className="w-full md:w-3/4">
                    <h2 className="text-lg font-bold mb-2">Complaints</h2>
                    <div className="space-y-4">
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                            {/* Buttons for status filters in a horizontal scrollable div */}
                            <Button onClick={() => setFilters({ ...filters, status: "active" })}>
                                Incomplete
                            </Button>
                            <Button onClick={() => setFilters({ ...filters, status: "approval" })}>
                                InApproval
                            </Button>
                            <Button onClick={() => setFilters({ ...filters, status: "inactive" })}>
                                Complete
                            </Button>
                            <Button onClick={() => setFilters({ ...filters, status: "In Procure" })}>
                                In Procure
                            </Button>
                        </div>
                        {posts.map((post) => (
                            <div key={post.$id}>
                                {/* Make each post clickable */}
                                <Link to={`/post/${post.$id}`}>
                                    <PostCard {...post} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="w-full md:w-1/4">
                    <br />
                    <br />
                    <br />
                    <h2 className="text-lg font-bold mb-2">Filters</h2>
                    <DynamicInput
                        label="Areas"
                        value={filters.areas}
                        onChange={(e) => setFilters({ ...filters, areas: e.target.value })}
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
