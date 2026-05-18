import { useCallback, useEffect, useState } from "react";
import type { ScheduleItem, ScheduleItemStatus } from "@/types/schedule";

const storageKey = "arkme-demo.scheduleItems";

function safeParse(raw: string | null): ScheduleItem[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isScheduleItem);
  } catch {
    return [];
  }
}

function isScheduleItem(value: unknown): value is ScheduleItem {
  if (!value || typeof value !== "object") return false;
  const row = value as Partial<ScheduleItem>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    (row.dueAt === null || typeof row.dueAt === "number") &&
    typeof row.createdAt === "number" &&
    typeof row.updatedAt === "number" &&
    (row.status === "active" || row.status === "done")
  );
}

function persist(items: ScheduleItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useScheduleItems() {
  const [items, setItems] = useState<ScheduleItem[]>(() =>
    typeof window === "undefined" ? [] : safeParse(window.localStorage.getItem(storageKey))
  );

  useEffect(() => {
    setItems(safeParse(window.localStorage.getItem(storageKey)));
  }, []);

  useEffect(() => {
    persist(items);
  }, [items]);

  const addItem = useCallback((title: string, dueAt: number | null) => {
    const now = Date.now();
    const next: ScheduleItem = {
      id: createId(),
      title: title.trim(),
      dueAt,
      createdAt: now,
      updatedAt: now,
      status: "active",
    };
    setItems((prev) => [next, ...prev]);
  }, []);

  const setStatus = useCallback((id: string, status: ScheduleItemStatus) => {
    const now = Date.now();
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status, updatedAt: now } : row))
    );
  }, []);

  return { items, addItem, setStatus };
}
