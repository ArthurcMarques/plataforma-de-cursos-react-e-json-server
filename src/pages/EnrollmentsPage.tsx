// Pagina de matriculas: liga usuarios a cursos.
import type { FormEvent } from "react";
import { useState } from "react";
import { nameById, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function EnrollmentsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const rows = data.matriculas.map((item) => ({
        ...item,
        usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));
    const [idUsuario, setIdUsuario] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [dataMatricula, setDataMatricula] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdUsuario("");
        setIdCurso("");
        setDataMatricula(todayISO());
        setEditingId(null);
    }

    async function saveEnrollment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Um usuario nao deve se matricular duas vezes no mesmo curso.
        const userId = Number(idUsuario);
        const courseId = Number(idCurso);
        const repeated = data.matriculas.some((item) => {
            return !sameId(item.id, editingId) && sameId(item.idUsuario, userId) && sameId(item.idCurso, courseId);
        });

        if (repeated) {
            notify("Esse usuario ja esta matriculado nesse curso.", "danger");
            return;
        }

        const enrollment = { idUsuario: userId, idCurso: courseId, dataMatricula };
        if (editingId !== null) {
            const updated = await updateById("matriculas", editingId, enrollment);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("matriculas", { ...enrollment, dataConclusao: null });
        clearForm();
    }

    function editEnrollment(enrollment: any) {
        setEditingId(enrollment.id);
        setIdUsuario(String(enrollment.idUsuario));
        setIdCurso(String(enrollment.idCurso));
        setDataMatricula(enrollment.dataMatricula);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Matriculas</h1>
                <p className="text-muted mb-0">Simule a matricula de usuarios em cursos.</p>
            </section>
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando matricula.</p>}
                <form className="row g-3" onSubmit={saveEnrollment}>
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
                        <label className="form-label">Data</label>
                        <input className="form-control" type="date" value={dataMatricula} required onChange={(event) => setDataMatricula(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Usuario", "Curso", "Data", "Acoes"]}
                emptyText="Nenhuma matricula cadastrada."
                rows={rows.map((enrollment) => [
                    enrollment.usuarioNome,
                    enrollment.cursoNome,
                    enrollment.dataMatricula,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editEnrollment(enrollment)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("progresso")}>Progresso</ActionButton>
                        <ActionButton onClick={() => navigate("certificados")}>Certificados</ActionButton>
                        <ActionButton danger onClick={() => removeById("matriculas", enrollment.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
