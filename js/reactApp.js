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

function ModulosPage({ dados, adicionar, remover, avisar }) {
    const rows = dados.modulos.map((modulo) => ({
        ...modulo,
        cursoNome: nomePorId(dados.cursos, modulo.idCurso, "titulo")
    }));

    return h(CrudPage, {
        titulo: "Módulos",
        descricao: "Organize módulos dentro dos cursos.",
        initialValues: { idCurso: "", titulo: "", ordem: "" },
        fields: [
            { name: "idCurso", label: "Curso", type: "select", required: true, options: dados.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
            { name: "titulo", label: "Título", required: true },
            { name: "ordem", label: "Ordem", type: "number", min: 1, required: true }
        ],
        columns: [
            { key: "cursoNome", label: "Curso" },
            { key: "titulo", label: "Módulo" },
            { key: "ordem", label: "Ordem" }
        ],
        rows,
        emptyText: "Nenhum módulo cadastrado.",
        onSubmit: (form) => {
            const idCurso = Number(form.idCurso);
            const ordem = Number(form.ordem);
            const repetido = dados.modulos.some((item) => Number(item.idCurso) === idCurso && Number(item.ordem) === ordem);
            if (repetido) {
                avisar("Já existe um módulo com essa ordem neste curso.", "danger");
                return false;
            }
            adicionar("modulos", { idCurso, titulo: form.titulo.trim(), ordem });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("modulos", item.id) }, "Excluir")
    });
}

function AulasPage({ dados, adicionar, remover, avisar }) {
    const rows = dados.aulas.map((aula) => {
        const modulo = dados.modulos.find((item) => Number(item.id) === Number(aula.idModulo));
        return {
            ...aula,
            moduloNome: modulo ? modulo.titulo : "-",
            cursoNome: modulo ? nomePorId(dados.cursos, modulo.idCurso, "titulo") : "-"
        };
    });

    return h(CrudPage, {
        titulo: "Aulas",
        descricao: "Cadastre aulas dentro dos módulos.",
        initialValues: { idModulo: "", titulo: "", tipoConteudo: "", urlConteudo: "", duracaoMinutos: "", ordem: "" },
        fields: [
            { name: "idModulo", label: "Módulo", type: "select", required: true, options: dados.modulos.map((item) => ({ value: item.id, label: `${nomePorId(dados.cursos, item.idCurso, "titulo")} - ${item.titulo}` })) },
            { name: "titulo", label: "Título", required: true },
            { name: "tipoConteudo", label: "Tipo", type: "select", required: true, options: [
                { value: "Vídeo", label: "Vídeo" },
                { value: "Texto", label: "Texto" },
                { value: "Quiz", label: "Quiz" }
            ] },
            { name: "duracaoMinutos", label: "Duração em minutos", type: "number", min: 1, required: true },
            { name: "ordem", label: "Ordem", type: "number", min: 1, required: true },
            { name: "urlConteudo", label: "URL do conteúdo", type: "url", col: "col-12" }
        ],
        columns: [
            { key: "cursoNome", label: "Curso" },
            { key: "moduloNome", label: "Módulo" },
            { key: "titulo", label: "Aula" },
            { key: "tipoConteudo", label: "Tipo" },
            { key: "duracaoMinutos", label: "Duração", render: (item) => `${item.duracaoMinutos} min` },
            { key: "ordem", label: "Ordem" }
        ],
        rows,
        emptyText: "Nenhuma aula cadastrada.",
        onSubmit: (form) => {
            const idModulo = Number(form.idModulo);
            const ordem = Number(form.ordem);
            const repetida = dados.aulas.some((item) => Number(item.idModulo) === idModulo && Number(item.ordem) === ordem);
            if (repetida) {
                avisar("Já existe uma aula com essa ordem neste módulo.", "danger");
                return false;
            }
            adicionar("aulas", {
                idModulo,
                titulo: form.titulo.trim(),
                tipoConteudo: form.tipoConteudo,
                urlConteudo: form.urlConteudo.trim(),
                duracaoMinutos: Number(form.duracaoMinutos),
                ordem
            });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("aulas", item.id) }, "Excluir")
    });
}

