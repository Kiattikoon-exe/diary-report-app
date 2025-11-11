'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

// --- 1. TypeScript Interfaces (เหมือนเดิม) ---
interface User {
    NAME: string;
    ROLE: string;
}

interface DocumentItem {
    Document_id: number; // ‼️ ID จริงจาก DB (จะ > 0) หรือ ID ชั่วคราว (จะ < 0)
    report: string;
    details: string | null;
    nextfocus: string;
    status: '0' | '1';
    date: string;
    user: User;
    UID: number;
}

// --- ไอคอน (เหมือนเดิม) ---
const DateIcon = () => (
    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const GoingOnIcon = () => (
    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const NextFocusIcon = () => (
    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
);
const StatusIcon = () => (
    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const EditIcon = () => (
    <svg className="w-4 h-4 text-gray-400 absolute top-2 right-2 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
);

// --- 2. Page Component (Main Export) ---
export default function DocumentsListPage() {
    const router = useRouter();

    // --- 3. State ---
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [currentUser, setCurrentUser] = useState<{ name: string; uid: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingRowIds, setEditingRowIds] = useState<number[]>([]);
    const [newRowCounter, setNewRowCounter] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    // (ฟังก์ชันดึงข้อมูล - เหมือนเดิม)
    const fetchUserDocuments = async (uid: number) => {
        setLoading(true);
        const { data, error } = await supabase
            .schema('Timesheet')
            .from('documents')
            .select(`Document_id, report, details, nextfocus, status, date, user:UID ( NAME, ROLE )`)
            .eq('UID', uid);

        if (error) {
            console.error("Error fetching documents:", error);
        } else {
            const normalized = (data || []).map((d: any) => ({
                Document_id: d.Document_id,
                report: d.report,
                details: d.details,
                nextfocus: d.nextfocus,
                status: d.status,
                date: d.date,
                UID: d.UID,
                user: Array.isArray(d.user) ? (d.user[0] ?? { NAME: '', ROLE: '' }) : (d.user ?? { NAME: '', ROLE: '' })
            })) as DocumentItem[];
            setDocuments(normalized);
        }
        setLoading(false);
    };

    // --- 4. useEffect (เหมือนเดิม) ---
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchUserDocuments(user.uid);
    }, [router]);

    // --- 5. ฟังก์ชัน "สมอง" (แก้ไข) ---
    const handleInputChange = (docId: number, field: keyof DocumentItem, value: string) => {
        setDocuments(prevDocs =>
            prevDocs.map(doc =>
                doc.Document_id === docId ? { ...doc, [field]: value } : doc
            )
        );
    };

    // --- 6. ‼️ ฟังก์ชัน "บันทึก" (แก้ไข) ‼️ ---
    const handleSaveReports = async () => {
        setLoading(true);

        const upsertPromises: Promise<any>[] = [];

        // ‼️ กรองเอาเฉพาะแถวที่กำลังแก้ไข (จาก List) ‼️
        const docsToSave = documents.filter(doc => editingRowIds.includes(doc.Document_id));

        docsToSave.forEach(doc => { // ‼️ แก้ไข: เปลี่ยน 'documents' เป็น 'docsToSave'
            // 1. แยกข้อมูลสำหรับ DB
            const docData = {
                UID: doc.UID,
                report: doc.report,
                details: doc.details,
                nextfocus: doc.nextfocus,
                status: doc.status,
                date: doc.date
            };

            if (doc.Document_id < 0) {
                // 2a. ถ้าเป็นแถวใหม่ (ID ติดลบ) -> INSERT
                // ‼️ "ห่อ" (Wrap) ด้วย async IIFE ‼️
                upsertPromises.push(
                    (async () => {
                        const res = await supabase.schema('Timesheet').from('documents').insert(docData);
                        return res;
                    })()
                );
            } else {
                // 2b. ถ้าเป็นแถวเก่า (ID เป็นบวก) -> UPDATE
                // ‼️ "ห่อ" (Wrap) ด้วย async IIFE ‼️
                upsertPromises.push(
                    (async () => {
                        const res = await supabase.schema('Timesheet').from('documents').update(docData).eq('Document_id', doc.Document_id);
                        return res;
                    })()
                );
            }
        });

        try {
            await Promise.all(upsertPromises);
            alert('บันทึกข้อมูลเรียบร้อย!');
            // ‼️ เปลี่ยน: ล้าง List แทนการปิด Boolean
            setEditingRowIds([]);
            // ดึงข้อมูลทั้งหมดใหม่ (เพื่อให้ได้ ID ที่ถูกต้อง)
            if (currentUser) fetchUserDocuments(currentUser.uid);
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการบันทึก:", error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setLoading(false);
        }
    };

    // --- 7. ฟังก์ชัน "ยกเลิก" (อัปเกรด) ---
    const handleCancelEdit = () => {
        // ‼️ กรองแถวใหม่ (ชั่วคราว) ที่ยังไม่บันทึกทิ้งไป ‼️
        setDocuments(prev => prev.filter(doc => doc.Document_id > 0));
        setEditingRowIds([]); // 👈 ‼️ เพิ่มบรรทัดนี้ - ล้างการแก้ไขทั้งหมด
        setIsEditing(false); // ปิดโหมดแก้ไข
    };


    
  // --- 8. ‼️ ฟังก์ชัน "แก้ไข" (ใหม่) ‼️ ---
    const handleEditClick = () => {
        // 👈 ตั้งให้แก้ไขได้ทั้งหมด เมื่อกดปุ่ม "แก้ไข"
        const allIds = documents.map(doc => doc.Document_id);
        setEditingRowIds(allIds);
        setIsEditing(true);
    };

    // (หน้า Loading - เหมือนเดิม)
    if (loading || !currentUser) {
        return (
            <div className="ml-64 mr-8 my-8 p-4">
                <div className="flex justify-between items-center mb-6 p-8">
                    <h1 className="text-3xl font-bold text-gray-800">Loading...</h1>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-12 text-center mx-8">
                    <p className="text-gray-500 text-lg">กำลังดึงข้อมูล...</p>
                </div>
            </div>
        );
    }

     // --- 9. ‼️ ฟังก์ชัน "เพิ่มแถวใหม่" (อัปเกรด) ‼️ ---
    const handleAddNewRow = () => {
        if (!currentUser) return;

        const tempId = -(newRowCounter + 1);
        setNewRowCounter(prev => prev + 1);

        const newDocument: DocumentItem = {
            Document_id: tempId,
            report: 'กรอกข้อมูล',
            details: '',
            nextfocus: 'กรอกข้อมูล',
            status: '0',
            date: new Date().toISOString().split('T')[0],
            UID: currentUser.uid,
            user: { NAME: currentUser.name, ROLE: '' }
        };

        setDocuments(prev => [newDocument, ...prev]);
        // 👈 ‼️ ตั้งให้แก้ไขเฉพาะแถวใหม่นี้เท่านั้น
        setEditingRowIds([tempId]);
        setIsEditing(true);
    };
    return (
        <div className="ml-64 mr-8 my-8 p-4">
            {/* --- 9a. Header (หัวข้อและปุ่ม) --- */}
            <div className="flex justify-between items-center mb-6 p-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    แบบบันทึกการปฏิบัติงาน
                    <span className="text-xl text-gray-500 font-normal ml-2">
                        (ของ {currentUser.name})
                    </span>
                </h1>
                <div className="flex gap-2">

                     {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleSaveReports}
                                disabled={loading}
                                className="bg-[#333333] text-white px-5 py-2 rounded-lg hover:bg-black transition text-sm font-medium"
                            >
                                บันทึกการแก้ไข
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-[#625E5E] text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                            >
                                ยกเลิก
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleEditClick}
                                className="bg-[#6e6e6e] text-white px-5 py-2 rounded-lg hover:bg-[#5c5a5a] transition text-sm font-medium"
                            >
                                แก้ไข
                            </button>
                        </>
                    )}

                    {/* ‼️ ปุ่ม "เพิ่มรายการ" */}
                    <button
                        type="button"
                        onClick={handleAddNewRow}
                        disabled={loading || isEditing}
                        className="bg-[#625E5E] text-white px-5 py-2 rounded-lg hover:bg-[#5c5a5a] transition text-sm font-medium disabled:opacity-50"
                    >
                        + เพิ่มรายการ
                    </button>

                </div>
            </div>

            {/* --- 9b. "ตาราง" ที่เปลี่ยนเป็นการ์ด --- */}
            {documents.length === 0 ? (
                // (ถ้าไม่มีข้อมูล)
                <div className="bg-white rounded-lg shadow-lg p-12 text-center mx-8">
                    <p className="text-2xl text-gray-500">✅ ไม่พบรายงาน</p>
                    <p className="text-sm text-gray-500 mt-2">คุณยังไม่ได้สร้างรายงานใดๆ</p>
                </div>
            ) : (
                // (ถ้ามีข้อมูล)
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mx-8">

                    {/* 1. Card Header (หัวตาราง) */}
                    <div className="grid grid-cols-10 gap-4 p-6 border-b bg-gray-50">
                        <div className="col-span-2 text-sm font-bold text-gray-700 flex items-center"><DateIcon /> Date</div>
                        <div className="col-span-3 text-sm font-bold text-gray-700 flex items-center"><GoingOnIcon /> Going on</div>
                        <div className="col-span-3 text-sm font-bold text-gray-700 flex items-center"><NextFocusIcon /> Next Focus</div>
                        <div className="col-span-2 text-sm font-bold text-gray-700 flex items-center"><StatusIcon /> Status</div>
                    </div>

                    {/* 2. Card Body (ข้อมูล) */}
                    {/* ‼️ ลบ "แถวใหม่" (bg-blue-50) ที่แยกไว้ทิ้งไป ‼️ */}
                    {/* (เพราะตอนนี้ "แถวใหม่" อยู่ใน documents.map() แล้ว) */}

                    <div className="divide-y divide-gray-100">
                          {documents.map((doc) => {
                            const formattedDate = new Date(doc.date).toISOString().split('T')[0];
                            
                            // ‼️ ตรวจสอบว่าแถวนี้อยู่ใน editingRowIds หรือไม่
                            const isRowEditing = editingRowIds.includes(doc.Document_id);

                            return (
                                <div key={doc.Document_id} className={`grid grid-cols-10 gap-4 p-6 items-start ${
                                    // 👈 ‼️ ไฮไลท์แถวใหม่ (ชั่วคราว) ‼️
                                    doc.Document_id < 0 ? 'bg-blue-50' : ''
                                    }`}>

                                    {/* --- 1. ปฏิทิน (Date) --- */}
                                    <div className="col-span-2 relative group">
                                        {isRowEditing ? (
                                            <>
                                                <input
                                                    type="date"
                                                    value={formattedDate}
                                                    onChange={(e) => handleInputChange(doc.Document_id, 'date', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                    title="Date"
                                                    placeholder="YYYY-MM-DD"
                                                    aria-label="Date"
                                                />
                                                <EditIcon />
                                            </>
                                        ) : (
                                            <p className="text-gray-900 mt-1">
                                                {new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                                            </p>
                                        )}
                                    </div>

                                    {/* --- 2. Textbox (Going on) --- */}
                                    <div className="col-span-3 relative group">
                                        {isRowEditing ? (
                                            <>
                                                <textarea
                                                    value={doc.report}
                                                    onChange={(e) => handleInputChange(doc.Document_id, 'report', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                    rows={4}
                                                    placeholder="กรอกสิ่งที่ทำวันนี้..."
                                                    title="Going on - รายการที่ทำ"
                                                    aria-label="Going on"
                                                />
                                                <EditIcon />
                                            </>
                                        ) : (
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{doc.report}</p>
                                        )}
                                    </div>

                                    {/* --- 3. Next Focus --- */}
                                    <div className="col-span-3 relative group">
                                        {isRowEditing ? (
                                            <>
                                                <textarea
                                                    value={doc.nextfocus}
                                                    onChange={(e) => handleInputChange(doc.Document_id, 'nextfocus', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                    rows={4}
                                                    placeholder="กรอกสิ่งที่จะทำต่อไป..."
                                                    title="Next focus - สิ่งที่ต้องทำต่อไป"
                                                    aria-label="Next focus"
                                                />
                                                <EditIcon />
                                            </>
                                        ) : (
                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{doc.nextfocus}</p>
                                        )}
                                    </div>

                                    {/* --- 4. Radio/Dots (Status) --- */}
                                    <div className="col-span-2 space-y-3 pl-2 relative">
                                        {isRowEditing ? (
                                            <>
                                                {/* ‼️ โหมดแก้ไข (Radio) - (นี่คือส่วนที่ "แถวใหม่" จะได้รับ) ‼️ */}
                                                <label className="flex items-center text-sm cursor-pointer font-normal text-gray-600">
                                                    <input
                                                        type="radio" 
                                                        name={`status-${doc.Document_id}`} 
                                                        value="0"
                                                        checked={doc.status === '0'}
                                                        onChange={(e) => handleInputChange(doc.Document_id, 'status', e.target.value)}
                                                        className="mr-2 h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                                    />
                                                    กำลังดำเนินงาน
                                                </label>
                                                <label className="flex items-center text-sm cursor-pointer font-normal text-gray-600">
                                                    <input
                                                        type="radio" 
                                                        name={`status-${doc.Document_id}`} 
                                                        value="1"
                                                        checked={doc.status === '1'}
                                                        onChange={(e) => handleInputChange(doc.Document_id, 'status', e.target.value)}
                                                        className="mr-2 h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    เสร็จสิ้น
                                                </label>
                                            </>
                                        ) : (
                                            <>
                                                {/* โหมดดู (จุดสี) */}
                                                <div className="flex items-center text-sm font-medium text-gray-800">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${doc.status === '1' ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}></span>
                                                    เสร็จสิ้น
                                                </div>
                                                <div className="flex items-center text-sm font-medium text-gray-800">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${doc.status === '0' ? 'bg-gray-800' : 'bg-gray-300'
                                                        }`}></span>
                                                    กำลังดำเนินงาน
                                                </div>
                                            </>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
}