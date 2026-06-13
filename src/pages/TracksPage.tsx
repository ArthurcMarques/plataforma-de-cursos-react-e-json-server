// Pagina de trilhas: cadastra trilhas e vincula cursos a elas.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { nameById, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SelectInput, SimpleTable, TextInput } from "./shared";

export function TracksPage({ data, addWithId, addDirect, updateById, removeById, removeDirect, notify, navigate }: PageProps) {
    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [idCategoria, setIdCategoria] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [linkForm, setLinkForm] = useState({ idTrilha: "", idCurso: "", ordem: "" });
    const links = data.trilhasCursos.map((item) => ({
        ...item,
        trilhaNome: nameById(data.trilhas, item.idTrilha, "titulo"),
        cursoNome: nameById(data.cursos, item.idCurso, "titulo")
    }));

    function clearForm() {
        setTitulo("");
        setDescricao("");
        setIdCategoria("");
        setEditingId(null);
    }

    async function saveTrack(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Salva uma trilha nova ou atualiza a trilha em edicao.
        const track = { titulo: titulo.trim(), descricao: descricao.trim(), idCategoria: Number(idCategoria) };

        if (editingId !== null) {
            const updated = await updateById("trilhas", editingId, track);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("trilhas", track);
        clearForm();
    }

    function editTrack(track: any) {
        setEditingId(track.id);
        setTitulo(track.titulo);
        setDescricao(track.descricao);
        setIdCategoria(String(track.idCategoria));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function submitLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Evita vincular o mesmo curso duas vezes na mesma trilha.
        const idTrilha = Number(linkForm.idTrilha);
        const idCurso = Number(linkForm.idCurso);
        if (data.trilhasCursos.some((item) => sameId(item.idTrilha, idTrilha) && sameId(item.idCurso, idCurso))) {
            notify("Esse curso ja esta vinculado a essa trilha.", "danger");
            return;
        }
        await addDirect("trilhasCursos", { idTrilha, idCurso, ordem: Number(linkForm.ordem) });
        setLinkForm({ idTrilha: "", idCurso: "", ordem: "" });
        notify("Curso vinculado a trilha.");
    }

    return (
        <>
            <PageHeader title="Trilhas" description="Crie trilhas de conhecimento e relacione cursos." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando trilha.</p>}
                <form className="row g-3" onSubmit={saveTrack}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Titulo</label>
                        <input className="form-control" value={titulo} required onChange={(event) => setTitulo(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Categoria</label>
                        <select className="form-select" value={idCategoria} required onChange={(event) => setIdCategoria(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.categorias.map((category) => <option value={category.id} key={category.id}>{category.nome}</option>)}
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label">Descricao</label>
                        <textarea className="form-control" value={descricao} rows={3} onChange={(event) => setDescricao(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Titulo", "Categoria", "Descricao", "Acoes"]}
                emptyText="Nenhuma trilha cadastrada."
                rows={data.trilhas.map((track) => [
                    track.titulo,
                    nameById(data.categorias, track.idCategoria, "nome"),
                    track.descricao || "-",
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editTrack(track)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                        <ActionButton danger onClick={() => removeById("trilhas", track.id)}>Excluir</ActionButton>
                    </div>
                ])}
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
                columns={["Trilha", "Curso", "Ordem", "Acoes"]}
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
