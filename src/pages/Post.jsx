import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Container } from "../components";
import { useSelector } from "react-redux";
import gsheetservice from "../google-sheet/googleSheetService";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Post() {
    const [post, setPost] = useState(null);
    const [daysPassed, setDaysPassed] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
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
    }, [userData]);

    const authStatus = currentUser?.name;

    useEffect(() => {
        const fetchPost = async () => {
            if (id) {
                try {
                    const post = await service.getPost(id);
                    if (post) {
                        setPost(post);

                        // Calculate days passed since createdAt
                        if (post.createdAt) {
                            const createdDate = new Date(post.createdAt);
                            const currentDate = new Date();
                            const differenceInTime = Date.UTC(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate()
                            ) - Date.UTC(
                                createdDate.getFullYear(),
                                createdDate.getMonth(),
                                createdDate.getDate()
                            );

                            const differenceInDays = Math.floor(
                                differenceInTime / (1000 * 3600 * 24)
                            );
                            setDaysPassed(differenceInDays);
                        }
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Error fetching post:", error);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };

        fetchPost();
    }, [id, navigate]);

    const updateStatus = async (newStatus) => {
        if (!post) return;

        try {
            await service.updatePost(id, {
                ...post,
                status: newStatus,
            });

            await gsheetservice.updatePost(id, {
                ...post,
                status: newStatus,
            });

            setPost((prevPost) => ({
                ...prevPost,
                status: newStatus,
            }));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deletePost = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (confirmed) {
            const status = await service.deletePost(post.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "text-blue-500 font-semibold";
            case "approval":
                return "text-green-500 font-semibold";
            case "inprocure":
                return "text-yellow-500 font-semibold";
            case "inactive":
                return "text-gray-500 font-semibold";
            default:
                return "text-black font-semibold";
        }
    };

    const handlecomplete = () => {
        updateStatus("approval")
        console.log("Complaint Sent For Approval.");
        navigate("/all-posts"); // Navigate to all-posts
    };

    const handleunapprove = () => {
        updateStatus("active")
        console.log("Complaint Sent For Pending.");
        navigate("/all-posts"); // Navigate to all-posts
    };

    const handleapprove = () => {
        updateStatus("inactive")
        console.log("Complaint Approved & Completed.");
        navigate("/all-posts"); // Navigate to all-posts
    };

    const goBack = () => {
        navigate('/all-posts');
    };

    return post ? (
        <div className="py-8 bg-gray-100">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl bg-white shadow-lg p-4">
                    <div className="absolute right-6 top-6">
                        {/* Render buttons based on post status */}
                        {authStatus && post.status === "active" && (
                            <>
                                {(authStatus === 'Admin' || authStatus === 'Procurement') && (
                                    <>
                                        <Link to={`/edit-post/${post.$id}`}>
                                            <button
                                                className="text-blue-500 hover:text-blue-700 mr-3"
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit text-xl"></i>
                                            </button>
                                        </Link>

                                        <button
                                            className="text-red-500 hover:text-red-700 mr-3"
                                            onClick={deletePost}
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash text-xl"></i>
                                        </button>
                                    </>
                                )}
                                <Link to={`/add-procure/${post.$id}`}>
                                    <button
                                        className="text-green-500 hover:text-green-700 mr-3"
                                        title="Material Required"
                                    >
                                        <i className="fas fa-box text-xl"></i>
                                    </button>
                                </Link>

                                <button
                                    onClick={handlecomplete}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Complete"
                                >
                                    <i className="fas fa-check-circle text-xl"></i>
                                </button>
                            </>
                        )}
                        {authStatus && post.status === "approval" && (
                            <>
                                <button
                                    onClick={handleapprove}
                                    className="text-green-500 hover:text-green-700 mr-3"
                                    title="Approved"
                                >
                                    <i className="fas fa-thumbs-up text-xl"></i>
                                </button>

                                <button
                                    onClick={handleunapprove}
                                    className="text-yellow-500 hover:text-yellow-700"
                                    title="Unapprove"
                                >
                                    <i className="fas fa-undo text-xl"></i>
                                </button>

                                <button
                                    className="text-red-500 hover:text-red-700 mr-3"
                                    onClick={deletePost}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash text-xl"></i>
                                </button>
                            </>
                        )}
                        {(authStatus === 'Admin' || authStatus === 'Procurement') && (post.status === "inactive") && (
                            <>
                                <button
                                    onClick={handleunapprove}
                                    className="text-yellow-500 hover:text-yellow-700"
                                    title="Unapprove"
                                >
                                    <i className="fas fa-undo text-xl"></i>
                                </button>

                                <button
                                    className="text-red-500 hover:text-red-700 mr-3"
                                    onClick={deletePost}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash text-xl"></i>
                                </button>
                            </>
                        )}
                    </div>

                    <div className="browser-css font-bold">
                    <button
                            className="absolute top-2 left-2 px-4 py-2 text-blue-500 hover:text-blue-700 mr-3"
                            onClick={goBack}
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                        </button>
                        <br />
                        <br />
                        <ul>
                            <li>
                                <span className="font-bold">Status: </span>
                                <span className={getStatusClass(post.status)}>{post.status}</span>
                            </li>
                            <li><strong>Area:</strong> {post.areas}</li>
                            <li><strong>Subarea:</strong> {post.subarea}</li>
                            <li><strong>Field:</strong> {post.feild}</li>
                            <li><strong>Problem:</strong> {post.problem}</li>
                            <li><strong>Post ID:</strong> {post.$id}</li>
                            <li><strong>Days:</strong> {daysPassed}</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
