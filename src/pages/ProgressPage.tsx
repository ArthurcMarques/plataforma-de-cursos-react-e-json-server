// Pagina de progresso: marca aulas concluidas por aluno.
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Curso, RecordId } from "../models/types";
import { nameById, normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { SelectInput } from "./shared";

export function ProgressPage({ data, addDirect, removeDirect, notify }: PageProps) {
    const [selectedUserId, setSelectedUserId] = useState("");
    const idUsuario = selectedUserId;
    const selectedUser = data.usuarios.find((item) => sameId(item.id, idUsuario));

    function isLessonDone(idAula: RecordId) {
        // Verifica se a aula ja foi marcada como concluida para o aluno.
        return data.progressoAulas.some((item) => {
            return sameId(item.idUsuario, idUsuario) && sameId(item.idAula, idAula) && normalize(item.status).includes("concl");
        });
    }

    async function toggleLesson(idAula: RecordId, checked: boolean) {
        // Cria ou remove o progresso conforme o checkbox.
        if (!idUsuario) {
            notify("Selecione um aluno antes de marcar aulas.", "danger");
            return;
        }

        const current = data.progressoAulas.find((item) => sameId(item.idUsuario, idUsuario) && sameId(item.idAula, idAula));
        if (!checked && current) {
            await removeDirect("progressoAulas", current.id);
            return;
        }

        if (checked && !current) {
            await addDirect("progressoAulas", { idUsuario, idAula, status: "Concluído", dataConclusao: todayISO() });
        }
    }

    function courseProgress(course: Curso) {
        const modules = data.modulos.filter((module) => sameId(module.idCurso, course.id));
        const lessons = data.aulas.filter((lesson) => modules.some((module) => sameId(module.id, lesson.idModulo)));
        const done = lessons.filter((lesson) => isLessonDone(lesson.id)).length;
        return { done, total: lessons.length };
    }

    return (
        <>
            <PageHeader title="Progresso" description="Selecione um aluno e marque as aulas concluidas em cada curso." />
            <section className="panel">
                <div className="row g-3 align-items-end">
                    <SelectInput
                        label="Aluno"
                        value={selectedUserId}
                        required
                        options={data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto }))}
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
                                <p className="text-muted mb-0">Nenhum modulo cadastrado neste curso.</p>
                            ) : modules.map((module) => {
                                const lessons = data.aulas.filter((lesson) => sameId(lesson.idModulo, module.id)).sort((a, b) => a.ordem - b.ordem);
                                return (
                                    <div className="module-progress" key={module.id}>
                                        <h3 className="h6 mb-2">{module.ordem}. {module.titulo}</h3>
                                        {lessons.length === 0 ? (
                                            <p className="text-muted mb-0">Nenhuma aula cadastrada neste modulo.</p>
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
                                                            <small>{lesson.tipoConteudo} - {lesson.duracaoMinutos} min</small>
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
