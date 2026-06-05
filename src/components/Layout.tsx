import type { ReactNode } from "react";

export interface SectionItem {
    id: string;
    name: string;
    group: "principal" | "Acadêmico" | "Usuário" | "Financeiro";
}

interface LayoutProps {
    sections: SectionItem[];
    currentSection: string;
    onNavigate: (section: string) => void;
    children: ReactNode;
}

export function Layout({ sections, currentSection, onNavigate, children }: LayoutProps) {
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
                    <button className="navbar-brand fw-semibold btn btn-link text-decoration-none p-0" type="button" onClick={() => onNavigate("dashboard")}>
                        Plataforma de Cursos
                    </button>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarReact" aria-controls="navbarReact" aria-expanded="false" aria-label="Alternar navegação">
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarReact">
                        <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 mt-3 mt-lg-0">
                            <li className="nav-item">
                                <button className={`nav-link btn btn-link ${currentSection === "dashboard" ? "active fw-semibold" : ""}`} type="button" onClick={() => onNavigate("dashboard")}>
                                    Início
                                </button>
                            </li>
                            {Object.entries(grouped).map(([groupName, items]) => (
                                <li className="nav-item dropdown" key={groupName}>
                                    <button className={`nav-link dropdown-toggle btn btn-link ${items.some((item) => item.id === currentSection) ? "active fw-semibold" : ""}`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {groupName}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        {items.map((item) => (
                                            <li key={item.id}>
                                                <button className={`dropdown-item ${currentSection === item.id ? "active" : ""}`} type="button" onClick={() => onNavigate(item.id)}>
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
