// Pagina de planos: cadastra planos financeiros.
import type { FormEvent } from "react";
import { useState } from "react";
import { normalize, sameId } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, money, SimpleTable } from "./shared";

export function PlansPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [preco, setPreco] = useState("");
    const [duracaoMeses, setDuracaoMeses] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setNome("");
        setDescricao("");
        setPreco("");
        setDuracaoMeses("");
        setEditingId(null);
    }

    async function savePlan(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Nome do plano nao pode repetir.
        const repeated = data.planos.some((item) => !sameId(item.id, editingId) && normalize(item.nome) === normalize(nome));

        if (repeated) {
            notify("Ja existe um plano com esse nome.", "danger");
            return;
        }

        const plan = { nome: nome.trim(), descricao: descricao.trim(), preco: Number(preco), duracaoMeses: Number(duracaoMeses) };
        if (editingId !== null) {
            const updated = await updateById("planos", editingId, plan);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("planos", plan);
        clearForm();
    }

    function editPlan(plan: any) {
        setEditingId(plan.id);
        setNome(plan.nome);
        setDescricao(plan.descricao);
        setPreco(String(plan.preco));
        setDuracaoMeses(String(plan.duracaoMeses));
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <section className="panel">
                <h1 className="h3 mb-2">Planos</h1>
                <p className="text-muted mb-0">Defina planos para simular assinaturas e pagamentos.</p>
            </section>
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando plano.</p>}
                <form className="row g-3" onSubmit={savePlan}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nome</label>
                        <input className="form-control" value={nome} required onChange={(event) => setNome(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Preco</label>
                        <input className="form-control" type="number" min={0} step="0.01" value={preco} required onChange={(event) => setPreco(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Duracao em meses</label>
                        <input className="form-control" type="number" min={1} value={duracaoMeses} required onChange={(event) => setDuracaoMeses(event.target.value)} />
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
                columns={["Nome", "Preco", "Duracao", "Descricao", "Acoes"]}
                emptyText="Nenhum plano cadastrado."
                rows={data.planos.map((plan) => [
                    plan.nome,
                    money(plan.preco),
                    `${plan.duracaoMeses} meses`,
                    plan.descricao || "-",
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editPlan(plan)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("assinaturas")}>Assinaturas</ActionButton>
                        <ActionButton danger onClick={() => removeById("planos", plan.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
