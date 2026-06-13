import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import type { AppData, CollectionName, RecordId } from "./models/types";
import type { PageProps } from "./pages/pageTypes";
import { AppRoutes } from "./router/AppRoutes";
import { getPathBySection, getSectionByPath, sections } from "./router/routes";
import { createRecord, deleteRecord, emptyAppData, fetchAppData, updateRecord } from "./services/api";

type AlertState = { message: string; type: "success" | "warning" | "danger" } | null;
type WithId = { id: RecordId };

export function App() {
    // Identifica a pagina atual pela URL.
    const location = useLocation();
    const navigate = useNavigate();
    const currentSection = getSectionByPath(location.pathname);

    // Estado principal compartilhado entre todas as paginas.
    const [data, setData] = useState<AppData>(emptyAppData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState>(null);

    useEffect(() => {
        void refreshData();
    }, []);

    // Busca todas as colecoes no JSON Server.
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

    // Cria um registro novo na API e atualiza a tela.
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

    // Remove primeiro da tela e restaura se a API falhar.
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

    // Atualiza um registro existente pelo id.
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

    function navigateToSection(section: string) {
        navigate(getPathBySection(section));
    }

    // Props reutilizadas pelas paginas de CRUD.
    const props: PageProps = { data, addWithId, addDirect, updateById, removeById, removeDirect, notify, navigate: navigateToSection };

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
                    <AppRoutes {...props} />
                )}
            </Layout>
        </>
    );
}
