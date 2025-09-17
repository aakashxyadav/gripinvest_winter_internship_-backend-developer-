import React, { useEffect, useState, useRef } from 'react'
import { Container, Typography, Paper, MenuItem, TextField, Button, Alert, Avatar, Stack } from '@mui/material'
import NavBar from '../components/NavBar'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Profile() {
  const { user, login } = useAuth()
  const [risk, setRisk] = useState(user?.risk_appetite || 'moderate')
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [photoUrl, setPhotoUrl] = useState(user?.profile_photo_url || '')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef()

  useEffect(()=>{ (async()=>{
    try { const me = await api.get('/api/users/me'); login(localStorage.getItem('token'), me); 
      setRisk(me.risk_appetite || 'moderate'); setFirstName(me.first_name||''); setLastName(me.last_name||''); setPhone(me.phone||''); setPhotoUrl(me.profile_photo_url||'')
    } catch {}
  })() }, [])

  const save = async () => {
    setErr(''); setMsg('')
    try {
      const me = await api.put('/api/users/me', { first_name: firstName, last_name: lastName, phone, risk_appetite: risk })
      login(localStorage.getItem('token'), me)
      setMsg('Profile updated')
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed')
    }
  }

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setErr(''); setMsg('')
    try {
      const form = new FormData()
      form.append('photo', file)
      const resp = await fetch(`${(import.meta.env?.VITE_API_BASE)||'http://localhost:4000'}/api/users/me/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      })
      if (!resp.ok) throw new Error(await resp.text())
      const me = await resp.json()
      login(localStorage.getItem('token'), me)
      setPhotoUrl(me.profile_photo_url || '')
      setMsg('Photo updated')
      fileRef.current.value = ''
    } catch (e) {
      setErr('Photo upload failed')
    }
  }

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.full_name || user?.email || 'U'

  return (
    <>
      <NavBar />
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p:2 }}>
          <Typography variant="h6" gutterBottom>Profile</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar src={photoUrl && (photoUrl.startsWith('http') ? photoUrl : `${(import.meta.env?.VITE_API_BASE)||'http://localhost:4000'}${photoUrl}`)} sx={{ width: 64, height: 64 }}>{displayName.charAt(0).toUpperCase()}</Avatar>
            <div>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={()=>fileRef.current?.click()}>Change photo</Button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadPhoto} />
            </div>
          </Stack>
          <Stack spacing={2}>
            <TextField label="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} />
            <TextField label="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} />
            <TextField label="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
            <TextField select label="Risk Appetite" value={risk} onChange={e=>setRisk(e.target.value)}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            <div>
              <Button sx={{ mt:1 }} variant="contained" onClick={save}>Save</Button>
            </div>
            {msg && <Alert severity="success">{msg}</Alert>}
            {err && <Alert severity="error">{err}</Alert>}
          </Stack>
        </Paper>
      </Container>
    </>
  )
}
