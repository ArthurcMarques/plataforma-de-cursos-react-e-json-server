const { createElement: h, useMemo, useState } = React;

const storageKeys = {
    usuarios: "usuarios",
    categorias: "categorias",
    cursos: "cursos",
    modulos: "modulos",
    aulas: "aulas",
    matriculas: "matriculas",
    progressoAulas: "progressoAulas",
    avaliacoes: "avaliacoes",
    trilhas: "trilhas",
    trilhasCursos: "trilhasCursos",
    certificados: "certificados",
    planos: "planos",
    assinaturas: "assinaturas",
    pagamentos: "pagamentos"
};

const secoes = [
    { id: "dashboard", nome: "Início", grupo: "principal" },
    { id: "categorias", nome: "Categorias", grupo: "Acadêmico" },
    { id: "cursos", nome: "Cursos", grupo: "Acadêmico" },
    { id: "modulos", nome: "Módulos", grupo: "Acadêmico" },
    { id: "aulas", nome: "Aulas", grupo: "Acadêmico" },
    { id: "trilhas", nome: "Trilhas", grupo: "Acadêmico" },
    { id: "usuarios", nome: "Usuários", grupo: "Usuário" },
    { id: "matriculas", nome: "Matrículas", grupo: "Usuário" },
    { id: "progresso", nome: "Progresso", grupo: "Usuário" },
    { id: "avaliacoes", nome: "Avaliações", grupo: "Usuário" },
    { id: "certificados", nome: "Certificados", grupo: "Usuário" },
    { id: "planos", nome: "Planos", grupo: "Financeiro" },
    { id: "assinaturas", nome: "Assinaturas", grupo: "Financeiro" },
    { id: "pagamentos", nome: "Pagamentos", grupo: "Financeiro" }
];

function carregarLista(chave) {
    try {
        const valor = localStorage.getItem(chave);
        const lista = valor ? JSON.parse(valor) : [];
        return Array.isArray(lista) ? lista : [];
    } catch (erro) {
        return [];
    }
}

function carregarEstadoInicial() {
    return Object.entries(storageKeys).reduce((estado, [nome, chave]) => {
        estado[nome] = carregarLista(chave);
        return estado;
    }, {});
}

function salvarLista(nome, lista) {
    localStorage.setItem(storageKeys[nome], JSON.stringify(lista));
}

function hojeISO() {
    return new Date().toISOString().split("T")[0];
}

function proximoId(lista) {
    if (!lista.length) {
        return 1;
    }

    return Math.max(...lista.map((item) => Number(item.id) || 0)) + 1;
}

function normalizarTexto(valor) {
    return String(valor || "").trim().toLowerCase();
}

