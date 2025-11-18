'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from "@supabase/supabase-js";
import { supabase } from '@/utils/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';



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
    users: User;      // 👈 แก้ไข (จาก user)
    user_id: string;  // 👈 แก้ไข (จาก UID)
    remark: string;   // ✨ (เพิ่ม) เพิ่มฟิลด์ remark
}

// --- ไอคอน (เหมือนเดิม) ---
const DateIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
);
const GoingOnIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const NextFocusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
);
const StatusIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

// ✨ (เพิ่ม) ไอคอนสำหรับ Remark
const RemarkIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z"></path></svg>
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
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg transition-shadow"
                    >
                        ยืนยัน
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-[#333333] text-white hover:bg-black transition-colors"
                    >
                        ยกเลิก
                    </button>

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
                    {showCancelButton && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-[#333333] text-white hover:bg-black transition-colors"
                        >
                            ยกเลิก
                        </button>
                    )}
                    {/* ปุ่มตกลงด้านขวา */}
                    <button
                        onClick={onClose}
                        // ถ้ามีปุ่มเดียวให้ขยายเต็ม
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg transition-shadow"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Converts a date string or Date object to 'YYYY-MM-DD' format based on the local timezone,
 * preventing UTC conversion issues.
 * @param dateInput The date to format.
 */
const formatDateForInput = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- 2. Page Component (Main Export) ---
export default function DocumentsListPage() {
    const router = useRouter();
    const searchParams = useSearchParams(); // ✨ (เพิ่ม) Hook สำหรับอ่าน URL params
    const tableContainerRef = React.useRef<HTMLDivElement>(null);

    // --- 3. State ---
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    {/* ‼️ แก้ไข Type: user_id เป็น string (uuid) ‼️ */ }
    // const [currentUser, setCurrentUser] = useState<{ username: string; user_id: string; firstname: string; lastname: string; role: string; position: string; } | null>(null);
    const [originalDocuments, setOriginalDocuments] = useState<DocumentItem[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editingRowIds, setEditingRowIds] = useState<number[]>([]);
    const [newRowCounter, setNewRowCounter] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10 items per page
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // --- Fetch Data ---
    const fetchUserDocuments = async (userId: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('documents')
            // ✨ (แก้ไข) เพิ่ม remark ใน .select()
            .select(`document_id, report, nextfocus, status, date, user_id, remark`)
            .eq('user_id', userId)
            .order('date', { ascending: true });

        if (!error) {
            const normalized = (data || []).map((d: any) => ({
                ...d,
                users: { username: currentUser?.username || '', role: currentUser?.role || '' }
            })) as DocumentItem[];
            setDocuments(normalized);
            setOriginalDocuments(JSON.parse(JSON.stringify(normalized))); // Deep copy for comparison
        }
        setLoading(false);
    };

    // Pagination Logic
    const totalPages = Math.ceil(documents.length / itemsPerPage);
    const paginatedDocuments = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

    // ✨ (เพิ่ม) Effect สำหรับจัดการ Highlight
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId && documents.length > 0) {
            const docId = parseInt(highlightId, 10);

            // หาหน้าที่เอกสารนั้นอยู่
            const docIndex = documents.findIndex(d => d.document_id === docId);
            if (docIndex !== -1) {
                const targetPage = Math.floor(docIndex / itemsPerPage) + 1;
                setCurrentPage(targetPage);

                // เลื่อนไปยังแถวที่ไฮไลท์
                setTimeout(() => {
                    const rowElement = document.querySelector(`[data-doc-id="${docId}"]`);
                    rowElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100); // หน่วงเวลาเล็กน้อยเพื่อให้ UI render เสร็จ
            }
        }
    }, [documents, searchParams, itemsPerPage]);


    // --- Handlers (Save, Cancel, Edit, Add) ---
    const handleInputChange = (docId: number, field: keyof DocumentItem, value: string) => {
        setDocuments(prev => prev.map(doc => doc.document_id === docId ? { ...doc, [field]: value } : doc));
    };



    const handleSaveReports = async () => {
        setLoading(true);
        setShowSaveConfirmModal(false);

        // [REFACTORED] คัดกรองเฉพาะเอกสารที่มีการเปลี่ยนแปลงจริงๆ
        const docsToSave = documents.filter(doc => {
            // 1. ต้องเป็นแถวที่อยู่ในโหมดแก้ไขเท่านั้น
            if (!editingRowIds.includes(doc.document_id)) return false;

            // 2. ถ้าเป็นแถวใหม่ (ID ติดลบ) ให้ส่งไปบันทึกเสมอ
            if (doc.document_id < 0) return true;

            // 3. ถ้าเป็นแถวเก่า ให้เปรียบเทียบกับข้อมูลดั้งเดิม
            const originalDoc = originalDocuments.find(orig => orig.document_id === doc.document_id);
            if (!originalDoc) return false; // ไม่ควรเกิดขึ้น

            // คืนค่า true ถ้ามี field ใดๆ เปลี่ยนแปลง
            // ✨ (แก้ไข) เพิ่มการตรวจสอบ remark
            return originalDoc.report !== doc.report ||
                originalDoc.nextfocus !== doc.nextfocus ||
                originalDoc.date !== doc.date ||
                originalDoc.status !== doc.status ||
                originalDoc.remark !== doc.remark;
        });

        // ✨ (เพิ่ม) เพิ่ม last_editor_id เข้าไปในข้อมูลที่จะบันทึก
        const payload = docsToSave.map(doc => {
            const originalDoc = originalDocuments.find(orig => orig.document_id === doc.document_id);
            const isRespondingToRemark = originalDoc && originalDoc.remark;

            return {
                ...doc,
                // ✨ (แก้ไข) ถ้าเป็นการตอบกลับ remark ให้ลบ remark เดิมทิ้ง
                remark: isRespondingToRemark ? null : doc.remark,
                last_editor_id: currentUser.user_id,
                // เมื่อมีการแก้ไข remark ให้ถือว่า user ยังไม่ได้อ่าน
                is_remark_read: false,
                // ✨ (แก้ไข) ถ้าเป็นการตอบกลับ remark ให้แจ้งเตือน Admin กลับ
                // ถ้าเป็นการแก้ไขปกติโดย Admin เอง ให้ถือว่าอ่านแล้ว
                is_read_by_admin: isRespondingToRemark ? false : true,
            };
        });



        try {
            const response = await fetch('/api/save-documents/', { // ส่ง payload ที่มี last_editor_id
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: payload }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to save');

            console.log("✅ Save successful:", result);
            setShowSuccessModal(true); // แสดง Modal แจ้งเตือนความสำเร็จ
            setEditingRowIds([]);
            setIsEditing(false);

            if (currentUser) {
                await fetchUserDocuments(currentUser.user_id);
                setCurrentPage(1); // กลับไปหน้าแรกหลังจากบันทึก
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
            setOriginalDocuments(JSON.parse(JSON.stringify(documents))); // Store original state
            setIsEditing(true);
            setEditingRowIds(documents.map(doc => doc.document_id)); // 👈 แก้ไข
        } else {
            // ตรวจสอบว่าแถวใหม่ที่เพิ่มเข้ามา (ID ติดลบ) ว่างเปล่าหรือไม่
            const hasEmptyNewRow = documents.some(doc =>
                doc.document_id < 0 && doc.report.trim() === '' && doc.nextfocus.trim() === ''
            );

            if (hasEmptyNewRow) {
                setShowInfoModal(true); // แสดง Modal ถ้าแถวใหม่ว่าง
                return;
            }

            // ตรวจสอบว่ามีการเปลี่ยนแปลงในแถวที่มีอยู่แล้วหรือไม่
            const hasChangesInExistingRows = documents.some(doc => {
                if (doc.document_id >= 0) { // เช็คเฉพาะแถวที่มีอยู่แล้ว
                    const originalDoc = originalDocuments.find(orig => orig.document_id === doc.document_id);
                    // ✨ (แก้ไข) เพิ่มการตรวจสอบ remark
                    return originalDoc && (
                        originalDoc.report !== doc.report ||
                        originalDoc.nextfocus !== doc.nextfocus ||
                        originalDoc.date !== doc.date ||
                        originalDoc.status !== doc.status ||
                        originalDoc.remark !== doc.remark
                    );
                }
                return false;
            });

            if (!hasChangesInExistingRows && !documents.some(doc => doc.document_id < 0)) {
                handleCancelEdit(); // ถ้าไม่มีการเปลี่ยนแปลง ให้ยกเลิกโหมดแก้ไขเลย
                return; // ออกจากฟังก์ชัน
            }
            setShowSaveConfirmModal(true);
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
            date: formatDateForInput(new Date()), // Use timezone-safe formatter
            user_id: currentUser.user_id, // 👈 แก้ไข
            remark: '', // ✨ (เพิ่ม)
            users: { username: currentUser.username, role: '' }
        };

        const updatedDocuments = [...documents, newDocument];
        setDocuments(updatedDocuments);

        // Navigate to the last page where the new row is
        const newTotalPages = Math.ceil(updatedDocuments.length / itemsPerPage);
        setCurrentPage(newTotalPages);

        // Scroll to the table container to make the new row visible
        setTimeout(() => tableContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);

        setEditingRowIds(prev => [tempId, ...prev]);
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
            {/* Main Content */}
            <div className="flex-1 ml-5">
                <div className="p-8">
                    {/* Header */}
                    {/* --- Header Row 1: Logo --- */}
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
                                    {currentUser.firstname} {currentUser.lastname} - {currentUser.role} - {currentUser.position}
                                </span>
                            </h1>

                        </div>
                    </div>

                    {/* --- Header Row 2: Title & Buttons --- */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800" >
                                แบบบันทึกการปฏิบัติงาน
                            </h1>

                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEditClick} // This will now open the modal
                                        disabled={loading}
                                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition flex items-center space-x-2"
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-black transition flex items-center space-x-2"
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
                                    แก้ไข
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleAddNewRow}
                                disabled={loading || isEditing}
                                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2 rounded-lg hover:shadow-lg transition text-sm font-medium"
                            >
                                + เพิ่มรายการ
                            </button>
                        </div>
                    </div>

                    <ConfirmationModal
                        isOpen={showSaveConfirmModal}
                        onClose={() => setShowSaveConfirmModal(false)}
                        onConfirm={handleSaveReports}
                        title="ยืนยันการเปลี่ยนแปลง ?"
                    >
                        คุณต้องการเปลี่ยนแปลงข้อมูลของคุณ
                    </ConfirmationModal>

                    <InfoModal
                        isOpen={showInfoModal}
                        onClose={() => setShowInfoModal(false)} title="ข้อมูลไม่ครบถ้วน"
                    >
                        กรุณากรอกข้อมูลให้ครบถ้วนก่อนทำการบันทึก
                    </InfoModal>

                    <InfoModal
                        isOpen={showSuccessModal}
                        onClose={() => setShowSuccessModal(false)}
                        showCancelButton={false} // 👈 ซ่อนปุ่มยกเลิก
                        title="สำเร็จ"
                    >
                        บันทึกข้อมูลของคุณเรียบร้อยแล้ว
                    </InfoModal>




                    {/* Table */}
                    <div ref={tableContainerRef} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="w-full">
                                <thead className="bg-[#333333] text-white sticky top-0 z-10">
                                    <tr><th className="px-6 py-3 text-left text-sm font-semibold">Date</th><th className="px-6 py-3 text-left text-sm font-semibold">Going on</th><th className="px-6 py-3 text-left text-sm font-semibold">Next Focus</th><th className="px-6 py-3 text-left text-sm font-semibold">ข้อเสนอแนะ</th>{/* ✨ (เพิ่ม) */}<th className="px-6 py-3 text-left text-sm font-semibold">Status</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {documents.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">{/* ✨ (แก้ไข) colSpan="5" */}
                                            ✅ ไม่พบรายงาน คุณยังไม่ได้สร้างรายงานใดๆ
                                        </td></tr>
                                    ) : (
                                        paginatedDocuments.map((doc) => {
                                            const formattedDateForInput = formatDateForInput(doc.date);
                                            const isRowEditing = editingRowIds.includes(doc.document_id);
                                            const highlightId = searchParams.get('highlight');
                                            const isHighlighted = highlightId && doc.document_id === parseInt(highlightId, 10);
                                            const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

                                            return (
                                                <tr key={doc.document_id} data-doc-id={doc.document_id} className={`hover:bg-gray-50 ${isHighlighted ? 'highlight-row' : ''}`}>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {isRowEditing ? (
                                                            <div className="relative flex items-center">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                                                                    <DateIcon />
                                                                </span>
                                                                <input
                                                                    type="date"
                                                                    value={formattedDateForInput}
                                                                    onChange={(e) => handleInputChange(doc.document_id, 'date', e.target.value)}
                                                                    className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                                    title="Date"
                                                                    aria-label="Date"
                                                                />
                                                            </div>
                                                        ) : (
                                                            new Date(doc.date).toLocaleDateString('th-TH', { dateStyle: 'medium' })
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing ? (
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-3 text-gray-400">
                                                                    <GoingOnIcon />
                                                                </span>
                                                                <textarea
                                                                    value={doc.report}
                                                                    onChange={(e) => handleInputChange(doc.document_id, 'report', e.target.value)}
                                                                    className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                                    rows={2}
                                                                    placeholder="กรอกสิ่งที่ทำวันนี้..."
                                                                    title="Going on - รายการที่ทำ"
                                                                    aria-label="Going on"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="whitespace-pre-wrap break-all" title={doc.report}>{doc.report}</p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing ? (
                                                            <div className="relative">
                                                                <span className="absolute left-2 top-3 text-gray-400">
                                                                    <NextFocusIcon />
                                                                </span>
                                                                <textarea
                                                                    value={doc.nextfocus}
                                                                    onChange={(e) => handleInputChange(doc.document_id, 'nextfocus', e.target.value)}
                                                                    className="w-full p-2 pl-8 border border-gray-300 rounded-md shadow-sm text-gray-900"
                                                                    rows={2}
                                                                    placeholder="กรอกสิ่งที่จะทำต่อไป..."
                                                                    title="Next focus - สิ่งที่ต้องทำต่อไป"
                                                                    aria-label="Next focus"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="whitespace-pre-wrap break-all" title={doc.nextfocus}>{doc.nextfocus}</p>
                                                        )}
                                                    </td>

                                                    {/* ✨ (เพิ่ม) <td> ใหม่สำหรับ Remark */}
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                                                        {isRowEditing && isAdminOrManager ? (
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
                                                                    title="ข้อเสนอแนะ"
                                                                    aria-label="Remark"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p
                                                                className={`whitespace-pre-wrap break-all p-2 rounded-md ${isRowEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                                title={doc.remark}
                                                            >
                                                                {doc.remark || (isRowEditing ? '-' : '')}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm">
                                                        {isRowEditing ? (
                                                            <div className="flex flex-col space-y-2">
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
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-sm font-medium text-gray-800">
                                                                <span
                                                                    className={`w-3 h-3 rounded-full mr-2 ${doc.status === '1' ? 'bg-teal-500' : 'bg-[#333333]'
                                                                        }`}
                                                                ></span>
                                                                {doc.status === '1'
                                                                    ? 'เสร็จสิ้น'
                                                                    : 'กำลังดำเนินงาน'}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination (คง UI เดิมของคุณไว้) */}
                        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                            <div className="flex items-center space-x-4 ">
                                <span className="text-sm text-gray-600">แสดง</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Reset to first page when items per page changes
                                    }}
                                    className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg bg-[#333333] text-white"
                                    title="Items per page"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={30}>30</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm text-gray-600">รายการต่อหน้า</span>
                            </div>
                            <span className="text-sm text-gray-600">หน้า {currentPage} จาก {totalPages}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center space-x-2">
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>ก่อนหน้า</span>
                                </button>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center space-x-2">
                                    <span>ถัดไป</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}