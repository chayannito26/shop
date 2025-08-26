import { createPersistedState, withMaxLength } from '../utils/persist';

// Cart types are intentionally minimal to avoid coupling. Extend as needed.
export type CartItem = {
	id: string;           // product id
	sku?: string;         // variant
	qty: number;          // integer >= 1
	price?: number;       // unit price at time of add (optional)
	attrs?: Record<string, string | number | boolean>; // chosen options
};

export type CartState = {
	items: CartItem[];
	coupons: string[];
	updatedAt: number;
	currency?: string; // e.g., 'USD'
};

export type WishlistState = {
	ids: string[];
	updatedAt: number;
};

export type CompareState = {
	ids: string[];
	updatedAt: number;
};

export type RecentlyViewedItem = { id: string; at: number };
export type RecentlyViewedState = {
	items: RecentlyViewedItem[]; // most recent last
};

export type UiPrefsState = {
	theme: 'light' | 'dark' | 'system';
};

export type CurrencyLocaleState = {
	currency: string; // e.g., 'USD'
	locale: string;   // e.g., 'en-US'
};

export type ShippingPrefsState = {
	country?: string;  // ISO-3166 alpha-2
	region?: string;   // state/province
	postalCode?: string;
	methodId?: string; // preferred shipping method
	updatedAt: number;
};

export type FiltersState = {
	// store last-used filters by route or category slug
	byKey: Record<string, Record<string, string | number | boolean | (string | number)[]>>;
};

const DAY = 24 * 60 * 60 * 1000;

// CART
export const cartState = createPersistedState<CartState>({
	key: 'cart',
	version: 1,
	ttlMs: 90 * DAY, // keep cart for 90 days
	initial: () => ({ items: [], coupons: [], updatedAt: Date.now() }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return null;
		const o = x as any;
		const items: CartItem[] = Array.isArray(o.items)
			? o.items
					.filter((it: any) => it && typeof it.id === 'string' && Number.isFinite(it.qty))
					.map((it: any) => ({
						id: String(it.id),
						sku: typeof it.sku === 'string' ? it.sku : undefined,
						qty: Math.max(1, Math.floor(it.qty)),
						price: Number.isFinite(it.price) ? Number(it.price) : undefined,
						attrs: it.attrs && typeof it.attrs === 'object' ? it.attrs : undefined,
					}))
			: [];
		const coupons = Array.isArray(o.coupons) ? o.coupons.filter((c: any) => typeof c === 'string').slice(0, 50) : [];
		const currency = typeof o.currency === 'string' ? o.currency : undefined;
		return { items: withMaxLength(items, 500), coupons, updatedAt: Date.now(), currency };
	},
	redact: (data) => data, // all fields safe
	maxBytes: 200_000, // ~200KB cap for safety
});

// WISHLIST
export const wishlistState = createPersistedState<WishlistState>({
	key: 'wishlist',
	version: 1,
	ttlMs: 365 * DAY,
	initial: () => ({ ids: [], updatedAt: Date.now() }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return null;
		const ids = Array.isArray((x as any).ids)
			? (x as any).ids.filter((v: any) => typeof v === 'string').slice(0, 2000)
			: [];
		return { ids, updatedAt: Date.now() };
	},
});

// COMPARE LIST
export const compareState = createPersistedState<CompareState>({
	key: 'compare',
	version: 1,
	ttlMs: 180 * DAY,
	initial: () => ({ ids: [], updatedAt: Date.now() }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return null;
		const ids = Array.isArray((x as any).ids)
			? (x as any).ids.filter((v: any) => typeof v === 'string').slice(0, 200)
			: [];
		return { ids, updatedAt: Date.now() };
	},
});

