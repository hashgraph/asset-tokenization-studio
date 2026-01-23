// SPDX-License-Identifier: Apache-2.0

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "./locales/en";
import assetsTranslation from "./locales/assets";
import routesTranslation from "./locales/routes";
import distributionsTranslation from "./locales/distributions";
import importAssetTranslation from "./locales/importAsset";
import distributionsDetailsTranslation from "./locales/distributionsDetails";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
        routes: routesTranslation,
        assets: assetsTranslation,
        distributions: distributionsTranslation,
        importAsset: importAssetTranslation,
        distributionsDetails: distributionsDetailsTranslation,
      },
    },
    fallbackLng: "en",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
