import React, { useEffect, useState } from 'react'
import { Container, Typography, Grid, Paper, Button, Stack, MenuItem, TextField, Card, CardContent, CardMedia, Chip, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import api from '../api/client'

// NOTE: Admin CRUD moved to Admin page; this page remains read-only for users.

const typeImage = (type) => {
  switch (type) {
    case 'bond': return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=60'
    case 'invoice': return 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=1200&q=60'
    case 'leasing': return 'https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?auto=format&fit=crop&w=1200&q=60'
    case 'vc': return 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=60'
    default: return 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=60'
  }
}

export default function Products() {
  const [list, setList] = useState([])
  const [filters, setFilters] = useState({ type: '', risk: '', yield_min: '', yield_max: '' })
  const [recommendedMode, setRecommendedMode] = useState(false)

  const fetch = async () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined))
    const data = await api.get('/api/products', params)
    setList(data); setRecommendedMode(false)
  }
  useEffect(()=>{ fetch() }, [])

  const recommend = async () => {
    const data = await api.get('/api/products/ai/recommendations/me')
    setList(data); setRecommendedMode(true)
  }

  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>Products</Typography>
          <TextField select size="small" label="Type" value={filters.type} onChange={e=>setFilters(f=>({ ...f, type: e.target.value }))}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="bond">Bond</MenuItem>
            <MenuItem value="invoice">Invoice</MenuItem>
            <MenuItem value="leasing">Leasing</MenuItem>
            <MenuItem value="vc">VC</MenuItem>
          </TextField>
          <TextField select size="small" label="Risk" value={filters.risk} onChange={e=>setFilters(f=>({ ...f, risk: e.target.value }))}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="moderate">Moderate</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
          <TextField size="small" type="number" label="Yield min %" value={filters.yield_min} onChange={e=>setFilters(f=>({ ...f, yield_min: e.target.value }))} sx={{ width: 140 }} />
          <TextField size="small" type="number" label="Yield max %" value={filters.yield_max} onChange={e=>setFilters(f=>({ ...f, yield_max: e.target.value }))} sx={{ width: 140 }} />
          <Button variant="outlined" onClick={fetch}>Apply</Button>
          <Button variant="contained" onClick={recommend}>AI Recommend</Button>
        </Stack>

        {recommendedMode && (
          <Paper sx={{ p:2, mb:2, bgcolor: 'secondary.light' }}>
            <Typography variant="body1"><strong>AI Recommended</strong> products tailored to your risk profile.</Typography>
          </Paper>
        )}

        <Grid container spacing={2}>
          {list.map(p => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia component="img" height="160" src={typeImage(p.type)} alt={p.type} />
                  {recommendedMode && (
                    <Chip color="secondary" label="AI Recommended" size="small" sx={{ position: 'absolute', top: 8, left: 8 }} />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip label={p.type} size="small" />
                    <Chip label={`Risk: ${p.risk}`} size="small" color={p.risk==='low'?'success':p.risk==='high'?'error':'warning'} />
                  </Stack>
                  <Typography variant="h6">{p.name}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Yield: <b>{p.expected_annual_yield}%</b> • Tenure: {p.tenure_months}m</Typography>
                  <Button component={Link} to={`/products/${p.id}`} sx={{ mt: 1 }} variant="text">Details</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  )
}
