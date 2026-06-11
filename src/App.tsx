import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CrudPage } from "./components/CrudPage";
import { Layout } from "./components/Layout";
import type {
    AppData,
    Assinatura,
    Aula,
    Avaliacao,
    Categoria,
    Certificado,
    CollectionName,
    Curso,
    Matricula,
    Modulo,
    Pagamento,
    Plano,
    RecordId,
    Trilha,
    TrilhaCurso,
    Usuario
} from "./models/types";
import { sectionByPath, sectionPaths, sections } from "./pages/routes";
import { createRecord, deleteRecord, emptyAppData, fetchAppData, syncCollection, updateRecord } from "./services/api";
import { nameById, nextId, normalize, sameId, todayISO } from "./utils";

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

interface PageProps {
    data: AppData;
    addWithId: <K extends CollectionName>(name: K, record: Omit<AppData[K][number], "id">) => Promise<void>;
    updateById: <K extends CollectionName>(name: K, id: RecordId, patch: Partial<AppData[K][number]>) => Promise<void>;
    removeById: <K extends CollectionName>(name: K, id: RecordId) => Promise<void>;
    updateCollection: <K extends CollectionName>(name: K, updater: (list: AppData[K]) => AppData[K]) => Promise<AppData[K] | undefined>;
    notify: (message: string, type?: "success" | "warning" | "danger") => void;
    navigate: (section: string) => void;
}

function CurrentSection({ section, ...props }: PageProps & { section: string }) {
    const pages: Record<string, (props: PageProps) => ReactNode> = {
        dashboard: DashboardPage,
        categorias: CategoriesPage,
        cursos: CoursesPage,
        modulos: ModulesPage,
        aulas: LessonsPage,
        trilhas: TracksPage,
        usuarios: UsersPage,
        matriculas: EnrollmentsPage,
        progresso: ProgressPage,
        avaliacoes: ReviewsPage,
        certificados: CertificatesPage,
        planos: PlansPage,
        assinaturas: SubscriptionsPage,
        pagamentos: PaymentsPage
    };
    const Page = pages[section] ?? DashboardPage;
    return <Page {...props} />;
}

function DashboardPage({ data, navigate }: PageProps) {
    const cards = [
        { title: "Cursos", value: data.cursos.length, section: "cursos" },
        { title: "Usuários", value: data.usuarios.length, section: "usuarios" },
        { title: "Matrículas", value: data.matriculas.length, section: "matriculas" },
        { title: "Pagamentos", value: data.pagamentos.length, section: "pagamentos" }
    ];

    return (
        <>
            <section className="panel hero-panel">
                <h1>Plataforma de Cursos</h1>
                <p>Aplicação React com TypeScript para gerenciar cursos, usuários, progresso e pagamentos.</p>
                <button className="btn btn-primary px-4" type="button" onClick={() => navigate("cursos")}>Gerenciar cursos</button>
            </section>
            <section className="stats-grid">
                {cards.map((card) => (
                    <button className="stat-card" type="button" onClick={() => navigate(card.section)} key={card.title}>
                        <span>{card.title}</span>
                        <strong>{card.value}</strong>
                    </button>
                ))}
            </section>
        </>
    );
}

function CategoriesPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    return (
        <CrudPage
            title="Categorias"
            description="Organize os cursos por área de conhecimento."
            initialValues={{ nome: "", descricao: "" }}
            fields={[
                { name: "nome", label: "Nome", required: true },
                { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
            ]}
            columns={[
                { key: "nome", label: "Nome" },
                { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
            ]}
            rows={data.categorias}
            emptyText="Nenhuma categoria cadastrada."
            onSubmit={(form) => {
                if (data.categorias.some((item) => normalize(item.nome) === normalize(form.nome))) {
                    notify("Já existe uma categoria com esse nome.", "danger");
                    return false;
                }
                addWithId("categorias", { nome: form.nome.trim(), descricao: form.descricao.trim() });
                return true;
            }}
            getEditValues={(item) => ({ nome: item.nome, descricao: item.descricao })}
            onUpdate={(item, form) => {
                const nome = form.nome.trim();
                if (data.categorias.some((category) => !sameId(category.id, item.id) && normalize(category.nome) === normalize(nome))) {
                    notify("Já existe uma categoria com esse nome.", "danger");
                    return false;
                }
                updateById("categorias", item.id, { nome, descricao: form.descricao.trim() });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("categorias", item.id)}>Excluir</ActionButton>}
        />
    );
}

function UsersPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    return (
        <CrudPage
            title="Usuários"
            description="Cadastre alunos e instrutores para uso nas demais telas."
            initialValues={{ nomeCompleto: "", email: "", senha: "", dataCadastro: todayISO(), tipoUsuario: "Aluno" }}
            fields={[
                { name: "nomeCompleto", label: "Nome completo", required: true },
                { name: "email", label: "E-mail", type: "email", required: true },
                { name: "senha", label: "Senha", type: "password", required: true },
                { name: "dataCadastro", label: "Data de cadastro", type: "date", required: true },
                { name: "tipoUsuario", label: "Tipo", type: "select", required: true, options: [{ value: "Aluno", label: "Aluno" }, { value: "Instrutor", label: "Instrutor" }] }
            ]}
            columns={[
                { key: "nomeCompleto", label: "Nome" },
                { key: "email", label: "E-mail" },
                { key: "tipoUsuario", label: "Tipo" },
                { key: "dataCadastro", label: "Cadastro" }
            ]}
            rows={data.usuarios}
            emptyText="Nenhum usuário cadastrado."
            onSubmit={(form) => {
                if (data.usuarios.some((item) => normalize(item.email) === normalize(form.email))) {
                    notify("Já existe um usuário com esse e-mail.", "danger");
                    return false;
                }
                addWithId("usuarios", { ...form, email: normalize(form.email), tipoUsuario: form.tipoUsuario as Usuario["tipoUsuario"] });
                return true;
            }}
            getEditValues={(item) => ({
                nomeCompleto: item.nomeCompleto,
                email: item.email,
                senha: item.senha,
                dataCadastro: item.dataCadastro,
                tipoUsuario: item.tipoUsuario
            })}
            onUpdate={(item, form) => {
                const email = normalize(form.email);
                if (data.usuarios.some((user) => !sameId(user.id, item.id) && normalize(user.email) === email)) {
                    notify("Já existe um usuário com esse e-mail.", "danger");
                    return false;
                }
                updateById("usuarios", item.id, { ...form, email, tipoUsuario: form.tipoUsuario as Usuario["tipoUsuario"] });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("usuarios", item.id)}>Excluir</ActionButton>}
        />
    );
}

function PlansPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    return (
        <CrudPage
            title="Planos"
            description="Defina planos para simular assinaturas e pagamentos."
            initialValues={{ nome: "", descricao: "", preco: "", duracaoMeses: "" }}
            fields={[
                { name: "nome", label: "Nome", required: true },
                { name: "preco", label: "Preço", type: "number", min: 0, step: "0.01", required: true },
                { name: "duracaoMeses", label: "Duração em meses", type: "number", min: 1, required: true },
                { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
            ]}
            columns={[
                { key: "nome", label: "Nome" },
                { key: "preco", label: "Preço", render: (item) => money(item.preco) },
                { key: "duracaoMeses", label: "Duração", render: (item) => `${item.duracaoMeses} meses` },
                { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
            ]}
            rows={data.planos}
            emptyText="Nenhum plano cadastrado."
            onSubmit={(form) => {
                if (data.planos.some((item) => normalize(item.nome) === normalize(form.nome))) {
                    notify("Já existe um plano com esse nome.", "danger");
                    return false;
                }
                addWithId("planos", { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Number(form.preco), duracaoMeses: Number(form.duracaoMeses) });
                return true;
            }}
            getEditValues={(item) => ({
                nome: item.nome,
                descricao: item.descricao,
                preco: String(item.preco),
                duracaoMeses: String(item.duracaoMeses)
            })}
            onUpdate={(item, form) => {
                if (data.planos.some((plan) => !sameId(plan.id, item.id) && normalize(plan.nome) === normalize(form.nome))) {
                    notify("Já existe um plano com esse nome.", "danger");
                    return false;
                }
                updateById("planos", item.id, { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Number(form.preco), duracaoMeses: Number(form.duracaoMeses) });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("planos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function CoursesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const instructors = data.usuarios.filter((user) => user.tipoUsuario === "Instrutor");
    const rows = data.cursos.map((course) => courseSummary(data, course));

    return (
        <CrudPage
            title="Cursos"
            description="Cadastre cursos e vincule categoria e instrutor."
            initialValues={{ titulo: "", descricao: "", nivel: "", idCategoria: "", idInstrutor: "", dataPublicacao: todayISO() }}
            fields={[
                { name: "titulo", label: "Título", required: true },
                { name: "nivel", label: "Nível", type: "select", required: true, options: ["Iniciante", "Intermediário", "Avançado"].map((level) => ({ value: level, label: level })) },
                { name: "idCategoria", label: "Categoria", type: "select", required: true, options: data.categorias.map((item) => ({ value: item.id, label: item.nome })), actionLabel: "+ Categoria", onAction: () => quickCreateCategory({ data, addWithId, notify }) },
                { name: "idInstrutor", label: "Instrutor", type: "select", required: true, options: instructors.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Instrutor", onAction: () => quickCreateUser({ data, addWithId, notify }, "Instrutor") },
                { name: "dataPublicacao", label: "Data de publicação", type: "date", required: true },
                { name: "descricao", label: "Descrição", type: "textarea", col: "col-12", required: true }
            ]}
            columns={[
                { key: "titulo", label: "Título" },
                { key: "categoriaNome", label: "Categoria" },
                { key: "instrutorNome", label: "Instrutor" },
                { key: "nivel", label: "Nível" },
                { key: "totalAulas", label: "Aulas" },
                { key: "totalHoras", label: "Horas", render: (item) => `${item.totalHoras} h` }
            ]}
            rows={rows}
            emptyText="Nenhum curso cadastrado."
            onSubmit={(form) => {
                if (!data.categorias.length || !instructors.length) {
                    notify("Cadastre ao menos uma categoria e um instrutor antes do curso.", "danger");
                    return false;
                }
                addWithId("cursos", {
                    titulo: form.titulo.trim(),
                    descricao: form.descricao.trim(),
                    nivel: form.nivel as Curso["nivel"],
                    idCategoria: Number(form.idCategoria),
                    idInstrutor: Number(form.idInstrutor),
                    dataPublicacao: form.dataPublicacao,
                    totalAulas: 0,
                    totalHoras: 0
                });
                return true;
            }}
            getEditValues={(item) => ({
                titulo: item.titulo,
                descricao: item.descricao,
                nivel: item.nivel,
                idCategoria: String(item.idCategoria),
                idInstrutor: String(item.idInstrutor),
                dataPublicacao: item.dataPublicacao
            })}
            onUpdate={(item, form) => {
                updateById("cursos", item.id, {
                    titulo: form.titulo.trim(),
                    descricao: form.descricao.trim(),
                    nivel: form.nivel as Curso["nivel"],
                    idCategoria: Number(form.idCategoria),
                    idInstrutor: Number(form.idInstrutor),
                    dataPublicacao: form.dataPublicacao
                });
                return true;
            }}
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2">
                    <ActionButton onClick={() => navigate("modulos")}>Módulos</ActionButton>
                    <ActionButton danger onClick={() => removeById("cursos", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

function ModulesPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.modulos.map((item) => ({ ...item, cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Módulos"
            description="Organize módulos dentro dos cursos."
            initialValues={{ idCurso: "", titulo: "", ordem: "" }}
            fields={[
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })), actionLabel: "+ Curso", onAction: () => quickCreateCourse({ data, addWithId, notify }) },
                { name: "titulo", label: "Título", required: true },
                { name: "ordem", label: "Ordem", type: "number", min: 1, required: true }
            ]}
            columns={[
                { key: "cursoNome", label: "Curso" },
                { key: "titulo", label: "Módulo" },
                { key: "ordem", label: "Ordem" }
            ]}
            rows={rows}
            emptyText="Nenhum módulo cadastrado."
            onSubmit={(form) => {
                const idCurso = Number(form.idCurso);
                const ordem = Number(form.ordem);
                if (data.modulos.some((item) => sameId(item.idCurso, idCurso) && Number(item.ordem) === ordem)) {
                    notify("Já existe um módulo com essa ordem neste curso.", "danger");
                    return false;
                }
                addWithId("modulos", { idCurso, titulo: form.titulo.trim(), ordem });
                return true;
            }}
            getEditValues={(item) => ({ idCurso: String(item.idCurso), titulo: item.titulo, ordem: String(item.ordem) })}
            onUpdate={(item, form) => {
                const idCurso = Number(form.idCurso);
                const ordem = Number(form.ordem);
                if (data.modulos.some((module) => !sameId(module.id, item.id) && sameId(module.idCurso, idCurso) && Number(module.ordem) === ordem)) {
                    notify("Já existe um módulo com essa ordem neste curso.", "danger");
                    return false;
                }
                updateById("modulos", item.id, { idCurso, titulo: form.titulo.trim(), ordem });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("modulos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function LessonsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.aulas.map((lesson) => {
        const module = data.modulos.find((item) => sameId(item.id, lesson.idModulo));
        return {
            ...lesson,
            moduloNome: module?.titulo ?? "-",
            cursoNome: module ? nameById(data.cursos, module.idCurso, "titulo") : "-"
        };
    });

    return (
        <CrudPage
            title="Aulas"
            description="Cadastre aulas dentro dos módulos."
            initialValues={{ idModulo: "", titulo: "", tipoConteudo: "", urlConteudo: "", duracaoMinutos: "", ordem: "" }}
            fields={[
                { name: "idModulo", label: "Módulo", type: "select", required: true, options: data.modulos.map((item) => ({ value: item.id, label: `${nameById(data.cursos, item.idCurso, "titulo")} - ${item.titulo}` })), actionLabel: "+ Módulo", onAction: () => quickCreateModule({ data, addWithId, notify }) },
                { name: "titulo", label: "Título", required: true },
                { name: "tipoConteudo", label: "Tipo", type: "select", required: true, options: ["Vídeo", "Texto", "Quiz"].map((type) => ({ value: type, label: type })) },
                { name: "duracaoMinutos", label: "Duração em minutos", type: "number", min: 1, required: true },
                { name: "ordem", label: "Ordem", type: "number", min: 1, required: true },
                { name: "urlConteudo", label: "URL do conteúdo", type: "url", col: "col-12" }
            ]}
            columns={[
                { key: "cursoNome", label: "Curso" },
                { key: "moduloNome", label: "Módulo" },
                { key: "titulo", label: "Aula" },
                { key: "tipoConteudo", label: "Tipo" },
                { key: "duracaoMinutos", label: "Duração", render: (item) => `${item.duracaoMinutos} min` },
                { key: "ordem", label: "Ordem" }
            ]}
            rows={rows}
            emptyText="Nenhuma aula cadastrada."
            onSubmit={(form) => {
                const idModulo = Number(form.idModulo);
                const ordem = Number(form.ordem);
                if (data.aulas.some((item) => sameId(item.idModulo, idModulo) && Number(item.ordem) === ordem)) {
                    notify("Já existe uma aula com essa ordem neste módulo.", "danger");
                    return false;
                }
                addWithId("aulas", {
                    idModulo,
                    titulo: form.titulo.trim(),
                    tipoConteudo: form.tipoConteudo as Aula["tipoConteudo"],
                    urlConteudo: form.urlConteudo.trim(),
                    duracaoMinutos: Number(form.duracaoMinutos),
                    ordem
                });
                return true;
            }}
            getEditValues={(item) => ({
                idModulo: String(item.idModulo),
                titulo: item.titulo,
                tipoConteudo: item.tipoConteudo,
                urlConteudo: item.urlConteudo,
                duracaoMinutos: String(item.duracaoMinutos),
                ordem: String(item.ordem)
            })}
            onUpdate={(item, form) => {
                const idModulo = Number(form.idModulo);
                const ordem = Number(form.ordem);
                if (data.aulas.some((lesson) => !sameId(lesson.id, item.id) && sameId(lesson.idModulo, idModulo) && Number(lesson.ordem) === ordem)) {
                    notify("Já existe uma aula com essa ordem neste módulo.", "danger");
                    return false;
                }
                updateById("aulas", item.id, {
                    idModulo,
                    titulo: form.titulo.trim(),
                    tipoConteudo: form.tipoConteudo as Aula["tipoConteudo"],
                    urlConteudo: form.urlConteudo.trim(),
                    duracaoMinutos: Number(form.duracaoMinutos),
                    ordem
                });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("aulas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function TracksPage({ data, addWithId, updateById, removeById, updateCollection, notify }: PageProps) {
    const [linkForm, setLinkForm] = useState({ idTrilha: "", idCurso: "", ordem: "" });
    const links = data.trilhasCursos.map((item) => ({
        ...item,
        trilhaNome: nameById(data.trilhas, item.idTrilha, "titulo"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));

    async function submitLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const idTrilha = Number(linkForm.idTrilha);
        const idCurso = Number(linkForm.idCurso);
        if (data.trilhasCursos.some((item) => sameId(item.idTrilha, idTrilha) && sameId(item.idCurso, idCurso))) {
            notify("Esse curso já está vinculado a essa trilha.", "danger");
            return;
        }
        await updateCollection("trilhasCursos", (list) => [...list, { id: nextId(list), idTrilha, idCurso, ordem: Number(linkForm.ordem) }]);
        setLinkForm({ idTrilha: "", idCurso: "", ordem: "" });
        notify("Curso vinculado à trilha.");
    }

    return (
        <>
            <CrudPage
                title="Trilhas"
                description="Crie trilhas de conhecimento e relacione cursos."
                initialValues={{ titulo: "", descricao: "", idCategoria: "" }}
                fields={[
                    { name: "titulo", label: "Título", required: true },
                    { name: "idCategoria", label: "Categoria", type: "select", required: true, options: data.categorias.map((item) => ({ value: item.id, label: item.nome })), actionLabel: "+ Categoria", onAction: () => quickCreateCategory({ data, addWithId, notify }) },
                    { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
                ]}
                columns={[
                    { key: "titulo", label: "Título" },
                    { key: "categoria", label: "Categoria", render: (item) => nameById(data.categorias, item.idCategoria, "nome") },
                    { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
                ]}
                rows={data.trilhas}
                emptyText="Nenhuma trilha cadastrada."
                onSubmit={(form) => {
                    addWithId("trilhas", { titulo: form.titulo.trim(), descricao: form.descricao.trim(), idCategoria: Number(form.idCategoria) });
                    return true;
                }}
                getEditValues={(item) => ({
                    titulo: item.titulo,
                    descricao: item.descricao,
                    idCategoria: String(item.idCategoria)
                })}
                onUpdate={(item, form) => {
                    updateById("trilhas", item.id, { titulo: form.titulo.trim(), descricao: form.descricao.trim(), idCategoria: Number(form.idCategoria) });
                    return true;
                }}
                renderActions={(item) => <ActionButton danger onClick={() => removeById("trilhas", item.id)}>Excluir</ActionButton>}
            />
            <section className="panel">
                <h2 className="h5 mb-3">Cursos da trilha</h2>
                <form className="row g-3" onSubmit={submitLink}>
                    <SelectInput label="Trilha" value={linkForm.idTrilha} required options={data.trilhas.map((item) => ({ value: item.id, label: item.titulo }))} actionLabel="+ Trilha" onAction={() => quickCreateTrack({ data, addWithId, notify })} onChange={(value) => setLinkForm((current) => ({ ...current, idTrilha: value }))} />
                    <SelectInput label="Curso" value={linkForm.idCurso} required options={data.cursos.map((item) => ({ value: item.id, label: item.titulo }))} actionLabel="+ Curso" onAction={() => quickCreateCourse({ data, addWithId, notify })} onChange={(value) => setLinkForm((current) => ({ ...current, idCurso: value }))} />
                    <TextInput label="Ordem" value={linkForm.ordem} required type="number" onChange={(value) => setLinkForm((current) => ({ ...current, ordem: value }))} />
                    <div className="col-12"><button className="btn btn-primary" type="submit">Vincular</button></div>
                </form>
            </section>
            <SimpleTable
                columns={["Trilha", "Curso", "Ordem", "Ações"]}
                emptyText="Nenhum curso vinculado a trilhas."
                rows={links.map((item) => [
                    item.trilhaNome,
                    item.cursoNome,
                    item.ordem,
                    <ActionButton danger onClick={() => updateCollection("trilhasCursos", (list) => list.filter((record) => !(sameId(record.idTrilha, item.idTrilha) && sameId(record.idCurso, item.idCurso))))}>Excluir</ActionButton>
                ])}
            />
        </>
    );
}

function EnrollmentsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.matriculas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Matrículas"
            description="Simule a matrícula de usuários em cursos."
            initialValues={{ idUsuario: "", idCurso: "", dataMatricula: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Usuário", onAction: () => quickCreateUser({ data, addWithId, notify }) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })), actionLabel: "+ Curso", onAction: () => quickCreateCourse({ data, addWithId, notify }) },
                { name: "dataMatricula", label: "Data", type: "date", required: true }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "cursoNome", label: "Curso" },
                { key: "dataMatricula", label: "Data" }
            ]}
            rows={rows}
            emptyText="Nenhuma matrícula cadastrada."
            onSubmit={(form) => {
                const idUsuario = Number(form.idUsuario);
                const idCurso = Number(form.idCurso);
                if (data.matriculas.some((item) => sameId(item.idUsuario, idUsuario) && sameId(item.idCurso, idCurso))) {
                    notify("Esse usuário já está matriculado nesse curso.", "danger");
                    return false;
                }
                addWithId("matriculas", { idUsuario, idCurso, dataMatricula: form.dataMatricula, dataConclusao: null });
                return true;
            }}
            getEditValues={(item) => ({
                idUsuario: String(item.idUsuario),
                idCurso: String(item.idCurso),
                dataMatricula: item.dataMatricula
            })}
            onUpdate={(item, form) => {
                const idUsuario = Number(form.idUsuario);
                const idCurso = Number(form.idCurso);
                if (data.matriculas.some((enrollment) => !sameId(enrollment.id, item.id) && sameId(enrollment.idUsuario, idUsuario) && sameId(enrollment.idCurso, idCurso))) {
                    notify("Esse usuário já está matriculado nesse curso.", "danger");
                    return false;
                }
                updateById("matriculas", item.id, { idUsuario, idCurso, dataMatricula: form.dataMatricula });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("matriculas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function ProgressPage({ data, addWithId, updateCollection, notify }: PageProps) {
    const [selectedUserId, setSelectedUserId] = useState("");
    const idUsuario = Number(selectedUserId);
    const selectedUser = data.usuarios.find((item) => sameId(item.id, idUsuario));

    function isLessonDone(idAula: RecordId) {
        return data.progressoAulas.some((item) => {
            return sameId(item.idUsuario, idUsuario) && sameId(item.idAula, idAula) && normalize(item.status).includes("concl");
        });
    }

    async function toggleLesson(idAula: RecordId, checked: boolean) {
        if (!idUsuario) {
            notify("Selecione um aluno antes de marcar aulas.", "danger");
            return;
        }

        updateCollection("progressoAulas", (list) => {
            const withoutCurrent = list.filter((item) => !(sameId(item.idUsuario, idUsuario) && sameId(item.idAula, idAula)));
            if (!checked) {
                return withoutCurrent;
            }

            return [...withoutCurrent, { id: nextId(list), idUsuario, idAula: Number(idAula), status: "Concluído", dataConclusao: todayISO() }];
        });
    }

    function courseProgress(course: Curso) {
        const modules = data.modulos.filter((module) => sameId(module.idCurso, course.id));
        const lessons = data.aulas.filter((lesson) => modules.some((module) => sameId(module.id, lesson.idModulo)));
        const done = lessons.filter((lesson) => isLessonDone(lesson.id)).length;
        return { done, total: lessons.length };
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Progresso</h1>
                <p className="text-muted mb-0">Selecione um aluno e marque as aulas concluídas em cada curso.</p>
            </section>
            <section className="panel">
                <div className="row g-3 align-items-end">
                    <SelectInput
                        label="Aluno"
                        value={selectedUserId}
                        required
                        options={data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto }))}
                        actionLabel="+ Aluno"
                        onAction={() => quickCreateUser({ data, addWithId, notify })}
                        onChange={setSelectedUserId}
                    />
                    <div className="col-12 col-md-6">
                        <p className="progress-summary mb-0">
                            {selectedUser ? `Aluno selecionado: ${selectedUser.nomeCompleto}` : "Nenhum aluno selecionado."}
                        </p>
                    </div>
                </div>
            </section>
            <section className="progress-tree">
                {data.cursos.length === 0 ? (
                    <div className="panel text-center text-muted">Nenhum curso cadastrado.</div>
                ) : data.cursos.map((course) => {
                    const modules = data.modulos.filter((module) => sameId(module.idCurso, course.id)).sort((a, b) => a.ordem - b.ordem);
                    const summary = courseProgress(course);
                    return (
                        <article className="panel course-progress" key={course.id}>
                            <div className="course-progress-header">
                                <div>
                                    <h2 className="h5 mb-1">{course.titulo}</h2>
                                    <p className="text-muted mb-0">{nameById(data.categorias, course.idCategoria, "nome")}</p>
                                </div>
                                <span className="progress-pill">{summary.done}/{summary.total} aulas</span>
                            </div>
                            {modules.length === 0 ? (
                                <p className="text-muted mb-0">Nenhum módulo cadastrado neste curso.</p>
                            ) : modules.map((module) => {
                                const lessons = data.aulas.filter((lesson) => sameId(lesson.idModulo, module.id)).sort((a, b) => a.ordem - b.ordem);
                                return (
                                    <div className="module-progress" key={module.id}>
                                        <h3 className="h6 mb-2">{module.ordem}. {module.titulo}</h3>
                                        {lessons.length === 0 ? (
                                            <p className="text-muted mb-0">Nenhuma aula cadastrada neste módulo.</p>
                                        ) : (
                                            <div className="lesson-checklist">
                                                {lessons.map((lesson) => (
                                                    <label className="lesson-checkbox" key={lesson.id}>
                                                        <input
                                                            type="checkbox"
                                                            disabled={!idUsuario}
                                                            checked={idUsuario ? isLessonDone(lesson.id) : false}
                                                            onChange={(event) => toggleLesson(lesson.id, event.target.checked)}
                                                        />
                                                        <span>
                                                            <strong>{lesson.ordem}. {lesson.titulo}</strong>
                                                            <small>{lesson.tipoConteudo} · {lesson.duracaoMinutos} min</small>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </article>
                    );
                })}
            </section>
        </>
    );
}

function ReviewsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.avaliacoes.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Avaliações"
            description="Registre avaliações de usuários para os cursos."
            initialValues={{ idUsuario: "", idCurso: "", nota: "", comentario: "", dataAvaliacao: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Usuário", onAction: () => quickCreateUser({ data, addWithId, notify }) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })), actionLabel: "+ Curso", onAction: () => quickCreateCourse({ data, addWithId, notify }) },
                { name: "nota", label: "Nota", type: "select", required: true, options: [1, 2, 3, 4, 5].map((item) => ({ value: item, label: String(item) })) },
                { name: "dataAvaliacao", label: "Data", type: "date", required: true },
                { name: "comentario", label: "Comentário", type: "textarea", col: "col-12" }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "cursoNome", label: "Curso" },
                { key: "nota", label: "Nota" },
                { key: "comentario", label: "Comentário", render: (item) => item.comentario || "-" },
                { key: "dataAvaliacao", label: "Data" }
            ]}
            rows={rows}
            emptyText="Nenhuma avaliação cadastrada."
            onSubmit={(form) => {
                addWithId("avaliacoes", { idUsuario: Number(form.idUsuario), idCurso: Number(form.idCurso), nota: Number(form.nota), comentario: form.comentario.trim(), dataAvaliacao: form.dataAvaliacao });
                return true;
            }}
            getEditValues={(item) => ({
                idUsuario: String(item.idUsuario),
                idCurso: String(item.idCurso),
                nota: String(item.nota),
                comentario: item.comentario,
                dataAvaliacao: item.dataAvaliacao
            })}
            onUpdate={(item, form) => {
                updateById("avaliacoes", item.id, {
                    idUsuario: Number(form.idUsuario),
                    idCurso: Number(form.idCurso),
                    nota: Number(form.nota),
                    comentario: form.comentario.trim(),
                    dataAvaliacao: form.dataAvaliacao
                });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("avaliacoes", item.id)}>Excluir</ActionButton>}
        />
    );
}

function CertificatesPage({ data, addWithId, updateById, updateCollection, notify }: PageProps) {
    const rows = data.certificados.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    function hasCompletedProgress(idUsuario: number, idCurso: number) {
        const courseModules = data.modulos.filter((module) => sameId(module.idCurso, idCurso));
        const lessonIds = data.aulas.filter((lesson) => courseModules.some((module) => sameId(module.id, lesson.idModulo))).map((lesson) => lesson.id);
        return data.progressoAulas.some((progress) => sameId(progress.idUsuario, idUsuario) && lessonIds.some((idAula) => sameId(idAula, progress.idAula)) && normalize(progress.status).includes("concl"));
    }

    return (
        <CrudPage
            title="Certificados"
            description="Gere certificados para usuários com progresso concluído no curso."
            initialValues={{ idUsuario: "", idCurso: "", dataEmissao: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Usuário", onAction: () => quickCreateUser({ data, addWithId, notify }) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })), actionLabel: "+ Curso", onAction: () => quickCreateCourse({ data, addWithId, notify }) },
                { name: "dataEmissao", label: "Data de emissão", type: "date", required: true }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "cursoNome", label: "Curso" },
                { key: "codigoVerificacao", label: "Código" },
                { key: "dataEmissao", label: "Emissão" }
            ]}
            rows={rows}
            emptyText="Nenhum certificado gerado."
            onSubmit={(form) => {
                const idUsuario = Number(form.idUsuario);
                const idCurso = Number(form.idCurso);
                if (data.certificados.some((item) => sameId(item.idUsuario, idUsuario) && sameId(item.idCurso, idCurso))) {
                    notify("Já existe certificado para esse usuário nesse curso.", "danger");
                    return false;
                }
                if (!hasCompletedProgress(idUsuario, idCurso)) {
                    notify("Registre progresso concluído em uma aula desse curso antes de gerar certificado.", "danger");
                    return false;
                }
                updateCollection("certificados", (list) => {
                    const id = nextId(list);
                    return [...list, { id, idUsuario, idCurso, idTrilha: null, codigoVerificacao: `CERT-${String(id).padStart(3, "0")}`, dataEmissao: form.dataEmissao }];
                });
                notify("Certificado gerado com sucesso.");
                return true;
            }}
            getEditValues={(item) => ({
                idUsuario: String(item.idUsuario),
                idCurso: String(item.idCurso),
                dataEmissao: item.dataEmissao
            })}
            onUpdate={(item, form) => {
                const idUsuario = Number(form.idUsuario);
                const idCurso = Number(form.idCurso);
                if (data.certificados.some((certificate) => !sameId(certificate.id, item.id) && sameId(certificate.idUsuario, idUsuario) && sameId(certificate.idCurso, idCurso))) {
                    notify("Já existe certificado para esse usuário nesse curso.", "danger");
                    return false;
                }
                updateById("certificados", item.id, { idUsuario, idCurso, dataEmissao: form.dataEmissao });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => updateCollection("certificados", (list) => list.filter((record) => !sameId(record.id, item.id)))}>Excluir</ActionButton>}
        />
    );
}

function SubscriptionsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.assinaturas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), planoNome: nameById(data.planos, item.idPlano, "nome") }));

    return (
        <CrudPage
            title="Assinaturas"
            description="Vincule usuários a planos por período."
            initialValues={{ idUsuario: "", idPlano: "", dataInicio: todayISO(), dataFim: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Usuário", onAction: () => quickCreateUser({ data, addWithId, notify }) },
                { name: "idPlano", label: "Plano", type: "select", required: true, options: data.planos.map((item) => ({ value: item.id, label: item.nome })), actionLabel: "+ Plano", onAction: () => quickCreatePlan({ data, addWithId, notify }) },
                { name: "dataInicio", label: "Início", type: "date", required: true },
                { name: "dataFim", label: "Fim", type: "date", required: true }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "planoNome", label: "Plano" },
                { key: "dataInicio", label: "Início" },
                { key: "dataFim", label: "Fim" }
            ]}
            rows={rows}
            emptyText="Nenhuma assinatura cadastrada."
            onSubmit={(form) => {
                addWithId("assinaturas", { idUsuario: Number(form.idUsuario), idPlano: Number(form.idPlano), dataInicio: form.dataInicio, dataFim: form.dataFim });
                return true;
            }}
            getEditValues={(item) => ({
                idUsuario: String(item.idUsuario),
                idPlano: String(item.idPlano),
                dataInicio: item.dataInicio,
                dataFim: item.dataFim
            })}
            onUpdate={(item, form) => {
                updateById("assinaturas", item.id, { idUsuario: Number(form.idUsuario), idPlano: Number(form.idPlano), dataInicio: form.dataInicio, dataFim: form.dataFim });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("assinaturas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function PaymentsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.pagamentos.map((item) => ({ ...item, assinaturaNome: subscriptionDescription(data, item.idAssinatura) }));

    return (
        <CrudPage
            title="Pagamentos"
            description="Registre pagamentos simulados para assinaturas."
            initialValues={{ idAssinatura: "", valorPago: "", dataPagamento: todayISO(), metodoPagamento: "", idTransacaoGateway: "" }}
            fields={[
                { name: "idAssinatura", label: "Assinatura", type: "select", required: true, options: data.assinaturas.map((item) => ({ value: item.id, label: subscriptionDescription(data, item.id) })), actionLabel: "+ Assinatura", onAction: () => quickCreateSubscription({ data, addWithId, notify }) },
                { name: "valorPago", label: "Valor pago", type: "number", min: 0, step: "0.01", required: true },
                { name: "dataPagamento", label: "Data", type: "date", required: true },
                { name: "metodoPagamento", label: "Método", type: "select", required: true, options: ["Cartão", "Pix", "Boleto"].map((item) => ({ value: item, label: item })) },
                { name: "idTransacaoGateway", label: "ID da transação", required: true }
            ]}
            columns={[
                { key: "assinaturaNome", label: "Assinatura" },
                { key: "valorPago", label: "Valor", render: (item) => money(item.valorPago) },
                { key: "dataPagamento", label: "Data" },
                { key: "metodoPagamento", label: "Método" },
                { key: "idTransacaoGateway", label: "Transação" }
            ]}
            rows={rows}
            emptyText="Nenhum pagamento cadastrado."
            onSubmit={(form) => {
                if (data.pagamentos.some((item) => normalize(item.idTransacaoGateway) === normalize(form.idTransacaoGateway))) {
                    notify("Já existe pagamento com esse ID de transação.", "danger");
                    return false;
                }
                addWithId("pagamentos", {
                    idAssinatura: Number(form.idAssinatura),
                    valorPago: Number(form.valorPago),
                    dataPagamento: form.dataPagamento,
                    metodoPagamento: form.metodoPagamento as Pagamento["metodoPagamento"],
                    idTransacaoGateway: form.idTransacaoGateway.trim()
                });
                return true;
            }}
            getEditValues={(item) => ({
                idAssinatura: String(item.idAssinatura),
                valorPago: String(item.valorPago),
                dataPagamento: item.dataPagamento,
                metodoPagamento: item.metodoPagamento,
                idTransacaoGateway: item.idTransacaoGateway
            })}
            onUpdate={(item, form) => {
                if (data.pagamentos.some((payment) => !sameId(payment.id, item.id) && normalize(payment.idTransacaoGateway) === normalize(form.idTransacaoGateway))) {
                    notify("Já existe pagamento com esse ID de transação.", "danger");
                    return false;
                }
                updateById("pagamentos", item.id, {
                    idAssinatura: Number(form.idAssinatura),
                    valorPago: Number(form.valorPago),
                    dataPagamento: form.dataPagamento,
                    metodoPagamento: form.metodoPagamento as Pagamento["metodoPagamento"],
                    idTransacaoGateway: form.idTransacaoGateway.trim()
                });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("pagamentos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function courseSummary(data: AppData, course: Curso) {
    const modules = data.modulos.filter((module) => sameId(module.idCurso, course.id));
    const lessons = data.aulas.filter((lesson) => modules.some((module) => sameId(module.id, lesson.idModulo)));
    const minutes = lessons.reduce((total, lesson) => total + lesson.duracaoMinutos, 0);
    return {
        ...course,
        categoriaNome: nameById(data.categorias, course.idCategoria, "nome"),
        instrutorNome: nameById(data.usuarios, course.idInstrutor, "nomeCompleto"),
        totalAulas: lessons.length,
        totalHoras: Number((minutes / 60).toFixed(1))
    };
}

function subscriptionDescription(data: AppData, idAssinatura: RecordId) {
    const subscription = data.assinaturas.find((item) => sameId(item.id, idAssinatura));
    if (!subscription) {
        return "-";
    }

    return `${nameById(data.usuarios, subscription.idUsuario, "nomeCompleto")} - ${nameById(data.planos, subscription.idPlano, "nome")}`;
}

function money(value: number) {
    return `R$ ${Number(value).toFixed(2)}`;
}

function promptRequired(label: string) {
    const value = window.prompt(label)?.trim() ?? "";
    return value;
}

function promptNumber(label: string, fallback = "1") {
    const value = Number(window.prompt(label, fallback));
    return Number.isFinite(value) && value > 0 ? value : null;
}

function promptChoice<T extends { id: RecordId }>(title: string, list: T[], label: (item: T) => string) {
    if (list.length === 0) {
        return null;
    }

    const options = list.map((item) => `${item.id} - ${label(item)}`).join("\n");
    const value = Number(window.prompt(`${title}\n${options}`));
    const exists = list.some((item) => Number(item.id) === value);
    return exists ? value : null;
}

type QuickCreateProps = Pick<PageProps, "data" | "addWithId" | "notify">;

function quickCreateCategory({ data, addWithId, notify }: QuickCreateProps) {
    const nome = promptRequired("Nome da categoria");
    if (!nome) {
        return;
    }
    if (data.categorias.some((item) => normalize(item.nome) === normalize(nome))) {
        notify("Já existe uma categoria com esse nome.", "danger");
        return;
    }
    const descricao = window.prompt("Descrição da categoria", "")?.trim() ?? "";
    addWithId("categorias", { nome, descricao });
}

function quickCreateUser({ data, addWithId, notify }: QuickCreateProps, tipoUsuario: Usuario["tipoUsuario"] = "Aluno") {
    const nomeCompleto = promptRequired(`Nome completo do ${tipoUsuario.toLowerCase()}`);
    if (!nomeCompleto) {
        return;
    }
    const email = normalize(promptRequired("E-mail"));
    if (!email) {
        return;
    }
    if (data.usuarios.some((item) => normalize(item.email) === email)) {
        notify("Já existe um usuário com esse e-mail.", "danger");
        return;
    }
    const senha = promptRequired("Senha");
    if (!senha) {
        return;
    }
    addWithId("usuarios", { nomeCompleto, email, senha, dataCadastro: todayISO(), tipoUsuario });
}

function quickCreatePlan({ data, addWithId, notify }: QuickCreateProps) {
    const nome = promptRequired("Nome do plano");
    if (!nome) {
        return;
    }
    if (data.planos.some((item) => normalize(item.nome) === normalize(nome))) {
        notify("Já existe um plano com esse nome.", "danger");
        return;
    }
    const preco = Number(window.prompt("Preço do plano", "0"));
    const duracaoMeses = Number(window.prompt("Duração em meses", "1"));
    if (!Number.isFinite(preco) || preco < 0 || !Number.isFinite(duracaoMeses) || duracaoMeses <= 0) {
        notify("Informe preço e duração válidos.", "danger");
        return;
    }
    const descricao = window.prompt("Descrição do plano", "")?.trim() ?? "";
    addWithId("planos", { nome, descricao, preco, duracaoMeses });
}

function quickCreateCourse(props: QuickCreateProps) {
    const { data, addWithId, notify } = props;
    const instructors = data.usuarios.filter((user) => user.tipoUsuario === "Instrutor");
    if (!data.categorias.length || !instructors.length) {
        notify("Crie ao menos uma categoria e um instrutor antes do curso.", "danger");
        return;
    }
    const titulo = promptRequired("Título do curso");
    if (!titulo) {
        return;
    }
    const idCategoria = promptChoice("Escolha a categoria pelo ID", data.categorias, (item) => item.nome);
    const idInstrutor = promptChoice("Escolha o instrutor pelo ID", instructors, (item) => item.nomeCompleto);
    if (!idCategoria || !idInstrutor) {
        notify("Categoria ou instrutor inválido.", "danger");
        return;
    }
    const nivel = window.prompt("Nível: Iniciante, Intermediário ou Avançado", "Iniciante") as Curso["nivel"] | null;
    if (!nivel || !["Iniciante", "Intermediário", "Avançado"].includes(nivel)) {
        notify("Nível inválido.", "danger");
        return;
    }
    const descricao = window.prompt("Descrição do curso", "")?.trim() ?? "";
    addWithId("cursos", { titulo, descricao, nivel, idCategoria, idInstrutor, dataPublicacao: todayISO(), totalAulas: 0, totalHoras: 0 });
}

function quickCreateModule(props: QuickCreateProps) {
    const { data, addWithId, notify } = props;
    if (!data.cursos.length) {
        notify("Crie um curso antes do módulo.", "danger");
        return;
    }
    const idCurso = promptChoice("Escolha o curso pelo ID", data.cursos, (item) => item.titulo);
    const titulo = promptRequired("Título do módulo");
    const ordem = promptNumber("Ordem do módulo");
    if (!idCurso || !titulo || !ordem) {
        notify("Dados do módulo inválidos.", "danger");
        return;
    }
    if (data.modulos.some((item) => sameId(item.idCurso, idCurso) && item.ordem === ordem)) {
        notify("Já existe um módulo com essa ordem neste curso.", "danger");
        return;
    }
    addWithId("modulos", { idCurso, titulo, ordem });
}

function quickCreateLesson(props: QuickCreateProps) {
    const { data, addWithId, notify } = props;
    if (!data.modulos.length) {
        notify("Crie um módulo antes da aula.", "danger");
        return;
    }
    const idModulo = promptChoice("Escolha o módulo pelo ID", data.modulos, (item) => item.titulo);
    const titulo = promptRequired("Título da aula");
    const tipoConteudo = window.prompt("Tipo: Vídeo, Texto ou Quiz", "Vídeo") as Aula["tipoConteudo"] | null;
    const duracaoMinutos = promptNumber("Duração em minutos");
    const ordem = promptNumber("Ordem da aula");
    if (!idModulo || !titulo || !tipoConteudo || !["Vídeo", "Texto", "Quiz"].includes(tipoConteudo) || !duracaoMinutos || !ordem) {
        notify("Dados da aula inválidos.", "danger");
        return;
    }
    if (data.aulas.some((item) => sameId(item.idModulo, idModulo) && item.ordem === ordem)) {
        notify("Já existe uma aula com essa ordem neste módulo.", "danger");
        return;
    }
    const urlConteudo = window.prompt("URL do conteúdo", "")?.trim() ?? "";
    addWithId("aulas", { idModulo, titulo, tipoConteudo, urlConteudo, duracaoMinutos, ordem });
}

function quickCreateTrack(props: QuickCreateProps) {
    const { data, addWithId, notify } = props;
    if (!data.categorias.length) {
        notify("Crie uma categoria antes da trilha.", "danger");
        return;
    }
    const titulo = promptRequired("Título da trilha");
    const idCategoria = promptChoice("Escolha a categoria pelo ID", data.categorias, (item) => item.nome);
    if (!titulo || !idCategoria) {
        notify("Dados da trilha inválidos.", "danger");
        return;
    }
    const descricao = window.prompt("Descrição da trilha", "")?.trim() ?? "";
    addWithId("trilhas", { titulo, descricao, idCategoria });
}

function quickCreateSubscription(props: QuickCreateProps) {
    const { data, addWithId, notify } = props;
    if (!data.usuarios.length || !data.planos.length) {
        notify("Crie ao menos um usuário e um plano antes da assinatura.", "danger");
        return;
    }
    const idUsuario = promptChoice("Escolha o usuário pelo ID", data.usuarios, (item) => item.nomeCompleto);
    const idPlano = promptChoice("Escolha o plano pelo ID", data.planos, (item) => item.nome);
    if (!idUsuario || !idPlano) {
        notify("Usuário ou plano inválido.", "danger");
        return;
    }
    const dataInicio = window.prompt("Data de início", todayISO())?.trim() || todayISO();
    const dataFim = window.prompt("Data de fim", todayISO())?.trim() || todayISO();
    addWithId("assinaturas", { idUsuario, idPlano, dataInicio, dataFim });
}

function ActionButton({ children, danger = false, onClick }: { children: string; danger?: boolean; onClick: () => void }) {
    return <button className={`btn btn-sm btn-${danger ? "outline-danger" : "outline-secondary"}`} type="button" onClick={onClick}>{children}</button>;
}

function SelectInput({ label, value, options, required, actionLabel, onAction, onChange }: {
    label: string;
    value: string;
    options: Array<{ value: string | number; label: string }>;
    required?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    onChange: (value: string) => void;
}) {
    return (
        <div className="col-12 col-md-6">
            <div className="field-heading">
                <label className="form-label mb-0">{label}</label>
                {onAction && actionLabel && (
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={onAction}>
                        {actionLabel}
                    </button>
                )}
            </div>
            <select className="form-select" value={value} required={required} onChange={(event) => onChange(event.target.value)}>
                <option value="">Selecione</option>
                {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
            </select>
        </div>
    );
}

function TextInput({ label, value, required, type = "text", onChange }: {
    label: string;
    value: string;
    required?: boolean;
    type?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="col-12 col-md-6">
            <label className="form-label">{label}</label>
            <input className="form-control" value={value} required={required} type={type} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

function SimpleTable({ columns, rows, emptyText }: { columns: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
    return (
        <section className="panel">
            <div className="table-responsive">
                <table className="table align-middle mb-0">
                    <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr><td className="text-center text-muted" colSpan={columns.length}>{emptyText}</td></tr>
                        ) : rows.map((row, index) => (
                            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
