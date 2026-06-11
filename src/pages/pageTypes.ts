import type { AppData, CollectionName, RecordId } from "../models/types";

export interface PageProps {
    data: AppData;
    addWithId: <K extends CollectionName>(name: K, record: Omit<AppData[K][number], "id">) => Promise<void>;
    updateById: <K extends CollectionName>(name: K, id: RecordId, patch: Partial<AppData[K][number]>) => Promise<void>;
    removeById: <K extends CollectionName>(name: K, id: RecordId) => Promise<void>;
    updateCollection: <K extends CollectionName>(name: K, updater: (list: AppData[K]) => AppData[K]) => Promise<AppData[K] | undefined>;
    notify: (message: string, type?: "success" | "warning" | "danger") => void;
    navigate: (section: string) => void;
}
