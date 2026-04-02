"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, UploadCloud, UserCircle, ShieldAlert, FileText, MessageSquare, Menu, X } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const currentEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = currentEmail === 'andryzamora0825@gmail.com';

  const links = [
    { name: 'Lectura de Vouchers', href: '/', icon: UploadCloud },
    { name: 'Registro', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Perfil', href: '/profile', icon: UserCircle },
  ];

  const isVIP = user?.publicMetadata?.plan === 'vip';

  if (isVIP || isAdmin) {
    links.push({ name: 'Nota de Retiro', href: '/nota-retiro', icon: FileText });
    links.push({ name: 'Verificar Chat', href: '/comparar-chat', icon: MessageSquare });
  }

  if (isAdmin) {
    links.push({ name: 'Panel Admin', href: '/admin', icon: ShieldAlert });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-[#111113] border border-white/10 text-white p-2 text-sm rounded-lg flex items-center justify-center shadow-lg"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 h-screen bg-[#111113] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 shadow-2xl transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 pt-16 md:pt-8">
        <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 tracking-tight">
          VDL Vouchers
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-3 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]' 
                  : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-lg border border-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200 truncate w-32">{user?.fullName || "Usuario"}</span>
            <span className="text-xs text-gray-500 truncate w-32">{currentEmail || "Sin email"}</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
