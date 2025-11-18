// src/app/api/save-documents/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";
// ใช้ Service Role Key เหมือนกับหน้า custom-login
// และเพิ่ม options เพื่อให้ bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Received body:", body);

    const { documents } = body;

    if (!documents || !Array.isArray(documents)) {
      console.error("❌ Invalid documents data:", documents);
      return NextResponse.json(
        { error: "Invalid documents data" },
        { status: 400 }
      );
    }

    console.log("📝 Saving documents:", documents);

    const results = [];

    for (const doc of documents) {
      console.log("📄 Raw document:", doc);

      // ตรวจสอบว่ามีข้อมูลครบหรือไม่
      if (!doc.user_id) {
        console.error("❌ Missing user_id:", doc);
        return NextResponse.json(
          { error: "Missing user_id in document", document: doc },
          { status: 400 }
        );
      }

      // ✨ [REFACTORED] สร้าง data object ที่มีฟิลด์ทั้งหมดในครั้งเดียว
      const docData = {
        user_id: doc.user_id,
        report: doc.report || "",
        nextfocus: doc.nextfocus || "",
        status: doc.status || "",
        date: doc.date || new Date().toISOString().split("T")[0],
        remark: doc.remark || null, // ✨ (เพิ่ม) ถ้า remark ว่างให้เป็น null
        updated_at: new Date().toISOString(), // ✨ (แก้ไข) เพิ่มการกำหนดค่า updated_at ให้เป็นเวลาปัจจุบันเสมอ
        last_editor_id: doc.last_editor_id || null, // ✨ (เพิ่ม)
        is_remark_read: doc.is_remark_read, // ✨ (เพิ่ม)
        is_read_by_admin: doc.is_read_by_admin, // ✨ (เพิ่ม)
      };

      console.log("📄 Processing document:", {
        id: doc.document_id,
        data: docData,
      });

      if (doc.document_id < 0) {
        // Validation: Ensure either report or nextfocus is not empty for new documents
        if (doc.report.trim() === "" && doc.nextfocus.trim() === "") {
          console.error(
            "❌ Validation failed: 'report' or 'nextfocus' must not be empty for new document.",
            doc
          );
          return NextResponse.json(
            {
              error:
                "กรุณากรอกข้อมูลในช่อง 'Going on' หรือ 'Next Focus' อย่างน้อยหนึ่งช่องสำหรับเอกสารใหม่",
              document: doc,
            },
            { status: 400 }
          );
        }

        // INSERT - ใช้ docDataForInsert (มี user_id)
        console.log("➕ Attempting INSERT:", docData);

        const { data, error } = await supabaseAdmin
          .from("documents")
          .insert(docData)
          .select();

        if (error) {
          console.error("❌ INSERT Error:", error);
          return NextResponse.json(
            { error: `INSERT failed: ${error.message}`, details: error },
            { status: 500 }
          );
        }

        console.log("✅ INSERT Success:", data);
        results.push({ action: "insert", data });
      } else {
        // UPDATE - ลบ user_id ออกก่อน เพราะไม่ควรเปลี่ยนเจ้าของ
        const { user_id, ...updateData } = docData;
        console.log("✏️ Attempting UPDATE:", doc.document_id, updateData);
        const { data, error } = await supabaseAdmin
          .from("documents")
          .update(updateData)
          .eq("document_id", doc.document_id)
          .select();

        if (error) {
          console.error("❌ UPDATE Error:", error);
          return NextResponse.json(
            { error: `UPDATE failed: ${error.message}`, details: error },
            { status: 500 }
          );
        }

        console.log("✅ UPDATE Success:", data);
        results.push({ action: "update", data });
      }
    }

    console.log("🎉 All operations successful:", results);

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (err: any) {
    console.error("💥 API Error:", err);
    console.error("💥 Error stack:", err.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
