"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { tickets } from '../../data/tickets';

// Komponen Helper untuk Ikon Legenda Kursi
function LegendSeatIcon({ fill, stroke, armrestFill }) {
  return (
    <div className="w-5 h-5">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 30 C5 36, 10 38, 20 38 C30 38, 35 36, 35 30 L35 25 L5 25 Z" fill={fill} stroke={stroke} strokeWidth="2"/>
        <rect x="2" y="10" width="5" height="18" rx="2" fill={armrestFill} stroke={stroke} strokeWidth="2"/>
        <rect x="33" y="10" width="5" height="18" rx="2" fill={armrestFill} stroke={stroke} strokeWidth="2"/>
        <rect x="7" y="4" width="26" height="24" rx="4" fill={fill} stroke={stroke} strokeWidth="2"/>
      </svg>
    </div>
  );
}

// Komponen Helper untuk Kursi
function SeatBtn({ id, selected, toggle }) {
  const cushionFill = selected ? '#4b5563' : '#ffffff';
  const stroke = selected ? '#4b5563' : '#d1d5db';
  const textCol = selected ? 'text-white' : 'text-gray-500';
  const armrestFill = selected ? '#374151' : '#f3f4f6';

  return (
    <button 
      onClick={toggle}
      title={`Kursi ${id}`}
      className={`w-10 h-10 md:w-11 md:h-11 relative group active:scale-95 transition-all`}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-sm group-hover:drop-shadow transition-all" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 30 C5 36, 10 38, 20 38 C30 38, 35 36, 35 30 L35 25 L5 25 Z" fill={cushionFill} stroke={stroke} strokeWidth="2"/>
        <rect x="2" y="10" width="5" height="18" rx="2" fill={armrestFill} stroke={stroke} strokeWidth="2"/>
        <rect x="33" y="10" width="5" height="18" rx="2" fill={armrestFill} stroke={stroke} strokeWidth="2"/>
        <rect x="7" y="4" width="26" height="24" rx="4" fill={cushionFill} stroke={stroke} strokeWidth="2"/>
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[11px] md:text-xs font-bold ${textCol}`} style={{ marginTop: '-4px' }}>
        {id}
      </span>
    </button>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const ticketIdParam = searchParams.get('ticketId');
  const dateParam = searchParams.get('date');
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  
  const ticketId = ticketIdParam ? parseInt(ticketIdParam, 10) : null;
  const seatSelectionTicket = tickets.find(t => t.id === ticketId);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showDetailKursi, setShowDetailKursi] = useState(false);
  const [step, setStep] = useState('seat'); // 'seat' | 'pickup'
  const [selectedPickup, setSelectedPickup] = useState(null);

  const pickupLocations = [
    { id: 'perwakilan', name: 'Perwakilan Sinar Muda', time: '19:30' },
    { id: 'terminal-daya', name: 'Terminal Daya', time: '20:00' }
  ];
  
  const toggleSeat = (id) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter(s => s !== id));
    } else {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const getSeatPrice = (seatId) => {
    const standardPrice = parseInt(seatSelectionTicket.price.replace(/[^0-9]/g, ''), 10);
    if ([1, 4, 7].includes(seatId)) return 230000;
    if ([2, 3, 5, 6, 8, 9].includes(seatId)) return 200000;
    return standardPrice;
  };

  const getSeatClass = (seatId) => {
    if ([1, 4, 7].includes(seatId)) return 'Kelas President';
    if ([2, 3, 5, 6, 8, 9].includes(seatId)) return 'Kelas Gubernur';
    return 'Kelas Bisnis';
  };

  const getTotalPrice = () => {
    if (!seatSelectionTicket || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
  };

  const formatPrice = (num) => `Rp ${num.toLocaleString('id-ID').replace(/,/g, '.')}`;

  if (!seatSelectionTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Tiket tidak ditemukan</h2>
          <button onClick={() => router.back()} className="text-blue-600 font-semibold underline">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col md:items-center">
      {/* Header */}
      <header className="w-full bg-white z-10 border-b border-gray-100 shadow-sm sticky top-0 md:max-w-md mx-auto h-[72px]">
        <div className="flex justify-between items-center px-4 h-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (step === 'checkout') {
                  setStep('pickup');
                } else if (step === 'pickup') {
                  setStep('seat');
                } else {
                  router.back();
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
            >
              <span className="material-symbols-outlined text-[24px] text-gray-700">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {step === 'checkout' ? 'Detail Pemesanan' : step === 'pickup' ? 'Pilih Tempat Naik' : 'Pilih Kursi'}
              </h3>
              <span className="text-xs text-gray-500 font-medium">{seatSelectionTicket.operator} • {seatSelectionTicket.busType}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full md:max-w-md bg-blue-50 relative flex flex-col mx-auto">
        
        {step === 'seat' && (
          <>
            {/* Scrollable Content (Seat Selection) */}
            <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar flex flex-col items-center">
              
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-4 px-4 bg-blue-50/95 backdrop-blur-sm sticky top-0 w-full z-10">
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon fill="#e2e8f0" stroke="#94a3b8" armrestFill="#cbd5e1" />
                  <span className="text-[10px] font-medium text-gray-500">Laki - Laki</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon fill="#fbcfe8" stroke="#f472b6" armrestFill="#f9a8d4" />
                  <span className="text-[10px] font-medium text-gray-500">Perempuan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon fill="#ffffff" stroke="#d1d5db" armrestFill="#f3f4f6" />
                  <span className="text-[10px] font-medium text-gray-500">Tersedia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon fill="#4b5563" stroke="#4b5563" armrestFill="#374151" />
                  <span className="text-[10px] font-medium text-gray-500">Dipilih</span>
                </div>
              </div>

              {/* Bus Interior Box */}
              <div className="bg-white mx-4 mt-2 rounded-t-3xl rounded-b-lg shadow-sm border border-gray-100 w-full max-w-[320px] p-6 pb-8 relative">
                
                {/* Front Section (Steering & Driver seat) */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded flex flex-col items-center justify-between py-1 bg-[#d96704] border border-[#b45604] shadow-inner text-white">
                    <span className="text-[10px] md:text-xs font-bold leading-none self-start ml-1.5 mt-1">A</span>
                    <div className="w-3/4 h-2 rounded-sm border border-white/40 bg-white/30 mb-0.5"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-[20px] font-light">sports_motorsports</span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="flex flex-col gap-4">
                  {/* Row 1 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={1} selected={selectedSeats.includes(1)} toggle={() => toggleSeat(1)} />
                      <div className="w-10 md:w-11"></div>
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={2} selected={selectedSeats.includes(2)} toggle={() => toggleSeat(2)} />
                      <SeatBtn id={3} selected={selectedSeats.includes(3)} toggle={() => toggleSeat(3)} />
                    </div>
                  </div>
                  {/* Row 2 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={4} selected={selectedSeats.includes(4)} toggle={() => toggleSeat(4)} />
                      <div className="w-10 md:w-11"></div>
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={5} selected={selectedSeats.includes(5)} toggle={() => toggleSeat(5)} />
                      <SeatBtn id={6} selected={selectedSeats.includes(6)} toggle={() => toggleSeat(6)} />
                    </div>
                  </div>
                  {/* Row 3 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                      <SeatBtn id={7} selected={selectedSeats.includes(7)} toggle={() => toggleSeat(7)} />
                      <div className="w-10 md:w-11"></div>
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={8} selected={selectedSeats.includes(8)} toggle={() => toggleSeat(8)} />
                      <SeatBtn id={9} selected={selectedSeats.includes(9)} toggle={() => toggleSeat(9)} />
                    </div>
                  </div>
                  {/* Row 4 (Starts 2x2) */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={10} selected={selectedSeats.includes(10)} toggle={() => toggleSeat(10)} />
                      <SeatBtn id={11} selected={selectedSeats.includes(11)} toggle={() => toggleSeat(11)} />
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={12} selected={selectedSeats.includes(12)} toggle={() => toggleSeat(12)} />
                      <SeatBtn id={13} selected={selectedSeats.includes(13)} toggle={() => toggleSeat(13)} />
                    </div>
                  </div>
                  {/* Row 5 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={14} selected={selectedSeats.includes(14)} toggle={() => toggleSeat(14)} />
                      <SeatBtn id={15} selected={selectedSeats.includes(15)} toggle={() => toggleSeat(15)} />
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={16} selected={selectedSeats.includes(16)} toggle={() => toggleSeat(16)} />
                      <SeatBtn id={17} selected={selectedSeats.includes(17)} toggle={() => toggleSeat(17)} />
                    </div>
                  </div>
                  {/* Row 6 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={18} selected={selectedSeats.includes(18)} toggle={() => toggleSeat(18)} />
                      <SeatBtn id={19} selected={selectedSeats.includes(19)} toggle={() => toggleSeat(19)} />
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={20} selected={selectedSeats.includes(20)} toggle={() => toggleSeat(20)} />
                      <SeatBtn id={21} selected={selectedSeats.includes(21)} toggle={() => toggleSeat(21)} />
                    </div>
                  </div>
                  {/* Row 7 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <SeatBtn id={24} selected={selectedSeats.includes(24)} toggle={() => toggleSeat(24)} />
                      <SeatBtn id={25} selected={selectedSeats.includes(25)} toggle={() => toggleSeat(25)} />
                    </div>
                    <div className="flex gap-2">
                      <SeatBtn id={22} selected={selectedSeats.includes(22)} toggle={() => toggleSeat(22)} />
                      <SeatBtn id={23} selected={selectedSeats.includes(23)} toggle={() => toggleSeat(23)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Kursi Expandable Sheet */}
            {showDetailKursi && selectedSeats.length > 0 && (
              <div className="absolute bottom-[72px] left-0 w-full bg-white border-t border-gray-200 shadow-[0_-8px_25px_-5px_rgba(0,0,0,0.1)] rounded-t-2xl z-30 animate-in slide-in-from-bottom duration-200 max-h-[50vh] flex flex-col">
                {/* Detail Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                  <h4 className="font-bold text-base text-gray-900">Detail Kursi</h4>
                  <button 
                    onClick={() => setShowDetailKursi(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">close</span>
                  </button>
                </div>
                
                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  <h5 className="font-bold text-sm text-gray-900 mb-3">No Kursi</h5>
                  <div className="flex flex-col gap-3">
                    {selectedSeats.map(seatId => (
                      <div key={seatId} className="flex justify-between items-center">
                        <span className="text-sm text-[#1f75b8] font-medium">No {seatId} {getSeatClass(seatId)}</span>
                        <span className="text-sm text-gray-600 font-medium">{formatPrice(getSeatPrice(seatId))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:p-5 flex justify-between items-center z-20">
              <div className="flex flex-col">
                <span className="font-bold text-[#1f75b8] text-lg md:text-xl leading-none">
                  {selectedSeats.length > 0 ? formatPrice(getTotalPrice()) : '-'}
                </span>
                {selectedSeats.length > 0 && (
                  <button 
                    onClick={() => setShowDetailKursi(!showDetailKursi)}
                    className="flex items-center gap-0.5 mt-1 group"
                  >
                    <span className="text-xs text-gray-500 font-medium">{selectedSeats.length} Penumpang</span>
                    <span className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform ${showDetailKursi ? 'rotate-180' : ''}`}>
                      expand_less
                    </span>
                  </button>
                )}
              </div>
              <button 
                disabled={selectedSeats.length === 0}
                onClick={() => {
                  setShowDetailKursi(false);
                  setStep('pickup');
                }}
                className={`font-bold py-3 px-8 rounded-xl transition-all text-sm md:text-base ${
                  selectedSeats.length > 0 
                    ? 'bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </>
        )}
        
        {step === 'pickup' && (
          <>
            {/* Pickup Location Selection */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h4 className="font-bold text-base text-center text-[#1f75b8]">Pilih Tempat Naik</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {pickupLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedPickup(loc.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                        selectedPickup === loc.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedPickup === loc.id 
                          ? 'border-[#a3d1ff]' 
                          : 'border-gray-300'
                      }`}>
                        {selectedPickup === loc.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#a3d1ff]"></div>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-semibold text-sm ${
                          selectedPickup === loc.id ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {loc.name}
                        </span>
                        <span className="text-xs text-[#1f75b8] font-bold">{loc.time} WITA</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar Pickup */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:p-5 flex justify-between items-center z-20">
              <div className="flex flex-col">
                <span className="font-bold text-[#1f75b8] text-lg md:text-xl leading-none">
                  {formatPrice(getTotalPrice())}
                </span>
                <span className="text-xs text-gray-500 font-medium mt-1">{selectedSeats.length} Penumpang</span>
              </div>
              <button 
                disabled={!selectedPickup}
                onClick={() => {
                  setStep('checkout');
                }}
                className={`font-bold py-3 px-8 rounded-xl transition-all text-sm md:text-base ${
                  selectedPickup 
                    ? 'bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </>
        )}

        {step === 'checkout' && (
          <>
            {/* Checkout Form */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                  <h4 className="font-bold text-lg text-[#334155]">Detail Penumpang</h4>
                </div>
                
                <div className="flex flex-col gap-6">
                  {selectedSeats.map((seatId, idx) => (
                    <div key={seatId} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#64748b]">Penumpang {idx + 1}</span>
                        <span className="text-sm font-medium text-[#64748b]">No Kursi: {seatId}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-400">Nama:</label>
                        <input 
                          type="text" 
                          placeholder="Nama Penumpang" 
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-gray-900">Jenis Kelamin:</span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={`gender-${seatId}`} value="Laki-Laki" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                          <span className="text-sm text-[#64748b]">Laki - Laki</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name={`gender-${seatId}`} value="Perempuan" className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                          <span className="text-sm text-[#64748b]">Perempuan</span>
                        </label>
                      </div>
                      {idx < selectedSeats.length - 1 && <hr className="my-2 border-gray-100" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                  </div>
                  <h4 className="font-bold text-lg text-[#334155]">Detail Kontak</h4>
                </div>
                <div className="flex flex-col gap-3">
                  <input 
                    type="email" 
                    placeholder="will.aja199@gmail.com" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                  <input 
                    type="tel" 
                    placeholder="Mobile Number" 
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="font-bold text-lg text-[#334155] mb-4 border-b border-gray-100 pb-3">Detail Perjalanan</h4>
                <div className="relative pl-6 flex flex-col gap-6">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] border-l border-dashed border-gray-300"></div>
                  
                  <div className="flex justify-between items-start relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-[3px] border-gray-300 bg-white"></div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-700">Makassar • <span className="text-gray-500 font-medium">03 Jun 2026</span></h5>
                      <p className="text-xs text-gray-400 mt-0.5">{pickupLocations.find(l => l.id === selectedPickup)?.name || 'Perwakilan Reitama'}</p>
                    </div>
                    <span className="font-bold text-sm text-gray-500">{pickupLocations.find(l => l.id === selectedPickup)?.time || '19:30'} WITA</span>
                  </div>

                  <div className="flex justify-between items-start relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-[3px] border-gray-300 bg-white"></div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-700">Toraja • <span className="text-[#ef4444] font-medium">04 Jun 2026</span></h5>
                    </div>
                    <span className="font-bold text-sm text-gray-500">04:30 WITA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar Checkout */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:p-5 flex justify-between items-center z-20 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col">
                <span className="font-bold text-[#1f75b8] text-lg md:text-xl leading-none">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <button 
                onClick={() => {
                  alert("Pesanan berhasil! Tiket Anda telah diterbitkan.");
                  router.push('/');
                }}
                className="font-bold py-3 px-10 rounded-xl transition-all text-sm md:text-base bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md"
              >
                Bayar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#a3d1ff] text-white">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
