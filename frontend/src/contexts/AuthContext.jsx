import { useState, useEffect } from "react";
import { AuthContext } from "./auth";
import { supabase } from "../api/supabaseClient";
import axiosClient from "../api/axiosClient";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    let version = 0;
    const loadProfile = async (session, requestVersion) => {
      try {
        if (!session) { if (active) setUser(null); return; }
        const response = await axiosClient.get("/user/myProfile");
        if (active && requestVersion === version) setUser(response.data);
      } catch {
        if (active && requestVersion === version) setUser(null);
      } finally {
        if (active && requestVersion === version) setLoading(false);
      }
    };
    // Defer API calls until Supabase releases its auth lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        version++;
        setUser(null);
        setLoading(false);
      } else if (["INITIAL_SESSION", "SIGNED_IN", "USER_UPDATED"].includes(event)) {
        const requestVersion = ++version;
        setTimeout(() => { if (active && requestVersion === version) void loadProfile(session, requestVersion); }, 0);
      }
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const login = async (userData, session) => {
    if (session) {
      const { error } = await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
      if (error) throw error;
    }
    setUser(userData);
  };
  const logout = async () => {
    setUser(null);
    await supabase.auth.signOut({ scope: "local" });
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {loading ? <div className="min-h-screen flex items-center justify-center">Đang tải...</div> : children}
    </AuthContext.Provider>
  );
};
