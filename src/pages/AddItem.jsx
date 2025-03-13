import React from 'react'
import { Container, ItemForm, Button } from '../components'
import { useNavigate } from "react-router-dom";

function AddItem() {
  const navigate = useNavigate();
  return (
    <div className='py-8'>
        <Container>
        <Button onClick={() => navigate('/store')} className="mb-4">
                ← Back to Store
            </Button>
            <ItemForm />
        </Container>
    </div>
  )
}

export default AddItem