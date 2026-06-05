import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { CrudPage } from "./components/CrudPage";
import { Layout, type SectionItem } from "./components/Layout";
import { loadInitialData, saveCollection } from "./storage";
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
    ProgressoAula,
    Trilha,
    TrilhaCurso,
    Usuario
} from "./types";
import { nameById, nextId, normalize, todayISO } from "./utils";

const sections: SectionItem[] = [
    { id: "dashboard", name: "Início", group: "principal" },
    { id: "categorias", name: "Categorias", group: "Acadêmico" },
    { id: "cursos", name: "Cursos", group: "Acadêmico" },
    { id: "modulos", name: "Módulos", group: "Acadêmico" },
    { id: "aulas", name: "Aulas", group: "Acadêmico" },
    { id: "trilhas", name: "Trilhas", group: "Acadêmico" },
    { id: "usuarios", name: "Usuários", group: "Usuário" },
    { id: "matriculas", name: "Matrículas", group: "Usuário" },
    { id: "progresso", name: "Progresso", group: "Usuário" },
    { id: "avaliacoes", name: "Avaliações", group: "Usuário" },
    { id: "certificados", name: "Certificados", group: "Usuário" },
    { id: "planos", name: "Planos", group: "Financeiro" },
    { id: "assinaturas", name: "Assinaturas", group: "Financeiro" },
    { id: "pagamentos", name: "Pagamentos", group: "Financeiro" }
];

type AlertState = { message: string; type: "success" | "warning" | "danger" } | null;
type WithId = { id: number };

export function App() {
    const [currentSection, setCurrentSection] = useState("dashboard");
    const [data, setData] = useState<AppData>(loadInitialData);
    const [alert, setAlert] = useState<AlertState>(null);

    function notify(message: string, type: "success" | "warning" | "danger" = "success") {
        setAlert({ message, type });
        window.setTimeout(() => setAlert(null), 2800);
    }

    function updateCollection<K extends CollectionName>(name: K, updater: (list: AppData[K]) => AppData[K]) {
        setData((current) => {
            const updated = updater(current[name]);
            saveCollection(name, updated);
            return { ...current, [name]: updated };
        });
    }

    function addWithId<K extends CollectionName>(name: K, record: Omit<AppData[K][number], "id">) {
        updateCollection(name, (list) => {
            const current = list as unknown as WithId[];
            return [...current, { id: nextId(current), ...record }] as unknown as AppData[K];
        });
        notify("Registro salvo com sucesso.");
    }

    function removeById<K extends CollectionName>(name: K, id: number) {
        if (!window.confirm("Deseja excluir este registro?")) {
            return;
        }

        updateCollection(name, (list) => {
            return (list as unknown as WithId[]).filter((item) => Number(item.id) !== Number(id)) as unknown as AppData[K];
        });
        notify("Registro removido com sucesso.", "warning");
    }

    const props: PageProps = { data, addWithId, removeById, updateCollection, notify, navigate: setCurrentSection };

    return (
        <>
            <Layout sections={sections} currentSection={currentSection} onNavigate={setCurrentSection}>
                {alert && <div className={`alert alert-${alert.type} floating-alert shadow-sm`} role="alert">{alert.message}</div>}
                <CurrentSection section={currentSection} {...props} />
            </Layout>
        </>
    );
}

interface PageProps {
    data: AppData;
    addWithId: <K extends CollectionName>(name: K, record: Omit<AppData[K][number], "id">) => void;
    removeById: <K extends CollectionName>(name: K, id: number) => void;
    updateCollection: <K extends CollectionName>(name: K, updater: (list: AppData[K]) => AppData[K]) => void;
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

function CategoriesPage({ data, addWithId, removeById, notify }: PageProps) {
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("categorias", item.id)}>Excluir</ActionButton>}
        />
    );
}

function UsersPage({ data, addWithId, removeById, notify }: PageProps) {
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("usuarios", item.id)}>Excluir</ActionButton>}
        />
    );
}

