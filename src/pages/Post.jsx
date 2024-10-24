import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const [daysPassed, setDaysPassed] = useState(0); // State to store days passed
    const [isAuthor, setIsAuthor] = useState(false); // State to track if current user is the author
    const { id } = useParams(); // Post id from URL
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        if (id) {
            service.getPost(id).then((post) => {
                if (post) {
                    setPost(post);

                    // Calculate days passed since createdAt
                    if (post.createdAt) {
                        const createdDate = new Date(post.createdAt);
                        const currentDate = new Date();
                        const differenceInTime = currentDate - createdDate;
                        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert to days
                        setDaysPassed(differenceInDays);
                    }

                    // Check if the current user is the author
                    if (userData && post.userId === userData.$id) {
                        setIsAuthor(true);
                    } else {
                        setIsAuthor(false);
                    }
                } else {
                    navigate("/");
                }
            });
        } else {
            navigate("/");
        }
    }, [id, navigate, userData]);

    const deletePost = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (confirmed) {
            const status = await service.deletePost(post.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deletePost}>
                                    Delete
                                </Button>
                            </div>
                        )}
                        <br />
                        <div>
                            <Link to={`/add-procure`}>
                                <Button className="bg-green-500 mr-3">Material Required</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li><strong>Area:</strong> {post.areas}</li>
                            <li><strong>Subarea:</strong> {post.subarea}</li>
                            <li><strong>Field:</strong> {post.feild}</li>
                            <li><strong>Problem:</strong> {post.problem}</li>
                            <li><strong>Post ID:</strong> {post.$id}</li> {/* Show the post ID */}
                            <li><strong>Days since created:</strong> {daysPassed} days ago</li> {/* Show days since creation */}
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
