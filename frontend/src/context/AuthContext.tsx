"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  email: string
  first_name: string
  last_name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if we have tokens and fetch user data if we do
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await fetch('/api/me/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err)
        }
      }
    }
    
    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.access)
        localStorage.setItem('refreshToken', data.refresh)
        
        // Fetch user data
        const userResponse = await fetch('/api/me/', {
          headers: {
            'Authorization': `Bearer ${data.access}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData)
          setError(null)
          router.push('/')
        }
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred during login')
      console.error('Login error:', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
