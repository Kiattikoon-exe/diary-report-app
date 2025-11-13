'use client';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import "./globals.css";
import Sidebar from '@/components/Sidebar';
import MainContentWrapper from '@/components/MainContentWrapper';

function RootLoadingFallback() {
  return <div className="flex min-h-screen items-center justify-center bg-gray-100">Loading...</div>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';

  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 text-gray-900 h-screen w-screen overflow-hidden">

        {isHomePage ? (
           children
        ) : (
          <Suspense fallback={<RootLoadingFallback />}>

            {isLoginPage ? (
              // ‼️ Layout สำหรับหน้า Login (เต็มจอ 100%) ‼️
              <div className="flex w-full h-full bg-white">
                {/* Sidebar ซ้าย (สีเขียว) */}
                <Sidebar />

                {/* Content ขวา (กล่อง Login) */}
                <main className="flex-grow flex items-center justify-center bg-gray-50 p-4 relative">
                   {/* (เว้นขอบโค้งๆ ตรงรอยต่อ ถ้าต้องการ) */}
                   <div className="absolute top-0 bottom-0 left-0 w-8 bg-gray-50 rounded-4xl -ml-4 md:block hidden"></div>
                   {children}
                </main>
              </div>
            ) : (
              // ‼️ Layout สำหรับหน้า Reports (มีการ์ดลอย) ‼️
              <div className="flex min-h-screen bg-gray-100 p-4">
                <div className="flex flex-grow shadow-2xl rounded-3xl overflow-hidden bg-white">
                  <Sidebar />
                  <MainContentWrapper>
                    {/* --- เส้นโค้งๆ ที่เคยอยู่ใน Login --- */}
                    <div className="absolute top-0 bottom-0 left-0 w-8 bg-gray-50 rounded-l-3xl -ml-4 md:block hidden"></div>
                    {children}
                  </MainContentWrapper>
                </div>
              </div>
            )}

          </Suspense>
        )}

      </body>
    </html>
  );
}