import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Vendor() {
    const [vendor, setVendor] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = vendor && userData ? true : false; // Set to false if you want to restrict buttons to authors only

    useEffect(() => {
        if (id) {
            service.getVendor(id).then((vendor) => {
                if (vendor) setVendor(vendor);
                else navigate("/");
            });
        } else navigate("/");
    }, [id, navigate]);

    const deleteVendor = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this vendor?");
        if (confirmed) {
            const status = await service.deleteVendor(vendor.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return vendor ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-vendor/${vendor.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deleteVendor}>
                                    Delete
                                </Button>

                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li>{vendor.Name}</li>
                            <li>{vendor.Address}</li>
                            <li>{vendor.GSTNo}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
