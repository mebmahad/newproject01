import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Service from '../../appwrite/config';
import { useSelector } from "react-redux";

const BudgetForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [statusMessage, setStatusMessage] = React.useState('');
    const navigate = useNavigate(); // Initialize navigate
    const userData = useSelector((state) => state.auth.userData);

    const onSubmit = async (data) => {
        const yearlyBudget = parseInt(data.yearlyBudget);

        // Ensure yearlyBudget is positive
        if (isNaN(yearlyBudget) || yearlyBudget <= 0) {
            setStatusMessage("Please enter a valid yearly budget amount.");
            return;
        }

        const fiscalYearStart = new Date(`${new Date().getFullYear()}-04-01`);
        const fiscalYearEnd = new Date(`${new Date().getFullYear() + 1}-03-31`);
        const monthlyBudget = yearlyBudget / 12;
        const fiscalYear = `${fiscalYearStart.getFullYear()}-${fiscalYearEnd.getFullYear()}`;

        // Prepare data for submission
        const currentmonth = String(new Date().getFullYear());
        const budgetData = {
            yearlyBudget,
            monthlyBudget: parseInt(monthlyBudget),
            fiscalYear,
            startDate: fiscalYearStart.toISOString(),
            endDate: fiscalYearEnd.toISOString(),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: userData?.$id, // Replace with actual user ID if needed
            id: currentmonth, // Replace with a unique identifier if required
        };

        try {
            const response = await Service.createBudget(budgetData);
            setStatusMessage("Budget created successfully!");
            console.log("Created budget:", response);

            // Reset form
            reset();

            // Navigate to Budget View Page
            navigate(`/budget/${budgetData.id}`);// Replace '/budget-view' with your actual route
        } catch (error) {
            console.error("Error creating budget:", error);
            setStatusMessage("Failed to create budget. Please try again.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Enter Yearly Budget</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="yearlyBudget" className="block text-gray-700">Yearly Budget Amount</label>
                    <input
                        type="number"
                        id="yearlyBudget"
                        {...register("yearlyBudget", {
                            required: "Yearly budget is required",
                            min: { value: 1, message: "Budget must be a positive number" }
                        })}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter yearly budget (e.g., 120000)"
                    />
                    {errors.yearlyBudget && (
                        <p className="text-red-500 text-sm">{errors.yearlyBudget.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                >
                    Save Budget
                </button>
            </form>
            {statusMessage && (
                <p className="mt-4 text-center text-gray-700">{statusMessage}</p>
            )}
        </div>
    );
};

export default BudgetForm;
