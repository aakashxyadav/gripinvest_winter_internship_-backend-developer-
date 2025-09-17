import { render, screen } from '@testing-library/react'
import React from 'react'
import Login from '../../pages/Login'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'

it('renders login form', () => {
  render(<AuthProvider><MemoryRouter><Login /></MemoryRouter></AuthProvider>)
  expect(screen.getByText(/Login/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
})
