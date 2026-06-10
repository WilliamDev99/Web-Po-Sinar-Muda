"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminPelangganPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true);
      // Ambil data pemesanan yang sukses untuk mendapatkan data pelanggan
      const { data, error } = await supabase
        .from('pemesanan')
        .select('nama_pelanggan, email_pelanggan, telepon_pelanggan, total_harga, created_at')
        .in('status', ['Lunas', 'Menunggu']);

      if (data) {
        // Kelompokkan pelanggan berdasarkan nomor telepon atau email agar tidak ganda
        const customerMap = {};

        data.forEach(booking => {
          // Gunakan telepon sebagai kunci unik (jika tidak ada, gunakan nama)
          const key = booking.telepon_pelanggan || booking.nama_pelanggan;
          
          if (!customerMap[key]) {
            customerMap[key] = {
              name: booking.nama_pelanggan,
              email: booking.email_pelanggan || '-',
              phone: booking.telepon_pelanggan || '-',
              totalBookings: 1,
              totalSpent: Number(booking.total_harga),
              lastOrder: new Date(booking.created_at)
            };
          } else {
            customerMap[key].totalBookings += 1;
            customerMap[key].totalSpent += Number(booking.total_harga);
            
            const currentOrderDate = new Date(booking.created_at);
            if (currentOrderDate > customerMap[key].lastOrder) {
              customerMap[key].lastOrder = currentOrderDate;
            }
          }
        });

        // Convert object map ke array
        const customerArray = Object.values(customerMap).sort((a, b) => b.lastOrder - a.lastOrder);
        setCustomers(customerArray);
      }
      setIsLoading(false);
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Pelanggan</h2>
          <p className="text-sm text-gray-500">Kumpulan data kontak pelanggan yang pernah bertransaksi</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Cari nama, email, atau telepon..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#1f75b8] focus:ring-2 focus:ring-[#1f75b8]/20 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Pelanggan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kontak (Telepon & Email)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Total Transaksi</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Belanja</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Pesanan Terakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                    {searchTerm ? "Tidak ada pelanggan yang cocok dengan pencarian." : "Belum ada data pelanggan di database."}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1f75b8] flex items-center justify-center font-bold text-sm uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-gray-400">call</span>
                          {customer.phone}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-gray-400">mail</span>
                          {customer.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-[#1f75b8] font-bold text-sm">
                        {customer.totalBookings}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-800">
                        Rp {customer.totalSpent.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-500">
                        {customer.lastOrder.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
