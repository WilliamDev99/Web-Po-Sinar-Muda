"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminRutePage() {
  const router = useRouter();
  const [rutes, setRutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchRute();
  }, []);

  async function fetchRute() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rute')
      .select(`
        id,
        kota_asal,
        kota_tujuan,
        estimasi_waktu,
        created_at,
        jadwal (id)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setRutes(data);
    }
    setIsLoading(false);
  }

  const handleDelete = async (ruteId, jadwalCount) => {
    if (jadwalCount > 0) {
      const confirmForce = window.confirm(
        `PERINGATAN!\nRute ini memiliki ${jadwalCount} jadwal yang terhubung.\n\nJika Anda menghapus rute ini, SEMUA JADWAL yang menggunakan rute ini juga akan ikut terhapus.\n\nLanjutkan penghapusan?`
      );
      if (!confirmForce) return;
    } else {
      const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus rute ini?");
      if (!confirmDelete) return;
    }

    setIsDeleting(ruteId);
    
    try {
      const { error } = await supabase
        .from('rute')
        .delete()
        .eq('id', ruteId);

      if (error) {
        // Jika error dari Supabase terkait foreign key
        if (error.code === '23503') {
          alert("Gagal menghapus! Rute ini tidak bisa dihapus karena sudah ada pelanggan yang memesan tiket untuk rute/jadwal ini.");
        } else {
          throw error;
        }
      } else {
        alert("Rute berhasil dihapus.");
        setRutes(rutes.filter(r => r.id !== ruteId));
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Rute</h2>
          <p className="text-sm text-gray-500">Daftar semua rute perjalanan yang tersedia di sistem</p>
        </div>
        <button 
          onClick={() => router.push('/admin/jadwal/create')}
          className="bg-[#1f75b8] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center gap-2 text-sm shadow-md whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Buat Jadwal & Rute Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kota Asal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kota Tujuan</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Jumlah Jadwal</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    Memuat data rute...
                  </td>
                </tr>
              ) : rutes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 font-medium">
                    Belum ada data rute di database.
                  </td>
                </tr>
              ) : (
                rutes.map((rute) => {
                  const isLoad = isDeleting === rute.id;
                  const jadwalCount = rute.jadwal?.length || 0;
                  
                  return (
                    <tr key={rute.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#1f75b8]">my_location</span>
                          <span className="text-sm font-bold text-gray-800">{rute.kota_asal}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600">location_on</span>
                          <span className="text-sm font-bold text-gray-800">{rute.kota_tujuan}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${jadwalCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {jadwalCount} Jadwal Terhubung
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleDelete(rute.id, jadwalCount)}
                          disabled={isLoad}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Hapus Rute"
                        >
                          {isLoad ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
