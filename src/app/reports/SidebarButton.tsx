'use client'; 
import React, { useState, useEffect } from 'react';
// import { initDrawers } from 'flowbite'; // ไม่จำเป็นต้องใช้ถ้าควบคุมด้วย State

// กำหนดความกว้างมาตรฐาน
const WIDE_WIDTH = 'w-64';    // กว้างปกติ (256px)
const COLLAPSED_WIDTH = 'w-20'; // ยุบแล้ว (80px)

export default function Sidebar() {
    // State สำหรับ Desktop: true=กว้าง, false=ยุบ
    const [isExpanded, setIsExpanded] = useState(true);
    // State สำหรับ Mobile: true=เปิด, false=ปิด (ใช้เป็น Drawer/Overlay ในจอเล็ก)
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleDesktop = () => setIsExpanded(prev => !prev);
    const toggleMobile = () => setIsMobileOpen(prev => !prev);
    
    // Class สำหรับความกว้าง Sidebar ใน Desktop (sm: ขึ้นไป)
    const desktopWidthClass = isExpanded ? WIDE_WIDTH : COLLAPSED_WIDTH;

    // Class สำหรับ Mobile: Drawer/Overlay
    const mobileTransformClass = isMobileOpen ? 'translate-x-0' : '-translate-x-full';
    
    // 💡 ส่งสถานะ isExpanded ไปยัง Hidden Div เพื่อให้ MainContentWrapper อ่านค่าได้
    useEffect(() => {
        const tracker = document.getElementById('sidebar-width-tracker');
        if (tracker) {
            tracker.setAttribute('data-sidebar-expanded', isExpanded.toString());
        }
    }, [isExpanded]);

    // Cleanup: ไม่ใช้ Flowbite initDrawers 

    return (
        <>
            {/* ----------------------------------------------- */}
            {/* 1. MOBILE TOGGLE BUTTON (แสดงในจอเล็กเท่านั้น) */}
            {/* ----------------------------------------------- */}
            <button
                onClick={toggleMobile}
                type="button"
                className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 fixed top-0 left-0 z-50"
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                </svg>
            </button>

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
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    
                    {/* **Desktop Collapse Button** */}
                    <button 
                        onClick={toggleDesktop} 
                        className={`hidden sm:block p-2 mb-4 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 
                                    ${isExpanded ? 'float-right' : 'mx-auto'}`}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                        {/* ไอคอนสำหรับ ยุบ/ขยาย */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isExpanded ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M6 5l7 7-7 7"}></path>
                        </svg>
                    </button>
                    
                    {/* **Mobile Close Button** */}
                    {isMobileOpen && (
                         <button 
                            onClick={toggleMobile} 
                            className="p-2 sm:hidden text-gray-500 float-right hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}

                    <ul className="space-y-2 font-medium mt-12 sm:mt-0">
                        {/* -------------------------------------------------------------------------------- */}
                        {/* ⚠️ ต้องปรับ Logic ใน Menu Items ให้แสดงเฉพาะ Icon เมื่อยุบ (ใช้ isExpanded) */}
                        {/* -------------------------------------------------------------------------------- */}
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                {isExpanded && <span className="ms-3">Dashboard</span>}
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 18 18">
                                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                                </svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Kanban</span>}
                                {isExpanded && <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">Pro</span>}
                            </a>
                        </li>
                        {/*... Menu Items อื่นๆ ของคุณ (ปรับใช้ isExpanded) ...*/}
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">...</svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Inbox</span>}
                                {isExpanded && <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">3</span>}
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 18">...</svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Users</span>}
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">...</svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Products</span>}
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="none" viewBox="0 0 18 16">...</svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Sign In</span>}
                            </a>
                        </li>
                        <li>
                            <a href="#" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className={`shrink-0 h-5 transition duration-75 ${isExpanded ? 'w-5' : 'w-full'}`} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">...</svg>
                                {isExpanded && <span className="flex-1 ms-3 whitespace-nowrap">Sign Up</span>}
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
            
            {/* ----------------------------------------------- */}
            {/* 3. MOBILE OVERLAY & STATE TRACKER */}
            {/* ----------------------------------------------- */}
            {isMobileOpen && (
                <div 
                    onClick={toggleMobile} 
                    className="fixed inset-0 z-30 bg-gray-900 opacity-50 sm:hidden" 
                ></div>
            )}

            {/* Hidden Div สำหรับส่งสถานะไป MainContentWrapper */}
            <div 
                id="sidebar-width-tracker" 
                data-sidebar-expanded={isExpanded} 
                className="hidden" 
            ></div>
        </>
    );
}