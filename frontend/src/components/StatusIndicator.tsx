"use client"

import { FC, useEffect, useState } from 'react'

const StatusIndicator: FC = () => {
  const [status, setStatus] = useState<'ok' | 'error'>('error')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status')
        const data = await response.json()
        setStatus(data.status === 'ok' ? 'ok' : 'error')
      } catch (err) {
        console.error('Failed to fetch status:', err)
        setStatus('error')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />
  }

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === 'ok' ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {status === 'ok' ? 'System Online' : 'System Offline'}
      </span>
    </div>
  )
}

export default StatusIndicator
