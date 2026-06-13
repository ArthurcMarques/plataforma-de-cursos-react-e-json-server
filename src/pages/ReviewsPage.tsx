// Pagina de avaliacoes: registra notas e comentarios dos cursos.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { nameById, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function ReviewsPage({ data, addWithId, updateById, removeById, navigate }: PageProps) {
    const rows = data.avaliacoes.map((item) => ({
        ...item,
        usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));
    const [idUsuario, setIdUsuario] = useState("");
    const [idCurso, setIdCurso] = useState("");
    const [nota, setNota] = useState("");
    const [comentario, setComentario] = useState("");
    const [dataAvaliacao, setDataAvaliacao] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdUsuario("");
        setIdCurso("");
        setNota("");
        setComentario("");
        setDataAvaliacao(todayISO());
        setEditingId(null);
    }

    async function saveReview(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Monta a avaliacao usando os ids selecionados nos selects.
        const review = {
            idUsuario,
            idCurso,
            nota: Number(nota),
            comentario: comentario.trim(),
            dataAvaliacao
        };

        if (editingId !== null) {
            const updated = await updateById("avaliacoes", editingId, review);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("avaliacoes", review);
        clearForm();
    }

    function editReview(review: any) {
        setEditingId(review.id);
        setIdUsuario(String(review.idUsuario));
        setIdCurso(String(review.idCurso));
        setNota(String(review.nota));
        setComentario(review.comentario);
        setDataAvaliacao(review.dataAvaliacao);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title="Avaliacoes" description="Registre avaliacoes de usuarios para os cursos." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando avaliacao.</p>}
                <form className="row g-3" onSubmit={saveReview}>
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
                        <label className="form-label">Nota</label>
                        <select className="form-select" value={nota} required onChange={(event) => setNota(event.target.value)}>
                            <option value="">Selecione</option>
                            {[1, 2, 3, 4, 5].map((item) => <option value={item} key={item}>{item}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data</label>
                        <input className="form-control" type="date" value={dataAvaliacao} required onChange={(event) => setDataAvaliacao(event.target.value)} />
                    </div>
                    <div className="col-12">
                        <label className="form-label">Comentario</label>
                        <textarea className="form-control" value={comentario} rows={3} onChange={(event) => setComentario(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Usuario", "Curso", "Nota", "Comentario", "Data", "Acoes"]}
                emptyText="Nenhuma avaliacao cadastrada."
                rows={rows.map((review) => [
                    review.usuarioNome,
                    review.cursoNome,
                    review.nota,
                    review.comentario || "-",
                    review.dataAvaliacao,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editReview(review)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                        <ActionButton danger onClick={() => removeById("avaliacoes", review.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
