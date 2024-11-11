import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Procure() {
    const [procure, setProcure] = useState(null);
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
        const confirmed = window.confirm("Are you sure you want to delete this procure?");
        if (confirmed && procure) {
            const status = await service.deleteProcure(procure.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    const markAsReceived = async () => {
        if (procure) {
            try {
                await service.updateProcure(procure.$id, { status: "inactive" });
                setProcure({ ...procure, status: "inactive" }); // Update status in state
                alert("Material marked as received.");
            } catch (error) {
                console.error("Error updating procure status:", error);
            }
        }
    };


    return procure ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex flex-col mb-8 border rounded-xl p-10 shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold">Procurement Details</h1>
                        {isAuthor && (
                            <div className="flex space-x-3">
                                <Link to={`/edit-procure/${procure.$id}`}>
                                    <Button className="bg-green-500">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deleteProcure}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {/* Procurement Info */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold">Items Required</h2>
                        <ul className="list-disc pl-5">
                            {procure.items && procure.items.length > 0 ? (
                                procure.items.map((item, index) => (
                                    <li key={index} className="mb-2">
                                        <span className="font-semibold">Item:</span> {item.Item}
                                        <span className="ml-4 font-semibold">Quantity:</span> {item.Quantity}
                                        <span className="ml-4 font-semibold">Budget:</span> {item.BudgetAmount}
                                    </li>
                                ))
                            ) : (
                                <li>No items specified</li>
                            )}
                        </ul>
                    </div>

                    {/* Post Information */}
                    {procure.post && (
                        <div className="mt-6 p-4 border-t border-gray-300">
                            <h2 className="text-xl font-semibold">Associated Complaint/Request</h2>
                            <p><span className="font-semibold">Area:</span> {procure.post.areas}</p>
                            <p><span className="font-semibold">Sub Area:</span> {procure.post.subarea}</p>
                            <p><span className="font-semibold">Problem:</span> {(procure.post.problem)}</p>
                        </div>
                    )}

                    {/* Make PO Button */}
                    <div className="mt-6">
                        <Link to={`/add-po?procureId=${procure.$id}&postId=${procure.postId}`}>
                            <Button className="bg-blue-500">Create Purchase Order</Button>
                        </Link>
                    </div>
                    {/* Material Received Button (appears only if status is "inactive") */}
                    {procure.status === "active" && (
                        <div className="mt-6">
                            <Button className="bg-green-500" onClick={markAsReceived}>
                                Material Received
                            </Button>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    ) : null;
}
