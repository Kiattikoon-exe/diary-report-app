  'use client';
  import React, { useState, Suspense, useEffect } from 'react';
  import { useRouter } from 'next/navigation';

  // ไอคอนคน (สีเขียว)
  const UserIcon = () => (
    <svg className="w-16 h-16 text-teal-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
    </svg>
  );

  // --- ไอคอนหนังสือสำหรับ Logo (Gradient) ---
  const BookIcon = () => (
    <svg className="w-10 h-10" fill="none" stroke="url(#logoGradient)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.484 9.332 5 7.5 5S4.168 5.484 3 6.253v13C4.168 18.484 5.668 18 7.5 18s3.332.484 4.5 1.253m0-13C13.168 5.484 14.668 5 16.5 5c1.831 0 3.332.484 4.5 1.253v13C19.832 18.484 18.332 18 16.5 18c-1.831 0-3.332.484-4.5 1.253"></path>
    </svg>
  );

  export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- ‼️ 2. เพิ่ม useEffect (Guard) ‼️ ---
    // (ฟังก์ชันนี้จะรัน 1 ครั้ง ตอนที่หน้า Login โหลด)
    useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (['admin', 'manager'].includes(user.role)) {
        router.push('/manageUser'); // 👈 เปลี่ยนตรงนี้
      } else {
        router.push('/reports');
      }
    }
  }, [router]);
    // --- (จบส่วนที่เพิ่ม) ---


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
      // 1. เรียก API Login
      const response = await fetch('/api/custom-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, password: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ API ส่ง data.user มาครบแล้ว (มี role, id, firstname ฯลฯ)
        // ไม่ต้อง fetch supabase ซ้ำ! บันทึกได้เลย
        const userData = data.user;
        
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // 👉 ตรวจสอบ Role จากข้อมูลที่ได้มาทันที
        if (['admin', 'manager'].includes(userData.role)) {
          router.push('/manageUser'); // ไปหน้า Admin
        } else {
          router.push('/reports'); // ไปหน้า User ทั่วไป
        }
      } else {
        setError(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
    };

    return (
      //style={{ paddingRight: '200px' }} เผื่อไว้สำหรับ ขยับกล่อง login ให้อยู่กึ่งกลาง
      <div className="flex flex-col items-center justify-center w-full h-full  p-4 sm:p-8 relative"  >
        {/* --- Logo และ Title --- */}
        <div className="absolute top-10 left-4 sm:top-10 sm:left-8 flex items-center space-x-2 sm:space-x-3 z-10">
          <BookIcon />
          <span
            className="text-base sm:text-xl font-bold whitespace-nowrap "
            style={{
              background: 'linear-gradient(to right, #0891b2, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: '#0891b2'
            }}
          >
            Sprouting Tech Time Sheet
          </span>
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200 lg:-ml-36">
          <form onSubmit={handleSubmit}>
            <UserIcon />
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">เข้าสู่ระบบ</h2>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="ผู้ใช้งาน"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-700"
                  required
                />
              </div>
            </div>
            {error && (
              <p className="mt-4 text-red-500 text-sm text-right  p-2 ">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:brightness-75 transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(to right, #0891b2, #14b8a6)' }}
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>


          </form>
        </div>
      </div>
    );
  }