function App() {
    const [secaoAtual, setSecaoAtual] = useState("dashboard");
    const [dados, setDados] = useState(carregarEstadoInicial);
    const [alerta, setAlerta] = useState(null);

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

    function avisar(mensagem, tipo = "success") {
        setAlerta({ mensagem, tipo });
        window.setTimeout(() => setAlerta(null), 2800);
    }

    function atualizarColecao(nome, produtor) {
        setDados((estadoAtual) => {
            const listaAtual = estadoAtual[nome] || [];
            const novaLista = produtor(listaAtual);
            salvarLista(nome, novaLista);
            return { ...estadoAtual, [nome]: novaLista };
        });
    }

    function adicionar(nome, item) {
        atualizarColecao(nome, (lista) => [...lista, { id: proximoId(lista), ...item }]);
        avisar("Registro salvo com sucesso.");
    }

    function remover(nome, id) {
        const confirmar = window.confirm("Deseja excluir este registro?");
        if (!confirmar) {
            return;
        }

        atualizarColecao(nome, (lista) => lista.filter((item) => Number(item.id) !== Number(id)));
        avisar("Registro removido com sucesso.", "warning");
    }

    const contexto = { dados, adicionar, remover, atualizarColecao, avisar, setSecaoAtual };

    return h(
        React.Fragment,
        null,
        h(Navbar, { grupos, secaoAtual, setSecaoAtual }),
        alerta && h("div", {
            className: "position-fixed top-0 start-50 translate-middle-x p-3",
            style: { zIndex: 1080 }
        }, h("div", { className: `alert alert-${alerta.tipo} shadow-sm mb-0`, role: "alert" }, alerta.mensagem)),
        h("main", { className: "container py-5" }, h(SecaoAtual, { secaoAtual, contexto }))
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

function SecaoAtual({ secaoAtual, contexto }) {
    const componentes = {
        dashboard: Dashboard,
        categorias: CategoriasPage,
        usuarios: UsuariosPage,
        planos: PlanosPage,
        cursos: CursosPage,
        modulos: ModulosPage,
        aulas: AulasPage,
        trilhas: TrilhasPage,
        matriculas: MatriculasPage,
        progresso: ProgressoPage,
        avaliacoes: AvaliacoesPage,
        certificados: CertificadosPage,
        assinaturas: AssinaturasPage,
        pagamentos: PagamentosPage
    };
    const Componente = componentes[secaoAtual] || Dashboard;
    return h(Componente, contexto);
}

function Dashboard({ dados, setSecaoAtual }) {
    const cards = [
        { titulo: "Cursos", valor: dados.cursos.length, destino: "cursos" },
        { titulo: "Usuários", valor: dados.usuarios.length, destino: "usuarios" },
        { titulo: "Matrículas", valor: dados.matriculas.length, destino: "matriculas" },
        { titulo: "Pagamentos", valor: dados.pagamentos.length, destino: "pagamentos" }
    ];

    return h(
        React.Fragment,
        null,
        h(
            "section",
            { className: "mx-auto bg-white border rounded-3 p-4 p-md-5 text-center" },
            h("h1", { className: "mb-3" }, "Plataforma de Cursos"),
            h("p", { className: "mb-4" }, "Aplicação acadêmica migrada para React, mantendo persistência no navegador."),
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
                { className: "row row-cols-1 row-cols-md-4 g-3" },
                cards.map((card) => h(
                    "div",
                    { className: "col", key: card.titulo },
                    h(
                        "button",
                        {
                            type: "button",
                            className: "card h-100 w-100 text-start",
                            onClick: () => setSecaoAtual(card.destino)
                        },
                        h(
                            "div",
                            { className: "card-body" },
                            h("p", { className: "text-muted mb-1" }, card.titulo),
                            h("strong", { className: "display-6" }, card.valor)
                        )
                    )
                ))
            )
        )
    );
}

function CrudPage({ titulo, descricao, fields, columns, initialValues, onSubmit, rows, emptyText, renderActions }) {
    const [form, setForm] = useState(initialValues);

    function alterar(campo, valor) {
        setForm((atual) => ({ ...atual, [campo]: valor }));
    }

    function enviar(event) {
        event.preventDefault();
        const salvou = onSubmit(form);
        if (salvou !== false) {
            setForm(initialValues);
        }
    }

    return h(
        React.Fragment,
        null,
        h(
            "section",
            { className: "bg-white border rounded-3 p-4 p-md-5" },
            h("h1", { className: "h3 mb-2" }, titulo),
            h("p", { className: "text-muted mb-0" }, descricao)
        ),
        h(
            "section",
            { className: "bg-white border rounded-3 p-4" },
            h(
                "form",
                { className: "row g-3", onSubmit: enviar },
                fields.map((field) => h(FormField, {
                    key: field.name,
                    field,
                    value: form[field.name] || "",
                    onChange: alterar
                })),
                h(
                    "div",
                    { className: "col-12 d-flex gap-2" },
                    h("button", { type: "submit", className: "btn btn-primary" }, "Salvar"),
                    h("button", {
                        type: "button",
                        className: "btn btn-outline-secondary",
                        onClick: () => setForm(initialValues)
                    }, "Limpar")
                )
            )
        ),
        h(DataTable, { columns, rows, emptyText, renderActions })
    );
}

function FormField({ field, value, onChange }) {
    const col = field.col || "col-12 col-md-6";
    const common = {
        id: field.name,
        className: field.type === "textarea" ? "form-control" : "form-control",
        value,
        required: field.required,
        min: field.min,
        step: field.step,
        onChange: (event) => onChange(field.name, event.target.value)
    };

    return h(
        "div",
        { className: col },
        h("label", { className: "form-label", htmlFor: field.name }, field.label),
        field.type === "select"
            ? h(
                "select",
                { ...common, className: "form-select" },
                h("option", { value: "" }, field.placeholder || "Selecione"),
                field.options.map((option) => h("option", { key: option.value, value: option.value }, option.label))
            )
            : field.type === "textarea"
                ? h("textarea", { ...common, rows: 3 })
                : h("input", { ...common, type: field.type || "text", placeholder: field.placeholder || "" })
    );
}

function DataTable({ columns, rows, emptyText, renderActions }) {
    return h(
        "section",
        { className: "bg-white border rounded-3 p-4" },
        h(
            "div",
            { className: "table-responsive" },
            h(
                "table",
                { className: "table align-middle mb-0" },
                h("thead", null, h("tr", null,
                    columns.map((column) => h("th", { key: column.key }, column.label)),
                    renderActions && h("th", { className: "text-center" }, "Ações")
                )),
                h(
                    "tbody",
                    null,
                    rows.length === 0
                        ? h("tr", null, h("td", {
                            className: "text-center text-muted",
                            colSpan: columns.length + (renderActions ? 1 : 0)
                        }, emptyText))
                        : rows.map((row) => h("tr", { key: row.key || row.id || JSON.stringify(row) },
                            columns.map((column) => h("td", { key: column.key }, column.render ? column.render(row) : row[column.key])),
                            renderActions && h("td", { className: "text-center" }, renderActions(row))
                        ))
                )
            )
        )
    );
}

function ActionButton({ onClick, children, variant = "outline-secondary" }) {
    return h("button", { type: "button", className: `btn btn-sm btn-${variant}`, onClick }, children);
}

function CategoriasPage({ dados, adicionar, remover, avisar }) {
    return h(CrudPage, {
        titulo: "Categorias",
        descricao: "Organize os cursos por área de conhecimento.",
        initialValues: { nome: "", descricao: "" },
        fields: [
            { name: "nome", label: "Nome", required: true },
            { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
        ],
        columns: [
            { key: "nome", label: "Nome" },
            { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
        ],
        rows: dados.categorias,
        emptyText: "Nenhuma categoria cadastrada.",
        onSubmit: (form) => {
            const nome = form.nome.trim();
            if (dados.categorias.some((item) => normalizarTexto(item.nome) === normalizarTexto(nome))) {
                avisar("Já existe uma categoria com esse nome.", "danger");
                return false;
            }
            adicionar("categorias", { nome, descricao: form.descricao.trim() });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("categorias", item.id) }, "Excluir")
    });
}

function UsuariosPage({ dados, adicionar, remover, avisar }) {
    return h(CrudPage, {
        titulo: "Usuários",
        descricao: "Cadastre alunos e instrutores para uso nas demais telas.",
        initialValues: { nomeCompleto: "", email: "", senha: "", dataCadastro: hojeISO(), tipoUsuario: "Aluno" },
        fields: [
            { name: "nomeCompleto", label: "Nome completo", required: true },
            { name: "email", label: "E-mail", type: "email", required: true },
            { name: "senha", label: "Senha", type: "password", required: true },
            { name: "dataCadastro", label: "Data de cadastro", type: "date", required: true },
            { name: "tipoUsuario", label: "Tipo", type: "select", required: true, options: [
                { value: "Aluno", label: "Aluno" },
                { value: "Instrutor", label: "Instrutor" }
            ] }
        ],
        columns: [
            { key: "nomeCompleto", label: "Nome" },
            { key: "email", label: "E-mail" },
            { key: "tipoUsuario", label: "Tipo", render: (item) => item.tipoUsuario || "Aluno" },
            { key: "dataCadastro", label: "Cadastro" }
        ],
        rows: dados.usuarios,
        emptyText: "Nenhum usuário cadastrado.",
        onSubmit: (form) => {
            const email = normalizarTexto(form.email);
            if (dados.usuarios.some((item) => normalizarTexto(item.email) === email)) {
                avisar("Já existe um usuário com esse e-mail.", "danger");
                return false;
            }
            adicionar("usuarios", { ...form, email });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("usuarios", item.id) }, "Excluir")
    });
}

function PlanosPage({ dados, adicionar, remover, avisar }) {
    return h(CrudPage, {
        titulo: "Planos",
        descricao: "Defina planos para simular assinaturas e pagamentos.",
        initialValues: { nome: "", descricao: "", preco: "", duracaoMeses: "" },
        fields: [
            { name: "nome", label: "Nome", required: true },
            { name: "preco", label: "Preço", type: "number", min: 0, step: "0.01", required: true },
            { name: "duracaoMeses", label: "Duração em meses", type: "number", min: 1, required: true },
            { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
        ],
        columns: [
            { key: "nome", label: "Nome" },
            { key: "preco", label: "Preço", render: (item) => `R$ ${Number(item.preco).toFixed(2)}` },
            { key: "duracaoMeses", label: "Duração", render: (item) => `${item.duracaoMeses} meses` },
            { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
        ],
        rows: dados.planos,
        emptyText: "Nenhum plano cadastrado.",
        onSubmit: (form) => {
            if (dados.planos.some((item) => normalizarTexto(item.nome) === normalizarTexto(form.nome))) {
                avisar("Já existe um plano com esse nome.", "danger");
                return false;
            }
            adicionar("planos", {
                nome: form.nome.trim(),
                descricao: form.descricao.trim(),
                preco: Number(form.preco),
                duracaoMeses: Number(form.duracaoMeses)
            });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("planos", item.id) }, "Excluir")
    });
}

function CursosPage({ dados, adicionar, remover, avisar, setSecaoAtual }) {
    const instrutores = dados.usuarios.filter((usuario) => (usuario.tipoUsuario || "Aluno") === "Instrutor");
    const rows = dados.cursos.map((curso) => {
        const modulosCurso = dados.modulos.filter((modulo) => Number(modulo.idCurso) === Number(curso.id));
        const aulasCurso = dados.aulas.filter((aula) => modulosCurso.some((modulo) => Number(modulo.id) === Number(aula.idModulo)));
        const minutos = aulasCurso.reduce((total, aula) => total + (Number(aula.duracaoMinutos) || 0), 0);
        return {
            ...curso,
            categoriaNome: nomePorId(dados.categorias, curso.idCategoria, "nome"),
            instrutorNome: nomePorId(dados.usuarios, curso.idInstrutor, "nomeCompleto"),
            totalAulas: aulasCurso.length,
            totalHoras: Number((minutos / 60).toFixed(1))
        };
    });

    return h(CrudPage, {
        titulo: "Cursos",
        descricao: "Cadastre cursos e vincule categoria e instrutor.",
        initialValues: { titulo: "", descricao: "", nivel: "", idCategoria: "", idInstrutor: "", dataPublicacao: hojeISO() },
        fields: [
            { name: "titulo", label: "Título", required: true },
            { name: "nivel", label: "Nível", type: "select", required: true, options: [
                { value: "Iniciante", label: "Iniciante" },
                { value: "Intermediário", label: "Intermediário" },
                { value: "Avançado", label: "Avançado" }
            ] },
            { name: "idCategoria", label: "Categoria", type: "select", required: true, options: dados.categorias.map((item) => ({ value: item.id, label: item.nome })) },
            { name: "idInstrutor", label: "Instrutor", type: "select", required: true, options: instrutores.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "dataPublicacao", label: "Data de publicação", type: "date", required: true },
            { name: "descricao", label: "Descrição", type: "textarea", col: "col-12", required: true }
        ],
        columns: [
            { key: "titulo", label: "Título" },
            { key: "categoriaNome", label: "Categoria" },
            { key: "instrutorNome", label: "Instrutor" },
            { key: "nivel", label: "Nível" },
            { key: "totalAulas", label: "Aulas" },
            { key: "totalHoras", label: "Horas", render: (item) => `${item.totalHoras} h` }
        ],
        rows,
        emptyText: "Nenhum curso cadastrado.",
        onSubmit: (form) => {
            if (!dados.categorias.length || !instrutores.length) {
                avisar("Cadastre ao menos uma categoria e um instrutor antes do curso.", "danger");
                return false;
            }
            adicionar("cursos", {
                ...form,
                idCategoria: Number(form.idCategoria),
                idInstrutor: Number(form.idInstrutor),
                totalAulas: 0,
                totalHoras: 0
            });
            return true;
        },
        renderActions: (item) => h("div", { className: "d-flex justify-content-center gap-2" },
            h(ActionButton, { onClick: () => setSecaoAtual("modulos") }, "Módulos"),
            h(ActionButton, { variant: "outline-danger", onClick: () => remover("cursos", item.id) }, "Excluir")
        )
    });
}

function nomePorId(lista, id, campo) {
    const item = lista.find((registro) => Number(registro.id) === Number(id));
    return item ? item[campo] : "-";
}

function PlaceholderPage({ titulo }) {
    return h(
        "section",
        { className: "bg-white border rounded-3 p-4 p-md-5" },
        h("h1", { className: "h3 mb-2" }, titulo),
        h("p", { className: "text-muted mb-0" }, "Esta tela entra na próxima etapa da migração React.")
    );
}

function ModulosPage() {
    return h(PlaceholderPage, { titulo: "Módulos" });
}

function AulasPage() {
    return h(PlaceholderPage, { titulo: "Aulas" });
}

function TrilhasPage() {
    return h(PlaceholderPage, { titulo: "Trilhas" });
}

function MatriculasPage() {
    return h(PlaceholderPage, { titulo: "Matrículas" });
}

function ProgressoPage() {
    return h(PlaceholderPage, { titulo: "Progresso" });
}

function AvaliacoesPage() {
    return h(PlaceholderPage, { titulo: "Avaliações" });
}

function CertificadosPage() {
    return h(PlaceholderPage, { titulo: "Certificados" });
}

function AssinaturasPage() {
    return h(PlaceholderPage, { titulo: "Assinaturas" });
}

function PagamentosPage() {
    return h(PlaceholderPage, { titulo: "Pagamentos" });
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
