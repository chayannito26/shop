type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

type PersistEnvelope<T extends Json> = {
	v: number;     // schema version
	t: number;     // saved at (ms)
	exp?: number;  // expires at (ms)
	data: T;
};

type CreatePersistedStateOpts<T extends Json> = {
	key: string;                             // logical key (namespaced internally)
	version: number;                         // bump to trigger migration
	initial: () => T;                        // default safe value
	validate?: (candidate: unknown) => T | null; // return null to reject
	migrate?: (oldData: unknown, oldVersion: number) => T | null; // migrate old to new
	ttlMs?: number;                          // optional expiration window
	maxBytes?: number;                       // optional size cap
	onQuotaEviction?: (info: { key: string; attemptedBytes: number }) => void;
	redact?: (data: T) => Json;              // optional redaction before storing
};

type PersistedState<T extends Json> = {
	key: string;
	get(): T;
	set(next: T | ((prev: T) => T), opts?: { flush?: boolean }): T;
	clear(): void;
	subscribe(fn: (value: T) => void): () => void;
};

const NS = 'shop';
const STORAGE_PREFIX = `${NS}:persist:`;

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const inMemoryStore = new Map<string, string>();
const listeners = new Map<string, Set<Function>>();
let storageAvailable = false;

// Runtime feature detection for localStorage
let storage: Storage | null = null;
try {
	if (isBrowser && 'localStorage' in window) {
		const testKey = '__persist_test__';
		window.localStorage.setItem(testKey, '1');
		window.localStorage.removeItem(testKey);
		storageAvailable = true;
		storage = window.localStorage;
	}
} catch {
	storageAvailable = false;
	storage = null;
}

// Broadcast across tabs (where supported)
const bc: BroadcastChannel | null = (() => {
	try {
		return isBrowser && 'BroadcastChannel' in window ? new BroadcastChannel(`${NS}:bc`) : null;
	} catch {
		return null;
	}
})();

function now(): number {
	return Date.now();
}

function fullKey(key: string): string {
	return `${STORAGE_PREFIX}${key}`;
}

function safeStringify(data: unknown): string {
	return JSON.stringify(data);
}

