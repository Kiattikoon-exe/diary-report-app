'use client';
import React from 'react';



export default function LoginSidebar() {
    return (

        // --- ‼️ ASIDE (Side Bar) ‼️ ---
        // - flex-shrink-0: ไม่ให้หด
        // - w-64: กำหนดความกว้างคงที่
        // - bg-gradient-to-b: ไล่สี (จาก Teal ไป Cyan)
        // - rounded-l-2xl: ขอบโค้งด้านซ้าย

        <>

            {/* --- Desktop Sidebar (แสดงเฉพาะจอใหญ่) --- */}
            <aside
                id="login-sidebar"
                className="hidden md:flex flex-shrink-0 w-48 lg:w-56
                       bg-gradient-to-b from-teal-500 to-cyan-600 
                       rounded-l-1xl overflow-hidden"
                aria-label="Login Sidebar">
                <div className="h-full flex flex-col items-start px-6 py-8">


                    {/* --- (Sidebar นี้โล่งๆ ไม่มีเมนู) --- */}
                </div>
            </aside>

            {/* --- Mobile Background  --- */}
            <div className="md:hidden fixed inset-0 -z-10" aria-hidden="true" />
        </>
    );
}