// src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    // ย้ายการเรียกใช้ localStorage มาไว้ใน useEffect เพื่อให้โค้ดส่วนนี้ทำงานบน Client เท่านั้น
    const storedUser = localStorage.getItem('currentUser');
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
  }, [router]); // Dependency ถูกต้องแล้ว เพราะ router จะไม่เปลี่ยนค่าบ่อย

  // แสดง Loading ระหว่างรอดีด
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );
}