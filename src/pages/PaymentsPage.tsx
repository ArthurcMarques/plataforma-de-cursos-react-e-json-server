// Pagina de pagamentos: registra pagamentos das assinaturas.
import type { FormEvent } from "react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Pagamento } from "../models/types";
import { normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, money, SimpleTable, subscriptionDescription } from "./shared";

export function PaymentsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.pagamentos.map((item) => ({ ...item, assinaturaNome: subscriptionDescription(data, item.idAssinatura) }));
    const [idAssinatura, setIdAssinatura] = useState("");
    const [valorPago, setValorPago] = useState("");
    const [dataPagamento, setDataPagamento] = useState(todayISO());
    const [metodoPagamento, setMetodoPagamento] = useState("");
    const [idTransacaoGateway, setIdTransacaoGateway] = useState("");
    const [editingId, setEditingId] = useState<string | number | null>(null);

    function clearForm() {
        setIdAssinatura("");
        setValorPago("");
        setDataPagamento(todayISO());
        setMetodoPagamento("");
        setIdTransacaoGateway("");
        setEditingId(null);
    }

    async function savePayment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // O id da transacao evita pagamentos duplicados.
        const repeated = data.pagamentos.some((item) => {
            return !sameId(item.id, editingId) && normalize(item.idTransacaoGateway) === normalize(idTransacaoGateway);
        });

        if (repeated) {
            notify("Ja existe pagamento com esse ID de transacao.", "danger");
            return;
        }

        const payment = {
            idAssinatura,
            valorPago: Number(valorPago),
            dataPagamento,
            metodoPagamento: metodoPagamento as Pagamento["metodoPagamento"],
            idTransacaoGateway: idTransacaoGateway.trim()
        };

        if (editingId !== null) {
            const updated = await updateById("pagamentos", editingId, payment);
            if (updated) {
                clearForm();
            }
            return;
        }

        await addWithId("pagamentos", payment);
        clearForm();
    }

    function editPayment(payment: Pagamento) {
        setEditingId(payment.id);
        setIdAssinatura(String(payment.idAssinatura));
        setValorPago(String(payment.valorPago));
        setDataPagamento(payment.dataPagamento);
        setMetodoPagamento(payment.metodoPagamento);
        setIdTransacaoGateway(payment.idTransacaoGateway);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return (
        <>
            <PageHeader title="Pagamentos" description="Registre pagamentos simulados para assinaturas." />
            <section className="panel">
                {editingId !== null && <p className="edit-banner">Editando pagamento.</p>}
                <form className="row g-3" onSubmit={savePayment}>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Assinatura</label>
                        <select className="form-select" value={idAssinatura} required onChange={(event) => setIdAssinatura(event.target.value)}>
                            <option value="">Selecione</option>
                            {data.assinaturas.map((subscription) => <option value={subscription.id} key={subscription.id}>{subscriptionDescription(data, subscription.id)}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Valor pago</label>
                        <input className="form-control" type="number" min={0} step="0.01" value={valorPago} required onChange={(event) => setValorPago(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Data</label>
                        <input className="form-control" type="date" value={dataPagamento} required onChange={(event) => setDataPagamento(event.target.value)} />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">Metodo</label>
                        <select className="form-select" value={metodoPagamento} required onChange={(event) => setMetodoPagamento(event.target.value)}>
                            <option value="">Selecione</option>
                            <option value="Cartão">Cartao</option>
                            <option value="Pix">Pix</option>
                            <option value="Boleto">Boleto</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label">ID da transacao</label>
                        <input className="form-control" value={idTransacaoGateway} required onChange={(event) => setIdTransacaoGateway(event.target.value)} />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit">{editingId !== null ? "Salvar alteracoes" : "Salvar"}</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearForm}>{editingId !== null ? "Cancelar" : "Limpar"}</button>
                    </div>
                </form>
            </section>
            <SimpleTable
                columns={["Assinatura", "Valor", "Data", "Metodo", "Transacao", "Acoes"]}
                emptyText="Nenhum pagamento cadastrado."
                rows={rows.map((payment) => [
                    payment.assinaturaNome,
                    money(payment.valorPago),
                    payment.dataPagamento,
                    payment.metodoPagamento,
                    payment.idTransacaoGateway,
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <ActionButton onClick={() => editPayment(payment)}>Editar</ActionButton>
                        <ActionButton danger onClick={() => removeById("pagamentos", payment.id)}>Excluir</ActionButton>
                    </div>
                ])}
            />
        </>
    );
}
