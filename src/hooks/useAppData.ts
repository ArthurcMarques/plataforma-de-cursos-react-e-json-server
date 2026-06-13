import { useEffect, useState } from "react";
import type { AppData, CollectionName, RecordId } from "../models/types";
import { createRecord, deleteRecord, emptyAppData, fetchAppData, updateRecord } from "../services/api";

type AlertState = { message: string; type: "success" | "warning" | "danger" } | null;
type WithId = { id: RecordId };

export function useAppData() {
    const [data, setData] = useState<AppData>(emptyAppData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>(null);

    useEffect(() => {
        void refreshData();
    }, []);

    async function refreshData() {
        setLoading(true);
        try {
            setData(await fetchAppData());
            setError(null);
        } catch {
            setError("Não foi possível carregar os dados. Verifique se o JSON Server está rodando.");
        } finally {
            setLoading(false);
        }
    }

    function notify(message: string, type: "success" | "warning" | "danger" = "success") {
        setAlert({ message, type });
        window.setTimeout(() => setAlert(null), 2800);
    }

    async function addWithId(name: CollectionName, record: any) {
        const saved = await addDirect(name, record);
        if (saved) {
            notify("Registro salvo com sucesso.");
        }
    }

    async function addDirect(name: CollectionName, record: any) {
        try {
            const saved = await createRecord(name, record);
            setData((current) => ({ ...current, [name]: [...current[name], saved] }));
            return saved;
        } catch {
            notify("Não foi possível salvar o registro no servidor.", "danger");
            return null;
        }
    }

    async function removeById(name: CollectionName, id: RecordId) {
        if (!window.confirm("Deseja excluir este registro?")) {
            return;
        }

        const removed = await removeDirect(name, id);
        if (removed) {
            notify("Registro removido com sucesso.", "warning");
        }
    }

    async function removeDirect(name: CollectionName, id: RecordId) {
        const previousList = data[name] as any[];
        const updated = (previousList as WithId[]).filter((item) => Number(item.id) !== Number(id));
        setData((current) => ({ ...current, [name]: updated }));

        try {
            await deleteRecord(name, id);
            return true;
        } catch {
            setData((current) => ({ ...current, [name]: previousList }));
            notify("Não foi possível remover o registro no servidor.", "danger");
            return false;
        }
    }

    async function updateById(name: CollectionName, id: RecordId, patch: any) {
        try {
            const saved = await updateRecord(name, id, patch);
            setData((current) => ({
                ...current,
                [name]: (current[name] as unknown as WithId[]).map((item) => {
                    return Number(item.id) === Number(id) ? saved : item;
                })
            }));
            notify("Registro atualizado com sucesso.");
        } catch {
            notify("Não foi possível atualizar o registro no servidor.", "danger");
        }
    }

    return {
        data,
        loading,
        error,
        alert,
        refreshData,
        notify,
        addWithId,
        addDirect,
        removeById,
        removeDirect,
        updateById
    };
}