function PlansPage({ data, addWithId, removeById, notify }: PageProps) {
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("planos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function CoursesPage({ data, addWithId, removeById, notify, navigate }: PageProps) {
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
                { name: "idCategoria", label: "Categoria", type: "select", required: true, options: data.categorias.map((item) => ({ value: item.id, label: item.nome })) },
                { name: "idInstrutor", label: "Instrutor", type: "select", required: true, options: instructors.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2">
                    <ActionButton onClick={() => navigate("modulos")}>Módulos</ActionButton>
                    <ActionButton danger onClick={() => removeById("cursos", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

function ModulesPage({ data, addWithId, removeById, notify }: PageProps) {
    const rows = data.modulos.map((item) => ({ ...item, cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Módulos"
            description="Organize módulos dentro dos cursos."
            initialValues={{ idCurso: "", titulo: "", ordem: "" }}
            fields={[
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
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
                if (data.modulos.some((item) => item.idCurso === idCurso && Number(item.ordem) === ordem)) {
                    notify("Já existe um módulo com essa ordem neste curso.", "danger");
                    return false;
                }
                addWithId("modulos", { idCurso, titulo: form.titulo.trim(), ordem });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("modulos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function LessonsPage({ data, addWithId, removeById, notify }: PageProps) {
    const rows = data.aulas.map((lesson) => {
        const module = data.modulos.find((item) => item.id === lesson.idModulo);
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
                { name: "idModulo", label: "Módulo", type: "select", required: true, options: data.modulos.map((item) => ({ value: item.id, label: `${nameById(data.cursos, item.idCurso, "titulo")} - ${item.titulo}` })) },
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
                if (data.aulas.some((item) => item.idModulo === idModulo && Number(item.ordem) === ordem)) {
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("aulas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function TracksPage({ data, addWithId, removeById, updateCollection, notify }: PageProps) {
    const [linkForm, setLinkForm] = useState({ idTrilha: "", idCurso: "", ordem: "" });
    const links = data.trilhasCursos.map((item) => ({
        ...item,
        trilhaNome: nameById(data.trilhas, item.idTrilha, "titulo"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));

    function submitLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const idTrilha = Number(linkForm.idTrilha);
        const idCurso = Number(linkForm.idCurso);
        if (data.trilhasCursos.some((item) => item.idTrilha === idTrilha && item.idCurso === idCurso)) {
            notify("Esse curso já está vinculado a essa trilha.", "danger");
            return;
        }
        updateCollection("trilhasCursos", (list) => [...list, { idTrilha, idCurso, ordem: Number(linkForm.ordem) }]);
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
                    { name: "idCategoria", label: "Categoria", type: "select", required: true, options: data.categorias.map((item) => ({ value: item.id, label: item.nome })) },
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
                renderActions={(item) => <ActionButton danger onClick={() => removeById("trilhas", item.id)}>Excluir</ActionButton>}
            />
            <section className="panel">
                <h2 className="h5 mb-3">Cursos da trilha</h2>
                <form className="row g-3" onSubmit={submitLink}>
                    <SelectInput label="Trilha" value={linkForm.idTrilha} required options={data.trilhas.map((item) => ({ value: item.id, label: item.titulo }))} onChange={(value) => setLinkForm((current) => ({ ...current, idTrilha: value }))} />
                    <SelectInput label="Curso" value={linkForm.idCurso} required options={data.cursos.map((item) => ({ value: item.id, label: item.titulo }))} onChange={(value) => setLinkForm((current) => ({ ...current, idCurso: value }))} />
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
                    <ActionButton danger onClick={() => updateCollection("trilhasCursos", (list) => list.filter((record) => !(record.idTrilha === item.idTrilha && record.idCurso === item.idCurso)))}>Excluir</ActionButton>
                ])}
            />
        </>
    );
}

function EnrollmentsPage({ data, addWithId, removeById, notify }: PageProps) {
    const rows = data.matriculas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Matrículas"
            description="Simule a matrícula de usuários em cursos."
            initialValues={{ idUsuario: "", idCurso: "", dataMatricula: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
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
                if (data.matriculas.some((item) => item.idUsuario === idUsuario && item.idCurso === idCurso)) {
                    notify("Esse usuário já está matriculado nesse curso.", "danger");
                    return false;
                }
                addWithId("matriculas", { idUsuario, idCurso, dataMatricula: form.dataMatricula, dataConclusao: null });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("matriculas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function ProgressPage({ data, addWithId, updateCollection, notify }: PageProps) {
    const rows = data.progressoAulas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), aulaNome: nameById(data.aulas, item.idAula, "titulo") }));

    return (
        <CrudPage
            title="Progresso"
            description="Registre conclusão ou andamento das aulas."
            initialValues={{ idUsuario: "", idAula: "", status: "Concluído", dataConclusao: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
                { name: "idAula", label: "Aula", type: "select", required: true, options: data.aulas.map((item) => ({ value: item.id, label: item.titulo })) },
                { name: "status", label: "Status", type: "select", required: true, options: [{ value: "Concluído", label: "Concluído" }, { value: "Em andamento", label: "Em andamento" }] },
                { name: "dataConclusao", label: "Data", type: "date", required: true }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "aulaNome", label: "Aula" },
                { key: "status", label: "Status" },
                { key: "dataConclusao", label: "Data" }
            ]}
            rows={rows}
            emptyText="Nenhum progresso registrado."
            getRowKey={(item) => `${item.idUsuario}-${item.idAula}`}
            onSubmit={(form) => {
                const idUsuario = Number(form.idUsuario);
                const idAula = Number(form.idAula);
                if (data.progressoAulas.some((item) => item.idUsuario === idUsuario && item.idAula === idAula)) {
                    notify("Esse usuário já possui progresso nessa aula.", "danger");
                    return false;
                }
                addWithId("progressoAulas", { idUsuario, idAula, status: form.status as ProgressoAula["status"], dataConclusao: form.dataConclusao } as Omit<ProgressoAula, "id">);
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => updateCollection("progressoAulas", (list) => list.filter((record) => !(record.idUsuario === item.idUsuario && record.idAula === item.idAula)))}>Excluir</ActionButton>}
        />
    );
}

function ReviewsPage({ data, addWithId, removeById }: PageProps) {
    const rows = data.avaliacoes.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    return (
        <CrudPage
            title="Avaliações"
            description="Registre avaliações de usuários para os cursos."
            initialValues={{ idUsuario: "", idCurso: "", nota: "", comentario: "", dataAvaliacao: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("avaliacoes", item.id)}>Excluir</ActionButton>}
        />
    );
}

function CertificatesPage({ data, updateCollection, notify }: PageProps) {
    const rows = data.certificados.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), cursoNome: nameById(data.cursos, item.idCurso, "titulo") }));

    function hasCompletedProgress(idUsuario: number, idCurso: number) {
        const courseModules = data.modulos.filter((module) => module.idCurso === idCurso);
        const lessonIds = data.aulas.filter((lesson) => courseModules.some((module) => module.id === lesson.idModulo)).map((lesson) => lesson.id);
        return data.progressoAulas.some((progress) => progress.idUsuario === idUsuario && lessonIds.includes(progress.idAula) && normalize(progress.status).includes("concl"));
    }

    return (
        <CrudPage
            title="Certificados"
            description="Gere certificados para usuários com progresso concluído no curso."
            initialValues={{ idUsuario: "", idCurso: "", dataEmissao: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
                { name: "idCurso", label: "Curso", type: "select", required: true, options: data.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
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
                if (data.certificados.some((item) => item.idUsuario === idUsuario && item.idCurso === idCurso)) {
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
            renderActions={(item) => <ActionButton danger onClick={() => updateCollection("certificados", (list) => list.filter((record) => record.id !== item.id))}>Excluir</ActionButton>}
        />
    );
}

function SubscriptionsPage({ data, addWithId, removeById }: PageProps) {
    const rows = data.assinaturas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), planoNome: nameById(data.planos, item.idPlano, "nome") }));

    return (
        <CrudPage
            title="Assinaturas"
            description="Vincule usuários a planos por período."
            initialValues={{ idUsuario: "", idPlano: "", dataInicio: todayISO(), dataFim: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
                { name: "idPlano", label: "Plano", type: "select", required: true, options: data.planos.map((item) => ({ value: item.id, label: item.nome })) },
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("assinaturas", item.id)}>Excluir</ActionButton>}
        />
    );
}

function PaymentsPage({ data, addWithId, removeById, notify }: PageProps) {
    const rows = data.pagamentos.map((item) => ({ ...item, assinaturaNome: subscriptionDescription(data, item.idAssinatura) }));

    return (
        <CrudPage
            title="Pagamentos"
            description="Registre pagamentos simulados para assinaturas."
            initialValues={{ idAssinatura: "", valorPago: "", dataPagamento: todayISO(), metodoPagamento: "", idTransacaoGateway: "" }}
            fields={[
                { name: "idAssinatura", label: "Assinatura", type: "select", required: true, options: data.assinaturas.map((item) => ({ value: item.id, label: subscriptionDescription(data, item.id) })) },
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("pagamentos", item.id)}>Excluir</ActionButton>}
        />
    );
}

function courseSummary(data: AppData, course: Curso) {
    const modules = data.modulos.filter((module) => module.idCurso === course.id);
    const lessons = data.aulas.filter((lesson) => modules.some((module) => module.id === lesson.idModulo));
    const minutes = lessons.reduce((total, lesson) => total + lesson.duracaoMinutos, 0);
    return {
        ...course,
        categoriaNome: nameById(data.categorias, course.idCategoria, "nome"),
        instrutorNome: nameById(data.usuarios, course.idInstrutor, "nomeCompleto"),
        totalAulas: lessons.length,
        totalHoras: Number((minutes / 60).toFixed(1))
    };
}

function subscriptionDescription(data: AppData, idAssinatura: number) {
    const subscription = data.assinaturas.find((item) => item.id === Number(idAssinatura));
    if (!subscription) {
        return "-";
    }

    return `${nameById(data.usuarios, subscription.idUsuario, "nomeCompleto")} - ${nameById(data.planos, subscription.idPlano, "nome")}`;
}

function money(value: number) {
    return `R$ ${Number(value).toFixed(2)}`;
}

function ActionButton({ children, danger = false, onClick }: { children: string; danger?: boolean; onClick: () => void }) {
    return <button className={`btn btn-sm btn-${danger ? "outline-danger" : "outline-secondary"}`} type="button" onClick={onClick}>{children}</button>;
}

function SelectInput({ label, value, options, required, onChange }: {
    label: string;
    value: string;
    options: Array<{ value: string | number; label: string }>;
    required?: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="col-12 col-md-6">
            <label className="form-label">{label}</label>
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
