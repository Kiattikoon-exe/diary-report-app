'use client'; // 👈 1. ต้องเป็น 'use client' เพื่ออ่าน URL
import { usePathname } from 'next/navigation'; // 👈 2. Import hook
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'flowbite/dist/flowbite.css';
import Sidebar from '@/components/Sidebar'; // 👈 3. Import กลับมา
import MainContentWrapper from '@/components/MainContentWrapper'; // 👈 3. Import กลับมา

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// (Metadata ไม่จำเป็นต้องใช้ 'export' ใน 'use client')
// export const metadata: Metadata = { ... };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // --- 4. Logic การซ่อน Sidebar ---
  const pathname = usePathname(); // 👈 อ่าน URL (เช่น / หรือ /login)
  // 👈 (ถ้าอยู่ที่หน้า Home '/') ให้เป็น "Layout ว่าง"
  const isHomePage = pathname === '/'; 

  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 dark:bg-gray-900">
        
        {/* --- 5. เลือก Layout --- */}
        {isHomePage ? (
          // 5a. ถ้าเป็นหน้า Home: แสดงผลตรงๆ (ไม่มี Sidebar)
          children
        ) : (
          // 5b. ถ้าเป็นหน้าอื่น (เช่น /login, /reports):
          // ใช้ Layout ที่มี Sidebar
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <MainContentWrapper>
              {children}
            </MainContentWrapper>
          </div>
        )}
        
      </body>
    </html>
  );
}