'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

// กำหนดความกว้างมาตรฐาน
const WIDE_WIDTH = 'w-64';    // กว้างปกติ (256px)
const COLLAPSED_WIDTH = 'w-20'; // ยุบแล้ว (80px)

// Simple LogoutIcon component (SVG)
function LogoutIcon() {
    return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
    );
}

function CollapseIcon({ isExpanded }: { isExpanded: boolean }) {
    // ไอคอนจะเปลี่ยนไปตามสถานะ isExpanded
    const pathData = isExpanded
        ? "M15 19l-7-7 7-7" // Arrow pointing left (to collapse)
        : "M9 5l7 7-7 7";    // Arrow pointing right (to expand)
    return (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={pathData}></path></svg>
    );
}
export default function Sidebar() {
    const router = useRouter();
    const users = [
        { id: 'boss', name: 'Boss', color: 'bg-neutral-500' },
        { id: 'nip', name: 'Nip', color: 'bg-neutral-500' },
        { id: 'pon', name: 'Pon', color: 'bg-neutral-500' },
    ];
    // State สำหรับ Desktop: true=กว้าง, false=ยุบ
    const [isExpanded, setIsExpanded] = useState(true);
    // State สำหรับ Mobile: true=เปิด, false=ปิด (ใช้เป็น Drawer/Overlay ในจอเล็ก)
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    // --- 2. State ใหม่ สำหรับ "จำ" ว่าใคร Active ---
    const [activeUser, setActiveUser] = useState<string | null>(null);


    const toggleDesktop = () => setIsExpanded(prev => !prev);
    const toggleMobile = () => setIsMobileOpen(prev => !prev);

    // Class สำหรับความกว้าง Sidebar ใน Desktop (sm: ขึ้นไป)
    const desktopWidthClass = isExpanded ? WIDE_WIDTH : COLLAPSED_WIDTH;

    // Class สำหรับ Mobile: Drawer/Overlay
    const mobileTransformClass = isMobileOpen ? 'translate-x-0' : '-translate-x-full';

    const pathname = usePathname(); // 👈 อ่าน path (เช่น /login)
    const searchParams = useSearchParams(); // 👈 อ่าน query (เช่น ?user=boss)า

    useEffect(() => {
        let currentActiveUser = null;

        if (pathname === '/login') {
            // 1. ถ้าเราอยู่ที่หน้า Login
            currentActiveUser = searchParams.get('user'); // 👈 อ่าน 'boss' จาก URL

        } else if (pathname.startsWith('/reports')) {
            // 2. ถ้าเราอยู่ที่หน้า Reports
            const storedUser = localStorage.getItem('currentUser'); // 👈 อ่าน 'nip' จาก localStorage
            if (storedUser) {
                currentActiveUser = JSON.parse(storedUser).name;
            }
        }

        setActiveUser(currentActiveUser); // 👈 ตั้งค่า Active

    }, [pathname, searchParams]); // 👈 ‼️ รันใหม่ทุกครั้งที่ URL เปลี่ยน ‼️



    return (
        <>
            {/* ----------------------------------------------- */}
            {/* 1. MOBILE TOGGLE BUTTON (แสดงเมื่อ Sidebar ปิด) */}
            {/* ----------------------------------------------- */}
            {!isMobileOpen && (
                <button
                    onClick={toggleMobile}
                    type="button"
                    className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 fixed top-0 left-0 z-50"
                >
                    <>
                        <span className="sr-only">Open sidebar</span>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                        </svg>
                    </>
                </button>
            )}

            {/* ----------------------------------------------- */}
            {/* 2. ASIDE SIDEBAR (Desktop Push & Collapse) */}
            {/* ----------------------------------------------- */}
            <aside
                id="default-sidebar"
                className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300  
                           ${mobileTransformClass} sm:translate-x-0 sm:relative 
                           ${desktopWidthClass}`} // ควบคุมความกว้าง
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-2 overflow-y-auto bg-[#333333] flex flex-col">

                    {/* --- Header ของ Sidebar (ปุ่มย้อนกลับ และ ปุ่มปิด Mobile) --- */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 text-white rounded-lg hover:bg-gray-700 group flex items-center"
                            title="Back to Home"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            {isExpanded && (
                                <span className="ms-3 font-bold"></span>
                            )}
                        </button>

                        {/* **Mobile Close Button** (แสดงเฉพาะตอน Sidebar เปิด) */}
                        {isMobileOpen && (
                            <button onClick={toggleMobile}
                                type="button"
                                title="Close sidebar"
                                className="p-2 sm:hidden text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        )}
                    </div>

                    <ul className="space-y-2 flex-grow flex flex-col justify-center ">
                        {users.map((user) => (
                            <li key={user.id} className='pb-2'>
                                <Link
                                    // ‼️ นี่คือส่วนที่ "เด้งกลับไป login ใหม่" ‼️
                                    href={`/login?user=${user.id}`}
                                    className={`flex flex-col items-center justify-center text-white rounded-lg group transition-all duration-300
                                        ${isExpanded ? 'p-10' : 'p-2'}
                                        ${
                                        // 8. เช็คว่า User คนนี้ Active หรือไม่
                                        activeUser === user.id
                                            ? 'bg-neutral-900'
                                            : 'hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    {/* --- วงกลม Avatar (ปรับขนาดตาม isExpanded) --- */}
                                    <div
                                        className={`rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'w-16 h-16' : 'w-12 h-12'} ${activeUser === user.id ? 'bg-black' : user.color}`}
                                    >
                                        <svg className={`text-white transition-all duration-300 ${isExpanded ? 'w-10 h-10' : 'w-8 h-8'}`} fill="currentColor" viewBox="0 0 24 24">

                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />

                                        </svg>
                                    </div>

                                    {/* (ชื่อ) */}
                                    {isExpanded && (
                                        <span className="mt-4 text-xl font-bold">{user.name}</span>
                                    )}
                                </Link>
                            </li>
                        ))}

                    </ul>
                    {/* --- 2. ‼️ ปุ่ม Logout (อัปเดต) ‼️ --- */}
                    {/* 👈 1. เพิ่มเงื่อนไข: "ถ้าอยู่ที่หน้า /reports เท่านั้น" */}
                    {pathname.startsWith('/reports') && (
                        <div className="mt-auto pt-4 border-t border-gray-700">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('currentUser');
                                    router.push('/');
                                }}
                                className="flex items-center p-4 text-white rounded-lg group hover:bg-gray-700 w-full"
                                title="Logout"
                            >
                                <LogoutIcon />
                                {isExpanded && (
                                    <span className="ms-3 font-bold">Logout</span>
                                )}
                            </button>
                        </div>
                    )} {/* 👈 2. ปิดวงเล็บเงื่อนไข */}
                    {/* ---------------------------------- */}

                    {/* --- 3. ‼️ ปุ่ม Collapse/Expand (สำหรับ Desktop) ‼️ --- */}
                    <div className="hidden sm:block mt-2">
                        <button
                            onClick={toggleDesktop}
                            className="flex items-center p-4 text-white rounded-lg group hover:bg-gray-700 w-full"
                            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            <CollapseIcon isExpanded={isExpanded} />
                            {isExpanded && (
                                <span className="ms-3 font-bold">Collapse</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside >

            {/* ----------------------------------------------- */}
            {/* 3. MOBILE OVERLAY & STATE TRACKER */}
            {/* ----------------------------------------------- */}
            {
                isMobileOpen && (
                    <div
                        onClick={toggleMobile}
                        className="fixed inset-0 z-30 bg-gray-900 opacity-50 sm:hidden"
                    ></div>
                )
            }

            {/* Hidden Div สำหรับส่งสถานะไป MainContentWrapper */}
            <div
                id="sidebar-width-tracker"
                data-sidebar-expanded={isExpanded}
                className="hidden"
            ></div>
        </>
    );
}