// RECENTLY VIEWED
export const recentlyViewedState = createPersistedState<RecentlyViewedState>({
	key: 'recentlyViewed',
	version: 1,
	ttlMs: 60 * DAY,
	initial: () => ({ items: [] }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return null;
		const items = Array.isArray((x as any).items)
			? (x as any).items
					.map((it: any) => (it && typeof it.id === 'string' && Number.isFinite(it.at) ? { id: it.id, at: it.at } : null))
					.filter(Boolean)
			: [];
		// Deduplicate by id, keep most recent occurrences, cap to 50
		const seen = new Set<string>();
		const dedup: RecentlyViewedItem[] = [];
		for (let i = items.length - 1; i >= 0 && dedup.length < 50; i--) {
			const it = items[i]!;
			if (!seen.has(it.id)) {
				seen.add(it.id);
				dedup.push(it);
			}
		}
		return { items: dedup.reverse() };
	},
});

// UI PREFERENCES
export const uiPrefsState = createPersistedState<UiPrefsState>({
	key: 'uiPrefs',
	version: 1,
	initial: () => ({ theme: 'system' }),
	validate: (x) => {
		const t = (x as any)?.theme;
		return { theme: t === 'light' || t === 'dark' || t === 'system' ? t : 'system' };
	},
});

// CURRENCY + LOCALE
export const currencyLocaleState = createPersistedState<CurrencyLocaleState>({
	key: 'currencyLocale',
	version: 1,
	initial: () => ({ currency: 'USD', locale: (typeof navigator !== 'undefined' ? navigator.language : 'en-US') || 'en-US' }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return { currency: 'USD', locale: 'en-US' };
		const cur = typeof (x as any).currency === 'string' ? (x as any).currency : 'USD';
		const loc = typeof (x as any).locale === 'string' ? (x as any).locale : 'en-US';
		return { currency: cur, locale: loc };
	},
});

// SHIPPING PREFERENCES (non-PII)
export const shippingPrefsState = createPersistedState<ShippingPrefsState>({
	key: 'shippingPrefs',
	version: 1,
	ttlMs: 180 * DAY,
	initial: () => ({ updatedAt: Date.now() }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return { updatedAt: Date.now() };
		const o = x as any;
		const country = typeof o.country === 'string' && o.country.length <= 2 ? o.country : undefined;
		const region = typeof o.region === 'string' ? o.region : undefined;
		const postalCode = typeof o.postalCode === 'string' ? o.postalCode : undefined;
		const methodId = typeof o.methodId === 'string' ? o.methodId : undefined;
		return { country, region, postalCode, methodId, updatedAt: Date.now() };
	},
});

// LAST-USED FILTERS (per route/category key)
export const filtersState = createPersistedState<FiltersState>({
	key: 'filters',
	version: 1,
	ttlMs: 30 * DAY,
	initial: () => ({ byKey: {} }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return { byKey: {} };
		const byKey = (x as any).byKey && typeof (x as any).byKey === 'object' ? (x as any).byKey : {};
		// Shallow sanitize: keep only primitives and arrays of primitives, cap entries
		const out: FiltersState['byKey'] = {};
		const keys = Object.keys(byKey).slice(0, 200);
		for (const k of keys) {
			const v = byKey[k];
			if (!v || typeof v !== 'object') continue;
			const e: Record<string, any> = {};
			const sub = Object.keys(v).slice(0, 200);
			for (const f of sub) {
				const val = v[f];
				if (Array.isArray(val)) {
					e[f] = val.filter((x) => ['string', 'number'].includes(typeof x)).slice(0, 200);
				} else if (['string', 'number', 'boolean'].includes(typeof val)) {
					e[f] = val;
				}
			}
			out[k] = e;
		}
		return { byKey: out };
	},
});

// Helper methods for common operations

