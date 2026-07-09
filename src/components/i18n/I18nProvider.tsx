"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  currencyLabels,
  formatConvertedPrice,
  languageCurrency,
  translate,
  type Currency,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

type I18nContextValue = {
  language: Language;
  currency: Currency;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  t: (key: TranslationKey) => string;
  price: (priceUSD: number) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLanguage(value: string | null): Language {
  return value === "tw" || value === "en" ? value : "zh";
}

function readCurrency(value: string | null): Currency {
  return value === "TWD" || value === "AUD" ? value : "CNY";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");
  const [currency, setCurrencyState] = useState<Currency>("CNY");

  useEffect(() => {
    window.queueMicrotask(() => {
      const savedLanguage = readLanguage(window.localStorage.getItem("onegoods-language"));
      const savedCurrency = window.localStorage.getItem("onegoods-currency");
      setLanguageState(savedLanguage);
      setCurrencyState(savedCurrency ? readCurrency(savedCurrency) : languageCurrency[savedLanguage]);
    });
  }, []);

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage);
    setCurrencyState(languageCurrency[nextLanguage]);
    window.localStorage.setItem("onegoods-language", nextLanguage);
    window.localStorage.setItem("onegoods-currency", languageCurrency[nextLanguage]);
  }

  function setCurrency(nextCurrency: Currency) {
    setCurrencyState(nextCurrency);
    window.localStorage.setItem("onegoods-currency", nextCurrency);
  }

  const value = useMemo<I18nContextValue>(() => ({
    language,
    currency,
    setLanguage,
    setCurrency,
    t: (key) => translate(language, key),
    price: (priceUSD) => formatConvertedPrice(priceUSD, currency),
  }), [language, currency]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}

export function T({ k }: { k: TranslationKey }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}

export function Price({ priceUSD, fallbackKey = "price.pending" }: { priceUSD?: number; fallbackKey?: TranslationKey }) {
  const { price, t } = useI18n();
  if (!priceUSD) return <>{t(fallbackKey)}</>;
  return <>{price(priceUSD)}</>;
}

export function CurrencyPrefix() {
  const { currency } = useI18n();
  return <>{currencyLabels[currency]}</>;
}
