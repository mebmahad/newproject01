import React from 'react';
import { Container } from '../components';
import PoForm from '../components/po-form/PoForm';
import { useNavigate } from 'react-router-dom';

function AddPo() {
  const navigate = useNavigate();
  return (
    <div className="py-8">
      <Container>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <PoForm />
      </Container>
    </div>
  );
}

export default AddPo;
