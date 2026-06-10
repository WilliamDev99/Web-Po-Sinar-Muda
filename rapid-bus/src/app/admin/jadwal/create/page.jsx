"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminCreateJadwalPage() {
  const router = useRouter();
  
  const [armadas, setArmadas] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [rutes, setRutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    kota_asal: '',
    kota_tujuan: '',
    armada_id: '',
    tanggal_berangkat: '',
    waktu_berangkat: '',
    waktu_tiba: '',
    harga_tiket: ''
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      // Fetch Armada
      const { data: armadaData } = await supabase.from('armada').select('id, nama_kelas');
      if (armadaData) setArmadas(armadaData);

      // Fetch Rute to get unique cities
      const { data: ruteData } = await supabase.from('rute').select('id, kota_asal, kota_tujuan, estimasi_waktu');
      if (ruteData) {
        setRutes(ruteData);
        const cities = new Set();
        ruteData.forEach(r => {
          cities.add(r.kota_asal);
          cities.add(r.kota_tujuan);
        });
        setUniqueCities(Array.from(cities));
      }
      
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalRuteId = null;

      // Cari apakah rute sudah ada
      const { data: existingRute } = await supabase
        .from('rute')
        .select('id')
        .ilike('kota_asal', formData.kota_asal)
        .ilike('kota_tujuan', formData.kota_tujuan)
        .maybeSingle();

      // Hitung durasi dari jam berangkat dan jam tiba
      const [depH, depM] = formData.waktu_berangkat.split(':').map(Number);
      const [arrH, arrM] = formData.waktu_tiba.split(':').map(Number);
      let diffMin = (arrH * 60 + arrM) - (depH * 60 + depM);
      if (diffMin <= 0) diffMin += 24 * 60; // lewat tengah malam
      const estJam = Math.floor(diffMin / 60);
      const estMenit = diffMin % 60;
      const estimasiWaktu = estMenit > 0 ? `${estJam} jam ${estMenit} menit` : `${estJam} jam`;

      if (existingRute) {
        finalRuteId = existingRute.id;
        // Update estimasi_waktu jika masih 'Estimasi'
        await supabase
          .from('rute')
          .update({ estimasi_waktu: estimasiWaktu })
          .eq('id', existingRute.id)
          .eq('estimasi_waktu', 'Estimasi');
      } else {
        // Buat rute baru jika belum ada
        const { data: newRute, error: ruteError } = await supabase
          .from('rute')
          .insert({
            kota_asal: formData.kota_asal,
            kota_tujuan: formData.kota_tujuan,
            estimasi_waktu: estimasiWaktu
          })
          .select()
          .single();

        if (ruteError) throw new Error("Gagal membuat rute baru: " + ruteError.message);
        finalRuteId = newRute.id;
      }

      const { error } = await supabase.from('jadwal').insert({
        rute_id: finalRuteId,
        armada_id: formData.armada_id,
        tanggal_berangkat: formData.tanggal_berangkat,
        waktu_berangkat: formData.waktu_berangkat,
        waktu_tiba: formData.waktu_tiba,
        harga_tiket: parseFloat(formData.harga_tiket)
      });

      if (error) throw new Error("Gagal menambahkan jadwal: " + error.message);

      alert("Jadwal berhasil ditambahkan!");
      router.push('/admin');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#1f75b8] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Buat Jadwal Baru</h2>
            <p className="text-sm text-gray-500">Tambahkan jadwal perjalanan bus ke sistem</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Menyiapkan formulir...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kota Asal */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Kota Asal <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">my_location</span>
                    <input 
                      list="cities-list"
                      name="kota_asal"
                      required
                      placeholder="Contoh: Makassar"
                      value={formData.kota_asal}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                    />
                  </div>
                </div>

                {/* Kota Tujuan */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-gray-700">Kota Tujuan <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">location_on</span>
                    <input 
                      list="cities-list"
                      name="kota_tujuan"
                      required
                      placeholder="Contoh: Toraja"
                      value={formData.kota_tujuan}
                      onChange={handleChange}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                    />
                  </div>
                </div>

                <datalist id="cities-list">
                  {uniqueCities.map((city, idx) => (
                    <option key={idx} value={city} />
                  ))}
                </datalist>
              </div>

              {/* Armada/Jenis Kursi Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Pilih Armada <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">directions_bus</span>
                  <select 
                    name="armada_id"
                    required
                    value={formData.armada_id}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] appearance-none bg-gray-50"
                  >
                    <option value="" disabled>Pilih Armada...</option>
                    {armadas.map(armada => (
                      <option key={armada.id} value={armada.id}>
                        {armada.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggal */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Tanggal Keberangkatan <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">calendar_today</span>
                  <input 
                    type="date"
                    name="tanggal_berangkat"
                    required
                    value={formData.tanggal_berangkat}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                  />
                </div>

                {/* Harga Tiket - di bawah Tanggal */}
                <label className="text-sm font-bold text-gray-700 mt-2">Harga Tiket (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">payments</span>
                  <input 
                    type="number"
                    name="harga_tiket"
                    required
                    placeholder="Contoh: 150000"
                    value={formData.harga_tiket}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                  />
                </div>
              </div>

              {/* Waktu Berangkat */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Jam Keberangkatan <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">schedule</span>
                  <input 
                    type="time"
                    name="waktu_berangkat"
                    required
                    value={formData.waktu_berangkat}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                  />
                </div>

                {/* Jam Tiba - di bawah Jam Keberangkatan */}
                <label className="text-sm font-bold text-gray-700 mt-2">Jam Tiba <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400">alarm</span>
                  <input 
                    type="time"
                    name="waktu_tiba"
                    required
                    value={formData.waktu_tiba}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1f75b8] bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-4 pt-6 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => router.push('/admin')}
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
                Simpan Jadwal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
