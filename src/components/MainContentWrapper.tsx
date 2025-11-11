'use client';
import React from 'react';



export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
    // State สำหรับเก็บสถานะความกว้างของ Sidebar
    return (
        // flex-grow: ทำให้ Content ขยายเต็มพื้นที่ที่เหลือ
        // pt-16: เว้นพื้นที่ด้านบนสำหรับ Mobile Toggle Button
        <main className={`flex-grow p-4 w-full`}>
            {children}
        </main>
    );
}