import React, {useCallback} from "react";
import { useForm } from "react-hook-form";
import { Button, Input} from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function VendorForm({ vendor }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            Name: vendor?.Name || "",
            Address: vendor?.Address || "",
            GSTNo: vendor?.GSTNo || "",
            id: vendor?.$id || "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            let dbVendor;

            if (vendor) {
                // Check if post is defined before accessing $id
                if (!vendor.$id) {
                    throw new Error("Vendor ID is not available");
                }
                dbVendor = await service.updateVendor(vendor.$id, {
                    ...data,
                });
            } else {
                dbVendor = await service.createVendor({ ...data, userId: userData?.$id });
            }

            if (dbVendor) {
                navigate(`/vendor/${dbVendor.$id}`); // Navigate to the specific post
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
            if (name === "Name") {
                setValue("id", idTransfrorm(value.Name), { shouldValidate: true });
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
                    label="Name:"
                    placeholder="Name"
                    className="mb-4"
                    {...register("Name", { required: true })}
                />
                <Input
                    label="Address:"
                    placeholder="Address"
                    className="mb-4"
                    {...register("Address", { required: true })}
                />
                <Input
                    label="GSTNo:"
                    placeholder="GSTNo"
                    className="mb-4"
                    {...register("GSTNo", { required: true })}
                />
                <Button type="submit" bgColor={vendor ? "bg-green-500" : undefined} className="w-full">
                    {vendor ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
