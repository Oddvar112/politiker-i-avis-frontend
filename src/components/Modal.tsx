"use client";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-900/80 via-purple-800/80 to-indigo-700/80 p-4">
      <div className="relative z-10 bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 border-4 border-white/30 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in">
        {/* Vikinghjelm-bilde i øvre venstre hjørne - skjult på små skjermer */}
        <img
          src="/bilder/vikinghjelm.png"
          alt="Vikinghjelm"
          className="absolute -top-8 sm:-top-12 -left-8 sm:-left-12 w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl rotate-[-15deg] select-none pointer-events-none hidden sm:block"
          style={{ zIndex: 20 }}
        />
        
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-3 sm:right-4 text-white/70 hover:text-white text-xl sm:text-2xl font-bold focus:outline-none z-10 p-1"
          aria-label="Lukk"
        >
          ×
        </button>
        
        <h2 className="text-xl sm:text-2xl font-extrabold mb-4 text-white drop-shadow-lg font-serif tracking-wide pr-8">
          {title}
        </h2>
        
        <div className="prose prose-sm sm:prose-lg dark:prose-invert text-white drop-shadow-md text-sm sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}