import React, { useState, useEffect } from 'react'
import { Container, TextField, Button, Paper, Typography, Stack, Alert, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import NavBar from '../components/NavBar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  // Forgot password state
  const [resetOpen, setResetOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: request, 2: verify
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [resetMsg, setResetMsg] = useState('')
  const [resetErr, setResetErr] = useState('')
  const [score, setScore] = useState(0)

  useEffect(() => {
    // local heuristic for new password strength in reset dialog
    let s = 0
    if (newPwd.length >= 12) s += 40
    if (/[A-Z]/.test(newPwd)) s += 20
    if (/[0-9]/.test(newPwd)) s += 20
    if (/[^A-Za-z0-9]/.test(newPwd)) s += 20
    setScore(s)
  }, [newPwd])

  const onSubmit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await api.post('/api/auth/login', { email, password })
      login(res.token, res.user)
      if (res.user?.role === 'admin') nav('/admin'); else nav('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Login failed')
    }
  }

  const openReset = () => {
    setResetEmail(email)
    setResetStep(1)
    setOtp('')
    setNewPwd('')
    setResetMsg('')
    setResetErr('')
    setResetOpen(true)
  }

  const handleRequestReset = async () => {
    setResetErr(''); setResetMsg('')
    try {
      const res = await api.post('/api/auth/request-reset', { email: resetEmail })
      const preview = res.otpPreview ? ` (OTP: ${res.otpPreview})` : ''
      setResetMsg(`If the email exists, an OTP has been sent.${preview}`)
      setResetStep(2)
    } catch (e) {
      setResetErr(e.response?.data?.message || 'Could not request reset')
    }
  }

  const handleDoReset = async () => {
    setResetErr(''); setResetMsg('')
    try {
      const res = await api.post('/api/auth/reset', { email: resetEmail, code: otp, newPassword: newPwd })
      const hints = res.ai?.passwordHints?.length ? ` Hints: ${res.ai.passwordHints.join(' ')}` : ''
      setResetMsg(`Password updated. You can now log in.${hints}`)
      // Optionally close after short delay
      setTimeout(()=>{ setResetOpen(false) }, 1500)
    } catch (e) {
      setResetErr(e.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Login</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <TextField label="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button type="button" size="small" onClick={openReset}>Forgot password?</Button>
              <Button type="submit" variant="contained">Login</Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog open={resetOpen} onClose={()=>setResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{resetStep===1 ? 'Reset password' : 'Enter OTP and new password'}</DialogTitle>
        <DialogContent>
          {resetErr && <Alert severity="error" sx={{ mb: 2 }}>{resetErr}</Alert>}
          {resetMsg && <Alert severity="info" sx={{ mb: 2 }}>{resetMsg}</Alert>}
          {resetStep === 1 ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} fullWidth />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="OTP Code" value={otp} onChange={e=>setOtp(e.target.value)} fullWidth />
              <TextField label="New Password" type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} fullWidth />
              <LinearProgress variant="determinate" value={score} />
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Tip: use 12+ chars, Aa1! for stronger passwords.</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setResetOpen(false)}>Close</Button>
          {resetStep === 1 ? (
            <Button variant="contained" onClick={handleRequestReset}>Send OTP</Button>
          ) : (
            <Button variant="contained" onClick={handleDoReset}>Update Password</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
