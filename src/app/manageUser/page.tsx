'use client';
import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import EditUserModal from '@/components/EditUserModal';
import AddUserModal from '@/components/AddUserModal';


export default function UserManagementPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ทั้งหมด');
    const [filterPosition, setFilterPosition] = useState('ทั้งหมด');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // 1. Check Auth & Fetch Data
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(storedUser);
        setCurrentUser(user);

        // ถ้าไม่ใช่ Admin/Manager ให้ดีดไปหน้า Reports
        if (!['admin', 'manager'].includes(user.role)) {
            router.push('/reports');
        } else {
            fetchUsers();
        }
    }, [router]);

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
        if (!error && data) setAllUsers(data);
    };

    // --- 2. Add User Logic (เพิ่มใหม่) ---
    const handleAddUser = async (userData: any) => {
        try {
            const { error } = await supabase
                .from('users')
                .insert([userData]) // Insert array
                .select();

            if (error) throw error;

            alert('เพิ่มสมาชิกเรียบร้อยแล้ว');
            fetchUsers(); // Refresh ตาราง
            setShowAddModal(false); // ปิด Modal
        } catch (error: any) {
            console.error('Error adding user:', error);
            alert(`เกิดข้อผิดพลาด: ${error.message}`);
        }
    };

    // Update User Logic
    const handleUpdateUser = async (userId: number, updatedData: any) => {
        try {
            const payload = { ...updatedData };
            if (!payload.password) delete payload.password;

            const { error } = await supabase.from('users').update(payload).eq('id', userId);
            if (error) throw error;

            alert('บันทึกเรียบร้อย');
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) {
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (!error) {
                setAllUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                alert('ลบไม่สำเร็จ');
            }
        }
    };

    // 3. Filter Logic
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
        const map: any = { 'admin': 'admin', 'manager': 'admin' };
        return map[role] || role;
    };

    if (!currentUser) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="my-8">


            {/* Main Content */}
            <div className="flex-1 overflow-auto ml-5"> {/* ml-20 คือเว้นที่ให้ Sidebar ซ้ายสุด */}
                <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div >

                            <h1 className="text-3xl font-bold text-gray-800" style={{
                                background: 'linear-gradient(to right, #0891b2, #14b8a6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                color: '#0891b2'
                            }}>จัดการสมาชิก {currentUser.username} {currentUser.role} {currentUser.position}</h1>
                        </div>
                        {currentUser.role === 'admin' && (
                            <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>เพิ่มสมาชิก</span>
                            </button>
                        )}
                    </div>

                    {/* Filters */}
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
                                {['ทั้งหมด', 'Frontend', 'Backend', 'UX UI', 'Fullstack'].map(p => <option key={p} value={p}>{p === 'ทั้งหมด' ? 'บทบาท: ทั้งหมด' : p}</option>)}
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
                                    <th className="px-6 py-3 text-left text-sm font-semibold">จัดการ</th>
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
                                            <div className="flex items-center space-x-2">
                                                {currentUser.role === 'admin' ? (
                                                    <>
                                                        <button onClick={() => setEditingUser(user)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                    </>
                                                ) : <span className="text-gray-400 text-xs">ดูอย่างเดียว</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination */}
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

            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleUpdateUser} />}
            {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />}
        </div>
    );
}