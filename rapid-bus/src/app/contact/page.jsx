"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  const admins = [
    { name: "Admin Makassar", phone: "081241527132" },
    { name: "Admin Makassar 2", phone: "0811417132" },
    { name: "Admin Masamba", phone: "082317588758" },
    { name: "Admin Rantepao", phone: "081241526706" },
    { name: "Admin Makale", phone: "085255513033" },
    { name: "Admin Malili", phone: "081241527123" },
    { name: "Admin Wawondula", phone: "081341747609" },
    { name: "Admin Sorowako", phone: "082196734188" },
    { name: "Admin Sorowako 2", phone: "0811458551" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white z-10 border-b border-gray-100 shadow-sm sticky top-0 md:max-w-2xl mx-auto h-[72px]">
        <div className="flex justify-between items-center px-4 h-full">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
            >
              <span className="material-symbols-outlined text-[24px] text-gray-700">
                arrow_back
              </span>
            </Link>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {t('contactAdmin')}
            </h3>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-2xl p-4 md:p-6 mb-10">
        <div className="bg-[#1f75b8] rounded-2xl p-6 text-white shadow-md mb-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-[#a3d1ff]/20 rounded-full blur-xl"></div>
          
          <h1 className="text-2xl font-black mb-2 relative z-10">Hubungi Kami</h1>
          <p className="text-white/90 text-sm font-medium relative z-10">
            Pilih nomor admin sesuai dengan kota keberangkatan atau tujuan Anda untuk pelayanan yang lebih cepat.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map((admin, idx) => {
            // Format for wa.me link (replace 0 with 62)
            const waNumber = admin.phone.startsWith('0') ? `62${admin.phone.substring(1)}` : admin.phone;
            
            return (
              <a
                key={idx}
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1f75b8]/30 transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">chat</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 text-sm md:text-base">{admin.name}</span>
                    <span className="text-xs md:text-sm text-gray-500 font-mono mt-0.5">{admin.phone}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#1f75b8] group-hover:translate-x-1 transition-all">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
