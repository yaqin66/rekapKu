import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Loader2, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [pictureUrl, setPictureUrl] = useState(user?.picture || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = { name, email, picture: pictureUrl };
      if (password) {
        payload.password = password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccess('Profil berhasil diperbarui!');
        setPassword(''); // Kosongkan field password setelah update
      } else {
        setError(res.error || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all";
  const iconClass = "w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2";

  return (
    <div className="max-w-2xl mx-auto pb-24 lg:pb-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Perbarui informasi akun dan preferensi Anda</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 text-sm rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {pictureUrl ? (
                  <img src={pictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Foto Profil</label>
              <div className="relative">
                <Camera className={iconClass} />
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={pictureUrl}
                  onChange={(e) => setPictureUrl(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500">Masukkan link URL foto karena penyimpanan gambar langsung belum didukung.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className={iconClass} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Hati-hati! Mengubah email akan memperbarui email utama Anda untuk login.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ganti Password</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type="password"
                  placeholder="Biarkan kosong jika tidak ingin ganti password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
