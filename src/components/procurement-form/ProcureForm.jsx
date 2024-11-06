import React, { useCallback, useEffect, useState } from "react"; 
import { useForm } from "react-hook-form";
import { Button } from "../index"; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Helper component for input fields
const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

// Function to generate a unique ID for items
const generateUniqueId = () => {
    return `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export default function ProcureForm({ postId }) {
    const { register, handleSubmit, watch, setValue, resetField } = useForm({
        defaultValues: {
            Item: "",
            Quantity: "",
            id: generateUniqueId(),
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [suggestions, setSuggestions] = useState([]);
    const [quantityMessage, setQuantityMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [budgetAmount, setBudgetAmount] = useState(""); // Store budget amount for each item
    const [items, setItems] = useState([]); // Store the list of items added by the user

    const submit = async (data) => {
        try {
            const dbProcure = await service.createProcure({ 
                ...data, 
                userId: userData?.$id,
                postId: postId,
                items // Include the list of items added by the user
            });

            if (dbProcure) {
                navigate(`/procure/${dbProcure.$id}`); 
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // Handle input changes and search for matching item
    const handleInputChange = (e) => {
        const inputValue = e.currentTarget.value;
        setValue("Item", inputValue, { shouldValidate: true });
        fetchSuggestions(inputValue); // Fetch suggestions on input change
    };

    // Fetch suggestions for item names based on user input
    const fetchSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const results = await service.searchItems(input);
            if (Array.isArray(results)) {
                setSuggestions(results.map(item => item.Item)); 
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    // Handle the suggestion click and populate the item input
    const handleSuggestionClick = async (item) => {
        setSuggestions([]); // Clear suggestions immediately
        await setValue("Item", item, { shouldValidate: true }); // Ensure validation and update state
        fetchQuantityAndLocation(item); // Fetch item details and associated head data
    };

    // Fetch quantity, location, and budget amount for the selected item
    const fetchQuantityAndLocation = async (itemName) => {
        if (!itemName) return;
        try {
            const results = await service.searchItems(itemName);
            if (results.length > 0) {
                const { Quantity, Location, Head } = results[0];
                setQuantityMessage(`Available: ${Quantity}`);
                setLocationMessage(`Location: ${Location}`);

                // Fetch the budget amount of the associated Head
                const headData = await service.searchHead(Head);
                if (headData.length > 0) {
                    setBudgetAmount(headData[0].Budgteamount);
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

    // Add item to the list of items
    const addItem = () => {
        const itemData = {
            id: generateUniqueId(),
            Item: watch("Item"),
            Quantity: watch("Quantity"),
            BudgetAmount: budgetAmount,
        };
        setItems([...items, itemData]); // Add item to the list
        resetField("Item");
        resetField("Quantity");
        setBudgetAmount(""); // Reset budget amount for the next item
    };

    // Remove an item from the list
    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col">
                <Input
                    label="Id:"
                    id="id"
                    placeholder="id"
                    className="mb-4"
                    {...register("id", { required: true })}
                    disabled
                />
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Item"
                    className="mb-4"
                    {...register("Item", { required: true })}
                    onInput={handleInputChange} // Use the new handler
                />
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(item)} // Fetch correct item on click
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mb-4 flex justify-between">
                    <span>{quantityMessage}</span>
                    <span>{locationMessage}</span>
                </div>
                <div className="mb-4 flex justify-between">
                    <span>Budget Amount: {budgetAmount}</span>
                </div>
                <Input
                    label="Quantity:"
                    id="quantity"
                    placeholder="Quantity"
                    className="mb-4"
                    {...register("Quantity", { required: true })}
                />
                <Button type="button" className="w-full bg-blue-500 mb-4" onClick={addItem}>
                    Add Item
                </Button>

                <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Item</th>
                                <th className="px-4 py-2">Quantity</th>
                                <th className="px-4 py-2">Budget Amount</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2">{item.Item}</td>
                                    <td className="px-4 py-2">{item.Quantity}</td>
                                    <td className="px-4 py-2">{item.BudgetAmount}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Button type="submit" className="w-full bg-green-500 mt-4">
                    Submit
                </Button>
            </div>
        </form>
    );
}
