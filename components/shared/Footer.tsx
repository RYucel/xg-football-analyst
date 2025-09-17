
import React from 'react';

interface FooterProps {
  onAdminToggle: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminToggle }) => {
  return (
    <footer className="w-full max-w-3xl mt-12 text-center text-gray-500 text-sm">
      <p>&copy; {new Date().getFullYear()} Bahis Strateji Merkezi. Sadece gösterim amaçlıdır.</p>
      <p>Her zaman sorumlu bahis yapın.</p>
      <div className="mt-4">
        <button 
          onClick={onAdminToggle}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
        >
          Admin Paneli
        </button>
      </div>
    </footer>
  );
};
