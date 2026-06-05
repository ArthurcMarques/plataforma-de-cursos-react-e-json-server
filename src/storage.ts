import type { AppData, CollectionName } from "./types";

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
    return (Object.keys(storageKeys) as CollectionName[]).reduce((data, name) => {
        return { ...data, [name]: loadList(storageKeys[name]) };
    }, {} as AppData);
}

export function saveCollection<K extends CollectionName>(name: K, list: AppData[K]) {
    localStorage.setItem(storageKeys[name], JSON.stringify(list));
}

function loadList<T>(key: string): T[] {
    try {
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
