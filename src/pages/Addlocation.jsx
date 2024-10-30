import React from 'react'
import { Container } from '../components'
import LocationForm from '../components/location-form/LocationForm'

function AddLocation() {
  return (
    <div className='py-8'>
        <Container>
            <LocationForm />
        </Container>
    </div>
  )
}

export default AddLocation