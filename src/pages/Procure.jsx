import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Procure() {
    const [procure, setProcure] = useState(null);
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

    const authStatus = currentUser;

    useEffect(() => {
        const fetchProcure = async () => {
            if (id) {
                try {
                    const fetchedProcure = await service.getProcure(id);
                    if (fetchedProcure) {
                        setProcure(fetchedProcure);
                    } else {
                        console.error("Procurement not found");
                        navigate("/"); 
                    }
                } catch (error) {
                    console.error("Error fetching procure:", error);
                    navigate("/"); 
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

    const materialReceived = async () => {
        try {
            for (const item of procure.items) {
                const qtyChange = parseInt(item.Quantity, 10);
                if (!isNaN(qtyChange)) {
                    await service.updateItemQuantity(item.Item, qtyChange);
                } else {
                    console.error("Invalid quantity for item:", item.Item);
                }
            }
            await service.updateProcure(procure.$id, { status: "inactive" });
            alert("Material received and store updated successfully.");
        } catch (error) {
            console.error("Error updating store:", error);
            alert("Failed to update store items.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "active": return "bg-blue-500"; // Active
            case "podone": return "bg-yellow-500"; // PO Done
            case "inactive": return "bg-gray-400"; // Inactive
            case "material received": return "bg-green-500"; // Material Received
            default: return "bg-gray-200";
        }
    };

    return procure ? (
        <div className="py-8 bg-gray-50">
            <Container>
                <div className="w-full flex flex-col mb-8 border rounded-xl p-10 shadow-lg bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold">Procurement Details</h1>
                        {authStatus && procure.status !== "material received" && (
                            <div className="flex space-x-3">
                                {(procure.status === "active") && (
                                    <Link to={`/edit-procure/${procure.$id}`}>
                                        <button
                                            className="text-blue-500 hover:text-blue-700 mr-3 transition"
                                            title="Edit"
                                        >
                                            <i className="fas fa-edit text-xl"></i>
                                        </button>
                                    </Link>
                                )}
                                {(procure.status === "active") && (
                                    <button
                                        className="text-red-500 hover:text-red-700 mr-3 transition"
                                        onClick={deleteProcure}
                                        title="Delete"
                                    >
                                        <i className="fas fa-trash text-xl"></i>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Procurement Info */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Items Required</h2>
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
                            <p><span className="font-semibold">Problem:</span> {procure.post.problem}</p>
                        </div>
                    )}

                    {/* Create Purchase Order Button (below Associated Complaint/Request) */}
                    {procure.status === "active" && (
                        <div className="mt-6">
                            <Link to={`/add-po?procureId=${procure.$id}&postId=${procure.postId}`}>
                                <Button className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition`}>
                                    Create Purchase Order
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Material Received Button */}
                    {procure.status === "podone" && (
                        <div className="mt-6">
                            <Button className={`bg-green-500 text-white p-2 rounded hover:bg-green-700 transition`} onClick={materialReceived}>
                                Material Received
                            </Button>
                        </div>
                    )}

                    {/* Status Indicator */}
                    <div className={`mt-4 py-2 px-4 rounded text-white ${getStatusColor(procure.status)}`}>
                        <p className="text-center font-semibold">{procure.status.charAt(0).toUpperCase() + procure.status.slice(1)}</p>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
