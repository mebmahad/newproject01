import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { Input, Button } from "../index";
import service from "../../appwrite/config"; // Import your service correctly
import { Query } from "appwrite"; // Import Query if using Appwrite SDK

export default function ItemForm({ item }) {
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            id: item?.$id || uuidv4(),
            Item: item?.Item || "",
            Head: item?.Head || "",
            Price: item?.Price || "",
            Quantity: item?.Quantity || "",
            Location: item?.Location || ""
        }
    });

    const [locations, setLocations] = useState([]);
    const [heads, setHeads] = useState([]); // State for heads dropdown
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [filters, setFilters] = useState({ location: "" });

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const queries = [];
                if (filters.location) queries.push(Query.equal("location", filters.location));
                
                const response = await service.getLocations(queries);
                console.log("Fetched locations response:", response);

                if (response && response.documents) {
                    setLocations(response.documents);
                } else {
                    setLocations([]);
                }
            } catch (error) {
                console.error("Error fetching locations:", error);
                setLocations([]);
            }
        };

        const fetchHeads = async () => {
            try {
                const response = await service.getHeads();
                console.log("Fetched heads response:", response);

                if (response && response.documents) {
                    setHeads(response.documents);
                } else {
                    setHeads([]);
                }
            } catch (error) {
                console.error("Error fetching heads:", error);
                setHeads([]);
            }
        };

        fetchLocations();
        fetchHeads();
    }, [filters]);

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
                
                {/* Head Dropdown */}
                <label htmlFor="head" className="block mb-2">Head:</label>
                <select
                    id="head"
                    className="mb-4 border rounded p-2 w-full"
                    {...register("Head", { required: true })}
                    onChange={(e) => setValue("Head", e.target.value)}
                >
                    <option value="">Select a head</option>
                    {heads.map((head) => (
                        <option key={head.$id} value={head.name}>
                            {head.name}
                        </option>
                    ))}
                </select>

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
                    {locations.map((location) => (
                        <option key={location.$id} value={location.location}>
                            {location.location}
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
