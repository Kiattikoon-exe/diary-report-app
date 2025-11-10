// src/app/page.tsx
import { redirect } from 'next/navigation';

// นี่คือ Server Component ที่ทำหน้าที่ Redirect เท่านั้น
export default function HomePage() {
  // สั่งเปลี่ยนเส้นทางไปยังหน้า /reports ทันที
  redirect('/reports');
}