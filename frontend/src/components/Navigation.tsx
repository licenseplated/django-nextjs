"use client"

import { FC } from 'react'
import Link from 'next/link'
import StatusIndicator from './StatusIndicator'

const Navigation: FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-gray-800 hover:text-gray-600">
          Home
        </Link>
      </div>
      
      <StatusIndicator />
      
      <div>
        <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
          Login
        </button>
      </div>
    </nav>
  )
}

export default Navigation
