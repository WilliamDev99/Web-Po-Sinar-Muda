"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'Makassar';
  const to = searchParams.get('to') || 'Toraja';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [isEditing, setIsEditing] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [detailTab, setDetailTab] = useState('Fitur');
  const [editFrom, setEditFrom] = useState(from);
  const [editTo, setEditTo] = useState(to);
  const [editDate, setEditDate] = useState(date);
  const [showSyaratModal, setShowSyaratModal] = useState(false);
  const [seatSelectionTicket, setSeatSelectionTicket] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const [dbTickets, setDbTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  React.useEffect(() => {
    async function fetchJadwal() {
      setIsLoadingTickets(true);
      setErrorMessage(null);
      try {
        const { data, error } = await supabase
          .from('jadwal')
          .select(`
            id,
            tanggal_berangkat,
            waktu_berangkat,
            waktu_tiba,
            harga_tiket,
            rute!inner (kota_asal, kota_tujuan, estimasi_waktu),
            armada!inner (nama_kelas, total_kursi, fasilitas)
          `)
          .ilike('rute.kota_asal', `%${from}%`)
          .ilike('rute.kota_tujuan', `%${to}%`);
        
        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }
        
        if (data) {
          const getAbbr = (city) => {
            const map = {
              'makassar': 'MKS',
              'toraja': 'TRJ',
              'masamba': 'MSB',
              'palopo': 'PLP',
              'soroako': 'SRK'
            };
            return map[city.toLowerCase()] || city.substring(0, 3).toUpperCase();
          };

          const formatted = data.map(j => {
            const asal = getAbbr(j.rute.kota_asal);
            const tujuan = getAbbr(j.rute.kota_tujuan);
            const kelas = j.armada.nama_kelas.toUpperCase().replace('KELAS ', '');
            // Generate dummy plate number based on ID
            const plateNum = parseInt(j.id.substring(0, 8), 16) % 9000 + 1000;
            const plate = `DD ${plateNum} SM`;

            // Gunakan waktu_tiba dari database jika ada, fallback ke kalkulasi
            let arrivalTime = '';
            const durationStr = j.rute.estimasi_waktu || "";
            if (j.waktu_tiba) {
              arrivalTime = j.waktu_tiba.substring(0, 5);
            } else {
              // Fallback: hitung dari durasi rute
              let durHours = 0;
              let durMinutes = 0;
              const hourMatch = durationStr.match(/(\d+)\s*jam/i);
              if (hourMatch) durHours = parseInt(hourMatch[1], 10);
              const minMatch = durationStr.match(/(\d+)\s*menit/i);
              if (minMatch) durMinutes = parseInt(minMatch[1], 10);
              if (durHours === 0 && durMinutes === 0) durHours = 10;
              const depHour = parseInt((j.waktu_berangkat || "20:00").split(':')[0], 10);
              const depMin = parseInt((j.waktu_berangkat || "20:00").split(':')[1], 10);
              let totalMin = depMin + durMinutes;
              let extraHour = Math.floor(totalMin / 60);
              let finalMin = totalMin % 60;
              let totalHour = depHour + durHours + extraHour;
              let finalHour = totalHour % 24;
              arrivalTime = `${finalHour.toString().padStart(2, '0')}:${finalMin.toString().padStart(2, '0')}`;
            }

            return {
              id: j.id,
              operator: `${asal}-${tujuan} ${kelas} - ${plate}`,
              busType: "PO Sinar Muda",
              departure: j.waktu_berangkat.substring(0, 5),
              arrival: arrivalTime,
              duration: durationStr,
              seats: j.armada.total_kursi,
              price: `Rp ${Number(j.harga_tiket).toLocaleString('id-ID')}`,
              capacity: j.armada.total_kursi,
              seatFormat: j.armada.nama_kelas.includes('President') ? "1 - 1" : "2 - 2",
              amenities: j.armada.fasilitas.map(f => ({
                name: f,
                icon: f.toLowerCase().includes('ac') ? 'ac_unit' : f.toLowerCase().includes('makan') ? 'restaurant' : 'check_circle'
              })),
              ticketClasses: [
                { name: j.armada.nama_kelas, price: `Rp ${Number(j.harga_tiket).toLocaleString('id-ID')}` }
              ]
            };
          });
          setDbTickets(formatted);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setErrorMessage(err.message || String(err));
      } finally {
        setIsLoadingTickets(false);
      }
    }
    fetchJadwal();
  }, [from, to]);

  // State untuk Drag to Scroll (Date Picker)
  const scrollRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  const handleDateClick = (dc) => {
    router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${dc.fullDate}`);
  };
  
  const toggleSeat = (id) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter(s => s !== id));
    } else {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
    router.push(`/search?from=${encodeURIComponent(editFrom)}&to=${encodeURIComponent(editTo)}&date=${editDate}`);
  };

  const getSelectedSeatsTotalPrice = () => {
    if (!seatSelectionTicket || selectedSeats.length === 0) return '-';
    const standardPrice = parseInt(seatSelectionTicket.price.replace(/[^0-9]/g, ''), 10);
    
    let total = 0;
    selectedSeats.forEach(seatId => {
      if ([1, 4, 7].includes(seatId)) {
        total += 230000;
      } else if ([2, 3, 5, 6, 8, 9].includes(seatId)) {
        total += 200000;
      } else {
        total += standardPrice;
      }
    });

    return `Rp ${total.toLocaleString('id-ID').replace(/,/g, '.')}`;
  };

  // Helper to format date
  const formatIndonesianDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formattedSelectedDate = formatIndonesianDate(date);

  // Generate 14 date cards (1 day before, selected day, 12 days after)
  const generateDates = () => {
    const dates = [];
    const baseDate = new Date(date);
    if (isNaN(baseDate)) return dates;
    
    baseDate.setDate(baseDate.getDate() - 1);
    const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      dates.push({
        fullDate: `${year}-${month}-${day}`,
        dayName: dayNames[d.getDay()],
        dayNum: day,
        isActive: i === 1 // Second item is the selected date
      });
    }
    return dates;
  };
  
  const dateCards = generateDates();

  

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#a3d1ff]/85 backdrop-blur-md border-b border-white/10 shadow-sm flex items-center px-4 md:px-10 h-24 transition-all justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined font-bold text-[24px]">arrow_back</span>
          </Link>
          <a href="/" className="flex items-center gap-3 md:gap-4 group ml-1 md:ml-0">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-[12px] md:rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all overflow-hidden border-2 border-white/60">
              <img src="/logo/sinar-muda_logo.jpeg" alt="Bus Icon" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[#1f75b8] text-[17px] md:text-[26px] tracking-wide leading-none drop-shadow-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>PO SINAR MUDA</span>
              <span className="font-bold text-[#1f75b8]/90 text-[8px] md:text-[11px] tracking-[0.28em] mt-1 md:mt-1.5 drop-shadow-sm">TRANSPORTATION</span>
            </div>
          </a>
        </div>
        
        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
            Beranda
          </Link>
          <Link href="/tickets" className="text-[#1f75b8] font-semibold flex items-center gap-2 hover:text-[#1f75b8]/80 transition-colors">
            <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            Tiketku
          </Link>
          <Link href="/profile" className="text-white/70 hover:text-white font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[20px]">person</span>
            Profil
          </Link>
        </nav>
      </header>
      
      {/* Background */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[500px] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] pointer-events-none blur-3xl"></div>

      <main className="pt-28 pb-10 px-4 md:px-10 max-w-lg md:max-w-5xl lg:max-w-6xl mx-auto relative z-10">
        
        {/* New Route Summary Header */}
        <div className="flex flex-col items-center text-center mb-6 md:mb-10 w-full pt-2">
           
           <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">{from} - {to}</h2>
           
           <div className="bg-white/10 backdrop-blur-sm border border-white/10 text-white text-sm md:text-base font-medium flex items-center gap-2 px-4 py-1.5 rounded-lg mb-6 shadow-sm">
             <span className="material-symbols-outlined text-[18px]">calendar_today</span>
             {formattedSelectedDate}
           </div>

           <button 
             onClick={() => {
               setEditFrom(from);
               setEditTo(to);
               setEditDate(date);
               setIsEditing(true);
             }}
             className="bg-white text-[#1f75b8] font-bold py-2.5 px-6 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-95 transition-all mb-8 text-sm md:text-base"
           >
             Edit Pencarian
           </button>

           {/* Date Selector */}
           <div 
             ref={scrollRef}
             onMouseDown={handleMouseDown}
             onMouseLeave={handleMouseLeave}
             onMouseUp={handleMouseUp}
             onMouseMove={handleMouseMove}
             className="flex gap-2 md:gap-4 overflow-x-auto w-full pb-4 hide-scrollbar justify-start px-2 md:px-0 cursor-grab active:cursor-grabbing select-none"
           >
              {dateCards.map((dc, index) => (
                <div 
                  key={index} 
                  onClick={() => handleDateClick(dc)}
                  className={`flex-shrink-0 w-[64px] h-[76px] md:w-[76px] md:h-[88px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                    dc.isActive 
                    ? 'bg-white border-2 border-white shadow-lg scale-105' 
                    : 'bg-transparent border border-white/40 hover:bg-white/10'
                  }`}
                >
                  <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${dc.isActive ? 'text-[#1f75b8]' : 'text-white/90'}`}>
                    {dc.dayName}
                  </span>
                  <span className={`text-lg md:text-2xl font-bold ${dc.isActive ? 'text-[#1f75b8]' : 'text-white'}`}>
                    {dc.dayNum}
                  </span>
                </div>
              ))}
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
          {/* Results List */}
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg md:text-xl text-white">Tersedia {dbTickets.length} Jadwal</h3>
            </div>

            <div className="flex flex-col gap-4 md:gap-5">
              {errorMessage ? (
                <div className="bg-red-500 text-white text-center py-6 px-4 rounded-xl font-bold">
                  Terjadi Kesalahan Koneksi Database:<br/>
                  <span className="text-sm font-normal font-mono">{errorMessage}</span>
                </div>
              ) : isLoadingTickets ? (
                <div className="text-white text-center py-10">Mencari jadwal dari database...</div>
              ) : dbTickets.length === 0 ? (
                <div className="text-white text-center py-10">Tidak ada jadwal ditemukan untuk rute ini.</div>
              ) : dbTickets.map((ticket) => (
                <div key={ticket.id} className="clay-card p-4 md:p-6">
                  {/* Desktop Layout Wrapper */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    
                    {/* Top part / Operator (Mobile left, Desktop left) */}
                    <div className="flex justify-between items-start md:flex-col md:items-start md:w-1/4 md:gap-2">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-gray-800 text-base md:text-xl">{ticket.operator}</span>
                        <span className="text-gray-500 text-xs md:text-sm font-medium">
                          {ticket.seats < 5 ? `Sisa ${ticket.seats} Kursi` : `${ticket.seats} Kursi Tersedia`}
                        </span>
                      </div>
                      <div className="flex flex-col items-end md:items-start gap-1">
                        <button 
                          onClick={() => { setDetailTicket(ticket); setDetailTab('Fitur'); }}
                          className="text-xs md:text-sm font-bold text-[#1f75b8] bg-[#a3d1ff]/10 px-3 py-1 rounded hover:bg-[#a3d1ff]/20 transition-colors mb-0.5"
                        >
                          Detail
                        </button>
                        <button 
                          onClick={() => setShowSyaratModal(true)}
                          className="text-[10px] md:text-xs text-gray-500 hover:text-[#1f75b8] font-semibold underline underline-offset-2 transition-colors mt-0.5"
                        >
                          SYARAT & KETENTUAN
                        </button>
                      </div>
                    </div>
                    
                    {/* Time & Route */}
                    <div className="flex justify-between items-center bg-[#f8f9fc] rounded-xl px-4 py-3 md:flex-1 md:mx-2 w-full md:w-auto relative">
                      <div className="flex flex-col items-start w-[80px] md:w-[90px]">
                        <span className="text-[13px] md:text-sm text-gray-500 mb-1">{from.split(" ")[0]}</span>
                        <span className="font-bold text-[19px] md:text-[22px] text-[#1f3b64] leading-none">{ticket.departure.replace(':', '.')}</span>
                        <span className="text-[13px] md:text-[15px] font-bold text-[#1f3b64] mt-1">WITA</span>
                      </div>
                      
                      <div className="flex-1 flex flex-col items-center justify-center px-1">
                        <div className="flex items-center w-full justify-center gap-1 md:gap-2">
                          <div className="h-[1px] bg-indigo-200/60 w-6 md:w-8"></div>
                          <div className="flex flex-col items-center text-[#2b4c7e] leading-tight">
                            <span className="text-[12px] md:text-[13px] font-medium whitespace-nowrap">
                              {ticket.duration.toLowerCase().includes('menit') 
                                ? ticket.duration.replace(/jam/i, 'jam').replace(/menit/i, '').trim() 
                                : ticket.duration}
                            </span>
                            {ticket.duration.toLowerCase().includes('menit') && (
                              <span className="text-[12px] md:text-[13px] font-medium">menit</span>
                            )}
                          </div>
                          <div className="h-[1px] bg-indigo-200/60 w-6 md:w-8"></div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start w-[80px] md:w-[90px]">
                        <span className="text-[13px] md:text-sm text-gray-500 mb-1">{to.split(" ")[0]}</span>
                        <span className="font-bold text-[19px] md:text-[22px] text-[#1f3b64] leading-none">{ticket.arrival.replace(':', '.')}</span>
                        <span className="text-[13px] md:text-[15px] font-bold text-[#1f3b64] mt-1">WITA</span>
                      </div>
                    </div>
                    
                    <hr className="border-gray-100 md:hidden" />
                    
                    {/* Price & Button */}
                    <div className="flex flex-wrap justify-between items-center gap-y-3 md:flex-col md:items-end md:w-1/4 md:gap-4">
                      <div className="flex flex-col items-start md:items-end shrink-0">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Mulai dari</span>
                        <span className="font-bold text-[#1f75b8] text-lg md:text-xl leading-none whitespace-nowrap">{ticket.price}</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5 w-auto md:w-full md:flex-col">
                        <button 
                          onClick={() => router.push(`/booking?ticketId=${ticket.id}&date=${date}`)}
                          className="clay-primary text-white text-sm md:text-base font-bold px-8 py-2.5 md:py-3.5 rounded-xl md:w-full text-center"
                        >
                          Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Search Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Ubah Pencarian</h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Kota Asal</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                  <input 
                    className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#a3d1ff] focus:ring-1 focus:ring-[#a3d1ff] outline-none transition-all font-medium" 
                    value={editFrom}
                    onChange={(e) => setEditFrom(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Kota Tujuan</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">near_me</span>
                  <input 
                    className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#a3d1ff] focus:ring-1 focus:ring-[#a3d1ff] outline-none transition-all font-medium" 
                    value={editTo}
                    onChange={(e) => setEditTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-1">Tanggal</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">calendar_today</span>
                  <input 
                    type="date"
                    className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#a3d1ff] focus:ring-1 focus:ring-[#a3d1ff] outline-none transition-all font-medium" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleEditSubmit}
                  className="flex-1 bg-[#a3d1ff] text-white font-bold py-3.5 rounded-xl hover:bg-[#1d4ed8] shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Informasi Modal */}
      {detailTicket && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm md:p-4">
          <div className="bg-white w-full md:max-w-lg lg:max-w-xl rounded-t-[2rem] md:rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-white z-10 shadow-sm relative">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">Detail Informasi</h3>
              <button 
                onClick={() => setDetailTicket(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-gray-500">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar pb-[90px]">
              {/* Image Placeholder */}
              <div className="w-full h-40 md:h-48 bg-[#0b3386] relative">
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 px-6 sticky top-0 bg-white z-10">
                {['Fitur', 'Rute', 'Tiket'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`flex-1 py-4 text-sm font-bold transition-all border-b-[3px] ${
                      detailTab === tab 
                        ? 'text-[#1f75b8] border-[#a3d1ff]' 
                        : 'text-gray-400 border-transparent hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {detailTab === 'Fitur' && (
                  <div className="animate-in fade-in duration-300">
                    {/* Title & Subtitle */}
                    <div className="mb-6">
                      <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{detailTicket.operator}</h4>
                      <p className="text-sm md:text-base text-gray-500">{detailTicket.busType}</p>
                    </div>

                    {/* Spesifikasi Armada */}
                    <div className="mb-8">
                      <h5 className="text-[11px] md:text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">Spesifikasi Armada</h5>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-800">Kapasitas Kursi</span>
                          <span className="text-gray-500 font-medium">{detailTicket.capacity} Kursi</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-800">Format Kursi</span>
                          <span className="text-gray-500 font-medium">{detailTicket.seatFormat}</span>
                        </div>
                      </div>
                    </div>

                    {/* Fasilitas */}
                    <div>
                      <h5 className="text-[11px] md:text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">Fasilitas</h5>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {detailTicket.amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#f0f4fa] px-4 py-2.5 rounded-[14px] border border-transparent hover:border-gray-200 transition-colors cursor-default">
                            <span className="material-symbols-outlined text-[18px] text-gray-600">{amenity.icon}</span>
                            <span className="font-bold text-sm text-[#1f75b8]">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {detailTab === 'Rute' && (
                  <div className="animate-in fade-in duration-300">
                    <h5 className="text-[11px] md:text-xs font-bold text-gray-500 mb-6 tracking-wider uppercase">Jadwal & Rute Perjalanan</h5>
                    
                    <div className="flex flex-col gap-10 ml-2 mt-2">
                      {/* Keberangkatan */}
                      <div className="relative">
                        {/* The connecting line (Road) */}
                        <div className="absolute left-[6px] top-[28px] w-4 h-[calc(100%+12px)] bg-gray-800 z-0 flex items-center justify-center rounded-sm shadow-inner overflow-hidden border-x border-gray-600">
                          <div className="w-[2px] h-full opacity-70" style={{ backgroundImage: "linear-gradient(to bottom, #ffffff 50%, transparent 50%)", backgroundSize: "100% 24px" }}></div>
                        </div>
                        
                        {/* Animated Bus */}
                        <div className="absolute left-[2px] top-[28px] w-6 h-6 z-20 animate-bus-travel text-[#1f75b8] bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200">
                          <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                        </div>

                        {/* Origin Icon */}
                        <div className="absolute left-0 top-0 w-7 h-7 bg-white rounded-full border-2 border-[#a3d1ff] z-10 shadow-sm text-[#1f75b8] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                        </div>
                        
                        <div className="flex flex-col pl-[42px]">
                          <span className="font-bold text-xl text-gray-900">{detailTicket.departure} WITA</span>
                          <span className="text-sm font-bold text-gray-700 mt-1">{from}</span>
                          <span className="text-xs text-gray-500 mt-1 bg-gray-100 self-start px-2 py-1 rounded-md">Terminal / Pool Keberangkatan</span>
                        </div>

                        {/* Estimasi Waktu */}
                        <div className="absolute top-[calc(100%+20px)] left-[42px] -translate-y-1/2 flex items-center justify-center z-10">
                           <span className="text-[10px] md:text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 flex items-center gap-1 shadow-sm">
                             <span className="material-symbols-outlined text-[14px]">schedule</span>
                             {detailTicket.duration}
                           </span>
                        </div>
                      </div>

                      {/* Kedatangan */}
                      <div className="relative">
                        <div className="absolute left-0 top-0 w-7 h-7 bg-[#a3d1ff] rounded-full border-2 border-[#a3d1ff] z-10 shadow-sm text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                        </div>
                        <div className="flex flex-col pl-[42px]">
                          <span className="font-bold text-xl text-gray-900">{detailTicket.arrival} WITA</span>
                          <span className="text-sm font-bold text-gray-700 mt-1">{to}</span>
                          <span className="text-xs text-gray-500 mt-1 bg-gray-100 self-start px-2 py-1 rounded-md">Terminal / Pool Kedatangan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === 'Tiket' && (
                  <div className="animate-in fade-in duration-300">
                    <h5 className="text-[11px] md:text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">Daftar Kelas Tiket</h5>
                    <div className="flex flex-col gap-5 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      {detailTicket.ticketClasses?.map((tc, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-bold text-gray-700 text-sm md:text-base">{tc.name}</span>
                          <span className="text-gray-500 font-medium text-sm md:text-base">{tc.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 md:p-5 flex justify-between items-center z-20">
              <div className="flex flex-col px-2">
                <span className="text-[10px] md:text-xs text-gray-400 font-medium mb-0.5">Mulai Dari</span>
                <span className="text-[#2563eb] text-xl md:text-2xl font-bold leading-none">{detailTicket.price}</span>
              </div>
              <button 
                onClick={() => router.push(`/booking?ticketId=${detailTicket.id}&date=${date}`)}
                className="clay-primary text-white font-bold py-3.5 px-7 md:px-8 rounded-xl text-sm md:text-base"
              >
                Pesan Kursi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syarat & Ketentuan Modal */}
      {showSyaratModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowSyaratModal(false)}></div>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl relative w-full max-w-lg max-h-[85vh] flex flex-col z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100">
              <h3 className="font-bold text-lg md:text-xl text-gray-800">Syarat & Ketentuan</h3>
              <button onClick={() => setShowSyaratModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5 md:p-6 overflow-y-auto flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-gray-800 text-sm md:text-base">1. Pembelian & Pembatalan</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Tiket yang sudah dibeli tidak dapat dibatalkan atau diuangkan kembali (non-refundable) kecuali terjadi pembatalan sepihak dari pihak PO Sinar Muda.</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-gray-800 text-sm md:text-base">2. Waktu Kedatangan</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Penumpang wajib tiba di terminal atau lokasi keberangkatan minimal 30 menit sebelum jadwal keberangkatan bus.</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-gray-800 text-sm md:text-base">3. Aturan Bagasi</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Setiap penumpang berhak atas bagasi maksimal 20kg. Kelebihan muatan akan dikenakan biaya tambahan sesuai dengan kebijakan yang berlaku di lokasi keberangkatan.</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-gray-800 text-sm md:text-base">4. Perubahan Jadwal</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Perubahan jadwal (reschedule) hanya dapat diproses maksimal 1x24 jam sebelum waktu keberangkatan awal, dan dapat dikenakan biaya administrasi tambahan.</p>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-gray-800 text-sm md:text-base">5. Keamanan Barang Berharga</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Barang berharga harap dibawa ke dalam kabin bersama penumpang. Kehilangan barang di dalam bus maupun di bagasi sepenuhnya bukan tanggung jawab pihak PO Sinar Muda.</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-5 md:p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl md:rounded-b-3xl">
              <button 
                onClick={() => setShowSyaratModal(false)}
                className="w-full bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#2563eb] text-white">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
