'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Yönlendiriliyor...</h1>
        <p className="mt-2 text-gray-500">Lütfen bekleyin</p>
      </div>
    </div>
  );
}
