"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Double check if admin
        checkAdminAccess(session.user.email);
      }
    });

    // Handle oauth errors or unauthorized redirect from layout
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setErrorMsg('Akses Ditolak: Email Anda tidak terdaftar sebagai Administrator PO Sinar Muda.');
    } else if (errorParam) {
      setErrorMsg(`Gagal login: ${errorParam}`);
    }
  }, [searchParams]);

  const checkAdminAccess = async (userEmail) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSuccessMsg('Login berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          router.replace('/admin');
        }, 1500);
      } else {
        // Not an admin
        await supabase.auth.signOut();
        setErrorMsg('Akses Ditolak: Email Anda tidak terdaftar sebagai Administrator PO Sinar Muda.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setErrorMsg('Gagal memverifikasi status admin Anda.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat login dengan Google.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Silakan masukkan email dan password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        await checkAdminAccess(data.session.user.email);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Email atau password salah.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-950 font-sans">
      {/* Animated Mesh Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-[#1f75b8]/30 blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-sky-500/20 blur-[120px] animate-pulse duration-[6s]" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse duration-[10s]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0 opacity-50" />

      {/* Card Wrapper */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-xl shadow-black/30 border border-slate-700">
            <img src="/logo/sinar-muda_logo.jpeg" alt="PO Sinar Muda Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-white tracking-wide leading-tight">PO SINAR MUDA</h1>
            <p className="text-xs text-sky-400 font-bold tracking-widest uppercase mt-1">Panel Kontrol Admin</p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {errorMsg && (
          <div className="p-4 bg-red-950/50 border border-red-500/30 rounded-2xl flex gap-3 text-red-300 text-xs items-start leading-relaxed animate-in slide-in-from-top-2 duration-300">
            <span className="material-symbols-outlined text-red-400 shrink-0 text-[18px]">error</span>
            <div>{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-green-950/50 border border-green-500/30 rounded-2xl flex gap-3 text-green-300 text-xs items-start leading-relaxed animate-in slide-in-from-top-2 duration-300">
            <span className="material-symbols-outlined text-green-400 shrink-0 text-[18px]">check_circle</span>
            <div>{successMsg}</div>
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
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
          )}
          <span className="text-sm">Masuk dengan Google</span>
        </button>

        {/* Separator */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-800" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Atau dengan Email</span>
          <div className="flex-1 h-[1px] bg-slate-800" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">mail</span>
              <input
                type="email"
                placeholder="admin@sinarmuda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-[#1f75b8] text-white rounded-2xl text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">lock</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-11 pr-12 py-3 bg-slate-950 border border-slate-800 focus:border-[#1f75b8] text-white rounded-2xl text-sm transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1f75b8] hover:bg-sky-600 active:scale-[0.98] text-white font-bold rounded-2xl text-sm transition-all duration-300 mt-2 shadow-lg shadow-sky-950/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Masuk Admin</span>
            )}
          </button>
        </form>

        {/* Database setup notice for developers */}
        <div className="mt-2 p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl flex gap-3 text-slate-400 text-[10px] items-start leading-relaxed">
          <span className="material-symbols-outlined text-sky-400 shrink-0 text-[16px]">info</span>
          <div>
            <strong className="text-slate-300">Catatan Pengembang:</strong> Pastikan Anda telah memasukkan email Anda ke dalam tabel <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">public.admins</code> di database Supabase agar dapat login.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
