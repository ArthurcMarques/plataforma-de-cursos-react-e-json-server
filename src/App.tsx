import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import type { AppData, CollectionName, RecordId } from "./models/types";
import { CurrentSection } from "./pages/CurrentSection";
import type { PageProps } from "./pages/pageTypes";
import { sectionByPath, sectionPaths, sections } from "./pages/routes";
import { createRecord, deleteRecord, emptyAppData, fetchAppData, syncCollection, updateRecord } from "./services/api";

type AlertState = { message: string; type: "success" | "warning" | "danger" } | null;
type WithId = { id: RecordId };

export function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentSection = sectionByPath[location.pathname] ?? "dashboard";
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

    async function updateCollection<K extends CollectionName>(name: K, updater: (list: AppData[K]) => AppData[K]) {
        const previousList = data[name];
        const updated = updater(previousList);
        setData((current) => ({ ...current, [name]: updated }));

        try {
            const saved = await syncCollection(name, previousList, updated);
            setData((current) => ({ ...current, [name]: saved }));
            return saved;
        } catch {
            setData((current) => ({ ...current, [name]: previousList }));
            notify("Não foi possível salvar as alterações no servidor.", "danger");
            return undefined;
        }
    }

    async function addWithId<K extends CollectionName>(name: K, record: Omit<AppData[K][number], "id">) {
        try {
            const saved = await createRecord(name, record);
            setData((current) => ({ ...current, [name]: [...current[name], saved] }));
            notify("Registro salvo com sucesso.");
        } catch {
            notify("Não foi possível salvar o registro no servidor.", "danger");
        }
    }

    async function removeById<K extends CollectionName>(name: K, id: RecordId) {
        if (!window.confirm("Deseja excluir este registro?")) {
            return;
        }

        const previousList = data[name];
        const updated = (previousList as unknown as WithId[]).filter((item) => Number(item.id) !== Number(id)) as unknown as AppData[K];
        setData((current) => ({ ...current, [name]: updated }));

        try {
            await deleteRecord(name, id);
            notify("Registro removido com sucesso.", "warning");
        } catch {
            setData((current) => ({ ...current, [name]: previousList }));
            notify("Não foi possível remover o registro no servidor.", "danger");
        }
    }

    async function updateById<K extends CollectionName>(name: K, id: RecordId, patch: Partial<AppData[K][number]>) {
        try {
            const saved = await updateRecord(name, id, patch);
            setData((current) => ({
                ...current,
                [name]: (current[name] as unknown as WithId[]).map((item) => {
                    return Number(item.id) === Number(id) ? saved : item;
                }) as unknown as AppData[K]
            }));
            notify("Registro atualizado com sucesso.");
        } catch {
            notify("Não foi possível atualizar o registro no servidor.", "danger");
        }
    }

    function navigateToSection(section: string) {
        navigate(sectionPaths[section] ?? "/");
    }

    const props: PageProps = { data, addWithId, updateById, removeById, updateCollection, notify, navigate: navigateToSection };

    return (
        <>
            <Layout sections={sections} currentSection={currentSection} onNavigate={navigateToSection}>
                {alert && <div className={`alert alert-${alert.type} floating-alert shadow-sm`} role="alert">{alert.message}</div>}
                {loading ? (
                    <section className="panel text-center text-muted">Carregando dados...</section>
                ) : error ? (
                    <section className="panel text-center">
                        <p className="text-danger mb-3">{error}</p>
                        <button className="btn btn-primary" type="button" onClick={() => void refreshData()}>Tentar novamente</button>
                    </section>
                ) : (
                    <Routes>
                        <Route path="/" element={<CurrentSection section="dashboard" {...props} />} />
                        {sections.filter((section) => section.id !== "dashboard").map((section) => (
                            <Route
                                path={sectionPaths[section.id]}
                                element={<CurrentSection section={section.id} {...props} />}
                                key={section.id}
                            />
                        ))}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                )}
            </Layout>
        </>
    );
}
