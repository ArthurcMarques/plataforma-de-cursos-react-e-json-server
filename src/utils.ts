export function todayISO() {
    return new Date().toISOString().split("T")[0];
}

export function nextId(list: Array<{ id: number }>) {
    if (list.length === 0) {
        return 1;
    }

    return Math.max(...list.map((item) => Number(item.id) || 0)) + 1;
}

export function normalize(value: unknown) {
    return String(value ?? "").trim().toLowerCase();
}

export function nameById<T extends { id: number }>(list: T[], id: number, field: keyof T) {
    const item = list.find((record) => Number(record.id) === Number(id));
    const value = item ? item[field] : "-";
    return String(value ?? "-");
}
