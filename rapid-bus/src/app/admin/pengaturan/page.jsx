"use client";

import React, { useState } from 'react';

export default function AdminPengaturanPage() {
  const [activeTab, setActiveTab] = useState('umum');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulasi proses menyimpan pengaturan
    setTimeout(() => {
      setIsSaving(false);
      alert("Pengaturan berhasil disimpan!");
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl">
      
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h2>
        <p className="text-sm text-gray-500">Kelola preferensi aplikasi, informasi perusahaan, dan akun Admin</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto hide-scrollbar shrink-0">
          <button 
            onClick={() => setActiveTab('umum')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'umum' ? 'bg-[#1f75b8] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">apartment</span>
            Info Perusahaan
          </button>
          <button 
            onClick={() => setActiveTab('pembayaran')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'pembayaran' ? 'bg-[#1f75b8] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            Metode Pembayaran
          </button>
          <button 
            onClick={() => setActiveTab('akun')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'akun' ? 'bg-[#1f75b8] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            Akun Admin
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            
            {/* TAB: UMUM */}
            {activeTab === 'umum' && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 overflow-hidden relative group cursor-pointer hover:border-[#1f75b8]">
                    <img src="/logo/sinar-muda_logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">edit</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">Logo Perusahaan</h3>
                    <p className="text-xs text-gray-500">Klik untuk mengubah logo aplikasi (JPG/PNG max 2MB).</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Nama Perusahaan</label>
                    <input type="text" defaultValue="PO SINAR MUDA" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Nomor Telepon CS</label>
                    <input type="text" defaultValue="0812-3456-7890" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700">Alamat Kantor Pusat</label>
                    <textarea rows="3" defaultValue="Jl. Perintis Kemerdekaan, Terminal Daya, Makassar, Sulawesi Selatan" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50 resize-none"></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PEMBAYARAN */}
            {activeTab === 'pembayaran' && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                  <span className="material-symbols-outlined mt-0.5">info</span>
                  <div className="text-sm">
                    <strong>Pemberitahuan:</strong> Saat ini sistem masih menggunakan mode pembayaran Manual/Transfer Bank. Integrasi ke Payment Gateway pihak ketiga sedang dalam tahap pengembangan.
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Rekening Bank Tersedia</h3>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-blue-800 text-sm">BCA</div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">BCA - Sinar Muda</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">8732 1123 999</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1f75b8]"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-orange-600 text-sm">BNI</div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">BNI - Sinar Muda Transport</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">0912 3341 55</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1f75b8]"></div>
                      </label>
                    </div>
                  </div>

                  <button type="button" className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:text-[#1f75b8] hover:border-[#1f75b8] transition-colors text-sm flex items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[18px]">add</span> Tambah Rekening Bank
                  </button>
                </div>
              </div>
            )}

            {/* TAB: AKUN */}
            {activeTab === 'akun' && (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Nama Admin</label>
                    <input type="text" defaultValue="Budi Santoso" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700">Email Akun</label>
                    <input type="email" defaultValue="admin@sinarmuda.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6 mt-2">
                  <h3 className="font-bold text-gray-800 mb-4">Ganti Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700">Password Saat Ini</label>
                      <input type="password" placeholder="Masukkan password lama" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700">Password Baru</label>
                      <input type="password" placeholder="Masukkan password baru" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="border-t border-gray-100 pt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-[#1f75b8] text-white font-bold rounded-xl hover:bg-sky-600 transition-colors text-sm shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                Simpan Perubahan
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
