'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import AlertModal from './AlertModal'; // 👈 1. Import AlertModal

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
        role: 'intern',
        position: 'Full stack'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false); // 👈 2. เพิ่ม State สำหรับ Modal

    const handleSubmit = async () => {
        if (!formData.username || !formData.password || !formData.firstname || !formData.lastname) {
            // 👈 3. เปลี่ยนจาก alert เป็นการแสดง Modal
            setShowInfoModal(true);
            return; // หยุดการทำงาน
        }
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-10 w-full max-w-4xl mx-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-teal-600">เพิ่มสมาชิก</h2>
                        <button onClick={onClose} className="text-teal-600 hover:text-teal-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* ชื่อผู้ใช้ */}
                        <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                                ชื่อผู้ใช้ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                        {/* รหัสผ่าน */}
                        <div>
                            <label className="block text-sm font-medium text-[#333333]-700 mb-2">
                                รหัส <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            />
                        </div>
                        {/* ชื่อ */}
                        <div>
                            <label className="block text-sm font-medium text-[#333333] mb-2">
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
                            <label className="block text-sm font-medium text-[#333333] mb-2">
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
                            <label className="block text-sm font-medium text-[#333333] mb-2">
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
                            <label className="block text-sm font-medium text-[#333333] mb-2">
                                บทบาท <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-4 py-2 bg-[#333333] text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                            >
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="Full stack">Full stack</option>
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
                            disabled={isSaving}
                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                        >
                            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                        </button>
                    </div>
                </div>
            </div>
            {/* 4. เพิ่ม AlertModal สำหรับแสดงผล */}
            {showInfoModal && (
                <AlertModal
                    title="ข้อมูลไม่ครบถ้วน"
                    message="กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน"
                    onConfirm={() => setShowInfoModal(false)}
                    onCancel={() => setShowInfoModal(false)}
                    cancelText={null} // 👈 ซ่อนปุ่ม Cancel
                />
            )}
        </>
    );
}