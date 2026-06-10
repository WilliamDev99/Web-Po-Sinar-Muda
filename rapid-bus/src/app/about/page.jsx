"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
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
              {t('aboutUs')}
            </h3>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-2xl p-6 bg-white shadow-sm md:my-4 md:rounded-2xl border border-gray-100">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
            <img src="/logo/sinar-muda_logo.jpeg" alt="Logo PO Sinar Muda" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-[#1f75b8] mb-6">PO SINAR MUDA</h1>
        
        <div className="prose text-gray-600 text-sm leading-relaxed space-y-4">
          <p>
            <strong>PO Sinar Muda</strong> adalah perusahaan otobus (PO) terkemuka yang melayani perjalanan antar kota dengan fokus pada rute-rute strategis di Sulawesi Selatan. Berkomitmen untuk memberikan layanan transportasi darat terbaik, kami memprioritaskan kenyamanan, keamanan, dan ketepatan waktu bagi setiap penumpang.
          </p>
          <p>
            Dengan armada bus modern dan fasilitas eksekutif, PO Sinar Muda menghadirkan pengalaman perjalanan yang tak terlupakan. Mulai dari Kelas Bisnis, Kelas Gubernur, hingga Kelas President, setiap bus kami dilengkapi dengan kursi yang nyaman, pendingin udara, dan berbagai fasilitas premium untuk menunjang perjalanan panjang Anda.
          </p>
          <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">Visi & Misi</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menjadi pelopor transportasi darat yang inovatif dan terpercaya.</li>
            <li>Memberikan pelayanan dengan standar keamanan dan kenyamanan yang tinggi.</li>
            <li>Memudahkan masyarakat dalam mengakses mobilitas antar kota yang terjangkau.</li>
          </ul>
          <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">Mengapa Memilih Kami?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Sistem Pemesanan Mudah:</strong> Pesan tiket kapan saja melalui website kami tanpa perlu antre panjang.</li>
            <li><strong>Layanan Tepat Waktu:</strong> Kedisiplinan jadwal adalah komitmen utama kami.</li>
            <li><strong>Kru Berpengalaman:</strong> Setiap perjalanan Anda akan didampingi oleh supir dan kru profesional yang ramah dan handal.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
