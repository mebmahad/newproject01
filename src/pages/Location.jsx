import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import service from "../appwrite/config";
import { Button, Container } from "../components";
import { useSelector } from "react-redux";

export default function Location() {
    const [location, setLocation] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false); // State to track if current user is the author
    const { id } = useParams(); // Post id from URL
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchPost = async () => {
            if (id) {
                try {
                    const location = await service.getLocation(id);
                    if (location) {
                        setPost(location);

                        // Check if the current user is the author
                        if (userData && userData.$id && location.userId === userData.$id) {
                            setIsAuthor(true);
                        } else {
                            setIsAuthor(false);
                        }
                    } else {
                        navigate("/");
                    }
                } catch (error) {
                    console.error("Error fetching location:", error);
                    navigate("/");
                }
            } else {
                navigate("/");
            }
        };

        fetchPost();
    }, [id, navigate, userData]);

    const deletePost = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this location?");
        if (confirmed) {
            const status = await service.deleteLocation(location.$id);
            if (status) {
                navigate("/");
            }
        }
    };

    return location ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex mb-8 relative border rounded-xl p-2">
                    <div className="absolute right-6 top-6">
                        {isAuthor && (
                            <div>
                                <Link to={`/edit-location/${location.$id}`}>
                                    <Button className="bg-green-500 mr-3">Edit</Button>
                                </Link>
                                <Button className="bg-red-500" onClick={deletePost}>
                                    Delete
                                </Button>
                            </div>
                        )}
                        <br />
                    </div>
                    <div className="browser-css font-bold">
                        <ul>
                            <br />
                            <li><strong>Loaction:</strong> {location.location}</li>
                            <li><strong>Main Location:</strong> {location.mainlocation}</li>
                            <br />
                        </ul>
                    </div>
                </div>
            </Container>
        </div>
    ) : null;
}
