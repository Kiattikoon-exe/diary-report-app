'use client'; 
import { Suspense } from 'react'; // 👈 1. Import Suspense
import { usePathname } from 'next/navigation'; 
import "./globals.css";
import 'flowbite/dist/flowbite.css';
import Sidebar from '@/components/Sidebar'; 
import MainContentWrapper from '@/components/MainContentWrapper'; 

// (Metadata ถูกย้ายออกไป เพราะ 'use client' ใช้ export metadata ไม่ได้)

// (คุณสามารถสร้าง Loading Component สวยๆ ได้ แต่ตอนนี้ใช้แค่นี้ไปก่อน)
function RootLoadingFallback() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* (Sidebar แบบ Loading) */}
      <div className="w-64 h-screen bg-[#333333]"></div>
      {/* (Content แบบ Loading) */}
      <div className="flex-grow p-8">Loading...</div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const pathname = usePathname(); 
  const isHomePage = pathname === '/'; 

  return (
    <html lang="en">
      <body className="antialiased bg-gray-100 dark:bg-gray-900">
        
        {isHomePage ? (
          // 1. ถ้าเป็นหน้า Home: แสดงผลตรงๆ (ไม่มี Sidebar)
          children
        ) : (
          // 2. ถ้าเป็นหน้าอื่น (เช่น /login, /reports):
          // ‼️ "ห่อ" Layout ของเราด้วย <Suspense> ‼️
          <Suspense fallback={<RootLoadingFallback />}>
            <div className="flex min-h-screen bg-gray-100">
              <Sidebar />
              <MainContentWrapper>
                {children}
              </MainContentWrapper>
            </div>
          </Suspense>
        )}
        
      </body>
    </html>
  );
}