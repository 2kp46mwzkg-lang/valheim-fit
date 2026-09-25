import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="pop relative max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-3xl border border-[#3f5548] bg-[#24332b] p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-[#2f4237] p-2 text-[#a8b3a5] hover:text-white"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}
