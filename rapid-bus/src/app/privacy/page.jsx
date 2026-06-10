"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
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
              {t('privacyPolicy')}
            </h3>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-2xl p-6 bg-white shadow-sm md:my-4 md:rounded-2xl border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">Kebijakan Privasi</h1>
        
        <div className="prose text-gray-600 text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">1. Pengumpulan Data Pribadi</h2>
            <p>
              Saat Anda menggunakan aplikasi PO Sinar Muda untuk memesan tiket, kami akan mengumpulkan informasi dasar seperti Nama Lengkap, Nomor Telepon/WhatsApp, dan Alamat Email Anda. Kami juga dapat mengumpulkan informasi perjalanan seperti kota keberangkatan dan tujuan, serta tanggal perjalanan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">2. Penggunaan Informasi</h2>
            <p>
              Data pribadi yang Anda berikan akan digunakan murni untuk keperluan pemesanan tiket, konfirmasi pembayaran, pengiriman e-tiket, serta pemberitahuan penting terkait jadwal keberangkatan bus. Kami juga dapat menggunakan kontak Anda untuk membantu proses customer service jika terjadi kendala.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">3. Keamanan Data</h2>
            <p>
              Kami sangat menghargai privasi Anda. PO Sinar Muda mengimplementasikan sistem keamanan yang ketat untuk mencegah akses tanpa izin, perubahan, atau kebocoran data. Data Anda tidak akan pernah dijual atau disebarkan kepada pihak ketiga untuk kepentingan komersial tanpa persetujuan Anda.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-2">4. Hak Pengguna</h2>
            <p>
              Anda berhak untuk meminta pembaruan atau penghapusan data pribadi Anda yang tersimpan di sistem kami kapan saja dengan cara menghubungi pusat layanan pelanggan kami melalui menu Contact.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
