import React, { useState, useEffect } from 'react'
import { Container, TextField, Button, Paper, Typography, Stack, Alert, MenuItem, LinearProgress } from '@mui/material'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [risk, setRisk] = useState('moderate')
  const [hints, setHints] = useState([])
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    // local heuristic to show strength
    let s = 0
    if (password.length >= 12) s += 40
    if (/[A-Z]/.test(password)) s += 20
    if (/[0-9]/.test(password)) s += 20
    if (/[^A-Za-z0-9]/.test(password)) s += 20
    setScore(s)
  }, [password])

  const onSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const full_name = [firstName, lastName].filter(Boolean).join(' ')
      const res = await api.post('/api/auth/signup', { email, password, risk_appetite: risk, first_name: firstName, last_name: lastName, full_name, phone })
      setHints(res.ai?.passwordHints || [])
      login(res.token, res.user)
      nav('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Signup failed')
    }
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Signup</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <TextField label="First name" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
            <TextField label="Last name" value={lastName} onChange={e=>setLastName(e.target.value)} />
            <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <TextField label="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <LinearProgress variant="determinate" value={score} />
            <TextField select label="Risk Appetite" value={risk} onChange={e=>setRisk(e.target.value)}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>
            {hints.length>0 && <Alert severity="info">AI hints: {hints.join(' ')}</Alert>}
            <Button type="submit" variant="contained">Create Account</Button>
          </Stack>
        </Paper>
      </Container>
    </>
  )
}