// Cart helpers
export const Cart = {
	get: () => cartState.get(),
	subscribe: cartState.subscribe,
	clear: () => cartState.clear(),
	addItem: (item: CartItem) => {
		return cartState.set((prev) => {
			const now = Date.now();
			const items = [...prev.items];
			// merge by id+sku+attrs signature
			const signature = (it: CartItem) => `${it.id}::${it.sku ?? ''}::${JSON.stringify(it.attrs ?? {})}`;
			const sig = signature(item);
			const idx = items.findIndex((it) => signature(it) === sig);
			if (idx >= 0) {
				items[idx] = { ...items[idx], qty: Math.max(1, Math.floor(items[idx].qty + Math.max(1, Math.floor(item.qty || 1)))) };
			} else {
				items.push({ ...item, qty: Math.max(1, Math.floor(item.qty || 1)) });
			}
			return { ...prev, items: withMaxLength(items, 500), updatedAt: now };
		});
	},
	// Atomically replace the persisted list of items. Use this to avoid multi-step writes (clear + addItem)
	replaceItems: (items: CartItem[]) => cartState.set((p) => ({ ...p, items: withMaxLength(items, 500), updatedAt: Date.now() })),
	updateQty: (query: Partial<CartItem> & { id: string }, qty: number) => {
		return cartState.set((prev) => {
			const signature = (it: CartItem) => `${it.id}::${it.sku ?? ''}::${JSON.stringify(it.attrs ?? {})}`;
			const sig = `${query.id}::${query.sku ?? ''}::${JSON.stringify(query.attrs ?? {})}`;
			const items = prev.items.map((it) => (signature(it) === sig ? { ...it, qty: Math.max(0, Math.floor(qty)) } : it)).filter((it) => it.qty > 0);
			return { ...prev, items, updatedAt: Date.now() };
		});
	},
	removeItem: (query: Partial<CartItem> & { id: string }) => {
		return cartState.set((prev) => {
			const signature = (it: CartItem) => `${it.id}::${it.sku ?? ''}::${JSON.stringify(it.attrs ?? {})}`;
			const sig = `${query.id}::${query.sku ?? ''}::${JSON.stringify(query.attrs ?? {})}`;
			const items = prev.items.filter((it) => signature(it) !== sig);
			return { ...prev, items, updatedAt: Date.now() };
		});
	},
	clearCoupons: () => cartState.set((p) => ({ ...p, coupons: [], updatedAt: Date.now() })),
	addCoupon: (code: string) =>
		cartState.set((p) => {
			const c = code.trim();
			if (!c) return p;
			if (p.coupons.includes(c)) return p;
			return { ...p, coupons: withMaxLength([...p.coupons, c].slice(0, 50), 50), updatedAt: Date.now() };
		}),
	removeCoupon: (code: string) => cartState.set((p) => ({ ...p, coupons: p.coupons.filter((c) => c !== code), updatedAt: Date.now() })),
	setCurrency: (currency: string) => cartState.set((p) => ({ ...p, currency, updatedAt: Date.now() })),
};

// Wishlist helpers
export const Wishlist = {
	get: () => wishlistState.get(),
	subscribe: wishlistState.subscribe,
	clear: () => wishlistState.clear(),
	add: (id: string) => wishlistState.set((p) => {
		if (!id) return p;
		if (p.ids.includes(id)) return p;
		return { ids: withMaxLength([...p.ids, id], 2000), updatedAt: Date.now() };
	}),
	remove: (id: string) => wishlistState.set((p) => ({ ids: p.ids.filter((x) => x !== id), updatedAt: Date.now() })),
	toggle: (id: string) => wishlistState.set((p) => (p.ids.includes(id) ? { ids: p.ids.filter((x) => x !== id), updatedAt: Date.now() } : { ids: withMaxLength([...p.ids, id], 2000), updatedAt: Date.now() })),
};

// Compare helpers
export const Compare = {
	get: () => compareState.get(),
	subscribe: compareState.subscribe,
	clear: () => compareState.clear(),
	add: (id: string) => compareState.set((p) => (p.ids.includes(id) ? p : { ids: withMaxLength([...p.ids, id], 200), updatedAt: Date.now() })),
	remove: (id: string) => compareState.set((p) => ({ ids: p.ids.filter((x) => x !== id), updatedAt: Date.now() })),
	toggle: (id: string) => compareState.set((p) => (p.ids.includes(id) ? { ids: p.ids.filter((x) => x !== id), updatedAt: Date.now() } : { ids: withMaxLength([...p.ids, id], 200), updatedAt: Date.now() })),
};

