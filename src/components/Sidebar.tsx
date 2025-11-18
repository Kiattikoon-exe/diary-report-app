'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Book, Users, Search, Bell, X, ArrowLeft } from 'lucide-react'; // 👈 1. Import ไอคอน
import { supabase } from '@/utils/supabase/client';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State สำหรับเมนูมือถือ
    const [unreadCount, setUnreadCount] = useState(0); // ✨ (เพิ่ม) State สำหรับนับการแจ้งเตือน

    // 👈 2. เพิ่ม State สำหรับเก็บ Role
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // 👈 3. ดึง Role จาก localStorage เมื่อ Component โหลด
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUserRole(user.role);
            setCurrentUserId(user.id);
        }
    }, [pathname]); // ให้เช็คใหม่ทุกครั้งที่เปลี่ยนหน้า

    // ✨ (เพิ่ม) Effect สำหรับดึงจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
    useEffect(() => {
        if (!currentUserId || !currentUserRole) return;

        const fetchUnreadCount = async () => {
            let query;
            if (currentUserRole === 'admin' || currentUserRole === 'manager') {
                // Admin/Manager: นับเอกสารทั้งหมดที่ยังไม่ได้อ่าน (สมมติมีคอลัมน์ is_read)
                query = supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_read_by_admin', false); // สมมติชื่อคอลัมน์
            } else {
                // User: นับ remark ที่ยังไม่ได้อ่าน
                query = supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUserId)
                    .not('remark', 'is', null)
                    .eq('is_remark_read', false); // สมมติชื่อคอลัมน์
            }

            const { count, error } = await query;
            if (!error && count !== null) {
                setUnreadCount(count);
            }
        };

        fetchUnreadCount();

        // ตั้งค่าให้มีการดึงข้อมูลใหม่ทุกๆ 1 นาที
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);

    }, [currentUserId, currentUserRole, pathname]);

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
        const baseClass = "flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors group w-full";
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
                <div className="md:hidden fixed top-4 left-4 z-40"> {/* ปรับ z-index */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)} // เปิดเมนูมือถือ
                        className="p-2 bg-white rounded-full shadow-lg"
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </button>
                </div>
            )}

            {/* --- Mobile Sidebar (เมนูสไลด์) --- */}
            {isMobileMenuOpen && isNotLoginPage && (
                <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>

                    {/* Sidebar Content */}
                    <div className="fixed top-0 left-0 h-full w-56 bg-gradient-to-b from-teal-500 to-cyan-600 shadow-xl flex flex-col justify-between">
                        <div className="flex justify-end p-4">
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        {/* ✨ (เพิ่ม) ปุ่มย้อนกลับสำหรับมือถือ */}
                        {isNotLoginPage && pathname !== '/reports' && (
                            <div className="w-full pb-5 pt-5">
                                <button
                                    onClick={() => router.back()}
                                    className={getButtonClass('')} // ใช้ class พื้นฐาน
                                    title="ย้อนกลับ"
                                >
                                    <ArrowLeft className="w-10 h-10" />
                                </button>
                            </div>
                        )}
                        {/* Mobile Menu Items */}
                        <nav className="flex flex-col justify-center items-center flex-grow p-4 space-y-4">
                            {isAdminOrManager && (
                                <>
                                    <div className="w-full pb-5 pt-5">
                                        <button
                                            onClick={() => { router.push('/reports'); setIsMobileMenuOpen(false); }}
                                            className={getButtonClass('/reports')}
                                            title="รายงาน (ของฉัน)"
                                        >
                                            <Book className="w-10 h-10 " />
                                        </button>
                                    </div>
                                    <div className="w-full pb-5 pt-5">
                                        <button
                                            onClick={() => { router.push('/manageUser'); setIsMobileMenuOpen(false); }}
                                            className={getButtonClass('/manageUser')}
                                            title="จัดการสมาชิก"
                                        >
                                            <Users className="w-10 h-10" />
                                        </button>
                                    </div>
                                    <div className="w-full pb-5 pt-5">
                                        <button
                                            onClick={() => { router.push('/search'); setIsMobileMenuOpen(false); }}
                                            className={getButtonClass('/search')}
                                            title="ค้นหารายงาน"
                                        >
                                            <Search className="w-10 h-10" />
                                        </button>
                                    </div>
                                </>
                            )}

                        </nav>

                        {/* --- Bottom Icons (Notification & Logout) for Mobile --- */}
                        <div>
                            <div className="p-4 pt-0">
                                <button
                                    onClick={() => { router.push('/notifications'); setIsMobileMenuOpen(false); }}
                                    className={getButtonClass('/notifications')}
                                    title="การแจ้งเตือน"
                                    // ✨ (เพิ่ม) เพิ่ม relative positioning
                                    style={{ position: 'relative' }}
                                >
                                    <Bell className="w-10 h-10" />
                                    {/* ✨ (เพิ่ม) Badge แสดงจำนวน */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                            <div className="p-6 border-t border-white/20 flex justify-center w-full">
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        setShowLogoutModal(true);
                                    }}
                                    className="flex flex-col items-center gap-2 pl-2 text-white hover:text-teal-100 transition-colors group"
                                    title="ออกจากระบบ"
                                >
                                    <LogoutIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* --- Desktop Sidebar (แสดงเฉพาะจอใหญ่) --- */}
            <aside
                id="login-sidebar"
                className="hidden md:flex md:shrink-0 md:w-48 lg:w-56
                    bg-gradient-to-b from-teal-500 to-cyan-600
                    md:rounded-l-1xl overflow-hidden flex flex-col">

                {/* --- Top Icon (Back Button) --- */}
                {/* ✨ (แก้ไข) เพิ่มเงื่อนไขการแสดงผล */}
                {isNotLoginPage && pathname !== '/reports' && (
                    <div className="p-4">
                        <div className="w-full">
                            <button
                                onClick={() => router.back()}
                                className={getButtonClass('')} // ใช้ class พื้นฐาน ไม่ต้อง active
                                title="ย้อนกลับ"
                            >
                                <ArrowLeft className="w-10 h-10" />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- Main Menu Icons (Center) --- */}
                <div className="flex flex-col justify-center items-center flex-grow p-4">
                    {isAdminOrManager && (
                        <>
                            {/* ปุ่ม 1: รายงาน (ของตัวเอง) */}
                            <div className="mb-6 w-full  pb-5 pt-5">
                                <button
                                    onClick={() => router.push('/reports')}
                                    className={getButtonClass('/reports')}
                                    title="รายงาน (ของฉัน)"
                                >
                                    <Book className="w-10 h-10" />
                                </button>
                            </div>
                            {/* ปุ่ม 2: จัดการสมาชิก */}
                            <div className="mb-6 w-full pb-5 pt-5">
                                <button
                                    onClick={() => router.push('/manageUser')}
                                    className={getButtonClass('/manageUser')}
                                    title="จัดการสมาชิก"
                                >
                                    <Users className="w-10 h-10" />
                                </button>
                            </div>
                            {/* ปุ่ม 3: ค้นหารายงาน */}
                            <div className="mb-6 w-full pb-5 pt-5">
                                <button
                                    onClick={() => router.push('/search')}
                                    className={getButtonClass('/search')}
                                    title="ค้นหารายงาน"
                                >
                                    <Search className="w-10 h-10" />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* --- Bottom Icons (Notification & Logout) --- */}
                <div className="mt-auto">
                    {/* ปุ่ม 0: การแจ้งเตือน (สำหรับทุกคน) */}
                    {isNotLoginPage && (
                        <div className="p-4 pt-0">
                            <div className="w-full">
                                <button
                                    onClick={() => router.push('/notifications')}
                                    className={getButtonClass('/notifications')}
                                    title="การแจ้งเตือน"
                                    // ✨ (เพิ่ม) เพิ่ม relative positioning
                                    style={{ position: 'relative' }}
                                >
                                    <Bell className="w-10 h-10" />
                                    {/* ✨ (เพิ่ม) Badge แสดงจำนวน */}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-12 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* --- Logout Button for Desktop --- */}
                    {isNotLoginPage && (
                        <div className="p-6 border-t border-white/20 flex justify-center w-full">
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                // ‼️ ปรับ css ปุ่มให้จัดกลาง (flex-col items-center) ‼️
                                className="flex flex-col items-center gap-2 pl-2 text-white hover:text-teal-100 transition-colors group"
                                title="ออกจากระบบ"
                            >
                                <LogoutIcon />
                            </button>
                        </div>
                    )}
                </div>

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