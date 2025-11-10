// src/app/reports/page.tsx
// นี่คือ Server Component ที่ดึงข้อมูลโดยตรงจาก Supabase
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';
import SidebarButton from './SidebarButton'; // <-- นำเข้า Component ใหม่
// --- 1. TypeScript Interfaces (อ้างอิงจาก Schema ล่าสุดของคุณ) ---
interface User {
    UID: number;
    name: string;
    role: string;
}

interface DocumentItem {
    Document_id: number;
    report: string;
    details: string | null;
    status: '0' | '1'; // 0=กำลังแก้ไข, 1=เสร็จสิ้น
    date: string;
    UID: User; // ข้อมูลผู้สร้างที่ Join มาจากตาราง user ผ่านคอลัมน์ uid
    deepLink: string;
}

// --- 2. Data Fetching Function with Correct JOIN ---
async function fetchDocumentsWithUsers(): Promise<DocumentItem[]> {
    console.log("Attempting to fetch documents and join user data...");

    const { data, error } = await supabase
        // **ใช้ชื่อตาราง:** ใช้ 'documents' (ตัวเล็ก) ตาม Diagram และ Best Practice
        // **ระบุสกีมาที่ใช้ ปลายทาง
        .schema('Timesheet')
        .from('documents')
        .select('*')


    if (error) {
        // หากมี error จะแสดงโค้ด (เช่น PGRST205, 42703) ใน console
        console.error(error);
        return [];
    }

    console.log(' Data fetched successfully (with Join):', data);

    // **แก้ไขการแปลงข้อมูล:** ต้องใส่ 'role' เข้าไปใน object 'uid'
    return data.map((item: any) => ({
        Document_id: item.Document_id,
        report: item.report,
        details: item.details,
        status: item.status as '0' | '1',
        date: item.date,
        // การจัดการ User ที่ถูก Join เข้ามาใน property 'uid'
        UID: {
            UID: item.UID,
            name: item.UID.NAME,
            role: item.UID.ROLE, // <-- เพิ่ม role
        },
        deepLink: `/reports/${item.Document_id}/view`,
    }));
}


// --- 3. Page Component (Main Export) ---
export default async function DocumentsListPage() {
    // เรียกใช้ฟังก์ชันดึงข้อมูลพร้อม Join
    const documents = await fetchDocumentsWithUsers();

    // ฟังก์ชันช่วยแปลง role code เป็นข้อความที่อ่านได้
    const getRoleName = (roleCode: string) => {
        switch (roleCode) {
            case '0': return 'Frontend';
            case '1': return 'Backend';
            case '2': return 'UX/UI';
            default: return 'Unknown';
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-7xl">
            {/*SideBar*/}
            <SidebarButton />




            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                📋 รายการรายงาน ({documents.length} รายการ)
            </h1>

            {/* ส่วนควบคุม (Search, Filter) - ใช้ Placeholder ไว้ก่อน */}
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="ค้นหารายงาน..."
                    className="p-2 border border-gray-300 rounded-md w-1/3 shadow-sm"
                />
                <Link
                    href="/reports/new"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-150"
                >
                    + สร้างรายงานใหม่
                </Link>
            </div>

            {/* ตารางแสดงผล */}
            {documents.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-white shadow-md">
                    <p className="text-2xl text-red-500">❌ ไม่พบข้อมูลในระบบ</p>
                    <p className="text-sm text-gray-500 mt-2">โปรดตรวจสอบข้อมูลในตาราง Supabase (documents และ user) และการตั้งค่า Foreign Key</p>
                </div>
            ) : (
                <div className="shadow overflow-hidden border-b border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By / Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="relative px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {documents.map((doc) => (
                                <tr key={doc.Document_id} className="hover:bg-gray-50 transition duration-100">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.report}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.status === '1' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {doc.status === '1' ? 'เสร็จสิ้น' : 'กำลังแก้ไข'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        **{doc.UID.name}** <br />
                                        <span className="text-xs text-gray-400">({getRoleName(doc.UID.role)})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={doc.deepLink}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}