import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from ".."; // Import necessary components
import service from "../../appwrite/config";
import { useNavigate } from "react-router-dom";

// Define main location options
const MAIN_LOCATIONS = [
    { id: "main1", name: "STORE" },
    { id: "main2", name: "EXTENDED STORE" },
    { id: "main3", name: "JAVED ROOM1" },
    { id: "main4", name: "JAVED ROOM2" },
    { id: "main5", name: "JAVED ROOM3" },
    { id: "main6", name: "JAVED ROOM4" },
    { id: "main7", name: "JAVED ROOM5" },
    { id: "main8", name: "JAVED ROOM6" },
    { id: "main9", name: "JAVED ROOM7" },
    { id: "main10", name: "JAVED ROOM8" },
    { id: "main11", name: "OLD STORE ROOM" },
    { id: "submain1", name: "NUZUL 11" },
    { id: "submain2", name: "TEHFEEZ ROOM" },
    { id: "submain3", name: "FF ELECTRIC ROOM" },
    { id: "submain4", name: "SF ELECTRIC ROOM" },
    { id: "submain6", name: "MANAZIL SOUTH STAIRWAYS" },
    { id: "submain7", name: "MANAZIL CENTRAL STAIRWAYS" },
    { id: "submain8", name: "GENERATOR SHADE" },
    { id: "submain9", name: "TRANSFORMER SIDE ROOM" },
    { id: "submain10", name: "SARKARI AWING HALL" },
    { id: "submain11", name: "GROUND TINSHADE" },
    
];

export default function LocationForm({ location }) {
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: {
            id: location?.$id || `location-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            location: location?.location || "",
            mainlocation: location?.mainlocation || "",
        },
    });

    const [formError, setFormError] = useState(null);
    const navigate = useNavigate();

    const submit = async (data) => {
        try {
            let dbLocation;
            if (location) {
                if (!location.$id) {
                    throw new Error("Location ID is not available");
                }
                dbLocation = await service.updateLocation(location.$id, { ...data });
            } else {
                dbLocation = await service.createLocation(data);
            }

            if (dbLocation) {
                navigate(`/location/${dbLocation.$id}`);
            }
        } catch (error) {
            console.error("Error creating location:", error);
            setFormError("There was an error saving the location. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap p-4">
            <div className="w-2/3 px-2">
                <Input
                    label="Id :"
                    placeholder="id"
                    className="mb-4"
                    {...register("id")}
                    readOnly // Make it read-only to prevent editing
                />
                <Input
                    label="Location Name:"
                    placeholder="Enter the location name"
                    {...register("location", { required: true })}
                    className="mb-4"
                />
            </div>
            <div className="w-1/3 px-2">
                <label htmlFor="mainlocation" className="block mb-2 font-medium">
                    Main Location:
                </label>
                <select
                    id="mainlocation"
                    {...register("mainlocation", { required: true })}
                    onChange={(e) => setValue("mainlocation", e.target.value)}
                    className="border rounded p-2 mb-4"
                >
                    <option value="">Select a main location</option>
                    {MAIN_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                            {loc.name}
                        </option>
                    ))}
                </select>

                {formError && <p className="text-red-500 mb-4">{formError}</p>}

                <Button type="submit" bgColor={location ? "bg-green-500" : undefined} className="w-full">
                    {location ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