function TrilhasPage({ dados, adicionar, remover, atualizarColecao, avisar }) {
    const [vinculo, setVinculo] = useState({ idTrilha: "", idCurso: "", ordem: "" });
    const vinculos = dados.trilhasCursos.map((item) => ({
        ...item,
        key: `${item.idTrilha}-${item.idCurso}`,
        trilhaNome: nomePorId(dados.trilhas, item.idTrilha, "titulo"),
        cursoNome: nomePorId(dados.cursos, item.idCurso, "titulo")
    }));

    function salvarVinculo(event) {
        event.preventDefault();
        const idTrilha = Number(vinculo.idTrilha);
        const idCurso = Number(vinculo.idCurso);
        const ordem = Number(vinculo.ordem);
        const repetido = dados.trilhasCursos.some((item) => Number(item.idTrilha) === idTrilha && Number(item.idCurso) === idCurso);
        if (repetido) {
            avisar("Esse curso já está vinculado a essa trilha.", "danger");
            return;
        }
        atualizarColecao("trilhasCursos", (lista) => [...lista, { idTrilha, idCurso, ordem }]);
        setVinculo({ idTrilha: "", idCurso: "", ordem: "" });
        avisar("Curso vinculado à trilha.");
    }

    return h(
        React.Fragment,
        null,
        h(CrudPage, {
            titulo: "Trilhas",
            descricao: "Crie trilhas de conhecimento e relacione cursos.",
            initialValues: { titulo: "", descricao: "", idCategoria: "" },
            fields: [
                { name: "titulo", label: "Título", required: true },
                { name: "idCategoria", label: "Categoria", type: "select", required: true, options: dados.categorias.map((item) => ({ value: item.id, label: item.nome })) },
                { name: "descricao", label: "Descrição", type: "textarea", col: "col-12" }
            ],
            columns: [
                { key: "titulo", label: "Título" },
                { key: "categoria", label: "Categoria", render: (item) => nomePorId(dados.categorias, item.idCategoria, "nome") },
                { key: "descricao", label: "Descrição", render: (item) => item.descricao || "-" }
            ],
            rows: dados.trilhas,
            emptyText: "Nenhuma trilha cadastrada.",
            onSubmit: (form) => {
                adicionar("trilhas", { titulo: form.titulo.trim(), descricao: form.descricao.trim(), idCategoria: Number(form.idCategoria) });
                return true;
            },
            renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("trilhas", item.id) }, "Excluir")
        }),
        h(
            "section",
            { className: "bg-white border rounded-3 p-4" },
            h("h2", { className: "h5 mb-3" }, "Cursos da trilha"),
            h("form", { className: "row g-3", onSubmit: salvarVinculo },
                h(FormField, { field: { name: "idTrilha", label: "Trilha", type: "select", required: true, options: dados.trilhas.map((item) => ({ value: item.id, label: item.titulo })) }, value: vinculo.idTrilha, onChange: (campo, valor) => setVinculo((atual) => ({ ...atual, [campo]: valor })) }),
                h(FormField, { field: { name: "idCurso", label: "Curso", type: "select", required: true, options: dados.cursos.map((item) => ({ value: item.id, label: item.titulo })) }, value: vinculo.idCurso, onChange: (campo, valor) => setVinculo((atual) => ({ ...atual, [campo]: valor })) }),
                h(FormField, { field: { name: "ordem", label: "Ordem", type: "number", min: 1, required: true }, value: vinculo.ordem, onChange: (campo, valor) => setVinculo((atual) => ({ ...atual, [campo]: valor })) }),
                h("div", { className: "col-12" }, h("button", { type: "submit", className: "btn btn-primary" }, "Vincular"))
            )
        ),
        h(DataTable, {
            columns: [
                { key: "trilhaNome", label: "Trilha" },
                { key: "cursoNome", label: "Curso" },
                { key: "ordem", label: "Ordem" }
            ],
            rows: vinculos,
            emptyText: "Nenhum curso vinculado a trilhas.",
            renderActions: (item) => h(ActionButton, {
                variant: "outline-danger",
                onClick: () => atualizarColecao("trilhasCursos", (lista) => lista.filter((registro) => !(Number(registro.idTrilha) === Number(item.idTrilha) && Number(registro.idCurso) === Number(item.idCurso))))
            }, "Excluir")
        })
    );
}

