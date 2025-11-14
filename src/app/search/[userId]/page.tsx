'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import Sidebar from '@/components/Sidebar';



// --- 1. ไอคอน (จากหน้า reports) ---
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
const BookIcon = () => (
    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.484 9.332 5 7.5 5S4.168 5.484 3 6.253v13C4.168 18.484 5.668 18 7.5 18s3.332.484 4.5 1.253m0-13C13.168 5.484 14.668 5 16.5 5c1.831 0 3.332.484 4.5 1.253v13C19.832 18.484 18.332 18 16.5 18c-1.831 0-3.332.484-4.5 1.253"></path>
    </svg>
);


// --- Interface ---
interface User { username: string; role: string; }
interface DocumentItem {
    document_id: number;
    report: string;
    nextfocus: string;
    status: '0' | '1';
    date: string;
    users: User;
    user_id: string;
}

export default function ViewUserReportPage() {
    const router = useRouter();
    const params = useParams();
    const viewedUserId = params.userId as string; // 👈 ID ของคนที่เรากำลังดู

    // State
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [viewerRole, setViewerRole] = useState<string | null>(null); // 👈 Role ของคนที่กำลังดู (Admin/Manager)
    const [viewedUser, setViewedUser] = useState<any>(null); // 👈 ข้อมูลของคนที่เรากำลังดู
    const [loading, setLoading] = useState(true);

    // State สำหรับ Edit (เหมือนหน้า reports)
    const [isEditing, setIsEditing] = useState(false);
    const [editingRowIds, setEditingRowIds] = useState<number[]>([]);
    const [newRowCounter, setNewRowCounter] = useState(0);

    // --- Fetch Data ---
    const fetchPageData = async () => {
        if (!viewedUserId) return;
        setLoading(true);

        // 1. ดึงข้อมูล User ที่กำลังดู (สำหรับแสดงชื่อ)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username, firstname, lastname, role, position')
            .eq('id', viewedUserId)
            .single();

        if (userError || !userData) {
            console.error("Error fetching user data:", userError);
            alert("ไม่พบข้อมูลผู้ใช้");
            router.push('/search');
            return;
        }
        setViewedUser(userData);

        // 2. ดึงรายงานของ User คนนั้น
        await fetchUserDocuments(viewedUserId, userData);
        setLoading(false);
    };

    const fetchUserDocuments = async (userId: string, userData: any) => {
        const { data, error } = await supabase
            .from('documents')
            .select(`document_id, report, nextfocus, status, date, user_id`)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (!error) {
            const normalized = (data || []).map((d: any) => ({
                ...d,
                users: { username: userData.username || '', role: userData.role || '' }
            })) as DocumentItem[];
            setDocuments(normalized);
        }
    };

    // --- Effects ---
    useEffect(() => {
        // 1. เช็คสิทธิ์คนดูก่อน
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);

        // ถ้าไม่ใช่ Admin หรือ Manager, ให้ออก
        if (!['admin', 'manager'].includes(user.role)) {
            router.push('/reports'); // ดีดกลับหน้าตัวเอง
            return;
        }

        setViewerRole(user.role); // 👈 เก็บ Role ของคนดู (Admin/Manager)

        // 2. ดึงข้อมูลหน้านี้
        fetchPageData();
    }, [viewedUserId, router]);

    // --- Handlers (เหมือนหน้า reports แต่เพิ่ม Delete) ---

    const handleInputChange = (docId: number, field: keyof DocumentItem, value: string) => {
        setDocuments(prev => prev.map(doc => doc.document_id === docId ? { ...doc, [field]: value } : doc));
    };

    const handleSaveReports = async () => {
        setLoading(true);
        const docsToSave = documents.filter(doc => editingRowIds.includes(doc.document_id));
        try {
            const response = await fetch('/api/save-documents/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: docsToSave }),
            });
            if (!response.ok) throw new Error('Failed to save');
            alert('บันทึกข้อมูลเรียบร้อย!');
            setEditingRowIds([]);
            setIsEditing(false);
            if (viewedUser) await fetchUserDocuments(viewedUserId, viewedUser);
        } catch (e) { alert('Error saving'); }
        setLoading(false);
    };

    const handleCancelEdit = () => {
        if (viewedUser) fetchUserDocuments(viewedUserId, viewedUser); // โหลดข้อมูลใหม่
        setEditingRowIds([]);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        if (!isEditing) {
            setIsEditing(true);
            setEditingRowIds(documents.map(doc => doc.document_id));
        } else {
            handleSaveReports();
        }
    };

    // 👈 [สำคัญ] แก้ไข AddNewRow ให้ใช้ ID ของคนที่ถูกดู
    const handleAddNewRow = () => {
        if (!viewedUser) return;
        const tempId = -(newRowCounter + 1);
        setNewRowCounter(prev => prev + 1);
        const newDoc: DocumentItem = {
            document_id: tempId,
            report: '', nextfocus: '', status: '0',
            date: new Date().toISOString().split('T')[0],
            user_id: viewedUserId, // 👈 ใช้ ID ของคนที่กำลังถูกดู
            users: { username: viewedUser.username, role: viewedUser.role }
        };
        setDocuments(prev => [newDoc, ...prev]);
        setEditingRowIds(prev => [tempId, ...prev]);
        setIsEditing(true);
    };

    // 👈 [ใหม่] ฟังก์ชันลบแถว (สำหรับ Admin)
    const handleDeleteReportRow = async (docId: number) => {
        // กันแถวใหม่ที่ยังไม่เซฟ
        if (docId < 0) {
            setDocuments(prev => prev.filter(d => d.document_id !== docId));
            return;
        }

        if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายงานแถวนี้?')) {
            const { error } = await supabase
                .from('documents')
                .delete()
                .eq('document_id', docId);

            if (error) {
                alert('ลบไม่สำเร็จ: ' + error.message);
            } else {
                setDocuments(prev => prev.filter(d => d.document_id !== docId));
            }
        }
    };

    if (loading || !viewedUser || !viewerRole) {
        return (
            <div className="flex h-screen bg-gray-50">

                <div className="flex-1 overflow-auto ml-20 p-8 text-center">กำลังดึงข้อมูล...</div>
            </div>
        );
    }

    return (

        <div className="flex-1 overflow-auto ml-5">
            <div className='my-8'>
                {/* --- Header Row 1: Logo (เหมือนเดิม) --- */}
                <div className="flex justify-end items-center mb-4">
                    <div className="flex items-center gap-2">
                        <BookIcon />
                        <span className="font-bold text-lg" style={{
                            background: 'linear-gradient(to right, #0891b2, #14b8a6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: '#0891b2'
                        }}>
                            {viewedUser.firstname} {viewedUser.role} {viewedUser.position}
                        </span>
                    </div>
                </div>

                {/* --- Header Row 2: Title & Buttons --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            แบบบันทึกการปฏิบัติงาน
                        </h1>
                        <span className="text-lg text-gray-500 font-normal">
                            {viewedUser.username} {viewedUser.role} {viewedUser.position}
                        </span>
                    </div>

                    {/* 👈 3. [สำคัญ] เช็คสิทธิ์คนดู (viewerRole) ก่อนแสดงปุ่ม */}
                    {viewerRole === 'admin' && (
                        <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                                <>
                                    <button type="button" onClick={handleSaveReports} disabled={loading} className="bg-[#333333] text-white px-5 py-2 rounded-lg hover:bg-black transition text-sm font-medium">
                                        {loading ? 'กำลังบันทึก...' : '💾 บันทึก'}
                                    </button>
                                    <button type="button" onClick={handleCancelEdit} className="bg-[#625E5E] text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition text-sm font-medium">
                                        ยกเลิก
                                    </button>
                                </>
                            ) : (
                                <button type="button" onClick={handleEditClick} disabled={loading} className="bg-[#6e6e6e] text-white px-5 py-2 rounded-lg hover:bg-[#5c5a5a] transition text-sm font-medium">
                                    ✏️ แก้ไข
                                </button>
                            )}
                            <button type="button" onClick={handleAddNewRow} disabled={loading || isEditing} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2 rounded-lg hover:shadow-lg transition text-sm font-medium">
                                + เพิ่มรายการ
                            </button>
                        </div>
                    )}
                    {/* (ถ้าเป็น Manager จะไม่เห็นปุ่มอะไรเลย) */}

                </div>

                {/* --- Table/Card Content --- */}
                {documents.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center mx-8">
                        <p className="text-2xl text-gray-500">✅ ไม่พบรายงาน</p>
                        <p className="text-sm text-gray-500 mt-2">ผู้ใช้คนนี้ยังไม่ได้สร้างรายงานใดๆ</p>
                    </div>
                ) : (
                    <div className="mx-auto">
                        {/* Desktop Header */}
                        <div className="hidden md:grid md:grid-cols-10 gap-4 p-6 bg-gray-50 rounded-t-lg">
                            <div className="md:col-span-2 text-sm font-bold text-gray-700 flex items-center"><DateIcon /> วันที่</div>
                            <div className="md:col-span-3 text-sm font-bold text-gray-700 flex items-center"><GoingOnIcon /> สิ่งที่ทำ</div>
                            <div className="md:col-span-3 text-sm font-bold text-gray-700 flex items-center"><NextFocusIcon /> เป้าหมายถัดไป</div>
                            <div className="md:col-span-2 text-sm font-bold text-gray-700 flex items-center"><StatusIcon /> สถานะ</div>
                        </div>

                        {/* Rows */}
                        <div className="space-y-4 md:space-y-0">
                            {documents.map((doc) => {
                                const formattedDate = doc.date ? new Date(doc.date).toISOString().split('T')[0] : '';

                                // 👈 4. [สำคัญ] เช็คสิทธิ์ก่อนเปิดโหมด Edit
                                const isRowEditing = viewerRole === 'admin' && editingRowIds.includes(doc.document_id);

                                return (
                                    <div key={doc.document_id} className={`bg-white md:grid md:grid-cols-10 md:gap-4 md:items-start p-6 rounded-lg shadow-md md:shadow-none md:rounded-none ${doc.document_id < 0 ? 'bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200'} border-b`}>
                                        {/* Date */}
                                        <div className="md:col-span-2 relative group mb-4 md:mb-0">
                                            <label className="md:hidden text-sm font-bold text-gray-700 flex items-center mb-2"><DateIcon /> วันที่</label>
                                            {isRowEditing ? (
                                                <input type="date" value={formattedDate} onChange={(e) => handleInputChange(doc.document_id, 'date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                                            ) : <p className="text-gray-900 mt-1">{doc.date ? new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' }) : '-'}</p>}
                                        </div>

                                        {/* Going on */}
                                        <div className="md:col-span-3 relative group mb-4 md:mb-0">
                                            <label className="md:hidden text-sm font-bold text-gray-700 flex items-center mb-2"><GoingOnIcon /> สิ่งที่ทำ</label>
                                            {isRowEditing ? (
                                                <>
                                                    <textarea value={doc.report || ''} onChange={(e) => handleInputChange(doc.document_id, 'report', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" rows={4} />
                                                    <EditIcon />
                                                </>
                                            ) : <p className="text-gray-700 text-sm whitespace-pre-wrap">{doc.report}</p>}
                                        </div>

                                        {/* Next Focus */}
                                        <div className="md:col-span-3 relative group mb-4 md:mb-0">
                                            <label className="md:hidden text-sm font-bold text-gray-700 flex items-center mb-2"><NextFocusIcon /> เป้าหมายถัดไป</label>
                                            {isRowEditing ? (
                                                <>
                                                    <textarea value={doc.nextfocus || ''} onChange={(e) => handleInputChange(doc.document_id, 'nextfocus', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" rows={4} />
                                                    <EditIcon />
                                                </>
                                            ) : <p className="text-gray-700 text-sm whitespace-pre-wrap">{doc.nextfocus}</p>}
                                        </div>

                                        {/* Status */}
                                        <div className="md:col-span-2 md:pl-2 relative">
                                            <label className="md:hidden text-sm font-bold text-gray-700 flex items-center mb-2"><StatusIcon /> สถานะ</label>
                                            {isRowEditing ? (
                                                <div className="space-y-2">
                                                    <label className="flex items-center text-sm"><input type="radio" name={`s-${doc.document_id}`} value="1" checked={doc.status === '1'} onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)} className="mr-2 text-green-600" /> เสร็จสิ้น</label>
                                                    <label className="flex items-center text-sm"><input type="radio" name={`s-${doc.document_id}`} value="0" checked={doc.status === '0'} onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)} className="mr-2 text-gray-600" /> กำลังดำเนินงาน</label>
                                                    {/* 👈 5. [ใหม่] ปุ่มลบสำหรับ Admin */}
                                                    <button
                                                        onClick={() => handleDeleteReportRow(doc.document_id)}
                                                        className="text-red-600 text-xs hover:underline mt-2"
                                                    >
                                                        ลบแถวนี้
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-sm font-medium text-gray-800 mt-2">
                                                    <span className={`w-3 h-3 rounded-full mr-2 ${doc.status === '1' ? 'bg-[#3FCF38]' : 'bg-[#333333]'}`}></span>
                                                    {doc.status === '1' ? 'เสร็จสิ้น' : 'กำลังดำเนินงาน'}
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
        </div>
    );
}