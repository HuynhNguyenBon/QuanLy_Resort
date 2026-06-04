import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// HOME
import enHome from "./i18n/locales/en/home.json";
import viHome from "./i18n/locales/vi/home.json";
import jaHome from "./i18n/locales/ja/home.json";

// ADMIN
import enAdmin from "./i18n/locales/en/admin.json";
import viAdmin from "./i18n/locales/vi/admin.json";
import jaAdmin from "./i18n/locales/ja/admin.json";

// ROOMS
import enRooms from "./i18n/locales/en/rooms.json";
import viRooms from "./i18n/locales/vi/rooms.json";
import jaRooms from "./i18n/locales/ja/rooms.json";

// COMMON
import enCommon from "./i18n/locales/en/common.json";
import viCommon from "./i18n/locales/vi/common.json";
import jaCommon from "./i18n/locales/ja/common.json";

// NAVBAR
import enNavbar from "./i18n/locales/en/navbar.json";
import viNavbar from "./i18n/locales/vi/navbar.json";
import jaNavbar from "./i18n/locales/ja/navbar.json";

// AUTH
import enAuth from "./i18n/locales/en/auth.json";
import viAuth from "./i18n/locales/vi/auth.json";
import jaAuth from "./i18n/locales/ja/auth.json";

// PROFILE
import enProfile from "./i18n/locales/en/profile.json";
import viProfile from "./i18n/locales/vi/profile.json";
import jaProfile from "./i18n/locales/ja/profile.json";

// FOOTER
import enFooter from "./i18n/locales/en/footer.json";
import viFooter from "./i18n/locales/vi/footer.json";
import jaFooter from "./i18n/locales/ja/footer.json";

//PAYMENT
import enPayment from "./i18n/locales/en/payment.json";
import viPayment from "./i18n/locales/vi/payment.json";
import jaPayment from "./i18n/locales/ja/payment.json";

//SERVICES
import enServices from "./i18n/locales/en/services.json";
import viServices from "./i18n/locales/vi/services.json";
import jaServices from "./i18n/locales/ja/services.json";

// CONTACT
import enContact from "./i18n/locales/en/contact.json";
import viContact from "./i18n/locales/vi/contact.json";
import jaContact from "./i18n/locales/ja/contact.json";

// PROMO
import enPromo from "./i18n/locales/en/promo.json";
import viPromo from "./i18n/locales/vi/promo.json";
import jaPromo from "./i18n/locales/ja/promo.json";

// FIND BOOKING
import enFindBooking from "./i18n/locales/en/findBooking.json";
import viFindBooking from "./i18n/locales/vi/findBooking.json";
import jaFindBooking from "./i18n/locales/ja/findBooking.json";

// GALLERY
import enGallery from "./i18n/locales/en/gallery.json";
import viGallery from "./i18n/locales/vi/gallery.json";
import jaGallery from "./i18n/locales/ja/gallery.json";

// CHAT
import enChat from "./i18n/locales/en/chat.json";
import viChat from "./i18n/locales/vi/chat.json";
import jaChat from "./i18n/locales/ja/chat.json";

// ADMIN PANEL
import enAdminPanel from "./i18n/locales/en/adminPanel.json";
import viAdminPanel from "./i18n/locales/vi/adminPanel.json";
import jaAdminPanel from "./i18n/locales/ja/adminPanel.json";

i18n
  .use(LanguageDetector) // Tự động nhận diện ngôn ngữ máy tính khách
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: enNavbar,
        auth: enAuth,
        profile: enProfile,
        footer: enFooter,
        home: enHome,
        admin: enAdmin,
        rooms: enRooms,
        common: enCommon,
        payment: enPayment,
        services: enServices,
        contact: enContact,
        promo: enPromo,
        findBooking: enFindBooking,
        gallery: enGallery,
        chat: enChat,
        adminPanel: enAdminPanel,
      },
      vi: {
        navbar: viNavbar,
        auth: viAuth,
        profile: viProfile,
        footer: viFooter,
        home: viHome,
        admin: viAdmin,
        rooms: viRooms,
        common: viCommon,
        payment: viPayment,
        services: viServices,
        contact: viContact,
        promo: viPromo,
        findBooking: viFindBooking,
        gallery: viGallery,
        chat: viChat,
        adminPanel: viAdminPanel,
      },
      ja: {
        navbar: jaNavbar,
        auth: jaAuth,
        profile: jaProfile,
        footer: jaFooter,
        home: jaHome,
        admin: jaAdmin,
        rooms: jaRooms,
        common: jaCommon,
        payment: jaPayment,
        services: jaServices,
        contact: jaContact,
        promo: jaPromo,
        findBooking: jaFindBooking,
        gallery: jaGallery,
        chat: jaChat,
        adminPanel: jaAdminPanel,
      },
    },
    fallbackLng: "en",
    ns: [
      "navbar",
      "auth",
      "profile",
      "footer",
      "home",
      "admin",
      "rooms",
      "common",
      "payment",
      "services",
      "contact",
      "promo",
      "findBooking",
      "gallery",
      "chat",
      "adminPanel",
    ],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
