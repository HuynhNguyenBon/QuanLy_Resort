import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./i18n/locales/en.json";
import vi from "./i18n/locales/vi.json";
import ja from "./i18n/locales/ja.json";

i18n
  .use(LanguageDetector) // Tự động nhận diện ngôn ngữ máy tính khách
  .use(initReactI18next)
  .init({
    resources: {
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
