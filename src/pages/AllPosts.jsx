import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";
import { Button } from "../components";
import DynamicInput from "../components/DynamicInput"; // Assuming you have this component for inputs

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("incomplete");
  const [filters, setFilters] = useState({ areas: "", feild: "" });

  const fetchPosts = async () => {
    try {
      const queryStatus = activeTab === "incomplete" ? "active" :
                          activeTab === "approval" ? "approval" : "completed";
      const queries = [Query.equal("status", queryStatus)];
      if (filters.areas) queries.push(Query.equal("areas", filters.areas));
      if (filters.feild) queries.push(Query.equal("feild", filters.feild));
      
      const response = await service.getPosts(queries);
      setPosts(response && response.documents ? response.documents : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, filters]);

  const handleSelectPost = (postId, isSelected) => {
    setSelectedPosts((prevSelected) =>
      isSelected ? [...prevSelected, postId] : prevSelected.filter((id) => id !== postId)
    );
  };

  const handleBatchApproval = async () => {
    try {
      const updatePromises = selectedPosts.map((postId) =>
        service.updatePost(postId, { status: "completed" })
      );
      await Promise.all(updatePromises);
      alert("Selected posts marked as completed.");
      setSelectedPosts([]);
      fetchPosts();
      setActiveTab("completed"); 
    } catch (error) {
      console.error("Failed to mark posts as completed:", error);
      alert("An error occurred while updating the posts.");
    }
  };

  return (
    <Container>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filters Section */}
        <div className="w-full md:w-1/4">
          <h2 className="text-lg font-bold mb-2">Filters</h2>
          <div className="space-y-4 mb-4">
            <DynamicInput
              label="Areas"
              value={filters.areas}
              onChange={(e) => setFilters({ ...filters, areas: e.target.value })}
              placeholder="Search by area"
            />
            <DynamicInput
              label="Field"
              value={filters.feild}
              onChange={(e) => setFilters({ ...filters, feild: e.target.value })}
              placeholder="Search by field"
            />
            <Button
              onClick={() => setFilters({ areas: "", feild: "" })}
              className="bg-red-500 text-white"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="w-full md:w-3/4">
          <h2 className="text-lg font-bold mb-2">Complaints</h2>
          <div className="flex gap-2 mb-4 justify-center">
            <Button onClick={() => setActiveTab("incomplete")}>Incomplete</Button>
            <Button onClick={() => setActiveTab("approval")}>In Approval</Button>
            <Button onClick={() => setActiveTab("completed")}>Completed</Button>
          </div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.$id}
                {...post}
                isSelectable={activeTab === "incomplete" || activeTab === "approval"}
                onSelect={handleSelectPost}
              />
            ))
          ) : (
            <div className="text-center text-gray-500">No posts found.</div>
          )}
          {selectedPosts.length > 0 && activeTab === "approval" && (
            <Button
              onClick={handleBatchApproval}
              className="bg-blue-500 text-white mt-4"
            >
              Mark Selected as Completed
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AllPosts;
