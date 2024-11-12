import React, { useEffect, useState } from 'react';
import { Container } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import PoForm from '../components/po-form/PoForm';

function EditPo() {
    const [po, setPo] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPo = async () => {
            if (id) {
                try {
                    const fetchedPo = await service.getPo(id);
                    if (fetchedPo) {
                        setPo(fetchedPo);
                    } else {
                        console.error("No PO data found for ID:", id);
                        navigate('/all-pos'); // Redirect if PO not found
                    }
                } catch (error) {
                    console.error("Failed to fetch PO:", error.message);
                    navigate('/all-pos'); // Redirect on error
                }
            } else {
                navigate('/all-pos');
            }
        };

        fetchPo();
    }, [id, navigate]);

    return poData ? (
        <div className="py-8">
            <Container>
                <PoForm po={po} />
            </Container>
        </div>
    ) : <div>Loading...</div>;
}

export default EditPo;
