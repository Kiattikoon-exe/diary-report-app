'use client';
import React from 'react';

interface AlertModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string | null;
}

export default function AlertModal({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'ตกลง',
    cancelText = 'ยกเลิก',
}: AlertModalProps) {
    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 mx-4 max-xl:w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className={`flex ${cancelText ? 'justify-between space-x-3' : 'justify-end'}`}>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition"
                    >
                        {confirmText}
                    </button>
                    {cancelText && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}