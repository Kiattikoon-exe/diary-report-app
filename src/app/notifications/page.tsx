'use client';

import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

// --- Interfaces ---
interface AdminNotification {
    document_id: number;
    updated_at: string; // ✨ (แก้ไข) เปลี่ยนจาก date เป็น updated_at
    users: {
        firstname: string;
        lastname: string;
        id: string; // ✨ (เพิ่ม) ID ของผู้ใช้สำหรับสร้าง URL
    };
}

interface UserNotification {
    document_id: number;
    remark: string;
    updated_at: string; // ✨ (แก้ไข) เปลี่ยนจาก date เป็น updated_at
    editor: {
        firstname: string;
        lastname: string;
    } | null;
}

const AdminNotificationList = ({ notifications }: { notifications: AdminNotification[] }) => {
    const router = useRouter();

    const handleClick = (userId: string, docId: number) => {
        router.push(`/search/${userId}?highlight=${docId}`);
    };

    return (
        <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">กิจกรรมล่าสุดจากผู้ใช้งาน</h2>
        {notifications.map((noti) => (
            <div key={noti.document_id} onClick={() => handleClick(noti.users.id, noti.document_id)} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:bg-gray-100 transition-colors cursor-pointer animate-fade-in">
                <div className="flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#13B499]" />
                </div>
                <div className="flex-grow min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                        <span className="text-[#333333]">{noti.users.firstname} {noti.users.lastname}</span>
                        <span className="font-normal text-gray-600"> ได้อัปเดตรายงานของพวกเขา</span>
                    </p>
                    <p className="text-xs text-gray-400 text-right mt-2">
                        {new Date(noti.updated_at).toLocaleString('th-TH', { // ✨ (แก้ไข)
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        ))}
    </div>);
};

const UserNotificationList = ({ notifications }: { notifications: UserNotification[] }) => {
    const router = useRouter();

    const handleClick = (docId: number) => {
        router.push(`/reports?highlight=${docId}`);
    };

    return (<div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4">ข้อเสนอแนะในรายงานของคุณ</h2>
        {notifications.map((noti) => (
            <div key={noti.document_id} onClick={() => handleClick(noti.document_id)} className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:bg-gray-100 transition-colors cursor-pointer animate-fade-in">
                <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#13B499]" />
                </div>
                <div className="flex-grow min-w-0">
                    <div>
                        <p className="font-semibold text-sm sm:text-base text-gray-800 break-words">
                            ข้อเสนอแนะใหม่จาก <span className="text-[#333333]">{noti.editor?.firstname || 'ผู้ดูแลระบบ'}</span>
                        </p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 bg-gray-200 p-2 rounded-md mt-2 break-words">
                        "{noti.remark}"
                    </p>
                    <p className="text-xs text-gray-400 text-right mt-2">
                        {new Date(noti.updated_at).toLocaleString('th-TH', { // ✨ (แก้ไข)
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        ))}
    </div>);
};

export default function NotificationPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async (user: { id: string; role: string }) => {
        if (!supabase) {
            setError('Supabase client is not initialized. Check your environment variables.');
            setIsLoading(false);
            return;
        }

        try {
            if (user.role === 'admin' || user.role === 'manager') {
                // Admin/Manager: ดึงเอกสารที่ยังไม่ได้อ่าน
                const { data, error: adminError } = await supabase
                    .from('documents')
                    // ✨ (แก้ไข) เพิ่ม id ของ user เพื่อใช้สร้าง URL
                    .select('document_id, updated_at, users:user_id(id, firstname, lastname)')
                    .eq('is_read_by_admin', false)
                    .order('date', { ascending: false })
                    .limit(20);

                if (adminError) throw adminError;
                setNotifications(data || []);
            } else {
                // User: ดึง remark ที่ยังไม่ได้อ่าน
                const { data, error: userError } = await supabase
                    .from('documents')
                    // ✨ (แก้ไข) เปลี่ยนจาก date เป็น updated_at
                    .select('document_id, remark, updated_at, editor:last_editor_id(firstname, lastname)')
                    .eq('user_id', user.id)
                    .not('remark', 'is', null)
                    .eq('is_remark_read', false)
                    .order('date', { ascending: false });

                if (userError) throw userError;
                setNotifications(data || []);
            }
        } catch (err: any) {
            setError('ไม่สามารถดึงข้อมูลการแจ้งเตือนได้: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role && user.id) {
                setCurrentUser(user);
                fetchNotifications(user);
            } else {
                setError('ข้อมูลผู้ใช้ไม่สมบูรณ์ (ต้องมี id และ role)');
                setIsLoading(false);
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager';

    const handleMarkAsRead = async () => {
        if (!currentUser || !supabase) return;

        let updateQuery;
        if (isAdminOrManager) {
            updateQuery = supabase
                .from('documents')
                .update({ is_read_by_admin: true })
                .eq('is_read_by_admin', false);
        } else {
            updateQuery = supabase
                .from('documents')
                .update({ is_remark_read: true })
                .eq('user_id', currentUser.id)
                .eq('is_remark_read', false);
        }

        const { error } = await updateQuery;
        if (error) {
            alert('เกิดข้อผิดพลาด: ' + error.message);
        } else {
            setNotifications([]);
            window.location.reload();
        }
    };

    return (
        <div className="my-4 sm:my-6 md:my-8 flex-1 mx-4 sm:mx-5 lg:mx-6">
            <header className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
                {/* ✨ (เพิ่ม) ปุ่มย้อนกลับ */}
                <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors" title="ย้อนกลับ">
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>

                <Bell className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#333333]" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#333333]">
                    การแจ้งเตือน
                </h1>
            </header>

            <main className="bg-white p-3 sm:p-4 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200">
                {error && (
                    <div className="p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base mb-4">
                        **ข้อผิดพลาด:** {error}
                    </div>
                )}
                {isLoading ? (
                    <div className="text-center py-12 sm:py-16 text-gray-500 text-sm sm:text-base">กำลังโหลด...</div>
                ) : notifications.length > 0 ? (
                    <div className="max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-250px)] md:max-h-[calc(100vh-280px)] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                        {isAdminOrManager ? (
                            <AdminNotificationList notifications={notifications} />
                        ) : (
                            <UserNotificationList notifications={notifications as UserNotification[]} />
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 sm:py-16">
                        <div className="inline-block bg-gray-200 rounded-full p-3 sm:p-4">
                            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                        <p className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-600">
                            ยังไม่มีการแจ้งเตือน
                        </p>
                        <p className="text-sm sm:text-base text-gray-500 px-4">
                            การแจ้งเตือนใหม่ๆ จะแสดงที่นี่
                        </p>
                    </div>
                )}

                {notifications.length > 0 && (
                    <footer className="mt-8 sm:mt-10 md:mt-12 text-center">
                        <button
                            onClick={handleMarkAsRead}
                            style={{ backgroundColor: '#13B499' }}
                            className="text-white font-bold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg text-sm sm:text-base hover:opacity-90 transition-opacity w-full sm:w-auto"
                        >
                            ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
                        </button>
                    </footer>
                )}
            </main>
        </div>
    );
}