"use client"

import Navigation from '@/components/Navigation'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/notes');
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-5xl font-bold text-gray-800 text-center">
          Django/NextJS Demo App
        </h1>
      </div>
    </main>
  );
}
