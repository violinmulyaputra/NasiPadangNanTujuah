import { useSyncExternalStore } from "react";
import { getOptionGroups, selectionLabels, validateSelections, type Selections } from "@/lib/menu-options";
import { calculateUnitPrice, clampQuantity, MAX_QUANTITY } from "@/lib/pricing";
import type { MenuItem } from "@/types/menu";

export type CartLine = {
  lineKey: string;
  menuItemId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  quantity: number;
  selections: Selections;
  optionLabels: string[];
  unitPrice: number;
};

const STORAGE_KEY = "nasi-padang-cart";
const SCHEMA_VERSION = 1;

const EMPTY: CartLine[] = [];
let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

export const makeLineKey = (menuItemId: string, selections: Selections) =>
  [menuItemId, ...Object.keys(selections).sort().map((k) => `${k}=${selections[k]}`)].join("|");

function isCartLine(value: unknown): value is CartLine {
  const l = value as CartLine;
  return (
    typeof l === "object" && l !== null &&
    typeof l.lineKey === "string" && typeof l.menuItemId === "string" &&
    typeof l.slug === "string" && typeof l.name === "string" &&
    (l.imageUrl === null || typeof l.imageUrl === "string") &&
    Number.isInteger(l.basePrice) && Number.isInteger(l.unitPrice) &&
    Number.isInteger(l.quantity) && l.quantity >= 1 && l.quantity <= MAX_QUANTITY &&
    typeof l.selections === "object" && l.selections !== null &&
    Array.isArray(l.optionLabels)
  );
}

function load(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return EMPTY;
    const data = JSON.parse(raw);
    if (data?.version === SCHEMA_VERSION && Array.isArray(data.lines)) {
      return data.lines.filter(isCartLine);
    }
  } catch {
  }
  try {
    if (raw !== null) localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return EMPTY;
}

function getSnapshot(): CartLine[] {
  if (lines === null) lines = load();
  return lines;
}

const getServerSnapshot = () => EMPTY;

function setLines(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, lines: next }));
  } catch {
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  lines = load();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export type AddItemResult = { ok: true } | { ok: false; error: string };

export function addItem(menuItem: MenuItem, selections: unknown, quantity = 1): AddItemResult {
  if (!menuItem.is_available) return { ok: false, error: "Menu ini sedang habis." };

  const groups = getOptionGroups(menuItem);
  const checked = validateSelections(groups, selections);
  if (!checked.ok) return checked;

  const qty = clampQuantity(quantity);
  const lineKey = makeLineKey(menuItem.id, checked.selections);
  const current = getSnapshot();
  const existing = current.find((l) => l.lineKey === lineKey);

  if (existing) {
    setLines(
      current.map((l) =>
        l.lineKey === lineKey ? { ...l, quantity: Math.min(MAX_QUANTITY, l.quantity + qty) } : l,
      ),
    );
  } else {
    setLines([
      ...current,
      {
        lineKey,
        menuItemId: menuItem.id,
        slug: menuItem.slug,
        name: menuItem.name,
        imageUrl: menuItem.image_url,
        basePrice: menuItem.price,
        quantity: qty,
        selections: checked.selections,
        optionLabels: selectionLabels(groups, checked.selections),
        unitPrice: calculateUnitPrice(menuItem.price, groups, checked.selections),
      },
    ]);
  }
  return { ok: true };
}

export function updateQuantity(lineKey: string, quantity: number) {
  const qty = clampQuantity(quantity);
  setLines(getSnapshot().map((l) => (l.lineKey === lineKey ? { ...l, quantity: qty } : l)));
}

export function removeItem(lineKey: string) {
  setLines(getSnapshot().filter((l) => l.lineKey !== lineKey));
}

export function clear() {
  setLines(EMPTY);
}
