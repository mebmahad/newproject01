import React, { useEffect, useState } from "react";
import { Container, BudgetCard } from "../components";
import budgetservice from "../appwrite/budgetConfig";
import { useNavigate } from "react-router-dom";

const AllBudgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state
    const navigate = useNavigate();

    const handleItemClick = () => {
        // Define your logic here, for example:
        navigate('/add-budget'); // Redirect to the AddItem page
    };
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await budgetservice.getBudgets(); // Remove queries if not defined
    
                console.log("Fetched Budget response:", response); // Log the response for debugging
    
                if (response && response.documents) {
                    setBudgets(response.documents); // Set Items if response contains documents
                } else {
                    setBudgets([]); // Set to empty array if no documents
                }
            } catch (error) {
                setError("Failed to fetch Budgets."); // Set error message
                setBudgets([]); // Fallback to empty array on error
            } finally {
                setLoading(false); // Set loading to false regardless of success or error
            }
        };
    
        fetchBudgets();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    if (error) {
        return <div>{error}</div>; // Show error message
    }

    return (
        <Container>
            <div className="flex gap-4">
                {/* Budgets Section */}
                <div className="w-3/4">
                    <h2 className="text-lg font-bold mb-2">Budgets</h2>
                    <div>
                    <button className="bg-green-500" onClick={handleItemClick}>
                                    Add Budget
                                </button>
                    </div>
                    <div className="space-y-4">
                        {budgets.map((budget) => (
                            <div key={budget.$id}>
                                <BudgetCard 
                                    {...budget} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AllBudgets;
