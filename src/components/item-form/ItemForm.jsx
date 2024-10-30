import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid"; // Import uuid for unique id generation

export default function ItemForm({ item }) {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            id: item?.$id || uuidv4(), // Generate unique id if not provided
            Item: item?.Item || "",
            Head: item?.Head || "",
            Price: item?.Price || "",
            Quantity: item?.Quantity || "",
            Location: item?.Location || "active",
        },
    });

    const [locations, setLocations] = useState([]);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    // Fetch locations from Appwrite
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await service.getLocations(); // Adjust service method to fetch locations
                setLocations(response.documents || []);
            } catch (error) {
                console.error("Error fetching locations:", error);
            }
        };
        fetchLocations();
    }, []);

    const submit = async (data) => {
        try {
            let dbItem;

            if (item) {
                if (!item.$id) throw new Error("Item ID is not available");
                dbItem = await service.updateItem(item.$id, { ...data });
            } else {
                dbItem = await service.createItem({ ...data, userId: userData?.$id });
            }

            if (dbItem) {
                navigate(`/item/${dbItem.$id}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleAddLocation = () => {
        navigate("/add-location");
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Id :"
                    placeholder="Auto-generated ID"
                    className="mb-4"
                    {...register("id")}
                    disabled // Disable the id input field
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
                <label htmlFor="location" className="block mb-2">Location:</label>
                <select
                    id="location"
                    className="mb-4"
                    {...register("Location", { required: true })}
                    onChange={(e) => setValue("Location", e.target.value)}
                >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                        <option key={location.$id} value={location.name}>
                            {location.name}
                        </option>
                    ))}
                </select>
                
                <Button type="button" onClick={handleAddLocation} className="mb-4">
                    Add Location
                </Button>

                <Button type="submit" bgColor={item ? "bg-green-500" : undefined} className="w-full">
                    {item ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
