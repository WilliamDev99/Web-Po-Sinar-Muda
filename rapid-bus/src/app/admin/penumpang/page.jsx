"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminPenumpangPage() {
  const router = useRouter();
  const [pemesanans, setPemesanans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPemesanan();
  }, []);

  async function fetchPemesanan() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pemesanan')
      .select(`
        *,
        jadwal (
          waktu_berangkat,
          waktu_tiba,
          tanggal_berangkat,
          harga_tiket,
          rute (kota_asal, kota_tujuan),
          armada (nama_kelas)
        )
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setPemesanans(data);
    }
    if (error) {
      console.error("Error fetching pemesanan:", error);
    }
    setIsLoading(false);
  }

  const handleBatalkan = async (id) => {
    const confirm = window.confirm("Apakah Anda yakin ingin MEMBATALKAN tiket penumpang ini?");
    if (!confirm) return;

    const { error } = await supabase
      .from('pemesanan')
      .update({ status: 'Dibatalkan' })
      .eq('id', id);

    if (error) {
      alert("Gagal membatalkan: " + error.message);
    } else {
      alert("Tiket berhasil dibatalkan.");
      fetchPemesanan();
    }
  };

  const handleKonfirmasi = async (id) => {
    const { error } = await supabase
      .from('pemesanan')
      .update({ status: 'Lunas' })
      .eq('id', id);

    if (error) {
      alert("Gagal mengkonfirmasi: " + error.message);
    } else {
      alert("Tiket berhasil dikonfirmasi Lunas.");
      fetchPemesanan();
    }
  };

  const filtered = pemesanans.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchSearch = searchQuery === '' || 
      p.kode_booking?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nama_pelanggan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.telepon_pelanggan?.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-700';
      case 'Menunggu': return 'bg-yellow-100 text-yellow-700';
      case 'Dibatalkan': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatCurrency = (num) => {
    if (!num) return '-';
    return `Rp ${Number(num).toLocaleString('id-ID')}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1f75b8] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Daftar Penumpang</h2>
            <p className="text-sm text-gray-500">Kelola pemesanan dan status tiket penumpang</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-[#1f75b8] text-sm font-bold px-4 py-2 rounded-xl border border-blue-100">
            {filtered.length} Pemesanan
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
          <input 
            type="text"
            placeholder="Cari nama, kode booking, atau no. HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8]"
          />
        </div>
        <div className="flex gap-2">
          {['semua', 'Menunggu', 'Lunas', 'Dibatalkan'].map(s => (
            <button 
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                filterStatus === s 
                  ? 'bg-[#1f75b8] text-white shadow-md' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s === 'semua' ? 'Semua' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-10 h-10 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mb-4"></div>
            Memuat data penumpang...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">person_off</span>
            <p className="font-medium text-gray-500">Belum ada data pemesanan penumpang.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Penumpang</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Kode Booking</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Rute</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Tanggal</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Kursi</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-center py-4 px-5 font-bold text-gray-500 text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{p.nama_pelanggan || '-'}</span>
                        <span className="text-xs text-gray-400">{p.telepon_pelanggan || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-[#1f75b8] bg-blue-50 px-2 py-1 rounded-md text-xs">{p.kode_booking || '-'}</span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {p.jadwal?.rute?.kota_asal || '?'} → {p.jadwal?.rute?.kota_tujuan || '?'}
                        </span>
                        <span className="text-xs text-gray-400">{p.jadwal?.armada?.nama_kelas || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{formatDate(p.jadwal?.tanggal_berangkat)}</span>
                        <span className="text-xs text-gray-400">
                          {p.jadwal?.waktu_berangkat?.substring(0, 5) || '-'} → {p.jadwal?.waktu_tiba?.substring(0, 5) || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-gray-700">{p.nomor_kursi?.join(', ') || '-'}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-gray-800">{formatCurrency(p.total_harga)}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {p.status === 'Menunggu' && (
                          <button 
                            onClick={() => handleKonfirmasi(p.id)}
                            className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Konfirmasi
                          </button>
                        )}
                        {p.status !== 'Dibatalkan' && (
                          <button 
                            onClick={() => handleBatalkan(p.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                            Batalkan
                          </button>
                        )}
                        {p.status === 'Dibatalkan' && (
                          <span className="text-xs text-gray-400 italic">Dibatalkan</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
