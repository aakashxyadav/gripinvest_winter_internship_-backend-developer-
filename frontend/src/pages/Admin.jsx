import React, { useEffect, useMemo, useState } from 'react'
import { Container, Typography, Paper, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip, Table, TableHead, TableBody, TableRow, TableCell, Chip, Box, Snackbar, Alert } from '@mui/material'
import { Add, Edit, Delete, Refresh, Search } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const emptyProduct = { name: '', type: 'bond', risk: 'moderate', expected_annual_yield: '', min_investment: '', max_investment: '', tenure_months: '', description: '' }

export default function Admin() {
  const { user } = useAuth()
  const nav = useNavigate()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) nav('/dashboard')
  }, [isAdmin])

  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Admin Panel</Typography>
        <Typography variant="body2" sx={{ opacity: 0.75, mb: 2 }}>Manage products and review API logs.</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ flex: 2 }}>
            <AdminProducts />
          </Box>
          <Box sx={{ flex: 1 }}>
            <AdminLogs />
          </Box>
        </Stack>
      </Container>
    </>
  )
}

function AdminProducts() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyProduct)
  const [editId, setEditId] = useState(null)
  const [toast, setToast] = useState('')

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter(r => [r.name, r.type, r.risk].some(v => String(v||'').toLowerCase().includes(t)))
  }, [rows, q])

  const fetch = async () => {
    const data = await api.get('/api/products')
    setRows(data)
  }
  useEffect(()=>{ fetch() }, [])

  const startCreate = () => { setEditId(null); setForm(emptyProduct); setOpen(true) }
  const startEdit = (row) => { setEditId(row.id); setForm({ name: row.name, type: row.type, risk: row.risk, expected_annual_yield: row.expected_annual_yield, min_investment: row.min_investment, max_investment: row.max_investment, tenure_months: row.tenure_months, description: row.description || '' }); setOpen(true) }

  const save = async () => {
    const payload = {
      name: form.name.trim(),
      type: form.type,
      risk: form.risk,
      expected_annual_yield: Number(form.expected_annual_yield),
      min_investment: Number(form.min_investment),
      max_investment: form.max_investment ? Number(form.max_investment) : null,
      tenure_months: Number(form.tenure_months),
      description: form.description?.trim()
    }
    if (editId) {
      await api.put(`/api/products/${editId}`, payload)
      setToast('Product updated')
    } else {
      await api.post('/api/products', payload)
      setToast('Product created')
    }
    setOpen(false)
    fetch()
  }

  const remove = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/api/products/${id}`)
    setToast('Product deleted')
    fetch()
  }

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Products</Typography>
        <TextField size="small" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} InputProps={{ endAdornment: <Search fontSize="small" /> }} />
        <Tooltip title="Refresh"><IconButton onClick={fetch}><Refresh /></IconButton></Tooltip>
        <Button variant="contained" startIcon={<Add />} onClick={startCreate}>New</Button>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Risk</TableCell>
            <TableCell>Yield %</TableCell>
            <TableCell>Min</TableCell>
            <TableCell>Max</TableCell>
            <TableCell>Tenure (m)</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(r => (
            <TableRow key={r.id} hover>
              <TableCell>{r.name}</TableCell>
              <TableCell><Chip size="small" label={r.type} /></TableCell>
              <TableCell><Chip size="small" label={r.risk} color={r.risk==='low'?'success':r.risk==='high'?'error':'warning'} /></TableCell>
              <TableCell>{r.expected_annual_yield}</TableCell>
              <TableCell>{r.min_investment}</TableCell>
              <TableCell>{r.max_investment ?? '-'}</TableCell>
              <TableCell>{r.tenure_months}</TableCell>
              <TableCell align="right">
                <Tooltip title="Edit"><IconButton onClick={()=>startEdit(r)}><Edit fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton color="error" onClick={()=>remove(r.id)}><Delete fontSize="small" /></IconButton></Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit product' : 'New product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} fullWidth />
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField select label="Type" value={form.type} onChange={e=>setForm(f=>({ ...f, type: e.target.value }))} sx={{ minWidth: 160 }}>
                <MenuItem value="bond">Bond</MenuItem>
                <MenuItem value="invoice">Invoice</MenuItem>
                <MenuItem value="leasing">Leasing</MenuItem>
                <MenuItem value="vc">VC</MenuItem>
              </TextField>
              <TextField select label="Risk" value={form.risk} onChange={e=>setForm(f=>({ ...f, risk: e.target.value }))} sx={{ minWidth: 160 }}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
              <TextField type="number" label="Yield %" value={form.expected_annual_yield} onChange={e=>setForm(f=>({ ...f, expected_annual_yield: e.target.value }))} />
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
              <TextField type="number" label="Min investment" value={form.min_investment} onChange={e=>setForm(f=>({ ...f, min_investment: e.target.value }))} />
              <TextField type="number" label="Max investment" value={form.max_investment} onChange={e=>setForm(f=>({ ...f, max_investment: e.target.value }))} />
              <TextField type="number" label="Tenure (months)" value={form.tenure_months} onChange={e=>setForm(f=>({ ...f, tenure_months: e.target.value }))} />
            </Stack>
            <TextField label="Description" value={form.description} onChange={e=>setForm(f=>({ ...f, description: e.target.value }))} multiline rows={3} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={2000} onClose={()=>setToast('')} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert severity="success" onClose={()=>setToast('')}>{toast}</Alert>
      </Snackbar>
    </Paper>
  )
}

function AdminLogs() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [ai, setAi] = useState(null)

  const fetch = async () => {
    const data = await api.get('/api/logs')
    setRows(data)
    setAi(null)
  }
  useEffect(()=>{ fetch() }, [])

  const search = async () => {
    const res = await api.get('/api/logs/search', { q })
    setRows(res.logs)
    setAi(res.ai)
  }

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Logs</Typography>
        <TextField size="small" placeholder="Search by user id/email" value={q} onChange={e=>setQ(e.target.value)} />
        <Button variant="outlined" onClick={search}>Search</Button>
      </Stack>
      <Box sx={{ maxHeight: 420, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Endpoint</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Error</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i} hover>
                <TableCell>{new Date(r.created_at || r.time || Date.now()).toLocaleString()}</TableCell>
                <TableCell>{r.user_email || r.user_id || '-'}</TableCell>
                <TableCell>{r.http_method || r.method}</TableCell>
                <TableCell>{r.endpoint}</TableCell>
                <TableCell><Chip size="small" label={r.status_code || r.status} color={(r.status_code||r.status)>=400?'error':'success'} /></TableCell>
                <TableCell sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.error_message || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {ai && (
        <Paper sx={{ p:1.5, mt: 1, bgcolor: 'secondary.light' }}>
          <Typography variant="body2"><strong>AI Summary:</strong> {ai.summary}</Typography>
        </Paper>
      )}
    </Paper>
  )
}
