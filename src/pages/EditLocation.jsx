import React, { useEffect, useState } from 'react';
import { Container, LocationForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditLocation() {
    const [loation, setLocation] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchLocation = async () => {
            if (id) {
                try {
                    const location = await service.getLocation(id);
                    if (location) {
                        // Check if the user is the author
                        if (location.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setLocation(location);
                        }
                    } else {
                        navigate('/all-locations'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch location:", error);
                    navigate('/all-locations'); // Redirect on error
                }
            } else {
                navigate('/all-locations');
            }
        };

        fetchLocation();
    }, [id, navigate, userData]);

    return location ? (
        <div className='py-8'>
            <Container>
                <LocationForm location={location} />
            </Container>
        </div>
    ) : null;
}

export default EditLocation;
