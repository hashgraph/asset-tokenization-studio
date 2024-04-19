import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./en";

declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    defaultNS: "globals",
    detection: {
      order: ["localStorage", "navigator"],
    },
    lng: "en",
    fallbackLng: "en",
    returnNull: false,
    returnObjects: true,
    resources: {
      en,
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
