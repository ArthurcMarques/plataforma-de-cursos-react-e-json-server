import type { AppData, CollectionName, RecordId } from "../models/types";

// Contrato compartilhado por todas as paginas.
export interface PageProps {
    data: AppData;
    addWithId: (name: CollectionName, record: any) => Promise<void>;
    updateById: (name: CollectionName, id: RecordId, patch: any) => Promise<void>;
    removeById: (name: CollectionName, id: RecordId) => Promise<void>;
    updateCollection: (name: CollectionName, updater: (list: any[]) => any[]) => Promise<any[] | undefined>;
    notify: (message: string, type?: "success" | "warning" | "danger") => void;
    navigate: (section: string) => void;
}
