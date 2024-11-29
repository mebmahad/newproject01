import React, { useEffect, useState } from 'react';
import { Container, ItemForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';

function EditItem() {
    const [item, setItem] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            if (id) {
                try {
                    const item = await service.getItem(id);
                    if (item) {
                            setItem(item);
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
    }, [id, navigate]);

    return item ? (
        <div className='py-8'>
            <Container>
                <ItemForm item={item} />
            </Container>
        </div>
    ) : null;
}

export default EditItem;
