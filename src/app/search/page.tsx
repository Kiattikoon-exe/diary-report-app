'use client';
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'; // 👈 เอา Edit/Trash ออก, ใช้ Search แทน
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default function SearchUserPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ทั้งหมด');
    const [filterPosition, setFilterPosition] = useState('ทั้งหมด');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Check Auth & Fetch Data
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        // กันสิทธิ์ Admin/Manager เท่านั้น
        if (!['admin', 'manager'].includes(user.role)) {
            router.push('/reports'); // ถ้า user ธรรมดาหลงมา ให้ดีดกลับ
        } else {
            fetchUsers();
        }
    }, [router]);

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (!error && data) setAllUsers(data);
    };

    // 2. Filter Logic (เหมือนเดิม)
    const filteredUsers = allUsers.filter(user => {
        const matchSearch = (user.firstname || '').includes(searchTerm) ||
            (user.lastname || '').includes(searchTerm) ||
            (user.username || '').includes(searchTerm);
        const matchRole = filterRole === 'ทั้งหมด' || user.role === filterRole;
        const matchPosition = filterPosition === 'ทั้งหมด' || user.position === filterPosition;
        return matchSearch && matchRole && matchPosition;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getRoleDisplay = (role: string) => {
        const map: any = { 'admin': 'web admin', 'manager': 'web admin' };
        return map[role] || role;
    };

    if (!currentUser) return <div className="p-8 text-center">Loading...</div>;

    return (



        <div className="flex-1 overflow-auto ml-5">
            <div className="p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">ค้นหารายงานของสมาชิก</h1>
                    </div>
                    {/* หน้านี้ไม่มีปุ่ม Add */}
                </div>

                {/* Filters (เหมือนเดิม) */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text" placeholder="ค้นหา" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-[#333333] text-white">
                            {['ทั้งหมด', 'admin', 'manager', 'dev', 'intern'].map(r => <option key={r} value={r}>{r === 'ทั้งหมด' ? 'ตำแหน่ง: ทั้งหมด' : r}</option>)}
                        </select>
                        <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-[#333333] text-white">
                            {['ทั้งหมด', 'Front end', 'Back end', 'UX UI', 'Full stack'].map(p => <option key={p} value={p}>{p === 'ทั้งหมด' ? 'บทบาท: ทั้งหมด' : p}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-[#333333] text-white">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ลำดับ</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อผู้ใช้</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ชื่อ สกุล</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ตำแหน่ง</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">บทบาท</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">ดูรายงาน</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedUsers.map((user, idx) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-700">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{user.username}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{user.firstname} {user.lastname}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{getRoleDisplay(user.role)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{user.position}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {/* 👈 3. [เปลี่ยน] ปุ่ม Action */}
                                        <button
                                            onClick={() => router.push(`/search/${user.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title={`ดูรายงานของ ${user.username}`}
                                        >
                                            <Search className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination (เหมือนเดิม) */}
                    <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-600">หน้า {currentPage} จาก {totalPages}</span>
                        <div className="flex space-x-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded"><ChevronLeft /></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-2 py-1 border rounded"><ChevronRight /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}