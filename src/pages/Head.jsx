import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Head() {
    const [head, setHead] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false); // State to track if current user is the author
    const { id } = useParams(); // Post id from URL
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchHead = async () => {
            if (id) {
                try {
                    const head = await service.getHead(id);
                    if (head) {
                        setHead(head);

                        // Check if the current user is the author
                        if (userData && userData.$id && head.userId === userData.$id) {
                            setIsAuthor(true);
                        } else {
                            setIsAuthor(false);
                        }
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
    }, [id, navigate, userData]);

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
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-head/${head.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deleteHead}>
                                    Delete
                                </Button>
                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li><strong>Head Name:</strong> {head.Headname}</li>
                            <li><strong>Budget Amount:</strong> {head.Budgteamount}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
