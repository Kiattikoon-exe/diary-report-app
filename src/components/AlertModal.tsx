'use client';

import React from 'react';

interface AlertModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancelButton?: boolean;
}

export default function AlertModal({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'ตกลง',
    cancelText = 'ยกเลิก',
    showCancelButton = false,
}: AlertModalProps) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-sm text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {showCancelButton && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md hover:from-teal-600 hover:to-teal-700 transition-colors duration-200"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
