"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  // State for Bookings & Stats
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Total Penjualan Hari Ini', value: 'Rp 0', icon: 'payments', color: 'bg-green-500', trend: '', isUp: null },
    { title: 'Total Tiket Terjual (Bulan Ini)', value: '0', icon: 'confirmation_number', color: 'bg-[#1f75b8]', trend: '', isUp: null },
    { title: 'Armada Beroperasi Hari Ini', value: '0', icon: 'directions_bus', color: 'bg-orange-500', trend: '', isUp: null },
    { title: 'Pelanggan Baru (Bulan Ini)', value: '0', icon: 'person_add', color: 'bg-purple-500', trend: '', isUp: null },
  ]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    async function fetchBookings() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pemesanan')
        .select(`
          id,
          kode_booking,
          nama_pelanggan,
          nomor_kursi,
          total_harga,
          status,
          created_at,
          jadwal!inner (
            tanggal_berangkat,
            rute!inner (kota_asal, kota_tujuan)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const formatted = data.map(b => ({
          id: b.kode_booking,
          name: b.nama_pelanggan,
          route: `${b.jadwal.rute.kota_asal} → ${b.jadwal.rute.kota_tujuan}`,
          date: b.jadwal.tanggal_berangkat,
          seats: b.nomor_kursi.join(', '),
          price: `Rp ${Number(b.total_harga).toLocaleString('id-ID')}`,
          status: b.status
        }));
        setRecentBookings(formatted);
      }

      // Fetch ALL valid bookings for stats
      const { data: allBookings } = await supabase
        .from('pemesanan')
        .select(`
          total_harga,
          nomor_kursi,
          email_pelanggan,
          created_at,
          jadwal!inner (
            tanggal_berangkat,
            rute!inner (kota_asal, kota_tujuan)
          )
        `)
        .in('status', ['Lunas', 'Menunggu']);

      if (allBookings) {
        const today = new Date();
        // Reset time to start of day for comparison
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let todaySales = 0;
        let monthTickets = 0;
        let uniqueEmails = new Set();
        let routesCount = {};

        allBookings.forEach(b => {
          const createdAt = new Date(b.created_at);
          if (createdAt >= startOfDay) {
            todaySales += Number(b.total_harga);
          }
          if (createdAt >= startOfMonth) {
            monthTickets += b.nomor_kursi?.length || 0;
            if (b.email_pelanggan) uniqueEmails.add(b.email_pelanggan);
            
            const routeStr = `${b.jadwal.rute.kota_asal} - ${b.jadwal.rute.kota_tujuan}`;
            routesCount[routeStr] = (routesCount[routeStr] || 0) + (b.nomor_kursi?.length || 0);
          }
        });

        // Get armada operating today
        const todayStr = today.toISOString().split('T')[0];
        const { data: jadwalHariIni } = await supabase
          .from('jadwal')
          .select('armada_id')
          .eq('tanggal_berangkat', todayStr);
        const armadaOperating = jadwalHariIni ? new Set(jadwalHariIni.map(j => j.armada_id)).size : 0;

        setStats([
          { title: 'Total Penjualan Hari Ini', value: `Rp ${todaySales.toLocaleString('id-ID')}`, icon: 'payments', color: 'bg-green-500', trend: '', isUp: null },
          { title: 'Total Tiket Terjual (Bulan Ini)', value: monthTickets.toString(), icon: 'confirmation_number', color: 'bg-[#1f75b8]', trend: '', isUp: null },
          { title: 'Armada Beroperasi Hari Ini', value: armadaOperating.toString(), icon: 'directions_bus', color: 'bg-orange-500', trend: '', isUp: null },
          { title: 'Pelanggan Baru (Bulan Ini)', value: uniqueEmails.size.toString(), icon: 'person_add', color: 'bg-purple-500', trend: '', isUp: null },
        ]);

        const sortedRoutes = Object.entries(routesCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([route, count]) => ({
            route,
            count,
            percentage: Math.min((count / (monthTickets || 1)) * 100, 100)
          }));
        setPopularRoutes(sortedRoutes);
      }

      setIsLoading(false);
    }
    fetchBookings();
  }, []);


  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      {/* Page Title (Mobile Only) */}
      <div className="md:hidden">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Ringkasan hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            {/* Background Icon Watermark */}
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] text-gray-50 group-hover:scale-110 group-hover:text-gray-100 transition-all pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
              {stat.icon}
            </span>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">{stat.title}</span>
                <span className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{stat.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 relative z-10">
              {stat.isUp !== null && (
                <span className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {stat.isUp ? 'trending_up' : 'trending_down'}
                  </span>
                  {stat.trend}
                </span>
              )}
              {stat.isUp === null && (
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              )}
              {stat.isUp !== null && <span className="text-xs text-gray-400 font-medium">dibanding bulan lalu</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bookings Table Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Pemesanan Terbaru</h3>
            <button className="text-sm font-semibold text-[#1f75b8] hover:underline">Lihat Semua</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Booking</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rute & Tanggal</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-[#1f75b8] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Memuat data pemesanan...
                    </td>
                  </tr>
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">
                      Belum ada pemesanan tiket.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-bold text-gray-800">{booking.id}</div>
                        <div className="text-xs text-gray-500 mt-1">{booking.seats} ({booking.price})</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-800 font-medium">{booking.route}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          {booking.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                          ${booking.status === 'Lunas' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 
                            'bg-red-100 text-red-700'}
                        `}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedBooking(booking)}
                          className="text-[#1f75b8] hover:text-[#165a8e] bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Popular Routes */}
        <div className="flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-[#1f75b8] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button onClick={() => router.push('/admin/jadwal/create')} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10">
                <span className="material-symbols-outlined">add_circle</span>
                <span className="text-xs font-semibold">Buat Jadwal</span>
              </button>
              <button onClick={() => router.push('/admin/armada')} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10">
                <span className="material-symbols-outlined">directions_bus</span>
                <span className="text-xs font-semibold">Cek Armada</span>
              </button>
              <button onClick={() => window.print()} className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10">
                <span className="material-symbols-outlined">print</span>
                <span className="text-xs font-semibold">Cetak Laporan</span>
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10">
                <span className="material-symbols-outlined">support_agent</span>
                <span className="text-xs font-semibold">Pusat Bantuan</span>
              </button>
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Rute Terpopuler (Bulan Ini)</h3>
            <div className="space-y-4">
              {popularRoutes.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data perjalanan bulan ini.</p>
              ) : (
                popularRoutes.map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-gray-800">{item.route}</span>
                      <span className="text-gray-500">{item.count} tiket</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#1f75b8] h-2 rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="w-full mt-5 py-2.5 bg-gray-50 text-[#1f75b8] text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Lihat Detail Laporan
            </button>
          </div>
        </div>
        
      </div>

      {/* Modal Detail Pemesanan */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1f75b8]">confirmation_number</span>
                Detail Tiket
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Kode Booking</span>
                <span className="font-mono text-lg font-bold text-gray-900">{selectedBooking.id}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</span>
                <span className={`w-fit px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                  ${selectedBooking.status === 'Lunas' ? 'bg-green-100 text-green-700' : 
                    selectedBooking.status === 'Menunggu' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'}
                `}>
                  {selectedBooking.status}
                </span>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#1f75b8] mt-0.5 text-[20px]">route</span>
                  <div>
                    <span className="block text-xs text-gray-500 font-medium">Rute Perjalanan</span>
                    <span className="block text-sm font-bold text-gray-800">{selectedBooking.route}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#1f75b8] mt-0.5 text-[20px]">event</span>
                  <div>
                    <span className="block text-xs text-gray-500 font-medium">Tanggal</span>
                    <span className="block text-sm font-bold text-gray-800">{selectedBooking.date}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#1f75b8] mt-0.5 text-[20px]">airline_seat_recline_extra</span>
                  <div>
                    <span className="block text-xs text-gray-500 font-medium">Nomor Kursi</span>
                    <span className="block text-sm font-bold text-gray-800">{selectedBooking.seats}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-gray-500 font-medium text-sm">Total Pembayaran</span>
                <span className="text-xl font-bold text-[#1f75b8]">{selectedBooking.price}</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setSelectedBooking(null)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Tutup
              </button>
              <button className="flex-1 py-2.5 bg-[#1f75b8] text-white font-bold rounded-xl hover:bg-sky-600 transition-colors text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">contact_support</span>
                Hubungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
