"use client"

import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusIndicator from './StatusIndicator'
import { useAuth } from '@/context/AuthContext'

const Navigation: FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-800 hover:text-gray-600">
          Home
        </Link>
      </div>
      
      <StatusIndicator />
      
      <div>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navigation
