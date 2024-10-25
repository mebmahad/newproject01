import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, ProcureForm } from '../components';

function AddProcure() {
  const { postId } = useParams(); // Extract post ID from the URL

  return (
    <div className='py-8'>
      <Container>
        {/* Pass postId as a prop to ProcureForm */}
        <ProcureForm postId={postId} />
      </Container>
    </div>
  );
}

export default AddProcure;
