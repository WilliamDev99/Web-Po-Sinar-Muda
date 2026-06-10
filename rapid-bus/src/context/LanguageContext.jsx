"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

const dictionary = {
  id: {
    // Navigation
    navHome: "Beranda",
    navTickets: "Tiketku",
    navProfile: "Profil",
    
    // Home Page
    heroQuestion: "Mau ke mana hari ini?",
    heroSubtitle: "Pesan tiket perjalanan antar kota Anda dengan cepat dan mudah.",
    fromCity: "Kota Asal",
    phFromCity: "Masukkan kota asal",
    toCity: "Kota Tujuan",
    phToCity: "Masukkan kota tujuan",
    date: "Tanggal",
    search: "Cari",
    recentSearches: "Pencarian Terakhir",
    clearAll: "Hapus Semua",
    today1Passenger: "Hari Ini • 1 Penumpang",
    followUs: "Ikuti Media Sosial Kami",

    // Header Dropdown
    aboutUs: "Tentang Kami",
    contactAdmin: "Contact (No Admin)",
    terms: "Syarat dan Ketentuan",
    privacyPolicy: "Privacy Policy",

    // Tickets Page
    myTicketsTitle: "Tiketku",
    activeTickets: "Tiket Aktif",
    completedTickets: "Selesai",
    bookingCode: "Kode Booking",
    travelRoute: "Rute Perjalanan",
    dateLabel: "Tanggal",
    timeLabel: "Jam",
    passengersLabel: "Penumpang",
    people: "Orang",
    viewDetails: "Lihat Detail",
    noTickets: "Belum ada tiket",
    youHaveNo: "Anda belum memiliki tiket yang",
    letsFindTickets: "Yuk, cari tiket untuk perjalanan Anda berikutnya!",
    searchTickets: "Cari Tiket",
    waitingDeparture: "Menunggu Keberangkatan",

    // Profile Page
    title: "Profil Saya",
    menuAccount: "Informasi Akun",
    menuAccountDesc: "Ubah data diri dan kata sandi",
    menuHistory: "Riwayat Transaksi",
    menuHistoryDesc: "Lihat semua transaksi sebelumnya",
    menuHelp: "Pusat Bantuan",
    menuHelpDesc: "Hubungi customer service kami",
    menuSettings: "Pengaturan",
    menuSettingsDesc: "Pengaturan notifikasi dan bahasa",
    logout: "Keluar",
    
    // Modals & Form
    fullName: "Nama Lengkap",
    email: "Email",
    phone: "Nomor HP",
    changePassword: "Ubah Kata Sandi",
    oldPassword: "Kata Sandi Lama",
    newPassword: "Kata Sandi Baru",
    phOldPassword: "Masukkan kata sandi lama",
    phNewPassword: "Masukkan kata sandi baru",
    saveChanges: "Simpan Perubahan",
    saveSuccess: "Berhasil disimpan!",
    
    // Transactions
    seat: "Kursi",
    trxId: "ID",
    done: "Selesai",
    cancelled: "Dibatalkan",
    
    // Help Center
    helpDesc: "Jika Anda memiliki pertanyaan atau kendala, silakan hubungi kami melalui salah satu cara di bawah ini:",
    waAdmin: "WhatsApp Admin",
    operationalHours: "Jam Operasional",
    monSat: "Senin - Sabtu",
    sunHol: "Minggu & Libur",
    
    // Settings
    notifications: "Notifikasi",
    bookingStatus: "Status Pemesanan",
    bookingStatusDesc: "Update status tiket Anda",
    departureReminder: "Pengingat Keberangkatan",
    departureReminderDesc: "Notifikasi H-1 keberangkatan",
    language: "Bahasa",
    saveSettings: "Simpan Pengaturan",
    
    // Logout Modal
    logoutConfirm: "Keluar dari Akun?",
    logoutDesc: "Anda yakin ingin keluar dari akun Anda? Anda perlu masuk kembali untuk mengakses fitur yang tersedia.",
    cancel: "Batal",
    yesLogout: "Ya, Keluar"
  },
  en: {
    // Navigation
    navHome: "Home",
    navTickets: "My Tickets",
    navProfile: "Profile",

    // Home Page
    heroQuestion: "Where to today?",
    heroSubtitle: "Book your intercity travel tickets quickly and easily.",
    fromCity: "From",
    phFromCity: "Enter origin city",
    toCity: "To",
    phToCity: "Enter destination city",
    date: "Date",
    search: "Search",
    recentSearches: "Recent Searches",
    clearAll: "Clear All",
    today1Passenger: "Today • 1 Passenger",
    followUs: "Follow Our Social Media",

    // Header Dropdown
    aboutUs: "About Us",
    contactAdmin: "Contact (No Admin)",
    terms: "Terms and Conditions",
    privacyPolicy: "Privacy Policy",

    // Tickets Page
    myTicketsTitle: "My Tickets",
    activeTickets: "Active Tickets",
    completedTickets: "Completed",
    bookingCode: "Booking Code",
    travelRoute: "Travel Route",
    dateLabel: "Date",
    timeLabel: "Time",
    passengersLabel: "Passengers",
    people: "People",
    viewDetails: "View Details",
    noTickets: "No tickets",
    youHaveNo: "You don't have any tickets that are",
    letsFindTickets: "Let's find tickets for your next trip!",
    searchTickets: "Search Tickets",
    waitingDeparture: "Waiting for Departure",
    
    // Profile Page
    title: "My Profile",
    menuAccount: "Account Information",
    menuAccountDesc: "Change personal data and password",
    menuHistory: "Transaction History",
    menuHistoryDesc: "View all previous transactions",
    menuHelp: "Help Center",
    menuHelpDesc: "Contact our customer service",
    menuSettings: "Settings",
    menuSettingsDesc: "Notification and language settings",
    logout: "Logout",
    
    // Modals & Form
    fullName: "Full Name",
    email: "Email",
    phone: "Phone Number",
    changePassword: "Change Password",
    oldPassword: "Old Password",
    newPassword: "New Password",
    phOldPassword: "Enter old password",
    phNewPassword: "Enter new password",
    saveChanges: "Save Changes",
    saveSuccess: "Saved successfully!",
    
    // Transactions
    seat: "Seat",
    trxId: "ID",
    done: "Done",
    cancelled: "Cancelled",
    
    // Help Center
    helpDesc: "If you have any questions or issues, please contact us through one of the methods below:",
    waAdmin: "WhatsApp Admin",
    operationalHours: "Operational Hours",
    monSat: "Monday - Saturday",
    sunHol: "Sunday & Holidays",
    
    // Settings
    notifications: "Notifications",
    bookingStatus: "Booking Status",
    bookingStatusDesc: "Update on your ticket status",
    departureReminder: "Departure Reminder",
    departureReminderDesc: "Notification 1 day before departure",
    language: "Language",
    saveSettings: "Save Settings",
    
    // Logout Modal
    logoutConfirm: "Logout from Account?",
    logoutDesc: "Are you sure you want to log out? You will need to log in again to access the features.",
    cancel: "Cancel",
    yesLogout: "Yes, Logout"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('id');

  useEffect(() => {
    // Load preference from local storage on client side
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const t = (key) => {
    return dictionary[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
