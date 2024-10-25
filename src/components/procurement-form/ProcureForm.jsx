import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index"; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

// Function to generate a unique ID
const generateUniqueId = () => {
    return `procure-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export default function ProcureForm({ postId }) {
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            Item: "",
            Quantity: "",
            id: generateUniqueId(), // Generate a unique id on form initialization
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [suggestions, setSuggestions] = useState([]);
    const [quantityMessage, setQuantityMessage] = useState(""); 
    const [locationMessage, setLocationMessage] = useState(""); 

    const submit = async (data) => {
        try {
            const dbProcure = await service.createProcure({ 
                ...data, 
                userId: userData?.$id,
                postId: postId // Include postId in the procurement request
            });

            if (dbProcure) {
                navigate(`/procure/${dbProcure.$id}`); 
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const idTransform = useCallback((value) => {
        if (value && typeof value === "string") {
            return value.trim().replace(/[^a-zA-Z\d\s]+/g, "-").replace(/\s/g, "-");
        }
        return "";
    }, []);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "Item") {
                setValue("id", idTransform(value.Item), { shouldValidate: true });
                fetchSuggestions(value.Item); 
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, idTransform, setValue]);

    const fetchQuantityAndLocation = async (item) => {
        if (!item) return;

        try {
            const results = await service.searchItems(item); 
            if (results.length > 0) {
                const { Quantity, Location } = results[0]; 
                setQuantityMessage(`Available: ${Quantity}`);
                setLocationMessage(`Location: ${Location}`);
            } else {
                setQuantityMessage("Not Available");
                setLocationMessage("Not Available");
            }
        } catch (error) {
            console.error("Error fetching item data:", error);
            setQuantityMessage("Not Available");
            setLocationMessage("Not Available");
        }
    };

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

    const handleSuggestionClick = async (item) => {
        setSuggestions([]); // Clear suggestions immediately
        await setValue("Item", item, { shouldValidate: true }); // Ensure validation and update state
        fetchQuantityAndLocation(item); // Fetch data for the selected item
    };

    const handleInputChange = (e) => {
        const inputValue = e.currentTarget.value;
        setValue("Item", inputValue, { shouldValidate: true });
        fetchSuggestions(inputValue); // Fetch suggestions on input change
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
                    disabled // Disable the input field for ID
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
                <Input
                    label="Quantity:"
                    id="quantity"
                    placeholder="Quantity"
                    className="mb-4"
                    {...register("Quantity", { required: true })}
                />
                <Button type="submit" className="w-full bg-green-500">
                    Submit
                </Button>
            </div>
        </form>
    );
}
