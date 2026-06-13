// Funcoes pequenas usadas em varias partes do sistema.
import type { RecordId } from "./models/types";

// Retorna a data atual no formato usado pelos inputs date.
export function todayISO() {
    return new Date().toISOString().split("T")[0];
}

// Normaliza textos para validacoes simples.
export function normalize(value: unknown) {
    return String(value ?? "").trim().toLowerCase();
}

// Compara ids mesmo quando o JSON Server devolve strings.
export function sameId(left: unknown, right: unknown) {
    return String(left ?? "") === String(right ?? "");
}

// Procura um nome/campo pelo id relacionado.
export function nameById<T extends { id: RecordId }>(list: T[], id: RecordId, field: keyof T) {
    const item = list.find((record) => sameId(record.id, id));
    const value = item ? item[field] : "-";
    return String(value ?? "-");
}
