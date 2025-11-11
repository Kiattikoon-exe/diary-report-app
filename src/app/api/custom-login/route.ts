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

    // 2. Query ไปยังตาราง 'user' ใน 'Timesheet'
    const { data, error } = await supabase

      .schema("Timesheet")
      .from("user")
      .select("UID, PASSWORD, NAME")
      .eq("NAME", name)
      .single();
    // 👇 Debug: แสดงผลลัพธ์จาก Supabase
    console.log("Supabase query result:", { data, error });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "User not found or database error" },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 👇 Debug: แสดงการเปรียบเทียบรหัสผ่าน
    console.log("Password comparison:", {
      provided: password,
      stored: data.PASSWORD,
      match: data.PASSWORD === password,
    });


    /// 3. ตรวจสอบรหัสผ่าน (แปลงเป็น String ทั้งคู่เพื่อเปรียบเทียบ)
    const storedPassword = String(data.PASSWORD);
    const providedPassword = String(password);

    if (storedPassword === providedPassword && data.UID) {
      // ถ้าถูกต้อง
      console.log("Login successful for:", name);
      return NextResponse.json(
        {
          success: true,
          user: { name: name, uid: data.UID },
        },
        { status: 200 }
      );
    } else {
      // ถ้ารหัสผิด
      console.log("Invalid password for:", name);
      return NextResponse.json(
        { error: "Invalid password" },
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
