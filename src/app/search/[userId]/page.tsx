'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';



// --- 1. ไอคอน (จากหน้า reports) ---
const DateIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const GoingOnIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const NextFocusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
);
// ✨ (เพิ่ม) ไอคอนสำหรับ Remark
const RemarkIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z"></path></svg>
);

const StatusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);
const EditIcon = () => (
    <svg className="w-4 h-4 text-gray-400 absolute top-2 right-2 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"></path></svg>
);
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

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{children}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg transition-shadow">ยืนยัน</button>
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-[#333333] text-white hover:bg-black transition-colors">ยกเลิก</button>
                </div>
            </div>
        </div>
    );
};

const InfoModal = ({ isOpen, onClose, title, children, showCancelButton = true }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, showCancelButton?: boolean }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{children}</p>
                <div className={`flex gap-4 ${showCancelButton ? 'justify-end' : 'justify-center'}`}>
                    {showCancelButton && (<button onClick={onClose} className="px-6 py-2 rounded-lg bg-[#333333] text-white hover:bg-black transition-colors">ยกเลิก</button>)}
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg transition-shadow">ตกลง</button>
                </div>
            </div>
        </div>
    );
};

const formatDateForInput = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
    remark: string; // ✨ (เพิ่ม)
}

export default function ViewUserReportPage() {
    const router = useRouter();
    const params = useParams();
    const tableContainerRef = React.useRef<HTMLDivElement>(null);
    const viewedUserId = params.userId as string; // 👈 ID ของคนที่เรากำลังดู

    // State
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [viewer, setViewer] = useState<any>(null); // 👈 Role และ ID ของคนที่กำลังดู
    const [viewerRole, setViewerRole] = useState<string | null>(null); // 👈 Role ของคนที่กำลังดู (Admin/Manager)
    const [viewedUser, setViewedUser] = useState<any>(null); // 👈 ข้อมูลของคนที่เรากำลังดู
    const [loading, setLoading] = useState(true);

    // State สำหรับ Edit (เหมือนหน้า reports)
    const [isEditing, setIsEditing] = useState(false);
    const [editingRowIds, setEditingRowIds] = useState<number[]>([]);
    const [originalDocuments, setOriginalDocuments] = useState<DocumentItem[]>([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modals
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

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
            // alert("ไม่พบข้อมูลผู้ใช้");
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
            // ✨ (แก้ไข) เพิ่ม remark
            .select(`document_id, report, nextfocus, status, date, user_id, remark`)
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (!error) {
            const normalized = (data || []).map((d: any) => ({ // เพิ่ม remark: d.remark || ''
                ...d,
                users: { username: userData.username || '', role: userData.role || '' }
            })) as DocumentItem[];
            setDocuments(normalized);
            setOriginalDocuments(JSON.parse(JSON.stringify(normalized)));
        }
    };

    const totalPages = Math.ceil(documents.length / itemsPerPage);
    const paginatedDocuments = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // --- Effects ---
    useEffect(() => {
        // 1. เช็คสิทธิ์คนดูก่อน
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);

        const isAdminOrManager = user.role === 'admin' || user.role === 'manager';
        // ถ้าไม่ใช่ Admin หรือ Manager, ให้ออก
        if (!isAdminOrManager) {
            router.push('/reports'); // ดีดกลับหน้าตัวเอง
            return;
        }

        setViewer(user); // 👈 เก็บข้อมูลคนดูทั้งหมด
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
        setShowSaveConfirmModal(false);

        const docsToSave = documents.filter(doc => {
            if (!editingRowIds.includes(doc.document_id)) return false;
            if (doc.document_id < 0) return true;
            const originalDoc = originalDocuments.find(orig => orig.document_id === doc.document_id);
            if (!originalDoc) return false;
            // ✨ (แก้ไข) เพิ่ม remark ในการตรวจสอบ
            return originalDoc.report !== doc.report ||
                originalDoc.nextfocus !== doc.nextfocus ||
                originalDoc.date !== doc.date ||
                originalDoc.status !== doc.status ||
                originalDoc.remark !== doc.remark;
        });

        // ✨ (แก้ไข) เพิ่ม last_editor_id และสถานะการอ่านเข้าไปในข้อมูลที่จะบันทึก
        const payload = docsToSave.map(doc => ({
            ...doc,
            last_editor_id: viewer.id, // ID ของ Admin/Manager ที่กำลังแก้ไข
            // เมื่อมีการแก้ไขโดย Admin/Manager ให้ถือว่า user ยังไม่ได้อ่าน remark ใหม่
            is_remark_read: false,
            // และให้ถือว่า Admin ได้อ่านการเปลี่ยนแปลงนี้แล้ว
            is_read_by_admin: true,
        }));

        try {
            const response = await fetch('/api/save-documents/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: payload }), // ✨ (แก้ไข) ส่ง payload ที่มีข้อมูลครบถ้วน
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save');

            setShowSuccessModal(true);
            setEditingRowIds([]);
            setIsEditing(false);
            if (viewedUser) {
                await fetchUserDocuments(viewedUserId, viewedUser);
                setCurrentPage(1);
            }
        } catch (error) {
            console.error("💥 Error saving:", error);
            const msg = error instanceof Error ? error.message : 'Unknown error';
            alert(`เกิดข้อผิดพลาด: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setDocuments(originalDocuments);
        setEditingRowIds([]);
        setIsEditing(false);
    };

    const handleEditClick = () => {
        if (!isEditing) {
            setOriginalDocuments(JSON.parse(JSON.stringify(documents)));
            setIsEditing(true);
            setEditingRowIds(documents.map(doc => doc.document_id));
        } else {
            const hasEmptyNewRow = documents.some(doc =>
                doc.document_id < 0 && doc.report.trim() === '' && doc.nextfocus.trim() === ''
            );
            if (hasEmptyNewRow) {
                setShowInfoModal(true);
                return;
            }

            const hasChangesInExistingRows = documents.some(doc => {
                if (doc.document_id >= 0) {
                    const originalDoc = originalDocuments.find(orig => orig.document_id === doc.document_id);
                    // ✨ (แก้ไข) เพิ่ม remark ในการตรวจสอบ
                    return originalDoc && (
                        originalDoc.report !== doc.report ||
                        originalDoc.nextfocus !== doc.nextfocus ||
                        originalDoc.date !== doc.date ||
                        originalDoc.status !== doc.status ||
                        originalDoc.remark !== doc.remark);
                }
                return false;
            });

            if (!hasChangesInExistingRows && !documents.some(doc => doc.document_id < 0)) {
                handleCancelEdit();
                return;
            }
            setShowSaveConfirmModal(true);
        }
    };

    // 👈 [ใหม่] ฟังก์ชันลบแถว (สำหรับ Admin)
    const confirmDeleteReport = async () => {
        if (deleteTarget === null) return;

        if (deleteTarget < 0) {
            setDocuments(prev => prev.filter(d => d.document_id !== deleteTarget));
            setDeleteTarget(null);
            return;
        }

        const { error } = await supabase.from('documents').delete().eq('document_id', deleteTarget);

        if (error) {
            alert('ลบไม่สำเร็จ: ' + error.message);
        } else {
            setShowSuccessModal(true);
            if (viewedUser) await fetchUserDocuments(viewedUserId, viewedUser);
        }
        setDeleteTarget(null);
    };

    if (loading || !viewedUser || !viewerRole) {
        return (
            <div className="flex h-screen bg-gray-50">

                <div className="flex-1 overflow-auto ml-20 p-8 text-center">กำลังดึงข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="my-8">
            <div className="flex-1 ml-5">
                <div className="p-8">
                    {/* --- Header Row 1: Logo (เหมือนเดิม) --- */}
                    <div className="flex justify-end items-center mb-4">
                        <div className="flex items-center gap-2">
                            <BookIcon />
                            <h1>
                                <span className="font-bold text-4xl" style={{
                                    background: 'linear-gradient(to right, #0891b2, #14b8a6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    color: '#0891b2'
                                }}>
                                    {viewedUser.firstname} {viewedUser.lastname} - {viewedUser.role} - {viewedUser.position}
                                </span>
                            </h1>
                        </div>
                    </div>

                    {/* --- Header Row 2: Title & Buttons --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                แบบบันทึกการปฏิบัติงาน
                            </h1>
                        </div>

                        {/* 👈 3. [สำคัญ] เช็คสิทธิ์คนดู (viewerRole) ก่อนแสดงปุ่ม */}
                        {(viewerRole === 'admin' || viewerRole === 'manager') && (
                            <div className="flex flex-wrap gap-2">
                                {isEditing ? (
                                    <>
                                        <button type="button" onClick={handleEditClick} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition flex items-center space-x-2">
                                            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                        </button>
                                        <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-black transition flex items-center space-x-2">
                                            ยกเลิก
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" onClick={handleEditClick} disabled={loading} className="bg-[#6e6e6e] text-white px-5 py-2 rounded-lg hover:bg-[#5c5a5a] transition text-sm font-medium">
                                        แก้ไข
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <ConfirmationModal isOpen={showSaveConfirmModal} onClose={() => setShowSaveConfirmModal(false)} onConfirm={handleSaveReports} title="ยืนยันการเปลี่ยนแปลง ?">คุณต้องการเปลี่ยนแปลงข้อมูลของคุณ</ConfirmationModal>
                    <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="ข้อมูลไม่ครบถ้วน">กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก</InfoModal>
                    <InfoModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} showCancelButton={false} title="สำเร็จ">บันทึกข้อมูลของคุณเรียบร้อยแล้ว</InfoModal>
                    {deleteTarget !== null && (
                        <ConfirmationModal isOpen={true} onClose={() => setDeleteTarget(null)} onConfirm={confirmDeleteReport} title="ยืนยันการลบ">คุณแน่ใจหรือไม่ที่จะลบรายงานแถวนี้?</ConfirmationModal>
                    )}

                    {/* Table */}
                    <div ref={tableContainerRef} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="w-full">
                                <thead className="bg-[#333333] text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Going on</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Next Focus</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">ข้อเสนอแนะ</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                        {(viewerRole === 'admin' || viewerRole === 'manager') && <th className="px-6 py-3 text-left text-sm font-semibold">จัดการ</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {documents.length === 0 ? (
                                        <tr><td colSpan={(viewerRole === 'admin' || viewerRole === 'manager') ? 6 : 5} className="px-6 py-4 text-center text-gray-500">✅ ไม่พบรายงาน</td></tr>
                                    ) : (
                                        paginatedDocuments.map((doc) => {
                                            const formattedDateForInput = formatDateForInput(doc.date);
                                            const isRowEditing = (viewerRole === 'admin' || viewerRole === 'manager') && editingRowIds.includes(doc.document_id);

                                            return (
                                                <tr key={doc.document_id} className={`hover:bg-gray-50 ${doc.document_id < 0 ? 'bg-teal-50' : ''}`}>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {isRowEditing ? (
                                                            <div className="relative flex items-center">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"><DateIcon /></span>
                                                                <input type="date" value={formattedDateForInput} onChange={(e) => handleInputChange(doc.document_id, 'date', e.target.value)} className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900" />
                                                            </div>
                                                        ) : (new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' }))}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing ? (
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-3 text-gray-400"><GoingOnIcon /></span>
                                                                <textarea value={doc.report} onChange={(e) => handleInputChange(doc.document_id, 'report', e.target.value)} className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900" rows={2} placeholder="กรอกสิ่งที่ทำ..." />
                                                            </div>
                                                        ) : (<p className="whitespace-pre-wrap break-all">{doc.report}</p>)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing ? (
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-3 text-gray-400"><NextFocusIcon /></span>
                                                                <textarea value={doc.nextfocus} onChange={(e) => handleInputChange(doc.document_id, 'nextfocus', e.target.value)} className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900" rows={2} placeholder="กรอกสิ่งที่จะทำต่อไป..." />
                                                            </div>
                                                        ) : (<p className="whitespace-pre-wrap break-all">{doc.nextfocus}</p>)}
                                                    </td>
                                                    {/* ✨ (เพิ่ม) <td> ใหม่สำหรับ Remark */}
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing ? ( // Admin/Manager ในโหมดแก้ไข
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-3 text-gray-400">
                                                                    <RemarkIcon />
                                                                </span>
                                                                <textarea
                                                                    value={doc.remark || ''}
                                                                    onChange={(e) => handleInputChange(doc.document_id, 'remark', e.target.value)}
                                                                    className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                                    rows={2}
                                                                    placeholder="กรอกข้อเสนอแนะ..."
                                                                />
                                                            </div>
                                                        ) : ( // โหมดแสดงผลปกติ
                                                            <p
                                                                className="whitespace-pre-wrap break-all p-2 rounded-md"
                                                                title={doc.remark}
                                                            >
                                                                {doc.remark}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {isRowEditing ? (
                                                            <div className="flex flex-col space-y-2">
                                                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" name={`status-${doc.document_id}`} value="1" checked={doc.status === '1'} onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)} className="mr-2 h-4 w-4 text-teal-500" /> เสร็จสิ้น</label>
                                                                <label className="flex items-center text-sm cursor-pointer"><input type="radio" name={`status-${doc.document_id}`} value="0" checked={doc.status === '0'} onChange={(e) => handleInputChange(doc.document_id, 'status', e.target.value)} className="mr-2 h-4 w-4 text-gray-600" /> กำลังดำเนินงาน</label>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-sm font-medium"><span className={`w-3 h-3 rounded-full mr-2 ${doc.status === '1' ? 'bg-teal-500' : 'bg-[#333333]'}`}></span>{doc.status === '1' ? 'เสร็จสิ้น' : 'กำลังดำเนินงาน'}</div>
                                                        )}
                                                    </td>
                                                    {(viewerRole === 'admin' || viewerRole === 'manager') && (
                                                        <td className="px-6 py-4 text-sm">
                                                            {isRowEditing && <button onClick={() => setDeleteTarget(doc.document_id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                            <div className="flex items-center space-x-4 "><span className="text-sm text-gray-600">แสดง</span><select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg bg-[#333333] text-white"><option value={10}>10</option><option value={20}>20</option><option value={30}>30</option><option value={50}>50</option></select><span className="text-sm text-gray-600">รายการต่อหน้า</span></div>
                            <span className="text-sm text-gray-600">หน้า {currentPage} จาก {totalPages}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center space-x-2"><ChevronLeft className="w-4 h-4" /><span>ก่อนหน้า</span></button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center space-x-2"><span>ถัดไป</span><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}