import type { AppData, CollectionName } from "./types";

type WithId = { id: number };

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

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

export async function fetchAppData(): Promise<AppData> {
    const entries = await Promise.all(
        collections.map(async (name) => {
            const list = await request<AppData[typeof name]>(`/${name}`);
            return [name, list] as const;
        })
    );

    return Object.fromEntries(entries) as unknown as AppData;
}

export async function createRecord<K extends CollectionName>(
    name: K,
    record: Omit<AppData[K][number], "id"> | AppData[K][number]
): Promise<AppData[K][number]> {
    return request<AppData[K][number]>(`/${name}`, {
        method: "POST",
        body: JSON.stringify(record)
    });
}

export async function updateRecord<K extends CollectionName>(
    name: K,
    id: number,
    patch: Partial<AppData[K][number]>
): Promise<AppData[K][number]> {
    return request<AppData[K][number]>(`/${name}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch)
    });
}

export async function deleteRecord(name: CollectionName, id: number): Promise<void> {
    await request<void>(`/${name}/${id}`, { method: "DELETE" });
}

export async function syncCollection<K extends CollectionName>(
    name: K,
    currentList: AppData[K],
    nextList: AppData[K]
): Promise<AppData[K]> {
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
                return updateRecord(name, item.id, item as Partial<AppData[K][number]>);
            }

            return createRecord(name, item as AppData[K][number]);
        })
    );

    return saved as AppData[K];
}

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
