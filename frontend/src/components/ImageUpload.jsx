import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ onImageChange, initialPreview = null, label = "Ảnh món ăn" }) => {
    const [preview, setPreview] = useState(initialPreview);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Sync preview with initialPreview changes
    useEffect(() => {
        setPreview(initialPreview);
    }, [initialPreview]);

    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onImageChange(file);
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileChange(file);
    };

    // Kéo thả ảnh
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleRemove = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {preview ? (
                <div>
                    <div className="relative w-full h-64 bg-white rounded-xl overflow-hidden border-2 border-gray-300">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                console.error('Image preview load error');
                                e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                                console.log('Image preview loaded successfully');
                            }}
                        />
                    </div>
                    {/* Action buttons below image */}
                    <div className="flex gap-3 mt-3">
                        <button
                            type="button"
                            onClick={handleClick}
                            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                        >
                            <Upload size={18} />
                            Đổi ảnh
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                            <X size={18} />
                            Xóa ảnh
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative w-full h-64 border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200 flex flex-col items-center justify-center gap-3
            ${isDragging
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-25'
                        }
          `}
                >
                    <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-orange-100' : 'bg-white'}
            transition-colors duration-200
          `}>
                        {isDragging ? (
                            <Upload size={32} className="text-orange-500 animate-bounce" />
                        ) : (
                            <ImageIcon size={32} className="text-gray-400" />
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-gray-700 font-medium mb-1">
                            {isDragging ? 'Thả ảnh vào đây' : 'Nhấp để chọn ảnh'}
                        </p>
                        <p className="text-sm text-gray-500">
                            hoặc kéo thả ảnh vào đây
                        </p>
                    </div>

                    <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        Chọn ảnh từ máy
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleInputChange}
                className="hidden"
                accept="image/*"
            />
        </div>
    );
};

export default ImageUpload;
