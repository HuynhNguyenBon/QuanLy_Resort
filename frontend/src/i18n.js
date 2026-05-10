import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        navbar: enNavbar,
        auth: enAuth,
        profile: enProfile,
        footer: enFooter,
      },

      vi: {
        navbar: viNavbar,
        auth: viAuth,
        profile: viProfile,
        footer: viFooter,
      },

      jp: {
        navbar: jpNavbar,
        auth: jpAuth,
        profile: jpProfile,
        footer: jpFooter,
      },
    },

    fallbackLng: "en",

    ns: ["navbar", "auth", "profile", "footer"],

    defaultNS: "navbar",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
