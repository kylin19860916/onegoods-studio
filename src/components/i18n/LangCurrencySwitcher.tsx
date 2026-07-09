"use client";

import { currencies, languageLabels, languages, currencyLabels } from "@/lib/i18n";
import { useI18n } from "@/components/i18n/I18nProvider";

export function LangCurrencySwitcher() {
  const { language, currency, setLanguage, setCurrency } = useI18n();

  return (
    <div className="hidden items-center gap-1 rounded-full bg-white/62 p-1 text-xs font-bold shadow-sm lg:flex" aria-label="Language and currency switcher">
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={`rounded-full px-2.5 py-1.5 transition-colors ${language === item ? "bg-[color:var(--color-coral)] text-white" : "text-[color:var(--color-fg-muted)] hover:bg-white"}`}
        >
          {languageLabels[item]}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-[color:var(--color-border)]" />
      {currencies.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setCurrency(item)}
          className={`rounded-full px-2.5 py-1.5 transition-colors ${currency === item ? "bg-[color:var(--color-fg)] text-white" : "text-[color:var(--color-fg-muted)] hover:bg-white"}`}
        >
          {currencyLabels[item]}
        </button>
      ))}
    </div>
  );
}
