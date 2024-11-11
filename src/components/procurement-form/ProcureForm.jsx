import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index"; 
import service from "../../appwrite/config"; 
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

const generateUniqueId = () => {
    return `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export default function ProcureForm({procure}) {
    const { id } = useParams(); // Extract procureId from the URL
    const { register, handleSubmit, setValue, resetField, watch } = useForm();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const [suggestions, setSuggestions] = useState([]);
    const [quantityMessage, setQuantityMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [budgetAmount, setBudgetAmount] = useState(""); 
    const [items, setItems] = useState([]); 
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProcureData(id);
        }
    }, [id]);

    const fetchProcureData = async (procure) => {
        try {
            const procureData = await service.getProcure(procure); // Fetch the procure data from Appwrite
            if (procureData) {
                setIsEditMode(true);
                setValue("Item", ""); // Clear individual fields
                setValue("Quantity", "");
                setValue("status", procureData.status || "active");
                setItems(JSON.parse(procureData.Items)); // Populate the items list with existing items
            }
        } catch (error) {
            console.error("Error fetching procure data:", error);
        }
    };

    const submit = async (data) => {
        console.log("Form submitted:", data); // Log the form data to confirm submission
        const itemsString = JSON.stringify(items); // Convert items list to JSON string
        const status = "active";
    
        try {
            let dbProcure;
    
            if (procure) {
                console.log("Updating existing procure:", data.procure);
                // Update the existing procurement record
                dbProcure = await service.updateProcure(data.procure, {
                    ...data,
                    userId: userData?.$id,
                    postId: id, // Use postId from useParams
                    Items: itemsString,
                    status: status,
                });
            } else {
                console.log("Creating new procure");
                // Create a new procurement record
                dbProcure = await service.createProcure({
                    ...data,
                    userId: userData?.$id,
                    postId: id, // Use postId from useParams
                    Items: itemsString,
                    status: status,
                });
    
                // Update the post status if it's a new procure
                await service.updatePost(id, { status: "In Procure" });
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

    const handleInputChange = (e) => {
        const inputValue = e.currentTarget.value;
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
            setSuggestions(Array.isArray(results) ? results.map(item => item.Item) : []);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = async (item) => {
        setSuggestions([]);
        await setValue("Item", item, { shouldValidate: true });
        fetchQuantityAndLocation(item); 
    };

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

    const addItem = () => {
        const itemData = {
            id: generateUniqueId(),
            Item: watch("Item"),
            Quantity: watch("Quantity"),
            BudgetAmount: budgetAmount,
        };
        setItems([...items, itemData]);
        resetField("Item");
        resetField("Quantity");
        setBudgetAmount("");
    };

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
                    value={id}
                    disabled
                />
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Item"
                    className="mb-4"
                    {...register("Item", { required: true })}
                    onInput={handleInputChange} 
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
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
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

                <Button type="submit" bgColor={procure ? "bg-green-500" : undefined} className="w-full">
                {procure ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
