import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Budget() {
    const [budget, setBudget] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false); // State to track if current user is the author
    const { id } = useParams(); // Post id from URL
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchBudget = async () => {
            if (id) {
                try {
                    const budget = await service.getBudget(id);
                    if (budget) {
                        setBudget(budget);

                        // Check if the current user is the author
                        if (userData && userData.$id && budget.userId === userData.$id) {
                            setIsAuthor(true);
                        } else {
                            setIsAuthor(false);
                        }
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Error fetching location:", error);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };

        fetchBudget();
    }, [id, navigate, userData]);

    const deleteBudget = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this Budget?");
        if (confirmed) {
            const status = await service.deleteBudget(budget.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return budget ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-budget/${budget.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deleteBudget}>
                                    Delete
                                </Button>
                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li><strong>Yearly Budget:</strong> {budget.yearlyBudget}</li>
                            <li><strong>Monthly Budget:</strong> {budget.monthlyBudget}</li>
                            <li><strong>Fiscal Year:</strong> {budget.fiscalYear}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
