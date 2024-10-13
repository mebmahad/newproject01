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
    const isAuthor = procure && userData && procure.authorId === userData.id; // Check if the user is the author

    useEffect(() => {
        const fetchProcure = async () => {
            if (id) {
                try {
                    const fetchedProcure = await service.getProcure(id);
                    if (fetchedProcure) {
                        setProcure(fetchedProcure);
                    } else {
                        console.error("procurement not found")
                        navigate("/"); // Redirect if procure not found
                    }
                } catch (error) {
                    console.error("Error fetching procure:", error);
                    navigate("/"); // Handle error and redirect
                }
            } else {
                console.error("id not found")
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

    return procure ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-10">
                    <div className="absolute right-6 top-6">
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
                        <div className="mt-2">
                            <Link to={`/add-po`}>
                                <Button className="bg-green-500 mr-3">Make PO</Button>
                            </Link>
                        </div>
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <li>{procure.Item}</li>
                            <li>{procure.Quantity}</li>
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
