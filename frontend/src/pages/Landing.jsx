import React from 'react'
import { Container, Typography, Button, Stack, Box, Grid, Paper, Chip } from '@mui/material'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function Landing() {
  return (
    <>
      <NavBar />
      <Box sx={{
        position: 'relative',
        minHeight: { xs: 360, md: 520 },
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=60)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)' }} />
        <Container sx={{ position: 'relative', color: '#fff' }}>
          <Chip label="New" color="secondary" sx={{ mb: 2 }} />
          <Typography variant="h3" gutterBottom>Welcome to Grip Invest</Typography>
          <Typography gutterBottom sx={{ opacity: 0.9, maxWidth: 720 }}>
            Build a diversified portfolio in bonds, invoices, leasing, and more. Personalized AI insights help align investments with your risk appetite.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button variant="contained" color="secondary" component={Link} to="/signup">Get Started</Button>
            <Button variant="outlined" color="inherit" component={Link} to="/products">Browse Products</Button>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:3 }}>
              <Typography variant="h6">Curated Products</Typography>
              <Typography variant="body2">High-quality deals vetted for performance and transparency.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:3 }}>
              <Typography variant="h6">AI Insights</Typography>
              <Typography variant="body2">Get personalized recommendations and summaries based on your profile.</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:3 }}>
              <Typography variant="h6">Risk-first Design</Typography>
              <Typography variant="body2">Understand yield, tenure, and risk so you decide with confidence.</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
