import type { SectionItem } from "../components/Layout";

export const sections: SectionItem[] = [
    { id: "dashboard", name: "Início", group: "principal" },
    { id: "categorias", name: "Categorias", group: "Acadêmico" },
    { id: "cursos", name: "Cursos", group: "Acadêmico" },
    { id: "modulos", name: "Módulos", group: "Acadêmico" },
    { id: "aulas", name: "Aulas", group: "Acadêmico" },
    { id: "trilhas", name: "Trilhas", group: "Acadêmico" },
    { id: "usuarios", name: "Usuários", group: "Usuário" },
    { id: "matriculas", name: "Matrículas", group: "Usuário" },
    { id: "progresso", name: "Progresso", group: "Usuário" },
    { id: "avaliacoes", name: "Avaliações", group: "Usuário" },
    { id: "certificados", name: "Certificados", group: "Usuário" },
    { id: "planos", name: "Planos", group: "Financeiro" },
    { id: "assinaturas", name: "Assinaturas", group: "Financeiro" },
    { id: "pagamentos", name: "Pagamentos", group: "Financeiro" }
];

export const sectionPaths: Record<string, string> = {
    dashboard: "/",
    categorias: "/categorias",
    cursos: "/cursos",
    modulos: "/modulos",
    aulas: "/aulas",
    trilhas: "/trilhas",
    usuarios: "/usuarios",
    matriculas: "/matriculas",
    progresso: "/progresso",
    avaliacoes: "/avaliacoes",
    certificados: "/certificados",
    planos: "/planos",
    assinaturas: "/assinaturas",
    pagamentos: "/pagamentos"
};

export const sectionByPath = Object.fromEntries(Object.entries(sectionPaths).map(([section, path]) => [path, section]));
