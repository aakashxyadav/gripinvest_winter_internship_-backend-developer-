import { render, screen } from '@testing-library/react'
import React from 'react'
import Signup from '../../pages/Signup'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'

it('renders signup form', () => {
  render(<AuthProvider><MemoryRouter><Signup /></MemoryRouter></AuthProvider>)
  expect(screen.getByText(/Signup/i)).toBeInTheDocument()
})
