'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { supabase } from '@/utils/supabase/client';

// --- 1. TypeScript Interfaces (ปรับตาม ERD) ---
interface User {
    username: string; // 👈 แก้ไข (จาก NAME)
    role: string;
}

interface DocumentItem {
    document_id: number; // 👈 แก้ไข (จาก Document_id)
    report: string;
    nextfocus: string;
    status: '0' | '1';
    date: string;
    users: User;      // 👈 แก้ไข (จาก user)
    user_id: string;  // 👈 แก้ไข (จาก UID)
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
    {/* ‼️ แก้ไข Type: user_id เป็น string (uuid) ‼️ */ }
    // const [currentUser, setCurrentUser] = useState<{ username: string; user_id: string; firstname: string; lastname: string; role: string; position: string; } | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingRowIds, setEditingRowIds] = useState<number[]>([]);
    const [newRowCounter, setNewRowCounter] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const BookIcon = () => (
        <svg className="w-10 h-10" fill="none" stroke="url(#logoGradient)" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.484 9.332 5 7.5 5S4.168 5.484 3 6.253v13C4.168 18.484 5.668 18 7.5 18s3.332.484 4.5 1.253m0-13C13.168 5.484 14.668 5 16.5 5c1.831 0 3.332.484 4.5 1.253v13C19.832 18.484 18.332 18 16.5 18c-1.831 0-3.332.484-4.5 1.253"></path>
        </svg>
    );
    // --- Fetch Data ---
    // --- Fetch Data ---
    const fetchUserDocuments = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            .select(`document_id, report, nextfocus, status, date, user_id`)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (!error) {
            const normalized = (data || []).map((d: any) => ({
                ...d,
                users: { username: currentUser?.username || '', role: currentUser?.role || '' }
            })) as DocumentItem[];
            setDocuments(normalized);
        }
        setLoading(false);
    };

    // --- Effects ---
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/');
            return;
        }
        const user = JSON.parse(storedUser);
        // ‼️ แก้ไขตรงนี้: เปลี่ยนจาก user.uid เป็น user.id
        // และเปลี่ยน user.name เป็น user.firstname หรือ user.username ตามที่ API ส่งมา
        if (user && user.id) {
            setCurrentUser({
                // API ส่ง firstname มา
                user_id: user.id, // ✅ แก้เป็น user.id
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                position: user.position
            });
            fetchUserDocuments(user.id); // ✅ แก้เป็น user.id
        } else {
            // กันเหนียว: ถ้าไม่มี ID ให้ดีดออกไป Login ใหม่
            console.error("User ID not found in session");
            router.push('/login');
        }
    }, [router]);

    // --- Handlers (Save, Cancel, Edit, Add) ---
    const handleInputChange = (docId: number, field: keyof DocumentItem, value: string) => {
        setDocuments(prev => prev.map(doc => doc.document_id === docId ? { ...doc, [field]: value } : doc));
    };


    
    const handleSaveReports = async () => {
        setLoading(true);
        const docsToSave = documents.filter(doc => editingRowIds.includes(doc.document_id)); // 👈 แก้ไข
        console.log("📝 Documents to save:", docsToSave);
        
        

        try {
            const response = await fetch('/api/save-documents/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: docsToSave }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save');

            console.log("✅ Save successful:", result);
            alert('บันทึกข้อมูลเรียบร้อย!');
            setEditingRowIds([]);
            setIsEditing(false);

            if (currentUser) await fetchUserDocuments(currentUser.user_id);
        } catch (error) {
            console.error("💥 Error saving:", error);
            const msg = error instanceof Error ? error.message : 'Unknown error';
            alert(`เกิดข้อผิดพลาด: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setDocuments(prev => prev.filter(doc => doc.document_id > 0)); // 👈 แก้ไข
        setEditingRowIds([]);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        if (!isEditing) {
            setIsEditing(true);
            setEditingRowIds(documents.map(doc => doc.document_id)); // 👈 แก้ไข
        } else {
            handleSaveReports();
        }
    };

    const handleAddNewRow = () => {
        if (!currentUser) return;
        const tempId = -(newRowCounter + 1);
        setNewRowCounter(prev => prev + 1);

        const newDocument: DocumentItem = {
            document_id: tempId, // 👈 แก้ไข
            report: '',
            nextfocus: '',
            status: '0',
            date: new Date().toISOString().split('T')[0],
            user_id: currentUser.user_id, // 👈 แก้ไข
            users: { username: currentUser.username, role: '' }
        };

        setDocuments(prev => [newDocument, ...prev]);
        setEditingRowIds([tempId]);
        setIsEditing(true);
    };

    // --- Render Loading ---
    if (loading || !currentUser) {
        return (
            <div className="flex items-center justify-center w-full h-full p-4 sm:p-8">
                <div className="bg-white rounded-lg shadow-lg p-12 text-center mx-8">
                    <p className="text-gray-500 text-lg">กำลังดึงข้อมูล...</p>
                </div>
            </div>
        );
    }
    return (


        <div className="my-8">
            <div className="flex justify-end items-center mb-4">
                <div className="flex items-center gap-2">
                    <BookIcon />
                    <span className="font-bold text-2xl" style={{
                        background: 'linear-gradient(to right, #0891b2, #14b8a6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: '#0891b2'
                    }}>
                        {currentUser.firstname} {currentUser.role} {currentUser.position}
                    </span>
                </div>
            </div>

            {/* --- 9a. Header (หัวข้อและปุ่ม) --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">

                <h1 className="text-3xl font-bold text-gray-800">
                    แบบบันทึกการปฏิบัติงาน
                </h1>


                <div className="flex flex-wrap gap-2">



                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={handleEditClick}
                                disabled={loading}
                                className="bg-[#333333] text-white px-5 py-2 rounded-lg hover:bg-black transition text-sm font-medium"
                            >
                                {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
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
                        <button
                            type="button"
                            onClick={handleEditClick}
                            disabled={loading}
                            className="bg-[#6e6e6e] text-white px-5 py-2 rounded-lg hover:bg-[#5c5a5a] transition text-sm font-medium"
                        >
                            ✏️ แก้ไข
                        </button>
                    )}

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
                <div className="bg-white rounded-lg shadow-lg p-12 text-center mx-8">
                    <p className="text-2xl text-gray-500">✅ ไม่พบรายงาน</p>
                    <p className="text-sm text-gray-500 mt-2">คุณยังไม่ได้สร้างรายงานใดๆ</p>
                </div>
            ) : (
                <div className="mx-auto">
                    {/* --- Table Header (แสดงเฉพาะจอใหญ่) --- */}
                    <div className="hidden md:grid md:grid-cols-10 gap-4 p-6  bg-gray-50 rounded-t-lg">
                        <div className="md:col-span-2 text-sm font-bold text-gray-700 flex items-center ">
                            <DateIcon /> Date
                        </div>
                        <div className="md:col-span-3 text-sm font-bold text-gray-700 flex items-center">
                            <GoingOnIcon /> Going on
                        </div>
                        <div className="md:col-span-3 text-sm font-bold text-gray-700 flex items-center">
                            <NextFocusIcon /> Next Focus
                        </div>
                        <div className="md:col-span-2 text-sm font-bold text-gray-700 flex items-center">
                            <StatusIcon /> Status
                        </div>
                    </div>
                    {/* --- Responsive Body: Cards on Mobile, Table Rows on Desktop --- */}
                    <div className="space-y-4 md:space-y-0">
                        {documents.map((doc) => {
                            const formattedDate = new Date(doc.date).toISOString().split('T')[0];
                            const isRowEditing = editingRowIds.includes(doc.document_id); // 👈 แก้ไข

                            // --- Card/Row Container ---
                            return (
                                <div key={doc.document_id} className={` 
                                    bg-white md:grid md:grid-cols-10 md:gap-4 md:items-start 
                                    p-6 rounded-lg shadow-md md:shadow-none md:rounded-none 
                                    ${doc.document_id < 0 ? 'bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200'}`}>
                                    {/* --- Date Column --- */}
                                    <div className="md:col-span-2 relative group mb-4 md:mb-0">
                                        <label className="text-sm font-bold text-gray-700 flex items-center mb-2 md:hidden"><DateIcon /> Date</label>
                                        {isRowEditing ? (
                                            <>
                                                <input
                                                    type="date"
                                                    value={formattedDate}
                                                    onChange={(e) => handleInputChange(doc.document_id, 'date', e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                    title="Date"
                                                    placeholder="YYYY-MM-DD"
                                                    aria-label="Date"
                                                />

                                            </>
                                        ) : (
                                            <p className="text-gray-900 mt-1">
                                                {new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                                            </p>
                                        )}
                                    </div>

                                    {/* --- Going on Column --- */}
                                    <div className="md:col-span-3 relative group mb-4 md:mb-0">
                                        <label className="text-sm font-bold text-gray-700 flex items-center mb-2 md:hidden"><GoingOnIcon /> Going on</label>
                                        {isRowEditing ? (
                                            <>
                                                <textarea
                                                    value={doc.report}
                                                    onChange={(e) => handleInputChange(doc.document_id, 'report', e.target.value)}
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

                                    {/* --- Next Focus Column --- */}
                                    <div className="md:col-span-3 relative group mb-4 md:mb-0">
                                        <label className="text-sm font-bold text-gray-700 flex items-center mb-2 md:hidden"><NextFocusIcon /> Next Focus</label>
                                        {isRowEditing ? (
                                            <>
                                                <textarea
                                                    value={doc.nextfocus}
                                                    onChange={(e) => handleInputChange(doc.document_id, 'nextfocus', e.target.value)}
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

                                    {/* --- Status Column --- */}
                                    <div className="md:col-span-2 md:space-y-3 md:pl-2 relative">
                                        <label className="text-sm font-bold text-gray-700 flex items-center mb-2 md:hidden"><StatusIcon /> Status</label>
                                        {isRowEditing ? (
                                            <>

                                                <label className="flex items-center text-sm cursor-pointer font-normal text-gray-600">
                                                    <input
                                                        type="radio"
                                                        name={`status-${doc.document_id}`}
                                                        value="1"
                                                        checked={doc.status === '1'}
                                                        onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)}
                                                        className="mr-2 h-4 w-4 text-teal-500 border-gray-300 focus:ring-green-500"
                                                    />
                                                    เสร็จสิ้น
                                                </label>
                                                <label className="flex items-center text-sm cursor-pointer font-normal text-gray-600">
                                                    <input
                                                        type="radio"
                                                        name={`status-${doc.document_id}`}
                                                        value="0"
                                                        checked={doc.status === '0'}
                                                        onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)}
                                                        className="mr-2 h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                                    />
                                                    กำลังดำเนินงาน
                                                </label>
                                            </>
                                        ) : (
                                            <div className="flex items-center text-sm font-medium text-gray-800">
                                                <span
                                                    className={`w-3 h-3 rounded-full mr-2 ${
                                                        doc.status === '1' ? 'bg-teal-500' : 'bg-[#333333]'
                                                    }`}
                                                ></span>
                                                {doc.status === '1'
                                                    ? 'เสร็จสิ้น'
                                                    : 'กำลังดำเนินงาน'}
                                            </div>
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