import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material'
import { AuthProvider, useAuth } from './context/AuthContext'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Investments from './pages/Investments'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0052CC' },
    secondary: { main: '#00B8D9' },
    background: { default: '#f7f9fc' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
  },
});

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
              <Route path="/products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
              <Route path="/investments" element={<PrivateRoute><Investments /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
