import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enUSCommon from "./locales/en-US/common.json";
import enUsUrl from "./locales/en-US/url.json";
import zhCNCommon from "./locales/zh-CN/common.json";
import zhCnUrl from "./locales/zh-CN/url.json";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ns: ["common", "url"],
    resources: {
      "zh-CN": {
        common: zhCNCommon,
        url: zhCnUrl,
      },
      "en-US": {
        common: enUSCommon,
        url: enUsUrl,
      },
    },
    fallbackLng: "zh-CN",
    lng: "zh-CN",
  });

export default i18n;
