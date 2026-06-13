import type { FormEvent } from "react";
import { useState } from "react";
import { CrudPage } from "../components/CrudPage";
import type { Aula, Curso } from "../models/types";
import { nameById, normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, courseSummary, SelectInput, SimpleTable, TextInput } from "./shared";

// Paginas do modulo academico: categorias, cursos, modulos, aulas e trilhas.
export function CategoriesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                    <ActionButton danger onClick={() => removeById("categorias", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function CoursesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("modulos")}>Módulos</ActionButton>
                    <ActionButton danger onClick={() => removeById("cursos", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function ModulesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("aulas")}>Aulas</ActionButton>
                    <ActionButton danger onClick={() => removeById("modulos", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function LessonsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                    <ActionButton danger onClick={() => removeById("aulas", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function TracksPage({ data, addWithId, addDirect, updateById, removeById, removeDirect, notify, navigate }: PageProps) {
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
        await addDirect("trilhasCursos", { idTrilha, idCurso, ordem: Number(linkForm.ordem) });
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
                getEditValues={(item) => ({
                    titulo: item.titulo,
                    descricao: item.descricao,
                    idCategoria: String(item.idCategoria)
                })}
                onUpdate={(item, form) => {
                    updateById("trilhas", item.id, { titulo: form.titulo.trim(), descricao: form.descricao.trim(), idCategoria: Number(form.idCategoria) });
                    return true;
                }}
                renderActions={(item) => (
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                        <ActionButton danger onClick={() => removeById("trilhas", item.id)}>Excluir</ActionButton>
                    </div>
                )}
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
                    <ActionButton danger onClick={() => removeDirect("trilhasCursos", item.id)}>Excluir</ActionButton>
                ])}
            />
        </>
    );
}
