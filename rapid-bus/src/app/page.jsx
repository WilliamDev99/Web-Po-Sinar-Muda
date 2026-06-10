"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import HeaderDropdown from '@/components/HeaderDropdown';

export default function Home() {
  const { t } = useLanguage();
  const [from, setFrom] = useState('Makassar');
  const [to, setTo] = useState('Toraja');
  const [isSwapping, setIsSwapping] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [typedText, setTypedText] = useState("");
  const fullText = t('heroQuestion');

  const posters = [
    "/poster/Screenshot 2026-05-31 204637.png",
    "/poster/Screenshot 2026-05-31 205312.png",
    "/poster/Screenshot 2026-05-31 205443.png",
    "/poster/Screenshot 2026-05-31 205457.png"
  ];
  const [currentPoster, setCurrentPoster] = useState(0);

  // State untuk dukungan geser (swipe)
  const [dragStartX, setDragStartX] = useState(null);

  const handleDragStart = (e) => {
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    setDragStartX(clientX);
  };

  const handleDragMove = (e) => {
    if (dragStartX === null) return;
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diff = dragStartX - clientX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setCurrentPoster((prev) => (prev + 1) % posters.length);
      } else {
        setCurrentPoster((prev) => (prev === 0 ? posters.length - 1 : prev - 1));
      }
      setDragStartX(null); // Reset
    }
  };

  const handleDragEnd = () => {
    setDragStartX(null);
  };

  // Auto slide poster setiap 4 detik
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentPoster((prev) => (prev + 1) % posters.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    let i = 0;
    let isDeleting = false;
    let timeoutId;
    // ensure text uses updated translation
    const currentFullText = fullText;

    const type = () => {
      if (!isDeleting) {
        if (i < currentFullText.length) {
          setTypedText(currentFullText.substring(0, i + 1));
          i++;
          timeoutId = setTimeout(type, 80); // kecepatan mengetik
        } else {
          isDeleting = true;
          timeoutId = setTimeout(type, 3000); // jeda setelah selesai mengetik (3 detik)
        }
      } else {
        if (i > 0) {
          setTypedText(currentFullText.substring(0, i - 1));
          i--;
          timeoutId = setTimeout(type, 40); // kecepatan menghapus (lebih cepat)
        } else {
          isDeleting = false;
          timeoutId = setTimeout(type, 1000); // jeda sebelum mulai mengetik lagi (1 detik)
        }
      }
    };

    timeoutId = setTimeout(type, 500); // jeda awal sebelum animasi mulai

    return () => clearTimeout(timeoutId);
  }, [fullText]);

  const handleSwap = () => {
    setRotation(prev => prev + 180);
    setIsSwapping(true);
    setTimeout(() => {
      const temp = from;
      setFrom(to);
      setTo(temp);
      setIsSwapping(false);
    }, 300); // Matched with transition duration
  };

  return (
    <>
      {/* Top App Bar with Glassmorphism */}
      <header className="fixed top-0 w-full z-50 bg-[#a3d1ff]/85 backdrop-blur-md border-b border-white/10 shadow-sm flex items-center px-4 md:px-10 h-24 transition-all justify-between">
        
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 md:gap-4 group">
          <div className="w-11 h-11 md:w-14 md:h-14 bg-white rounded-[14px] md:rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all overflow-hidden border-2 border-white/60">
            <img src="/logo/sinar-muda_logo.jpeg" alt="Bus Icon" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[#1f75b8] text-xl md:text-[26px] tracking-wide leading-none drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>PO SINAR MUDA</span>
            <span className="font-bold text-[#1f75b8]/90 text-[9px] md:text-[11px] tracking-[0.28em] mt-1 drop-shadow-sm">TRANSPORTATION</span>
          </div>
        </a>


        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
            {t('navHome')}
          </a>
          <Link href="/tickets" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            {t('navTickets')}
          </Link>
          <Link href="/profile" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
            {t('navProfile')}
          </Link>
        </nav>
        
        {/* Dropdown Menu (Visible on all sizes) */}
        <div className="md:hidden ml-auto"></div>
        <HeaderDropdown />
      </header>
      
      {/* Subtle Background Glow behind main content */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[500px] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] pointer-events-none blur-3xl"></div>

      <main className="pt-28 md:pt-36 px-4 md:px-10 max-w-lg md:max-w-5xl lg:max-w-[1400px] mx-auto relative z-10 pb-28 md:pb-10">
        {/* flex-col-reverse akan membuat kolom pertama (poster) berada di bawah kolom kedua (konten utama) pada tampilan mobile */}
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-12 xl:gap-16 items-start">
          
          {/* Bagian Kiri: Poster Slider (Muncul di Mobile dan Desktop) */}
          <div className="w-full lg:w-[55%] xl:w-[50%] flex-shrink-0 sticky top-36 lg:-translate-x-6 xl:-translate-x-8">
            <div 
              className="relative w-full aspect-[4/5] group perspective-[1000px] z-20 cursor-grab active:cursor-grabbing"
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
               
               {posters.map((poster, index) => {
                  const diff = (index - currentPoster + posters.length) % posters.length;
                  // Jika diff adalah elemen terakhir, asumsikan itu baru saja dilewati (animasi keluar)
                  const isPassed = diff === posters.length - 1 && posters.length > 2;

                  let zIndex = 30 - diff;
                  // Menggunakan persentase agar responsif di HP maupun Desktop tanpa terpotong
                  let transform = `translate(${diff * 6}%, ${diff * 6}%) rotate(${diff * 3}deg) scale(${1 - diff * 0.05})`;
                  let opacity = 1 - diff * 0.15;

                  if (isPassed) {
                      zIndex = 40;
                      transform = `translate(-110%, -10%) rotate(-10deg) scale(1.05)`;
                      opacity = 0;
                  }

                  return (
                      <div 
                        key={index}
                        className="absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 bg-white/20 backdrop-blur-md p-2"
                        style={{
                            zIndex,
                            transform,
                            opacity,
                            transformOrigin: "top left"
                        }}
                      >
                        <img 
                          src={poster}
                          alt={`Poster promosi ${index + 1}`} 
                          className="w-full h-full object-cover rounded-[16px] bg-[#89bede]/20" 
                        />
                      </div>
                  );
               })}

               {/* Indikator Titik (Dots) */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                 {posters.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => setCurrentPoster(idx)}
                     className={`transition-all duration-300 rounded-full ${currentPoster === idx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                   />
                 ))}
               </div>

               {/* Navigasi Kiri & Kanan */}
               <button 
                 onClick={() => setCurrentPoster((prev) => (prev === 0 ? posters.length - 1 : prev - 1))}
                 className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
               >
                 <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
               </button>
               <button 
                 onClick={() => setCurrentPoster((prev) => (prev + 1) % posters.length)}
                 className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
               >
                 <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
               </button>

            </div>
          </div>

          {/* Bagian Kanan: Konten Utama */}
          <div className="flex-1 w-full flex flex-col">
        {/* Hero Section / Title */}
        <div className="mb-8 mt-2 text-center md:text-left min-h-[100px]">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 drop-shadow-sm leading-tight min-h-[80px] md:min-h-[60px] lg:min-h-[72px]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">{typedText}</span>
            <span className="animate-pulse text-white font-light ml-1 relative -top-1">|</span>
          </h2>
          <p className="text-white/80 font-medium text-sm md:text-lg">{t('heroSubtitle')}</p>
        </div>
        
        {/* Search Card with Premium Shadow and rounded corners */}
        <div className="clay-card p-5 md:p-8 relative overflow-visible">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 relative w-full items-end">
            
            {/* Route Picker Area (Full width di atas) */}
            <div className="md:col-span-2 flex flex-col md:flex-row gap-3 md:gap-6 relative">
              {/* Swap Button */}
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 md:right-auto md:left-1/2 md:-translate-x-1/2 z-10 clay-btn p-2.5 text-[#1f75b8] active:scale-95 transition-all" 
                onClick={handleSwap}
              >
                <div className="md:-rotate-90 flex items-center justify-center">
                  <span 
                    className="material-symbols-outlined font-bold block"
                    style={{ 
                      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transform: `rotate(${rotation}deg)` 
                    }}
                  >
                    sync
                  </span>
                </div>
              </button>
              
              {/* From Field */}
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 ml-1 tracking-wide uppercase">{t('fromCity')}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1f75b8] transition-colors">location_on</span>
                  <input 
                    className="clay-input w-full pl-11 pr-14 md:pr-14 py-3.5 md:py-4 text-gray-800 font-medium md:text-base outline-none" 
                    placeholder={t('phFromCity')} 
                    type="text" 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Vertical Line Connector (Mobile Only) */}
              <div className="ml-7 h-3 w-[2px] bg-gray-200 border-dashed relative z-0 md:hidden"></div>
              
              {/* To Field */}
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 ml-1 tracking-wide uppercase md:invisible">{t('toCity')}</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1f75b8] transition-colors">near_me</span>
                  <input 
                    className="clay-input w-full pl-11 pr-14 md:pr-14 py-3.5 md:py-4 text-gray-800 font-medium md:text-base outline-none" 
                    placeholder={t('phToCity')} 
                    type="text" 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Date Picker (Kiri Bawah) */}
            <div className="flex flex-col w-full mt-2 md:mt-0">
              <label className="text-xs font-semibold text-gray-500 mb-1.5 ml-1 tracking-wide uppercase">{t('date')}</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1f75b8] transition-colors text-[20px]">calendar_today</span>
                <input 
                  className="date-picker-input clay-input w-full pl-9 pr-1 py-3.5 md:py-4 text-gray-800 font-medium text-[13px] md:text-[15px] cursor-pointer outline-none" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* Search Button (Kanan Bawah) */}
            <div className="w-full">
              <Link href={`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`} className="clay-primary w-full mt-6 md:mt-0 font-semibold text-lg md:text-base py-4 md:py-4 md:px-8 flex justify-center items-center gap-2 text-center h-[52px] md:h-[58px] text-white">
                {t('search')}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
            </div>

          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-12 md:mt-16">
          {/* Recent Searches Section */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="font-semibold text-lg md:text-xl text-white">{t('recentSearches')}</h3>
              <button className="text-white/80 hover:text-white font-medium text-xs uppercase tracking-wider transition-colors">{t('clearAll')}</button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {/* Recent Search Card */}
              <div className="group flex items-center gap-4 p-4 md:p-5 clay-feature cursor-pointer">
                <div className="w-11 h-11 md:w-12 md:h-12 rounded-full clay-icon bg-white flex items-center justify-center text-[#1f75b8] group-hover:scale-110 group-hover:bg-[#a3d1ff] group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-base md:text-lg">Makassar → Toraja</p>
                  <p className="text-gray-500 text-xs md:text-sm font-medium mt-0.5">{t('today1Passenger')}</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-[#1f75b8] group-hover:translate-x-1 transition-all duration-300">chevron_right</span>
              </div>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div>
            <h3 className="font-semibold text-lg md:text-xl text-white mb-4">{t('followUs')}</h3>
            <div className="flex flex-col gap-3">
              <a href="https://www.instagram.com/po_sinarmuda.id?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="clay-feature p-4 flex items-center gap-4 group cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                  {/* Instagram Icon */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-pink-500" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 md:text-lg leading-tight">Instagram</p>
                  <p className="text-xs text-gray-500 mt-0.5">@po_sinarmuda.id</p>
                </div>
              </a>
              <a href="https://www.tiktok.com/@po.sinar_muda?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="clay-feature p-4 flex items-center gap-4 group cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  {/* TikTok Icon */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-800" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 md:text-lg leading-tight">TikTok</p>
                  <p className="text-xs text-gray-500 mt-0.5">@po.sinar_muda</p>
                </div>
              </a>
              <a href="https://www.facebook.com/share/17mau4fE4q/" target="_blank" rel="noopener noreferrer" className="clay-feature p-4 flex items-center gap-4 group cursor-pointer hover:-translate-y-1 transition-transform">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  {/* Facebook Icon */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900 md:text-lg leading-tight">Facebook</p>
                  <p className="text-xs text-gray-500 mt-0.5">PO Sinar Muda Official</p>
                </div>
              </a>
            </div>
          </div>
        </div>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation Bar with Glassmorphism (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-6 pb-2">
        {/* Home (Active) */}
        <a className="flex flex-col items-center justify-center gap-1 bg-[#a3d1ff]/10 text-[#1f75b8] rounded-2xl px-5 py-2 hover:bg-[#a3d1ff]/20 active:scale-95 transition-all duration-300" href="#">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
          <span className="text-[11px] font-bold">{t('navHome')}</span>
        </a>
        {/* My Bookings */}
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/tickets">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">confirmation_number</span>
          <span className="text-[11px] font-medium">{t('navTickets')}</span>
        </Link>
        {/* Profile */}
        <Link className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300" href="/profile">
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">person</span>
          <span className="text-[11px] font-medium">{t('navProfile')}</span>
        </Link>
      </nav>
    </>
  );
}
