import React, { useState } from "react";
import { supabase } from "../../api/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleUpdate}
        className="p-8 bg-white shadow-xl rounded-2xl w-96 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Mật khẩu mới</h2>
        <input
          type="password"
          placeholder="Nhập mật khẩu mới ít nhất 6 ký tự"
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={loading}
          className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePassword;
