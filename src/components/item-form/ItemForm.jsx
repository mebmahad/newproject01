import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input} from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ItemForm({ item }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            Item: item?.Item || "",
            Head: item?.Head || "",
            Price: item?.Price || "",
            Quantity: item?.Quantity || "",
            Location: item?.Location || "active",
            id: item?.$id || "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            let dbItem;

            if (item) {
                // Check if post is defined before accessing $id
                if (!item.$id) {
                    throw new Error("Item ID is not available");
                }
                dbItem = await service.updateItem(item.$id, {
                    ...data,
                });
            } else {
                dbItem = await service.createItem({ ...data, userId: userData?.$id });
            }

            if (dbItem) {
                navigate(`/item/${dbItem.$id}`); // Navigate to the specific post
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
    const idTransfrorm = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "Location") {
                setValue("id", idTransfrorm(value.Location), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, idTransfrorm, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Id :"
                    placeholder="id"
                    className="mb-4"
                    {...register("id", { required: true })}
                    onInput={(e) => {
                        setValue("id", idTransfrorm(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <Input
                    label="Item:"
                    placeholder="Item"
                    className="mb-4"
                    {...register("Item", { required: true })}
                />
                <Input
                    label="Head:"
                    placeholder="Head"
                    className="mb-4"
                    {...register("Head", { required: true })}
                />
                <Input
                    label="Price:"
                    placeholder="Price"
                    className="mb-4"
                    {...register("Price", { required: true })}
                />
                <Input
                    label="Quantity:"
                    placeholder="Quantity"
                    className="mb-4"
                    {...register("Quantity", { required: true })}
                />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Location:"
                    placeholder="Location"
                    className="mb-4"
                    {...register("Location", { required: true })}
                />
                <Button type="submit" bgColor={item ? "bg-green-500" : undefined} className="w-full">
                    {item ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
