import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30">
           <div className="font-bold text-blue-600 text-xl">OWOO</div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-600">
             <Menu className="w-6 h-6" />
           </button>
        </div>

        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
