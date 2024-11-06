import React, { useCallback, useEffect, useState } from "react"; 
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

export default function ProcureForm({ postId }) {
    const { register, handleSubmit, watch, setValue, control } = useForm();
    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [suggestions, setSuggestions] = useState([]);
    const [budgetAmount, setBudgetAmount] = useState("");
    const [quantityMessage, setQuantityMessage] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const [sourceLocation, setSourceLocation] = useState("");

    const submit = async (data) => {
        try {
            const entries = data.items.map(item => ({
                Item: item.Item,
                Quantity: item.Quantity,
                BudgetAmount: item.BudgetAmount,
            }));
            const dbProcure = await service.createProcure({
                Items: entries,
                securelocation: sourceLocation,
                timestamp: new Date(),
                userId: userData?.$id,
                postId: postId,
            });

            if (dbProcure) {
                navigate(`/procure/${dbProcure.$id}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const fetchItemDetails = async (item, index) => {
        if (!item) return;

        try {
            const results = await service.searchItems(item);
            if (results.length > 0) {
                const { Quantity, Location, Head } = results[0];
                setQuantityMessage(`Available: ${Quantity}`);
                setLocationMessage(`Location: ${Location}`);
                setValue(`items.${index}.Location`, Location);

                // Fetch the budget amount from the associated head
                const headResults = await service.getHeads([Head]);
                if (headResults.length > 0) {
                    const { Budgetamount } = headResults[0];
                    setValue(`items.${index}.Budgteamount`, Budgetamount);
                    setBudgetAmount(`Budget: ${Budgetamount}`);
                }
            } else {
                setQuantityMessage("Not Available");
                setLocationMessage("Not Available");
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    };

    const handleSuggestionClick = async (item, index) => {
        setSuggestions([]);
        await setValue(`items.${index}.Item`, item, { shouldValidate: true });
        fetchItemDetails(item, index);
    };

    const handleInputChange = async (e, index) => {
        const inputValue = e.currentTarget.value;
        setValue(`items.${index}.Item`, inputValue, { shouldValidate: true });

        if (inputValue) {
            const results = await service.searchItems(inputValue);
            if (results && Array.isArray(results)) {
                setSuggestions(results.map((result) => result.Item));
            } else {
                setSuggestions([]);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-col items-center min-h-screen">
            <div className="w-2/3">
                <div className="mb-4">
                    <label>Source Location:</label>
                    <input
                        type="text"
                        value={sourceLocation}
                        onChange={(e) => setSourceLocation(e.target.value)}
                        placeholder="Enter Source Location"
                        className="border p-2 w-full"
                    />
                </div>

                {fields.map((item, index) => (
                    <div key={item.id} className="border p-4 mb-4">
                        <Input
                            label="Item:"
                            id={`item-${index}`}
                            placeholder="Item"
                            {...register(`items.${index}.Item`, { required: true })}
                            onInput={(e) => handleInputChange(e, index)}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute bg-white border border-gray-300 w-full z-10">
                                {suggestions.map((suggestion, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSuggestionClick(suggestion, index)}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                    >
                                        {suggestion}
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
                            id={`quantity-${index}`}
                            placeholder="Quantity"
                            type="number"
                            {...register(`items.${index}.Quantity`, { required: true })}
                        />
                        <div className="mb-4">
                            <span>{budgetAmount}</span>
                        </div>
                        <Button type="button" onClick={() => remove(index)} className="mt-2 bg-red-500">
                            Remove Item
                        </Button>
                    </div>
                ))}

                <Button type="button" onClick={() => append({ Item: "", Quantity: "", BudgetAmount: "" })}>
                    Add Another Item
                </Button>
            </div>
            
            <Button type="submit" className="w-1/3 bg-green-500 mt-4">
                Submit
            </Button>
        </form>
    );
}
