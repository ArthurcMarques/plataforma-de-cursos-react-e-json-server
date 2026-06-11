import type { PageProps } from "./pageTypes";

// Pagina inicial com atalhos para as principais secoes.
export function DashboardPage({ data, navigate }: PageProps) {
    const cards = [
        { title: "Cursos", value: data.cursos.length, section: "cursos" },
        { title: "Usuários", value: data.usuarios.length, section: "usuarios" },
        { title: "Matrículas", value: data.matriculas.length, section: "matriculas" },
        { title: "Pagamentos", value: data.pagamentos.length, section: "pagamentos" }
    ];

    return (
        <>
            <section className="panel hero-panel">
                <h1>Plataforma de Cursos</h1>
                <p>Aplicação React com TypeScript para gerenciar cursos, usuários, progresso e pagamentos.</p>
                <button className="btn btn-primary px-4" type="button" onClick={() => navigate("cursos")}>Gerenciar cursos</button>
            </section>
            <section className="stats-grid">
                {cards.map((card) => (
                    <button className="stat-card" type="button" onClick={() => navigate(card.section)} key={card.title}>
                        <span>{card.title}</span>
                        <strong>{card.value}</strong>
                    </button>
                ))}
            </section>
        </>
    );
}
