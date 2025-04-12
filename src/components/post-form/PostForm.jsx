import React, { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select } from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import gsheetservice from "../../google-sheet/googleSheetService"

export default function PostForm({ post }) {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            areas: post?.areas || "",
            subarea: post?.subarea || "",
            feild: post?.feild || "",
            problem: post?.problem || "",
            status: post?.status || "active",
            id: post?.$id || `post-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Generate random unique ID
            createdAt: post?.createdAt || new Date().toISOString(), // Add createdAt field
            complaintIds: post?.complaintIds || [], // Initialize complaintIds as empty array
        },
    });

    const [daysPassed, setDaysPassed] = useState(0); // State to store the days passed
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const calculateDaysPassed = (createdAt) => {
        const createdDate = new Date(createdAt);
        const currentDate = new Date();
        const differenceInTime = currentDate - createdDate;
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert to days
        return differenceInDays;
    };

    useEffect(() => {
        if (post?.createdAt) {
            const days = calculateDaysPassed(post.createdAt);
            setDaysPassed(days);
        }
    }, [post]);

    const submit = async (data) => {
        try {
            let dbPost;
            let dbgPost;

            if (post) {
                if (!post.$id) {
                    throw new Error("Post ID is not available");
                }
                dbPost = await service.updatePost(post.$id, { ...data });
            } else {
                dbPost = await service.createPost({ 
    ...data, 
    userId: userData?.$id,
    complaintIds: data.complaintIds 
});

                dbgPost = await gsheetservice.createPost({ ...data});

            }

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Id :"
                    placeholder="id"
                    className="mb-4"
                    {...register("id", { required: true })}
                    readOnly // Make it read-only if you don't want users to modify the ID
                />
                <Input
                    label="Area:"
                    placeholder="Area"
                    className="mb-4"
                    {...register("areas", { required: true })}
                />
                <Input
                    label="Subarea:"
                    placeholder="Subarea"
                    className="mb-4"
                    {...register("subarea", { required: true })}
                />
                <Input
                    label="Field:"
                    placeholder="Field"
                    className="mb-4"
                    {...register("feild", { required: true })}
                />
                <Input
                    label="Problem:"
                    placeholder="Describe the problem"
                    className="mb-4"
                    {...register("problem", { required: true })}
                />
                <Input
                    label="Complaint IDs:"
                    placeholder="Enter complaint IDs (comma-separated)"
                    className="mb-4"
                    {...register("complaintIds", {
                        required: true,
                        setValueAs: value => value.split(',').map(id => id.trim())
                    })}
                />
                <div className="mb-4">
                    <strong>Days since post creation:</strong> {daysPassed} days
                </div>
            </div>
            <div className="w-1/3 px-2">
                <Select
                    options={["active", "task", "approval", "In Procure", "laundry"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
