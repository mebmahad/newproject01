import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineFileText, AiOutlineCheckCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { FaRegThumbsUp, FaShippingFast } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { Button } from "../components";
import { Query } from "appwrite";
import service from "../appwrite/config";
import { useSelector } from "react-redux";
import authService from "../appwrite/auth";

const AllPosts = () => {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filters, setFilters] = useState({ areas: "", feild: "", status: "active" });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("incomplete");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-blue-600";
      case "approval":
        return "text-yellow-600";
      case "inactive":
        return "text-green-600";
      case "In Procure":
        return "text-purple-600";
      default:
        return "text-gray-500";
    }
  };

  const handleAddPost = () => navigate("/add-post");

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId) 
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.$id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (!selectedPosts.length) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedPosts.length} selected posts?`);
    if (confirmed) {
      try {
        await Promise.all(selectedPosts.map(id => service.deletePost(id)));
        setPosts(prev => prev.filter(post => !selectedPosts.includes(post.$id)));
        setSelectedPosts([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Error deleting posts:", error);
      }
    }
  };

  const handleBulkComplete = async () => {
    if (!selectedPosts.length) return;
    
    const confirmed = window.confirm(`Are you sure you want to update status for ${selectedPosts.length} selected posts?`);
    if (confirmed) {
      try {
        await Promise.all(selectedPosts.map(id => {
          const post = posts.find(p => p.$id === id);
          let newStatus;
          
          if (post.status === "active") {
            newStatus = "approval"; // Move from active to approval
          } else if (post.status === "approval") {
            newStatus = "inactive"; // Move from approval to inactive
          } else {
            return; // Skip if status is already inactive or other
          }
          
          return service.updatePost(id, { status: newStatus });
        }));
        
        setPosts(prev => prev.map(post => {
          if (selectedPosts.includes(post.$id)) {
            let newStatus = post.status;
            if (post.status === "active") newStatus = "approval";
            else if (post.status === "approval") newStatus = "inactive";
            return { ...post, status: newStatus };
          }
          return post;
        }));
        
        setSelectedPosts([]);
        setSelectAll(false);
      } catch (error) {
        console.error("Error updating posts:", error);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <div className="flex gap-2 mb-4">
          <Button 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedPosts.length})
          </Button>
          <Button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleBulkComplete}
          >
            Complete Selected ({selectedPosts.length})
          </Button>
        </div>
      )}

      {/* Tabs and Register Complaint Button */}
      <div className="mb-6">
        <div className="flex gap-3 mb-4">
          {isAuthor && (
            <Button
              className={`px-4 py-2 rounded ${
                activeTab === "incomplete" ? "bg-blue-600 text-white" : "bg-blue-100"
              }`}
              onClick={() => {
                setActiveTab("incomplete");
                setFilters({ ...filters, status: "active" });
              }}
            >
              <div className="flex items-center gap-1">
                <MdPendingActions size={20} />
                <span>Incomplete</span>
              </div>
            </Button>
          )}
          {(isAuthor === "Admin" || isAuthor === "Procurement" || isAuthor === "Store") && (
            <Button
              className={`px-4 py-2 rounded ${
                activeTab === "approval" ? "bg-yellow-600 text-white" : "bg-yellow-100"
              }`}
              onClick={() => {
                setActiveTab("approval");
                setFilters({ ...filters, status: "approval" });
              }}
            >
              <div className="flex items-center gap-1">
                <FaRegThumbsUp size={20} />
                <span>InApproval</span>
              </div>
            </Button>
          )}
          {(isAuthor === "Admin" ||
            isAuthor === "Procurement" ||
            isAuthor === "Technician" ||
            isAuthor === "Store") && (
            <Button
              className={`px-4 py-2 rounded ${
                activeTab === "complete" ? "bg-green-600 text-white" : "bg-green-100"
              }`}
              onClick={() => {
                setActiveTab("complete");
                setFilters({ ...filters, status: "inactive" });
              }}
            >
              <div className="flex items-center gap-1">
                <AiOutlineCheckCircle size={20} />
                <span>Complete</span>
              </div>
            </Button>
          )}
          {(isAuthor === "Admin" || isAuthor === "Procurement") && (
            <Button
              className={`px-4 py-2 rounded ${
                activeTab === "inprocure" ? "bg-purple-600 text-white" : "bg-purple-100"
              }`}
              onClick={() => {
                setActiveTab("inprocure");
                setFilters({ ...filters, status: "In Procure" });
              }}
            >
              <div className="flex items-center gap-1">
                <FaShippingFast size={20} />
                <span>In Procure</span>
              </div>
            </Button>
          )}
        </div>
        <div className="flex justify-end mb-4">
          <Button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleAddPost}
          >
            <div className="flex items-center gap-1">
              <AiOutlinePlusCircle size={20} />
              <span>Register Complaint</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {posts.length ? (
          <>
            <div className="col-span-full flex items-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="mr-2"
              />
              <span>Select All</span>
            </div>
            {posts.map((post) => (
              <div 
                key={post.$id} 
                className={`flex flex-col items-center bg-white shadow-md rounded-lg p-4 hover:scale-105 transition transform duration-200 ${selectedPosts.includes(post.$id) ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.$id)}
                    onChange={() => handleSelectPost(post.$id)}
                    className="mr-2"
                  />
                  <Link to={`/post/${post.$id}`} className="text-gray-800 font-semibold text-center text-sm">
                    {post.areas} - {post.subarea} - {post.feild} - {post.problem}
                  </Link>
                </div>
                <div className="mt-2">
                  <span className={getStatusColor(post.status)}>{post.status}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-gray-500 text-center col-span-full">No posts available</p>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
