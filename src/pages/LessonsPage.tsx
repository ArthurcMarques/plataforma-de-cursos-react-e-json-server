// Pagina de aulas: cadastra aulas dentro dos modulos.
import type { FormEvent } from "react";
import { useState } from "react";
import type { Aula } from "../models/types";
import { nameById, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function LessonsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const rows = data.aulas.map((lesson) => {
        const module = data.modulos.find((item) => sameId(item.id, lesson.idModulo));
        return {
            ...lesson,
            moduloNome: module?.titulo ?? "-",
            cursoNome: module ? nameById(data.cursos, module.idCurso, "titulo") : "-"
        };
    });
    const [idModulo, setIdModulo] = useState("");
    const [titulo, setTitulo] = useState("");
    const [tipoConteudo, setTipoConteudo] = useState("");
    const [urlConteudo, setUrlConteudo] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState("");
    const [ordem, setOrdem] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdModulo("");
        setTitulo("");
        setTipoConteudo("");
        setUrlConteudo("");
        setDuracaoMinutos("");
        setOrdem("");
        setEditingId(null);
    }

    async function saveLesson(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Nao permite duas aulas com a mesma ordem no mesmo modulo.
        const moduleId = Number(idModulo);
        const order = Number(ordem);
        const repeated = data.aulas.some((item) => {
            return !sameId(item.id, editingId) && sameId(item.idModulo, moduleId) && Number(item.ordem) === order;
        });

        if (repeated) {
            notify("Ja existe uma aula com essa ordem neste modulo.", "danger");
            return;
        }

        const lesson = {
            idModulo: moduleId,
            titulo: titulo.trim(),
            tipoConteudo: tipoConteudo as Aula["tipoConteudo"],
            urlConteudo: urlConteudo.trim(),
            duracaoMinutos: Number(duracaoMinutos),
            ordem: order
        };

        if (editingId !== null) {
            const updated = await updateById("aulas", editingId, lesson);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("aulas", lesson);
        clearForm();
    }

    function editLesson(lesson: Aula) {
        // Preenche o formulario com a aula escolhida.
        setEditingId(lesson.id);
        setIdModulo(String(lesson.idModulo));
        setTitulo(lesson.titulo);
        setTipoConteudo(lesson.tipoConteudo);
        setUrlConteudo(lesson.urlConteudo);
        setDuracaoMinutos(String(lesson.duracaoMinutos));
        setOrdem(String(lesson.ordem));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Aulas</h1>
                <p className="text-muted mb-0">Cadastre aulas dentro dos modulos.</p>
            </section>
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando aula.</p>}
                <form className="row g-3" onSubmit={saveLesson}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Modulo</label>
                        <select className="form-select" value={idModulo} required onChange={(event) => setIdModulo(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.modulos.map((module) => (
                                <option value={module.id} key={module.id}>{nameById(data.cursos, module.idCurso, "titulo")} - {module.titulo}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Titulo</label>
                        <input className="form-control" value={titulo} required onChange={(event) => setTitulo(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Tipo</label>
                        <select className="form-select" value={tipoConteudo} required onChange={(event) => setTipoConteudo(event.target.value)}>
                            <option value="">Selecione</option>
                            <option value="Vídeo">Video</option>
                            <option value="Texto">Texto</option>
                            <option value="Quiz">Quiz</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Duracao em minutos</label>
                        <input className="form-control" type="number" min={1} value={duracaoMinutos} required onChange={(event) => setDuracaoMinutos(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Ordem</label>
                        <input className="form-control" type="number" min={1} value={ordem} required onChange={(event) => setOrdem(event.target.value)} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">URL do conteudo</label>
                        <input className="form-control" type="url" value={urlConteudo} onChange={(event) => setUrlConteudo(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Curso", "Modulo", "Aula", "Tipo", "Duracao", "Ordem", "Acoes"]}
                emptyText="Nenhuma aula cadastrada."
                rows={rows.map((lesson) => [
                    lesson.cursoNome,
                    lesson.moduloNome,
                    lesson.titulo,
                    lesson.tipoConteudo,
                    `${lesson.duracaoMinutos} min`,
                    lesson.ordem,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editLesson(lesson)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                        <ActionButton danger onClick={() => removeById("aulas", lesson.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
