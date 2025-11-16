'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EditUserModalProps {
    user: any;
    onClose: () => void;
    onSave: (userId: number, data: any) => Promise<void>;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        position: user.position,
        password: ''
    });

    const handleSubmit = async () => {
        await onSave(user.id, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-teal-600">แก้ไขสมาชิก</h2>
                    <button onClick={onClose} className="text-teal-600 hover:text-teal-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {/* ชื่อผู้ใช้ (disabled) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อผู้ใช้</label>
                        <input
                            type="text"
                            value={user.username}
                            disabled
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg opacity-60 cursor-not-allowed"
                        />
                    </div>
                    {/* รหัส */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">รหัส</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="ใส่เฉพาะเมื่อต้องการเปลี่ยน"
                            className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    {/* ชื่อ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.firstname}
                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                            className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    {/* สกุล */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            สกุล <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                    </div>
                    {/* ตำแหน่ง */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ตำแหน่ง <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                            <option value="intern">Intern</option>
                            <option value="dev">Dev</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {/* บทบาท */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            บทบาท <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Fullstack">Fullstack</option>
                            <option value="UX UI">UX UI</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#333333] transition"
                    >
                        ปิด
                    </button>
                    <button
                        onClick={handleSubmit}

                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                        บันทึก
                    </button>


                </div>
            </div>
        </div>
    );
}