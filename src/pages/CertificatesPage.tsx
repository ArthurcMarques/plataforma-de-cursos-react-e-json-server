// Pagina de certificados: gera certificados para alunos com progresso.
import type { FormEvent } from "react";
import { useState } from "react";
import { nameById, normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function CertificatesPage({ data, addDirect, updateById, removeById, notify }: PageProps) {
    const rows = data.certificados.map((item) => ({
        ...item,
        usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));
    const [idUsuario, setIdUsuario] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [dataEmissao, setDataEmissao] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdUsuario("");
        setIdCurso("");
        setDataEmissao(todayISO());
        setEditingId(null);
    }

    function hasCompletedProgress(userId: number, courseId: number) {
        // Confere se existe pelo menos uma aula concluida no curso.
        const courseModules = data.modulos.filter((module) => sameId(module.idCurso, courseId));
        const lessonIds = data.aulas.filter((lesson) => courseModules.some((module) => sameId(module.id, lesson.idModulo))).map((lesson) => lesson.id);
        return data.progressoAulas.some((progress) => {
            return sameId(progress.idUsuario, userId) && lessonIds.some((idAula) => sameId(idAula, progress.idAula)) && normalize(progress.status).includes("concl");
        });
    }

    async function saveCertificate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Editar certificado nao exige verificar progresso novamente.
        const userId = Number(idUsuario);
        const courseId = Number(idCurso);
        const repeated = data.certificados.some((item) => {
            return !sameId(item.id, editingId) && sameId(item.idUsuario, userId) && sameId(item.idCurso, courseId);
        });

        if (repeated) {
            notify("Ja existe certificado para esse usuario nesse curso.", "danger");
            return;
        }

        if (editingId !== null) {
            const updated = await updateById("certificados", editingId, { idUsuario: userId, idCurso: courseId, dataEmissao });
            if (updated) {
                clearForm();
            }
            return;
        }

        if (!hasCompletedProgress(userId, courseId)) {
            notify("Registre progresso concluido em uma aula desse curso antes de gerar certificado.", "danger");
            return;
        }

        await addDirect("certificados", { idUsuario: userId, idCurso: courseId, idTrilha: null, codigoVerificacao: `CERT-${Date.now()}`, dataEmissao });
        notify("Certificado gerado com sucesso.");
        clearForm();
    }

    function editCertificate(certificate: any) {
        setEditingId(certificate.id);
        setIdUsuario(String(certificate.idUsuario));
        setIdCurso(String(certificate.idCurso));
        setDataEmissao(certificate.dataEmissao);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Certificados</h1>
                <p className="text-muted mb-0">Gere certificados para usuarios com progresso concluido no curso.</p>
            </section>
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando certificado.</p>}
                <form className="row g-3" onSubmit={saveCertificate}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Usuario</label>
                        <select className="form-select" value={idUsuario} required onChange={(event) => setIdUsuario(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.usuarios.map((user) => <option value={user.id} key={user.id}>{user.nomeCompleto}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Curso</label>
                        <select className="form-select" value={idCurso} required onChange={(event) => setIdCurso(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.cursos.map((course) => <option value={course.id} key={course.id}>{course.titulo}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data de emissao</label>
                        <input className="form-control" type="date" value={dataEmissao} required onChange={(event) => setDataEmissao(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Usuario", "Curso", "Codigo", "Emissao", "Acoes"]}
                emptyText="Nenhum certificado gerado."
                rows={rows.map((certificate) => [
                    certificate.usuarioNome,
                    certificate.cursoNome,
                    certificate.codigoVerificacao,
                    certificate.dataEmissao,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editCertificate(certificate)}>Editar</ActionButton>
                        <ActionButton danger onClick={() => removeById("certificados", certificate.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
