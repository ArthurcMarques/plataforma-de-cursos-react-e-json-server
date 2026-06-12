import type { AppData, CollectionName, RecordId } from "../models/types";

// Contrato compartilhado por todas as paginas.
export interface PageProps {
    data: AppData;
    addWithId: (name: CollectionName, record: any) => Promise<void>;
    addDirect: (name: CollectionName, record: any) => Promise<any | null>;
    updateById: (name: CollectionName, id: RecordId, patch: any) => Promise<void>;
    removeById: (name: CollectionName, id: RecordId) => Promise<void>;
    removeDirect: (name: CollectionName, id: RecordId) => Promise<boolean>;
    notify: (message: string, type?: "success" | "warning" | "danger") => void;
    navigate: (section: string) => void;
}
