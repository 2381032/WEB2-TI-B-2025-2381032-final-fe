// src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

// Layouts
import BaseLayout from "./layouts/BaseLayout"; // Layout dasar (mungkin untuk publik)
import RootLayout from "./layouts/RootLayout"; // Layout utama setelah login (dengan navbar)

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeamPage from "./pages/Team"; // Halaman Manajemen Tim
import PlayerPage from "./pages/Player"; // Halaman Manajemen Player
import MatchPage from "./pages/Match"; // Halaman Manajemen Match

// Route Protection & Auth Context
import PrivateRoute from "./utils/PrivateRoute"; // Komponen proteksi route privat Anda
import PublicRoute from "./utils/PublicRoute"; // Komponen proteksi route publik Anda
import { AuthProvider } from "./utils/AuthProvider"; // Provider Autentikasi Anda

// Buat instance QueryClient untuk React Query
const queryClient = new QueryClient();

function App() {
  // Definisikan struktur router aplikasi
  const router = createBrowserRouter(
    createRoutesFromElements(
      // Rute Induk (tanpa path spesifik)
      <Route>
        {/* Grup Rute Publik */}
        {/* Menggunakan BaseLayout untuk halaman login & register */}
        <Route element={<BaseLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                {" "}
                {/* Hanya bisa diakses jika BELUM login */}
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                {" "}
                {/* Hanya bisa diakses jika BELUM login */}
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* Grup Rute Privat */}
        {/* Menggunakan RootLayout untuk halaman setelah login */}
        <Route path="/" element={<RootLayout />}>
          {/* Halaman Home (index) */}
          <Route
            index // Cocok dengan path="/"
            element={
              <PrivateRoute>
                {" "}
                {/* Hanya bisa diakses jika SUDAH login */}
                <Home />
              </PrivateRoute>
            }
          />
          {/* Halaman Manajemen Tim */}
          <Route
            path="teams" // Cocok dengan path="/teams"
            element={
              <PrivateRoute>
                <TeamPage />
              </PrivateRoute>
            }
          />
          {/* Halaman Manajemen Player */}
          <Route
            path="players" // Cocok dengan path="/players"
            element={
              <PrivateRoute>
                <PlayerPage />
              </PrivateRoute>
            }
          />
          {/* Halaman Manajemen Match */}
          <Route
            path="matches" // Cocok dengan path="/matches"
            element={
              <PrivateRoute>
                <MatchPage />
              </PrivateRoute>
            }
          />
          {/* Tambahkan rute privat lainnya di dalam sini jika perlu */}
        </Route>

        {/* Opsional: Rute untuk halaman Not Found (404) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    )
  );

  // Render aplikasi utama dengan semua provider
  return (
    <>
      {/* AuthProvider membungkus semua agar state auth tersedia */}
      <AuthProvider>
        {/* QueryClientProvider untuk React Query */}
        <QueryClientProvider client={queryClient}>
          {/* RouterProvider menjalankan aplikasi sesuai definisi router */}
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
}

export default App;
