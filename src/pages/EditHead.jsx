import React, { useEffect, useState } from 'react';
import { Container, HeadForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditHead() {
    const [head, setHead] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchHead = async () => {
            if (id) {
                try {
                    const head = await service.getHead(id);
                    if (head) {
                        // Check if the user is the author
                        if (head.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setHead(head);
                        }
                    } else {
                        navigate('/all-heads'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch head:", error);
                    navigate('/all-heads'); // Redirect on error
                }
            } else {
                navigate('/all-heads');
            }
        };

        fetchHead();
    }, [id, navigate, userData]);

    return head ? (
        <div className='py-8'>
            <Container>
                <HeadForm head={head} />
            </Container>
        </div>
    ) : null;
}

export default EditHead;
