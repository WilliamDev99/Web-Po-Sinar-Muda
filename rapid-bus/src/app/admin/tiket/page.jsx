"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDataTiketPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
        .order('created_at', { ascending: false });

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
        setBookings(formatted);
      }
      setIsLoading(false);
    }
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Tiket / Pemesanan</h2>
          <p className="text-sm text-gray-500">Kelola semua transaksi pembelian tiket penumpang</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Cari nama, kode booking, rute..." 
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
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode Booking</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rute & Tanggal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Memuat semua data tiket...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">
                    {searchTerm ? "Tidak ada tiket yang cocok dengan pencarian." : "Belum ada riwayat pemesanan."}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-sm font-bold text-gray-800">{booking.id}</div>
                      <div className="text-xs text-gray-500 mt-1">{booking.seats} ({booking.price})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1f75b8] flex items-center justify-center font-bold text-xs uppercase">
                          {booking.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{booking.name}</span>
                      </div>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pelanggan</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedBooking.name}</span>
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
