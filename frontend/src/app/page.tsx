"use client"

import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-5xl font-bold text-gray-800 text-center">
          Django/NextJS Demo App
        </h1>
      </div>
    </main>
  )
}
