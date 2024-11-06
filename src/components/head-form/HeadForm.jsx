import { useForm } from "react-hook-form";
import { Button, Input } from ".."; // Import necessary components
import service from "../../appwrite/config"; // Adjusted to use your complaintService
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function HeadForm({ head }) {
    const { register, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            Headname: head?.Headname || "",
            Budgteamount: head?.Budgteamount || "",
            userId: head?.userID || "",
            id: head?.$id || `head-${Date.now()}-${Math.floor(Math.random() * 10000)}`, // Generate random unique ID
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        try {
            let dbHead;

            if (head) {
                if (!head.$id) {
                    throw new Error("Head ID is not available");
                }
                dbHead = await service.updateHead(head.$id, { ...data });
            } else {
                dbHead = await service.createHead({ ...data, userId: userData?.$id });
            }

            if (dbHead) {
                navigate(`/head/${dbHead.$id}`);
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
                    label="Head Name:"
                    placeholder="Head Name"
                    className="mb-4"
                    {...register("Headname", { required: true })}
                />
                <Input
                    label="Budget Amount:"
                    placeholder="Budget Amount"
                    className="mb-4"
                    {...register("Budgteamount", { required: true })}
                />
                <Button type="submit" bgColor={head ? "bg-green-500" : undefined} className="w-full">
                    {head ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
