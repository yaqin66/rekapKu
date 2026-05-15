import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, itemName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus" maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 mt-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold mb-2">Hapus {itemName}?</h3>
        <p className="text-dark-500 dark:text-dark-400 mb-6 text-sm">
          Apakah Anda yakin ingin menghapus {itemName} ini? Data yang sudah dihapus tidak dapat dikembalikan.
        </p>
        <div className="flex gap-3 w-full">
          <button 
            onClick={onClose}
            className="cursor-pointer flex-1 py-2.5 rounded-xl font-semibold bg-dark-100 text-dark-700 hover:bg-dark-200 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="cursor-pointer flex-1 py-2.5 rounded-xl font-semibold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98]"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
}
