"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1f75b8]">
          <span className="material-symbols-outlined text-[18px]">person</span>
        </div>
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
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-white/10 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-medium">Keluar ke Web</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8fafc]">
        {/* Desktop Topbar */}
        <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
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
                <span className="text-sm font-bold text-gray-800">Budi Santoso</span>
                <span className="text-xs text-gray-500">Super Admin</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1f75b8] to-blue-400 text-white flex items-center justify-center shadow-md">
                <span className="font-bold">BS</span>
              </div>
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
