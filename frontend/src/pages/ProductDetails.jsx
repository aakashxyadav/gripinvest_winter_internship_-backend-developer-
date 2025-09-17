import React, { useEffect, useState } from 'react'
import { Container, Typography, Paper, Stack, TextField, Button, Alert, Chip, Divider, Skeleton, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { useParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import api from '../api/client'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function ProductDetails() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [amount, setAmount] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [ai, setAi] = useState({ loading: true, summary: '', reasons: [] })

  useEffect(() => { (async () => setP(await api.get(`/api/products/${id}`)))() }, [id])

  useEffect(() => {
    (async () => {
      setAi({ loading: true, summary: '', reasons: [] })
      try {
        const data = await api.get(`/api/products/${id}/ai/explainer`)
        setAi({ loading: false, summary: data.summary, reasons: data.reasons || [] })
      } catch (e) {
        setAi({ loading: false, summary: '', reasons: [] })
      }
    })()
  }, [id])

  const invest = async () => {
    setErr(''); setMsg('')
    try {
      await api.post('/api/investments', { product_id: id, amount: Number(amount) })
      setMsg('Investment successful')
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed')
    }
  }

  if (!p) return null

  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>{p.name}</Typography>
            <Chip label={p.type} size="small" />
            <Chip label={`Risk: ${p.risk}`} size="small" color={p.risk==='low'?'success':p.risk==='high'?'error':'warning'} />
          </Stack>
          <Typography sx={{ mt: 1 }}>Yield: <b>{p.expected_annual_yield}%</b> • Tenure: {p.tenure_months} months</Typography>

          {/* AI explainer */}
          <Paper variant="outlined" sx={{ p:2, mt:2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1">AI Summary</Typography>
            {ai.loading ? (
              <>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Divider sx={{ my: 1 }} />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="30%" />
              </>
            ) : (
              <>
                <Typography variant="body1" sx={{ mb: 1 }}>{ai.summary || p.description}</Typography>
                {ai.reasons?.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Why this could fit you</Typography>
                    <List dense>
                      {ai.reasons.map((r, idx) => (
                        <ListItem key={idx}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={r} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </Paper>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <TextField label={`Amount (${Number(p.min_investment).toFixed(0)} - ${Number(p.max_investment).toFixed(0)})`} value={amount} onChange={e=>setAmount(e.target.value)} helperText={`Min ${p.min_investment}, Max ${p.max_investment}`} />
            <Button variant="contained" onClick={invest}>Invest</Button>
          </Stack>
          {msg && <Alert severity="success" sx={{ mt: 2 }}>{msg}</Alert>}
          {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
        </Paper>
      </Container>
    </>
  )
}
