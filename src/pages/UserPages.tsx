import { useState } from "react";
import { CrudPage } from "../components/CrudPage";
import type { Curso, RecordId, Usuario } from "../models/types";
import { nameById, normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SelectInput } from "./shared";

// Paginas do modulo de usuario: usuarios, matriculas, progresso, avaliacoes e certificados.
export function UsersPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("matriculas")}>Matrículas</ActionButton>
                    <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                    <ActionButton danger onClick={() => removeById("usuarios", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function EnrollmentsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                    <ActionButton onClick={() => navigate("certificados")}>Certificados</ActionButton>
                    <ActionButton danger onClick={() => removeById("matriculas", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function ProgressPage({ data, addWithId, addDirect, removeDirect, notify }: PageProps) {
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

        const current = data.progressoAulas.find((item) => sameId(item.idUsuario, idUsuario) && sameId(item.idAula, idAula));
        if (!checked && current) {
            await removeDirect("progressoAulas", current.id);
            return;
        }

        if (checked && !current) {
            await addDirect("progressoAulas", { idUsuario, idAula: Number(idAula), status: "Concluído", dataConclusao: todayISO() });
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

export function ReviewsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
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
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                    <ActionButton danger onClick={() => removeById("avaliacoes", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function CertificatesPage({ data, addWithId, addDirect, updateById, removeById, notify }: PageProps) {
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
                if (data.certificados.some((item) => sameId(item.idUsuario, idUsuario) && sameId(item.idCurso, idCurso))) {
                    notify("Já existe certificado para esse usuário nesse curso.", "danger");
                    return false;
                }
                if (!hasCompletedProgress(idUsuario, idCurso)) {
                    notify("Registre progresso concluído em uma aula desse curso antes de gerar certificado.", "danger");
                    return false;
                }
                addDirect("certificados", { idUsuario, idCurso, idTrilha: null, codigoVerificacao: `CERT-${Date.now()}`, dataEmissao: form.dataEmissao });
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
            renderActions={(item) => <ActionButton danger onClick={() => removeById("certificados", item.id)}>Excluir</ActionButton>}
        />
    );
}
