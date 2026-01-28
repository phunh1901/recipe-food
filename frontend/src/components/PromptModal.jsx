import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const PromptModal = ({
    isOpen,
    onClose,
    onSubmit,
    title = 'Nhập thông tin',
    placeholder = 'Nhập nội dung...',
    defaultValue = '',
    required = false,
    multiline = false,
    maxLength = 500
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setError('');
        }
    }, [isOpen, defaultValue]);

    const handleSubmit = () => {
        if (required && !value.trim()) {
            setError('Vui lòng nhập nội dung');
            return;
        }
        onSubmit(value.trim());
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !multiline && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="hover:rotate-90 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="mb-6">
                        {multiline ? (
                            <textarea
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    setError('');
                                }}
                                placeholder={placeholder}
                                maxLength={maxLength}
                                className={`w-full p-4 border-2 ${error ? 'border-red-500' : 'border-gray-200'
                                    } rounded-xl outline-none focus:border-orange-500 transition resize-none h-32`}
                                autoFocus
                            />
                        ) : (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                    setError('');
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                maxLength={maxLength}
                                className={`w-full p-4 border-2 ${error ? 'border-red-500' : 'border-gray-200'
                                    } rounded-xl outline-none focus:border-orange-500 transition`}
                                autoFocus
                            />
                        )}

                        {error && (
                            <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        {maxLength && (
                            <div className="text-xs text-gray-400 mt-2 text-right">
                                {value.length}/{maxLength}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg shadow-orange-200 hover:shadow-xl transition"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;
