import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, Send } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axiosClient.post("/auth/forgot-password", { email });
            toast.success(response.resultMessage?.vn || "Link đặt lại mật khẩu đã được gửi!");
            // Optionally redirect after success
        } catch (err) {
            toast.error(err.resultMessage?.vn || "Gặp lỗi khi gửi yêu cầu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-orange-100">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-6 transition group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại đăng nhập</span>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-800">Quên mật khẩu?</h1>
                    <p className="text-gray-500 mt-2">
                        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email bảo mật
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none transition-all"
                                placeholder="name@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send size={18} />
                                <span>Gửi yêu cầu</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Chưa nhận được email? <button
                            onClick={handleSubmit}
                            disabled={loading || !email}
                            className="text-orange-500 font-bold hover:underline disabled:opacity-50"
                        >
                            Gửi lại
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
