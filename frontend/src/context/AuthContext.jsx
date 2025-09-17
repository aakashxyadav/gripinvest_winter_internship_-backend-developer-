import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(() => {
    if (token) api.setToken(token)
  }, [token])

  const login = (t, u) => {
    setToken(t); setUser(u);
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    api.setToken(t)
  }
  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    api.setToken(null)
  }

  return <Ctx.Provider value={{ token, user, login, logout }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
