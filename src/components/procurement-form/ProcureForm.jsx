import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onChange, ...props }, ref) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-lg font-semibold text-gray-800 mb-2">
            {label}
        </label>
        <input
            ref={ref}
            id={id}
            {...props}
            onChange={onChange}
            className="border-2 border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
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
                dbProcure = await service.createProcure({
                    ...data,
                    userId: userData?.$id,
                    postId: postId,
                    Items: itemsString,
                    status: status,
                });

                await service.updatePost(postId, { status: "In Procure" });
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

    return (
        <form onSubmit={handleSubmit(submit)} className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
            <div className="flex flex-col w-4/5 max-w-2xl bg-white p-8 rounded-xl shadow-xl border border-gray-200">
                <Input
                    label="Procure Id:"
                    id="id"
                    placeholder="id"
                    className="mb-6"
                    value={generateUniqueId}
                    {...register("id", { required: true })}
                    disabled
                />
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Search for an item"
                    className="mb-6"
                    {...register("Item", { required: true })}
                    onChange={handleInputChange}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10 mt-1 rounded-md shadow-lg">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionClick(item)}
                                className="p-3 hover:bg-indigo-100 cursor-pointer transition duration-200 ease-in-out"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mb-6 flex justify-between text-sm text-gray-600">
                    <span>{quantityMessage}</span>
                    <span>{locationMessage}</span>
                </div>
                <div className="mb-6 flex justify-between text-sm text-gray-600">
                    <span>Budget Amount: {budgetAmount}</span>
                </div>
                <Input
                    label="Quantity:"
                    id="quantity"
                    placeholder="Enter quantity"
                    className="mb-6"
                    {...register("Quantity", { required: true })}
                />
                <Button
                    type="button"
                    className="w-full bg-indigo-600 text-white py-3 rounded-md mb-6 hover:bg-indigo-700 transition duration-300 ease-in-out"
                    onClick={addItem}
                >
                    Add Item
                </Button>

                <div className="overflow-x-auto mb-6">
                    <table className="table-auto w-full bg-gray-100 rounded-lg shadow-md">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="px-6 py-3 text-left">Item</th>
                                <th className="px-6 py-3 text-left">Quantity</th>
                                <th className="px-6 py-3 text-left">Budget Amount</th>
                                <th className="px-6 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="hover:bg-indigo-50 transition duration-200 ease-in-out">
                                    <td className="px-6 py-3">
                                        {item.Item}
                                        {item.isNew && <span className="text-xs text-red-500 ml-2">(New)</span>}
                                    </td>
                                    <td className="px-6 py-3">{item.Quantity}</td>
                                    <td className="px-6 py-3">{item.BudgetAmount}</td>
                                    <td className="px-6 py-3 text-center">
                                        <Button
                                            type="button"
                                            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300"
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
                    className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300"
                >
                    {isEditMode ? "Update Procure" : "Create Procure"}
                </Button>
            </div>
        </form>
    );
}
