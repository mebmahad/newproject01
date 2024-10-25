import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import service from "../appwrite/config";
import { Query } from "appwrite";
import { Button } from "../components";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("incomplete");

  const fetchPosts = async () => {
    try {
      const queryStatus = activeTab === "incomplete" ? "active" :
                          activeTab === "approval" ? "approval" : "completed";
      const response = await service.getPosts([Query.equal("status", queryStatus)]);
      setPosts(response && response.documents ? response.documents : []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const handleSelectPost = (postId, isSelected) => {
    setSelectedPosts((prevSelected) =>
      isSelected ? [...prevSelected, postId] : prevSelected.filter((id) => id !== postId)
    );
  };

  const handleBatchApproval = async () => {
    try {
      const updatePromises = selectedPosts.map((postId) =>
        service.updatePost(postId, { status: "inactive" })
      );
      await Promise.all(updatePromises);
      alert("Selected posts marked as completed.");
      setSelectedPosts([]); // Clear selected posts
      fetchPosts(); // Refresh the list
      // Fetch completed posts as well
      setActiveTab("completed"); // Optionally switch to the completed tab
    } catch (error) {
      console.error("Failed to mark posts as completed:", error);
      alert("An error occurred while updating the posts.");
    }
  };

  return (
    <Container>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <div className="w-full md:w-3/4">
          <h2 className="text-lg font-bold mb-2">Complaints</h2>
          <div className="flex gap-2 mb-4 justify-center">
            <Button onClick={() => setActiveTab("incomplete")}>Incomplete</Button>
            <Button onClick={() => setActiveTab("approval")}>In Approval</Button>
            <Button onClick={() => setActiveTab("inactive")}>Completed</Button>
          </div>
          {posts.map((post) => (
            <PostCard
              key={post.$id}
              {...post}
              isSelectable={activeTab === "incomplete" || activeTab === "approval"} // Allow selection in the right tabs
              onSelect={handleSelectPost}
            />
          ))}
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
