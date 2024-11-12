import React, { useEffect, useState } from 'react';
import { Container } from '../components';
import service from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PoForm from '../components/po-form/PoForm';

function EditPo() {
    const [poData, setpoData] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchPo = async () => {
            if (id) {
                try {
                    const fetchedPo = await service.getPo(id);
                    if (fetchedPo) {
                        setpoData(fetchedPo);
                    }
                    else {
                        navigate('/all-pos'); // Redirect if item not found
                    }
                } catch (error) {
                    console.error("Failed to fetch po:", error);
                    navigate('/all-pos'); // Redirect on error
                }
            } else {
                navigate('/all-pos');
            }
        };

        fetchPo();
    }, [id, navigate, userData]);

    return item ? (
        <div className="py-8">
            <Container>
                <PoForm poData={poData} />
            </Container>
        </div>
    ) : <div>Loading...</div>;
}

export default EditPo;
