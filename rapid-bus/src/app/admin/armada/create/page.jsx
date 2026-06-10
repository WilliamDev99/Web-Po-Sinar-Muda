"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminCreateArmadaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama_kelas: '',
    total_kursi: 30,
  });
  const [fasilitas, setFasilitas] = useState(['AC']);
  const [newFasilitas, setNewFasilitas] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFasilitas = () => {
    if (newFasilitas.trim() && !fasilitas.includes(newFasilitas.trim())) {
      setFasilitas([...fasilitas, newFasilitas.trim()]);
      setNewFasilitas('');
    }
  };

  const handleRemoveFasilitas = (item) => {
    setFasilitas(fasilitas.filter(f => f !== item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (fasilitas.length === 0) {
      return alert("Tambahkan setidaknya satu fasilitas!");
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('armada').insert({
        nama_kelas: formData.nama_kelas.toUpperCase(),
        total_kursi: parseInt(formData.total_kursi),
        fasilitas: fasilitas
      });

      if (error) throw new Error("Gagal menambahkan armada: " + error.message);

      alert("Armada berhasil ditambahkan!");
      router.push('/admin/armada');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <button 
          onClick={() => router.push('/admin/armada')}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1f75b8] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tambah Armada Baru</h2>
          <p className="text-sm text-gray-500">Tambahkan jenis armada beserta fasilitasnya</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Nama Kelas Armada <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">directions_bus</span>
              <input 
                type="text"
                name="nama_kelas"
                required
                placeholder="Contoh: EKSEKUTIF, BISNIS, SLEEPER"
                value={formData.nama_kelas}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50 uppercase"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Total Kursi <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">airline_seat_recline_extra</span>
              <input 
                type="number"
                name="total_kursi"
                required
                min="1"
                placeholder="Contoh: 30"
                value={formData.total_kursi}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 mt-2">
            <label className="text-sm font-bold text-gray-700">Fasilitas Armada <span className="text-red-500">*</span></label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text"
                placeholder="Ketik fasilitas (cth: Bantal, Selimut)"
                value={newFasilitas}
                onChange={(e) => setNewFasilitas(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFasilitas(); } }}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
              />
              <button 
                type="button"
                onClick={handleAddFasilitas}
                className="bg-blue-50 text-[#1f75b8] px-4 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>

            {/* List of facilities */}
            <div className="flex flex-wrap gap-2 mt-2 p-4 bg-gray-50 rounded-xl border border-gray-100 min-h-[80px]">
              {fasilitas.length === 0 ? (
                <span className="text-gray-400 text-sm italic w-full text-center mt-2">Belum ada fasilitas ditambahkan</span>
              ) : (
                fasilitas.map((item, idx) => (
                  <div key={idx} className="bg-[#1f75b8] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    {item}
                    <button type="button" onClick={() => handleRemoveFasilitas(item)} className="hover:text-red-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => router.push('/admin/armada')}
              className="px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#1f75b8] text-white font-bold rounded-xl hover:bg-sky-600 transition-colors text-sm shadow-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              Simpan Armada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
