import React from 'react'
import NavBar from '../components/NavBar'
import { Container, Typography } from '@mui/material'

export default function Logs() {
  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Activity</Typography>
        <Typography color="text.secondary">This section has been removed.</Typography>
      </Container>
    </>
  )
}
