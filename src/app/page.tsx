import { redirect } from 'next/navigation';

export default function HomePage() {
  // เมื่อเข้าหน้าแรก (/) ให้เด้งไปหน้า Login 
  redirect('/login');
}