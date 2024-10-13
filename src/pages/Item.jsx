import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Item() {
    const [item, setItem] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = item && userData ? true : false; // Set to false if you want to restrict buttons to authors only

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
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-item/${item.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deleteItem}>
                                    Delete
                                </Button>

                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li>{item.Item}</li>
                            <li>{item.Head}</li>
                            <li>{item.Price}</li>
                            <li>{item.Quantity}</li>
                            <li>{item.Location}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
