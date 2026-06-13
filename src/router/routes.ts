// Lista usada para montar o menu de navegacao.
export interface SectionItem {
    id: string;
    name: string;
    path: string;
    group: "principal" | "Acadêmico" | "Usuário" | "Financeiro";
}

// Cada item define o menu e tambem a rota da pagina.
export const sections: SectionItem[] = [
    { id: "dashboard", name: "Início", path: "/", group: "principal" },
    { id: "categorias", name: "Categorias", path: "/categorias", group: "Acadêmico" },
    { id: "cursos", name: "Cursos", path: "/cursos", group: "Acadêmico" },
    { id: "modulos", name: "Módulos", path: "/modulos", group: "Acadêmico" },
    { id: "aulas", name: "Aulas", path: "/aulas", group: "Acadêmico" },
    { id: "trilhas", name: "Trilhas", path: "/trilhas", group: "Acadêmico" },
    { id: "usuarios", name: "Usuários", path: "/usuarios", group: "Usuário" },
    { id: "matriculas", name: "Matrículas", path: "/matriculas", group: "Usuário" },
    { id: "progresso", name: "Progresso", path: "/progresso", group: "Usuário" },
    { id: "avaliacoes", name: "Avaliações", path: "/avaliacoes", group: "Usuário" },
    { id: "certificados", name: "Certificados", path: "/certificados", group: "Usuário" },
    { id: "planos", name: "Planos", path: "/planos", group: "Financeiro" },
    { id: "assinaturas", name: "Assinaturas", path: "/assinaturas", group: "Financeiro" },
    { id: "pagamentos", name: "Pagamentos", path: "/pagamentos", group: "Financeiro" }
];
