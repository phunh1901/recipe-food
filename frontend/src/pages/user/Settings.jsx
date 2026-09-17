import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axiosClient from "../../api/axiosClient";
import {
    Settings as SettingsIcon,
    Lock,
    KeyRound,
    Eye,
    EyeOff,
    ShieldCheck,
    Mail
} from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const toggleShow = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            return toast.error("Mật khẩu mới không khớp!");
        }

        if (passwords.newPassword.length < 6) {
            return toast.error("Mật khẩu phải từ 6 ký tự!");
        }

        setLoading(true);
        try {
            await axiosClient.patch("/user/change-password", passwords);
            toast.success("Đổi mật khẩu thành công!");
            setPasswords({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
        } catch (err) {
            console.error("Lỗi đổi mật khẩu:", err);
            const msg = err.resultMessage?.vn || "Đổi mật khẩu thất bại";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SettingsIcon className="text-blue-600" size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-800">Cài đặt tài khoản</h1>
                <p className="text-gray-500 mt-2">Quản lý bảo mật và mật khẩu của bạn</p>
            </div>

            <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Lock className="text-orange-600" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                    {/* Old Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPass.old ? "text" : "password"}
                                name="oldPassword"
                                value={passwords.oldPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-medium"
                                placeholder="Nhập mật khẩu cũ"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('old')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPass.old ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPass.new ? "text" : "password"}
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-medium"
                                placeholder="Tối thiểu 6 ký tự"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('new')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPass.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPass.confirm ? "text" : "password"}
                                name="confirmNewPassword"
                                value={passwords.confirmNewPassword}
                                onChange={handleChange}
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition font-medium"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => toggleShow('confirm')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPass.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Cập nhật mật khẩu"
                        )}
                    </button>
                </form>
            </div>

            {/* Other Settings Placeholder */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-gray-100 transition">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Thông báo Email</h4>
                        <p className="text-xs text-gray-400 mt-1">Quản lý nhận tin qua email</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-gray-100 transition">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Xác thực 2 yếu tố</h4>
                        <p className="text-xs text-gray-400 mt-1">Bảo mật tài khoản cấp cao</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
