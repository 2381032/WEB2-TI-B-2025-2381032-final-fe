// src/utils/AxiosInstance.ts (Disesuaikan)

import axios, { InternalAxiosRequestConfig } from "axios";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL // Pastikan VITE_API_URL di .env sudah benar
});

// === INTERCEPTOR REQUEST ===
AxiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ambil token dari localStorage menggunakan key "token" (sesuai AuthProvider)
    const token = localStorage.getItem("token"); // <-- PASTIKAN KEY SAMA

    if (token) {
      // Jika token ada, tambahkan ke header
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Kembalikan config
    return config;
  },
  (error) => {
    console.error("Axios request interceptor error:", error);
    return Promise.reject(error);
  }
);

// === INTERCEPTOR RESPONSE (Opsional, untuk handle 401 global) ===
AxiosInstance.interceptors.response.use(
  (response) => response, // Langsung teruskan jika response sukses
  (error) => {
    // Cek jika error disebabkan oleh response dan statusnya 401
    if (error.response && error.response.status === 401) {
      console.error(
        "Unauthorized (401). Token mungkin expired. Logging out..."
      );

      // Hapus token dari localStorage
      localStorage.removeItem("token"); // <-- Gunakan key yang sama

      // Redirect ke halaman login untuk memaksa login ulang
      // Cek agar tidak terjadi loop jika sudah di halaman login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"; // Cara paling mudah untuk redirect dari luar React component
        // Atau Anda bisa emit event / set state global jika punya mekanisme lebih canggih
      }
    }
    // Tetap teruskan error agar bisa ditangani juga di tempat pemanggilan (jika perlu)
    return Promise.reject(error);
  }
);

export default AxiosInstance;
