import type { AppData, CollectionName, RecordId } from "../models/types";

type WithId = { id: RecordId };
type AnyRecord = Record<string, any>;

// URL base do JSON Server. Pode ser trocada por VITE_API_URL.
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

// Colecoes expostas no db.json.
export const collections: CollectionName[] = [
    "usuarios",
    "categorias",
    "cursos",
    "modulos",
    "aulas",
    "matriculas",
    "progressoAulas",
    "avaliacoes",
    "trilhas",
    "trilhasCursos",
    "certificados",
    "planos",
    "assinaturas",
    "pagamentos"
];

export function emptyAppData(): AppData {
    return collections.reduce((data, name) => ({ ...data, [name]: [] }), {} as AppData);
}

// Carrega todas as colecoes usadas pela aplicacao.
export async function fetchAppData(): Promise<AppData> {
    const entries = await Promise.all(
        collections.map(async (name) => {
            const list = await request<AppData[typeof name]>(`/${name}`);
            return [name, list] as const;
        })
    );

    return Object.fromEntries(entries) as unknown as AppData;
}

export async function createRecord(name: CollectionName, record: AnyRecord): Promise<AnyRecord> {
    return request<AnyRecord>(`/${name}`, {
        method: "POST",
        body: JSON.stringify(record)
    });
}

export async function updateRecord(
    name: CollectionName,
    id: RecordId,
    patch: AnyRecord
): Promise<AnyRecord> {
    return request<AnyRecord>(`/${name}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
    });
}

export async function deleteRecord(name: CollectionName, id: RecordId): Promise<void> {
    await request<void>(`/${name}/${id}`, { method: "DELETE" });
}

// Compara a lista atual com a nova e aplica POST, PATCH ou DELETE.
export async function syncCollection(
    name: CollectionName,
    currentList: any[],
    nextList: any[]
): Promise<any[]> {
    const current = currentList as unknown as WithId[];
    const next = nextList as unknown as WithId[];
    const nextIds = new Set(next.map((item) => Number(item.id)));

    await Promise.all(
        current
            .filter((item) => !nextIds.has(Number(item.id)))
            .map((item) => deleteRecord(name, item.id))
    );

    const currentIds = new Set(current.map((item) => Number(item.id)));
    const saved = await Promise.all(
        next.map((item) => {
            if (currentIds.has(Number(item.id))) {
                return updateRecord(name, item.id, item);
            }

            return createRecord(name, item);
        })
    );

    return saved;
}

// Wrapper simples para padronizar chamadas HTTP.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init
    });

    if (!response.ok) {
        throw new Error(`Erro ${response.status} ao acessar ${path}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}
