"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import HeaderDropdown from "@/components/HeaderDropdown";
import { supabase } from "@/utils/supabase";

export default function MyTicketsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("aktif");
  const [dbTickets, setDbTickets] = useState([]);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackCode, setTrackCode] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  // Helper to format Indonesian date
  const formatIndonesianDate = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Fetch tickets on mount
  useEffect(() => {
    async function loadTickets() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const codes = JSON.parse(localStorage.getItem("my_bookings") || "[]");
        const email = session?.user?.email;

        if (!email && codes.length === 0) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .rpc('get_bookings_by_codes', {
            p_booking_codes: codes,
            p_email: email || null
          });

        if (error) throw error;
        if (data) {
          setDbTickets(data);
          
          // Optionally backport newly discovered database booking codes to localStorage
          const updatedCodes = [...codes];
          let updated = false;
          data.forEach(t => {
            if (!updatedCodes.includes(t.kode_booking)) {
              updatedCodes.push(t.kode_booking);
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem("my_bookings", JSON.stringify(updatedCodes));
          }
        }
      } catch (err) {
        console.error("Error loading tickets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  const handleTrackTicket = async (e) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    setIsTracking(true);
    try {
      const { data, error } = await supabase
        .rpc('get_bookings_by_codes', {
          p_booking_codes: [trackCode.trim().toUpperCase()],
          p_email: null
        });

      if (error) {
        alert("Terjadi kesalahan saat melacak tiket.");
        return;
      }

      const bookingData = data && data.length > 0 ? data[0] : null;

      if (!bookingData) {
        alert("Tiket tidak ditemukan. Silakan periksa kembali kode booking Anda.");
        return;
      }

      if (bookingData) {
        // Add to local state if not already exists
        if (!dbTickets.some(t => t.kode_booking === bookingData.kode_booking)) {
          setDbTickets([bookingData, ...dbTickets]);
        }

        // Save to localStorage
        const codes = JSON.parse(localStorage.getItem("my_bookings") || "[]");
        if (!codes.includes(bookingData.kode_booking)) {
          codes.push(bookingData.kode_booking);
          localStorage.setItem("my_bookings", JSON.stringify(codes));
        }

        alert("Tiket berhasil ditemukan dan ditambahkan ke daftar Anda!");
        setTrackCode("");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat melacak tiket.");
    } finally {
      setIsTracking(false);
    }
  };

  const formatPrice = (num) =>
    `Rp ${Number(num).toLocaleString("id-ID").replace(/,/g, ".")}`;

  const todayStr = new Date().toISOString().split('T')[0];

  // Map database tickets to UI format
  const mappedTickets = dbTickets.map(ticket => {
    const isPast = ticket.jadwal.tanggal_berangkat < todayStr;
    let statusText = "";
    if (ticket.status === "Dibatalkan") {
      statusText = "Dibatalkan";
    } else if (isPast) {
      statusText = t("completedTickets"); // "Selesai"
    } else {
      statusText = t("waitingDeparture"); // "Menunggu Keberangkatan"
    }

    return {
      id: ticket.kode_booking,
      route: `${ticket.jadwal.rute.kota_asal} → ${ticket.jadwal.rute.kota_tujuan}`,
      date: formatIndonesianDate(ticket.jadwal.tanggal_berangkat),
      time: `${ticket.jadwal.waktu_berangkat.substring(0, 5)} WITA`,
      passengers: Array(ticket.nomor_kursi.length).fill(ticket.nama_pelanggan),
      seats: ticket.nomor_kursi,
      busType: ticket.jadwal.armada.nama_kelas,
      operator: "PO Sinar Muda",
      status: statusText,
      pickup: ticket.titik_naik,
      price: formatPrice(ticket.total_harga)
    };
  });

  const activeTickets = mappedTickets.filter(tk => tk.status === t("waitingDeparture"));
  const pastTickets = mappedTickets.filter(tk => tk.status === t("completedTickets") || tk.status === "Dibatalkan");

  const tickets = activeTab === "aktif" ? activeTickets : pastTickets;

  return (
    <>
      {/* Header (Desktop) */}
      <header className="fixed top-0 w-full z-50 bg-[#a3d1ff]/85 backdrop-blur-md border-b border-white/10 shadow-sm flex items-center px-4 md:px-10 h-24 transition-all justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/"
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined font-bold text-[24px]">
              arrow_back
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 md:gap-4 group ml-1 md:ml-0"
          >
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-[12px] md:rounded-[18px] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)] group-hover:-translate-y-0.5 transition-all overflow-hidden border-2 border-white/60">
              <img
                src="/logo/sinar-muda_logo.jpeg"
                alt="Bus Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-black text-[#1f75b8] text-[17px] md:text-[26px] tracking-wide leading-none drop-shadow-sm"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                PO SINAR MUDA
              </span>
              <span className="font-bold text-[#1f75b8]/90 text-[8px] md:text-[11px] tracking-[0.28em] mt-1 md:mt-1.5 drop-shadow-sm">
                TRANSPORTATION
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            {t("navHome")}
          </Link>
          <Link
            href="/tickets"
            className="text-[#1f75b8] font-semibold flex items-center gap-2 hover:text-[#1f75b8]/80 transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              confirmation_number
            </span>
            {t("navTickets")}
          </Link>
          <Link
            href="/profile"
            className="text-[#1f75b8]/80 hover:text-[#1f75b8] font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              person
            </span>
            {t("navProfile")}
          </Link>
        </nav>

        {/* Dropdown Menu (Visible on all sizes) */}
        <div className="md:hidden ml-auto"></div>
        <HeaderDropdown />
      </header>

      {/* Background Gradient */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[150%] md:w-[100%] h-[500px] bg-gradient-to-b from-white/10 to-transparent rounded-[100%] pointer-events-none blur-3xl"></div>

      <main className="pt-32 pb-32 md:pb-16 px-4 md:px-10 max-w-lg md:max-w-4xl mx-auto relative z-10 flex flex-col gap-6">
        {/* Header Title */}
        <h2 className="text-3xl font-bold text-white text-center md:text-left mb-2 md:mb-6 drop-shadow-sm">
          {t("myTicketsTitle")}
        </h2>

        {/* Track Ticket Form */}
        <form onSubmit={handleTrackTicket} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/40 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={trackCode}
              onChange={(e) => setTrackCode(e.target.value)}
              placeholder="Lacak tiket dengan Kode Booking (SMR-XXXXXX)"
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={isTracking}
            className="bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            {isTracking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                Lacak Tiket
              </>
            )}
          </button>
        </form>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-white/40 flex">
          <button
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeTab === "aktif" ? "bg-white text-[#1f75b8] shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t("activeTickets")}
          </button>
          <button
            onClick={() => setActiveTab("selesai")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 ${activeTab === "selesai" ? "bg-white text-[#1f75b8] shadow-md" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t("completedTickets")}
          </button>
        </div>

        {/* Tickets List */}
        <div className="flex flex-col gap-5 mt-2">
          {loading ? (
            <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 p-16 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#1f75b8] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-semibold">Memuat tiket Anda...</p>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300"
              >
                {/* Header (Status & Code) */}
                <div className="bg-gradient-to-r from-[#1f75b8] to-[#60a5fa] p-4 md:p-5 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">
                      {activeTab === "aktif" ? "schedule" : "check_circle"}
                    </span>
                    <span className="font-bold text-sm">{ticket.status}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">
                      {t("bookingCode")}
                    </span>
                    <span className="font-mono font-bold text-base md:text-lg">
                      {ticket.id}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-5">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
                        {t("travelRoute")}
                      </span>
                      <span className="font-bold text-gray-800 text-lg md:text-xl">
                        {ticket.route}
                      </span>
                      <span className="text-sm font-semibold text-[#1f75b8] mt-0.5">
                        {ticket.busType}
                      </span>
                    </div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1f75b8]/10 flex items-center justify-center text-[#1f75b8] shrink-0">
                      <span className="material-symbols-outlined text-[24px] md:text-[32px]">
                        directions_bus
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-gray-400 font-medium uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          calendar_today
                        </span>{" "}
                        {t("dateLabel")}
                      </span>
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        {ticket.date}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-gray-400 font-medium uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          schedule
                        </span>{" "}
                        {t("timeLabel")}
                      </span>
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        {ticket.time}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-gray-400 font-medium uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          group
                        </span>{" "}
                        {t("passengersLabel")}
                      </span>
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        {ticket.passengers.length} {t("people")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-gray-400 font-medium uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          event_seat
                        </span>{" "}
                        {t("seat")}
                      </span>
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        {ticket.seats.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-gray-50 flex justify-end items-center border-t border-gray-100">
                  <button
                    onClick={() => setSelectedTicketDetails(ticket)}
                    className="text-[#1f75b8] font-bold text-sm flex items-center gap-1 hover:text-[#19619c] transition-colors"
                  >
                    {t("viewDetails")}{" "}
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                <span className="material-symbols-outlined text-[40px]">
                  confirmation_number
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t("noTickets")}{" "}
                {activeTab === "aktif"
                  ? t("activeTickets")
                  : t("completedTickets")}
              </h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                {t("youHaveNo")}{" "}
                {activeTab === "aktif"
                  ? t("activeTickets")
                  : t("completedTickets")}
                . {t("letsFindTickets")}
              </p>
              <Link
                href="/"
                className="bg-[#1f75b8] hover:bg-[#19619c] text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
              >
                {t("searchTickets")}
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar with Glassmorphism (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex justify-around items-center h-20 px-6 pb-2">
        {/* Home */}
        <Link
          className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300"
          href="/"
        >
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">
            home
          </span>
          <span className="text-[11px] font-medium">{t("navHome")}</span>
        </Link>
        {/* My Bookings (Active) */}
        <Link
          className="flex flex-col items-center justify-center gap-1 bg-[#a3d1ff]/10 text-[#1f75b8] rounded-2xl px-5 py-2 hover:bg-[#a3d1ff]/20 active:scale-95 transition-all duration-300"
          href="/tickets"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            confirmation_number
          </span>
          <span className="text-[11px] font-bold">{t("navTickets")}</span>
        </Link>
        {/* Profile */}
        <Link
          className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-700 px-5 py-2 active:scale-95 transition-all duration-300"
          href="/profile"
        >
          <span className="material-symbols-outlined transition-transform hover:-translate-y-1 duration-300">
            person
          </span>
          <span className="text-[11px] font-medium">{t("navProfile")}</span>
        </Link>
      </nav>

      {/* Modal Detail Tiket */}
      {selectedTicketDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Boarding Pass Header */}
            <div className="bg-gradient-to-r from-[#1f75b8] to-[#60a5fa] p-6 text-white text-center relative shrink-0">
              <button
                onClick={() => setSelectedTicketDetails(null)}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 overflow-hidden shadow-md">
                <img
                  src="/logo/sinar-muda_logo.jpeg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-black text-lg tracking-wide">PO SINAR MUDA</h3>
              <p className="text-[10px] text-white/80 uppercase tracking-widest mt-0.5">Boarding Pass / E-Ticket</p>
            </div>

            {/* Ticket Info Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
              
              {/* Route segment */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Asal</span>
                  <span className="font-extrabold text-gray-800 text-base">{selectedTicketDetails.route.split(" → ")[0]}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[#1f75b8] text-[24px]">directions_bus</span>
                  <div className="w-16 h-[2px] bg-dashed border-t border-dashed border-gray-300"></div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Tujuan</span>
                  <span className="font-extrabold text-gray-800 text-base">{selectedTicketDetails.route.split(" → ")[1]}</span>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-gray-100 pb-5 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Kode Booking</span>
                  <span className="font-mono font-bold text-gray-800 text-base">{selectedTicketDetails.id}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Status Tiket</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedTicketDetails.status === "Dibatalkan"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {selectedTicketDetails.status}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Tanggal Keberangkatan</span>
                  <span className="font-bold text-gray-800">{selectedTicketDetails.date}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Jam Keberangkatan</span>
                  <span className="font-bold text-gray-800">{selectedTicketDetails.time}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Armada / Kelas</span>
                  <span className="font-bold text-gray-800">{selectedTicketDetails.busType}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-0.5">Nomor Kursi</span>
                  <span className="font-extrabold text-[#1f75b8] text-base">{selectedTicketDetails.seats.join(", ")}</span>
                </div>
              </div>

              {/* Passengers & Contact details */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-1.5">Nama Penumpang</span>
                  <span className="font-bold text-gray-700 block">{selectedTicketDetails.passengers[0]}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium mb-1">Titik Naik (Pickup Point)</span>
                  <span className="font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">location_on</span>
                    {selectedTicketDetails.pickup || "Perwakilan Sinar Muda"}
                  </span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-500">Total Pembayaran</span>
                <span className="font-black text-gray-800 text-lg">{selectedTicketDetails.price}</span>
              </div>

              {/* Barcode Simulation */}
              <div className="flex flex-col items-center mt-2 pb-2">
                <div className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                  {/* Barcode lines helper */}
                  <div className="w-5/6 h-full flex justify-between opacity-80">
                    {Array.from({ length: 42 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full bg-gray-800"
                        style={{
                          width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                          opacity: i % 5 === 0 ? 0.3 : 1
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-gray-400 mt-2 uppercase tracking-widest">{selectedTicketDetails.id}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setSelectedTicketDetails(null)}
                className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl text-sm transition-all hover:bg-gray-100 active:scale-95"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-[#1f75b8] text-white font-bold rounded-xl text-sm transition-all hover:bg-[#165a8e] active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Cetak Tiket
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
