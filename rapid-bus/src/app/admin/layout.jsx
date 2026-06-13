"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          } else {
            setCheckingAuth(false);
          }
          return;
        }

        // Verify email in admins table
        const { data: adminUser, error } = await supabase
          .from('admins')
          .select('email')
          .eq('email', currentSession.user.email)
          .maybeSingle();

        if (error) throw error;

        if (adminUser) {
          setSession(currentSession);
          setCheckingAuth(false);
          if (pathname === '/admin/login') {
            router.replace('/admin');
          }
        } else {
          // Not an admin, logout
          await supabase.auth.signOut();
          router.replace('/admin/login?error=unauthorized');
        }
      } catch (err) {
        console.error('Error validating admin:', err);
        // On error (e.g. table doesn't exist yet), redirect if not on login page
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        } else {
          setCheckingAuth(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } else if (event === 'SIGNED_IN' && currentSession) {
        try {
          const { data: adminUser } = await supabase
            .from('admins')
            .select('email')
            .eq('email', currentSession.user.email)
            .maybeSingle();

          if (adminUser) {
            setSession(currentSession);
            if (pathname === '/admin/login') {
              router.replace('/admin');
            }
          } else {
            await supabase.auth.signOut();
            router.replace('/admin/login?error=unauthorized');
          }
        } catch (err) {
          console.error('Auth state change error:', err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari sesi Admin?");
    if (confirmLogout) {
      await supabase.auth.signOut();
      router.replace('/admin/login');
    }
  };

  // If path is login, bypass layout entirely
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show a premium loading screen while verifying session
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#0b1329] flex flex-col items-center justify-center p-6 text-white font-sans">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1f75b8]/10 blur-[100px] animate-pulse duration-[5s]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[100px] animate-pulse duration-[7s]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center p-2 shadow-2xl animate-bounce duration-[2s]">
            <img src="/logo/sinar-muda_logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-black tracking-wide text-white">PO SINAR MUDA</h2>
            <p className="text-xs text-sky-400 font-bold tracking-widest uppercase mt-1">Mengautentikasi Admin...</p>
          </div>
          <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-sky-400 to-[#1f75b8] w-1/2 rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
          </div>
        </div>
        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { name: 'Data Tiket', icon: 'confirmation_number', path: '/admin/tiket' },
    { name: 'Armada Bus', icon: 'directions_bus', path: '/admin/armada' },
    { name: 'Rute & Jadwal', icon: 'route', path: '/admin/rute' },
    { name: 'Daftar Penumpang', icon: 'person_search', path: '/admin/penumpang' },
    { name: 'Pelanggan', icon: 'group', path: '/admin/pelanggan' },
    { name: 'Laporan', icon: 'bar_chart', path: '/admin/laporan' },
    { name: 'Pengaturan', icon: 'settings', path: '/admin/pengaturan' },
  ];

  const user = session?.user;
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin Sinar Muda";
  const userAvatar = user?.user_metadata?.avatar_url;
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Topbar */}
      <div className="md:hidden w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="font-black text-[#1f75b8] text-lg tracking-wide">
            SINAR MUDA
          </div>
        </div>
        
        {userAvatar ? (
          <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1f75b8] font-bold text-xs">
            {userInitials}
          </div>
        )}
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#1f75b8] text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-20 border-b border-white/10 flex items-center px-6 shrink-0 justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1">
              <img src="/logo/sinar-muda_logo.jpeg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg tracking-wide leading-none">PO SINAR MUDA</span>
              <span className="text-[10px] text-blue-200 font-bold tracking-widest mt-1">ADMIN PANEL</span>
            </div>
          </div>
          <button 
            className="md:hidden text-white/70 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-1 hide-scrollbar">
          {menuItems.map((item, idx) => {
            const isActive = item.path === pathname || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={idx}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#1f75b8] shadow-md shadow-black/5' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          {session && (
            <div className="flex items-center gap-3 px-4 py-2 text-white/90">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-white/20" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold text-xs">
                  {userInitials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate leading-none mb-1">{userName}</span>
                <span className="text-[10px] text-blue-200 truncate">{user?.email}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-red-600/20 hover:text-red-200 transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-medium">Logout Admin</span>
          </button>
          
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-xl text-blue-200 hover:text-white text-xs transition-colors">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Ke Web Pelanggan</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800">
              {menuItems.find(m => m.path === pathname || (m.path !== '/admin' && pathname.startsWith(m.path)))?.name || "Dashboard"}
            </h2>
            <p className="text-xs text-gray-500 font-medium">Selamat datang kembali, Admin!</p>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Cari kode booking..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/20 rounded-full text-sm w-64 transition-all outline-none"
              />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-5 border-l border-gray-200">
              <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-sm font-bold text-gray-800">{userName}</span>
                <span className="text-xs text-gray-500">Super Admin</span>
              </div>
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-md border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1f75b8] to-blue-400 text-white flex items-center justify-center shadow-md font-bold">
                  {userInitials}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

