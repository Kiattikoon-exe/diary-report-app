import React from 'react';
import Link from 'next/link';

// (UserIcon component... อยู่ที่นี่)
const UserIcon = () => (
  <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const users = [
  { id: 'boss', name: 'Boss' },
  { id: 'nip', name: 'Nip' },
  { id: 'pon', name: 'Pon' },
];
export default function HomePage() {
  return (
    <main className="flex flex-col items-center  min-h-screen 
                 bg-white text-gray-800 justify-center " style={{ paddingBottom: 'var(--spacing-lg)' }}>

      <h1 className="text-4xl font-bold mb-4 text-center pt-12" style={{ fontSize: 'var(--font-size-3xl)', paddingBottom: 'var(--spacing-md)' }}>
        แบบบันทึกการปฏิบัติงาน
      </h1>
      <h2 className="text-xl sm:text-2xl text-gray-600 mb-8 sm:mb-12 text-center"
        style={{ fontSize: 'var(--font-size-lg)', paddingBottom: 'var(--spacing-sm)' }}>
        โปรดเลือกผู้ใช้งาน
      </h2>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-8 max-w-4xl mx-auto">
        {users.map((user) => (

          // ‼️ สังเกตการเปลี่ยนแปลงที่นี่ ‼️
          // เรา Link ไปหน้า /login และส่ง "Query Parameter"
          <Link
            href={`/login?user=${user.id}`} // 👈 เปลี่ยนจาก /login/boss เป็น /login?user=boss
            key={user.id}
            className="group"
          >
            <div className="bg-[#333333] text-white w-64 h-64 rounded-2xl
                            flex flex-col items-center justify-center
                            hover:bg-gray-700 transition-all duration-200
                            transform hover:scale-105"
            >
              <UserIcon />
              <span className="text-3xl font-bold mt-4">{user.name}</span>
            </div>
          </Link>

        ))}
      </div>
    </main>
  );
}