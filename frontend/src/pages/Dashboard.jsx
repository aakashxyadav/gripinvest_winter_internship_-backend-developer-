import React, { useEffect, useState } from 'react'
import { Container, Typography, Grid, Paper } from '@mui/material'
import NavBar from '../components/NavBar'
import api from '../api/client'

export default function Dashboard() {
  const [insights, setInsights] = useState(null)
  const [count, setCount] = useState(0)
  useEffect(() => {
    (async () => {
      const data = await api.get('/api/investments/me')
      setInsights(data.insights); setCount(data.list.length)
    })()
  }, [])
  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Dashboard</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:2, border: '1px solid #e6ebf1' }}>
              <Typography variant="h6">Portfolio Value</Typography>
              <Typography variant="h4">₹{insights?.total?.toFixed(2) || '0.00'}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:2, border: '1px solid #e6ebf1' }}>
              <Typography variant="h6">Investments</Typography>
              <Typography variant="h4">{count}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p:2, border: '1px solid #e6ebf1' }}>
              <Typography variant="h6">AI Insights</Typography>
              <Typography>{insights?.summary || 'No investments yet'}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}
