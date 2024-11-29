import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import authService from "../appwrite/auth";
import { Container } from "../components";
import { useSelector } from "react-redux";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Head() {
    const [head, setHead] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);
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
        const fetchHead = async () => {
            if (id) {
                try {
                    const head = await service.getHead(id);
                    if (head) {
                        setHead(head);
                        setIsAuthor(userData?.$id === head.userId);
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Error fetching Head:", error);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };
        fetchHead();
    }, [id, navigate]);

    const deleteHead = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this Head?");
        if (confirmed) {
            const status = await service.deleteHead(head.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return head ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {authStatus && (
                            <div className="flex space-x-4">
                                {/* Edit Icon */}
                                <Link to={`/edit-head/${head.$id}`} title="Edit">
                                    <button className="text-blue-500 hover:text-blue-700">
                                        <i className="fas fa-edit text-xl"></i>
                                    </button>
                                </Link>

                                {/* Delete Icon */}
                                <button
                                    className="text-red-500 hover:text-red-700"
                                    onClick={deleteHead}
                                    title="Delete"
                                >
                                    <i className="fas fa-trash text-xl"></i>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <li><strong>Head Name:</strong> {head.Headname}</li>
                            <li><strong>Budget Amount:</strong> {head.Budgteamount}</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
