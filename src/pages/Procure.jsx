import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Procure() {
    const [procure, setProcure] = useState(null);
    const [post, setPost] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = procure && userData && procure.authorId === userData.id;

    useEffect(() => {
        const fetchProcure = async () => {
            if (id) {
                try {
                    const fetchedProcure = await service.getProcure(id);
                    if (fetchedProcure) {
                        setProcure(fetchedProcure);

                        // Fetch associated post by postId
                        const fetchedPost = await service.getPost(fetchedProcure.postId);
                        setPost(fetchedPost);
                    } else {
                        console.error("Procurement not found");
                        navigate("/"); // Redirect if procure not found
                    }
                } catch (error) {
                    console.error("Error fetching procure:", error);
                    navigate("/"); // Handle error and redirect
                }
            } else {
                console.error("ID not found");
                navigate("/");
            }
        };

        fetchProcure();
    }, [id, navigate]);

    const deleteProcure = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this procurement?");
        if (confirmed && procure) {
            const status = await service.deleteProcure(procure.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return procure ? (
        <Container className="py-8">
            <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
                {/* Top Section: Edit/Delete options for author */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Procurement Details</h2>
                    {isAuthor && (
                        <div>
                            <Link to={`/edit-procure/${procure.$id}`}>
                                <Button className="bg-green-500 mr-3">Edit</Button>
                            </Link>
                            <Button className="bg-red-500" onClick={deleteProcure}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Procurement Details */}
                <div className="border-b pb-4 mb-4">
                    <p className="text-gray-600 mb-2"><strong>Item:</strong> {procure.Item}</p>
                    <p className="text-gray-600 mb-2"><strong>Quantity:</strong> {procure.Quantity}</p>
                    <p className="text-gray-600 mb-2"><strong>Budget Amount:</strong> {procure.BudgetAmount}</p>
                </div>

                {/* Associated Complaint/Request Post */}
                {post && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Related Complaint / Request</h3>
                        <p className="text-gray-600"><strong>Post ID:</strong> {post.$id}</p>
                        <p className="text-gray-600 mb-2">{post.Description}</p>
                    </div>
                )}

                {/* Bottom Buttons */}
                <div className="mt-8 flex justify-between">
                    <Link to={`/add-po`}>
                        <Button className="bg-blue-500">Create Purchase Order</Button>
                    </Link>
                    <Link to="/">
                        <Button className="bg-gray-300 text-gray-700">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </Container>
    ) : null;
}
