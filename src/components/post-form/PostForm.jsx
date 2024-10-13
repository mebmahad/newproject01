import React, {useCallback} from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select } from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            areas: post?.areas || "",
            subarea: post?.subarea || "",
            feild: post?.feild || "",
            problem: post?.problem || "",
            status: post?.status || "active",
            id: post?.$id || "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            let dbPost;

            if (post) {
                // Check if post is defined before accessing $id
                if (!post.$id) {
                    throw new Error("Post ID is not available");
                }
                dbPost = await service.updatePost(post.$id, {
                    ...data,
                });
            } else {
                dbPost = await service.createPost({ ...data, userId: userData?.$id });
            }

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`); // Navigate to the specific post
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
            if (name === "problem") {
                setValue("id", idTransfrorm(value.problem), { shouldValidate: true });
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
            </div>
            <div className="w-1/3 px-2">
                <Select
                    options={["active", "inactive"]}
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
