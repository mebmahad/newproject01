import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onChange, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onChange={onChange} className="border p-2 w-full" />
    </div>
));
const generateUniqueId = `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`

export default function ProcureForm({ procure }) {
    const { postId } = useParams(); // Extract procureId and postId from the URL
    const { register, handleSubmit, setValue, resetField, watch } = useForm({
        defaultValues: {
            Items: procure?.Items || "",
            postId: procure?.postId || postId || "",  // Use postId from URL if available
            status: procure?.status || "active",
            id: procure?.$id || `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Generate random unique ID
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

    // Fetch procure data if id exists
    useEffect(() => {
        if (procure) {
            setIsEditMode(true);
            setValue("Item", procure.Item || "");
            setValue("Quantity", procure.Quantity || "");
            setItems(procure.Items || []);
        }
    }, [procure, setValue]);

    // Submit the form for new or updated procure
    const submit = async (data) => {
        console.log("Form submitted:", data); // Log the form data to confirm submission
        const itemsString = JSON.stringify(items); // Convert items list to JSON string
        const status = "active";

        try {
            let dbProcure;
            if (isEditMode) {
                if (!procure.$id) {
                    throw new Error("Procure ID not available for update");
                }

                dbProcure = await service.updateProcure(procure.$id, {
                    ...data,
                    userId: userData?.$id,
                    postId: postId, // Use procureId as postId
                    Items: itemsString,
                    status: status,
                });
            } else {
                console.log("Creating new procure");
                // Create a new procurement record
                dbProcure = await service.createProcure({
                    ...data,
                    userId: userData?.$id,
                    postId: postId, // Use procureId as postId
                    Items: itemsString,
                    status: status,
                });

                // Update the post status after creating procure
                await service.updatePost(postId, { status: "In Procure" });
                console.log("Post status updated to 'In Procure'");
            }

            console.log("Database response:", dbProcure);

            // Navigate to the updated procure page
            if (dbProcure) {
                navigate(`/procure/${dbProcure.$id}`);
            } else {
                console.error("No response from database on submit");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // Handle input change for item search
    const handleInputChange = (e) => {
        const inputValue = e.target.value; // Use target to directly get the value
        setValue("Item", inputValue, { shouldValidate: true });
        fetchSuggestions(inputValue);
    };

    // Fetch suggestions for items from the API
    const fetchSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const results = await service.searchItems(input);
            setSuggestions(Array.isArray(results) ? results.map(item => item.Item) : []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    // Handle item suggestion click
    const handleSuggestionClick = async (item) => {
        setSuggestions([]);
        setValue("Item", item, { shouldValidate: true });
        fetchQuantityAndLocation(item);
    };

    // Fetch additional data (Quantity, Location, Budget Amount)
    const fetchQuantityAndLocation = async (itemName) => {
        if (!itemName) return;
        try {
            const results = await service.searchItems(itemName);
            if (results.length > 0) {
                const { Quantity, Location, Head } = results[0];
                setQuantityMessage(`Available: ${Quantity}`);
                setLocationMessage(`Location: ${Location}`);

                const headData = await service.searchHead(Head);
                setBudgetAmount(headData.length > 0 ? headData[0].Budgteamount : "Not available");
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

    // Add item to items list
    const addItem = () => {
        const itemData = {
            id: generateUniqueId,
            Item: watch("Item"),
            Quantity: watch("Quantity"),
            BudgetAmount: budgetAmount,
        };
        setItems([...items, itemData]);
        resetField("Item");
        resetField("Quantity");
        setBudgetAmount("");
    };

    // Remove item from items list
    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col">
                <Input
                    label="Procure Id:"
                    id="id"
                    placeholder="id"
                    className="mb-4"
                    value={generateUniqueId}
                    {...register("id", { required: true })}
                    disabled
                />
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Item"
                    className="mb-4"
                    {...register("Item", { required: true })}
                    onChange={handleInputChange}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(item)}
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
                                <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2">{item.Item}</td>
                                    <td className="px-4 py-2">{item.Quantity}</td>
                                    <td className="px-4 py-2">{item.BudgetAmount}</td>
                                    <td className="px-4 py-2">
                                        <Button
                                            type="button"
                                            className="bg-red-500"
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

                <div className="mt-4">
                    <Button type="submit" className="w-full bg-green-500">
                        {isEditMode ? "Update Procure" : "Create Procure"}
                    </Button>
                </div>
            </div>
        </form>
    );
}
