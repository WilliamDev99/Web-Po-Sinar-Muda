"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/utils/supabase';

// Reusable Modal Wrapper
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
const SuccessToast = ({ t }) => (
  <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-sm animate-in fade-in slide-in-from-top duration-300">
    <span className="material-symbols-outlined text-[20px]">check_circle</span>
    {t('saveSuccess') || 'Perubahan berhasil disimpan!'}
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

const formatPhoneNumber = (num) => {
  if (!num) return '';
  let clean = num.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.substring(1);
  }
  if (!clean.startsWith('+') && clean.startsWith('62')) {
    clean = '+' + clean;
  }
  return clean;
};

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  
  // Auth state
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');
  const [regGender, setRegGender] = useState('Laki-laki');

  // Profile fields
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Real transactions from database
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Notification settings state
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifReminder, setNotifReminder] = useState(false);

  // Active modal state
  const [activeModal, setActiveModal] = useState(null); // 'akun' | 'riwayat' | 'bantuan' | 'pengaturan' | 'logout' | null
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession) {
          syncUserData(currentSession);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingAuth(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        syncUserData(currentSession);
      } else {
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        setProfileImage(null);
        setTransactions([]);
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserData = async (s) => {
    const user = s.user;
    const name = user.user_metadata?.full_name || user.email.split('@')[0];
    const phoneVal = user.user_metadata?.phone || '';
    setUserName(name);
    setUserEmail(user.email);
    setUserPhone(phoneVal);
    setProfileImage(user.user_metadata?.avatar_url || null);
    fetchTransactions(user.email);

    try {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: name,
          phone: phoneVal ? formatPhoneNumber(phoneVal) : null,
          gender: user.user_metadata?.gender || null
        }, { onConflict: 'id' });
    } catch (err) {
      console.error("Error upserting profile:", err);
    }
  };

  const fetchTransactions = async (email) => {
    setLoadingTx(true);
    try {
      const { data, error } = await supabase
        .from('pemesanan')
        .select(`
          kode_booking,
          total_harga,
          status,
          created_at,
          nomor_kursi,
          nama_pelanggan,
          jadwal!inner (
            tanggal_berangkat,
            waktu_berangkat,
            rute!inner (kota_asal, kota_tujuan)
          )
        `)
        .eq('email_pelanggan', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const formatted = data.map(tx => {
          const d = new Date(tx.jadwal.tanggal_berangkat);
          const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const dateStr = isNaN(d) ? tx.jadwal.tanggal_berangkat : `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;

          return {
            id: tx.kode_booking,
            date: dateStr,
            route: `${tx.jadwal.rute.kota_asal} → ${tx.jadwal.rute.kota_tujuan}`,
            operator: "PO Sinar Muda",
            seats: tx.nomor_kursi.join(', '),
            total: `Rp ${Number(tx.total_harga).toLocaleString('id-ID').replace(/,/g, '.')}`,
            status: tx.status === 'Lunas' ? 'Selesai' : tx.status === 'Menunggu' ? 'Menunggu' : 'Dibatalkan'
          };
        });
        setTransactions(formatted);
      }
    } catch (err) {
      console.error('Error fetching customer transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingAuth(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login dengan Google.');
      setLoadingAuth(false);
    }
  };

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Email/No. WhatsApp dan password wajib diisi.');
      return;
    }
    setLoadingAuth(true);
    setErrorMsg('');

    let targetEmail = loginEmail.trim();

    // If not email format, search phone in profiles table
    if (!targetEmail.includes('@')) {
      try {
        const cleanedPhone = formatPhoneNumber(targetEmail);
        const { data: profile, error: searchError } = await supabase
          .from('profiles')
          .select('email')
          .or(`phone.eq.${targetEmail},phone.eq.${cleanedPhone}`)
          .maybeSingle();

        if (searchError) throw searchError;

        if (profile) {
          targetEmail = profile.email;
        } else {
          setErrorMsg('Nomor WhatsApp tidak terdaftar.');
          setLoadingAuth(false);
          return;
        }
      } catch (err) {
        console.error("Error looking up phone number:", err);
        setErrorMsg('Gagal memproses login nomor WhatsApp.');
        setLoadingAuth(false);
        return;
      }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: loginPassword
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Email/No. WhatsApp atau password salah.');
      setLoadingAuth(false);
    }
  };

  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regConfirmPassword || !regName || !regPhone) {
      setErrorMsg('Semua kolom wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setLoadingAuth(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            phone: regPhone,
            gender: regGender
          }
        }
      });
      if (error) throw error;

      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: regEmail,
            phone: formatPhoneNumber(regPhone),
            full_name: regName,
            gender: regGender
          });
        if (profileError) console.error("Error inserting profile row:", profileError);
      }

      alert("Pendaftaran berhasil! Jika verifikasi email aktif, cek inbox Anda. Silakan coba login sekarang.");
      setIsLoginMode(true);
      setLoadingAuth(false);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
      setLoadingAuth(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userName.trim()) {
      alert("Nama tidak boleh kosong.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userName,
          phone: userPhone
        }
      });
      if (error) throw error;
      
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        setActiveModal(null);
      }, 1500);
    } catch (err) {
      alert("Gagal memperbarui profil: " + err.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // In a real application, upload file to Supabase Storage and update user metadata.
    }
  };

  const menuItems = [
    { id: "akun", icon: "account_circle", label: t('menuAccount') || 'Informasi Akun', desc: t('menuAccountDesc') || 'Detail profil dan pengaturan keamanan' },
    { id: "riwayat", icon: "receipt_long", label: t('menuHistory') || 'Riwayat Transaksi', desc: t('menuHistoryDesc') || 'Riwayat pemesanan tiket Anda' },
    { id: "bantuan", icon: "help_center", label: t('menuHelp') || 'Pusat Bantuan', desc: t('menuHelpDesc') || 'Hubungi admin perwakilan kami' },
    { id: "pengaturan", icon: "settings", label: t('menuSettings') || 'Pengaturan', desc: t('menuSettingsDesc') || 'Ubah bahasa dan opsi notifikasi' }
  ];

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#a3d1ff]/85 backdrop-blur-md border-b border-white/10 shadow-sm flex items-center px-4 md:px-10 h-24 transition-all justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined font-bold text-[24px]">arrow_back</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 md:gap-4 group ml-1 md:ml-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-[12px] md:rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all overflow-hidden border-2 border-white/60">
              <img src="/logo/sinar-muda_logo.jpeg" alt="Bus Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#1f75b8] text-[17px] md:text-[26px] tracking-wide leading-none drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>PO SINAR MUDA</span>
              <span className="font-bold text-[#1f75b8]/90 text-[8px] md:text-[11px] tracking-[0.28em] mt-1 md:mt-1.5 drop-shadow-sm">TRANSPORTATION</span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">home</span>
            {t('navHome') || 'Beranda'}
          </Link>
          <Link href="/tickets" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            {t('navTickets') || 'Tiketku'}
          </Link>
          <Link href="/profile" className="text-[#1f75b8] font-semibold flex items-center gap-2 hover:text-[#1f75b8]/80 transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
            {t('navProfile') || 'Profil'}
          </Link>
        </nav>
      </header>

      {/* Background Gradient */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[500px] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] pointer-events-none blur-3xl"></div>

      <main className="pt-32 pb-32 md:pb-16 px-4 md:px-10 max-w-lg md:max-w-4xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center md:text-left mb-2 md:mb-6 drop-shadow-sm">
          {session ? (t('title') || 'Profil Pengguna') : 'Masuk Pelanggan'}
        </h2>

        {!session ? (
          /* LOGIN & REGISTER INTERFACE */
          <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-md border border-gray-100">
                <img src="/logo/sinar-muda_logo.jpeg" alt="PO Sinar Muda Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h3 className="font-black text-[#1f75b8] text-xl tracking-wide">PO SINAR MUDA</h3>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  {isLoginMode ? 'Masuk untuk mengelola tiket dan perjalanan Anda' : 'Daftar akun pelanggan baru PO Sinar Muda'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex gap-2 items-start animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-red-500 shrink-0 text-[18px]">error</span>
                <div>{errorMsg}</div>
              </div>
            )}

            {isLoginMode ? (
              <form onSubmit={handleCustomerLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email atau No. WhatsApp</label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com atau 0812xxxx"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/10"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3.5 bg-[#1f75b8] hover:bg-sky-600 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loadingAuth ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Masuk Akun</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCustomerRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1f75b8]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1f75b8]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">No. WhatsApp</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1f75b8]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jenis Kelamin</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRegGender('Laki-laki')}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border ${regGender === 'Laki-laki' ? 'bg-[#1f75b8] text-white border-[#1f75b8] shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    >
                      Laki-laki
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegGender('Perempuan')}
                      className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border ${regGender === 'Perempuan' ? 'bg-[#1f75b8] text-white border-[#1f75b8] shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                    >
                      Perempuan
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#1f75b8]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Konfirmasi Password</label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi password Anda"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#1f75b8]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full py-3.5 bg-[#1f75b8] hover:bg-sky-600 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {loadingAuth ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Daftar Akun Baru</span>
                  )}
                </button>
              </form>
            )}

            <div className="text-center text-xs text-gray-500 mt-2">
              {isLoginMode ? (
                <span>Belum punya akun? <button onClick={() => { setIsLoginMode(false); setErrorMsg(''); }} className="text-[#1f75b8] font-bold hover:underline">Daftar sekarang</button></span>
              ) : (
                <span>Sudah punya akun? <button onClick={() => { setIsLoginMode(true); setErrorMsg(''); }} className="text-[#1f75b8] font-bold hover:underline">Masuk di sini</button></span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Atau masuk dengan</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.5 6.69l3.766 3.075z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.34C15.01 16.27 13.58 16.91 12 16.91c-2.76 0-5.11-1.88-5.93-4.42l-3.76 2.93C4.1 19.82 7.72 23 12 23c3.25 0 6.13-1.07 8.11-2.91l-4.07-4.75z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43a5.54 5.54 0 0 1-2.39 3.62l4.07 4.75c2.38-2.19 3.38-5.4 3.38-8.52z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.07 12.49c-.21-.63-.33-1.3-.33-2 0-.7.12-1.37.33-2L2.31 5.41A11.93 11.93 0 0 0 1 10.49c0 1.77.39 3.46 1.08 5L6.07 12.49z"
                />
              </svg>
              <span className="text-sm">Masuk dengan Google</span>
            </button>
          </div>
        ) : (
          /* LOGGED IN USER INTERFACE */
          <>
            {/* Profile Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-[28px] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 flex flex-col items-center text-center relative overflow-hidden group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#1f75b8]/10 blur-3xl rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1f75b8] to-[#60a5fa] p-1 shadow-lg relative z-10">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-[3px] border-white overflow-hidden">
                     {profileImage ? (
                       <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-4xl font-bold text-[#1f75b8]">{userName?.charAt(0).toUpperCase()}</span>
                     )}
                   </div>
                </div>
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
              
              <h3 className="text-2xl font-bold text-gray-800 mb-1.5 z-10">{userName}</h3>
              <p className="text-gray-500 font-medium z-10 mb-3">{userEmail}</p>
              {userPhone && (
                <div className="bg-gray-100/80 px-4 py-1.5 rounded-full z-10">
                  <span className="text-sm font-semibold text-gray-600 tracking-wide">{userPhone}</span>
                </div>
              )}
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
              {t('logout') || 'Keluar Akun'}
            </button>
          </>
        )}

      </main>

      {/* ========== MODALS ========== */}

      {showSaveSuccess && <SuccessToast t={t} />}

      {/* 1. Informasi Akun Modal */}
      {activeModal === 'akun' && (
        <ModalWrapper title={t('menuAccount') || 'Informasi Akun'} onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-4">
            <FormInput label={t('fullName') || 'Nama Lengkap'} value={userName} onChange={setUserName} />
            <FormInput label="Email" value={userEmail} onChange={() => {}} type="email" placeholder="Email tidak dapat diubah" />
            <FormInput label="No. WhatsApp" value={userPhone} onChange={setUserPhone} type="tel" />
            
            <button 
              onClick={handleSaveProfile}
              className="mt-4 w-full bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
            >
              {t('saveChanges') || 'Simpan Perubahan'}
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* 3. Riwayat Transaksi Modal */}
      {activeModal === 'riwayat' && (
        <ModalWrapper title={t('menuHistory') || 'Riwayat Transaksi'} onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-4">
            {loadingTx ? (
              <div className="py-10 text-center text-gray-500 font-medium">Memuat riwayat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center text-gray-500 font-medium">Belum ada riwayat pemesanan tiket.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-sm md:text-base">{tx.route}</span>
                      <span className="text-xs text-gray-500">{tx.date} · {tx.operator}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      tx.status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                      tx.status === 'Menunggu' ? 'bg-blue-100 text-blue-700' : 
                      'bg-red-100 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200/60">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{t('seat') || 'Kursi'}</span>
                        <span className="text-sm font-bold text-gray-700">{tx.seats}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium uppercase">Kode Booking</span>
                        <span className="text-xs font-mono text-gray-500">{tx.id}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#1f75b8] text-base">{tx.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ModalWrapper>
      )}

      {/* 4. Pusat Bantuan Modal */}
      {activeModal === 'bantuan' && (
        <ModalWrapper title={t('menuHelp') || 'Pusat Bantuan'} onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-600 leading-relaxed">{t('helpDesc') || 'Ada kendala atau pertanyaan seputar tiket? Silakan hubungi admin operasional kami:'}</p>
            
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-gray-800 text-sm">{t('waAdmin') || 'WhatsApp Perwakilan'}</h4>
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
              <h4 className="font-bold text-gray-800 text-sm">{t('operationalHours') || 'Jam Operasional'}</h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('monSat') || 'Senin - Sabtu'}</span>
                <span className="font-semibold text-gray-700">07:00 - 21:00 WITA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('sunHol') || 'Minggu / Hari Libur'}</span>
                <span className="font-semibold text-gray-700">08:00 - 17:00 WITA</span>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}

      {/* 5. Pengaturan Modal */}
      {activeModal === 'pengaturan' && (
        <ModalWrapper title={t('menuSettings') || 'Pengaturan'} onClose={() => setActiveModal(null)}>
          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-gray-700 text-sm mb-1">{t('notifications') || 'Notifikasi'}</h4>

            <Toggle label={t('bookingStatus') || 'Status Pemesanan'} desc={t('bookingStatusDesc') || 'Notifikasi perubahan status tiket'} checked={notifBooking} onChange={setNotifBooking} />
            <Toggle label={t('departureReminder') || 'Pengingat Keberangkatan'} desc={t('departureReminderDesc') || 'Pengingat otomatis 2 jam sebelum keberangkatan'} checked={notifReminder} onChange={setNotifReminder} />
            
            <hr className="border-gray-100 my-3" />
            
            <h4 className="font-bold text-gray-700 text-sm mb-2">{t('language') || 'Bahasa'}</h4>
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
              onClick={() => {
                setShowSaveSuccess(true);
                setTimeout(() => {
                  setShowSaveSuccess(false);
                  setActiveModal(null);
                }, 1500);
              }}
              className="mt-6 w-full bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
            >
              {t('saveSettings') || 'Simpan Pengaturan'}
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
            <h3 className="font-bold text-xl text-gray-800 mb-2">{t('logoutConfirm') || 'Keluar Akun'}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('logoutDesc') || 'Apakah Anda yakin ingin keluar dari sesi saat ini?'}</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                {t('cancel') || 'Batal'}
              </button>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  setActiveModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                {t('yesLogout') || 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar Mobile Only */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-6 pb-2">
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">home</span>
          <span className="text-[11px] font-medium">{t('navHome') || 'Beranda'}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/tickets">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">confirmation_number</span>
          <span className="text-[11px] font-medium">{t('navTickets') || 'Tiketku'}</span>
        </Link>
        <Link className="flex flex-col items-center justify-center gap-1 bg-[#a3d1ff]/10 text-[#1f75b8] rounded-2xl px-5 py-2 hover:bg-[#a3d1ff]/20 active:scale-95 transition-all duration-300" href="/profile">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
          <span className="text-[11px] font-bold">{t('navProfile') || 'Profil'}</span>
        </Link>
      </nav>
    </>
  );
}
