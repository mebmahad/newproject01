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
  const [filters, setFilters] = useState({ areas: "", feild: "", status: ["active", "active_imp"] });
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("incomplete");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        if (!user) {
          setFilters(prev => ({
            ...prev,
            status: ["active", "active_imp"]
          }));
        }
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
        if (filters.status) {
  if (Array.isArray(filters.status)) {
    const statusQueries = filters.status.map(status => Query.equal("status", status));
    queries.push(Query.or(statusQueries));
  } else {
    queries.push(Query.equal("status", filters.status));
  }
}
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
      case "active_imp":
        return "bg-red-100 text-red-600";
      case "active":
        return "text-blue-600";
      case "approval":
        return "text-yellow-600";
      case "inactive":
        return "text-green-600";
      case "In Procure":
        return "text-purple-600";
      case "task":
        return "text-orange-600";
      case "laundry":
        return "text-brown-600";
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
          
          if (post.status === "active" || post.status === "task" ||
              post.status === "laundry" || post.status === "In Procure" || post.status === "active_imp" ) {
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

  const handleMaterialRequired = (selectedIds) => {
      if (!selectedIds.length) return;
      
      navigate('/add-procure', {
        state: { complaintIds: [...selectedIds] }
      })
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
          <Button
              onClick={() => handleMaterialRequired(selectedPosts.filter(id => id))}
              disabled={!selectedPosts.length}
              className="bg-purple-600 text-white px-4 py-2 rounded"
          >
              Material Required
          </Button>
        </div>
      )}

      {/* Tabs and Register Complaint Button */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            className={`px-3 py-2 text-sm rounded ${
              activeTab === "incomplete" ? "bg-blue-600 text-white" : "bg-blue-100"
            }`}
            onClick={() => {
              setActiveTab("incomplete");
              setFilters({ ...filters, status: ["active", "active_imp"] });
            }}
          >
              <div className="flex items-center gap-1">
                <MdPendingActions size={16} />
                <span>Incomplete</span>
              </div>
            </Button>
          {(isAuthor === "Admin" || isAuthor === "Procurement" || isAuthor === "Store") && (
            <Button
              className={`px-3 py-2 text-sm rounded ${
                activeTab === "approval" ? "bg-yellow-600 text-white" : "bg-yellow-100"
              }`}
              onClick={() => {
                setActiveTab("approval");
                setFilters({ ...filters, status: "approval" });
              }}
            >
              <div className="flex items-center gap-1">
                <FaRegThumbsUp size={16} />
                <span>InApproval</span>
              </div>
            </Button>
          )}
          {(isAuthor === "Admin" || isAuthor === "Procurement" || isAuthor === "Technician" || isAuthor === "Store") && (
            <Button
              className={`px-3 py-2 text-sm rounded ${
                activeTab === "complete" ? "bg-green-600 text-white" : "bg-green-100"
              }`}
              onClick={() => {
                setActiveTab("complete");
                setFilters({ ...filters, status: "inactive" });
              }}
            >
              <div className="flex items-center gap-1">
                <AiOutlineCheckCircle size={16} />
                <span>Complete</span>
              </div>
            </Button>
          )}
          {(isAuthor === "Admin" || isAuthor === "Procurement") && (
            <Button
              className={`px-3 py-2 text-sm rounded ${
                activeTab === "inprocure" ? "bg-purple-600 text-white" : "bg-purple-100"
              }`}
              onClick={() => {
                setActiveTab("inprocure");
                setFilters({ ...filters, status: "In Procure" });
              }}
            >
              <div className="flex items-center gap-1">
                <FaShippingFast size={16} />
                <span>In Procure</span>
              </div>
            </Button>
          )}
          
          {/* Add Task button - visible to everyone */}
          <Button
            className={`px-3 py-2 text-sm rounded ${
              activeTab === "task" ? "bg-orange-600 text-white" : "bg-orange-100"
            }`}
            onClick={() => {
              setActiveTab("task");
              setFilters({ ...filters, status: "task" });
            }}
          >
            <div className="flex items-center gap-1">
              <AiOutlineFileText size={16} />
              <span>Tasks</span>
            </div>
          </Button>

          {/* Add Laundry button - visible to everyone */}
          <Button
            className={`px-3 py-2 text-sm rounded ${
              activeTab === "laundry" ? "bg-orange-600 text-white" : "bg-orange-100"
            }`}
            onClick={() => {
              setActiveTab("laundry");
              setFilters({ ...filters, status: "laundry" });
            }}
          >
            <div className="flex items-center gap-1">
              <AiOutlineFileText size={16} />
              <span>Laundry</span>
            </div>
          </Button>
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
            {posts
    .sort((a, b) => {
      if (a.status === 'active_imp' && b.status !== 'active_imp') return -1;
      if (b.status === 'active_imp' && a.status !== 'active_imp') return 1;
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      if (new Date(b.$createdAt) - new Date(a.$createdAt) !== 0) {
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      }
      return a.problem.localeCompare(b.problem);
    })
    .map((post) => (
              <div 
                key={post.$id} 
                className={`flex flex-col items-center shadow-md rounded-lg p-4 hover:scale-105 transition transform duration-200 ${selectedPosts.includes(post.$id) ? 'ring-2 ring-blue-500' : ''} ${post.status === 'active_imp' ? getStatusColor(post.status) : 'bg-white'}`}
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
