"use client";

import { useState, Suspense, useEffect, createContext, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from '@/utils/supabase';
import HeaderDropdown from "@/components/HeaderDropdown";

// Context untuk meneruskan tipe bus dan kapasitas kursi ke SeatBtn
const SeatConfigContext = createContext({ busType: "", capacity: 30 });

// Komponen Helper untuk Ikon Legenda Kursi
function LegendSeatIcon({ fill, stroke, armrestFill, isSleeper }) {
  if (isSleeper) {
    return (
      <div className="w-5 h-5">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          {/* Mattress */}
          <rect
            x="6"
            y="2"
            width="28"
            height="36"
            rx="5"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
          />
          {/* Pillow */}
          <rect
            x="10"
            y="6"
            width="20"
            height="7"
            rx="2"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Blanket */}
          <path
            d="M6 18 L34 18 L34 33 C34 35.8 31.8 38 29 38 L11 38 C8.2 38 6 35.8 6 33 Z"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="2"
          />
          {/* Fold crease of blanket */}
          <path
            d="M6 18 Q 20 21, 34 18"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-5 h-5">
      <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M5 30 C5 36, 10 38, 20 38 C30 38, 35 36, 35 30 L35 25 L5 25 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
        <rect
          x="2"
          y="10"
          width="5"
          height="18"
          rx="2"
          fill={armrestFill}
          stroke={stroke}
          strokeWidth="2"
        />
        <rect
          x="33"
          y="10"
          width="5"
          height="18"
          rx="2"
          fill={armrestFill}
          stroke={stroke}
          strokeWidth="2"
        />
        <rect
          x="7"
          y="4"
          width="26"
          height="24"
          rx="4"
          fill={fill}
          stroke={stroke}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// Komponen Helper untuk Kursi
function SeatBtn({ id, selected, toggle, bookedGender }) {
  const { busType, capacity } = useContext(SeatConfigContext);
  
  if (capacity && id > capacity) {
    return <div className="w-10 h-10 md:w-11 md:h-11 invisible shrink-0" />;
  }

  // bookedGender: null (available), 'L' (laki-laki), 'P' (perempuan)
  const isBooked = bookedGender !== null && bookedGender !== undefined;
  
  const busTypeLower = busType?.toLowerCase() || "";
  let isSleeper = false;
  if (busTypeLower.includes("sleeper")) {
    isSleeper = true;
  } else if (busTypeLower.includes("bisnis")) {
    isSleeper = false;
  } else {
    isSleeper = [1, 4, 7].includes(id);
  }

  let cushionFill, stroke, textCol, armrestFill;

  if (isBooked && bookedGender === 'P') {
    // Perempuan - Pink
    cushionFill = "#fbcfe8";
    stroke = "#f472b6";
    textCol = "text-pink-600";
    armrestFill = "#f9a8d4";
  } else if (isBooked) {
    // Laki-laki - Gray/Slate
    cushionFill = "#e2e8f0";
    stroke = "#94a3b8";
    textCol = "text-slate-600";
    armrestFill = "#cbd5e1";
  } else if (selected) {
    // Dipilih user - Dark gray
    cushionFill = "#4b5563";
    stroke = "#4b5563";
    textCol = "text-white";
    armrestFill = "#374151";
  } else {
    // Kosong - White
    cushionFill = "#ffffff";
    stroke = "#d1d5db";
    textCol = "text-gray-500";
    armrestFill = "#f3f4f6";
  }

  return (
    <button
      onClick={isBooked ? undefined : toggle}
      disabled={isBooked}
      title={isBooked ? `Kursi ${id} - Sudah Dipesan (${bookedGender === 'P' ? 'Perempuan' : 'Laki-laki'})` : `Kursi ${id}`}
      className={`w-10 h-10 md:w-11 md:h-11 relative group transition-all ${isBooked ? 'cursor-not-allowed opacity-80' : 'active:scale-95'}`}
    >
      {isSleeper ? (
        <svg
          viewBox="0 0 40 40"
          className={`w-full h-full drop-shadow-sm transition-all ${!isBooked ? 'group-hover:drop-shadow' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mattress */}
          <rect
            x="6"
            y="2"
            width="28"
            height="36"
            rx="5"
            fill={cushionFill}
            stroke={stroke}
            strokeWidth="2"
          />
          {/* Pillow */}
          <rect
            x="10"
            y="6"
            width="20"
            height="7"
            rx="2"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          {/* Blanket */}
          <path
            d="M6 18 L34 18 L34 33 C34 35.8 31.8 38 29 38 L11 38 C8.2 38 6 35.8 6 33 Z"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="2"
          />
          {/* Fold crease of blanket */}
          <path
            d="M6 18 Q 20 21, 34 18"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 40 40"
          className={`w-full h-full drop-shadow-sm transition-all ${!isBooked ? 'group-hover:drop-shadow' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 30 C5 36, 10 38, 20 38 C30 38, 35 36, 35 30 L35 25 L5 25 Z"
            fill={cushionFill}
            stroke={stroke}
            strokeWidth="2"
          />
          <rect
            x="2"
            y="10"
            width="5"
            height="18"
            rx="2"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="2"
          />
          <rect
            x="33"
            y="10"
            width="5"
            height="18"
            rx="2"
            fill={armrestFill}
            stroke={stroke}
            strokeWidth="2"
          />
          <rect
            x="7"
            y="4"
            width="26"
            height="24"
            rx="4"
            fill={cushionFill}
            stroke={stroke}
            strokeWidth="2"
          />
        </svg>
      )}
      <span
        className={`absolute inset-0 flex items-center justify-center text-[11px] md:text-xs font-bold ${textCol}`}
        style={isSleeper ? { marginTop: "10px" } : { marginTop: "-4px" }}
      >
        {id}
      </span>
    </button>
  );
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ticketIdParam = searchParams.get("ticketId");
  const dateParam = searchParams.get("date");
  const fromParam = searchParams.get("from") || "Makassar";
  const toParam = searchParams.get("to") || "Toraja";

  const [seatSelectionTicket, setSeatSelectionTicket] = useState(null);
  const [isLoadingDB, setIsLoadingDB] = useState(true);

  useEffect(() => {
    if (!ticketIdParam) return;
    async function fetchJadwal() {
      try {
        const { data, error } = await supabase
          .from('jadwal')
          .select(`
            id,
            tanggal_berangkat,
            waktu_berangkat,
            harga_tiket,
            rute!inner (kota_asal, kota_tujuan, estimasi_waktu),
            armada!inner (nama_kelas, total_kursi, fasilitas)
          `)
          .eq('id', ticketIdParam)
          .single();
        
        if (error) {
          console.error("Booking fetch error:", error);
          throw error;
        }

        if (data) {
          setSeatSelectionTicket({
            id: data.id,
            operator: "PO Sinar Muda",
            busType: data.armada.nama_kelas,
            departure: data.waktu_berangkat.substring(0, 5),
            arrival: "Tiba Esok",
            duration: data.rute.estimasi_waktu,
            seats: data.armada.total_kursi,
            price: `Rp ${Number(data.harga_tiket).toLocaleString('id-ID')}`,
            rawPrice: Number(data.harga_tiket),
            capacity: data.armada.total_kursi,
            seatFormat: data.armada.nama_kelas.includes('President') ? "1 - 1" : "2 - 2",
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDB(false);
      }
    }
    fetchJadwal();
  }, [ticketIdParam]);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showDetailKursi, setShowDetailKursi] = useState(false);
  const [activeDeck, setActiveDeck] = useState("bawah"); // "bawah" | "atas"
  const [step, setStep] = useState("seat"); // 'seat' | 'pickup' | 'checkout' | 'success'
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [showWaNotif, setShowWaNotif] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  // State untuk data pelanggan
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // State untuk kursi yang sudah dipesan orang lain { seatNumber: 'L' | 'P' }
  const [bookedSeatsMap, setBookedSeatsMap] = useState({});
  // State untuk gender per kursi yang dipilih user { seatId: 'Laki-Laki' | 'Perempuan' }
  const [seatGenders, setSeatGenders] = useState({});

  // Fetch kursi yang sudah dipesan dari Supabase
  useEffect(() => {
    if (!ticketIdParam) return;
    async function fetchBookedSeats() {
      try {
        const { data, error } = await supabase
          .from('booked_seats')
          .select('nomor_kursi, detail_gender')
          .eq('jadwal_id', ticketIdParam);

        if (data) {
          const map = {};
          data.forEach(booking => {
            if (booking.nomor_kursi) {
              booking.nomor_kursi.forEach((seat, idx) => {
                const gender = booking.detail_gender?.[idx] || 'L';
                map[parseInt(seat)] = gender;
              });
            }
          });
          setBookedSeatsMap(map);
        }
      } catch (err) {
        console.error('Error fetching booked seats:', err);
      }
    }
    fetchBookedSeats();
  }, [ticketIdParam]);

  const pickupLocations = [
    { id: "perwakilan", name: "Perwakilan Sinar Muda", time: "19:30" },
    { id: "terminal-daya", name: "Terminal Daya", time: "20:00" },
  ];

  const toggleSeat = (id) => {
    if (selectedSeats.includes(id)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const getSeatPrice = (seatId) => {
    const standardPrice = seatSelectionTicket?.rawPrice || 0;
    const busTypeLower = seatSelectionTicket?.busType?.toLowerCase() || "";
    
    if (busTypeLower.includes("sleeper")) {
      return standardPrice;
    }
    if (busTypeLower.includes("bisnis")) {
      return standardPrice;
    }
    
    if ([1, 4, 7].includes(seatId)) return standardPrice > 0 ? standardPrice + 30000 : 230000;
    if ([2, 3, 5, 6, 8, 9].includes(seatId)) return standardPrice > 0 ? standardPrice : 200000;
    return standardPrice;
  };

  const getSeatClass = (seatId) => {
    const busTypeLower = seatSelectionTicket?.busType?.toLowerCase() || "";
    if (busTypeLower.includes("sleeper")) return "SLEEPER";
    if (busTypeLower.includes("bisnis")) return "BISNIS";
    
    if ([1, 4, 7].includes(seatId)) return "SLEEPER";
    if ([2, 3, 5, 6, 8, 9].includes(seatId)) return "BISNIS";
    return "BISNIS";
  };

  const getTotalPrice = () => {
    if (!seatSelectionTicket || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
  };

  const formatPrice = (num) =>
    `Rp ${num.toLocaleString("id-ID").replace(/,/g, ".")}`;

  const isSleeperBus = seatSelectionTicket?.busType?.toLowerCase().includes("sleeper");

  // Define layout dynamically
  let seatRows = [];

  if (isSleeperBus) {
    if (activeDeck === "bawah") {
      seatRows = [
        { left: [1], right: [2] },
        { left: [3], right: [4] },
        { left: [5], right: [6] },
        { left: [7], right: [8] },
        { left: [9], right: [10] },
        { left: [11], right: [12] },
      ];
    } else {
      seatRows = [
        { left: [13], right: [14] },
        { left: [15], right: [16] },
        { left: [17], right: [18] },
        { left: [19], right: [20] },
        { left: [21], right: [22] },
        { left: [23], right: [24] },
      ];
    }
  } else {
    // Business bus layout (2-2 config, up to 27 or 30 seats)
    seatRows = [
      { left: [1], right: [2, 3] },      // Row 1 (1-2 layout)
      { left: [4], right: [5, 6] },      // Row 2 (1-2 layout)
      { left: [7], right: [8, 9] },      // Row 3 (1-2 layout)
      { left: [10, 11], right: [12, 13] }, // Row 4 (2-2 layout)
      { left: [14, 15], right: [16, 17] }, // Row 5 (2-2 layout)
      { left: [18, 19], right: [20, 21] }, // Row 6 (2-2 layout)
      { left: [24, 25], right: [22, 23] }, // Row 7 (2-2 layout)
      { left: [26, 27], right: [null, null] } // Row 8 (2-2 layout)
    ];
  }

  if (isLoadingDB) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Memuat data tiket...</h2>
        </div>
      </div>
    );
  }

  if (!seatSelectionTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Tiket tidak ditemukan</h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 font-semibold underline"
          >
            Kembali
          </button>
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
                if (step === "checkout") {
                  setStep("pickup");
                } else if (step === "pickup") {
                  setStep("seat");
                } else {
                  router.back();
                }
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors -ml-2"
            >
              <span className="material-symbols-outlined text-[24px] text-gray-700">
                arrow_back
              </span>
            </button>
            <div className="flex flex-col">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                {step === "checkout"
                  ? "Detail Pemesanan"
                  : step === "pickup"
                    ? "Pilih Tempat Naik"
                    : step === "success"
                      ? "Pembayaran Berhasil"
                      : "Pilih Kursi"}
              </h3>
              <span className="text-xs text-gray-500 font-medium">
                {seatSelectionTicket.operator} • {seatSelectionTicket.busType}
              </span>
            </div>
          </div>
          <HeaderDropdown />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 w-full md:max-w-md bg-blue-50 relative flex flex-col mx-auto">
        {step === "seat" && (
          <SeatConfigContext.Provider value={{ busType: seatSelectionTicket?.busType, capacity: seatSelectionTicket?.capacity }}>
            {/* Scrollable Content (Seat Selection) */}
            <div className="flex-1 overflow-y-auto pb-28 hide-scrollbar flex flex-col items-center">
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-4 px-4 bg-blue-50/95 backdrop-blur-sm sticky top-0 w-full z-10">
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    armrestFill="#cbd5e1"
                    isSleeper={isSleeperBus}
                  />
                  <span className="text-[10px] font-medium text-gray-500">
                    Laki - Laki
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon
                    fill="#fbcfe8"
                    stroke="#f472b6"
                    armrestFill="#f9a8d4"
                    isSleeper={isSleeperBus}
                  />
                  <span className="text-[10px] font-medium text-gray-500">
                    Perempuan
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon
                    fill="#ffffff"
                    stroke="#d1d5db"
                    armrestFill="#f3f4f6"
                    isSleeper={isSleeperBus}
                  />
                  <span className="text-[10px] font-medium text-gray-500">
                    Tersedia
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LegendSeatIcon
                    fill="#4b5563"
                    stroke="#4b5563"
                    armrestFill="#374151"
                    isSleeper={isSleeperBus}
                  />
                  <span className="text-[10px] font-medium text-gray-500">
                    Dipilih
                  </span>
                </div>
                {/* Hanya tampilkan info kasur tambahan jika busnya tipe campuran (Combi) dan bukan murni Sleeper */}
                {!isSleeperBus && [1, 4, 7].some(id => getSeatClass(id) === "SLEEPER") && (
                  <div className="flex items-center gap-1.5">
                    <LegendSeatIcon
                      fill="#ffffff"
                      stroke="#d1d5db"
                      armrestFill="#f3f4f6"
                      isSleeper={true}
                    />
                    <span className="text-[10px] font-medium text-gray-500">
                      Sleeper (Kasur)
                    </span>
                  </div>
                )}
              </div>

              {/* Deck Selector for Sleeper Bus */}
              {isSleeperBus && (
                <div className="flex bg-gray-100 p-1 rounded-xl gap-1 mt-4 mb-2 w-full max-w-[280px]">
                  <button
                    onClick={() => setActiveDeck("bawah")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeDeck === "bawah"
                        ? "bg-[#1f75b8] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Dek Bawah (Lantai 1)
                  </button>
                  <button
                    onClick={() => setActiveDeck("atas")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeDeck === "atas"
                        ? "bg-[#1f75b8] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Dek Atas (Lantai 2)
                  </button>
                </div>
              )}

              {/* Bus Interior Box */}
              <div className="bg-white mx-4 mt-2 rounded-t-3xl rounded-b-lg shadow-sm border border-gray-100 w-full max-w-[320px] p-6 pb-8 relative">
                {/* Front Section (Steering & Driver seat) */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 md:w-11 md:h-11 rounded flex flex-col items-center justify-between py-1 bg-[#d96704] border border-[#b45604] shadow-inner text-white">
                    <span className="text-[10px] md:text-xs font-bold leading-none self-start ml-1.5 mt-1">
                      A
                    </span>
                    <div className="w-3/4 h-2 rounded-sm border border-white/40 bg-white/30 mb-0.5"></div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                    <span className="material-symbols-outlined text-[20px] font-light">
                      sports_motorsports
                    </span>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="flex flex-col gap-4">
                  {seatRows.map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      {/* Left Column */}
                      <div className="flex gap-2">
                        {row.left.map((seatId) => {
                          if (seatId === null) return <div key={`empty-l-${idx}`} className="w-10 h-10 md:w-11 md:h-11 invisible shrink-0" />;
                          return (
                            <SeatBtn
                              key={seatId}
                              id={seatId}
                              selected={selectedSeats.includes(seatId)}
                              toggle={() => toggleSeat(seatId)}
                              bookedGender={bookedSeatsMap[seatId]}
                            />
                          );
                        })}
                        {/* Spacing alignment for 1-seat columns in 2-2 layout */}
                        {!isSleeperBus && row.left.length === 1 && (
                          <div className="w-10 md:w-11 shrink-0" />
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="flex gap-2">
                        {row.right.map((seatId) => {
                          if (seatId === null) return <div key={`empty-r-${idx}`} className="w-10 h-10 md:w-11 md:h-11 invisible shrink-0" />;
                          return (
                            <SeatBtn
                              key={seatId}
                              id={seatId}
                              selected={selectedSeats.includes(seatId)}
                              toggle={() => toggleSeat(seatId)}
                              bookedGender={bookedSeatsMap[seatId]}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail Kursi Expandable Sheet */}
            {showDetailKursi && selectedSeats.length > 0 && (
              <div className="absolute bottom-[72px] left-0 w-full bg-white border-t border-gray-200 shadow-[0_-8px_25px_-5px_rgba(0,0,0,0.1)] rounded-t-2xl z-30 animate-in slide-in-from-bottom duration-200 max-h-[50vh] flex flex-col">
                {/* Detail Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                  <h4 className="font-bold text-base text-gray-900">
                    Detail Kursi
                  </h4>
                  <button
                    onClick={() => setShowDetailKursi(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">
                      close
                    </span>
                  </button>
                </div>

                {/* Detail Content */}
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  <h5 className="font-bold text-sm text-gray-900 mb-3">
                    No Kursi
                  </h5>
                  <div className="flex flex-col gap-3">
                    {selectedSeats.map((seatId) => (
                      <div
                        key={seatId}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-[#1f75b8] font-medium">
                          No {seatId} {getSeatClass(seatId)}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">
                          {formatPrice(getSeatPrice(seatId))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:p-5 flex justify-between items-center z-20">
              <div className="flex flex-col">
                <span className="font-bold text-[#1f75b8] text-lg md:text-xl leading-none">
                  {selectedSeats.length > 0
                    ? formatPrice(getTotalPrice())
                    : "-"}
                </span>
                {selectedSeats.length > 0 && (
                  <button
                    onClick={() => setShowDetailKursi(!showDetailKursi)}
                    className="flex items-center gap-0.5 mt-1 group"
                  >
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedSeats.length} Penumpang
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] text-gray-400 transition-transform ${showDetailKursi ? "rotate-180" : ""}`}
                    >
                      expand_less
                    </span>
                  </button>
                )}
              </div>
              <button
                disabled={selectedSeats.length === 0}
                onClick={() => {
                  setShowDetailKursi(false);
                  setStep("pickup");
                }}
                className={`font-bold py-3 px-8 rounded-xl transition-all text-sm md:text-base ${
                  selectedSeats.length > 0
                    ? "bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </SeatConfigContext.Provider>
        )}

        {step === "pickup" && (
          <>
            {/* Pickup Location Selection */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                  <h4 className="font-bold text-base text-center text-[#1f75b8]">
                    Pilih Tempat Naik
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {pickupLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedPickup(loc.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                        selectedPickup === loc.id
                          ? "bg-blue-50/60"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selectedPickup === loc.id
                            ? "border-[#a3d1ff]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedPickup === loc.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#a3d1ff]"></div>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            selectedPickup === loc.id
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {loc.name}
                        </span>
                        <span className="text-xs text-[#1f75b8] font-bold">
                          {loc.time} WITA
                        </span>
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
                <span className="text-xs text-gray-500 font-medium mt-1">
                  {selectedSeats.length} Penumpang
                </span>
              </div>
              <button
                disabled={!selectedPickup}
                onClick={() => {
                  setStep("checkout");
                }}
                className={`font-bold py-3 px-8 rounded-xl transition-all text-sm md:text-base ${
                  selectedPickup
                    ? "bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Lanjutkan
              </button>
            </div>
          </>
        )}

        {step === "checkout" && (
          <>
            {/* Checkout Form */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-28">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <span className="material-symbols-outlined text-[18px]">
                      person
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-[#334155]">
                    Detail Penumpang
                  </h4>
                </div>

                <div className="flex flex-col gap-6">
                  {selectedSeats.map((seatId, idx) => (
                    <div key={seatId} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#64748b]">
                          Penumpang {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-[#64748b]">
                          No Kursi: {seatId}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-400">
                          Nama:
                        </label>
                        <input
                          type="text"
                          placeholder="Nama Penumpang"
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-gray-900">
                          Jenis Kelamin:
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${seatId}`}
                            value="Laki-Laki"
                            checked={seatGenders[seatId] !== 'Perempuan'}
                            onChange={() => setSeatGenders({ ...seatGenders, [seatId]: 'Laki-Laki' })}
                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-[#64748b]">
                            Laki - Laki
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${seatId}`}
                            value="Perempuan"
                            checked={seatGenders[seatId] === 'Perempuan'}
                            onChange={() => setSeatGenders({ ...seatGenders, [seatId]: 'Perempuan' })}
                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-[#64748b]">
                            Perempuan
                          </span>
                        </label>
                      </div>
                      {idx < selectedSeats.length - 1 && (
                        <hr className="my-2 border-gray-100" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Kontak Pemesan */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#1f75b8]">
                    <span className="material-symbols-outlined text-[18px]">contact_mail</span>
                  </div>
                  <h4 className="font-bold text-lg text-[#334155]">Data Pemesan</h4>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">Email:</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="contoh@email.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-400">No. HP / WhatsApp:</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h4 className="font-bold text-lg text-[#334155] mb-4 border-b border-gray-100 pb-3">
                  Detail Perjalanan
                </h4>
                <div className="relative pl-6 flex flex-col gap-6">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[1.5px] border-l border-dashed border-gray-300"></div>

                  <div className="flex justify-between items-start relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-[3px] border-gray-300 bg-white"></div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-700">
                        {fromParam} •{" "}
                        <span className="text-gray-500 font-medium">
                          {dateParam || "Hari Ini"}
                        </span>
                      </h5>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pickupLocations.find((l) => l.id === selectedPickup)
                          ?.name || "Perwakilan Sinar Muda"}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-gray-500">
                      {pickupLocations.find((l) => l.id === selectedPickup)
                        ?.time || seatSelectionTicket.departure}{" "}
                      WITA
                    </span>
                  </div>

                  <div className="flex justify-between items-start relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-[3px] border-gray-300 bg-white"></div>
                    <div>
                      <h5 className="font-bold text-sm text-gray-700">
                        {toParam} •{" "}
                        <span className="text-[#ef4444] font-medium">
                          Tiba Esok Hari
                        </span>
                      </h5>
                    </div>
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
                onClick={async () => {
                  setIsLoadingPayment(true);
                  
                  // Generate random booking code
                  const randomCode = 'SMR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                  
                  const { error } = await supabase.from('pemesanan').insert({
                    kode_booking: randomCode,
                    jadwal_id: seatSelectionTicket.id,
                    nama_pelanggan: customerEmail.trim().split('@')[0] || 'Pelanggan',
                    email_pelanggan: customerEmail.trim(),
                    telepon_pelanggan: customerPhone.trim(),
                    nomor_kursi: selectedSeats.map(String),
                    detail_gender: selectedSeats.map(id => seatGenders[id] === 'Perempuan' ? 'P' : 'L'),
                    titik_naik: pickupLocations.find(l => l.id === selectedPickup)?.name || "Terminal Daya",
                    total_harga: getTotalPrice(),
                    status: "Lunas"
                  });

                  setIsLoadingPayment(false);

                  if (error) {
                    alert("Gagal melakukan pemesanan: " + error.message);
                    return;
                  }

                  // Simpan kode booking ke localStorage agar muncul di halaman Tiketku
                  if (typeof window !== "undefined") {
                    const existingBookings = JSON.parse(localStorage.getItem("my_bookings") || "[]");
                    if (!existingBookings.includes(randomCode)) {
                      existingBookings.push(randomCode);
                      localStorage.setItem("my_bookings", JSON.stringify(existingBookings));
                    }
                  }

                  setStep("success");
                  // Trigger WA Notification after 1.5 seconds
                  setTimeout(() => {
                    setShowWaNotif(true);
                    // Auto hide after 5 seconds
                    setTimeout(() => setShowWaNotif(false), 5000);
                  }, 1500);
                }}
                disabled={isLoadingPayment}
                className="font-bold py-3 px-10 rounded-xl transition-all text-sm md:text-base bg-[#a3d1ff] text-white hover:bg-sky-600 active:scale-95 shadow-md flex items-center justify-center min-w-[120px]"
              >
                {isLoadingPayment ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Bayar"
                )}
              </button>
            </div>
          </>
        )}

        {/* --- SUCCESS STEP & WHATSAPP NOTIFICATION SIMULATION --- */}
        {step === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 shadow-inner relative">
              <span className="material-symbols-outlined text-[50px] animate-bounce">check_circle</span>
              <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Hore! Tiket Berhasil</h2>
            <p className="text-gray-500 text-center mb-8 max-w-[280px]">
              Pembayaran sebesar {formatPrice(getTotalPrice())} telah kami terima. Kursi {selectedSeats.join(", ")} resmi menjadi milik Anda.
            </p>

            <button
              onClick={() => router.push("/tickets")}
              className="w-full font-bold py-4 rounded-xl text-white bg-[#1f75b8] hover:bg-[#165a8e] active:scale-95 transition-all shadow-md mb-3"
            >
              Lihat Tiket Saya
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full font-bold py-4 rounded-xl text-gray-500 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        )}

        {/* WhatsApp Fake Notification Toast */}
        {showWaNotif && (
          <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[999] bg-[#25D366] text-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(37,211,102,0.4)] flex gap-3 animate-in slide-in-from-top-10 fade-in duration-500 cursor-pointer hover:bg-[#20bd5a] transition-colors" onClick={() => setShowWaNotif(false)}>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white">chat</span>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-bold text-sm">WhatsApp • PO Sinar Muda</span>
                <span className="text-xs text-white/80">Baru saja</span>
              </div>
              <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">
                Halo! Tiket Anda (Kode: BK-SMR-{Math.floor(Math.random() * 1000)}) untuk rute {fromParam} → {toParam} telah terkonfirmasi. Terima kasih!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-[#a3d1ff] text-white">
          Loading...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
