"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

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
              {t('terms')}
            </h3>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-2xl p-6 bg-white shadow-sm md:my-4 md:rounded-2xl border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">Syarat dan Ketentuan</h1>
        
        <div className="prose text-gray-600 text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">1. Ketentuan Pemesanan</h2>
            <p>
              Tiket yang telah dipesan dan dibayar tidak dapat dibatalkan atau diuangkan kembali (non-refundable), kecuali atas kebijakan khusus dari manajemen PO Sinar Muda dalam keadaan tertentu (Force Majeure).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">2. Ketentuan Bagasi</h2>
            <p>
              Setiap penumpang berhak atas kapasitas bagasi gratis maksimum 20kg. Kelebihan bagasi akan dikenakan biaya tambahan sesuai dengan tarif yang berlaku dan ketersediaan ruang di bagasi bus.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">3. Kedatangan dan Keberangkatan</h2>
            <p>
              Penumpang diwajibkan untuk hadir di titik keberangkatan minimal 30 menit sebelum jadwal keberangkatan yang tertera pada tiket. Bus berhak berangkat sesuai jadwal tanpa menunggu penumpang yang terlambat.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
