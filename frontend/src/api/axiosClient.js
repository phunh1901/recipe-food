import axios from "axios";
import { supabase } from "./supabaseClient";
import { configureAuthInterceptors } from "./authInterceptors";
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 15000,
});
configureAuthInterceptors(axiosClient, supabase.auth);
export default axiosClient;