function safeParse<T>(raw: string | null): T | null {
	if (!raw) return null;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

function readRaw(key: string): string | null {
	const k = fullKey(key);
	if (storageAvailable && storage) {
		try {
			return storage.getItem(k);
		} catch {
			// fallthrough to memory (do not throw)
		}
	}
	return inMemoryStore.get(k) ?? null;
}

function writeRaw(key: string, value: string): boolean {
	const k = fullKey(key);
	// Try durable storage first
	if (storageAvailable && storage) {
		try {
			storage.setItem(k, value);
			return true;
		} catch {
			// quota or security
		}
	}
	// Fallback to in-memory so UX still works in restricted environments
	inMemoryStore.set(k, value);
	return false;
}

function removeRaw(key: string) {
	const k = fullKey(key);
	if (storageAvailable && storage) {
		try {
			storage.removeItem(k);
		} catch {
			// ignore
		}
	}
	inMemoryStore.delete(k);
}

function emit(key: string, payload: unknown) {
	// Local listeners
	const set = listeners.get(key);
	if (set) {
		for (const fn of set) {
			try { (fn as any)(payload); } catch { /* ignore */ }
		}
	}
	// Cross-tab
	if (bc) {
		try { bc.postMessage({ key, payload }); } catch { /* ignore */ }
	}
}

// Cross-tab sync via storage event for environments without BroadcastChannel
if (isBrowser) {
	window.addEventListener('storage', (e) => {
		if (!e.key || !e.key.startsWith(STORAGE_PREFIX)) return;
		const logicalKey = e.key.slice(STORAGE_PREFIX.length);
		const raw = typeof e.newValue === 'string' ? e.newValue : null;
		const env = safeParse<PersistEnvelope<Json>>(raw);
		if (!env) return;
		emit(logicalKey, env.data);
	});
	if (bc) {
		bc.addEventListener('message', (ev) => {
			const { key, payload } = (ev.data || {}) as { key: string; payload: unknown };
			if (!key) return;
			const set = listeners.get(key);
			if (set) {
				for (const fn of set) {
					try { (fn as any)(payload); } catch { /* ignore */ }
				}
			}
		});
	}
}

export function createPersistedState<T extends Json>(opts: CreatePersistedStateOpts<T>): PersistedState<T> {
	const {
		key,
		version,
		initial,
		validate,
		migrate,
		ttlMs,
		maxBytes,
		onQuotaEviction,
		redact,
	} = opts;

	// Cached value to avoid repeated parsing
	let cache: T | undefined;

	function decode(): T {
		const raw = readRaw(key);
		const env = safeParse<PersistEnvelope<unknown>>(raw);
		const currentTime = now();

		// Missing or invalid envelope -> initial
		if (!env || typeof env !== 'object' || env == null) {
			const init = initial();
			cache = init;
			return init;
		}

		// Expired -> clear to avoid serving stale
		if (env.exp && currentTime > env.exp) {
			removeRaw(key);
			const init = initial();
			cache = init;
			return init;
		}

		// Version matches and passes validation
		if (env.v === version) {
			let data = env.data;
			if (validate) {
				const valid = validate(data);
				if (valid !== null) {
					cache = valid;
					return valid;
				}
			} else {
				cache = data as T;
				return cache;
			}
			// If validation failed, fall through to reset
		}

		// Attempt migration from older version
		if (env.v !== undefined && env.v !== version && migrate) {
			const migrated = migrate(env.data, env.v);
			if (migrated !== null) {
				cache = migrated;
				// Persist migrated value synchronously
				internalSet(migrated, { flush: true });
				return migrated;
			}
		}

		// Fallback to initial if anything is off
		const init = initial();
		cache = init;
		return init;
	}

	function internalSet(next: T, opts?: { flush?: boolean }): T {
		const t = now();
		const exp = ttlMs ? t + ttlMs : undefined;
		const dataToStore = redact ? redact(next) : next;
		const envelope: PersistEnvelope<T> = { v: version, t, exp, data: dataToStore as T };

		const serialized = safeStringify(envelope);
		if (maxBytes && serialized.length > maxBytes) {
			// If too large, try to signal and avoid writing a too-large object
			onQuotaEviction?.({ key, attemptedBytes: serialized.length });
			// Do not write; keep cache so UI still has value this session
			cache = next;
			return next;
		}

		const durable = writeRaw(key, serialized);
		cache = next;

		// Notify subscribers locally and across tabs
		emit(key, next);

		// Optionally force sync to disk (noop for localStorage)
		if (opts?.flush && durable && storage && 'flush' in storage) {
			try { (storage as any).flush?.(); } catch { /* ignore */ }
		}

		return next;
	}

	function get(): T {
		if (cache !== undefined) return cache;
		return decode();
	}

	function set(next: T | ((prev: T) => T), opts?: { flush?: boolean }): T {
		const prev = get();
		const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
		return internalSet(value, opts);
	}

	function clear() {
		removeRaw(key);
		cache = undefined;
		emit(key, initial());
	}

	function subscribe(fn: (value: T) => void): () => void {
		const setForKey = listeners.get(key) ?? new Set<Function>();
		setForKey.add(fn);
		listeners.set(key, setForKey);

		// Emit current value immediately for convenience
		try { fn(get()); } catch { /* ignore */ }

		return () => {
			const s = listeners.get(key);
			if (!s) return;
			s.delete(fn);
			if (s.size === 0) listeners.delete(key);
		};
	}

	return { key, get, set, clear, subscribe };
}

// Helpers for common validators and utilities
export const validators = {
	isArrayOfIds(maxLen = 1000) {
		return (x: unknown) => {
			if (!Array.isArray(x)) return null;
			if (x.length > maxLen) return x.slice(0, maxLen);
			if (x.every((v) => typeof v === 'string' || typeof v === 'number')) {
				return x as Json as any;
			}
			return null;
		};
	},
	isObject<T extends Json>(fallback: T) {
		return (x: unknown) => (x && typeof x === 'object' ? (x as T) : fallback);
	},
	capArray<T = unknown>(cap: number) {
		return (x: unknown) => (Array.isArray(x) ? (x.slice(0, cap) as any) : ([] as any as T));
	},
};

export function withMaxLength<T>(arr: T[], max: number): T[] {
	if (arr.length <= max) return arr;
	return arr.slice(arr.length - max);
}
