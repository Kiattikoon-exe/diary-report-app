'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


// ไอคอนรูปคน
const UserIcon = () => (
    <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

// --- Component หลักของฟอร์ม ---
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. อ่าน 'user' (เช่น 'boss') จาก URL
    const userId = searchParams.get('user') || '';
    const userName = userId ? userId.charAt(0).toUpperCase() + userId.slice(1) : 'Unknown';

    // 2. State สำหรับ form
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- 3. ฟังก์ชัน handleSubmit (ใช้ API จริง) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 3a. เรียก API Route เพื่อตรวจสอบรหัสผ่าน
            const response = await fetch('/api/custom-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userId,
                    password: password,
                }),
            });

            const data = await response.json();

            // 3b. ตรวจสอบผลลัพธ์
            if (response.ok && data.success) {
                // 3c. ถ้าสำเร็จ - บันทึก user ลง localStorage
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                router.push('/reports'); // ไปหน้าตาราง
            } else {
                // 3d. ถ้าล้มเหลว - แสดง error
                setError(data.error || 'รหัสผ่านไม่ถูกต้อง');
                setLoading(false);
            }

        } catch (err) {
            console.error('Login error:', err);
            setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="bg-white rounded-lg border-2 border-black border-solid p-8 shadow-md w-full max-w-prose">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center mb-4">
                        <UserIcon />
                    </div>

                    {/* 4. แสดงชื่อ User ที่กำลังจะ Login */}
                    <h2 className="text-2xl text-center font-bold text-gray-800 mb-2">
                        {userId ? userName : '...'}
                    </h2>
                    <p className="text-md text-center text-gray-500 mb-6">
                        ใส่รหัสเพื่อเข้าระบบ
                    </p>

                    {/* 5. ช่องใส่ Password */}
                    <div className="mb-6">
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 text-gray-900 placeholder-gray-500 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                    </div>

                    {/* 6. ปุ่ม Submit */}
                    <button
                        type="submit"
                        disabled={loading || !userId}
                        className="w-full bg-[#333333] text-white p-3 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'กำลังตรวจสอบ...' : 'ล็อคอิน'}
                    </button>

                    {/* 7. แสดง Error */}
                    {error && (
                        <p className="text-red-500 text-sm text-center mt-4">
                            {error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

// --- 8. Export Component หลัก ห่อด้วย Suspense ---
export default function LoginPage() {
    return (

        <Suspense fallback={<div>Loading User...</div>}>
            <LoginForm />
        </Suspense>

    );
}