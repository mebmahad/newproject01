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
      const response = await service.getPosts([
        Query.equal("status", activeTab === "incomplete" ? "active" : "approval"),
      ]);
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
        service.updatePost(postId, { status: "approval" })
      );
      await Promise.all(updatePromises);
      alert("Selected posts submitted for approval.");
      setSelectedPosts([]); // Clear selected posts
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error("Failed to submit posts for approval:", error);
      alert("An error occurred while submitting the posts.");
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
          </div>
          {posts.map((post) => (
            <PostCard
              key={post.$id}
              {...post}
              isSelectable={activeTab === "incomplete"}
              onSelect={handleSelectPost}
            />
          ))}
          {activeTab === "incomplete" && selectedPosts.length > 0 && (
            <Button onClick={handleBatchApproval} className="bg-blue-500 text-white mt-4">
              Submit Selected for Approval
            </Button>
          )}
        </div>
      </div>
    </Container>
  );
};

export default AllPosts;
