import React from 'react';
import { Container } from '../components';
import ProcureForm from '../components/procurement-form/ProcureForm';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function AddProcure() {
    return (
        <div className='py-8'>
            <Container>
                <ProcureForm />
            </Container>
        </div>
    );
}

export default AddProcure;