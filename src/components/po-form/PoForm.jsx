import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../index"; // Adjust import to your actual button component
import service from "../../appwrite/config"; // Adjusted to use your service
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Input = React.forwardRef(({ label, id, onInput, ...props }, ref) => (
    <div className="mb-4">
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} {...props} onInput={onInput} className="border p-2 w-full" />
    </div>
));

const PoForm = ({ postId }) => {
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            item: "",
            vendor: "",
            quantity: "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [itemSuggestions, setItemSuggestions] = useState([]);
    const [vendorSuggestions, setVendorSuggestions] = useState([]);

    const submit = async (data) => {
        try {
            const poData = {
                ...data,
                userId: userData?.$id,
                postId: postId,
            };

            const poResponse = await service.createPurchaseOrder(poData);
            if (poResponse) {
                navigate(`/purchase-orders/${poResponse.$id}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const fetchItemSuggestions = async (input) => {
        if (!input) {
            setItemSuggestions([]);
            return;
        }
        try {
            const results = await service.searchItems(input);

            if (results && Array.isArray(results.documents)) {
                setItemSuggestions(results.documents.map((item) => item.name));
            } else {
                console.warn("Unexpected format from searchItems response:", results);
                setItemSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching item suggestions:", error);
            setItemSuggestions([]);
        }
    };

    const fetchVendorSuggestions = async (input) => {
        if (!input) {
            setVendorSuggestions([]);
            return;
        }
        try {
            const results = await service.searchVendors(input);

            if (results && Array.isArray(results.documents)) {
                setVendorSuggestions(results.documents.map((vendor) => vendor.name));
            } else {
                console.warn("Unexpected format from searchVendors response:", results);
                setVendorSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching vendor suggestions:", error);
            setVendorSuggestions([]);
        }
    };

    const handleItemInputChange = (e) => {
        const inputValue = e.currentTarget.value;
        setValue("item", inputValue, { shouldValidate: true });
        fetchItemSuggestions(inputValue);
    };

    const handleVendorInputChange = (e) => {
        const inputValue = e.currentTarget.value;
        setValue("vendor", inputValue, { shouldValidate: true });
        fetchVendorSuggestions(inputValue);
    };

    const handleItemSuggestionClick = (item) => {
        setValue("item", item, { shouldValidate: true });
        setItemSuggestions([]);
    };

    const handleVendorSuggestionClick = (vendor) => {
        setValue("vendor", vendor, { shouldValidate: true });
        setVendorSuggestions([]);
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col">
                <Input
                    label="Item:"
                    id="item"
                    placeholder="Enter item"
                    {...register("item", { required: true })}
                    onInput={handleItemInputChange}
                />
                {itemSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {itemSuggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleItemSuggestionClick(item)}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                <Input
                    label="Vendor:"
                    id="vendor"
                    placeholder="Enter vendor"
                    {...register("vendor", { required: true })}
                    onInput={handleVendorInputChange}
                />
                {vendorSuggestions.length > 0 && (
                    <ul className="absolute bg-white border border-gray-300 w-full z-10">
                        {vendorSuggestions.map((vendor, index) => (
                            <li
                                key={index}
                                onClick={() => handleVendorSuggestionClick(vendor)}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                            >
                                {vendor}
                            </li>
                        ))}
                    </ul>
                )}

                <Input
                    label="Quantity:"
                    id="quantity"
                    placeholder="Enter quantity"
                    {...register("quantity", { required: true })}
                />

                <Button type="submit" className="w-full bg-green-500 mt-4">
                    Submit
                </Button>
            </div>
        </form>
    );
};

export default PoForm;
