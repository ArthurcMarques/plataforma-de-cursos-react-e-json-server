// Layout visual da aplicacao com navbar e area de conteudo.
import type { ReactNode } from "react";
import type { SectionItem } from "../router/routes";

interface LayoutProps {
    sections: SectionItem[];
    currentPath: string;
    onNavigate: (path: string) => void;
    children: ReactNode;
}

export function Layout({ sections, currentPath, onNavigate, children }: LayoutProps) {
    // Agrupa as secoes para montar os dropdowns do menu.
    const grouped = sections.reduce<Record<string, SectionItem[]>>((groups, section) => {
        if (section.group === "principal") {
            return groups;
        }

        return { ...groups, [section.group]: [...(groups[section.group] ?? []), section] };
    }, {});

    return (
        <>
            <nav className="navbar navbar-expand-lg app-nav">
                <div className="container py-2">
                    <button className="navbar-brand fw-semibold btn btn-link text-decoration-none p-0" type="button" onClick={() => onNavigate("/")}>
                        Plataforma de Cursos
                    </button>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarReact" aria-controls="navbarReact" aria-expanded="false" aria-label="Alternar navegação">
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarReact">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0">
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${currentPath === "/" ? "active fw-semibold" : ""}`} type="button" onClick={() => onNavigate("/")}>
                                    Início
                                </button>
                            </li>
                            {Object.entries(grouped).map(([groupName, items]) => (
                                <li className="nav-item dropdown" key={groupName}>
                                    <button className={`nav-link dropdown-toggle btn btn-link ${items.some((item) => item.path === currentPath) ? "active fw-semibold" : ""}`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {groupName}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        {items.map((item) => (
                                            <li key={item.id}>
                                                <button className={`dropdown-item ${currentPath === item.path ? "active" : ""}`} type="button" onClick={() => onNavigate(item.path)}>
                                                    {item.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
            <main className="container app-main">{children}</main>
        </>
    );
}
