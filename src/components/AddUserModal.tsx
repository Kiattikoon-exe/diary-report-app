'use client';
import React, { useState } from 'react';

interface AddUserModalProps {
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

export default function AddUserModal({ onClose, onSave }: AddUserModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        firstname: '',
        lastname: '',
        role: 'intern', // Default value
        position: 'Full stack' // Default value
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มสมาชิกใหม่</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้ (Username)</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        {/* Password (Required for new user) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        {/* Firstname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อจริง</label>
                            <input
                                type="text"
                                value={formData.firstname}
                                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        {/* Lastname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                            <input
                                type="text"
                                value={formData.lastname}
                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง (Role)</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="admin">admin</option>
                                <option value="manager">manager</option>
                                <option value="dev">dev</option>
                                <option value="intern">intern</option>
                            </select>
                        </div>
                        {/* Position */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">บทบาท (Position)</label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="UX UI">UX UI</option>
                                <option value="Fullstack">Fullstack</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'เพิ่มสมาชิก'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}