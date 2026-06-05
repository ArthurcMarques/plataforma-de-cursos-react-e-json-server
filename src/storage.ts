import type { AppData, CollectionName } from "./types";
import { mockData } from "./mockData";

export const storageKeys: Record<CollectionName, string> = {
    usuarios: "usuarios",
    categorias: "categorias",
    cursos: "cursos",
    modulos: "modulos",
    aulas: "aulas",
    matriculas: "matriculas",
    progressoAulas: "progressoAulas",
    avaliacoes: "avaliacoes",
    trilhas: "trilhas",
    trilhasCursos: "trilhasCursos",
    certificados: "certificados",
    planos: "planos",
    assinaturas: "assinaturas",
    pagamentos: "pagamentos"
};

export function loadInitialData(): AppData {
    const hasAnySavedData = (Object.keys(storageKeys) as CollectionName[]).some((name) => {
        return localStorage.getItem(storageKeys[name]) !== null;
    });

    return (Object.keys(storageKeys) as CollectionName[]).reduce((data, name) => {
        const list = hasAnySavedData ? loadCollection(name) : mockData[name];
        if (!hasAnySavedData) {
            saveCollection(name, list);
        }

        return { ...data, [name]: list };
    }, {} as AppData);
}

export function saveCollection<K extends CollectionName>(name: K, list: AppData[K]) {
    localStorage.setItem(storageKeys[name], JSON.stringify(list));
}

function loadCollection<K extends CollectionName>(name: K): AppData[K] {
    try {
        const saved = localStorage.getItem(storageKeys[name]);
        const parsed = saved ? JSON.parse(saved) : [];
        return (Array.isArray(parsed) ? parsed : []) as AppData[K];
    } catch {
        return [] as unknown as AppData[K];
    }
}
