// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default function RootPage() {
  const router = useRouter();
  const storedUser = localStorage.getItem('currentUser');
  useEffect(() => {
    
    if (!storedUser) {
      router.push('/login');
    } else {
      
      const user = JSON.parse(storedUser);
      if (['admin', 'manager'].includes(user.role)) {
        router.push('/manageUser');
      } else {
        router.push('/reports');
      }
    }
  }, [router]);

  // แสดง Loading ระหว่างรอดีด
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );
}