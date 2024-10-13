import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Po() {
    const [po, setPo] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = po && userData ? true : false; // Set to false if you want to restrict buttons to authors only

    useEffect(() => {
        if (id) {
            service.getPo(id).then((po) => {
                if (po) setPo(po);
                else navigate("/");
            });
        } else navigate("/");
    }, [id, navigate]);

    const deletePo = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this po?");
        if (confirmed) {
            const status = await service.deletePo(po.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return po ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-po/${po.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deletePo}>
                                    Delete
                                </Button>

                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li>{po.VendorName}</li>
                            <li>{po.Items}</li>
                            <li>{po.Amount}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
