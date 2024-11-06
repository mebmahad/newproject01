import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index";
import service from "../../appwrite/config"; // Service to fetch heads and items
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
    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            Item: "",
            Quantity: "",
            id: generateUniqueId(),
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [suggestions, setSuggestions] = useState([]);
    const [budgetAmount, setBudgetAmount] = useState("");
    const [selectedHead, setSelectedHead] = useState("");

    const submit = async (data) => {
        try {
            const dbProcure = await service.createProcure({ 
                ...data, 
                userId: userData?.$id,
                postId: postId 
            });
            if (dbProcure) {
                navigate(`/procure/${dbProcure.$id}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "Head") {
                fetchHeadSuggestions(value.Head);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const fetchHeadSuggestions = async (input) => {
        if (!input) {
            setSuggestions([]);
            return;
        }
        try {
            const heads = await service.searchHead(input);
            setSuggestions(heads.map(head => ({ name: head.Headname, budget: head.Budgteamount })));
        } catch (error) {
            console.error("Error fetching head suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleHeadSelection = (head) => {
        setSelectedHead(head.name);
        setBudgetAmount(head.budget);
        setSuggestions([]);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-col justify-center items-center min-h-screen">
            <div className="flex flex-col">
                <Input
                    label="Id:"
                    id="id"
                    placeholder="Auto-generated ID"
                    {...register("id", { required: true })}
                    disabled
                />
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Item"
                    {...register("Item", { required: true })}
                />
                <Input
                    label="Head:"
                    id="head"
                    placeholder="Enter Head"
                    {...register("Head", { required: true })}
                    onInput={(e) => fetchHeadSuggestions(e.target.value)}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {suggestions.map((head, index) => (
                            <li
                                key={index}
                                onClick={() => handleHeadSelection(head)}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {head.name}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mb-4">
                    <span>Budget Amount: {budgetAmount || "N/A"}</span>
                </div>
                <Input
                    label="Quantity:"
                    id="quantity"
                    placeholder="Enter quantity"
                    {...register("Quantity", { required: true })}
                />
                <Button type="submit" className="w-full bg-green-500 mt-4">
                    Submit
                </Button>
            </div>
        </form>
    );
}
