import React, { useEffect, useState } from 'react';
import { Container, ProcureForm } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditProcure() {
    const [procure, setProcure] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchProcure = async () => {
            if (id) {
                try {
                    const procure = await service.getProcure(id);
                    if (procure) {
                        // Check if the user is the author
                        if (procure.userId !== userData.$id) {
                            navigate('/'); // Redirect if not the author
                        } else {
                            setProcure(procure);
                        }
                    } else {
                        navigate('/all-procures'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch procure:", error);
                    navigate('/all-procures'); // Redirect on error
                }
            } else {
                navigate('/all-procures');
            }
        };

        fetchProcure();
    }, [id, navigate, userData]);

    return procure ? (
        <div className='py-8'>
            <Container>
                <ProcureForm procure={procure} />
            </Container>
        </div>
    ) : null;
}

export default EditProcure;
