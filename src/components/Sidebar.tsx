'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book, Users, Search } from 'lucide-react'; // 👈 1. Import ไอคอน
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

    // 👈 2. เพิ่ม State สำหรับเก็บ Role
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    // 👈 3. ดึง Role จาก localStorage เมื่อ Component โหลด
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUserRole(user.role);
        }
    }, [pathname]); // ให้เช็คใหม่ทุกครั้งที่เปลี่ยนหน้า


    // ‼️ 3. สร้างเงื่อนไข: เช็คว่า "ไม่ได้" อยู่หน้า Login
    // (เราจะแสดงปุ่ม Logout เฉพาะเมื่อ "ไม่" อยู่หน้า Login)
    const isNotLoginPage = pathname !== '/login';

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setShowLogoutModal(false);
        router.push('/login'); // กลับไปหน้าแรก (ซึ่งจะ redirect ไป /login)
    };

    // 👈 4. สร้างตัวแปรเช็คสิทธิ์ Admin/Manager
    const isAdminOrManager = currentUserRole === 'admin' || currentUserRole === 'manager';


    // 👈 1. [แก้ไข] ปรับฟังก์ชัน Get Class
    const getButtonClass = (path: string) => {
        const baseClass = "flex flex-col items-center justify-center p-3 rounded-lg transition-colors group w-full";
        if (pathname === path) {
            // เมื่อ Active: พื้นหลังใส, Text/Icon สีเข้ม
            return `${baseClass} bg-transparent text-[#333333]`;
        }
        // เมื่อ Inactive: พื้นหลังใส, Text/Icon สีขาว
        return `${baseClass} bg-transparent text-white hover:bg-white/10`;
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
                    md:rounded-l-1xl overflow-hidden flex-col justify-center gap-4">




                <div className="h-full flex flex-col justify-center items-center px-6 py-8">
                    {/* --- (Sidebar นี้โล่งๆ ไม่มีเมนู) --- */}

                    {/* --- Div หุ้ม 3 ไอคอน --- */}


                    {isAdminOrManager && (
                        <>
                            {/* ปุ่ม 1: รายงาน (ของตัวเอง) */}
                            <div className="mb-6 mt-6 ">
                                <button
                                    onClick={() => router.push('/reports')}
                                    className={getButtonClass('/reports')}
                                    title="รายงาน (ของฉัน)"
                                >
                                    <Book className="w-10 h-10" />
                                    <span className="text-xs mt-1"></span>
                                </button>
                            </div>
                            {/* ปุ่ม 2: จัดการสมาชิก */}
                            <div className="mb-6 mt-6 ">
                                <button
                                    onClick={() => router.push('/manageUser')}
                                    className={getButtonClass('/manageUser')}
                                    title="จัดการสมาชิก"
                                >
                                    <Users className="w-10 h-10" />
                                    <span className="text-xs mt-1"></span>
                                </button>
                            </div>
                            {/* ปุ่ม 3: ค้นหารายงาน */}
                            <div className="mb-6 mt-6 ">
                                <button
                                    onClick={() => router.push('/search')}
                                    className={getButtonClass('/search')}
                                    title="ค้นหารายงาน"
                                >
                                    <Search className="w-10 h-10" />
                                    <span className="text-xs mt-1"></span>
                                </button>
                            </div>
                        </>
                    )}


                </div>

                {/* --- Logout Button for Desktop --- */}
                {isNotLoginPage && (
                    <div className="p-6 border-t border-white/20 flex justify-center w-full">
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
                            ออกจากระบบ
                        </h3>
                        <p className="text-gray-600 mb-8 text-center">คุณต้องการออกจากระบบใช่หรือไม่?</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleLogout}
                                style={{ backgroundColor: '#13B499' }}
                                className="text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                                title="ออกจากระบบ"
                            >
                                ออกจากระบบ
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{ backgroundColor: '#333333' }}
                                className="text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                ยกเลิก
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}