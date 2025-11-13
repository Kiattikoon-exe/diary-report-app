'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ไอคอน Logout (SVG)
const LogoutIcon = () => (
    <svg className="w-12 h-12 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
    </svg>
);
// 👈 2. เพิ่มไอคอน Menu (Hamburger)
const MenuIcon = () => (
    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
);


export default function LoginSidebar() {

    const router = useRouter(); // 👈 2. ใช้ router
    const pathname = usePathname(); // ‼️ 2. อ่าน URL ปัจจุบัน
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // ‼️ 3. สร้างเงื่อนไข: เช็คว่า "ไม่ได้" อยู่หน้า Login
    // (เราจะแสดงปุ่ม Logout เฉพาะเมื่อ "ไม่" อยู่หน้า Login)
    const isNotLoginPage = pathname !== '/login';

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setShowLogoutModal(false);
        router.push('/'); // กลับไปหน้าแรก (ซึ่งจะ redirect ไป /login)
    };

    return (

        // --- ‼️ ASIDE (Side Bar) ‼️ ---

        <>
            {/* --- Mobile Hamburger Menu with Dropdown --- */}
            {isNotLoginPage && (
                <div className="md:hidden fixed top-4 left-4 z-50">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="p-2 bg-white rounded-lg shadow-md"
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </button>
                </div>
            )}

            {/* --- Desktop Sidebar (แสดงเฉพาะจอใหญ่) --- */}
            <aside
                id="login-sidebar"
                className="hidden md:flex md:shrink-0 md:w-48 lg:w-56
                    bg-gradient-to-b from-teal-500 to-cyan-600 
                    md:rounded-l-1xl overflow-hidden flex-col">
                <div className="h-full flex flex-col items-start px-6 py-8">
                    {/* --- (Sidebar นี้โล่งๆ ไม่มีเมนู) --- */}

               

                </div>

                {/* --- Logout Button for Desktop --- */}
                {isNotLoginPage && (
                    <div className="p-6 border-t border-white/20 flex justify-center">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            // ‼️ ปรับ css ปุ่มให้จัดกลาง (flex-col items-center) ‼️
                            className="flex flex-col items-center gap-2 text-white hover:text-teal-100 transition-colors group"
                            title="ออกจากระบบ"
                        >
                            <LogoutIcon />

                        </button>
                    </div>
                )}

            </aside>

            {/* --- Logout Confirmation Modal --- */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center  p-4"
                    aria-labelledby="logout-modal-title"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-sm mx-auto border-1 border-b-[#333333]">
                        <h3 id="logout-modal-title" className="text-xl font-semibold text-gray-800 mb-4 text-center ">
                            ยืนยันการออกจากระบบ
                        </h3>
                        <p className="text-gray-600 mb-8 text-center">คุณต้องการออกจากระบบใช่หรือไม่?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{ backgroundColor: '#333333' }}
                                className="text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{ backgroundColor: '#13B499' }}
                                className="text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                            title="ออกจากระบบ"
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}