import React, { useEffect, useState } from 'react';
import { Container, ItemForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditItem() {
    const [item, setItem] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchItem = async () => {
            if (id) {
                try {
                    const procure = await service.getItem(id);
                    if (item) {
                        // Check if the user is the author
                        if (item.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setItem(item);
                        }
                    } else {
                        navigate('/all-items'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch item:", error);
                    navigate('/all-items'); // Redirect on error
                }
            } else {
                navigate('/all-items');
            }
        };

        fetchItem();
    }, [id, navigate, userData]);

    return item ? (
        <div className='py-8'>
            <Container>
                <ItemForm item={item} />
            </Container>
        </div>
    ) : null;
}

export default EditItem;
