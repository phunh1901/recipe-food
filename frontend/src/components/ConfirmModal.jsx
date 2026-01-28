import React from 'react';
import { AlertTriangle, Info, XCircle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger' // danger, warning, info
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: XCircle,
            iconColor: 'text-red-600',
            bgColor: 'bg-red-100',
            buttonColor: 'bg-red-500 hover:bg-red-600',
            borderColor: 'border-red-500'
        },
        warning: {
            icon: AlertTriangle,
            iconColor: 'text-orange-600',
            bgColor: 'bg-orange-100',
            buttonColor: 'bg-orange-500 hover:bg-orange-600',
            borderColor: 'border-orange-500'
        },
        info: {
            icon: Info,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-100',
            buttonColor: 'bg-blue-500 hover:bg-blue-600',
            borderColor: 'border-blue-500'
        }
    };

    const style = variantStyles[variant];
    const Icon = style.icon;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
                >
                    <X size={20} className="text-gray-400" />
                </button>

                <div className="p-8">
                    <div className={`w-16 h-16 ${style.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon size={32} className={style.iconColor} />
                    </div>

                    <h2 className="text-2xl font-black text-gray-800 text-center mb-3">
                        {title}
                    </h2>

                    <p className="text-gray-600 text-center leading-relaxed mb-8 whitespace-pre-line">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 ${style.buttonColor} text-white rounded-xl font-bold shadow-lg transition`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
