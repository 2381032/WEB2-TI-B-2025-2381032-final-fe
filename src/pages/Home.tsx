export const Home = () => {
  // const { user } = useAuth(); // Hapus komentar jika ingin menampilkan username

  return (
    // Container utama halaman
    <div className="container mx-auto px-4 py-12">
      {/* Card selamat datang dengan styling */}
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg text-center border border-gray-200">
        {/* Judul Utama */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Selamat Datang! 🎉
        </h1>

        {/* Pesan Sambutan */}
        <p className="text-lg text-gray-600 mb-6">
          Anda berada di dashboard Aplikasi Manajemen Friendly Tournament (FT)
          PUBGM.
          {/* Opsional: Personalisasi jika Anda mengambil data user */}
          {/* {user && user.username ? `, ${user.username}` : ''}! */}
        </p>

        {/* Deskripsi Singkat */}
        <p className="text-gray-500 mb-8">
          Silakan gunakan menu navigasi di bagian atas untuk mulai mengelola
          data Teams, Players, atau Matches Anda.
        </p>

        {/* Opsional: Tombol Aksi Cepat */}
        {/* <div className="flex justify-center gap-4">
          <Link
            to="/teams"
            className="bg-blue-600 text-white font-medium py-2 px-5 rounded-lg hover:bg-blue-700 transition duration-200 shadow"
          >
            Kelola Tim
          </Link>
          <Link
            to="/matches"
            className="bg-gray-700 text-white font-medium py-2 px-5 rounded-lg hover:bg-gray-800 transition duration-200 shadow"
          >
            Lihat Match
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
