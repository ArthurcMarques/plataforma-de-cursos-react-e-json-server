import { CrudPage } from "../components/CrudPage";
import type { Pagamento } from "../models/types";
import { nameById, normalize, sameId, todayISO } from "../utils";
import type { PageProps } from "./pageTypes";
import { ActionButton, money, quickCreatePlan, quickCreateSubscription, quickCreateUser, subscriptionDescription } from "./shared";

// Paginas do modulo financeiro: planos, assinaturas e pagamentos.
export function PlansPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    return (
        <CrudPage
            title="Planos"
            description="Defina planos para simular assinaturas e pagamentos."
            initialValues={{ nome: "", descricao: "", preco: "", duracaoMeses: "" }}
            fields={[
                { name: "nome", label: "Nome", required: true },
                { name: "preco", label: "Preço", type: "number", min: 0, step: "0.01", required: true },
                { name: "duracaoMeses", label: "Duração em meses", type: "number", min: 1, required: true },
                { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
            ]}
            columns={[
                { key: "nome", label: "Nome" },
                { key: "preco", label: "Preço", render: (item) => money(item.preco) },
                { key: "duracaoMeses", label: "Duração", render: (item) => `${item.duracaoMeses} meses` },
                { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
            ]}
            rows={data.planos}
            emptyText="Nenhum plano cadastrado."
            onSubmit={(form) => {
                if (data.planos.some((item) => normalize(item.nome) === normalize(form.nome))) {
                    notify("Já existe um plano com esse nome.", "danger");
                    return false;
                }
                addWithId("planos", { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Number(form.preco), duracaoMeses: Number(form.duracaoMeses) });
                return true;
            }}
            getEditValues={(item) => ({
                nome: item.nome,
                descricao: item.descricao,
                preco: String(item.preco),
                duracaoMeses: String(item.duracaoMeses)
            })}
            onUpdate={(item, form) => {
                if (data.planos.some((plan) => !sameId(plan.id, item.id) && normalize(plan.nome) === normalize(form.nome))) {
                    notify("Já existe um plano com esse nome.", "danger");
                    return false;
                }
                updateById("planos", item.id, { nome: form.nome.trim(), descricao: form.descricao.trim(), preco: Number(form.preco), duracaoMeses: Number(form.duracaoMeses) });
                return true;
            }}
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("assinaturas")}>Assinaturas</ActionButton>
                    <ActionButton danger onClick={() => removeById("planos", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function SubscriptionsPage({ data, addWithId, updateById, removeById, notify, navigate }: PageProps) {
    const rows = data.assinaturas.map((item) => ({ ...item, usuarioNome: nameById(data.usuarios, item.idUsuario, "nomeCompleto"), planoNome: nameById(data.planos, item.idPlano, "nome") }));

    return (
        <CrudPage
            title="Assinaturas"
            description="Vincule usuários a planos por período."
            initialValues={{ idUsuario: "", idPlano: "", dataInicio: todayISO(), dataFim: todayISO() }}
            fields={[
                { name: "idUsuario", label: "Usuário", type: "select", required: true, options: data.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })), actionLabel: "+ Usuário", onAction: () => quickCreateUser({ data, addWithId, notify }) },
                { name: "idPlano", label: "Plano", type: "select", required: true, options: data.planos.map((item) => ({ value: item.id, label: item.nome })), actionLabel: "+ Plano", onAction: () => quickCreatePlan({ data, addWithId, notify }) },
                { name: "dataInicio", label: "Início", type: "date", required: true },
                { name: "dataFim", label: "Fim", type: "date", required: true }
            ]}
            columns={[
                { key: "usuarioNome", label: "Usuário" },
                { key: "planoNome", label: "Plano" },
                { key: "dataInicio", label: "Início" },
                { key: "dataFim", label: "Fim" }
            ]}
            rows={rows}
            emptyText="Nenhuma assinatura cadastrada."
            onSubmit={(form) => {
                addWithId("assinaturas", { idUsuario: Number(form.idUsuario), idPlano: Number(form.idPlano), dataInicio: form.dataInicio, dataFim: form.dataFim });
                return true;
            }}
            getEditValues={(item) => ({
                idUsuario: String(item.idUsuario),
                idPlano: String(item.idPlano),
                dataInicio: item.dataInicio,
                dataFim: item.dataFim
            })}
            onUpdate={(item, form) => {
                updateById("assinaturas", item.id, { idUsuario: Number(form.idUsuario), idPlano: Number(form.idPlano), dataInicio: form.dataInicio, dataFim: form.dataFim });
                return true;
            }}
            renderActions={(item) => (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <ActionButton onClick={() => navigate("pagamentos")}>Pagamentos</ActionButton>
                    <ActionButton danger onClick={() => removeById("assinaturas", item.id)}>Excluir</ActionButton>
                </div>
            )}
        />
    );
}

export function PaymentsPage({ data, addWithId, updateById, removeById, notify }: PageProps) {
    const rows = data.pagamentos.map((item) => ({ ...item, assinaturaNome: subscriptionDescription(data, item.idAssinatura) }));

    return (
        <CrudPage
            title="Pagamentos"
            description="Registre pagamentos simulados para assinaturas."
            initialValues={{ idAssinatura: "", valorPago: "", dataPagamento: todayISO(), metodoPagamento: "", idTransacaoGateway: "" }}
            fields={[
                { name: "idAssinatura", label: "Assinatura", type: "select", required: true, options: data.assinaturas.map((item) => ({ value: item.id, label: subscriptionDescription(data, item.id) })), actionLabel: "+ Assinatura", onAction: () => quickCreateSubscription({ data, addWithId, notify }) },
                { name: "valorPago", label: "Valor pago", type: "number", min: 0, step: "0.01", required: true },
                { name: "dataPagamento", label: "Data", type: "date", required: true },
                { name: "metodoPagamento", label: "Método", type: "select", required: true, options: ["Cartão", "Pix", "Boleto"].map((item) => ({ value: item, label: item })) },
                { name: "idTransacaoGateway", label: "ID da transação", required: true }
            ]}
            columns={[
                { key: "assinaturaNome", label: "Assinatura" },
                { key: "valorPago", label: "Valor", render: (item) => money(item.valorPago) },
                { key: "dataPagamento", label: "Data" },
                { key: "metodoPagamento", label: "Método" },
                { key: "idTransacaoGateway", label: "Transação" }
            ]}
            rows={rows}
            emptyText="Nenhum pagamento cadastrado."
            onSubmit={(form) => {
                if (data.pagamentos.some((item) => normalize(item.idTransacaoGateway) === normalize(form.idTransacaoGateway))) {
                    notify("Já existe pagamento com esse ID de transação.", "danger");
                    return false;
                }
                addWithId("pagamentos", {
                    idAssinatura: Number(form.idAssinatura),
                    valorPago: Number(form.valorPago),
                    dataPagamento: form.dataPagamento,
                    metodoPagamento: form.metodoPagamento as Pagamento["metodoPagamento"],
                    idTransacaoGateway: form.idTransacaoGateway.trim()
                });
                return true;
            }}
            getEditValues={(item) => ({
                idAssinatura: String(item.idAssinatura),
                valorPago: String(item.valorPago),
                dataPagamento: item.dataPagamento,
                metodoPagamento: item.metodoPagamento,
                idTransacaoGateway: item.idTransacaoGateway
            })}
            onUpdate={(item, form) => {
                if (data.pagamentos.some((payment) => !sameId(payment.id, item.id) && normalize(payment.idTransacaoGateway) === normalize(form.idTransacaoGateway))) {
                    notify("Já existe pagamento com esse ID de transação.", "danger");
                    return false;
                }
                updateById("pagamentos", item.id, {
                    idAssinatura: Number(form.idAssinatura),
                    valorPago: Number(form.valorPago),
                    dataPagamento: form.dataPagamento,
                    metodoPagamento: form.metodoPagamento as Pagamento["metodoPagamento"],
                    idTransacaoGateway: form.idTransacaoGateway.trim()
                });
                return true;
            }}
            renderActions={(item) => <ActionButton danger onClick={() => removeById("pagamentos", item.id)}>Excluir</ActionButton>}
        />
    );
}
