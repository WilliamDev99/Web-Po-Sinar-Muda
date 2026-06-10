"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import HeaderDropdown from "@/components/HeaderDropdown";

export default function MyTicketsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("aktif");

  // Dummy ticket data
  const activeTickets = [
    {
      id: "BK-20260610-089",
      route: "Makassar → Toraja",
      date: "10 Juni 2026",
      time: "20:00 WITA",
      passengers: ["Reitama", "Andi Saputra"],
      seats: ["A1", "A2"],
      busType: "Executive Class",
      operator: "PO Sinar Muda",
      status: t("waitingDeparture"),
    },
  ];

  const pastTickets = [
    {
      id: "BK-20260528-001",
      route: "Makassar → Toraja",
      date: "28 Mei 2026",
      time: "19:00 WITA",
      passengers: ["Reitama"],
      seats: ["A1"],
      busType: "VIP Class",
      operator: "PO Sinar Muda",
      status: t("completedTickets"),
    },
    {
      id: "BK-20260520-003",
      route: "Toraja → Makassar",
      date: "20 Mei 2026",
      time: "08:00 WITA",
      passengers: ["Reitama"],
      seats: ["B3"],
      busType: "Executive Class",
      operator: "PO Sinar Muda",
      status: t("completedTickets"),
    },
  ];

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
          {tickets.length > 0 ? (
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
                  <button className="text-[#1f75b8] font-bold text-sm flex items-center gap-1 hover:text-[#19619c] transition-colors">
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
    </>
  );
}
