"use client";
import enTranslation from "./en.json";
import urTranslation from "./ur.json";
import hiTranslation from "./hi.json";
export const getTranslationByLocale = (locale) => {
  switch (locale) {
    case "en-new":
      return enTranslation;
    case "ur":
      return urTranslation;
    case "hi":
      return hiTranslation;
    default:
      return enTranslation;
  }
};
