import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLocation } from 'react-router-dom';

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

const generateUniqueId = `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function ProcureForm({ procure }) {
    const { postId } = useParams();
    const { register, handleSubmit, setValue, resetField, watch } = useForm({
        defaultValues: {
            Items: procure?.Items || "",
            postId: procure?.postId || postId || "",
            status: procure?.status || "active",
            id: procure?.$id || generateUniqueId,
        },
    });
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const [suggestions, setSuggestions] = useState([]);
    const [quantityMessage, setQuantityMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [budgetAmount, setBudgetAmount] = useState("");
    const [items, setItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (procure) {
            setIsEditMode(true);
            setValue("Item", procure.Item || "");
            setValue("Quantity", procure.Quantity || "");
            const parsedItems = Array.isArray(procure.Items) ? procure.Items : JSON.parse(procure.Items || '[]');
            setItems(parsedItems);
        }
    }, [procure, setValue]);

    const submit = async (data) => {
        const itemsString = JSON.stringify(items);
        const status = "active";

        try {
            let dbProcure;
            if (isEditMode) {
                if (!procure.$id) throw new Error("Procure ID not available for update");
                dbProcure = await service.updateProcure(procure.$id, {
                    ...data,
                    userId: userData?.$id,
                    postId: postId,
                    Items: itemsString,
                    status: status,
                });
            } else {
                // Create the procurement first
                dbProcure = await service.createProcure({
                    ...data,
                    userId: userData?.$id,
                    postId: postId,
                    Items: itemsString,
                    status: status,
                });

                // Then update all linked complaints
                if (location.state?.mergeMode && location.state.complaintIds) {
                    await Promise.all(
                        location.state.complaintIds.map(id => 
                            service.updatePost(id, { status: "In Procure" })
                        )
                    );
                } else if (postId) {
                    await service.updatePost(postId, { status: "In Procure" });
                }
            }

            if (dbProcure) navigate(`/procure/${dbProcure.$id}`);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

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
                // Existing item
                const { Quantity, Location, Head } = results[0];
                setQuantityMessage(`Available: ${Quantity}`);
                setLocationMessage(`Location: ${Location}`);

                const headData = await service.searchHead(Head);
                setBudgetAmount(headData.length > 0 ? headData[0].BudgetAmount : "Not available");
            } else {
                // New item
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
        const itemData = {
            id: generateUniqueId,
            Item: newItem,
            Quantity: watch("Quantity"),
            BudgetAmount: budgetAmount || "Not Available",
            isNew: quantityMessage === "Not Available",
        };

        setItems([...items, itemData]);
        resetField("Item");
        resetField("Quantity");
        setBudgetAmount("");
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const location = useLocation();
    const [mergedComplaints, setMergedComplaints] = useState([]);
    
    useEffect(() => {
        if (location.state?.mergeMode && location.state.complaintIds) {
            fetchMergedComplaints(location.state.complaintIds);
        }
    }, [location]);

    const fetchMergedComplaints = async (ids) => {
        try {
            const complaints = await Promise.all(
                ids.map(id => service.getPost(id))
            );
            setMergedComplaints(complaints.filter(c => c));
        } catch (error) {
            console.error("Error fetching complaints:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="min-h-screen bg-gray-50 py-4 md:py-8 px-4">
            <div className="max-w-2xl mx-auto bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                    {isEditMode ? "Edit Procurement" : "Create New Procurement"}
                </h2>

                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <Input
                        label="Procure ID:"
                        id="id"
                        placeholder="Procurement ID"
                        value={generateUniqueId}
                        {...register("id", { required: true })}
                        disabled
                    />

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

                <Button
                    type="submit"
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition-colors text-sm md:text-base"
                >
                    {isEditMode ? "Update Procurement" : "Create Procurement"}
                </Button>
            </div>
        </form>
    );
}
