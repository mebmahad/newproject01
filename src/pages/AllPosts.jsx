import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";
import DynamicInput from "../components/DynamicInput"; // Import the new DynamicInput component
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

                const response = await service.getPosts(queries); // Call your service

                console.log("Fetched posts response:", response); // Log the response for debugging

                if (response && response.documents) {
                    setPosts(response.documents); // Set posts if response contains documents
                } else {
                    setPosts([]); // Set to empty array if no documents
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]); // Fallback to empty array on error
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
                        <div className="flex gap-2 mt-4 justify-center">
                            <Button onClick={() => setFilters({ ...filters, status: "active" })}>
                                Incomplete
                            </Button>
                            <Button onClick={() => setFilters({ ...filters, status: "inactive" })}>
                                Complete
                            </Button>
                        </div>
                        {posts.map((post) => (
                            <div key={post.$id}>
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters Section */}
                <div className="w-full md:w-1/4">
                    <h2 className="text-lg font-bold mb-2">Filters</h2>
                    <DynamicInput
                        label="Areas"
                        value={filters.areas}
                        onChange={(e) => setFilters({ ...filters, areas: e.target.value })}
                    />
                    <DynamicInput
                        label="Feild"
                        value={filters.feild}
                        onChange={(e) => setFilters({ ...filters, feild: e.target.value })}
                    />
                </div>
            </div>
        </Container>
    );
};

export default AllPosts;
