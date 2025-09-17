import { render, screen } from '@testing-library/react'
import React from 'react'
import Landing from '../../pages/Landing'
import { MemoryRouter } from 'react-router-dom'

it('renders landing links', () => {
  render(<MemoryRouter><Landing /></MemoryRouter>)
  expect(screen.getByText(/Welcome to Grip Invest/i)).toBeInTheDocument()
  expect(screen.getByText(/Get Started/i)).toBeInTheDocument()
})
