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

      // แยก docData สำหรับ INSERT และ UPDATE
      const docDataForInsert = {
        user_id: doc.user_id,
        report: doc.report || "",
        
        nextfocus: doc.nextfocus || "",
        status: doc.status || "",
        date: doc.date || new Date().toISOString().split("T")[0],
      };

      // สำหรับ UPDATE ไม่ต้องส่ง user_id (เพราะไม่ควรเปลี่ยน)
      const docDataForUpdate = {
        report: doc.report || "",
        
        nextfocus: doc.nextfocus || "",
        status: doc.status || "",
        date: doc.date || new Date().toISOString().split("T")[0],
      };

      console.log("📄 Processing document:", {
        id: doc.document_id,
        dataForInsert: docDataForInsert,
        dataForUpdate: docDataForUpdate,
      });

      if (doc.document_id < 0) {
        // INSERT - ใช้ docDataForInsert (มี user_id)
        console.log("➕ Attempting INSERT:", docDataForInsert);

        const { data, error } = await supabaseAdmin
          .from("documents")
          .insert(docDataForInsert)
          .select();

        if (error) {
          console.error("❌ INSERT Error:", error);

          console.log("🔄 Retrying with explicit schema...");
          const { data: data2, error: error2 } = await supabaseAdmin

            .from("documents")
            .insert(docDataForInsert)
            .select();

          if (error2) {
            console.error("❌ INSERT Error (retry):", error2);
            return NextResponse.json(
              { error: `INSERT failed: ${error2.message}`, details: error2 },
              { status: 500 }
            );
          }

          console.log("✅ INSERT Success (retry):", data2);
          results.push({ action: "insert", data: data2 });
          continue;
        }

        console.log("✅ INSERT Success:", data);
        results.push({ action: "insert", data });
      } else {
        // UPDATE - ใช้ docDataForUpdate (ไม่มี user_id)
        console.log("✏️ Attempting UPDATE:", doc.document_id, docDataForUpdate);
        const { data, error } = await supabaseAdmin
          .from("documents")
          .update(docDataForUpdate)
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
