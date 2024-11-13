import React, { useEffect, useState } from 'react';
import { Container, BudgetForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditBudget() {
    const [budget, setBudget] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchBudget = async () => {
            if (id) {
                try {
                    const budget = await service.getBudget(id);
                    if (budget) {
                        // Check if the user is the author
                        if (budget.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setBudget(budget);
                        }
                    } else {
                        navigate('/all-budgets'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch budget:", error);
                    navigate('/all-budgets'); // Redirect on error
                }
            } else {
                navigate('/all-budgets');
            }
        };

        fetchBudget();
    }, [id, navigate, userData]);

    return budget ? (
        <div className='py-8'>
            <Container>
                <BudgetForm budget={budget} />
            </Container>
        </div>
    ) : null;
}

export default EditBudget;
