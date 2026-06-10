"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminLaporanPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    totalBookings: 0,
    totalCustomers: 0
  });
  
  const [routeStats, setRouteStats] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true);
      
      const { data: allBookings, error } = await supabase
        .from('pemesanan')
        .select(`
          total_harga,
          nomor_kursi,
          email_pelanggan,
          telepon_pelanggan,
          created_at,
          status,
          kode_booking,
          nama_pelanggan,
          jadwal!inner (
            tanggal_berangkat,
            rute!inner (kota_asal, kota_tujuan)
          )
        `)
        .in('status', ['Lunas', 'Menunggu']);

      if (allBookings && !error) {
        let rev = 0;
        let tix = 0;
        let uniqueContacts = new Set();
        let rStats = {};

        allBookings.forEach(b => {
          rev += Number(b.total_harga);
          tix += b.nomor_kursi?.length || 0;
          
          if (b.email_pelanggan) uniqueContacts.add(b.email_pelanggan);
          else if (b.telepon_pelanggan) uniqueContacts.add(b.telepon_pelanggan);

          const routeName = `${b.jadwal.rute.kota_asal} - ${b.jadwal.rute.kota_tujuan}`;
          if (!rStats[routeName]) {
            rStats[routeName] = { name: routeName, tickets: 0, revenue: 0 };
          }
          rStats[routeName].tickets += b.nomor_kursi?.length || 0;
          rStats[routeName].revenue += Number(b.total_harga);
        });

        setSummary({
          totalRevenue: rev,
          totalTickets: tix,
          totalBookings: allBookings.length,
          totalCustomers: uniqueContacts.size
        });

        const sortedRoutes = Object.values(rStats).sort((a, b) => b.revenue - a.revenue);
        setRouteStats(sortedRoutes);
        
        // Sorting recent bookings for table
        const sortedBookings = [...allBookings].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
        setRecentBookings(sortedBookings);
      }
      
      setIsLoading(false);
    }
    
    fetchReportData();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Header Laporan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:shadow-none print:border-none print:p-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#1f75b8] hidden md:flex">
            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan & Penjualan</h2>
            <p className="text-sm text-gray-500">Ringkasan performa penjualan tiket secara keseluruhan</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="px-6 py-2.5 bg-[#1f75b8] text-white font-bold rounded-xl hover:bg-sky-600 transition-colors text-sm shadow-md flex items-center justify-center gap-2 print:hidden"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Cetak Dokumen
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-8 h-8 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Menyusun laporan data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-[#1f75b8] to-blue-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <span className="text-blue-100 text-sm font-medium mb-1 block">Total Pendapatan</span>
              <span className="text-2xl lg:text-3xl font-bold">Rp {summary.totalRevenue.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] text-gray-50 group-hover:scale-110 transition-transform pointer-events-none">confirmation_number</span>
              <span className="text-gray-500 text-sm font-medium mb-1 block">Total Tiket Terjual</span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-800">{summary.totalTickets} <span className="text-sm font-medium text-gray-400">kursi</span></span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] text-gray-50 group-hover:scale-110 transition-transform pointer-events-none">receipt_long</span>
              <span className="text-gray-500 text-sm font-medium mb-1 block">Total Transaksi</span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-800">{summary.totalBookings} <span className="text-sm font-medium text-gray-400">pesanan</span></span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[80px] text-gray-50 group-hover:scale-110 transition-transform pointer-events-none">group</span>
              <span className="text-gray-500 text-sm font-medium mb-1 block">Total Pelanggan</span>
              <span className="text-2xl lg:text-3xl font-bold text-gray-800">{summary.totalCustomers} <span className="text-sm font-medium text-gray-400">orang</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Laporan Per Rute */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Pendapatan Berdasarkan Rute</h3>
              <div className="flex-1 flex flex-col gap-5">
                {routeStats.length === 0 ? (
                  <p className="text-gray-500 text-sm italic text-center py-10">Belum ada data pendapatan rute.</p>
                ) : (
                  routeStats.map((rute, idx) => {
                    const maxRev = routeStats[0].revenue;
                    const percentage = Math.min((rute.revenue / (maxRev || 1)) * 100, 100);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-800">{rute.name}</span>
                            <span className="text-xs text-gray-500">{rute.tickets} Tiket Terjual</span>
                          </div>
                          <span className="text-sm font-bold text-[#1f75b8]">Rp {rute.revenue.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#1f75b8] h-full rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Riwayat Transaksi Terakhir */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-0 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">50 Transaksi Terakhir</h3>
              </div>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm z-10">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tgl & Waktu</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-5 py-8 text-center text-sm text-gray-500">Belum ada transaksi.</td>
                      </tr>
                    ) : (
                      recentBookings.map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="text-sm text-gray-800 font-medium">{new Date(b.created_at).toLocaleDateString('id-ID')}</span>
                            <span className="block text-xs text-gray-400">{new Date(b.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-800">{b.nama_pelanggan}</span>
                            <span className="block text-xs text-gray-500 font-mono">{b.kode_booking}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-green-600">Rp {Number(b.total_harga).toLocaleString('id-ID')}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Style khusus saat diprint */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white !important; }
          .material-symbols-outlined { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .shadow-sm, .shadow-md { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
          nav, aside, header { display: none !important; }
          ::-webkit-scrollbar { display: none; }
        }
      `}} />
    </div>
  );
}
