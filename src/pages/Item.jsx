import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";

export default function Item() {
    const [item, setItem] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            service.getItem(id).then((item) => {
                if (item) setItem(item);
                else navigate("/");
            });
        } else navigate("/");
    }, [id, navigate]);

    const deleteItem = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this item?");
        if (confirmed) {
            const status = await service.deleteItem(item.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return item ? (
        <div className="py-10 bg-gray-50 min-h-screen">
            <Container>
                <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Action Buttons */}
                    <div className="flex justify-end p-4 border-b">
                        <Link to={`/edit-item/${item.$id}`}>
                            <button
                                className="text-blue-500 hover:text-blue-700 transition ease-in-out transform hover:scale-110 mr-4"
                                title="Edit"
                            >
                                <i className="fas fa-edit text-2xl"></i>
                            </button>
                        </Link>
                        <button
                            className="text-red-500 hover:text-red-700 transition ease-in-out transform hover:scale-110"
                            onClick={deleteItem}
                            title="Delete"
                        >
                            <i className="fas fa-trash text-2xl"></i>
                        </button>
                    </div>

                    {/* Item Details */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Item Details</h2>
                        <div className="space-y-3">
                            <p>
                                <span className="font-semibold text-gray-600">Item:</span>{" "}
                                <span className="text-gray-700">{item.Item}</span>
                            </p>
                            <p>
                                <span className="font-semibold text-gray-600">Head:</span>{" "}
                                <span className="text-gray-700">{item.Head}</span>
                            </p>
                            <p>
                                <span className="font-semibold text-gray-600">Price:</span>{" "}
                                <span className="text-gray-700">${item.Price}</span>
                            </p>
                            <p>
                                <span className="font-semibold text-gray-600">Quantity:</span>{" "}
                                <span className="text-gray-700">{item.Quantity}</span>
                            </p>
                            <p>
                                <span className="font-semibold text-gray-600">Location:</span>{" "}
                                <span className="text-gray-700">{item.Location}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
