import React from 'react'
import { AppBar, Toolbar, Typography, Button } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { token, user, logout } = useAuth()
  const nav = useNavigate()
  const isAdmin = Boolean(user?.role === 'admin')
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e6ebf1', background: 'rgba(255,255,255,0.8)', backdropFilter: 'saturate(180%) blur(8px)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: 0.2, color: 'primary.main' }}>Grip Invest</Typography>
        {token ? (
          <>
            {/* Show admin tasks for admins */}
            {isAdmin ? (
              <>
                <Button color="primary" component={Link} to="/admin">Admin</Button>
                <Button color="primary" component={Link} to="/profile">Profile</Button>
              </>
            ) : (
              <>
                <Button color="primary" component={Link} to="/dashboard">Dashboard</Button>
                <Button color="primary" component={Link} to="/products">Products</Button>
                <Button color="primary" component={Link} to="/investments">Investments</Button>
                <Button color="primary" component={Link} to="/profile">Profile</Button>
              </>
            )}
            <Button color="primary" onClick={() => { logout(); nav('/'); }}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="primary" component={Link} to="/login">Login</Button>
            <Button color="primary" component={Link} to="/signup">Signup</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
