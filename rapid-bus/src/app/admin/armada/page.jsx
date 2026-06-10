"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminArmadaPage() {
  const router = useRouter();
  const [armadas, setArmadas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchArmada() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('armada')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setArmadas(data);
      }
      setIsLoading(false);
    }
    fetchArmada();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus armada ini?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from('armada').delete().eq('id', id);
      if (error) {
        if (error.code === '23503') {
          alert("Gagal menghapus! Armada ini sedang digunakan oleh jadwal. Hapus jadwalnya terlebih dahulu.");
        } else {
          throw error;
        }
      } else {
        setArmadas(armadas.filter(a => a.id !== id));
        alert("Armada berhasil dihapus.");
      }
    } catch (err) {
      alert("Terjadi kesalahan: " + err.message);
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/armada/edit/${id}`);
  };

  const handleAdd = () => {
    router.push('/admin/armada/create');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1f75b8] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manajemen Armada</h2>
            <p className="text-sm text-gray-500">Daftar bus Sinar Muda yang beroperasi</p>
          </div>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#1f75b8] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center gap-2 text-sm shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Armada
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mb-4"></div>
            Memuat armada...
          </div>
        ) : armadas.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">directions_bus</span>
            <p className="font-medium text-gray-500">Belum ada armada bus yang terdaftar.</p>
          </div>
        ) : (
          armadas.map((armada) => (
            <div key={armada.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-100 transition-colors pointer-events-none"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-[#1f75b8] text-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-3xl">directions_bus</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(armada.id)}
                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(armada.id)}
                    className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-800">{armada.nama_kelas}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">airline_seat_recline_extra</span>
                    {armada.total_kursi} Kursi
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-gray-100 relative z-10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Fasilitas</span>
                <div className="flex flex-wrap gap-2">
                  {armada.fasilitas?.map((fasilitas, idx) => (
                    <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {fasilitas}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
