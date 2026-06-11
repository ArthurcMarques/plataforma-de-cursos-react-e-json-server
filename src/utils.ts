export function todayISO() {
    return new Date().toISOString().split("T")[0];
}

import type { RecordId } from "./models/types";

export function nextId(list: Array<{ id: RecordId }>) {
    if (list.length === 0) {
        return 1;
    }

    return Math.max(...list.map((item) => Number(item.id) || 0)) + 1;
}

export function normalize(value: unknown) {
    return String(value ?? "").trim().toLowerCase();
}

export function sameId(left: unknown, right: unknown) {
    return Number(left) === Number(right);
}

export function nameById<T extends { id: RecordId }>(list: T[], id: RecordId, field: keyof T) {
    const item = list.find((record) => sameId(record.id, id));
    const value = item ? item[field] : "-";
    return String(value ?? "-");
}
