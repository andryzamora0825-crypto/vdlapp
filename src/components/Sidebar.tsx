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

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-14 z-[60] bg-[#111113]/95 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Menú"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h2 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 tracking-tight">
          VDL Vouchers
        </h2>
        {/* Avatar mini in header */}
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-white/10" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 h-[100dvh] bg-[#111113] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 shadow-2xl transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo area — hidden on mobile (we show logo in top bar) */}
        <div className="hidden md:flex p-6 pt-8">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 tracking-tight">
            VDL Vouchers
          </h2>
        </div>

        {/* Mobile: spacer so nav starts below mobile top bar */}
        <div className="md:hidden h-16 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={closeMenu} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-500 tracking-tight">
              VDL Vouchers
            </h2>
          </div>
        </div>

        {/* Nav links — scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                  ${isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile — always visible at bottom */}
        <div className="p-4 border-t border-white/5 bg-[#111113]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-lg border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-gray-200 truncate">{user?.fullName || "Usuario"}</span>
              <span className="text-xs text-gray-500 truncate">{currentEmail || "Sin email"}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
