import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onChange, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm md:text-base font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            ref={ref}
            id={id}
            {...props}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
        />
    </div>
));

export default function ProcureForm({ procure }) {
    const { register, handleSubmit, setValue, watch, resetField } = useForm();
    const [items, setItems] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [quantityMessage, setQuantityMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [mergedComplaints, setMergedComplaints] = useState([]);
    
    
    const navigate = useNavigate();
    const { state } = useLocation();
    const complaintIds = state?.complaintIds || [];
    const location = useLocation();
    const userData = useSelector((state) => state.auth.userData);
    const isEditMode = !!procure;

    // Fetch complaint details
    useEffect(() => {
        const fetchComplaints = async () => {
            if (complaintIds.length > 0) {
                try {
                    const complaints = await Promise.all(
                        complaintIds.map(id => service.getPost(id))
                    );
                    setMergedComplaints(complaints.filter(c => c !== null));
                } catch (error) {
                    console.error("Failed to fetch complaints:", error);
                }
            }
        };
        fetchComplaints();
    }, [complaintIds]);

    // Rest of your existing item handling functions
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setValue("Item", inputValue, { shouldValidate: true });
        fetchSuggestions(inputValue);
    };

    const fetchSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const results = await service.searchItems(input);
            setSuggestions(results.map(item => item.Item) || []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (item) => {
        setSuggestions([]);
        setValue("Item", item, { shouldValidate: true });
        fetchQuantityAndLocation(item);
    };

    const fetchQuantityAndLocation = async (itemName) => {
        if (!itemName) return;

        try {
            const results = await service.searchItems(itemName);
            if (results.length > 0) {
                const { Quantity, Location, Head } = results[0];
                setQuantityMessage(Quantity ? `Available: ${Quantity}` : "Not Available");
                setLocationMessage(Location ? `Location: ${Location}` : "Not Available");

                if (Head) {
                    const headData = await service.searchHead(Head);
                    setBudgetAmount(headData[0]?.BudgetAmount || "Not available");
                } else {
                    setBudgetAmount("Not available");
                }
            } else {
                setQuantityMessage("Not Available");
                setLocationMessage("Not Available");
                setBudgetAmount("Not Available");
            }
        } catch (error) {
            console.error("Error fetching item data:", error);
            setQuantityMessage("Not Available");
            setLocationMessage("Not Available");
            setBudgetAmount("Not Available");
        }
    };

    const addItem = () => {
        const newItem = watch("Item");
        const newQuantity = watch("Quantity");
        
        if (!newItem || !newQuantity) {
            alert("Please fill both Item and Quantity fields before adding");
            return;
        }

        const itemData = {
            id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            Item: newItem,
            Quantity: newQuantity,
            BudgetAmount: budgetAmount || "Not Available",
            isNew: quantityMessage === "Not Available",
        };

        setItems(prev => [...prev, itemData]);
        resetField("Item");
        resetField("Quantity");
        setBudgetAmount("");
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const onSubmit = async (data) => {
        try {
            if (items.length === 0) {
                alert("Please add at least one item to the procurement");
                return;
            }

            console.log("Submitting with complaint IDs:", complaintIds);

            const procureData = {
                Items: JSON.stringify(items),
                userId: userData?.$id,
                status: "active",
                complaintIds: JSON.stringify(complaintIds)
            };

            const dbProcure = await service.createProcure({
                Items: JSON.stringify(items),
                userId: userData?.$id,
                status: "active",
                complaintIds: complaintIds
            });
            
            if (dbProcure) {
                // Update associated complaint statuses
                try {
                    await Promise.all(complaintIds.map(async (complaintId) => {
                        await service.updatePost(complaintId, {
                            status: "In Procure"
                        });
                    }));
                } catch (error) {
                    console.error("Error updating complaint statuses:", error);
                }

                localStorage.setItem('currentProcureId', dbProcure.$id);
                navigate(`/procure/${dbProcure.$id}`);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert(`Creation failed: ${error.message}`);
        }
    };

    // Keep your existing JSX return statement
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                    {isEditMode ? "Edit Procurement" : "Create New Procurement"}
                </h2>

                {mergedComplaints.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Linked Requests</h3>
                        {mergedComplaints.map((post, index) => (
                            <div key={post.$id} className="mb-3 p-3 bg-white rounded shadow-sm">
                                <p className="font-medium">#{index + 1}: {post.problem}</p>
                                <p className="text-sm text-gray-600">ID: {post.$id}</p>
                                <p className="text-sm text-gray-600">{post.areas} - {post.subarea}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <div className="relative">
                        <Input
                            label="Item:"
                            id="item"
                            placeholder="Search for an item"
                            {...register("Item", { required: true })}
                            onChange={handleInputChange}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {suggestions.map((item, index) => (
                                    <li
                                        key={index}
                                        onClick={() => handleSuggestionClick(item)}
                                        className="px-4 py-2 text-sm hover:bg-indigo-50 cursor-pointer"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-gray-600 mb-2">
                        <span className="bg-gray-100 p-2 rounded">{quantityMessage}</span>
                        <span className="bg-gray-100 p-2 rounded">{locationMessage}</span>
                    </div>

                    <div className="text-sm md:text-base bg-gray-100 p-2 rounded mb-2">
                        <span className="font-medium">Budget Amount:</span> {budgetAmount}
                    </div>

                    <Input
                        label="Quantity:"
                        id="quantity"
                        placeholder="Enter quantity"
                        {...register("Quantity", { required: true })}
                    />

                    <Button
                        type="button"
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm md:text-base"
                        onClick={addItem}
                    >
                        Add Item
                    </Button>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600">
                            <tr>
                                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Item</th>
                                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Budget</th>
                                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-white uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-50">
                                    <td className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap text-sm">
                                        {item.Item}
                                        {item.isNew && <span className="ml-1 text-xs text-red-500">(New)</span>}
                                    </td>
                                    <td className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap text-sm">{item.Quantity}</td>
                                    <td className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap text-sm">{item.BudgetAmount}</td>
                                    <td className="px-4 py-2 md:px-6 md:py-3 whitespace-nowrap text-sm">
                                        <Button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 md:py-2 md:px-4 rounded text-xs md:text-sm"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            Remove
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Button
                        type="submit"
                        bgColor="bg-green-500"
                        className="w-full"
                    >
                        {isEditMode ? "Update Procurement" : "Create Procurement"}
                    </Button>
                </div>
            </div>
        </form>
    );
}