// Recently viewed helpers
export const RecentlyViewed = {
	get: () => recentlyViewedState.get(),
	subscribe: recentlyViewedState.subscribe,
	clear: () => recentlyViewedState.clear(),
	push: (id: string) => {
		if (!id) return recentlyViewedState.get();
		return recentlyViewedState.set((p) => {
			const at = Date.now();
			// move to end if exists
			const items = p.items.filter((it) => it.id !== id);
			items.push({ id, at });
			// cap at 50 entries
			return { items: withMaxLength(items, 50) };
		});
	},
};

// UI prefs helpers
export const UiPrefs = {
	get: () => uiPrefsState.get(),
	subscribe: uiPrefsState.subscribe,
	setTheme: (t: 'light' | 'dark' | 'system') => uiPrefsState.set({ theme: t }),
};

// Currency/Locale helpers
export const CurrencyLocale = {
	get: () => currencyLocaleState.get(),
	subscribe: currencyLocaleState.subscribe,
	setCurrency: (currency: string) => currencyLocaleState.set((p) => ({ ...p, currency })),
	setLocale: (locale: string) => currencyLocaleState.set((p) => ({ ...p, locale })),
};

// Shipping prefs helpers
export const ShippingPrefs = {
	get: () => shippingPrefsState.get(),
	subscribe: shippingPrefsState.subscribe,
	set: (patch: Partial<ShippingPrefsState>) => shippingPrefsState.set((p) => ({ ...p, ...patch, updatedAt: Date.now() })),
	clear: () => shippingPrefsState.clear(),
};

// Filters helpers
export const Filters = {
	get: () => filtersState.get(),
	subscribe: filtersState.subscribe,
	setFor: (key: string, data: Record<string, any>) =>
		filtersState.set((p) => {
			const byKey = { ...p.byKey };
			byKey[key] = data;
			return { byKey };
		}),
	clearFor: (key: string) => filtersState.set((p) => {
		const byKey = { ...p.byKey };
		delete byKey[key];
		return { byKey };
	}),
	clearAll: () => filtersState.clear(),
};

// CHECKOUT FORM (persist non-PII payment form fields to survive refresh)
export type CheckoutFormState = {
	name?: string;
	roll?: string;
	department?: string;
	phone?: string;
	email?: string;
	bkashTransactionId?: string; // sensitive-ish but needed for UX; will be cleared after order
};

export const checkoutFormState = createPersistedState<CheckoutFormState>({
	key: 'checkoutForm',
	version: 1,
	ttlMs: 365 * DAY, // keep as last-used for a year
	initial: () => ({ name: '', roll: '', department: '', phone: '', email: '', bkashTransactionId: '' }),
	validate: (x) => {
		if (!x || typeof x !== 'object') return { name: '', roll: '', department: '', phone: '', email: '', bkashTransactionId: '' };
		const o = x as any;
		const safe = {
			name: typeof o.name === 'string' ? o.name.slice(0, 200) : '',
			roll: typeof o.roll === 'string' ? o.roll.slice(0, 100) : '',
			department: typeof o.department === 'string' ? o.department.slice(0, 100) : '',
			phone: typeof o.phone === 'string' ? o.phone.slice(0, 20) : '',
			email: typeof o.email === 'string' ? o.email.slice(0, 200) : '',
			bkashTransactionId: typeof o.bkashTransactionId === 'string' ? o.bkashTransactionId.slice(0, 64) : '',
		};
		return safe;
	},
	redact: (data) => ({ ...data }),
	maxBytes: 20_000,
});

export const CheckoutForm = {
	get: () => checkoutFormState.get(),
	set: (next: CheckoutFormState | ((prev: CheckoutFormState) => CheckoutFormState)) => checkoutFormState.set(next),
	clearTransactionId: () => checkoutFormState.set((p) => ({ ...p, bkashTransactionId: '' })),
	updateField: (k: keyof CheckoutFormState, v: string) => checkoutFormState.set((p) => ({ ...p, [k]: v } as any)),
	subscribe: checkoutFormState.subscribe,
	clear: () => checkoutFormState.clear(),
};
