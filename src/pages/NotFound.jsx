import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4">
      <h1 className="text-8xl font-bold text-blue-600 dark:text-blue-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
        Maaf, path route yang Anda tuju tidak tersedia atau telah dipindahkan.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
