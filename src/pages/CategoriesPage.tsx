import type { FormEvent } from "react";
import { useState } from "react";
import { normalize, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function CategoriesPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setNome("");
        setDescricao("");
        setEditingId(null);
    }

    async function saveCategory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedName = nome.trim();
        const repeated = data.categorias.some((item) => !sameId(item.id, editingId) && normalize(item.nome) === normalize(trimmedName));

        if (repeated) {
            notify("Ja existe uma categoria com esse nome.", "danger");
            return;
        }

        if (editingId !== null) {
            const updated = await updateById("categorias", editingId, { nome: trimmedName, descricao: descricao.trim() });
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("categorias", { nome: trimmedName, descricao: descricao.trim() });
        clearForm();
    }

    function editCategory(category: any) {
        setEditingId(category.id);
        setNome(category.nome);
        setDescricao(category.descricao);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Categorias</h1>
                <p className="text-muted mb-0">Organize os cursos por area de conhecimento.</p>
            </section>
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando categoria.</p>}
                <form className="row g-3" onSubmit={saveCategory}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nome</label>
                        <input className="form-control" value={nome} required onChange={(event) => setNome(event.target.value)} />
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
                columns={["Nome", "Descricao", "Acoes"]}
                emptyText="Nenhuma categoria cadastrada."
                rows={data.categorias.map((category) => [
                    category.nome,
                    category.descricao || "-",
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editCategory(category)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("cursos")}>Cursos</ActionButton>
                        <ActionButton danger onClick={() => removeById("categorias", category.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
