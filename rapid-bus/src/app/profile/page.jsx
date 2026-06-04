"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// Reusable Modal Wrapper (di luar komponen utama agar tidak re-render)
const ModalWrapper = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
    <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl relative w-full md:max-w-lg max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 shrink-0">
        <h3 className="font-bold text-lg md:text-xl text-gray-800">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
      <div className="p-5 md:p-6 overflow-y-auto flex-1">
        {children}
      </div>
    </div>
  </div>
);

// Success Toast
const SuccessToast = () => (
  <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top duration-300">
    <span className="material-symbols-outlined text-[20px]">check_circle</span>
    Berhasil disimpan!
  </div>
);

// Input component
const FormInput = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium text-sm outline-none focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/20 transition-all"
    />
  </div>
);

// Toggle component
const Toggle = ({ label, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-gray-800 text-sm">{label}</span>
      <span className="text-xs text-gray-500">{desc}</span>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-7 rounded-full transition-all duration-300 relative ${checked ? 'bg-[#1f75b8]' : 'bg-gray-300'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`}></div>
    </button>
  </div>
);

export default function ProfilePage() {
  // User profile state (editable)
  const [userName, setUserName] = useState("Reitama");
  const [userEmail, setUserEmail] = useState("reitama@example.com");
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };
  const [userPhone, setUserPhone] = useState("+62 812-3456-7890");
  const [userPassword, setUserPassword] = useState("");
  const [userNewPassword, setUserNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);


  // Transaction history
  const transactions = [
    { id: "TRX-20260528-001", date: "28 Mei 2026", route: "Makassar → Toraja", operator: "Sinar Muda", seats: "A1, A2", total: "Rp 460.000", status: "Selesai" },
    { id: "TRX-20260520-003", date: "20 Mei 2026", route: "Toraja → Makassar", operator: "Sinar Muda", seats: "B3", total: "Rp 200.000", status: "Selesai" },
    { id: "TRX-20260515-002", date: "15 Mei 2026", route: "Makassar → Toraja", operator: "Sinar Muda", seats: "A3", total: "Rp 200.000", status: "Dibatalkan" },
  ];

  // Notification settings state

  const [notifBooking, setNotifBooking] = useState(true);
  const [notifReminder, setNotifReminder] = useState(false);
  const [language, setLanguage] = useState("id");

  // Active modal state
  const [activeModal, setActiveModal] = useState(null); // 'akun' | 'riwayat' | 'bantuan' | 'pengaturan' | 'logout' | null
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const menuItems = [
    { id: "akun", icon: "account_circle", label: "Informasi Akun", desc: "Ubah data diri dan kata sandi" },
    { id: "riwayat", icon: "receipt_long", label: "Riwayat Transaksi", desc: "Lihat semua transaksi sebelumnya" },
    { id: "bantuan", icon: "help_center", label: "Pusat Bantuan", desc: "Hubungi customer service kami" },
    { id: "pengaturan", icon: "settings", label: "Pengaturan", desc: "Pengaturan notifikasi dan bahasa" }
  ];

  const handleSave = () => {
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
      setActiveModal(null);
    }, 1500);
  };




  return (
    <>
      {/* Header (Desktop) */}
      <header className="fixed top-0 w-full z-50 bg-[#a3d1ff]/85 backdrop-blur-md border-b border-white/10 shadow-sm flex items-center px-4 md:px-10 h-24 transition-all justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined font-bold text-[24px]">arrow_back</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 md:gap-4 group ml-1 md:ml-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-[12px] md:rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all overflow-hidden border-2 border-white/60">
              <img src="/logo/sinar-muda_logo.jpeg" alt="Bus Icon" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#1f75b8] text-[17px] md:text-[26px] tracking-wide leading-none drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>PO SINAR MUDA</span>
              <span className="font-bold text-[#1f75b8]/90 text-[8px] md:text-[11px] tracking-[0.28em] mt-1 md:mt-1.5 drop-shadow-sm">TRANSPORTATION</span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">home</span>
            Beranda
          </Link>
          <Link href="/tickets" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            Tiketku
          </Link>
          <Link href="/profile" className="text-[#1f75b8] font-semibold flex items-center gap-2 hover:text-[#1f75b8]/80 transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
            Profil
          </Link>
        </nav>
      </header>
      
      {/* Background Gradient */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[500px] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] pointer-events-none blur-3xl"></div>

      <main className="pt-32 pb-32 md:pb-16 px-4 md:px-10 max-w-lg md:max-w-4xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Header Title */}
        <h2 className="text-3xl font-bold text-white text-center md:text-left mb-2 md:mb-6 drop-shadow-sm">Profil Saya</h2>

        {/* Profile Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 flex flex-col items-center text-center relative overflow-hidden group">
          {/* Subtle glow effect behind avatar */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#1f75b8]/10 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
          
          {/* Avatar */}
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1f75b8] to-[#60a5fa] p-1 shadow-lg relative z-10">
               <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-[3px] border-white overflow-hidden">
                 {profileImage ? (
                   <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-bold text-[#1f75b8]">{userName.charAt(0).toUpperCase()}</span>
                 )}
               </div>
            </div>
            {/* Edit Button */}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 bg-white border border-gray-100 shadow-md w-8 h-8 rounded-full flex items-center justify-center text-[#1f75b8] hover:scale-110 hover:bg-gray-50 active:scale-95 transition-all z-20"
              title="Ganti Foto Profil"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
          
          {/* User Info */}
          <h3 className="text-2xl font-bold text-gray-800 mb-1.5 z-10">{userName}</h3>
          <p className="text-gray-500 font-medium z-10 mb-3">{userEmail}</p>
          <div className="bg-gray-100/80 px-4 py-1.5 rounded-full z-10">
            <span className="text-sm font-semibold text-gray-600 tracking-wide">{userPhone}</span>
          </div>
        </div>

        {/* Menu Items list */}
        <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden flex flex-col">
          {menuItems.map((item, index) => (
            <button 
              key={index} 
              onClick={() => setActiveModal(item.id)}
              className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0 group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-[#1f75b8]/10 flex items-center justify-center text-gray-400 group-hover:text-[#1f75b8] transition-colors">
                  <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-gray-800 group-hover:text-[#1f75b8] transition-colors text-sm md:text-base">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-gray-300 group-hover:text-[#1f75b8] group-hover:translate-x-1 transition-all">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setActiveModal('logout')}
          className="bg-white/95 backdrop-blur-md rounded-[24px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all font-bold"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          Keluar
        </button>

      </main>

      {/* ========== MODALS ========== */}

      {/* Success Toast */}
      {showSaveSuccess && <SuccessToast />}

      {/* 1. Informasi Akun Modal */}
      {activeModal === 'akun' && (
        <ModalWrapper title="Informasi Akun" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-4">
            <FormInput label="Nama Lengkap" value={userName} onChange={setUserName} />
            <FormInput label="Email" value={userEmail} onChange={setUserEmail} type="email" />
            <FormInput label="Nomor HP" value={userPhone} onChange={setUserPhone} type="tel" />
            <hr className="border-gray-100 my-2" />
            <h4 className="font-bold text-gray-700 text-sm">Ubah Kata Sandi</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kata Sandi Lama</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 font-medium text-sm outline-none focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/20 transition-all"
                />
                <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1f75b8] transition-colors p-1">
                  <span className="material-symbols-outlined text-[20px]">{showOldPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={userNewPassword}
                  onChange={(e) => setUserNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 font-medium text-sm outline-none focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/20 transition-all"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1f75b8] transition-colors p-1">
                  <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
            </div>
            <button 
              onClick={handleSave}
              className="mt-4 w-full bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </ModalWrapper>
      )}


      {/* 3. Riwayat Transaksi Modal */}
      {activeModal === 'riwayat' && (
        <ModalWrapper title="Riwayat Transaksi" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm md:text-base">{tx.route}</span>
                    <span className="text-xs text-gray-500">{tx.date} · {tx.operator}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${tx.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {tx.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium uppercase">Kursi</span>
                      <span className="text-sm font-bold text-gray-700">{tx.seats}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium uppercase">ID</span>
                      <span className="text-xs font-mono text-gray-500">{tx.id}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#1f75b8] text-base">{tx.total}</span>
                </div>
              </div>
            ))}
          </div>
        </ModalWrapper>
      )}

      {/* 4. Pusat Bantuan Modal */}
      {activeModal === 'bantuan' && (
        <ModalWrapper title="Pusat Bantuan" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-600 leading-relaxed">Jika Anda memiliki pertanyaan atau kendala, silakan hubungi kami melalui salah satu cara di bawah ini:</p>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-gray-800 text-sm">WhatsApp Admin</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 pb-2">
                {[
                  { name: 'Admin Makassar', number: '081241527132', wa: '6281241527132' },
                  { name: 'Admin Makassar 2', number: '0811417132', wa: '62811417132' },
                  { name: 'Admin Masamba', number: '082317588758', wa: '6282317588758' },
                  { name: 'Admin Rantepao', number: '081241526706', wa: '6281241526706' },
                  { name: 'Admin Makale', number: '085255513033', wa: '6285255513033' },
                  { name: 'Admin Malili', number: '081241527123', wa: '6281241527123' },
                  { name: 'Admin Wawondula', number: '081341747609', wa: '6281341747609' },
                  { name: 'Admin Sorowako', number: '082196734188', wa: '6282196734188' },
                  { name: 'Admin Sorowako 2', number: '0811458551', wa: '62811458551' }
                ].map((admin, idx) => (
                  <a key={idx} href={`https://wa.me/${admin.wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-sm shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-xs group-hover:text-green-700 transition-colors">{admin.name}</span>
                      <span className="text-[11px] text-gray-500">{admin.number}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <a href="mailto:cs@sinarmuda.co.id" className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-[#1f75b8] flex items-center justify-center text-white shadow-sm">
                <span className="material-symbols-outlined text-[24px]">mail</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-sm group-hover:text-[#1f75b8] transition-colors">Email</span>
                <span className="text-xs text-gray-500">cs@sinarmuda.co.id</span>
              </div>
            </a>


            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-2">
              <h4 className="font-bold text-gray-800 text-sm">Jam Operasional</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Senin - Sabtu</span>
                <span className="font-semibold text-gray-700">07:00 - 21:00 WITA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Minggu & Libur</span>
                <span className="font-semibold text-gray-700">08:00 - 17:00 WITA</span>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 5. Pengaturan Modal */}
      {activeModal === 'pengaturan' && (
        <ModalWrapper title="Pengaturan" onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-gray-700 text-sm mb-1">Notifikasi</h4>

            <Toggle label="Status Pemesanan" desc="Update status tiket Anda" checked={notifBooking} onChange={setNotifBooking} />
            <Toggle label="Pengingat Keberangkatan" desc="Notifikasi H-1 keberangkatan" checked={notifReminder} onChange={setNotifReminder} />
            
            <hr className="border-gray-100 my-3" />
            
            <h4 className="font-bold text-gray-700 text-sm mb-2">Bahasa</h4>
            <div className="flex gap-3">
              <button 
                onClick={() => setLanguage("id")}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${language === "id" ? "bg-[#1f75b8] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🇮🇩 Indonesia
              </button>
              <button 
                onClick={() => setLanguage("en")}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${language === "en" ? "bg-[#1f75b8] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                🇬🇧 English
              </button>
            </div>

            <button 
              onClick={handleSave}
              className="mt-6 w-full bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
            >
              Simpan Pengaturan
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* 6. Logout Confirmation Modal */}
      {activeModal === 'logout' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-sm z-10 p-6 md:p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-5">
              <span className="material-symbols-outlined text-[32px]">logout</span>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Keluar dari Akun?</h3>
            <p className="text-sm text-gray-500 mb-6">Anda yakin ingin keluar dari akun Anda? Anda perlu masuk kembali untuk mengakses fitur yang tersedia.</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => { setActiveModal(null); /* Could redirect to login page */ }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar with Glassmorphism (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-6 pb-2">
        {/* Home */}
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">home</span>
          <span className="text-[11px] font-medium">Beranda</span>
        </Link>
        {/* My Bookings */}
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/tickets">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">confirmation_number</span>
          <span className="text-[11px] font-medium">Tiketku</span>
        </Link>
        {/* Profile (Active) */}
        <Link className="flex flex-col items-center justify-center gap-1 bg-[#a3d1ff]/10 text-[#1f75b8] rounded-2xl px-5 py-2 hover:bg-[#a3d1ff]/20 active:scale-95 transition-all duration-300" href="/profile">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
          <span className="text-[11px] font-bold">Profil</span>
        </Link>
      </nav>
    </>
  );
}
