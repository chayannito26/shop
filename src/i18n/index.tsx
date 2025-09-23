import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import en from './en';
import bn from './bn';
import { parseVariationTiers, type VariationSchema } from '../utils/pricing';

type Lang = 'en' | 'bn';
type Dict = typeof en;

const RESOURCES: Record<Lang, Dict> = { en, bn };
const LS_KEY = 'LANG';

function getPath(obj: unknown, path: string) {
  return path.split('.').reduce((acc, k) => (acc && typeof acc === 'object' ? (acc as any)[k] : undefined), obj as any);
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!template || !vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  needsPrompt: boolean;
  dismissPrompt: () => void;
  // New helpers
  productName: (id: string, fallback?: string) => string;
  productDescription: (id: string, fallback?: string) => string;
  categoryLabel: (slug: string, fallback?: string) => string;
  localizeProduct: <T extends { id: string; name?: string; description?: string }>(p: T) => T;
  // Variation helpers
  variationTitle: (tierKey: string, fallback?: string, productId?: string) => string;
  variationValue: (productId: string | undefined, tierKey: string, value: string, fallback?: string) => string;
  localizeVariationLabel: (productId: string | undefined, label?: string, schema?: { keys: string[] }) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const v = localStorage.getItem(LS_KEY);
      return v === 'bn' ? 'bn' : 'en';
    } catch (e) {
      // ignore localStorage read errors and default to English
      return 'en';
    }
  });
  const [needsPrompt, setNeedsPrompt] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(LS_KEY);
    } catch (e) {
      return false;
    }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LS_KEY, l);
    } catch {}
    setNeedsPrompt(false);
  };
  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = RESOURCES[lang] || RESOURCES.en;
      const def = RESOURCES.en;
      const val = getPath(dict, key) ?? getPath(def, key) ?? key;
      if (typeof val === 'string') return interpolate(val, vars);
      return key;
    };
  }, [lang]);

  // New catalog helpers
  const productName = useMemo(() => {
    return (id: string, fallback?: string) => {
      const dict = RESOURCES[lang] || RESOURCES.en;
  const val = getPath(dict, `catalog.products.${id}.name`);
      return typeof val === 'string' ? val : (fallback ?? id);
    };
  }, [lang]);

  const productDescription = useMemo(() => {
    return (id: string, fallback?: string) => {
      const dict = RESOURCES[lang] || RESOURCES.en;
  const val = getPath(dict, `catalog.products.${id}.description`);
      return typeof val === 'string' ? val : (fallback ?? '');
    };
  }, [lang]);

  const categoryLabel = useMemo(() => {
    return (slug: string, fallback?: string) => {
      const dict = RESOURCES[lang] || RESOURCES.en;
  const val = getPath(dict, `catalog.categories.${slug}`);
      return typeof val === 'string' ? val : (fallback ?? slug);
    };
  }, [lang]);

  const localizeProduct = useMemo(() => {
    return <T extends { id: string; name?: string; description?: string }>(p: T): T => {
      return {
        ...p,
        ...(p.name !== undefined ? { name: productName(p.id, p.name) } : null),
        ...(p.description !== undefined ? { description: productDescription(p.id, p.description) } : null),
      };
    };
  }, [productName, productDescription]);

  // Variation helpers
  const variationTitle = useMemo(() => {
    return (tierKey: string, fallback?: string, productId?: string) => {
      const dict = RESOURCES[lang] || RESOURCES.en;
      // product-specific override
      const prodVal = productId ? getPath(dict, `catalog.products.${productId}.variationTitles.${tierKey}`) : undefined;
      const commonVal = getPath(dict, `variation.titles.${tierKey}`);
      const val = prodVal ?? commonVal ?? fallback ?? tierKey;
      if (typeof val === 'string') return val;
      return tierKey;
    };
  }, [lang]);

  const variationValue = useMemo(() => {
    return (productId: string | undefined, tierKey: string, value: string, fallback?: string) => {
      if (!value) return '';
      const dict = RESOURCES[lang] || RESOURCES.en;
      // product-specific values
      const prodPath = productId ? `catalog.products.${productId}.variations.${tierKey}.${value}` : undefined;
      const prodVal = prodPath ? getPath(dict, prodPath) : undefined;
      const commonVal = getPath(dict, `variation.values.common.${tierKey}.${value}`);
      const prodValues = productId ? getPath(dict, `variation.values.products.${productId}.${tierKey}.${value}`) : undefined;
      const val = prodVal ?? prodValues ?? commonVal ?? fallback ?? value;
      return typeof val === 'string' ? val : String(value);
    };
  }, [lang]);

  const localizeVariationLabel = useMemo(() => {
    return (productId: string | undefined, label?: string, schema?: VariationSchema) => {
      if (!label) return '';
      // Parse tiers using pricing helper to respect schema heuristics
      const tiers = parseVariationTiers(label, schema);
      const keys = schema && schema.keys && schema.keys.length > 0 ? schema.keys : Object.keys(tiers);
      const parts: string[] = [];
      keys.forEach((k) => {
        const v = tiers[k];
        if (!v) return;
        const localized = variationValue(productId, k, v);
        parts.push(localized);
      });
      if (parts.length > 0) return parts.join(' - ');
      // Fallback: return raw label
      return label;
    };
  }, [variationValue]);

  // If first visit in this tab and no stored choice, ensure prompt shows
  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setNeedsPrompt(true);
    } catch (e) {
      // ignore
    }
  }, []);

  const value: I18nCtx = {
    lang,
    setLang,
    toggleLang,
    t,
    needsPrompt,
    dismissPrompt: () => setNeedsPrompt(false),
    productName,
    productDescription,
    categoryLabel,
    localizeProduct,
    variationTitle,
    variationValue,
    localizeVariationLabel,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// First-visit language prompt (modal)
export function LanguagePrompt() {
  const { needsPrompt, setLang } = useI18n() as any;

  if (!needsPrompt) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-theme-bg-secondary shadow-theme-lg p-6">
        <h2 className="text-xl font-semibold text-theme-text-primary mb-2">
          <span lang="en">{RESOURCES.en.prompt.title}</span>
          <span aria-hidden="true" className="mx-1">|</span>
          <span lang="bn">{RESOURCES.bn.prompt.title}</span>
        </h2>
        <p className="text-sm text-theme-text-secondary mb-4">
          <span lang="en">{RESOURCES.en.prompt.description}</span>
          <span aria-hidden="true" className="mx-1">|</span>
          <span lang="bn">{RESOURCES.bn.prompt.description}</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLang('en')}
            className="w-full px-4 py-2 rounded-md border border-theme-border hover:bg-theme-bg-tertiary text-theme-text-primary"
            aria-label="Select English language"
          >
            <span role="img" aria-label="UK flag" className="mr-1">🇬🇧</span>
            <span lang="en">English</span>
            <span aria-hidden="true" className="mx-1">|</span>
            <span lang="bn">ইংরেজি</span>
          </button>
          <button
            onClick={() => setLang('bn')}
            className="w-full px-4 py-2 rounded-md bg-theme-accent text-white hover:bg-theme-accent-hover"
            aria-label="বাংলা ভাষা নির্বাচন করুন"
          >
            <span role="img" aria-label="Bangladesh flag" className="mr-1">🇧🇩</span>
            <span lang="bn">{RESOURCES.bn.lang.bengali}</span>
            <span aria-hidden="true" className="mx-1">|</span>
            <span lang="en">{RESOURCES.en.lang.bengali}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
