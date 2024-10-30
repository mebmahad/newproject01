import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "..";
import { getLocationsByLocation } from "../../appwrite/confi"; // Adjust according to actual service import
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";

export default function ItemForm({ item }) {
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            id: item?.$id || uuidv4(),
            Item: item?.Item || "",
            Head: item?.Head || "",
            Price: item?.Price || "",
            Quantity: item?.Quantity || "",
            Location: item?.Location || "", // Set as empty initially
        },
    });

    const [locations, setLocations] = useState([]);
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    // Fetch locations from Appwrite
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const locationData = await getLocationsByLocation(); // Await to get the locations data
                setLocations(locationData); // Set only location names
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
                    disabled
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
                    type="number"
                    {...register("Price", { required: true })}
                />
                <Input
                    label="Quantity:"
                    placeholder="Quantity"
                    className="mb-4"
                    type="number"
                    {...register("Quantity", { required: true })}
                />
            </div>
            <div className="w-1/3 px-2">
                <label htmlFor="location" className="block mb-2">Location:</label>
                <select
                    id="location"
                    className="mb-4 border rounded p-2 w-full"
                    {...register("Location", { required: true })}
                    onChange={(e) => setValue("Location", e.target.value)}
                >
                    <option value="">Select a location</option>
                    {locations.map((location, index) => (
                        <option key={index} value={location}>
                            {location}
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
