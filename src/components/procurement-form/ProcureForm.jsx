import React, { useCallback, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "../index"; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your service
import { useNavigate } from "react-router-dom";
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

export default function ProcureForm({ postId }) {
    const { register, handleSubmit, control, watch, setValue } = useForm({
        defaultValues: {
            items: [{ itemName: "", quantity: "", id: generateUniqueId() }]
        },
    });
    const { fields, append } = useFieldArray({
        control,
        name: "items"
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [budgetAmount, setBudgetAmount] = useState(null);
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

    const handleInputChange = (itemName) => {
        fetchQuantityAndLocation(itemName);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Procurement Form</h2>
                
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 mb-4 border rounded shadow-sm">
                        <Input
                            label={`Item ${index + 1}:`}
                            id={`item-${index}`}
                            placeholder="Enter Item Name"
                            {...register(`items.${index}.itemName`, {
                                required: true,
                                onChange: (e) => handleInputChange(e.target.value)
                            })}
                        />
                        <div className="flex justify-between mb-4">
                            <span>{quantityMessage}</span>
                            <span>{locationMessage}</span>
                        </div>
                        <div className="mb-4">
                            <label>Quantity:</label>
                            <input
                                type="number"
                                placeholder="Quantity"
                                className="border p-2 w-full"
                                {...register(`items.${index}.quantity`, { required: true })}
                            />
                        </div>
                    </div>
                ))}

                <div className="mb-4">
                    <span className="font-semibold">Budget Amount: </span>
                    <span>{budgetAmount || "Not available"}</span>
                </div>

                <Button type="button" onClick={() => append({ itemName: "", quantity: "", id: generateUniqueId() })} className="mb-4">
                    Add Another Item
                </Button>

                <Button type="submit" className="w-full bg-green-500">
                    Submit
                </Button>
            </div>
        </form>
    );
}
