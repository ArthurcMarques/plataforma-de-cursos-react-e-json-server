// Pagina de assinaturas: vincula usuarios a planos.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { nameById, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, SimpleTable } from "./shared";

export function SubscriptionsPage({ data, addWithId, updateById, removeById, navigate }: PageProps) {
    const rows = data.assinaturas.map((item) => ({
        ...item,
        usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"),
        planoNome: nameById(data.planos, item.idPlano, "nome")
    }));
    const [idUsuario, setIdUsuario] = useState("");
    const [idPlano, setIdPlano] = useState("");
    const [dataInicio, setDataInicio] = useState(todayISO());
    const [dataFim, setDataFim] = useState(todayISO());
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdUsuario("");
        setIdPlano("");
        setDataInicio(todayISO());
        setDataFim(todayISO());
        setEditingId(null);
    }

    async function saveSubscription(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Datas e ids selecionados sao enviados para o JSON Server.
        const subscription = { idUsuario, idPlano, dataInicio, dataFim };

        if (editingId !== null) {
            const updated = await updateById("assinaturas", editingId, subscription);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("assinaturas", subscription);
        clearForm();
    }

    function editSubscription(subscription: any) {
        setEditingId(subscription.id);
        setIdUsuario(String(subscription.idUsuario));
        setIdPlano(String(subscription.idPlano));
        setDataInicio(subscription.dataInicio);
        setDataFim(subscription.dataFim);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title="Assinaturas" description="Vincule usuarios a planos por periodo." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando assinatura.</p>}
                <form className="row g-3" onSubmit={saveSubscription}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Usuario</label>
                        <select className="form-select" value={idUsuario} required onChange={(event) => setIdUsuario(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.usuarios.map((user) => <option value={user.id} key={user.id}>{user.nomeCompleto}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Plano</label>
                        <select className="form-select" value={idPlano} required onChange={(event) => setIdPlano(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.planos.map((plan) => <option value={plan.id} key={plan.id}>{plan.nome}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Inicio</label>
                        <input className="form-control" type="date" value={dataInicio} required onChange={(event) => setDataInicio(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Fim</label>
                        <input className="form-control" type="date" value={dataFim} required onChange={(event) => setDataFim(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Usuario", "Plano", "Inicio", "Fim", "Acoes"]}
                emptyText="Nenhuma assinatura cadastrada."
                rows={rows.map((subscription) => [
                    subscription.usuarioNome,
                    subscription.planoNome,
                    subscription.dataInicio,
                    subscription.dataFim,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editSubscription(subscription)}>Editar</ActionButton>
                        <ActionButton onClick={() => navigate("pagamentos")}>Pagamentos</ActionButton>
                        <ActionButton danger onClick={() => removeById("assinaturas", subscription.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
