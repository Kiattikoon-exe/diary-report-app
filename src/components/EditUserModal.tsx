'use client';
import React, { useState } from 'react';

export default function EditUserModal({ user, onClose, onSave }: any) {
    const [formData, setFormData] = useState({
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        position: user.position,
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(user.id, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#333333]] mb-6">แก้ไขข้อมูลผู้ใช้</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
                            <input
                                type="text"
                                value={formData.firstname}
                                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                title="ชื่อ"
                                placeholder="ชื่อ"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
                            <input
                                type="text"
                                value={formData.lastname}
                                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                title="นามสกุล"
                                placeholder="นามสกุล"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ตำแหน่ง (Role)</label>
                            <select
                                value={formData.role}
                                title="ตำแหน่ง (Role)"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="admin">admin</option>
                                <option value="manager">manager</option>
                                <option value="dev">dev</option>
                                <option value="intern">intern</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">บทบาท (Position)</label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                title="บทบาท (Position)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="UX UI">UX UI</option>
                                <option value="Fullstack">Fullstack</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่านใหม่ (ไม่บังคับ)</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="ใส่เฉพาะเมื่อต้องการเปลี่ยน"
                            />
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
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}