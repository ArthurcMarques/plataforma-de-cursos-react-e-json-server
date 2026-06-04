const { createElement: h, useMemo, useState } = React;

const secoes = [
    { id: "dashboard", nome: "Início", grupo: "principal" },
    { id: "categorias", nome: "Categorias", grupo: "Acadêmico" },
    { id: "cursos", nome: "Cursos", grupo: "Acadêmico" },
    { id: "modulos", nome: "Módulos", grupo: "Acadêmico" },
    { id: "aulas", nome: "Aulas", grupo: "Acadêmico" },
    { id: "usuarios", nome: "Usuários", grupo: "Usuário" },
    { id: "matriculas", nome: "Matrículas", grupo: "Usuário" },
    { id: "progresso", nome: "Progresso", grupo: "Usuário" },
    { id: "certificados", nome: "Certificados", grupo: "Usuário" },
    { id: "planos", nome: "Planos", grupo: "Financeiro" },
    { id: "assinaturas", nome: "Assinaturas", grupo: "Financeiro" },
    { id: "pagamentos", nome: "Pagamentos", grupo: "Financeiro" }
];

function App() {
    const [secaoAtual, setSecaoAtual] = useState("dashboard");

    const grupos = useMemo(() => {
        return secoes.reduce((mapa, secao) => {
            if (secao.grupo === "principal") {
                return mapa;
            }

            if (!mapa[secao.grupo]) {
                mapa[secao.grupo] = [];
            }

            mapa[secao.grupo].push(secao);
            return mapa;
        }, {});
    }, []);

    return h(
        React.Fragment,
        null,
        h(Navbar, { grupos, secaoAtual, setSecaoAtual }),
        h(
            "main",
            { className: "container py-5" },
            h(Dashboard, { secaoAtual, setSecaoAtual })
        )
    );
}

function Navbar({ grupos, secaoAtual, setSecaoAtual }) {
    return h(
        "nav",
        { className: "navbar navbar-expand-lg bg-white border-bottom shadow-sm" },
        h(
            "div",
            { className: "container py-2" },
            h("button", {
                className: "navbar-brand fw-semibold btn btn-link text-decoration-none p-0",
                type: "button",
                onClick: () => setSecaoAtual("dashboard")
            }, "Plataforma de Cursos"),
            h("button", {
                className: "navbar-toggler",
                type: "button",
                "data-bs-toggle": "collapse",
                "data-bs-target": "#navbarReact",
                "aria-controls": "navbarReact",
                "aria-expanded": "false",
                "aria-label": "Alternar navegação"
            }, h("span", { className: "navbar-toggler-icon" })),
            h(
                "div",
                { className: "collapse navbar-collapse", id: "navbarReact" },
                h(
                    "ul",
                    { className: "navbar-nav ms-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0" },
                    h(NavItem, {
                        ativo: secaoAtual === "dashboard",
                        nome: "Início",
                        onClick: () => setSecaoAtual("dashboard")
                    }),
                    Object.entries(grupos).map(([nomeGrupo, itens]) => h(NavDropdown, {
                        key: nomeGrupo,
                        nomeGrupo,
                        itens,
                        secaoAtual,
                        setSecaoAtual
                    }))
                )
            )
        )
    );
}

function NavItem({ ativo, nome, onClick }) {
    return h(
        "li",
        { className: "nav-item" },
        h("button", {
            type: "button",
            className: `nav-link btn btn-link ${ativo ? "active fw-semibold" : ""}`,
            onClick
        }, nome)
    );
}

function NavDropdown({ nomeGrupo, itens, secaoAtual, setSecaoAtual }) {
    const ativo = itens.some((item) => item.id === secaoAtual);

    return h(
        "li",
        { className: "nav-item dropdown" },
        h("button", {
            className: `nav-link dropdown-toggle btn btn-link ${ativo ? "active fw-semibold" : ""}`,
            type: "button",
            "data-bs-toggle": "dropdown",
            "aria-expanded": "false"
        }, nomeGrupo),
        h(
            "ul",
            { className: "dropdown-menu dropdown-menu-end" },
            itens.map((item) => h(
                "li",
                { key: item.id },
                h("button", {
                    type: "button",
                    className: `dropdown-item ${secaoAtual === item.id ? "active" : ""}`,
                    onClick: () => setSecaoAtual(item.id)
                }, item.nome)
            ))
        )
    );
}

function Dashboard({ secaoAtual, setSecaoAtual }) {
    const secao = secoes.find((item) => item.id === secaoAtual);

    if (secaoAtual !== "dashboard") {
        return h(
            "section",
            { className: "bg-white border rounded-3 p-4 p-md-5" },
            h("h1", { className: "h3 mb-2" }, secao ? secao.nome : "Seção"),
            h("p", { className: "text-muted mb-0" }, "A implementação React desta tela será adicionada nas próximas etapas.")
        );
    }

    return h(
        React.Fragment,
        null,
        h(
            "section",
            { className: "mx-auto bg-white border rounded-3 p-4 p-md-5 text-center" },
            h("h1", { className: "mb-3" }, "Plataforma de Cursos"),
            h("p", { className: "mb-4" }, "Aplicação acadêmica migrada para React, mantendo dados no navegador."),
            h("button", {
                type: "button",
                className: "btn btn-primary px-4",
                onClick: () => setSecaoAtual("cursos")
            }, "Gerenciar cursos")
        ),
        h(
            "section",
            { className: "mt-5" },
            h(
                "div",
                { className: "row row-cols-1 row-cols-md-3 g-3" },
                h(DashboardCard, {
                    titulo: "Acadêmico",
                    texto: "Categorias, cursos, módulos, aulas e trilhas.",
                    onClick: () => setSecaoAtual("cursos")
                }),
                h(DashboardCard, {
                    titulo: "Usuário e Progresso",
                    texto: "Usuários, matrículas, progresso e certificados.",
                    onClick: () => setSecaoAtual("usuarios")
                }),
                h(DashboardCard, {
                    titulo: "Financeiro",
                    texto: "Planos, assinaturas e pagamentos.",
                    onClick: () => setSecaoAtual("planos")
                })
            )
        )
    );
}

function DashboardCard({ titulo, texto, onClick }) {
    return h(
        "div",
        { className: "col" },
        h(
            "div",
            { className: "card h-100" },
            h(
                "div",
                { className: "card-body d-flex flex-column" },
                h("h2", { className: "h5 card-title" }, titulo),
                h("p", { className: "card-text" }, texto),
                h("button", {
                    type: "button",
                    className: "btn btn-outline-primary mt-auto",
                    onClick
                }, "Acessar")
            )
        )
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
