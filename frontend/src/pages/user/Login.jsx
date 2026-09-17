import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../contexts/auth";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Trang trước đó (ProtectedRoute truyền sang)
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post("/auth/login", {
        email,
        password,
      });

      const { user, session } = res;

      // Lưu auth
      await login(user, session);

      toast.success("Chào mừng bạn quay trở lại!");

      // QUAY VỀ TRANG CŨ
      navigate(from, { replace: true });

    } catch (err) {
      toast.error(
        err?.resultMessage?.vn || "Đăng nhập thất bại"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-orange-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-orange-600">
            Recipe Food
          </h1>
          <p className="text-gray-500 mt-2">
            Đăng nhập để chia sẻ công thức của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="name@gmail.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-600 shadow-lg transition">
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 text-right">
          <a
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-orange-500"
          >
            Quên mật khẩu?
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <a
              href="/register"
              className="text-orange-500 font-semibold hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Quay về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
