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

  return (
    <div className="bg-gray-100 min-h-screen p-6">
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
          posts.map((post) => (
            <Link
              key={post.$id}
              to={`/post/${post.$id}`}
              className="flex flex-col items-center bg-white shadow-md rounded-lg p-4 hover:scale-105 transition transform duration-200"
            >
              <div className="text-gray-800 font-semibold text-center text-sm">
                {post.areas} - {post.subarea} - {post.feild} - {post.problem}
              </div>
              <div className="mt-2">
                <span className={getStatusColor(post.status)}>{post.status}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-full">No posts available</p>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
