import type { ReactNode } from "react";
import type { AppData, Aula, Curso, RecordId, Usuario } from "../models/types";
import type { PageProps } from "./pageTypes";
import { nameById, nextId, normalize, sameId, todayISO } from "../utils";

// Monta os dados calculados exibidos na tabela de cursos.
export function courseSummary(data: AppData, course: Curso) {
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

// Texto amigavel para identificar uma assinatura nas telas financeiras.
export function subscriptionDescription(data: AppData, idAssinatura: RecordId) {
    const subscription = data.assinaturas.find((item) => sameId(item.id, idAssinatura));
    if (!subscription) {
        return "-";
    }

    return `${nameById(data.usuarios, subscription.idUsuario, "nomeCompleto")} - ${nameById(data.planos, subscription.idPlano, "nome")}`;
}

export function money(value: number) {
    return `R$ ${Number(value).toFixed(2)}`;
}

// Prompts simples usados nos botoes de criacao rapida.
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

// Funcoes auxiliares para criar registros relacionados sem sair da tela atual.
export function quickCreateCategory({ data, addWithId, notify }: QuickCreateProps) {
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

export function quickCreateUser({ data, addWithId, notify }: QuickCreateProps, tipoUsuario: Usuario["tipoUsuario"] = "Aluno") {
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

export function quickCreatePlan({ data, addWithId, notify }: QuickCreateProps) {
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

export function quickCreateCourse(props: QuickCreateProps) {
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

export function quickCreateModule(props: QuickCreateProps) {
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

export function quickCreateLesson(props: QuickCreateProps) {
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

export function quickCreateTrack(props: QuickCreateProps) {
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

export function quickCreateSubscription(props: QuickCreateProps) {
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

// Botao pequeno usado nas acoes das tabelas.
export function ActionButton({ children, danger = false, onClick }: { children: string; danger?: boolean; onClick: () => void }) {
    return <button className={`btn btn-sm btn-${danger ? "outline-danger" : "outline-secondary"}`} type="button" onClick={onClick}>{children}</button>;
}

// Select reutilizado em telas que nao usam o CrudPage completo.
export function SelectInput({ label, value, options, required, actionLabel, onAction, onChange }: {
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

// Input simples reutilizado em formularios menores.
export function TextInput({ label, value, required, type = "text", onChange }: {
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

// Tabela simples para listas montadas manualmente.
export function SimpleTable({ columns, rows, emptyText }: { columns: string[]; rows: Array<Array<ReactNode>>; emptyText: string }) {
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