function MatriculasPage({ dados, adicionar, remover, avisar }) {
    const rows = dados.matriculas.map((item) => ({
        ...item,
        usuarioNome: nomePorId(dados.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nomePorId(dados.cursos, item.idCurso, "titulo")
    }));

    return h(CrudPage, {
        titulo: "Matrículas",
        descricao: "Simule a matrícula de usuários em cursos.",
        initialValues: { idUsuario: "", idCurso: "", dataMatricula: hojeISO() },
        fields: [
            { name: "idUsuario", label: "Usuário", type: "select", required: true, options: dados.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "idCurso", label: "Curso", type: "select", required: true, options: dados.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
            { name: "dataMatricula", label: "Data", type: "date", required: true }
        ],
        columns: [
            { key: "usuarioNome", label: "Usuário" },
            { key: "cursoNome", label: "Curso" },
            { key: "dataMatricula", label: "Data" }
        ],
        rows,
        emptyText: "Nenhuma matrícula cadastrada.",
        onSubmit: (form) => {
            const idUsuario = Number(form.idUsuario);
            const idCurso = Number(form.idCurso);
            const repetida = dados.matriculas.some((item) => Number(item.idUsuario) === idUsuario && Number(item.idCurso) === idCurso);
            if (repetida) {
                avisar("Esse usuário já está matriculado nesse curso.", "danger");
                return false;
            }
            adicionar("matriculas", { idUsuario, idCurso, dataMatricula: form.dataMatricula, dataConclusao: null });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("matriculas", item.id) }, "Excluir")
    });
}

function ProgressoPage({ dados, adicionar, atualizarColecao, avisar }) {
    const rows = dados.progressoAulas.map((item) => ({
        ...item,
        key: `${item.idUsuario}-${item.idAula}`,
        usuarioNome: nomePorId(dados.usuarios, item.idUsuario, "nomeCompleto"),
        aulaNome: nomePorId(dados.aulas, item.idAula, "titulo")
    }));

    return h(CrudPage, {
        titulo: "Progresso",
        descricao: "Registre conclusão ou andamento das aulas.",
        initialValues: { idUsuario: "", idAula: "", status: "Concluído", dataConclusao: hojeISO() },
        fields: [
            { name: "idUsuario", label: "Usuário", type: "select", required: true, options: dados.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "idAula", label: "Aula", type: "select", required: true, options: dados.aulas.map((item) => ({ value: item.id, label: item.titulo })) },
            { name: "status", label: "Status", type: "select", required: true, options: [
                { value: "Concluído", label: "Concluído" },
                { value: "Em andamento", label: "Em andamento" }
            ] },
            { name: "dataConclusao", label: "Data", type: "date", required: true }
        ],
        columns: [
            { key: "usuarioNome", label: "Usuário" },
            { key: "aulaNome", label: "Aula" },
            { key: "status", label: "Status" },
            { key: "dataConclusao", label: "Data" }
        ],
        rows,
        emptyText: "Nenhum progresso registrado.",
        onSubmit: (form) => {
            const idUsuario = Number(form.idUsuario);
            const idAula = Number(form.idAula);
            const repetido = dados.progressoAulas.some((item) => Number(item.idUsuario) === idUsuario && Number(item.idAula) === idAula);
            if (repetido) {
                avisar("Esse usuário já possui progresso nessa aula.", "danger");
                return false;
            }
            adicionar("progressoAulas", { idUsuario, idAula, status: form.status, dataConclusao: form.dataConclusao });
            return true;
        },
        renderActions: (item) => h(ActionButton, {
            variant: "outline-danger",
            onClick: () => atualizarColecao("progressoAulas", (lista) => lista.filter((registro) => !(Number(registro.idUsuario) === Number(item.idUsuario) && Number(registro.idAula) === Number(item.idAula))))
        }, "Excluir")
    });
}

function AvaliacoesPage({ dados, adicionar, remover }) {
    const rows = dados.avaliacoes.map((item) => ({
        ...item,
        usuarioNome: nomePorId(dados.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nomePorId(dados.cursos, item.idCurso, "titulo")
    }));

    return h(CrudPage, {
        titulo: "Avaliações",
        descricao: "Registre avaliações de usuários para os cursos.",
        initialValues: { idUsuario: "", idCurso: "", nota: "", comentario: "", dataAvaliacao: hojeISO() },
        fields: [
            { name: "idUsuario", label: "Usuário", type: "select", required: true, options: dados.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "idCurso", label: "Curso", type: "select", required: true, options: dados.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
            { name: "nota", label: "Nota", type: "select", required: true, options: [1, 2, 3, 4, 5].map((nota) => ({ value: nota, label: String(nota) })) },
            { name: "dataAvaliacao", label: "Data", type: "date", required: true },
            { name: "comentario", label: "Comentário", type: "textarea", col: "col-12" }
        ],
        columns: [
            { key: "usuarioNome", label: "Usuário" },
            { key: "cursoNome", label: "Curso" },
            { key: "nota", label: "Nota" },
            { key: "comentario", label: "Comentário", render: (item) => item.comentario || "-" },
            { key: "dataAvaliacao", label: "Data" }
        ],
        rows,
        emptyText: "Nenhuma avaliação cadastrada.",
        onSubmit: (form) => {
            adicionar("avaliacoes", { ...form, idUsuario: Number(form.idUsuario), idCurso: Number(form.idCurso), nota: Number(form.nota) });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("avaliacoes", item.id) }, "Excluir")
    });
}

function CertificadosPage({ dados, atualizarColecao, avisar }) {
    const rows = dados.certificados.map((item) => ({
        ...item,
        usuarioNome: nomePorId(dados.usuarios, item.idUsuario, "nomeCompleto"),
        cursoNome: nomePorId(dados.cursos, item.idCurso, "titulo")
    }));

    function usuarioTemProgressoConcluido(idUsuario, idCurso) {
        const modulosCurso = dados.modulos.filter((modulo) => Number(modulo.idCurso) === Number(idCurso));
        const idsAulasCurso = dados.aulas
            .filter((aula) => modulosCurso.some((modulo) => Number(modulo.id) === Number(aula.idModulo)))
            .map((aula) => Number(aula.id));
        return dados.progressoAulas.some((progresso) => {
            return Number(progresso.idUsuario) === Number(idUsuario) &&
                idsAulasCurso.includes(Number(progresso.idAula)) &&
                normalizarTexto(progresso.status).includes("concl");
        });
    }

    return h(CrudPage, {
        titulo: "Certificados",
        descricao: "Gere certificados para usuários com progresso concluído no curso.",
        initialValues: { idUsuario: "", idCurso: "", dataEmissao: hojeISO() },
        fields: [
            { name: "idUsuario", label: "Usuário", type: "select", required: true, options: dados.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "idCurso", label: "Curso", type: "select", required: true, options: dados.cursos.map((item) => ({ value: item.id, label: item.titulo })) },
            { name: "dataEmissao", label: "Data de emissão", type: "date", required: true }
        ],
        columns: [
            { key: "usuarioNome", label: "Usuário" },
            { key: "cursoNome", label: "Curso" },
            { key: "codigoVerificacao", label: "Código" },
            { key: "dataEmissao", label: "Emissão" }
        ],
        rows,
        emptyText: "Nenhum certificado gerado.",
        onSubmit: (form) => {
            const idUsuario = Number(form.idUsuario);
            const idCurso = Number(form.idCurso);
            const duplicado = dados.certificados.some((item) => Number(item.idUsuario) === idUsuario && Number(item.idCurso) === idCurso);
            if (duplicado) {
                avisar("Já existe certificado para esse usuário nesse curso.", "danger");
                return false;
            }
            if (!usuarioTemProgressoConcluido(idUsuario, idCurso)) {
                avisar("Registre progresso concluído em uma aula desse curso antes de gerar certificado.", "danger");
                return false;
            }
            atualizarColecao("certificados", (lista) => {
                const id = proximoId(lista);
                return [...lista, { id, idUsuario, idCurso, idTrilha: null, codigoVerificacao: `CERT-${String(id).padStart(3, "0")}`, dataEmissao: form.dataEmissao }];
            });
            avisar("Certificado gerado com sucesso.");
            return true;
        },
        renderActions: (item) => h(ActionButton, {
            variant: "outline-danger",
            onClick: () => atualizarColecao("certificados", (lista) => lista.filter((registro) => Number(registro.id) !== Number(item.id)))
        }, "Excluir")
    });
}

function AssinaturasPage({ dados, adicionar, remover }) {
    const rows = dados.assinaturas.map((item) => ({
        ...item,
        usuarioNome: nomePorId(dados.usuarios, item.idUsuario, "nomeCompleto"),
        planoNome: nomePorId(dados.planos, item.idPlano, "nome")
    }));

    return h(CrudPage, {
        titulo: "Assinaturas",
        descricao: "Vincule usuários a planos por período.",
        initialValues: { idUsuario: "", idPlano: "", dataInicio: hojeISO(), dataFim: hojeISO() },
        fields: [
            { name: "idUsuario", label: "Usuário", type: "select", required: true, options: dados.usuarios.map((item) => ({ value: item.id, label: item.nomeCompleto })) },
            { name: "idPlano", label: "Plano", type: "select", required: true, options: dados.planos.map((item) => ({ value: item.id, label: item.nome })) },
            { name: "dataInicio", label: "Início", type: "date", required: true },
            { name: "dataFim", label: "Fim", type: "date", required: true }
        ],
        columns: [
            { key: "usuarioNome", label: "Usuário" },
            { key: "planoNome", label: "Plano" },
            { key: "dataInicio", label: "Início" },
            { key: "dataFim", label: "Fim" }
        ],
        rows,
        emptyText: "Nenhuma assinatura cadastrada.",
        onSubmit: (form) => {
            adicionar("assinaturas", { idUsuario: Number(form.idUsuario), idPlano: Number(form.idPlano), dataInicio: form.dataInicio, dataFim: form.dataFim });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("assinaturas", item.id) }, "Excluir")
    });
}

function PagamentosPage({ dados, adicionar, remover, avisar }) {
    const rows = dados.pagamentos.map((item) => ({
        ...item,
        assinaturaNome: descricaoAssinatura(dados, item.idAssinatura)
    }));

    return h(CrudPage, {
        titulo: "Pagamentos",
        descricao: "Registre pagamentos simulados para assinaturas.",
        initialValues: { idAssinatura: "", valorPago: "", dataPagamento: hojeISO(), metodoPagamento: "", idTransacaoGateway: "" },
        fields: [
            { name: "idAssinatura", label: "Assinatura", type: "select", required: true, options: dados.assinaturas.map((item) => ({ value: item.id, label: descricaoAssinatura(dados, item.id) })) },
            { name: "valorPago", label: "Valor pago", type: "number", min: 0, step: "0.01", required: true },
            { name: "dataPagamento", label: "Data", type: "date", required: true },
            { name: "metodoPagamento", label: "Método", type: "select", required: true, options: [
                { value: "Cartão", label: "Cartão" },
                { value: "Pix", label: "Pix" },
                { value: "Boleto", label: "Boleto" }
            ] },
            { name: "idTransacaoGateway", label: "ID da transação", required: true }
        ],
        columns: [
            { key: "assinaturaNome", label: "Assinatura" },
            { key: "valorPago", label: "Valor", render: (item) => `R$ ${Number(item.valorPago).toFixed(2)}` },
            { key: "dataPagamento", label: "Data" },
            { key: "metodoPagamento", label: "Método" },
            { key: "idTransacaoGateway", label: "Transação" }
        ],
        rows,
        emptyText: "Nenhum pagamento cadastrado.",
        onSubmit: (form) => {
            const transacao = form.idTransacaoGateway.trim();
            const repetida = dados.pagamentos.some((item) => normalizarTexto(item.idTransacaoGateway) === normalizarTexto(transacao));
            if (repetida) {
                avisar("Já existe pagamento com esse ID de transação.", "danger");
                return false;
            }
            adicionar("pagamentos", {
                idAssinatura: Number(form.idAssinatura),
                valorPago: Number(form.valorPago),
                dataPagamento: form.dataPagamento,
                metodoPagamento: form.metodoPagamento,
                idTransacaoGateway: transacao
            });
            return true;
        },
        renderActions: (item) => h(ActionButton, { variant: "outline-danger", onClick: () => remover("pagamentos", item.id) }, "Excluir")
    });
}

function descricaoAssinatura(dados, idAssinatura) {
    const assinatura = dados.assinaturas.find((item) => Number(item.id) === Number(idAssinatura));
    if (!assinatura) {
        return "-";
    }

    return `${nomePorId(dados.usuarios, assinatura.idUsuario, "nomeCompleto")} - ${nomePorId(dados.planos, assinatura.idPlano, "nome")}`;
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
