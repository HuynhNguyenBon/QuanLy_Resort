import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./i18n/locales/en.json";
import vi from "./i18n/locales/vi.json";
import jp from "./i18n/locales/jp.json";

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
    ],

    defaultNS: "navbar",
      en: en,
      vi: vi,
      jp: jp,
    },
    fallbackLng: "en", // Nếu lỗi thì hiện tiếng Anh
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
