'use client';
import React, { useState, useEffect } from 'react';

export default function MainContentWrapper({ children }: { children: React.ReactNode; }) {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    useEffect(() => {
        const tracker = document.getElementById('sidebar-width-tracker');
        if (!tracker) return;

        // 1. ตั้งค่าเริ่มต้นจาก attribute ตอนโหลดหน้า
        const initialExpanded = tracker.getAttribute('data-sidebar-expanded') === 'true';
        setIsSidebarExpanded(initialExpanded);

        // 2. สร้าง Observer เพื่อ "ดักฟัง" การเปลี่ยนแปลงของ attribute
        const observer = new MutationObserver(mutations => {
            for (let mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-sidebar-expanded') {
                    const isExpanded = (mutation.target as HTMLElement).getAttribute('data-sidebar-expanded') === 'true';
                    setIsSidebarExpanded(isExpanded); // 3. อัปเดต State เมื่อมีการเปลี่ยนแปลง
                }
            }
        });

        // 4. เริ่มการดักฟัง
        observer.observe(tracker, { attributes: true });

        return () => observer.disconnect();
    }, []);

    // --- คำนวณ margin-left แบบ Responsive ---
    // จอเล็ก (mobile): ไม่มี margin-left
    // จอใหญ่ (sm ขึ้นไป): margin-left จะเปลี่ยนตามสถานะของ sidebar
    const marginLeftClass = isSidebarExpanded ? 'sm:ml-64' : 'sm:ml-20';

    return (
        <main className={`flex-grow p-4 w-full transition-all duration-300 ${marginLeftClass} `}>
            {children}
        </main>
    );
}