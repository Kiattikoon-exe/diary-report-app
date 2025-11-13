// src/app/api/custom-login/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. ดึงชื่อ user (name) และรหัสผ่าน (password) ที่ส่งมาจากหน้า Login
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: "Missing name or password" },
        { status: 400 }
      );
    }

    // 2. Query ไปยังตาราง 'user' 
    const { data, error } = await supabaseAdmin

      
      .from("users")
      .select("id, password, username, role, position, firstname, lastname") // 👈 เพิ่ม field ที่ต้องใช้
      .eq("username", name)
      .single();
    // 👇 Debug: แสดงผลลัพธ์จาก Supabase
    console.log("Supabase query result:", { data, error });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "*ไม่พบผู้ใช้ในระบบ" },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 👇 Debug: แสดงการเปรียบเทียบรหัสผ่าน
    console.log("Password comparison:", {
      provided: password,
      stored: data.password,
      match: data.password === password,
    });

    /// 3. ตรวจสอบรหัสผ่าน (แปลงเป็น String ทั้งคู่เพื่อเปรียบเทียบ)
    const storedPassword = String(data.password);
    const providedPassword = String(password);

    if (storedPassword === providedPassword && data.id) {
      // ถ้าถูกต้อง
      console.log("Login successful for:", name);
      // ✅ ส่งข้อมูล User ทั้งหมดกลับไปเลย (หน้าบ้านจะได้ไม่ต้อง query ซ้ำ)
      return NextResponse.json(
        {
          success: true,
          user: {
            id: data.id,
            username: data.username,
            role: data.role, // 👈 ส่ง role กลับไป
            position: data.position, // 👈 ส่ง position กลับไป
            firstname: data.firstname,
            lastname: data.lastname,
          },
        },
        { status: 200 }
      );
    } else {
      // ถ้ารหัสผิด
      console.log("Invalid password for:", name);
      return NextResponse.json(
        { error: "*รหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
