// src/utils/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// ตรวจสอบว่า Environment Variables มีค่าหรือไม่
// Next.js จะดึงค่าจาก .env.local โดยอัตโนมัติ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in .env.local');
}

/**
 * Supabase Client Instance
 * ใช้สำหรับเรียกใช้งาน API ของ Supabase
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);