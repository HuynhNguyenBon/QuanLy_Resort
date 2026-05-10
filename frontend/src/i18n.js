import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// HOME
import enHome from "./i18n/locales/en/home.json";
import viHome from "./i18n/locales/vi/home.json";
import jpHome from "./i18n/locales/jp/home.json";

// ADMIN
import enAdmin from "./i18n/locales/en/admin.json";
import viAdmin from "./i18n/locales/vi/admin.json";
import jpAdmin from "./i18n/locales/jp/admin.json";

// ROOMS
import enRooms from "./i18n/locales/en/rooms.json";
import viRooms from "./i18n/locales/vi/rooms.json";
import jpRooms from "./i18n/locales/jp/rooms.json";

// COMMON
import enCommon from "./i18n/locales/en/common.json";
import viCommon from "./i18n/locales/vi/common.json";
import jpCommon from "./i18n/locales/jp/common.json";

// NAVBAR
import enNavbar from "./i18n/locales/en/navbar.json";
import viNavbar from "./i18n/locales/vi/navbar.json";
import jpNavbar from "./i18n/locales/jp/navbar.json";

// AUTH
import enAuth from "./i18n/locales/en/auth.json";
import viAuth from "./i18n/locales/vi/auth.json";
import jpAuth from "./i18n/locales/jp/auth.json";

// PROFILE
import enProfile from "./i18n/locales/en/profile.json";
import viProfile from "./i18n/locales/vi/profile.json";
import jpProfile from "./i18n/locales/jp/profile.json";

// FOOTER
import enFooter from "./i18n/locales/en/footer.json";
import viFooter from "./i18n/locales/vi/footer.json";
import jpFooter from "./i18n/locales/jp/footer.json";

//PAYMENT
import enPayment from "./i18n/locales/en/payment.json";
import viPayment from "./i18n/locales/vi/payment.json";
import jpPayment from "./i18n/locales/jp/payment.json";

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
      },
      jp: {
        navbar: jpNavbar,
        auth: jpAuth,
        profile: jpProfile,
        footer: jpFooter,
        home: jpHome,
        admin: jpAdmin,
        rooms: jpRooms,
        common: jpCommon,
        payment: jpPayment,
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
    ],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
