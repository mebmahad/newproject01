import React from 'react'
import { Container } from '../components'
import PoForm from '../components/po-form/PoForm'

function AddPo() {
  return (
    <div className='py-8'>
        <Container>
            <PoForm />
        </Container>
    </div>
  )
}

export default AddPo